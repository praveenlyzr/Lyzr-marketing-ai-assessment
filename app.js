document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-btn");
    const startSection = document.getElementById("start-section");
    const questionSection = document.getElementById("question-section");
    const questionText = document.getElementById("question-text");
    const answersContainer = document.getElementById("answers-container");
    const nextQuestionButton = document.getElementById("next-question-btn");
    const progressBar = document.querySelector('.progress-bar');
    const categoryLabel = document.getElementById("category-label");
    const progressPercentage = document.querySelector('.progress-percentage');

    let data = {};
    let currentCategoryIndex = 0;
    let currentQuestionIndex = 0;
    let totalScore = 0;

    // Fetch JSON file containing questions
    fetch('./data/questions.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            // Add event listener to the Start button after loading data
            startButton.addEventListener("click", () => {
                startSection.classList.add("d-none");
                questionSection.classList.remove("d-none");
                loadQuestion();
            });
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
        });

    nextQuestionButton.addEventListener("click", () => {
        // Calculate score
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (selectedOption) {
            totalScore += parseInt(selectedOption.getAttribute("data-points"));
        }

        currentQuestionIndex++;

        // Check if more questions are available in the current category
        if (currentQuestionIndex < data["assessment-questions"][currentCategoryIndex].questions.length) {
            loadQuestion();
        } else {
            currentCategoryIndex++;
            currentQuestionIndex = 0;

            // Check if there are more categories
            if (currentCategoryIndex < data["assessment-questions"].length) {
                loadQuestion();
            } else {
                showResults();
            }
        }
    });

    function loadQuestion() {
        const categoryData = data["assessment-questions"][currentCategoryIndex];
        const questionData = categoryData.questions[currentQuestionIndex];

        // Update the category label
        categoryLabel.textContent = categoryData.categories;

        // Update the question text
        questionText.textContent = questionData.text;

        // Clear previous answers and load new ones
        answersContainer.innerHTML = '';
        questionData.options.forEach(option => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="radio" name="answer" data-points="${option.points}"> ${option.answer}`;
            answersContainer.appendChild(label);
        });

        // Update the progress bar and percentage
        const totalQuestions = data["assessment-questions"].reduce((sum, category) => sum + category.questions.length, 0);
        const currentQuestionNumber = data["assessment-questions"].slice(0, currentCategoryIndex).reduce((sum, category) => sum + category.questions.length, 0) + currentQuestionIndex + 1;
        const progress = Math.round((currentQuestionNumber / totalQuestions) * 100);
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        progressPercentage.textContent = `${progress}%`;
    }

    function showResults() {
        questionSection.classList.add("d-none");
        document.getElementById("results-section").classList.remove("d-none");
        console.log("Total Score: ", totalScore);  // You can use this score to show specific results
    }
});
