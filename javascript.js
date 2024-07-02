



document.addEventListener('DOMContentLoaded',()=>{
    const squares = document.querySelectorAll('.square');
    const resetButton = document.querySelector('button');
    let currentPlayer = 'X';

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
        
        })

        resetButton.addEventListener('click', resetBoard);
    })
})