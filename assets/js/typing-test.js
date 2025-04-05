const wpmText = document.getElementById('wpm');
const timerText = document.getElementById('time');
const errorText = document.getElementById('errors');
const textArea = document.getElementById('textarea');
const typeText = document.getElementById('type-text');
const accuracyText = document.getElementById('accuracy');
const languageSelect = document.getElementById('language-select');
const refreshButton = document.getElementById('refresh-text');
const restartButton = document.getElementById('restart-test');
const historyRecords = document.getElementById('history-records');
const themeToggle = document.getElementById('theme-toggle');

let errors = 0;
let accuracy = 0;
let timeLeft = 0;
let timeElapsed = 0;
let typedCharacter = 0;
let timer = null;
let hasStarted = false;
let TEXT = '';
let TIME_LIMIT = 0;
let currentLanguage = 'en';
let testHistory = JSON.parse(localStorage.getItem('typingTestHistory')) || [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let completedSentences = 0;

// Updated API endpoints with more reliable sources
const API_ENDPOINTS = {
    en: [
        'https://api.quotable.io/random?minLength=80&maxLength=140',
        'https://api.Taylor.rest/quote',
        'https://type.fit/api/quotes'
    ],
    es: 'https://programming-quotes-api.herokuapp.com/quotes/lang/es',
    fr: 'https://programming-quotes-api.herokuapp.com/quotes/lang/fr',
    de: 'https://programming-quotes-api.herokuapp.com/quotes/lang/de'
};

// Enhanced alternative texts in case API fails - more sentences per language
const FALLBACK_TEXTS = {
    en: [
        "The quick brown fox jumps over the lazy dog. All good men must come to the aid of their country.",
        "Practice makes perfect when learning to type quickly and accurately. Keep your fingers on the home row.",
        "The early bird catches the worm, but the second mouse gets the cheese. Timing is everything in life.",
        "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. Never give up.",
        "Life is what happens when you're busy making other plans. Live in the present moment."
    ],
    es: [
        "El veloz zorro marrón salta sobre el perro perezoso. Todos los hombres buenos deben acudir en ayuda de su país.",
        "La práctica hace la perfección cuando se aprende a escribir rápida y precisamente.",
        "A quien madruga, Dios le ayuda, pero el segundo ratón consigue el queso. El tiempo lo es todo en la vida.",
        "No hay mal que por bien no venga. A veces las situaciones difíciles nos llevan a mejores oportunidades.",
        "El conocimiento es poder. La educación es la clave para abrir puertas al futuro y a nuevas oportunidades.",
        "La vida es como montar en bicicleta. Para mantener el equilibrio, debes seguir moviéndote."
    ],
    fr: [
        "Le rapide renard brun saute par-dessus le chien paresseux. Tous les hommes de bonne volonté doivent venir en aide à leur pays.",
        "C'est en pratiquant qu'on devient parfait pour apprendre à taper rapidement et avec précision.",
        "L'avenir appartient à ceux qui se lèvent tôt, mais le second souris obtient le fromage.",
        "Être ou ne pas être, telle est la question. S'il est plus noble dans l'esprit de souffrir les flèches.",
        "La connaissance, c'est le pouvoir. L'éducation est la clé pour ouvrir les portes de l'avenir.",
        "La vie est comme faire du vélo. Pour garder votre équilibre, vous devez continuer à bouger."
    ],
    de: [
        "Der schnelle braune Fuchs springt über den faulen Hund. Alle guten Männer müssen ihrem Land zu Hilfe kommen.",
        "Übung macht den Meister, wenn man lernt, schnell und genau zu tippen.",
        "Der frühe Vogel fängt den Wurm, aber die zweite Maus bekommt den Käse. Timing ist alles im Leben.",
        "Sein oder nicht sein, das ist hier die Frage. Ob es edler im Geist ist, die Pfeile zu erleiden.",
        "Wissen ist Macht. Bildung ist der Schlüssel, um Türen zur Zukunft und zu neuen Möglichkeiten zu öffnen.",
        "Das Leben ist wie Fahrradfahren. Um das Gleichgewicht zu halten, musst du in Bewegung bleiben."
    ]
};

// Additional hardcoded texts with high-quality content
const ADVANCED_TEXTS = {
    en: [
        "The greatest glory in living lies not in never falling, but in rising every time we fall. The way to get started is to quit talking and begin doing. Your time is limited, so don't waste it living someone else's life.",
        "If life were predictable it would cease to be life, and be without flavor. If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.",
        "When you reach the end of your rope, tie a knot in it and hang on. Always remember that you are absolutely unique, just like everyone else. Don't judge each day by the harvest you reap.",
        "The future belongs to those who believe in the beauty of their dreams. Tell me and I forget. Teach me and I remember. Involve me and I learn. The best and most beautiful things in the world cannot be seen."
    ],
    es: [
        "La gloria más grande de la vida no está en no caer nunca, sino en levantarnos cada vez que caemos. La forma de empezar es dejar de hablar y comenzar a actuar. Tu tiempo es limitado, así que no lo desperdicies viviendo la vida de otra persona.",
        "Si la vida fuera predecible, dejaría de ser vida y carecería de sabor. Si estableces tus metas ridículamente altas y fracasas, fracasarás por encima del éxito de los demás.",
        "Cuando llegues al final de la cuerda, haz un nudo y aguanta. Recuerda siempre que eres absolutamente único, igual que todos los demás. No juzgues cada día por la cosecha que recoges.",
        "El futuro pertenece a quienes creen en la belleza de sus sueños. Dime y lo olvido. Enséñame y lo recuerdo. Involúcrame y aprendo. Las mejores y más bellas cosas del mundo no se pueden ver ni tocar."
    ],
    fr: [
        "La plus grande gloire dans la vie ne réside pas dans le fait de ne jamais tomber, mais dans celui de se relever à chaque chute. Pour commencer, il faut arrêter de parler et commencer à agir. Votre temps est limité, ne le gaspillez pas en vivant la vie de quelqu'un d'autre.",
        "Si la vie était prévisible, elle cesserait d'être la vie et serait sans saveur. Si vous fixez vos objectifs ridiculement hauts et que c'est un échec, vous échouerez au-dessus du succès de tous les autres.",
        "Quand vous arrivez au bout de votre corde, faites un nœud et accrochez-vous. N'oubliez jamais que vous êtes absolument unique, tout comme tout le monde. Ne jugez pas chaque jour sur la récolte que vous récoltez.",
        "L'avenir appartient à ceux qui croient en la beauté de leurs rêves. Dis-moi et j'oublie. Enseigne-moi et je me souviens. Implique-moi et j'apprends. Les meilleures et les plus belles choses au monde ne peuvent être vues."
    ],
    de: [
        "Die größte Ehre im Leben liegt nicht darin, niemals zu fallen, sondern jedes Mal wieder aufzustehen, wenn wir fallen. Der Weg, um anzufangen, ist, aufzuhören zu reden und anzufangen zu handeln. Deine Zeit ist begrenzt, also verschwende sie nicht damit, das Leben eines anderen zu leben.",
        "Wenn das Leben vorhersehbar wäre, würde es aufhören, Leben zu sein und ohne Geschmack sein. Wenn du deine Ziele lächerlich hoch ansetzt und es ein Misserfolg ist, wirst du über dem Erfolg aller anderen scheitern.",
        "Wenn du am Ende deines Seils angekommen bist, mach einen Knoten hinein und halte dich fest. Denk immer daran, dass du absolut einzigartig bist, genau wie jeder andere. Beurteile jeden Tag nicht nach der Ernte, die du einbringst.",
        "Die Zukunft gehört denen, die an die Schönheit ihrer Träume glauben. Sag es mir und ich vergesse. Lehre mich und ich erinnere mich. Beziehe mich ein und ich lerne. Die besten und schönsten Dinge der Welt kann man nicht sehen."
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    addMissingCssRules(); // Add missing CSS rules
    loadText(currentLanguage);
    displayHistory();
    
    textArea.addEventListener('input', update);
    languageSelect.addEventListener('change', handleLanguageChange);
    refreshButton.addEventListener('click', () => loadText(currentLanguage));
    restartButton.addEventListener('click', restartTest);
    themeToggle.addEventListener('click', toggleTheme);
});

function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    localStorage.setItem('darkMode', isDarkMode);
}

