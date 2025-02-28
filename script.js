// DOM Elements
const fileUpload = document.getElementById('file-upload');
const browseBtn = document.getElementById('browse-btn');
const dropZone = document.getElementById('drop-zone');
const fileList = document.getElementById('file-list');
const markdownInput = document.getElementById('markdown-input');
const parseBtn = document.getElementById('parse-btn');
const startQuizBtn = document.getElementById('start-quiz-btn');
const spinner = document.getElementById('spinner');
const questionCountEl = document.getElementById('question-count');
const categoriesListEl = document.getElementById('categories-list');
const categoryFiltersEl = document.getElementById('category-filters');
const quizContainer = document.getElementById('quiz-container');
const quizSetup = document.getElementById('quiz-setup');
const inputSection = document.getElementById('input-section');

// Quiz Elements
const questionText = document.getElementById("question-text");
const imageContainer = document.getElementById("image-container");
const codeContainer = document.getElementById("code-container");
const choicesContainer = document.getElementById("choices");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("total-questions");
const categoryIndicator = document.getElementById("category-indicator");
const startOverBtn = document.getElementById("start-over-btn");
const quizSummary = document.getElementById("quiz-summary");
const restartQuizBtn = document.getElementById("restart-quiz-btn");
const returnSetupBtn = document.getElementById("return-setup-btn");

// Store uploaded files
const uploadedFiles = {
    markdown: null,
    images: {}
};

// Remove sample loaders and sample data

// Quiz state variables
let extractedQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let categories = [];
let selectedCategory = 'all';
let userAnswers = [];  // Track user answers and correctness

// Handle file upload via button
browseBtn.addEventListener('click', function() {
    fileUpload.click();
});

// Handle selected files
fileUpload.addEventListener('change', function(e) {
    handleFiles(e.target.files);
});

// Handle drag and drop
dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropZone.classList.add('highlight');
});

dropZone.addEventListener('dragleave', function() {
    dropZone.classList.remove('highlight');
});

dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropZone.classList.remove('highlight');
    
    let files = [];
    if (e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
            if (e.dataTransfer.items[i].kind === 'file') {
                files.push(e.dataTransfer.items[i].getAsFile());
            }
        }
    } else {
        files = e.dataTransfer.files;
    }
    
    handleFiles(files);
});

// Process uploaded files
function handleFiles(files) {
    // Clear previous files
    fileList.innerHTML = '';
    uploadedFiles.markdown = null;
    uploadedFiles.images = {};
    
    // Process each file
    Array.from(files).forEach(file => {
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        
        // Create list item for file
        const li = document.createElement('li');
        const fileIcon = document.createElement('span');
        fileIcon.className = 'file-icon';
        
        // Process by file type
        if (fileExtension === 'md') {
            fileIcon.textContent = '📄';
            fileIcon.className += ' md-file';
            uploadedFiles.markdown = file;
            
            // Read markdown content
            const reader = new FileReader();
            reader.onload = function(e) {
                markdownInput.value = e.target.result;
            };
            reader.readAsText(file);
        } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension)) {
            fileIcon.textContent = '🖼️';
            fileIcon.className += ' image-file';
            
            // Store image file for later use
            uploadedFiles.images[fileName] = file;
            
            // Process image file to get URL
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedFiles.images[fileName].url = e.target.result;
            };
            reader.readAsDataURL(file);
        }
        
        // Build file list item
        li.appendChild(fileIcon);
        li.appendChild(document.createTextNode(' ' + fileName));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', function() {
            if (fileExtension === 'md') {
                uploadedFiles.markdown = null;
                markdownInput.value = '';
            } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension)) {
                delete uploadedFiles.images[fileName];
            }
            li.remove();
        });
        
        li.appendChild(deleteBtn);
        fileList.appendChild(li);
    });
}

// Parse markdown button click handler
parseBtn.addEventListener('click', parseMarkdown);

