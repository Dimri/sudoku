import re
import json
from server import app
from flask import request
from sudoku import Sudoku
import puzzle


def valid_board(board):
    if type(board) is not list:
        return False
    pattern = r"^[0-9]$"
    for rows in board:
        for elem in rows:
            if not re.match(pattern, elem):
                return False

    return True


def convert_to_str(board):
    return [[str(x) for x in row] for row in board]


@app.route("/puzzle")
def load_puzzle():
    return puzzle.read_puzzle()["2"]


@app.route("/solve", methods=["GET", "POST"])
def solve_puzzle():
    board_string = ""
    if request.method == "POST":
        board = json.loads(request.json["body"])
        # check for board
        if not valid_board(convert_to_str(board)):
            return "", 400

        puzzle = Sudoku(board)
        puzzle.print_board()
        board_string = json.dumps(puzzle.board)
        return board_string, 200


@app.route("/check", methods=["POST"])
def check_puzzle():
    if request.method == "POST":
        orig_board = convert_to_str(json.loads(request.json["body"][0]))
        changed_board = convert_to_str(json.loads(request.json["body"][1]))
        empty_positions = json.loads(request.json["body"][2])
        p = Sudoku(changed_board)
        p.print_board()
        # check for board
        if not valid_board(orig_board):
            return "", 400

        puzzle = Sudoku(orig_board)
        puzzle.solve()
        puzzle.print_board()
        is_correct = puzzle.check_board(changed_board, empty_positions)
        empty_positions_filtered = [
            [i, j] for i, j in empty_positions if changed_board[i][j] != "0"
        ]
        out_response = json.dumps(
            {"empty_pos": empty_positions_filtered, "is_correct": is_correct}
        )
        return out_response, 200
