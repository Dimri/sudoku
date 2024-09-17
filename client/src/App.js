import "./App.css";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";

// Set the app element for accessibility
Modal.setAppElement("#root");

function App() {
  const numbers = Array.from({ length: 9 }, (_, index) => index);
  const [sudokuArr, setSudokuArr] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [sudokuArrCopy, setSudokuArrCopy] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [originalArr, setOriginalArr] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [emptyPosList, setEmptyPosList] = useState([]);
  const [isCorrect, setIsCorrect] = useState([]);
  const [currEmptyPosList, setCurrEmptyPosList] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [sendFormData, setSendFormData] = useState(null);
  const cellRefs = useRef({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchBoard = async () => {
      const response = await axios.get("/puzzle");
      setSudokuArr(response.data);
      setOriginalArr(response.data);
      setSudokuArrCopy(response.data);
      initialEmptyPos(response.data);
    }
    fetchBoard();
    handleModalResponse();
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
    var val = parseInt(e.target.value) || 0;
    var grid = getDeepCopy(sudokuArr);
    if (val === 0 || (val >= 1 && val <= 9)) {
      grid[row][col] = val;
    }
    const id = `id${row * 9 + col}`;
    const cell = cellRefs.current[id];
    if (cell) {
      cell.style.backgroundColor = "white";
    }
    setSudokuArr(grid);
  }

  // handle solve button click
  async function solvePuzzle() {
    const payload = {
      method: "POST",
      body: JSON.stringify(originalArr),
      headers: {
        "Content-Type": "application/json",
      },
    };
    await axios.post("/solve", payload).then((response) => {
      setSudokuArr(response.data);
      setSudokuArrCopy(response.data);
    });
  }

  useEffect(() => {
    if (currEmptyPosList.length > 0 && isCorrect.length > 0) {
      const updateCellColors = () => {
        currEmptyPosList.forEach((pos, index) => {
          const [ei, ej] = pos;
          const id = `id${ei * 9 + ej}`;
          const cell = cellRefs.current[id];

          if (cell) {
            cell.style.color = isCorrect[index] ? "#4CAF50" : "#FF6B6B";
          }
        });
      };
      updateCellColors();
    }
  }, [currEmptyPosList, isCorrect]);


  // handle check button click
  const checkPuzzle = async () => {
    initialEmptyPos(sudokuArr);
    try {
      const payload = {
        method: "POST",
        body: {
          originalArr: JSON.stringify(originalArr),
          sudokuArr: JSON.stringify(sudokuArr),
          emptyPosList: JSON.stringify(emptyPosList),
        },
        headers: {
          "Content-Type": "application/json",
        },
      };
      console.log("inside check", payload.body);
      const response = await axios.post("/check", payload);
      setCurrEmptyPosList(response.data.empty_pos);
      setIsCorrect(response.data.is_correct);
    } catch (error) {
      console.error("error checking puzzle", error);
    }
  };

  // handle reset button click
  function resetPuzzle() {
    setSudokuArr(originalArr);
    console.log("inside reset", originalArr);
    setSudokuArrCopy(originalArr);
    initialEmptyPos(sudokuArr);
    setIsCorrect([]);
    setCurrEmptyPosList([]);
    numbers.forEach((i) => {
      numbers.forEach((j) => {
        const id = `id${i * 9 + j}`;
        const cell = cellRefs.current[id];
        if (cell) {
          if (!originalArr[i][j]) {
            cell.style.backgroundColor = "white";
            cell.style.color = "black";
          }
        }
      });
    });
  }

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Open file dialog
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setSendFormData(formData);
      setUploadedFile(URL.createObjectURL(file));
      setModalIsOpen(true);
      event.target.value = "";
    } else {
      alert("No file selected.");
    }
  };


  const handleModalResponse = async (response) => {
    if (response === "yes") {
      await axios.post("/upload", sendFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then((response) => {
        setSudokuArr(response.data);
        setSudokuArrCopy(response.data);
        setOriginalArr(response.data);
      });
    }
    setModalIsOpen(false);
    setUploadedFile(null);
  };

  return (
    <div className="App">
      <div className="App-header">
        <h2>Sudoku!</h2>
        <table>
          <tbody>
            {numbers.map((row) => {
              return (
                <tr key={row} className={(row + 1) % 3 === 0 ? "bBorder" : ""}>
                  {numbers.map((col) => {
                    return (
                      <td
                        id={`id${row * 9 + col}`}
                        key={row + col}
                        className={(col + 1) % 3 === 0 ? "rBorder" : ""}
                      >
                        <input
                          ref={(el) =>
                            (cellRefs.current[`id${row * 9 + col}`] = el)
                          }
                          onChange={(e) => onInputChange(e, row, col)}
                          value={
                            sudokuArr[row][col] === 0 ? "" : sudokuArr[row][col]
                          }
                          className="cellInput"
                          disabled={sudokuArrCopy[row][col] !== 0}
                          maxLength="1"
                        ></input>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }} // Hide the file input
            accept=".jpg,.jpeg,.png"
          />
        </div>
        <div className="buttonContainer">
          <button className="btn" onClick={solvePuzzle}>
            Solve
          </button>
          <button className="btn" onClick={checkPuzzle}>
            Check
          </button>
          <button className="btn" onClick={resetPuzzle}>
            Reset
          </button>
          <button className="btn" onClick={handleFileUpload}>
            Upload
          </button>
        </div>

        <Modal
          className="modal"
          isOpen={modalIsOpen}
          OnRequestClose={() => setModalIsOpen(false)}
          contentLabel="Image Preview"
        >
          {uploadedFile && (
            <div>
              {/* className="modal-container"> */}
              <img src={uploadedFile} alt="uploaded" className="modal-image" />
              <p>Do you want to proceed?</p>
              <button
                className="btnModel"
                onClick={() => handleModalResponse("yes")}
              >
                Yes
              </button>
              <button
                className="btnModel"
                onClick={() => handleModalResponse("no")}
              >
                No
              </button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default App;