function handleLanguageChange() {
    currentLanguage = languageSelect.value;
    if (hasStarted) {
        if (confirm("Changing language will restart your test. Continue?")) {
            restartTest();
            loadText(currentLanguage);
        } else {
            languageSelect.value = currentLanguage;
        }
    } else {
        loadText(currentLanguage);
    }
}

function loadText(language) {
    textArea.value = '';
    textArea.disabled = false;
    errors = 0;
    accuracy = 0;
    typedCharacter = 0;
    errorText.innerHTML = 0;
    accuracyText.innerHTML = 100;
    wpmText.innerHTML = 0;
    
    // Show loading indicator
    typeText.innerHTML = '<div class="loading-text">Loading text...</div>';
    
    // Decide whether to use advanced texts or fallback based on a random choice
    // This ensures variety and improves reliability
    if (Math.random() > 0.5) {
        // Use hardcoded advanced texts 50% of the time
        useAdvancedText(language);
        return;
    }

    // Determine which API endpoint to use
    const endpoint = getApiEndpointForLanguage(language);
    
    if (!endpoint) {
        // If no suitable endpoint for the language, use advanced texts
        useAdvancedText(language);
        return;
    }
    
    // Set a timeout to handle very slow connections
    const fetchTimeout = setTimeout(() => {
        console.error('Fetch timeout');
        useAdvancedText(language);
    }, 5000); // 5 second timeout
    
    fetch(endpoint)
        .then(response => {
            clearTimeout(fetchTimeout);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let extractedText = '';
            
            if (endpoint.includes('quotable.io')) {
                // Quote API format
                extractedText = data.content;
            } else if (endpoint.includes('Taylor.rest')) {
                // Taylor.rest format
                extractedText = data.quote;
            } else if (endpoint.includes('type.fit')) {
                // type.fit format - returns an array of quotes
                const randomQuote = data[Math.floor(Math.random() * data.length)];
                extractedText = randomQuote.text;
            } else if (endpoint.includes('programming-quotes-api')) {
                // Programming quotes API format
                if (Array.isArray(data) && data.length > 0) {
                    const randomQuote = data[Math.floor(Math.random() * data.length)];
                    extractedText = randomQuote.en;
                }
            }
            
            if (!extractedText || extractedText.length < 20) {
                throw new Error('Received invalid text from API');
            }
            
            TEXT = extractedText;
            TIME_LIMIT = Math.max(30, Math.trunc(TEXT.length * 0.4)); // Minimum 30 seconds
            initializeTest({ timeLimit: TIME_LIMIT, text: TEXT });
            textArea.focus(); // Auto-focus the textarea
        })
        .catch(error => {
            clearTimeout(fetchTimeout);
            console.error('Fetch error:', error);
            useAdvancedText(language);
        });
}

