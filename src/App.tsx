import {FC, useEffect, useState} from "react";

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

const matrixA = generateMatrix(10, 10);
const matrixB = generateMatrix(10, 10);


const App: FC = () => {


  const [resultMatrix, setResultMatrix] = useState<number[][]>([]); 
  const [time, setTime] = useState();

  const handleCalcualte = async () => {
    const response = await fetch("http://127.0.0.1:5000/", {
      method: "POST",
      
      body: JSON.stringify({
          matrixA: matrixA,
          matrixB: matrixB,
      }),
    
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      }
    });
    const {time, result} = await response.json();
    setTime(time);
    setResultMatrix(result);
  }

  return (
    <div className="w-full h-full px-48 pb-10">
      <div className="flex w-full  justify-center gap-2 mt-10 mb-10">
        <div className="flex-1">
          <h1 className="text-center font-bold text-lg mb-4">10 x 10 Matrix A</h1>
          <div className="flex flex-col h-auto gap-2">
            {matrixA.map(row => 
              <div className="flex items-center justify-center gap-2"> {row.map(number => 
                <span className="text-center flex w-8 h-8 bg-red-200 border border-gray-400 rounded-full text-xs">
                  <span className="m-auto font-bold">{number}</span>
                </span>)} 
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mt-10 font-extrabold">
            <button onClick={handleCalcualte} className="p-2 rounded m-auto text-xs hover:border-2 font-medium bg-blue-500 hover:bg-blue-600 border border-blue-400 text-white ">Multiply</button>
        </div>
        <div className="flex-1">
          <h1 className="text-center font-bold text-lg mb-4">10 x 10 Matrix B</h1>
          <div className="flex flex-col h-auto gap-2">
            {matrixB.map(row => 
              <div className="flex items-center justify-center gap-2"> {row.map(number => 
                <span className="text-center flex w-8 h-8 bg-indigo-200 border border-gray-400 rounded-full text-xs">
                  <span className="m-auto font-bold">{number}</span>
                </span>)} 
              </div>
            )}
          </div>
        </div>
      </div>
      <h1 className="text-center font-bold text-lg ">Result Matrix</h1>
      <p className="text-center mb-2">{time && `Multi-core ${time}ms`}</p>
      <div className="flex items-start justify-center gap-4">
        <div>
          <div className="flex flex-col h-auto gap-2">
            {resultMatrix.map(row => 
              <div className="flex items-center justify-center gap-2"> {row.map(number => 
                <span className="text-center flex w-8 h-8 bg-green-200 border border-gray-400 rounded-full text-xs">
                  <span className="m-auto font-bold">{number}</span>
                </span>)} 
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