// Parse the markdown to extract questions
function parseMarkdown() {
    spinner.style.display = 'block';
    
    // Clear previous data
    extractedQuestions = [];
    categories = [];
    
    setTimeout(() => {
        const markdown = markdownInput.value;
        const questions = extractQuestionsFromMarkdown(markdown);
        
        extractedQuestions = questions;
        
        // Count questions
        questionCountEl.textContent = questions.length;
        
        // Extract unique categories
        categories = [];
        const categoryMap = {};
        
        questions.forEach(q => {
            if (!categoryMap[q.category]) {
                categoryMap[q.category] = true;
                categories.push(q.category);
            }
        });
        
        // Sort categories alphabetically
        categories.sort();
        
        // Add "All Categories" at the beginning
        categories.unshift('all');
        
        // Display categories
        categoriesListEl.innerHTML = '';
        Object.keys(categoryMap).forEach(cat => {
            const catCount = questions.filter(q => q.category === cat).length;
            const li = document.createElement('li');
            li.textContent = `${cat}: ${catCount} questions`;
            categoriesListEl.appendChild(li);
        });
        
        // Generate category filter buttons
        categoryFiltersEl.innerHTML = '';
        
        // Add category selection header
        const header = document.createElement('h3');
        header.textContent = 'Select Categories:';
        header.style.width = '100%';
        header.style.margin = '5px 0';
        categoryFiltersEl.appendChild(header);
        
        // Create filter buttons for each category
        categories.forEach(cat => {
            const button = document.createElement('button');
            button.className = 'filter-btn' + (cat === 'all' ? ' active' : '');
            button.textContent = cat === 'all' ? 'All Categories' : cat;
            button.dataset.category = cat;
            
            button.addEventListener('click', () => {
                if (cat === 'all') {
                    // When "All Categories" is clicked, deselect other categories
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.dataset.category === 'all') {
                            btn.classList.add('active');
                        }
                    });
                } else {
                    // Deselect "All Categories" when a specific category is clicked
                    document.querySelector('.filter-btn[data-category="all"]').classList.remove('active');
                    
                    // Toggle this category
                    button.classList.toggle('active');
                    
                    // If no categories are selected, select "All Categories" again
                    if (!document.querySelector('.filter-btn.active')) {
                        document.querySelector('.filter-btn[data-category="all"]').classList.add('active');
                    }
                }
            });
            
            categoryFiltersEl.appendChild(button);
        });
        
        // Enable start quiz button
        startQuizBtn.disabled = questions.length === 0;
        
        spinner.style.display = 'none';
    }, 100);
}

