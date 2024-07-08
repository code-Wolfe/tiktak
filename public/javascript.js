

document.addEventListener('DOMContentLoaded',()=>{
    // init Socket.IO connection
    const socket = io();

    // Prompt the user to enter a Game ID
    const gameId = prompt('Enter game ID: ');
    
    //variable to store the players Symbol
    let playerSymbol;

    // emit a joinGame event to the server with the entered game ID
    socket.emit('joinGame', gameId);

    // Event listener for when the player successfully joins a game
    socket.on('gameJoined', (data) => {
        playerSymbol = data.symbol;
        //update UI to show which players turn it is
        updateTurnIndicator(playerSymbol === 'X');
    })

    // Event listener for board updates from the server
    socket.on('updateBoard', (board) =>{
        //update the UI with the new board state
        squares.forEach((square,index) =>{
            square.textContent = board[index];
        })

        //updates turn indicator based on number of filled cells
        updateTurnIndicator(board.filter(cell => cell !== '').length % 2 === (playerSymbol === 'O' ? 1 : 0));
    })

    // Event listner for gameOver scenarios
    socket.on('gameOver', (result)=>{
        //handle win/loss/draw
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