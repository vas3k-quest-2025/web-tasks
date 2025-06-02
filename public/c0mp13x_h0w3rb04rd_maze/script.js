document.addEventListener('DOMContentLoaded', () => {
    const maze = document.getElementById('maze');
    const output = document.getElementById('output');
    const startButton = document.getElementById('start');
    const resetButton = document.getElementById('reset');
    
    const MAZE_SIZE = 10;
    let currentPosition = { x: 0, y: 0 };
    let path = [];
    let isMoving = false;

    // Создаем лабиринт
    function createMaze() {
        maze.innerHTML = '';
        for (let y = 0; y < MAZE_SIZE; y++) {
            for (let x = 0; x < MAZE_SIZE; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Создаем случайные стены
                if (Math.random() < 0.3 && !(x === 0 && y === 0) && !(x === MAZE_SIZE - 1 && y === MAZE_SIZE - 1)) {
                    cell.classList.add('wall');
                }
                
                maze.appendChild(cell);
            }
        }
        
        // Устанавливаем начальную и конечную точки
        const startCell = maze.querySelector('[data-x="0"][data-y="0"]');
        const endCell = maze.querySelector(`[data-x="${MAZE_SIZE-1}"][data-y="${MAZE_SIZE-1}"]`);
        startCell.classList.add('start');
        endCell.classList.add('end');
    }

    // Обработка движения
    document.addEventListener('keydown', (event) => {
        if (!isMoving) return;
        
        const oldPosition = { ...currentPosition };
        
        switch (event.key) {
            case 'ArrowUp':
                if (currentPosition.y > 0) currentPosition.y--;
                break;
            case 'ArrowDown':
                if (currentPosition.y < MAZE_SIZE - 1) currentPosition.y++;
                break;
            case 'ArrowLeft':
                if (currentPosition.x > 0) currentPosition.x--;
                break;
            case 'ArrowRight':
                if (currentPosition.x < MAZE_SIZE - 1) currentPosition.x++;
                break;
            default:
                return;
        }

        const newCell = maze.querySelector(`[data-x="${currentPosition.x}"][data-y="${currentPosition.y}"]`);
        if (newCell.classList.contains('wall')) {
            currentPosition = oldPosition;
            return;
        }

        path.push({ x: currentPosition.x, y: currentPosition.y });
        updateMaze();
        checkSolution();
    });

    function updateMaze() {
        // Очищаем предыдущий путь
        document.querySelectorAll('.cell.path').forEach(cell => {
            cell.classList.remove('path');
        });

        // Отмечаем новый путь
        path.forEach(({ x, y }) => {
            const cell = maze.querySelector(`[data-x="${x}"][data-y="${y}"]`);
            if (!cell.classList.contains('start') && !cell.classList.contains('end')) {
                cell.classList.add('path');
            }
        });
    }

    async function checkSolution() {
        try {
            const response = await fetch('/check/c0mp13x_h0w3rb04rd_maze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: path
                })
            });

            const result = await response.json();
            output.textContent = JSON.stringify(result, null, 2);
        } catch (error) {
            output.textContent = 'Error: ' + error.message;
        }
    }

    startButton.addEventListener('click', () => {
        isMoving = true;
        currentPosition = { x: 0, y: 0 };
        path = [{ x: 0, y: 0 }];
        updateMaze();
    });

    resetButton.addEventListener('click', () => {
        isMoving = false;
        currentPosition = { x: 0, y: 0 };
        path = [];
        createMaze();
    });

    // Инициализация
    createMaze();
}); 