// Extract questions, choices, and correct answers from markdown
function extractQuestionsFromMarkdown(markdown) {
    // First separate the markdown into top-level sections by headers
    const topLevelSections = markdown.split(/^# /m).filter(section => section.trim());
    const questions = [];
    
    // Process each top-level section
    topLevelSections.forEach((section) => {
        // Get the category name (first line of the section)
        let categoryLines = section.split('\n');
        let mainCategory = categoryLines[0] ? categoryLines[0].trim() : 'Uncategorized';
        
        // Look for question blocks within the section
        const questionBlockRegex = /\*\*([^*]+)\*\*([\s\S]*?)(?=\n\s*\*\*|$)/g;
        let questionMatch;
        
        // Find all question blocks in this section
        while ((questionMatch = questionBlockRegex.exec(section)) !== null) {
            let questionText = questionMatch[1].trim();
            let choicesBlock = questionMatch[2].trim();
            
            // Process images in question text
            const imageRegex = /!\[.*?\]\(([^)]+)\)/g;
            const images = [];
            let imgMatch;
            
            while ((imgMatch = imageRegex.exec(questionText)) !== null) {
                images.push(extractImage(imgMatch[1]));
            }
            
            // Remove image references from question text
            questionText = questionText.replace(/!\[.*?\]\([^)]+\)/g, '').trim();
            
            // Find images in choices block
            while ((imgMatch = imageRegex.exec(choicesBlock)) !== null) {
                images.push(extractImage(imgMatch[1]));
            }
            
            // Process code blocks
            const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
            let code = null;
            let codeMatch;
            
            if ((codeMatch = codeBlockRegex.exec(choicesBlock)) !== null) {
                code = codeMatch[1].trim();
                choicesBlock = choicesBlock.replace(codeBlockRegex, '');
            }

            // Parse the choices block line by line
            const choiceLines = choicesBlock.split('\n');
            
            // Collect each complete choice with any multi-line text
            const rawChoices = [];
            let currentChoice = '';
            let inChoice = false;
            
            for (let i = 0; i < choiceLines.length; i++) {
                const line = choiceLines[i].trim();
                
                // Check if this line starts a new choice
                if (line.match(/^[-*] /)) {
                    // If we were already building a choice, save it
                    if (inChoice && currentChoice) {
                        rawChoices.push(currentChoice);
                    }
                    
                    // Start a new choice
                    currentChoice = line.substring(2);
                    inChoice = true;
                } else if (inChoice && line) {
                    // Continue building the current choice
                    currentChoice += ' ' + line;
                }
            }
            
            // Add the last choice if there is one
            if (inChoice && currentChoice) {
                rawChoices.push(currentChoice);
            }

            // Now parse each raw choice to find the correct answer and clean up formatting
            const choices = [];
            let correctAnswer = null;
            
            // DEBUG: Print all raw choices
            console.log("Raw choices:", rawChoices);
            
            // NEW IMPROVED DETECTION ALGORITHM
            rawChoices.forEach((choice, index) => {
                // Search for checkmark ANYWHERE in the option text
                const hasCheckmark = choice.includes('✅');
                
                // Remove checkmark for display purposes
                let cleanedChoice = choice.replace(/✅/g, '').trim();
                
                // Also check for bold text (as fallback)
                const hasBold = choice.includes('**');
                
                // Clean up bold markers from text
                cleanedChoice = cleanedChoice.replace(/\*\*/g, '').trim();
                
                // Add cleaned choice to the array
                choices.push(cleanedChoice);
                
                // First priority: Checkmark
                if (hasCheckmark) {
                    console.log(`Found checkmark in option ${index}: "${choice}"`);
                    correctAnswer = index;
                } 
                // Second priority: Bold (if no checkmark found yet)
                else if (hasBold && correctAnswer === null) {
                    console.log(`Found bold in option ${index}: "${choice}"`);
                    correctAnswer = index;
                }
            });
            
            // Fallback to first option if no correct answer identified
            if (correctAnswer === null) {
                correctAnswer = 0;
                console.warn(`No correct answer marker found. Using first option as default for: ${questionText}`);
            }
            
            console.log(`Selected correct answer: ${correctAnswer}`);
            
            // Check if we have valid question with choices
            if (questionText && choices.length > 0) {
                // Find the subheading/category context
                const questionContext = section.substring(0, questionMatch.index).trim();
                let subCategory = null;
                
                // Try to find a subheading
                const subheadingMatch = questionContext.match(/##\s+([^#\n]+)(?!.*##)/);
                if (subheadingMatch) {
                    subCategory = subheadingMatch[1].trim();
                }
                
                // Create question object
                questions.push({
                    question: questionText,
                    choices: choices,
                    correctAnswer: correctAnswer,
                    category: (subCategory || mainCategory || 'Uncategorized'),
                    image: images.length > 0 ? images : null,
                    code: code
                });
            }
        }
    });
    
    return questions;
}

// Process image reference to get URL
function extractImage(imageName) {
    // Clean up the image name - remove encoding like %20
    const cleanedImageName = decodeURIComponent(imageName);
    
    // Check if we have this image in our uploaded files
    const exactMatch = uploadedFiles.images[cleanedImageName];
    if (exactMatch && exactMatch.url) {
        return exactMatch.url;
    }
    
    // If not exact match, try to match by the file name without path
    const fileName = cleanedImageName.split('/').pop();
    for (const [key, imageFile] of Object.entries(uploadedFiles.images)) {
        if (key.endsWith(fileName) && imageFile.url) {
            return imageFile.url;
        }
    }
    
    // If not found in uploads, return the original name (might be a remote URL)
    return imageName;
}

