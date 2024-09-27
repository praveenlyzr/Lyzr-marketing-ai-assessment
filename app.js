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
    let categoryScores = {}; // To keep track of scores for each category
    let answeredQuestions = {}; // Keeps track of which questions have been answered

    // Fetch JSON file containing questions
    fetch('./data/questions.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            // Initialize category scores
            data["assessment-questions"].forEach(category => {
                categoryScores[category.categories] = 0;
            });

            // Add event listener to the Start button after loading data
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
        // Move to the next category or show results
        currentCategoryIndex++;
        if (currentCategoryIndex < data["assessment-questions"].length) {
            loadQuestionsForCategory();
            scrollToTop();  // Scroll to top when a new category is loaded
        } else {
            showResults();
        }
    });

    function loadQuestionsForCategory() {
        const categoryData = data["assessment-questions"][currentCategoryIndex];
        const questions = categoryData.questions;

        // Reset the state of answered questions
        answeredQuestions = {};

        // Update the category label
        categoryLabel.textContent = categoryData.categories;

        // Disable the Next button initially
        nextQuestionButton.disabled = true;

        // Clear any previous content
        answersContainer.innerHTML = '';

        // Loop through all questions in the current category
        questions.forEach((questionData, questionIndex) => {
            const questionBox = document.createElement('div');
            questionBox.classList.add('question-box');
            questionBox.id = `question-box-${questionIndex}`; // Add an ID for each question box

            // Create the question content (header and answers container)
            const questionContent = document.createElement('div');
            questionContent.classList.add('question-content');

            // Create and append the question text
            const questionText = document.createElement('h2');
            questionText.textContent = questionData.text;
            questionContent.appendChild(questionText);

            // Create and append the answers for each question
            const questionAnswersContainer = document.createElement('div');
            questionAnswersContainer.id = `answers-container-${questionIndex}`;
            questionAnswersContainer.classList.add('answers-container');

            // Loop through all answer options for the current question
            questionData.options.forEach(option => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="radio" name="answer-${questionIndex}" data-points="${option.points}"> ${option.answer}`;
                questionAnswersContainer.appendChild(label);

                // Add event listener to radio buttons to track selections
                label.querySelector('input').addEventListener('change', (event) => {
                    // Get the points of the selected answer
                    const selectedPoints = parseInt(event.target.getAttribute("data-points"));

                    // Update the score for this question
                    answeredQuestions[questionIndex] = selectedPoints;

                    checkIfAllQuestionsAnswered(); // Check if all questions are answered
                    scrollToNextQuestion(questionIndex); // Scroll to the next question when an answer is selected
                });
            });

            // Append the question content and answers container to the question box
            questionContent.appendChild(questionAnswersContainer);
            questionBox.appendChild(questionContent);

            // Append the entire question box to the answers container (main container)
            answersContainer.appendChild(questionBox);
        });

        // Update the progress bar
        updateProgressBar();
    }

    function checkIfAllQuestionsAnswered() {
        const categoryData = data["assessment-questions"][currentCategoryIndex];
        const totalQuestionsInCategory = categoryData.questions.length;

        // Enable the "Next" button only if all questions in the category have been answered
        if (Object.keys(answeredQuestions).length === totalQuestionsInCategory) {
            // Calculate the total score for the current category
            const categoryScore = Object.values(answeredQuestions).reduce((acc, points) => acc + points, 0);

            // Save the score for this category
            const currentCategory = categoryData.categories;
            categoryScores[currentCategory] = categoryScore;

            nextQuestionButton.disabled = false;
        }
    }

    function scrollToNextQuestion(currentIndex) {
        // Find the next question box
        const nextQuestionBox = document.getElementById(`question-box-${currentIndex + 1}`);
        if (nextQuestionBox) {
            // Scroll smoothly to the next question box
            nextQuestionBox.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function scrollToTop() {
        // Scroll to the top of the question section when a new category is loaded
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scroll to the top
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
        // Calculate the total score from all categories
        totalScore = Object.values(categoryScores).reduce((acc, categoryScore) => acc + categoryScore, 0);
    
        // Determine the category based on total score
        let categoryKey;
        if (totalScore >= 95) categoryKey = "pioneers";
        else if (totalScore >= 80) categoryKey = "leaders";
        else if (totalScore >= 65) categoryKey = "contenders";
        else if (totalScore >= 50) categoryKey = "chasers";
        else categoryKey = "followers";
    
        // Get category name and corresponding image based on the score
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
    
        // Get the category label and image based on the score
        const selectedCategory = categoryData[categoryKey];
    
        // Populate category label and image in the results section
        document.querySelector(".percentage").textContent = selectedCategory.label;
        document.querySelector(".category-image").src = selectedCategory.imageSrc;
    
        // Populate the rest of the content for the results
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
            <h4>Resources:</h4>
            <div class="resources">
                <ul>
                    ${categoryResult.resources.map(resource => `<li class="result-content-p">${resource}</li>`).join('')}
                </ul>
            </div>
        `;
        resultsContent.querySelectorAll('.collapsible').forEach(collapsible => {
            collapsible.addEventListener('click', function () {
                const content = this.querySelector('.collapsible-content');
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            });
        });
    }
    
    // Add click event to toggle collapsible content
    document.querySelectorAll('.collapsible').forEach(collapsible => {
        collapsible.addEventListener('click', function () {
            const content = this.querySelector('.collapsible-content');
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });
});
