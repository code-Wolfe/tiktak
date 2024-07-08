const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

let games = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) =>{
    console.log('A user connected');

    socket.on('joinGame', (gameId) =>{
        //logic to join or create game
        if(!games[gameId]){
            games[gameId] = {
                board: ['','','','','','','','',''],
                players: [socket.id],
                currentTurn: socket.id
            };
            socket.join(gameId);
            socket.emit('gameJoined', {symbol: 'X'});
        } else if(games[gameId].players.length === 1){
            games[gameId].players.push(socket.id);
            socket.join(gameId);
            socket.emit('gameJoined', { symbol: '0' });
            io.to(gameId).emit('gameStart');
        } else {
            socket.emit('gameFull');
        }
    })

    socket.on('makeMove', (data) =>{
        //logic to handle a move
        const game = games[data.gameId];
        if(game && game.currentTurn === socket.id && game.board[data.position] === ''){
            game.board[data.position] = data.symbol;
            game.currentTurn = game.players.find(id => id != socket.id);

            io.to(data.gameId).emit('updateBoard', game.board);

            if(checkWinConditionI(game.board, data.symbol)){
                io.to(data.gameId).emit('gameOver', {winner: socket.id});
            } else if (!game.board.includes('')){
                io.to(data.gameId).emit('gameOver', {draw: true});
            }
            
        }
    })

    socket.on('resetGame', (gameId) =>{
        if (games[gameId]) {
            games[gameId].board = ['', '', '', '', '', '', '', '', ''];
            games[gameId].currentTurn = games[gameId].players[0];
            io.to(gameId).emit('updateBoard', games[gameId].board);
        }
    })

    socket.on('disconnect', ()=>{
        console.log('User disconected')
    })
});

http.listen(3000, ()=>{
    console.log('Server running on port 3000');
})

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