// Start the quiz
startQuizBtn.addEventListener('click', startQuiz);

function startQuiz() {
    // Get selected categories
    const selectedCategoryButtons = document.querySelectorAll('.filter-btn.active');
    const selectedCategories = Array.from(selectedCategoryButtons).map(btn => btn.dataset.category);
    
    // Filter questions by selected categories
    if (selectedCategories.includes('all')) {
        currentQuestions = extractedQuestions;
    } else {
        currentQuestions = extractedQuestions.filter(q => selectedCategories.includes(q.category));
    }
    
    // Shuffle the questions
    shuffleArray(currentQuestions);
    
    // Update UI
    totalQuestionsSpan.textContent = currentQuestions.length;
    currentQuestionIndex = 0;
    
    // Show quiz container and hide setup
    quizContainer.style.display = 'block';
    quizSetup.style.display = 'none';
    inputSection.style.display = 'none';
    
    // Reset user answers
    userAnswers = Array(currentQuestions.length).fill(null);
    
    // Show first question
    showQuestion(0);
    updateNavButtons();
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) { // Changed i++ to i--
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Display current question
function showQuestion(index) {
    if (currentQuestions.length === 0) return;
    
    const question = currentQuestions[index];
    questionText.innerHTML = question.question;
    
    // Clear previous content
    imageContainer.innerHTML = "";
    codeContainer.innerHTML = "";
    choicesContainer.innerHTML = "";
    feedback.innerHTML = "";
    feedback.className = "";
    
    // Display category
    categoryIndicator.textContent = `Category: ${question.category}`;
    
    // Display images if any
    if (question.image) {
        if (Array.isArray(question.image)) {
            question.image.forEach(img => {
                const imgElement = document.createElement("img");
                imgElement.src = img; // Works for both URLs and data URLs
                imgElement.alt = "Question image";
                imageContainer.appendChild(imgElement);
            });
        } else {
            const imgElement = document.createElement("img");
            imgElement.src = question.image;
            imgElement.alt = "Question image";
            imageContainer.appendChild(imgElement);
        }
    }
    
    // Display code if any
    if (question.code) {
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = question.code;
        pre.appendChild(code);
        codeContainer.appendChild(pre);
    }
    
    // Create shuffled choices array with original indices
    const shuffledChoices = question.choices.map((choice, index) => ({
        text: choice,
        originalIndex: index
    }));
    
    // Shuffle the choices
    shuffleArray(shuffledChoices);
    
    // Store the shuffled choices and correct answer mapping
    questionText.dataset.correctAnswerIndex = question.correctAnswer;
    
    // Create answer choices
    shuffledChoices.forEach((choice, choiceIndex) => {
        const button = document.createElement("button");
        button.className = "choice-btn";
        button.innerHTML = choice.text;
        button.dataset.index = choiceIndex;
        button.dataset.originalIndex = choice.originalIndex;
        
        button.addEventListener("click", () => {
            selectAnswer(button);
        });
        
        choicesContainer.appendChild(button);
    });
    
    // Update question counter
    currentQuestionSpan.textContent = index + 1;
}

// Handle answer selection - modified to work with shuffled choices
function selectAnswer(selectedButton) {
    const question = currentQuestions[currentQuestionIndex];
    const correctAnswerIndex = parseInt(questionText.dataset.correctAnswerIndex);
    const allChoiceButtons = document.querySelectorAll(".choice-btn");
    
    // Reset all buttons
    allChoiceButtons.forEach(btn => {
        btn.classList.remove("selected", "correct", "incorrect");
    });
    
    selectedButton.classList.add("selected");
    
    // Check if answer is correct by comparing original indices
    const selectedOriginalIndex = parseInt(selectedButton.dataset.originalIndex);
    const isCorrect = selectedOriginalIndex === correctAnswerIndex;
    
    // Store user's answer
    userAnswers[currentQuestionIndex] = {
        questionIndex: currentQuestionIndex,
        selectedAnswer: selectedOriginalIndex,
        isCorrect: isCorrect
    };
    
    if (isCorrect) {
        feedback.innerHTML = "Correct! Well done!";
        feedback.className = "correct";
        selectedButton.classList.add("correct");
    } else {
        // Show detailed feedback
        const correctChoice = question.choices[correctAnswerIndex];
        feedback.innerHTML = `Incorrect. The correct answer is: "${correctChoice}"`;
        feedback.className = "incorrect";
        selectedButton.classList.add("incorrect");
        
        // Highlight correct answer
        allChoiceButtons.forEach(btn => {
            if (parseInt(btn.dataset.originalIndex) === correctAnswerIndex) {
                btn.classList.add("correct");
            }
        });
        
        // Log debug info
        console.log("Question with issue:", question);
    }
    
    // If this is the last question, change next button text
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextBtn.textContent = "Finish Quiz";
    } else {
        nextBtn.textContent = "Next Question";
    }
    
    // Enable next button
    nextBtn.disabled = false;
}

