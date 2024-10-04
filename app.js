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
    const resultsHero = document.querySelector('.results-hero'); // Added reference for hero top section

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

// Handle form submission
window.handleFormSubmit = function (event) {
    event.preventDefault(); // Prevent default form submission

    const form = document.getElementById("email-form");
    const formData = new FormData(form);

    // Convert FormData to URL-encoded string
    const data = new URLSearchParams();
    for (const pair of formData) {
        data.append(pair[0], pair[1]);
    }

    // Submit the form via fetch to Google Sheets
    const googleScriptURL = "https://script.google.com/macros/s/AKfycbxJM9AeeJfVMPNEHDbakDFtK_GmAyyhjEhWxdSISQBz1OVFiKGZHsRwJSgxVaJ5EBwB/exec";

    fetch(googleScriptURL, {
        method: "POST",
        body: data,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    })
    .then(response => {
        if (response.ok) {
            // Show success popup
            alert("Form submitted successfully!");

            // Reset the form
            form.reset();
        } else {
            alert("There was an issue submitting the form.");
        }
    })
    .catch(error => {
        console.error("Error submitting form: ", error);
        alert("There was an error submitting the form.");
    });
};

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

    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("email-form");
        
        form.addEventListener("submit", (event) => {
            event.preventDefault();  // Prevent the default form submission
            
            const formData = new FormData(form);
            const email = formData.get("Email");
            const name = formData.get("Name");
    
            fetch("https://script.google.com/a/macros/lyzr.ai/s/AKfycbxJM9AeeJfVMPNEHDbakDFtK_GmAyyhjEhWxdSISQBz1OVFiKGZHsRwJSgxVaJ5EBwB/exec", {
                method: "POST",
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    alert("Email submitted successfully!");
                    form.reset();  // Clear the form fields
                } else {
                    alert("Error submitting the form. Please try again.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error submitting the form. Please try again.");
            });
        });
    });
    
    function showResults() {
        // Reference to the element with the background
        const body = document.body; // or any other specific container element
    
        // Remove the background
        body.style.background = 'none';
    
        questionSection.classList.add("d-none");
        resultsSection.classList.remove("d-none");
        totalScore = Object.values(categoryScores).reduce((acc, categoryScore) => acc + categoryScore, 0);
    
        let categoryKey;
        if (totalScore >= 95) categoryKey = "pioneers";
        else if (totalScore >= 80) categoryKey = "leaders";
        else if (totalScore >= 65) categoryKey = "contenders";
        else if (totalScore >= 50) categoryKey = "chasers";
        else if (totalScore >= 35) categoryKey = "followers";
        else categoryKey = "laggards";
    
        const categoryData = {
            "pioneers": {
                label: "10% Pioneers",
                imageSrc: "./assets/pioneers.svg",
                color: "#12B76ACC"
            },
            "leaders": {
                label: "12% Leaders",
                imageSrc: "./assets/leaders.svg",
                color: "#0BA5ECCC"
            },
            "contenders": {
                label: "33% Contenders",
                imageSrc: "./assets/contenders.svg",
                color: "#F63D68CC"
            },
            "chasers": {
                label: "15% Chasers",
                imageSrc: "./assets/chasers.svg",
                color: "#7A5AF8CC"
            },
            "followers": {
                label: "16% Followers",
                imageSrc: "./assets/followers.svg",
                color: "#FB6514CC"
            },
            "laggards": {
                label: "14% Laggards",
                imageSrc: "./assets/laggards.svg",
                color: "#4E5BA6CC"
            }
        };
    
        const selectedCategory = categoryData[categoryKey];
    
        // Apply the dynamic font color to the label
        const percentageLabel = document.querySelector(".percentage");
        percentageLabel.textContent = selectedCategory.label;
        percentageLabel.style.color = selectedCategory.color;  // Set the font color dynamically
    
        document.querySelector(".category-image").src = selectedCategory.imageSrc;
    
        const categoryResult = scoreData[categoryKey];
        
        // Inserting the summary into .results-hero
        resultsHero.innerHTML += `<p class="d-block category-summary">${categoryResult.summary}</p>`; // Add summary to hero top

        resultsContent.innerHTML = 
            `<h2>Your Score: ${totalScore}</h2>
            <h3 class="title">Next Steps:</h3>
            <div class="next-steps">
                <div>
                    ${Object.entries(categoryResult.next_steps).map(([step, description]) => `<p class="result-content-p">${description}</p>`).join('')}
                </div>
            </div>`;
    }
    
});