function getApiEndpointForLanguage(language) {
    const endpoints = API_ENDPOINTS[language];
    if (!endpoints) return null;
    
    // If it's an array of endpoints, select one randomly
    if (Array.isArray(endpoints)) {
        return endpoints[Math.floor(Math.random() * endpoints.length)];
    }
    
    return endpoints;
}

function useAdvancedText(language) {
    // First try to use advanced text
    if (ADVANCED_TEXTS[language] && ADVANCED_TEXTS[language].length > 0) {
        const texts = ADVANCED_TEXTS[language];
        TEXT = texts[Math.floor(Math.random() * texts.length)];
    } else {
        // Fallback to the original fallback texts
        TEXT = getRandomFallbackText(language);
    }
    
    TIME_LIMIT = Math.max(30, Math.trunc(TEXT.length * 0.4));
    initializeTest({ timeLimit: TIME_LIMIT, text: TEXT });
    textArea.focus();
}

function getRandomFallbackText(language) {
    const texts = FALLBACK_TEXTS[language];
    return texts[Math.floor(Math.random() * texts.length)];
}

function initializeTest({ timeLimit, text }) {
    timeLeft = timeLimit;
    timerText.innerHTML = timeLimit;
    typeText.innerHTML = '';
    text.split('').forEach(character => {
        typeText.innerHTML += `<span>${character}</span>`;
    });
}

function update() {
    if (!hasStarted) {
        timer = setInterval(updateTimer, 1000);
        hasStarted = true;
    }
    typedCharacter = textArea.value.length;
    maxCharacter();
    updateCharactersStatus();
    updateErrors();
    updateAccuracy();
}

