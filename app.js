document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-btn");
    const startSection = document.getElementById("start-section");
    const questionSection = document.getElementById("question-section");
    const answersContainer = document.getElementById("answers-container");
    const nextQuestionButton = document.getElementById("next-question-btn");
    const progressBar = document.querySelector('.progress-bar');
    const categoryLabel = document.getElementById("category-label");
    const progressPercentage = document.querySelector('.progress-percentage');
    const resultsSection = document.getElementById("results-section");
    const resultsContent = document.querySelector(".results-content");

    let data = {};
    let scoreData = {};
    let currentCategoryIndex = 0;
    let totalScore = 0;
    let categoryScores = {};
    let answeredQuestions = {};

    // Fetch JSON file containing questions
    fetch('./data/questions.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            data["assessment-questions"].forEach(category => {
                categoryScores[category.categories] = 0;
            });

            startButton.addEventListener("click", () => {
                startSection.classList.add("d-none");
                questionSection.classList.remove("d-none");
                loadQuestionsForCategory();
            });
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
        });

    // Fetch the score results from the JSON file
    fetch('./data/results.json')
        .then(response => response.json())
        .then(jsonData => {
            scoreData = jsonData;
        })
        .catch(error => {
            console.error('Error fetching results:', error);
        });

    nextQuestionButton.addEventListener("click", () => {
        currentCategoryIndex++;
        if (currentCategoryIndex < data["assessment-questions"].length) {
            loadQuestionsForCategory();
            scrollToTop();
        } else {
            scrollToTop();
            showResults();
        }
    });

    function loadQuestionsForCategory() {
        const categoryData = data["assessment-questions"][currentCategoryIndex];
        const questions = categoryData.questions;
        answeredQuestions = {};
        categoryLabel.textContent = categoryData.categories;
        nextQuestionButton.disabled = true;
        answersContainer.innerHTML = '';

        questions.forEach((questionData, questionIndex) => {
            const questionBox = document.createElement('div');
            questionBox.classList.add('question-box');
            questionBox.id = `question-box-${questionIndex}`;

            const questionContent = document.createElement('div');
            questionContent.classList.add('question-content');

            const questionText = document.createElement('h2');
            questionText.textContent = questionData.text;
            questionContent.appendChild(questionText);

            const questionAnswersContainer = document.createElement('div');
            questionAnswersContainer.id = `answers-container-${questionIndex}`;
            questionAnswersContainer.classList.add('answers-container');

            questionData.options.forEach((option, index) => {
                const label = document.createElement('label');
                label.classList.add('radio-label', `color-${index}`); // Add color class based on index
                label.innerHTML = `<input type="radio" name="answer-${questionIndex}" data-points="${option.points}"> ${option.answer}`;
                questionAnswersContainer.appendChild(label);

                label.querySelector('input').addEventListener('change', (event) => {
                    const selectedPoints = parseInt(event.target.getAttribute("data-points"));
                    answeredQuestions[questionIndex] = selectedPoints;
                    checkIfAllQuestionsAnswered();
                    scrollToNextQuestion(questionIndex);
                });
            });

            questionContent.appendChild(questionAnswersContainer);
            questionBox.appendChild(questionContent);
            answersContainer.appendChild(questionBox);
        });

        updateProgressBar();
    }

    function checkIfAllQuestionsAnswered() {
        const categoryData = data["assessment-questions"][currentCategoryIndex];
        const totalQuestionsInCategory = categoryData.questions.length;

        if (Object.keys(answeredQuestions).length === totalQuestionsInCategory) {
            const categoryScore = Object.values(answeredQuestions).reduce((acc, points) => acc + points, 0);
            const currentCategory = categoryData.categories;
            categoryScores[currentCategory] = categoryScore;

            nextQuestionButton.disabled = false;
        }
    }

    function scrollToNextQuestion(currentIndex) {
        const nextQuestionBox = document.getElementById(`question-box-${currentIndex + 1}`);
        if (nextQuestionBox) {
            nextQuestionBox.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function updateProgressBar() {
        const totalQuestions = data["assessment-questions"].reduce((sum, category) => sum + category.questions.length, 0);
        const currentQuestionNumber = data["assessment-questions"].slice(0, currentCategoryIndex).reduce((sum, category) => sum + category.questions.length, 0) + 1;
        const progress = Math.round((currentQuestionNumber / totalQuestions) * 100);
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        progressPercentage.textContent = `${progress}%`;
    }

    function showResults() {
        questionSection.classList.add("d-none");
        resultsSection.classList.remove("d-none");
        totalScore = Object.values(categoryScores).reduce((acc, categoryScore) => acc + categoryScore, 0);
    
        let categoryKey;
        if (totalScore >= 95) categoryKey = "pioneers";
        else if (totalScore >= 80) categoryKey = "leaders";
        else if (totalScore >= 65) categoryKey = "contenders";
        else if (totalScore >= 50) categoryKey = "chasers";
        else categoryKey = "followers";
    
        const categoryData = {
            "pioneers": {
                label: "Pioneers",
                imageSrc: "./assets/pioneers.svg"
            },
            "leaders": {
                label: "Leaders",
                imageSrc: "./assets/leaders.svg"
            },
            "contenders": {
                label: "Contenders",
                imageSrc: "./assets/contenders.svg"
            },
            "chasers": {
                label: "Chasers",
                imageSrc: "./assets/chasers.svg"
            },
            "followers": {
                label: "Followers",
                imageSrc: "./assets/followers.svg"
            }
        };
    
        const selectedCategory = categoryData[categoryKey];
    
        document.querySelector(".percentage").textContent = selectedCategory.label;
        document.querySelector(".category-image").src = selectedCategory.imageSrc;
    
        const categoryResult = scoreData[categoryKey];
        resultsContent.innerHTML = `
            <h2>Your Score: ${totalScore}</h2>
            <h3>${categoryResult.score_range}</h3>
            <p>${categoryResult.summary}</p>
            <h4>Next Steps:</h4>
            <div class="next-steps">
                <ul>
                    ${Object.entries(categoryResult.next_steps).map(([step, description]) => `<li class="result-content-p">${description}</li>`).join('')}
                </ul>
            </div>
        `;
    }
});
