# Notion-Markdown-Quiz-Generator

A browser-based tool that converts Notion markdown exports into interactive quizzes. Perfect for creating study materials, practice tests, and self-assessments from your Notion notes.

## Features

- 📝 Converts Notion markdown into interactive quiz questions
- 📊 Supports multiple question categories
- 🖼️ Displays images in questions and answers
- 💻 Renders code blocks with syntax formatting
- 🔄 Multi-category selection for customized quizzes
- 🎲 Randomization of questions and answer choices
- 📱 Responsive design for desktop and mobile use

![image](https://github.com/user-attachments/assets/a10938f3-79d9-495a-b090-a6e5eb010128)
![image](https://github.com/user-attachments/assets/bac64c7e-25a6-49ff-ad4a-05fa703c96d0)

## How to Use

### Step 1: Import Your Notion Export

1. Open the Notion Quiz Generator
2. Drag and drop your exported `.md` files and images onto the drop zone or the entire zip file
   - Or click "Browse Files" to select them manually
3. The markdown content will automatically load in the text area
   - You can also paste markdown directly into the text area

### Step 2: Parse Questions

1. Click the "Parse Questions" button
2. The tool will analyze your markdown and extract questions
3. You'll see statistics about the number of questions and categories found

### Step 3: Configure Your Quiz

1. Select which categories to include in your quiz
   - Use "All Categories" to include everything
   - Or select specific categories to focus on certain topics
2. Click "Start Quiz" to begin

### Step 4: Take the Quiz

1. Answer questions by selecting a choice
2. Get immediate feedback on your answers
3. Navigate through questions with "Next" and "Previous" buttons
4. Start over anytime with the "Start Over" button

## Markdown Format Requirements

For the tool to properly detect questions, format your Notion export exactly as follows:
### Question will not be formatted properly if there is a "*" in the question
### Basic Question Format

```markdown
**What is the capital of France?**
- London
- Berlin
- **Paris** ✅
- Madrid
```

The basic format consists of:
- Question text wrapped in **bold**
- Answer choices starting with hyphens (-)
- Correct answer marked with **bold** and ✅
- One blank line between questions
- If Question has image, image must placed between question and answer options

Example with code:
```markdown
**What does this Python code output?**
print("Hello" * 3)

- HelloHelloHello
- **HelloHelloHello** ✅
- Hello Hello Hello
- Error
```

Example with image:
```markdown
**What animal is shown in this image?**
![cat.png](cat.png)
- Dog
- Bird
- **Cat** ✅
- Fish
```

### Categories

#### Questions are automatically categorized based on their location in the Notion document:
![image](https://github.com/user-attachments/assets/b4e23cdf-5a68-4795-9368-0eca5be1b830)

1. **Heading-based categories:**
```markdown
# SQL Basics
**What does SELECT do?**
- Option 1
- **Option 2** ✅

## Joins
**What is an INNER JOIN?**
- Option 1 
- **Option 2** ✅
```

2. **Toggle/Dropdown-based categories:**
```markdown
> 🗂️ Python Fundamentals
    **What is a variable?**
    - Option 1
    - **Option 2** ✅

> 🗂️ Python Advanced
    **What is a decorator?**
    - Option 1
    - **Option 2** ✅
```

The tool will:
- Use the nearest heading (#, ##, ###) above a question as its category
- Use toggle/dropdown block titles as categories
- Display category filters in the quiz interface
- Allow filtering questions by one or multiple categories
