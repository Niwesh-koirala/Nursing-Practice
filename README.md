# Nursing Test Prep CSV Version

This version does **not** ask the user to upload a file.

## How it works
- The app automatically loads `questions.csv`
- The user chooses how many questions to practice
- The app randomly selects that many questions
- The user submits the exam
- The app shows:
  - correct answers
  - incorrect answers
  - percentage score
  - flagged count
  - time used
  - optional rationales

## Required files
- `index.html`
- `styles.css`
- `script.js`
- `questions.csv`

Keep all four files in the same folder.

## CSV format
Your CSV should look like this:

```csv
id,question,option1,option2,option3,option4,correctAnswer,rationale
1,"Question text","Choice A","Choice B","Choice C","Choice D",3,"Why answer 3 is correct"
```

## correctAnswer values
Use:
- `1` for option1
- `2` for option2
- `3` for option3
- `4` for option4

## GitHub Pages
1. Upload all files to your GitHub repo
2. Turn on GitHub Pages in repo settings
3. Share the link

## Local testing note
Because the app uses `fetch('questions.csv')`, some browsers block it when opening `index.html` directly from your computer with a `file://` path.

Best ways to test:
- use GitHub Pages, or
- use VS Code Live Server, or
- run a simple local server
