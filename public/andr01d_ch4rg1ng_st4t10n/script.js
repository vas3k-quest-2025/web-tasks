class AndroidChargingGame {
    constructor() {
        this.size = 8;
        this.grid = document.getElementById('grid');
        this.message = document.getElementById('message');
        this.resetBtn = document.getElementById('resetBtn');
        this.numbersTop = document.querySelector('.numbers-top');
        this.numbersLeft = document.querySelector('.numbers-left');
        
        this.topNumbers = [2, 2, 1, 2, 1, 2, 2, 2];
        this.leftNumbers = [2, 2, 1, 1, 3, 1, 2, 2];
        
        this.socketCells = [
            {x: 0, y: 4},
            {x: 0, y: 5},
            {x: 1, y: 1},
            {x: 1, y: 6},
            {x: 2, y: 0},
            {x: 3, y: 0},
            {x: 3, y: 3},
            {x: 4, y: 4},
            {x: 4, y: 7},
            {x: 5, y: 7},
            {x: 6, y: 1},
            {x: 6, y: 6},
            {x: 7, y: 2},
            {x: 7, y: 3},
        ];
        
        this.androidCells = new Set();
        
        this.init();
    }
    
    init() {
        this.createNumbers();
        this.createGrid();
        this.resetBtn.addEventListener('click', () => this.reset());
    }
    
    createNumbers() {
        // Создаем числа сверху
        this.numbersTop.innerHTML = '';
        this.topNumbers.forEach(num => {
            const div = document.createElement('div');
            div.textContent = num;
            this.numbersTop.appendChild(div);
        });
        
        // Создаем числа слева
        this.numbersLeft.innerHTML = '';
        this.leftNumbers.forEach(num => {
            const div = document.createElement('div');
            div.textContent = num;
            this.numbersLeft.appendChild(div);
        });
    }
    
    createGrid() {
        this.grid.innerHTML = '';
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                if (this.isSocket(x, y)) {
                    cell.classList.add('socket');
                    const img = document.createElement('img');
                    img.src = 'socket.png';
                    img.alt = 'Розетка';
                    cell.appendChild(img);
                } else {
                    cell.addEventListener('click', () => this.handleCellClick(x, y));
                }
                
                this.grid.appendChild(cell);
            }
        }
    }
    
    isSocket(x, y) {
        return this.socketCells.some(cell => cell.x === x && cell.y === y);
    }
    
    isValidAndroidPlacement(x, y) {
        // Проверяем, что клетка не занята розеткой
        if (this.isSocket(x, y)) {
            return false;
        }
        
        // Проверяем, что клетка не занята другим андроидом
        if (this.androidCells.has(`${x},${y}`)) {
            return false;
        }
        
        // Проверяем, что рядом есть розетка
        const hasAdjacentSocket = this.socketCells.some(socket => {
            const dx = Math.abs(socket.x - x);
            const dy = Math.abs(socket.y - y);
            return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
        });
        
        if (!hasAdjacentSocket) {
            return false;
        }
        
        // Проверяем, что нет соседних андроидов (включая по диагонали)
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                    if (this.androidCells.has(`${nx},${ny}`)) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    handleCellClick(x, y) {
        if (this.androidCells.has(`${x},${y}`)) {
            // Убираем андроида
            this.androidCells.delete(`${x},${y}`);
            const cell = this.getCell(x, y);
            cell.classList.remove('android');
            cell.innerHTML = '';
            // Скрываем сообщение об ошибке при любом клике
            this.message.textContent = '';
            this.message.className = 'message';
        } else if (this.isValidAndroidPlacement(x, y)) {
            // Ставим андроида
            this.androidCells.add(`${x},${y}`);
            const cell = this.getCell(x, y);
            cell.classList.add('android');
            const img = document.createElement('img');
            img.src = 'android.svg';
            img.alt = 'Андроид';
            cell.appendChild(img);
            
            // Скрываем сообщение об ошибке при любом клике
            this.message.textContent = '';
            this.message.className = 'message';
            
            // Проверяем решение, если достигли нужного количества андроидов
            if (this.androidCells.size === this.socketCells.length) {
                this.checkSolution();
            }
        } else {
            this.showMessage('Нельзя поставить андроида в эту клетку', 'error');
            return;
        }
    }
    
    getCell(x, y) {
        return this.grid.children[y * this.size + x];
    }
    
    checkSolution() {
        // Проверяем количество андроидов в каждом ряду
        for (let y = 0; y < this.size; y++) {
            let count = 0;
            for (let x = 0; x < this.size; x++) {
                if (this.androidCells.has(`${x},${y}`)) {
                    count++;
                }
            }
            if (count !== this.leftNumbers[y]) {
                return;
            }
        }
        
        // Проверяем количество андроидов в каждом столбце
        for (let x = 0; x < this.size; x++) {
            let count = 0;
            for (let y = 0; y < this.size; y++) {
                if (this.androidCells.has(`${x},${y}`)) {
                    count++;
                }
            }
            if (count !== this.topNumbers[x]) {
                return;
            }
        }
        
        // Если все проверки пройдены, отправляем решение на сервер
        this.sendSolution();
    }
    
    sendSolution() {
        const solution = Array.from(this.androidCells).map(coord => {
            const [x, y] = coord.split(',').map(Number);
            return {x, y};
        });
        
        fetch('/check/andr01d_ch4rg1ng_st4t10n', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                solution: solution
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
    }
    
    reset() {
        this.androidCells.clear();
        this.createGrid();
        this.showMessage('Игра сброшена!', 'success');
    }
    
    showMessage(text, type) {
        this.message.textContent = text;
        this.message.className = 'message ' + type;
        
        // Если это сообщение об ошибке, скрываем его через 3 секунды
        if (type === 'error') {
            setTimeout(() => {
                if (this.message.textContent === text) {
                    this.message.textContent = '';
                    this.message.className = 'message';
                }
            }, 3000);
        }
    }
}

// Инициализация игры при загрузке страницы
window.addEventListener('load', () => {
    new AndroidChargingGame();
}); 