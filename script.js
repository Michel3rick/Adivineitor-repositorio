let currentWord = "";
let currentHint = "";
let timeLeft = 20;
let timer;
let score = 0;
let selectedDifficulty = "easy.json";

// Registra el usuario y selecciona la dificultad
function registerUser() {
    let username = document.getElementById("username").value.trim();
    selectedDifficulty = document.getElementById("difficulty").value;
    document.getElementById("currentDifficulty").innerText = document.getElementById("difficulty").options[document.getElementById("difficulty").selectedIndex].text;

    if (username === "") {
        alert("Por favor, ingresa tu nombre.");
        return;
    }

    document.getElementById("playerName").innerText = username;
    document.getElementById("register").style.display = "none";
    document.getElementById("game").style.display = "block";
    
    startGame();
}

document.addEventListener("DOMContentLoaded", function() {
    // Detectar "Enter" en el input de nombre para iniciar el juego
    document.getElementById("username").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            registerUser();
        }
    });

    // Detectar "Enter" en el input de respuesta para verificar la palabra
    document.getElementById("guess").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            checkAnswer();
        }
    });
});

function saveScore() {
    const url = "https://script.google.com/macros/s/AKfycbyr_OOk7XDr_Ug_oR4Gmohwd_x0w2CttFsPH0prHjQwO3GrvHJACiNOHsHwgipsDlMTwA/exec"; // Reemplázalo con tu URL real

    const data = {
        "Nombre": document.getElementById("playerName").innerText,
        "Dificultad": document.getElementById("difficulty").options[document.getElementById("difficulty").selectedIndex].text,
        "Nivel": getRank(score),
        "Puntaje": score
    };

    fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(() => {
        console.log("Datos enviados correctamente.");
    }).catch(error => {
        console.error("Error al enviar datos:", error);
    });
}


// Inicia una nueva ronda
function startGame() {
    fetch(selectedDifficulty)
        .then(response => response.json())
        .then(data => {
            let randomIndex = Math.floor(Math.random() * data.length);
            currentWord = data[randomIndex].word;
            currentHint = data[randomIndex].hint;

            console.log("Palabra seleccionada:", currentWord);
            console.log("Pista:", currentHint);

            document.getElementById("hintText").innerText = currentHint;
            document.getElementById("word").innerText = revealLetters(currentWord, 35);
            document.getElementById("result").innerText = "";
            document.getElementById("guess").value = "";
            document.getElementById("score").innerText = "Puntaje: " + score;
            document.getElementById("rank").innerText = getRank(score);
            
        if (selectedDifficulty.includes("easy")) {
                timeLeft = 10;
            } else if (selectedDifficulty.includes("normal")) {
                timeLeft = 15;
            } else if (selectedDifficulty.includes("hard")) {
                timeLeft = 20;
            }
            document.getElementById("timer").innerText = "Tiempo restante: " + timeLeft;
            startTimer();
        })
        .catch(error => console.error("Error al cargar las palabras:", error));
}

// Función que revela el 30% de las letras en posiciones aleatorias
function revealLetters(word, percentage) {
    let totalLetters = word.length;
    let lettersToReveal = Math.ceil((percentage / 100) * totalLetters);
    let revealedIndexes = new Set();

    while (revealedIndexes.size < lettersToReveal) {
        let randomIndex = Math.floor(Math.random() * totalLetters);
        revealedIndexes.add(randomIndex);
    }

    return word.split("").map((char, index) =>
        revealedIndexes.has(index) ? char : "_"
    ).join(" ");
}

// Inicia el temporizador
function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = "Tiempo restante: " + timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

// Verifica si la respuesta es correcta
function checkAnswer() {
    let guess = document.getElementById("guess").value.trim().toLowerCase();

    if (guess === currentWord.toLowerCase()) {
        score += 50;
        document.getElementById("score").innerText = "Puntaje: " + score;
        document.getElementById("rank").innerText = getRank(score);
        document.getElementById("result").innerText = "✅ ¡Correcto!";
        setTimeout(startGame, 500); // Inicia una nueva ronda después de 1.5s
    } else {
        document.getElementById("result").innerText = "❌ Incorrecto, intenta de nuevo.";
    }
}

