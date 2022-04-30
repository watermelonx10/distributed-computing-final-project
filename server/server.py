import json
from flask import Flask
from flask import request
from flask_cors import cross_origin

import pyopencl as cl

import pyopencl as cl
import numpy


def multiplyMatries(A, B):
    matrixA = numpy.array(A)
    matrixB = numpy.array(B)

    if matrixA.shape[1] != matrixB.shape[0]:
        return
    # Write down our kernel as a multiline string.
    kernel = """
    __kernel void mmul(
        const int N,
        __global float* A,
        __global float* B,
        __global float* C)
    {
        // We are going to spawn as many work items as there are items in the matrix (order * order).
        // Each workitem is responsible to write a single value in the result matrix.
        // This approach ensures that no workitem is writing in the same result as any other work item.
        // it also means that each workitem needs to multiply an entire row and column from the input matrices.
        int k;
        int i = get_global_id(0);
        int j = get_global_id(1);
        float tmp = 0;
        if ((i < N) && (j < N))
        {
            tmp = 0.0f;
            for (k=0; k<N; k++)
            {
                tmp += A[i*N + k] * B[k*N + j];
            }
            C[i*N + j] = tmp;
        }
    }
    """

    # The size of the matrices to be added together.
    matrix_order = matrixA.shape[0]
    matrix_size = matrix_order * matrix_order

    # Step 1: Create a context.
    # This will ask the user to select the device to be used.
    context = cl.create_some_context()

    # Create a queue to the device.
    queue = cl.CommandQueue(context)

    # Create the program.
    program = cl.Program(context, kernel).build()

    # Create two matrices and fill with a default value.
    # A matrix is represented as a flat array with is order * order in length.
    # We fill the array with the default value (1), which should mean the result is an array with all 3's.
    h_a = numpy.array(matrixA.flatten()).astype(numpy.float32)

    h_b = numpy.array(matrixB.flatten()).astype(numpy.float32)

    # Create the result matrix.
    # We fill them with 0s to make sure there are no memory remnants left.
    h_c = numpy.empty(matrix_size).astype(numpy.float32)
    h_c.fill(0.0)

    h_seq = numpy.empty(matrix_size).astype(numpy.float32)
    h_seq.fill(0.0)

    # Send the data to the guest memory.
    # Again, what counts is here the memory flags you put in place. Read only because they are input data.
    d_a = cl.Buffer(context, cl.mem_flags.READ_ONLY |
                    cl.mem_flags.COPY_HOST_PTR, hostbuf=h_a)
    d_b = cl.Buffer(context, cl.mem_flags.READ_ONLY |
                    cl.mem_flags.COPY_HOST_PTR, hostbuf=h_b)

    # Create the memory on the device to put the result into.
    # Write only memory!
    d_c = cl.Buffer(context, cl.mem_flags.WRITE_ONLY, h_c.nbytes)

    # Initiate the kernel.
    mmul = program.mmul
    mmul.set_scalar_arg_dtypes([numpy.int32, None, None, None])

    # Execute C = A * B.
    mmul(queue, (matrix_order, matrix_order),
         None, matrix_order, d_a, d_b, d_c)

    # Wait for the queue to be completely processed.
    queue.finish()

    # Read the array from the device.
    cl.enqueue_copy(queue, h_c, d_c)
    result = numpy.reshape(h_c.astype(numpy.int32),
                           (matrix_order, matrix_order))
    return result


app = Flask(__name__)


@app.route("/", methods=["POST"])
@cross_origin()
def hello_world():
    data = request.get_json()
    matrixA = data["matrixA"]
    matrixB = data["matrixB"]

    return json.dumps(multiplyMatries(matrixA, matrixB).tolist())


if __name__ == "__main__":
    app.run(debug=True)
