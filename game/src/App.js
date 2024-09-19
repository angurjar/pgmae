import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const letters = 'abcdefghijklmnopqrstuvwxyz';

function App() {
    const [currentWord, setCurrentWord] = useState('');
    const [timer, setTimer] = useState(60);
    const [fallingLetters, setFallingLetters] = useState([]);
    const [inputBoxes, setInputBoxes] = useState({
        3: Array(3).fill(''),
        4: Array(4).fill(''),
        5: Array(5).fill(''),
        6: Array(6).fill(''),
    });
    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [gameActive, setGameActive] = useState(false);

    const letterBoxRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (gameActive) {
            timerRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        endGame('Time is up!');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            const interval = setInterval(createFallingLetter, 2000);
            return () => clearInterval(interval);
        }
    }, [gameActive]);

    useEffect(() => {
        const interval = setInterval(() => {
            setFallingLetters(prev => {
                return prev.map(letter => ({
                    ...letter,
                    top: letter.top + 2 // Adjust speed here
                })).filter(letter => letter.top <= 100); // Remove letters that have fallen below 100%
            });
        }, 50);
        return () => clearInterval(interval);
    }, [gameActive]);

    function generateRandomLetter() {
        return letters.charAt(Math.floor(Math.random() * letters.length));
    }

    function generateRandomWord(length) {
        let word = '';
        for (let i = 0; i < length; i++) {
            word += generateRandomLetter();
        }
        return word;
    }

    function createFallingLetter() {
        if (!gameActive) return;
        const letter = generateRandomLetter();
        setFallingLetters(prev => [
            ...prev,
            { letter, left: Math.random() * 80, top: 0 }
        ]);
    }

    function handleDrop(e, length, index) {
        e.preventDefault();
        const letter = e.dataTransfer.getData('text/plain');
        setInputBoxes(prev => {
            const newBoxes = { ...prev };
            newBoxes[length][index] = letter;
            return newBoxes;
        });
        checkWordCompletion();
    }

    function handleDragStart(e, letter) {
        e.dataTransfer.setData('text/plain', letter);
    }

    function checkWordCompletion() {
        const newBoxes = { ...inputBoxes };
        const boxes = Object.entries(newBoxes).flatMap(([length, words]) => words.map(word => ({ length: Number(length), word })));

        boxes.forEach(({ length, word }) => {
            if (word.length === length) {
                if (word === currentWord) {
                    setScore(prev => prev + 1);
                    setCoins(prev => prev + 10);
                    setCurrentWord(generateRandomWord(length));
                    resetInputBoxes();
                }
            }
        });
    }

    function resetInputBoxes() {
        setInputBoxes({
            3: Array(3).fill(''),
            4: Array(4).fill(''),
            5: Array(5).fill(''),
            6: Array(6).fill(''),
        });
    }

    function endGame(message) {
        setGameActive(false);
        alert(`${message} Score: ${score} Coins: ${coins}`);
    }

    function startGame() {
        setGameActive(true);
        setScore(0);
        setCoins(0);
        setTimer(60);
        setCurrentWord(generateRandomWord(3));
        resetInputBoxes();
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    return (
        <div className="App">
          <h1> make spelling drag word</h1>
            <button onClick={startGame} style={{ display: gameActive ? 'none' : 'inline-block' }}>Start Game</button>
            <button onClick={() => window.location.reload()} style={{ display: gameActive ? 'inline-block' : 'none' }}>Restart Game</button>
            <button onClick={() => endGame('Game exited.')} style={{ display: gameActive ? 'inline-block' : 'none' }}>Exit Game</button>

            <div ref={letterBoxRef} className="letter-boxes">
                {fallingLetters.map((letter, index) => (
                    <div
                        key={index}
                        className="letter"
                        style={{ left: `${letter.left}%`, top: `${letter.top}%` }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, letter.letter)}
                    >
                        {letter.letter}
                    </div>
                ))}
            </div>

            <div className="input-letters">
                {[3, 4, 5, 6].map(length => (
                    <div className="input-row" key={length}>
                        {inputBoxes[length].map((box, index) => (
                            <div
                                key={index}
                                className="input-box"
                                data-length={length}
                                onDrop={(e) => handleDrop(e, length, index)}
                                onDragOver={handleDragOver}
                            >
                                {box}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div id="time">Time: {timer}</div>
            <div id="message">Score: {score} Coins: {coins}</div>
        </div>
    );
}

export default App;