// Muestra la pantalla de derrota
function endGame() {
    saveScore(); // <-- Guarda el puntaje en Google Sheets
    document.getElementById("result").innerText = "⏳ Tiempo agotado. La palabra era: " + currentWord;
    setTimeout(() => {
        document.getElementById("game").style.display = "none";
        document.getElementById("gameOver").style.display = "block";
        
        document.getElementById("finalPlayerName").innerText = document.getElementById("playerName").innerText;
        document.getElementById("finalDifficulty").innerText = document.getElementById("difficulty").options[document.getElementById("difficulty").selectedIndex].text;
        document.getElementById("finalScore").innerText = score;
        document.getElementById("finalRank").innerText = getRank(score);

    }, 4000);
}


// Devuelve el rango según el puntaje
function getRank(score) {
    if (score < 150) return "🥚 Huevo";
    if (score < 400) return "🐥 Pollo";
    if (score < 800) return "🐔 Gallina";
    if (score < 1500) return "🐓 Gallo";
    if (score < 2500) return "🦉 Búho";
    if (score < 5000) return "🦅 Águila";
    if (score < 10000) return "🦖 Dinosaurio";
    return "🐉 Dragón";
}
function showRanking() {
    const url = "https://script.google.com/macros/s/AKfycbyr_OOk7XDr_Ug_oR4Gmohwd_x0w2CttFsPH0prHjQwO3GrvHJACiNOHsHwgipsDlMTwA/exec"; // URL de tu API

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const rankingTable = document.getElementById("rankingTable");
            rankingTable.innerHTML = "<tr><th>#</th><th>Nombre</th><th>Dificultad</th><th>Nivel</th><th>Puntaje</th></tr>";

            const lastPlayer = document.getElementById("finalPlayerName").innerText;
            const lastDifficulty = document.getElementById("finalDifficulty").innerText;
            const lastScore = parseInt(document.getElementById("finalScore").innerText);

            // Filtrar solo jugadores de la misma dificultad
            let filteredPlayers = data.filter(player => player.Dificultad === lastDifficulty);

            // Ordenar por puntaje de mayor a menor
            filteredPlayers.sort((a, b) => b.Puntaje - a.Puntaje);

            // Tomar solo los 9 mejores
            let topPlayers = filteredPlayers.slice(0, 9);

            // Verificar si el usuario actual está en el top 9
            let userExistsInTop = topPlayers.some(player => player.Nombre === lastPlayer && player.Puntaje === lastScore);

            // Si el usuario no está en el top 9, agregarlo aparte
            if (!userExistsInTop) {
                const userEntry = filteredPlayers.find(player => player.Nombre === lastPlayer && player.Puntaje === lastScore);
                if (userEntry) {
                    topPlayers.push(userEntry);
                }
            }

            // Generar la tabla con los datos
            topPlayers.forEach((player, index) => {
                let isUser = player.Nombre === lastPlayer && player.Puntaje === lastScore;
                let row = `<tr ${isUser ? 'style="font-weight: bold; text-decoration: underline;"' : ''}>
                    <td>${index + 1}</td>
                    <td>${player.Nombre}</td>
                    <td>${player.Dificultad}</td>
                    <td>${player.Nivel}</td>
                    <td>${player.Puntaje}</td>
                </tr>`;
                rankingTable.innerHTML += row;
            });

            document.getElementById("rankingScreen").style.display = "block";
            document.getElementById("gameOver").style.display = "none";
        })
        .catch(error => console.error("Error al cargar el ranking:", error));
}


// Reinicia el juego con el mismo usuario
function restartGame() {
    score = 0;
    document.getElementById("score").innerText = "Puntaje: " + score;
    document.getElementById("rank").innerText = getRank(score);
    document.getElementById("gameOver").style.display = "none";
    document.getElementById("rankingScreen").style.display = "none"; // Ocultar ranking
    document.getElementById("game").style.display = "block";
    startGame();
}

// Vuelve al menú principal
function goToMainMenu() {
    location.reload(); // Recarga la página
}

