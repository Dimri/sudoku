function checkValidBoard(puzzle, target, pos) {
    // check for row
    for (let i = 0; i < 9; i++) {
        if ((pos[1] !== i) && (puzzle[pos[0]][i] === target)) {
            return false
        }
    }
    // check for col
    for (let i = 0; i < 9; i++) {
        if ((puzzle[i][pos[1]] === target) && (pos[0] !== i)) {
            return false
        }
    }
    // check for block
    const block_x = parseInt(pos[0] / 3)
    const block_y = parseInt(pos[1] / 3)

    for (let i = block_x * 3; i < (block_x + 1) * 3; i++) {
        for (let j = block_y * 3; j < (block_y + 1) * 3; j++) {
            if ((puzzle[i][j] === target) && (i !== pos[0] && j !== pos[1])) {
                return false
            }
        }
    }
    return true
}

export default checkValidBoard