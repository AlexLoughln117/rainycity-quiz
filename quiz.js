let quizData = [];
let products = [];

function loadQuizData() {
    fetch(window.quizDataUrl)
        .then(response => response.json())
        .then(data => {
            quizData = data.quizData;
            products = data.products;
            initializeQuiz();
        })
        .catch(error => console.error('Error loading quiz data:', error));
}

let currentQuestion = -1;
let userAnswers = {
    hairType: [],
    hairConcern: [],
    stylingMethod: []
};

function createStartScreen() {
    const startScreen = document.createElement('div');
    startScreen.id = 'start-screen';
    startScreen.className = 'question active';
    startScreen.innerHTML = `
        <div class="start-content">
            <div class="start-image">
            <img src="https://cdn.shopify.com/s/files/1/0761/8176/6464/files/startscreen.png?v=1724875482" alt="Woman Image for start screen">
            </div>
            <div class="start-text">
                <img src="https://cdn.shopify.com/s/files/1/0761/8176/6464/files/start-title.svg?v=1724873366" alt="FIND THE PERFECT PRODUCTS FOR YOU">
                <p>Our personalised consultation will tailor your product line up based on your hair needs and concerns. Let the experts do the hard work for you. Find out your ideal cocktail of hair care designed to make you look as good as you feel.</p>
                <button id="start-quiz" class="btn btn-primary">GET STARTED</button>
            </div>
        </div>
    `;
    return startScreen;
}

function initializeQuiz() {
    const container = document.querySelector('.quizcontainer');
    const startScreen = createStartScreen();
    const progressBar = createProgressBar();
    const questions = createQuestions();
    const buttonGroup = createButtonGroup();
    const restartButton = createRestartButton();

    container.innerHTML = '';
    container.appendChild(startScreen);
    container.appendChild(progressBar);
    questions.forEach(q => container.appendChild(q));
    container.appendChild(buttonGroup);
    container.appendChild(restartButton);

    updateButtons();
    addEventListeners();
}

function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    for (let i = 0; i < quizData.length + 1; i++) {
        const step = document.createElement('div');
        step.className = 'progress-step';
        progressBar.appendChild(step);
    }
    return progressBar;
}

function createQuestions() {
    return quizData.map((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.id = question.id;
        questionElement.className = 'question';
        questionElement.innerHTML = `
            <h1>${question.title}</h1>
            <p>${question.instruction}</p>
            <div class="options options-${question.id}">
                ${question.options.map(option => `
                    <div class="option" data-value="${option.value}">
                        <img src="${option.image}" alt="${option.label}">
                        <div class="option-label">${option.label}</div>
                    </div>
                `).join('')}
            </div>
        `;
        return questionElement;
    });
}

function createButtonGroup() {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';
    buttonGroup.innerHTML = `
        <button id="back-btn" class="btn btn-secondary">GO BACK</button>
        <button id="next-btn" class="btn btn-primary">NEXT</button>
    `;
    return buttonGroup;
}

function createRestartButton() {
    const restartButton = document.createElement('div');
    restartButton.className = 'restart';
    restartButton.innerHTML = '<a href="#" id="restart-quiz">RESTART QUIZ</a>';
    return restartButton;
}

function startQuiz() {
    document.getElementById('start-screen').style.display = 'none';
    document.querySelector('.progress-bar').style.display = 'flex';
    document.querySelector('.button-group').style.display = 'flex';
    document.querySelector('#restart-quiz').style.display = 'flex';
    currentQuestion = 0;
    showQuestion(currentQuestion);
}

function updateButtons() {
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    backBtn.style.visibility = currentQuestion === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = currentQuestion === quizData.length - 1 ? 'GET YOUR RESULTS' : 'NEXT';
}

function showQuestion(index) {
    const questions = document.querySelectorAll('.question');
    const progressSteps = document.querySelectorAll('.progress-step');
    questions.forEach((q, i) => {
        if (i === 0) { 
            q.style.display = 'none';
        } else {
            q.style.display = i === index + 1 ? 'block' : 'none';
        }
    });
    progressSteps.forEach((step, i) => {
        step.classList.toggle('active', i <= index);
    });
    updateButtons();
}

function nextQuestion() {
    if (currentQuestion < quizData.length - 1) {
        saveAnswers();
        currentQuestion++;
        showQuestion(currentQuestion);
    } else if (currentQuestion === quizData.length - 1) {
        saveAnswers();
        showResults();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion(currentQuestion);
    }
}

function saveAnswers() {
    const activeQuestion = document.querySelector('.question:not([style*="display: none"])');
    const selectedOptions = activeQuestion.querySelectorAll('.option.selected');
    const answerKey = Object.keys(userAnswers)[currentQuestion];
    userAnswers[answerKey] = Array.from(selectedOptions).map(option => option.dataset.value);
}

function calculateRecommendations() {
    const productScores = products.map(product => {
        let score = 0;
        const typeMatch = userAnswers.hairType.some(type => product.forTypes.includes(type) || product.forTypes.includes("all"));
        if (typeMatch) score += 1;
        const concernMatch = userAnswers.hairConcern.some(concern => product.forConcerns.includes(concern));
        if (concernMatch) score += 2;
        const stylingMatch = userAnswers.stylingMethod.some(method => product.forStyling.includes(method) || product.forStyling.includes("all"));
        if (stylingMatch) score += 1;
        return { product, score };
    });
    return productScores.sort((a, b) => b.score - a.score).slice(0, 2).map(item => item.product);
}

function showResults() {
    const recommendations = calculateRecommendations();

    const resultsElement = document.createElement('div');
    resultsElement.id = 'results';
    resultsElement.className = 'question';
    resultsElement.innerHTML = `
        <h1>Your suggested products</h1>
        <p>Fusce gravida cursus arcu, imperdiet placerat neque mollis ut. In hac habitasse platea dictumst. Cras aliquet eros vel augue convallis.</p>
        <div id="product-recommendations">
            ${recommendations.map(product => `
                <div class="product">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="productname-price">
                    <h3>${product.name}</h3>
                    <p>£${product.price}</p>
                    </div>
                    <button class="btn btn-primary">ADD TO CART</button>
                </div>
            `).join('')}
        </div>
    `;

    const container = document.querySelector('.quizcontainer');
    const existingQuestions = document.querySelectorAll('.question');
    existingQuestions.forEach(q => q.style.display = 'none');
    container.insertBefore(resultsElement, container.querySelector('.button-group'));
    resultsElement.style.display = 'block';
    const buttonGroup = document.querySelector('.button-group');
    buttonGroup.style.display = 'none';
    currentQuestion = quizData.length;
    updateButtons();
}

function restartQuiz() {
    currentQuestion = -1; 
    userAnswers = { hairType: [], hairConcern: [], stylingMethod: [] };
    initializeQuiz();
    document.getElementById('start-screen').style.display = 'flex';
    document.querySelector('.progress-bar').style.display = 'none';
    document.querySelector('.button-group').style.display = 'none';
}

function addEventListeners() {
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('back-btn').addEventListener('click', previousQuestion);
    document.getElementById('restart-quiz').addEventListener('click', restartQuiz);
    document.getElementById('start-quiz').addEventListener('click', startQuiz);

    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadQuizData();
});