// Define updateNavButtons earlier in the file, before it's called
function updateNavButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = true; // Will be enabled after selecting an answer
}

// Navigate to next question
function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
        updateNavButtons();
        nextBtn.disabled = true;
    } else {
        // If on last question and answered, show summary
        showQuizSummary();
    }
}

// Navigate to previous question
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
        updateNavButtons();
        nextBtn.disabled = false;
    }
}

// Show quiz summary
function showQuizSummary() {
    // Hide quiz container
    quizContainer.style.display = 'none';
    
    // Show summary container
    quizSummary.style.display = 'block';
    
    // Calculate stats
    const totalAnswered = userAnswers.filter(a => a !== null).length;
    const correctAnswers = userAnswers.filter(a => a && a.isCorrect).length;
    const scorePercentage = Math.round((correctAnswers / totalAnswered) * 100);
    
    // Update summary stats
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('total-answered').textContent = totalAnswered;
    document.getElementById('score-percentage').textContent = scorePercentage;
    
    // Generate list of wrong answers
    const wrongQuestionsList = document.getElementById('wrong-questions-list');
    wrongQuestionsList.innerHTML = '';
    
    userAnswers.forEach((answer, index) => {
        if (answer && !answer.isCorrect) {
            const question = currentQuestions[index];
            const wrongAnswerDiv = document.createElement('div');
            wrongAnswerDiv.className = 'wrong-answer-item';
            
            const questionText = document.createElement('p');
            questionText.className = 'wrong-question-text';
            questionText.textContent = question.question;
            
            const correctText = document.createElement('p');
            correctText.className = 'correct-answer-text';
            correctText.textContent = `Correct answer: ${question.choices[question.correctAnswer]}`;
            
            const yourText = document.createElement('p');
            yourText.className = 'your-answer-text';
            yourText.textContent = `Your answer: ${question.choices[answer.selectedAnswer]}`;
            
            wrongAnswerDiv.appendChild(questionText);
            wrongAnswerDiv.appendChild(correctText);
            wrongAnswerDiv.appendChild(yourText);
            
            wrongQuestionsList.appendChild(wrongAnswerDiv);
        }
    });
}

// Start over - go back to input page
function startOver() {
    quizContainer.style.display = 'none';
    quizSummary.style.display = 'none';
    quizSetup.style.display = 'block';
    inputSection.style.display = 'block';
}

// Add event listeners for navigation buttons
nextBtn.addEventListener("click", nextQuestion);
prevBtn.addEventListener("click", prevQuestion);
startOverBtn.addEventListener("click", startOver);

// Fix event listeners for summary buttons
restartQuizBtn.addEventListener("click", function() {
    // Reset quiz state
    userAnswers = Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;
    
    // Hide summary and show quiz
    quizSummary.style.display = 'none';
    quizContainer.style.display = 'block';
    
    // Show first question
    showQuestion(0);
    updateNavButtons();
    nextBtn.textContent = "Next Question";
});

returnSetupBtn.addEventListener("click", function() {
    // Call the startOver function directly
    startOver();
});