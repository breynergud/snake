// Configuración del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const predictionElement = document.getElementById('prediction');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// Variables del juego
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop = null;
let isPaused = false;
let gameStarted = false;

// Variables de Teachable Machine
const URL = "https://teachablemachine.withgoogle.com/models/wHlIq-MzV/";
let model, webcam, maxPredictions;
let currentDirection = "Ninguna";
let lastValidDirection = null;

// Inicializar Teachable Machine
async function initTeachableMachine() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const flip = true;
        webcam = new tmImage.Webcam(300, 300, flip);
        await webcam.setup();
        await webcam.play();
        
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        
        window.requestAnimationFrame(predictLoop);
        console.log("Teachable Machine inicializado correctamente");
    } catch (error) {
        console.error("Error al inicializar Teachable Machine:", error);
        alert("Error al cargar el modelo o la cámara. Verifica los permisos de la cámara.");
    }
}

async function predictLoop() {
    if (webcam) {
        webcam.update();
        await predict();
    }
    window.requestAnimationFrame(predictLoop);
}

async function predict() {
    if (!model || !webcam) return;
    
    const prediction = await model.predict(webcam.canvas);
    let maxProb = 0;
    let detectedClass = "Ninguna";

    prediction.forEach(pred => {
        if (pred.probability > maxProb && pred.probability > 0.7) {
            maxProb = pred.probability;
            detectedClass = pred.className;
        }
    });

    currentDirection = detectedClass;
    predictionElement.textContent = currentDirection;

    if (gameStarted && !isPaused) {
        updateSnakeDirection(detectedClass);
    }
}

function updateSnakeDirection(direction) {
    switch(direction) {
        case "arriba":
        case "up":
        case "↑":
            if (dy === 0) {
                dx = 0;
                dy = -1;
                lastValidDirection = "arriba";
            }
            break;
        case "abajo":
        case "down":
        case "↓":
            if (dy === 0) {
                dx = 0;
                dy = 1;
                lastValidDirection = "abajo";
            }
            break;
        case "izquierda":
        case "left":
        case "←":
            if (dx === 0) {
                dx = -1;
                dy = 0;
                lastValidDirection = "izquierda";
            }
            break;
        case "derecha":
        case "right":
        case "→":
            if (dx === 0) {
                dx = 1;
                dy = 0;
                lastValidDirection = "derecha";
            }
            break;
    }
}

// Funciones del juego
function drawGame() {
    clearCanvas();
    moveSnake();
    drawSnake();
    drawFood();
    checkCollision();
    checkFoodCollision();
}

function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#00ff00';
        } else {
            ctx.fillStyle = '#00cc00';
        }
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        
        if (index === 0) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(segment.x * gridSize + 5, segment.y * gridSize + 5, 3, 3);
            ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 5, 3, 3);
        }
    });
}

function drawFood() {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

function checkCollision() {
    const head = snake[0];
    
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
    }
    
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
}

function checkFoodCollision() {
    // Ya se maneja en moveSnake
}

function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Puntuación: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        isPaused = false;
        gameLoop = setInterval(drawGame, 200);
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    }
}

function pauseGame() {
    if (gameStarted) {
        isPaused = !isPaused;
        if (isPaused) {
            clearInterval(gameLoop);
            pauseBtn.textContent = 'Reanudar';
        } else {
            gameLoop = setInterval(drawGame, 200);
            pauseBtn.textContent = 'Pausar';
        }
    }
}

function restartGame() {
    clearInterval(gameLoop);
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    generateFood();
    gameStarted = false;
    isPaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pausar';
    clearCanvas();
    drawSnake();
    drawFood();
}

// Event Listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);

// Control con teclado como respaldo
document.addEventListener('keydown', (e) => {
    if (!gameStarted || isPaused) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
    }
});

// Inicializar
pauseBtn.disabled = true;
drawSnake();
drawFood();
initTeachableMachine();
