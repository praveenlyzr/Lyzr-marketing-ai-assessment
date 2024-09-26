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
        // Calculate the total score from all categories
        totalScore = Object.values(categoryScores).reduce((acc, categoryScore) => acc + categoryScore, 0);

        // Hide the question section and show the results section
        questionSection.classList.add("d-none");
        resultsSection.classList.remove("d-none");

        // Display the total score and the score per category
        resultsContent.innerHTML = ''; // Clear any previous content
        
        const resultMessage = document.createElement('p');
        resultMessage.textContent = `Your overall score is: ${totalScore}`;
        resultsContent.appendChild(resultMessage);

        // Loop through all categories and display their scores
        Object.keys(categoryScores).forEach(category => {
            const categoryResult = document.createElement('p');
            categoryResult.textContent = `Category "${category}" score: ${categoryScores[category]}`;
        });

        // Customize the results based on the score
        const feedback = document.createElement('p');
        if (totalScore > 80) {
            feedback.textContent = "Great job! You have a strong understanding.";
        } else if (totalScore > 50) {
            feedback.textContent = "Good effort! There's room for improvement.";
        } else {
            feedback.textContent = "Keep learning! Practice will help you improve.";
        }

        // Append feedback to the results content section
        resultsContent.appendChild(feedback);
    }
});
