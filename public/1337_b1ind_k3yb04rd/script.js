document.addEventListener('DOMContentLoaded', () => {
    const keyboard = document.getElementById('keyboard');
    const output = document.getElementById('output');
    const keys = '1234567890qwertyuiopasdfghjklzxcvbnm';
    let pressedKeys = new Set();

    // Создаем клавиатуру
    keys.split('').forEach(key => {
        const keyElement = document.createElement('div');
        keyElement.className = 'key';
        keyElement.textContent = key;
        keyElement.dataset.key = key;
        keyboard.appendChild(keyElement);
    });

    // Обработчики событий
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    function handleKeyDown(event) {
        const key = event.key.toLowerCase();
        if (keys.includes(key) && !pressedKeys.has(key)) {
            pressedKeys.add(key);
            updateKeyboard();
            checkSolution();
        }
    }

    function handleKeyUp(event) {
        const key = event.key.toLowerCase();
        if (keys.includes(key)) {
            pressedKeys.delete(key);
            updateKeyboard();
        }
    }

    function updateKeyboard() {
        document.querySelectorAll('.key').forEach(keyElement => {
            const key = keyElement.dataset.key;
            keyElement.style.backgroundColor = pressedKeys.has(key) ? '#00ff00' : '#2a2a2a';
        });
    }

    async function checkSolution() {
        try {
            const response = await fetch('/check/1337_b1ind_k3yb04rd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pressedKeys: Array.from(pressedKeys)
                })
            });

            const result = await response.json();
            output.textContent = JSON.stringify(result, null, 2);
        } catch (error) {
            output.textContent = 'Error: ' + error.message;
        }
    }
}); 