function maxCharacter() {
    const { length } = TEXT;
    textArea.setAttribute('maxLength', length);
}

function updateCharactersStatus() {
    const characterArray = [...textArea.value];
    let index = 0;
    for (const span of typeText.children) {
        if (!characterArray[index]) {
            span.className = '';
        } else if (span.innerHTML === characterArray[index]) {
            span.className = 'correct-char';
        } else {
            span.className = 'incorrect-char';
        }
        index++;
    }
    
    // Check if test is complete
    if (textArea.value.length === TEXT.length) {
        finishTest(true);
    }
}

function updateAccuracy() {
    if (typedCharacter === 0) {
        accuracyText.innerHTML = 100;
        return;
    }
    accuracy = Math.round(((typedCharacter - errors) / typedCharacter) * 100);
    accuracyText.innerHTML = accuracy;
}

function updateErrors() {
    errors = typeText.querySelectorAll('.incorrect-char').length;
    errorText.innerHTML = errors;
}

function updateWpm() {
    if (timeElapsed === 0) return;
    const wpm = Math.round((typedCharacter / 5 / timeElapsed) * 60);
    wpmText.innerHTML = wpm;
    return wpm;
}

function updateTimer() {
    timeLeft = TIME_LIMIT - timeElapsed;
    timerText.innerHTML = timeLeft;
    
    // Add warning animation when time is running out
    if (timeLeft <= 10) {
        timerText.parentElement.classList.add('timer-alert');
    } else {
        timerText.parentElement.classList.remove('timer-alert');
    }
    
    if (timeLeft <= 0) {
        finishTest(false);
    }
    if (timeElapsed > 0) {
        updateWpm();
    }
    updateErrors();
    timeElapsed++;
}

function finishTest(completed) {
    textArea.disabled = true;
    clearInterval(timer);
    
    const wpm = updateWpm();
    
    // Save test result to history
    const testResult = {
        date: new Date().toLocaleString(),
        language: currentLanguage,
        wpm: wpm || 0,
        accuracy: accuracy,
        errors: errors,
        textLength: TEXT.length,
        completed: completed
    };
    
    testHistory.unshift(testResult);
    if (testHistory.length > 10) {
        testHistory.pop(); // Keep only 10 most recent tests
    }
    
    localStorage.setItem('typingTestHistory', JSON.stringify(testHistory));
    displayHistory();
    
    // Show completion message if completed successfully
    if (completed) {
        completedSentences++;
        // Show completion feedback
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'completion-message';
        feedbackElement.textContent = `Great job! Sentence completed. Loading new text...`;
        typeText.appendChild(feedbackElement);
        
        // Auto-load new text after a short delay
        setTimeout(() => {
            hasStarted = false;
            timeElapsed = 0;
            loadText(currentLanguage);
        }, 1500);
    }
}

function restartTest() {
    if (timer) clearInterval(timer);
    hasStarted = false;
    timeElapsed = 0;
    loadText(currentLanguage);
}

function displayHistory() {
    historyRecords.innerHTML = '';
    
    if (testHistory.length === 0) {
        historyRecords.innerHTML = '<p class="no-history">No test history available yet. Complete your first test to see your stats here!</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'history-table';
    
    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Language</th>
            <th>WPM</th>
            <th>Accuracy</th>
            <th>Errors</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    testHistory.forEach((record) => {
        const tr = document.createElement('tr');
        const languageBadge = `<span class="badge lang-badge">${record.language.toUpperCase()}</span>`;
        tr.innerHTML = `
            <td>${record.date}</td>
            <td>${languageBadge}</td>
            <td>${record.wpm}</td>
            <td>${record.accuracy}%</td>
            <td>${record.errors}</td>
        `;
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    historyRecords.appendChild(table);
}

function addMissingCssRules() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .loading-text {
            color: var(--text-light);
            font-style: italic;
            text-align: center;
            padding: 20px;
            animation: pulse 1.5s infinite;
        }

        .completion-message {
            background-color: var(--secondary);
            color: white;
            padding: 10px 15px;
            margin: 15px auto;
            border-radius: 6px;
            display: inline-block;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styleElement);
}
