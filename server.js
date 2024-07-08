
//import required modules
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);


//serve static files from the 'public' directory 
app.use(express.static(__dirname + '/public'));

//object to store active games
let games = {};

//route to serve main HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Socket.IO connection handler
io.on('connection', (socket) =>{
    console.log('A user connected');

    //event handler for joining a game
    socket.on('joinGame', (gameId) =>{
        //logic to join or create game

        //if the game doesnt exist, create a new one 
        if(!games[gameId]){
            games[gameId] = {
                board: ['','','','','','','','',''], //init empty board
                players: [socket.id], //add first player
                currentTurn: socket.id //set first players turn
            };
            socket.join(gameId); //join the socket room for this game
            socket.emit('gameJoined', {symbol: 'X'}); //inform client they're 'X'
        } 
        //if game exists and has one player, join as second player
        else if(games[gameId].players.length === 1){
            games[gameId].players.push(socket.id);
            socket.join(gameId);
            socket.emit('gameJoined', { symbol: '0' }); //inform client they're '0'
            io.to(gameId).emit('gameStart');
        } else {
            socket.emit('gameFull');
        }
    })

    // Event handler for making a move
    socket.on('makeMove', (data) =>{
        //logic to handle a move
        const game = games[data.gameId];

        //check if its the players turn, and that the move is valid
        if(game && game.currentTurn === socket.id && game.board[data.position] === ''){
            game.board[data.position] = data.symbol; //update the board
            //switch turns
            game.currentTurn = game.players.find(id => id != socket.id);

            // Inform both clients of updated board
            io.to(data.gameId).emit('updateBoard', game.board);

            //check for win or draw
            if(checkWinConditionI(game.board, data.symbol)){
                io.to(data.gameId).emit('gameOver', {winner: socket.id});
            } else if (!game.board.includes('')){
                io.to(data.gameId).emit('gameOver', {draw: true});
            }
            
        }
    })


    //event handler for resetting game
    socket.on('resetGame', (gameId) =>{
        if (games[gameId]) {
            games[gameId].board = ['', '', '', '', '', '', '', '', ''];
            games[gameId].currentTurn = games[gameId].players[0];
            io.to(gameId).emit('updateBoard', games[gameId].board);
        }
    })

    //event handler for user disconnect
    socket.on('disconnect', ()=>{
        console.log('User disconected')
    })
});

//start the server
http.listen(3000, ()=>{
    console.log('Server running on port 3000');
})

// Function to check if the current move results in a win
function checkWinConditionI(board, symbol){
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    return winningCombos.some(combo => 
        combo.every(index => board[index] === symbol)
    );
}