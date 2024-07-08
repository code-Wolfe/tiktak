

document.addEventListener('DOMContentLoaded',()=>{
    
    const socket = io();
    const gameId = prompt('Enter game ID: ');
    let playerSymbol;

    socket.emit('joinGame', gameId);

    socket.on('gameJoined', (data) => {
        playerSymbol = data.symbol;
        //update UI to show which players turn it is
        updateTurnIndicator(playerSymbol === 'X');
    })

    socket.on('updateBoard', (board) =>{
        //update the UI with the new board state
        squares.forEach((square,index) =>{
            square.textContent = board[index];
        })
        updateTurnIndicator(board.filter(cell => cell !== '').length % 2 === (playerSymbol === 'O' ? 1 : 0));
    })
    socket.on('gameOver', (result)=>{
        //jandle win/loss/draw
        if (result.draw) {
            alert("It's a draw!");
        } else if (result.winner === socket.id) {
            alert("You win!");
        } else {
            alert("You lose!");
        }
    });

    socket.on('gameFull', ()=>{
        alert("This game is already full. Please try another game ID.");
    })
    
    function updateTurnIndicator(isMyTurn){
        const turnIndicator = document.getElementById('turnIndicator');
        turnIndicator.textContent = isMyTurn ? "Your turn" : "Opponent's turn";
    }
    
    const squares = document.querySelectorAll('.square');
    const resetButton = document.querySelector('button');

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

        socket.emit('resetGame', gameId);
    }

    //adds event listeners to each squre    
    squares.forEach(square => {
        square.addEventListener('click', () =>{
            if(square.textContent === ''){
                socket.emit('makeMove', {
                    gameId: gameId,
                    position: square.id,
                    symbol: playerSymbol
                })
            }
        
        })

        resetButton.addEventListener('click', resetBoard);
    })
})