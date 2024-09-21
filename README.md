# Sudoku App

Sudoku app is built using React for the frontend and a Convolutional Neural Network (CNN) in PyTorch for converting picture of a sudoku puzzle to a digital board rendered on screen. The app allows user to play a random sudoku puzzle or upload an image of a sudoku puzzle so that one can solve it on a phone/pc.

## Tech Stack

- **Backend**: PyTorch (CNN Model for image recognition and solving Sudoku). Flask for creating API's.
- **Frontend**: React (JavaScript, HTML, CSS)

## Installation

To run the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Dimri/sudoku.git
   cd sudoku
   ```
2. **Install requirements file**:
   ```bash
   python -r requirements.txt
   cd flask-server
   python server.py
   cd ../client
   npm install
   ```
3. **Run client server**:
   ```bash
   npm start
   ```
