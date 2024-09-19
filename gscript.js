document.addEventListener('DOMContentLoaded', () => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%65432178900';
    let currentWord = '';
    let timerInterval;
    let timeLeft = 120;
    let fallingLetters = [];
    let score = 0;
    let coins = 0;
    let gameActive = false;

    function generateRandomLetter() {
        return letters.charAt(Math.floor(Math.random() * letters.length));
    }

    function createFallingLetter() {
        if (!gameActive) return;
        const letter = generateRandomLetter();
        const letterElement = document.createElement('div');
        letterElement.textContent = letter;
        letterElement.className = 'letter';
        letterElement.draggable = true;
        letterElement.style.left = `${Math.random() * 80}%`;
        letterElement.style.top = '0px';
        letterElement.dataset.letter = letter;
        letterElement.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', letter));
        document.getElementById('letter-boxes').appendChild(letterElement);
        fallingLetters.push(letterElement);
        animateFallingLetter(letterElement);
    }

    function animateFallingLetter(element) {
        const interval = setInterval(() => {
            let top = parseFloat(element.style.top);
            if (top > document.getElementById('letter-boxes').offsetHeight) {
                clearInterval(interval);
                element.remove();
                fallingLetters = fallingLetters.filter(l => l !== element);
                checkGameOver();
            } else {
                element.style.top = `${top + 2}px`;
            }
        }, 30);
    }

    function startGame() {
        gameActive = true;
        score = 0;
        coins = 0;
        timeLeft = 120;
        document.getElementById('time').textContent = timeLeft;
        document.getElementById('message').textContent = '';
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'none';
        document.getElementById('exit-btn').style.display = 'block';
        resetInputBoxes();
        setInterval(createFallingLetter, 2000);
        startTimer();
        displayWord();
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft -= 1;
            document.getElementById('time').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame('Time is up!');
            }
        }, 1000);
    }

    function resetInputBoxes() {
        document.querySelectorAll('.input-box').forEach(box => {
            box.innerHTML = '';
            box.addEventListener('dragover', (e) => e.preventDefault());
            box.addEventListener('drop', handleDrop);
        });
    }

    function handleDrop(e) {
        e.preventDefault();
        const letter = e.dataTransfer.getData('text/plain');
        const box = e.target;
        if (box.classList.contains('input-box') && box.textContent.length < parseInt(box.dataset.length)) {
            box.textContent += letter;
            checkWordCompletion();
        }
    }

    function checkWordCompletion() {
        const boxes = Array.from(document.querySelectorAll('.input-box'));
        const words = boxes.reduce((acc, box) => {
            const length = parseInt(box.dataset.length);
            if (!acc[length]) acc[length] = '';
            acc[length] += box.textContent;
            return acc;
        }, {});

        Object.entries(words).forEach(([length, word]) => {
            if (word.length >= length) {
                if (word === currentWord) {
                    score += 1;
                    coins += 10;
                    displayWord();
                }
            }
        });
    }

    function displayWord() {
        const lengths = [3, 4, 5, 6];
        const length = lengths[Math.floor(Math.random() * lengths.length)];
        currentWord = generateRandomWord(length);
        console.log('Current Word:', currentWord);
    }

    function generateRandomWord(length) {
        let word = '';
        for (let i = 0; i < length; i++) {
            word += generateRandomLetter();
        }
        return word;
    }

    function checkGameOver() {
        if (fallingLetters.length === 0 && document.querySelectorAll('.letter').length === 0) {
            endGame('Game over!');
        }
    }

    function endGame(message) {
        gameActive = false;
        document.getElementById('message').textContent = `${message} Score: ${score} Coins: ${coins}`;
        document.getElementById('user-input').disabled = true;
        document.getElementById('submit-btn').disabled = true;
        document.getElementById('exit-btn').style.display = 'none';
        fallingLetters.forEach(letter => letter.remove());
        document.getElementById('restart-btn').style.display = 'block';
    }

    document.getElementById('start-btn').addEventListener('click', startGame);

    document.getElementById('restart-btn').addEventListener('click', () => {
        location.reload();
    });

    document.getElementById('exit-btn').addEventListener('click', () => {
        endGame('Game exited.');
    });
});
