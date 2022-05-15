import {ChangeEvent, FC, useState} from "react";

const generateMatrix = (m: number, n: number): number[][] => {
  const matrix = [];
  for(let i = 0; i < m; i++) {
    matrix.push(new Array(n));
    for(let j = 0; j < n; j++) {
      matrix[i][j] = Math.round(Math.random() * 10);
    }
  }
  return matrix;
}


const App: FC = () => {

  const [resultMatrix, setResultMatrix] = useState<number[][] | null>(null); 
  const [matrixSize, setMatrixSize] = useState(24);
  const [matrixA, setMatrixA] = useState(generateMatrix(matrixSize, matrixSize));
  const [matrixB, setMatrixB] = useState(generateMatrix(matrixSize, matrixSize));
  
  const [multiTime, setMultiTime] = useState<number | null>();
  const [serialTime, setSerialTime] = useState<number | null>();
  const [loading, setLoading] = useState(false);

  const handleCalcualte = async () => {
    setLoading(true);
    const response = await fetch("http://127.0.0.1:5000", {
      method: "POST",
      body: JSON.stringify({
          matrixA: matrixA,
          matrixB: matrixB,
      }),
    
      headers: {
          "Content-type": "application/json; charset=UTF-8",
      }
    });
    setLoading(false);
    const {multiTime, serialTime, result} = await response.json();
    setMultiTime(multiTime);
    setSerialTime(serialTime);
    if(matrixSize < 25) {
      setResultMatrix(result);
    }
  }

  const refreshMatrixes = (matrixSize: number) => {
    setMatrixA(generateMatrix(matrixSize, matrixSize));
    setMatrixB(generateMatrix(matrixSize, matrixSize));
    setMultiTime(null);
    setMultiTime(null);
    setResultMatrix(null);
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.currentTarget.value);
    setMatrixSize(value ? value : 0);
    refreshMatrixes(value ? value : 0);
  }

  return (
    <div className="w-full h-full px-48 pb-10">
      <div className="flex w-full  justify-center gap-2 mt-10 mb-10">
        <div className="flex-1">
          <h1 className="text-center font-bold text-lg mb-4">{matrixSize} x {matrixSize} Matrix A</h1>
          <div className="flex flex-col h-auto gap-2">
            {matrixSize < 25 ? matrixA.map(row => 
              <div className="flex items-center justify-center gap-2">
                {row.map(number => 
                  <span className="text-center flex w-4 h-4 bg-red-200 border border-gray-400 rounded-full text-[8px]">
                    <span className="m-auto font-bold">{number}</span>
                  </span>
                )} 
              </div>
            ) : <p className="text-center">Input is hidden to prevent render issues</p>}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mt-10 font-extrabold">
          <div className="flex flex-col gap-2">
            <button onClick={handleCalcualte} className="p-2 rounded m-auto text-xs hover:border-2 font-medium bg-blue-500 hover:bg-blue-600 border border-blue-400 text-white ">Multiply</button>
            <button onClick={() => refreshMatrixes(matrixSize)} className="p-2 rounded m-auto text-xs hover:border-2 font-medium bg-white hover:bg-blue-50 border border-blue-400 text-blue-500 ">Refresh</button>
            <input className="
                  w-16
                  mt-1
                  block
                  rounded-md
                  border
                  px-2
                  border-gray-300
                  shadow-sm
                  focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                " value={matrixSize} onChange={handleChange} />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-center font-bold text-lg mb-4">{matrixSize} x {matrixSize} Matrix B</h1>
          <div className="flex flex-col h-auto gap-2">
            {matrixSize < 25 ? matrixB.map(row => 
              <div className="flex items-center justify-center gap-2"> 
              {row.map(number => 
                <span className="text-center flex w-4 h-4 bg-indigo-200 border border-gray-400 rounded-full text-[8px]">
                  <span className="m-auto font-bold">{number}</span>
                </span>
              )} 
              </div>
            ) : <p className="text-center">Input is hidden to prevent render issues</p>
          }
          </div>
        </div>
      </div>

      <>
        <h1 className="text-center font-bold text-lg ">Result Matrix</h1>
        {
          loading ? <p className="text-center">Loading...</p> : 
            <>
              <p className="text-center mb-2">{multiTime && `Multi-core ${multiTime}ms`}</p>
              <p className="text-center mb-2">{serialTime && `Serial ${serialTime}ms`}</p>
            </>
        }
        <div className="flex items-start justify-center gap-4">
          <div className="flex flex-col h-auto gap-2">
            {matrixSize < 25 ? resultMatrix && resultMatrix.map(row => 
              <div className="flex items-center justify-center gap-2"> 
              {row.map(number => 
                <span className="text-center flex w-4 h-4 bg-green-200 border border-gray-400 rounded-full text-[8px]">
                  <span className="m-auto font-bold">{number}</span>
                </span>
              )} 
              </div>
            ) : <p className="text-center">Input is hidden to prevent render issues</p>
          }
          </div>
        </div>
      </>
      
    </div>
  );
}

export default App;
