

document.addEventListener('DOMContentLoaded',()=>{
    const squares = document.querySelectorAll('.square');
    const resetButton = document.querySelector('button');
    let currentPlayer = 'X';

    function checkWinState(){
        const board = [];
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for(let i = 0; i<9; i++){
            board[i] = document.getElementById(i.toString()).textContent;
        }
        
        for(let i = 0; i < winningCombinations.length; i++){


            if(board[winningCombinations[i][0]] === board[winningCombinations[i][1]]
                && board[winningCombinations[i][1]] === board[winningCombinations[i][2]]
                && (board[winningCombinations[i][0]] === 'X' || board[winningCombinations[i][0]] === '0')
            ){
                alert(board[winningCombinations[i][1]] + ' wins');
                resetBoard();
            }
        }
    }


    function resetBoard(){
        squares.forEach(square => {
            square.textContent = square.dataset.originalContent || '';
            delete square.dataset.originalContent;
        })
    }

    squares.forEach(square => {
        square.addEventListener('click', () =>{
            if(square.textContent === 'X' || square.textContent === '0'){
                return; //square is already filled, do nothing
            }

            if(!square.dataset.originalContent){
                square.dataset.originalContent = square.textContent;
            }

            square.textContent = currentPlayer;
            currentPlayer = currentPlayer === 'X' ? '0' : 'X';
            setTimeout(() => {
                checkWinState();
            }, 10);
        
        })

        resetButton.addEventListener('click', resetBoard);
    })
})