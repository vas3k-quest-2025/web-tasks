document.addEventListener('DOMContentLoaded', () => {
    const targetTextElement = document.getElementById('target-text');
    const userInputElement = document.getElementById('user-input');
    const successOverlay = document.getElementById('success-overlay');
    const timerElement = document.getElementById('timer');
    const successMessageElement = document.getElementById('success-message');

    const TARGET_TEXT = "Анализ показал, что при высокой нагрузке на имплант наблюдается рост латентных отклонений в когнитивной активности носителя."; // Ваш текст для набора
    const SUCCESS_MESSAGE = "Кодовое слово: ";

    // Отображаем целевой текст
    targetTextElement.textContent = TARGET_TEXT;
    // Устанавливаем текст успешного сообщения
    successMessageElement.textContent = SUCCESS_MESSAGE;

    let timerInterval;

    async function checkText(text) {
        try {
            console.log('Sending text to check:', text);
            const response = await fetch('/check/1337_b1ind_k3yb04rd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received response:', data);
            return data;
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            return { success: false, message: 'Произошла ошибка при проверке текста: ' + error.message };
        }
    }

    userInputElement.addEventListener('input', () => {
        const userInput = userInputElement.value;
        let highlightedText = '';
        let isMatch = true;

        // Сравниваем символы, разрешая пробел вместо переноса строки из целевого текста
        for (let i = 0; i < TARGET_TEXT.length; i++) {
            const targetChar = TARGET_TEXT[i];
            const userChar = userInput[i];

            if (i < userInput.length) {
                if (targetChar === userChar || (targetChar === '\n' && userChar === ' ')) {
                    highlightedText += targetChar;
                } else {
                    highlightedText += `<span class="error">${targetChar}</span>`;
                    isMatch = false;
                }
            } else {
                highlightedText += targetChar;
            }
        }

        // Обновляем отображение целевого текста с подсветкой
        targetTextElement.innerHTML = highlightedText;

        // Для полного совпадения нормализуем оба текста (заменяем переносы строк на пробелы)
        const normalizedTargetText = TARGET_TEXT.replace(/\n/g, ' ');
        const normalizedUserInput = userInput.replace(/\n/g, ' ');

        // Проверяем полное совпадение нормализованных текстов
        if (normalizedUserInput === normalizedTargetText) {
            // Отправляем запрос на проверку
            checkText(normalizedUserInput).then(result => {
                if (result.success) {
                    successMessageElement.textContent = SUCCESS_MESSAGE + result.code;
                    showSuccessOverlay();
                } else {
                    alert(result.message || 'Ошибка при проверке текста');
                }
            });
        }
    });

    function showSuccessOverlay() {
        userInputElement.blur(); // Снимаем фокус с поля ввода
        successOverlay.classList.add('visible');
        let timeLeft = 10;
        timerElement.textContent = timeLeft;

        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                hideSuccessOverlay();
                resetTest();
            }
        }, 1000);
    }

    function hideSuccessOverlay() {
        successOverlay.classList.remove('visible');
    }

    function resetTest() {
        // Сброс для следующего теста
        userInputElement.value = '';
        targetTextElement.textContent = TARGET_TEXT; // Возвращаем исходный текст без подсветки
        // Можно добавить логику для загрузки нового текста
    }

    userInputElement.addEventListener('paste', (event) => {
        event.preventDefault();
    });
}); 