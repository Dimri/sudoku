import "./App.css"
import axios from 'axios';
import React, { useState, useEffect } from 'react';
// import checkValidBoard from "./sudoku"

function App() {
  const numbers = Array.from({ length: 9 }, (_, index) => index);
  const [sudokuArr, setSudokuArr] = useState(Array.from({ length: 9 }, () => 0));
  const [sudokuArrCopy, setSudokuArrCopy] = useState(Array.from({ length: 9 }, () => 0));
  const [originalArr, setOriginalArr] = useState(Array.from({ length: 9 }, () => 0));
  const [emptyPosList, setEmptyPosList] = useState([]);
  const [isCorrect, setIsCorrect] = useState([]);
  const [currEmptyPosList, setCurrEmptyPosList] = useState([]);
  const [file, setFile] = useState();
  useEffect(() => {
    fetch("/puzzle").then(
      res => res.json()
    ).then(
      data => {
        setSudokuArr(data);
        setOriginalArr(data);
        setSudokuArrCopy(data);
        initialEmptyPos(data);
      }
    )
  }, []);

  // returns a list of empty positions of the board initially
  function initialEmptyPos(puzzle) {
    var emptyPosList = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (!puzzle[i][j]) emptyPosList.push([i, j]);
      }
    }
    setEmptyPosList(emptyPosList);
  }

  // makes a copy of an arr
  function getDeepCopy(arr) {
    return JSON.parse(JSON.stringify(arr));
  }

  // handle input cell box changes
  function onInputChange(e, row, col) {
    var val = parseInt(e.target.value) || 0
    var grid = getDeepCopy(sudokuArr);
    if (val === 0 || (val >= 1 && val <= 9)) {
      grid[row][col] = val;
    }
    var id = `id${row * 9 + col}`
    document.querySelector(`#${id} .cellInput`).style.backgroundColor = "white";
    setSudokuArr(grid);
  }

  // handle solve button click
  async function solvePuzzle() {
    const payload = {
      method: "POST",
      body: JSON.stringify(originalArr),
      headers: {
        "Content-Type": "application/json"
      }
    }
    await axios.post("/solve", payload).then((response) => { setSudokuArr(response.data); setSudokuArrCopy(response.data) });
  }

  // handle check button click
  async function checkPuzzle() {
    console.log("clicked check");
    const payload = {
      method: "POST",
      body: [JSON.stringify(originalArr), JSON.stringify(sudokuArr), JSON.stringify(emptyPosList)],
      headers: {
        "Content-Type": "application/json"
      }
    }
    await axios.post("/check", payload).then((response) => {
      setCurrEmptyPosList(response.data.empty_pos);
      setIsCorrect(response.data.is_correct);
    }).then(() => {
      for (let i = 0; i < currEmptyPosList.length; i++) {
        var ei = currEmptyPosList[i][0];
        var ej = currEmptyPosList[i][1];
        var id = `id${ei * 9 + ej}`
        console.log("(", ei, ej, ")", isCorrect[i]);

        if (isCorrect[i]) {
          // correct
          document.querySelector(`#${id} .cellInput`).style.backgroundColor = "#4CAF50";
        } else {
          // incorrect
          document.querySelector(`#${id} .cellInput`).style.backgroundColor = "#FF6B6B";
        }
      }
    })
  }

  // handle reset button click
  function resetPuzzle() {
    setSudokuArr(originalArr);
    setSudokuArrCopy(originalArr);
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (!originalArr[i][j]) {
          var id = `id${i * 9 + j}`
          document.querySelector(`#${id} .cellInput`).style.backgroundColor = "white";
        }
      }
    }
  }

  function uploadPuzzle() {
    function handleChange(event) {
      setFile(event.target.files[0]);
    }
    return (
      <div className="App">
        <form>
          <h1>React File Upload</h1>
          <input type="file" onChange={handleChange} />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
  return (
    <div className="App">
      <div className="App-header">
        <h2>Sudoku!</h2>
        <table>
          <tbody>
            {
              numbers.map(row => {
                return <tr key={row} className={(row + 1) % 3 === 0 ? "bBorder" : ""}>
                  {
                    numbers.map(col => {
                      return <td id={`id${row * 9 + col}`} key={row + col} className={(col + 1) % 3 === 0 ? "rBorder" : ""}>
                        <input onChange={(e) => onInputChange(e, row, col)} value={sudokuArr[row][col] === 0 ? '' : sudokuArr[row][col]} className="cellInput"
                          disabled={sudokuArrCopy[row][col] !== 0} maxLength="1"></input>
                      </td>

                    })
                  }
                </tr>
              })
            }
          </tbody>
        </table>
        <div className="buttonContainer">
          <button className="btn solveButton" onClick={solvePuzzle}>Solve</button>
          <button className="btn checkButton" onClick={checkPuzzle}>Check</button>
          <button className="btn resetButton" onClick={resetPuzzle}>Reset</button>
          <button className="btn uploadButton" onClick={uploadPuzzle}>Upload</button>
        </div>
      </div>
    </div >
  )
}

export default App;
