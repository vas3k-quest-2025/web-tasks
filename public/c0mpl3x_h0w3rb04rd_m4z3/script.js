class MazeGame {
    constructor() {
        this.size = 7;
        this.maze = document.getElementById('maze');
        this.message = document.getElementById('message');
        this.resetBtn = document.getElementById('resetBtn');
        
        this.occupiedCells = [
            {x: 4, y: 0},
            {x: 2, y: 1},
            {x: 4, y: 2},
            {x: 2, y: 4},
            {x: 3, y: 6}
        ];
        
        this.currentPosition = {x: 0, y: 0};
        this.visitedCells = new Set();
        this.visitedCells.add('0,0');
        
        this.init();
    }
    
    init() {
        this.createMaze();
        this.resetBtn.addEventListener('click', () => this.reset());
    }
    
    createMaze() {
        this.maze.innerHTML = '';
        for (let y = this.size - 1; y >= 0; y--) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                if (x === 0 && y === 0) {
                    cell.classList.add('start');
                    const img = document.createElement('img');
                    img.src = 'edit.png';
                    img.alt = 'Старт';
                    cell.appendChild(img);
                }
                
                if (this.isOccupied(x, y)) {
                    cell.classList.add('occupied');
                    const img = document.createElement('img');
                    img.src = 'milicija.png';
                    img.alt = 'Занято';
                    cell.appendChild(img);
                }
                
                cell.addEventListener('click', () => this.handleCellClick(x, y));
                this.maze.appendChild(cell);
            }
        }
    }
    
    isOccupied(x, y) {
        return this.occupiedCells.some(cell => cell.x === x && cell.y === y);
    }
    
    isValidMove(x, y) {
        // Проверяем, что клетка в пределах сетки
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            return false;
        }
        
        // Проверяем, что клетка не занята
        if (this.isOccupied(x, y)) {
            return false;
        }
        
        // Проверяем, что клетка не посещена (кроме старта)
        if (this.visitedCells.has(`${x},${y}`) && !(x === 0 && y === 0)) {
            return false;
        }
        
        // Проверяем, что клетка соседняя
        const dx = Math.abs(x - this.currentPosition.x);
        const dy = Math.abs(y - this.currentPosition.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }
    
    handleCellClick(x, y) {
        if (!this.isValidMove(x, y)) {
            this.showMessage('Неверный ход!', 'error');
            return;
        }
        
        this.moveTo(x, y);
        
        // Проверяем, вернулись ли мы на старт
        if (x === 0 && y === 0 && this.visitedCells.size > 1) {
            this.checkWin();
        }
    }
    
    moveTo(x, y) {
        // Убираем текущую позицию
        const currentCell = this.getCell(this.currentPosition.x, this.currentPosition.y);
        currentCell.classList.remove('current');
        
        // Обновляем позицию
        this.currentPosition = {x, y};
        this.visitedCells.add(`${x},${y}`);
        
        // Обновляем визуальное состояние
        const newCell = this.getCell(x, y);
        newCell.classList.add('current');
        newCell.classList.add('visited');
        
        this.showMessage('Ход сделан!', 'success');
    }
    
    getCell(x, y) {
        const row = this.size - 1 - y;
        return this.maze.children[row * this.size + x];
    }
    
    checkWin() {
        const totalCells = this.size * this.size - this.occupiedCells.length;
        if (this.visitedCells.size === totalCells) {
            // Преобразуем Set в массив координат
            const path = Array.from(this.visitedCells).map(coord => {
                const [x, y] = coord.split(',').map(Number);
                return {x, y};
            });
            
            // Добавляем возврат на старт
            path.push({x: 0, y: 0});
            
            // Отправляем запрос на сервер
            fetch('/check/c0mpl3x_h0w3rb04rd_m4z3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    path: path
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showMessage(`Решение верное! Код: ${data.code}`, 'success');
                } else {
                    this.showMessage(data.message || 'Решение неверное!', 'error');
                }
            })
            .catch(error => {
                this.showMessage('Ошибка при проверке решения', 'error');
                console.error('Error:', error);
            });
        } else {
            this.showMessage('Вы вернулись на старт, но не посетили все клетки!', 'error');
        }
    }
    
    reset() {
        this.currentPosition = {x: 0, y: 0};
        this.visitedCells = new Set(['0,0']);
        this.createMaze();
        this.showMessage('Игра сброшена!', 'success');
    }
    
    showMessage(text, type) {
        this.message.textContent = text;
        this.message.className = 'message ' + type;
    }
}

// Инициализация игры при загрузке страницы
window.addEventListener('load', () => {
    new MazeGame();
}); 