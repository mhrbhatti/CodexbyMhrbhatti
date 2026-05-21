# CS MCQ Platform

A full-stack Computer Science MCQ test platform for classes 9–12 (Pakistan curriculum).
Built with **React**, **Node.js/Express**, and **MongoDB**.

---

## Project Structure

```
mcq-app/
├── backend/
│   ├── models/
│   │   ├── User.js          # Student model (auth)
│   │   ├── MCQ.js           # MCQ question model
│   │   └── Result.js        # Test result model
│   ├── routes/
│   │   ├── auth.js          # Login / Register / Me
│   │   ├── classes.js       # Available classes
│   │   ├── chapters.js      # Chapters per class
│   │   ├── mcqs.js          # Fetch MCQs + submit answers
│   │   └── results.js       # Save & fetch results
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── server.js            # Express entry point
│   ├── seed.js              # Seed DB with CS MCQs + demo user
│   ├── .env.example         # Environment variables template
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js   # Global auth state
        ├── services/
        │   └── api.js           # Axios API calls
        ├── components/
        │   ├── Layout.js        # Navbar + outlet
        │   └── Layout.css
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── DashboardPage.js  # Stats + recent results
        │   ├── SelectClassPage.js
        │   ├── SelectChapterPage.js
        │   ├── TestPage.js       # MCQ test with per-question timer
        │   ├── ResultPage.js     # Score ring + wrong answer review
        │   └── HistoryPage.js    # All past tests
        ├── App.js
        ├── index.js
        └── index.css
```

---

## Quick Start

### 1. Prerequisites

- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

---

### 2. Backend Setup

```bash
cd mcq-app/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET

# Seed the database (adds 50+ MCQs + demo student)
npm run seed

# Start the server
npm run dev        # development (nodemon)
# or
npm start          # production
```

Server runs on **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd mcq-app/frontend

# Install dependencies
npm install

# Start the React app
npm start
```

App runs on **http://localhost:3000**

---

## Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mcq_platform
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

---

## Demo Account

After running the seed script:

| Field    | Value              |
|----------|--------------------|
| Email    | demo@student.com   |
| Password | demo1234           |
| Class    | 9                  |

---

## MongoDB Data Structure

### MCQ Document
```json
{
  "class": "9",
  "subject": "Computer Science",
  "chapterNo": 1,
  "chapterName": "Introduction to Computer",
  "question": "Which of the following is the brain of the computer?",
  "options": { "a": "Hard Disk", "b": "CPU", "c": "RAM", "d": "Monitor" },
  "correctAnswer": "b",
  "explanation": "CPU processes all instructions...",
  "difficulty": "easy"
}
```

### Adding Your Own MCQs

Insert directly via MongoDB shell or any MongoDB GUI (Compass, Studio 3T):

```js
db.mcqs.insertOne({
  class: "10",
  subject: "Computer Science",
  chapterNo: 1,
  chapterName: "Information Networks",
  question: "Your question here?",
  options: { a: "Option A", b: "Option B", c: "Option C", d: "Option D" },
  correctAnswer: "a",
  explanation: "Optional explanation",
  difficulty: "medium"   // easy | medium | hard
})
```

Or POST to `/api/mcqs` with a valid JWT token.

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register student |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/update-class` | Update enrolled class |
| GET | `/api/classes` | All available classes |
| GET | `/api/chapters/:class` | Chapters for a class |
| GET | `/api/mcqs/:class/:chapterNo` | MCQs (no correct answers) |
| POST | `/api/mcqs/submit` | Submit answers, get result |
| POST | `/api/results` | Save a result |
| GET | `/api/results` | Student's result history |
| GET | `/api/results/:id` | Single result detail |

All routes except register/login require `Authorization: Bearer <token>` header.

---

## Features

- Student registration and login with JWT
- Class selection (9, 10, 11, 12)
- Chapter selection with MCQ count
- Per-question countdown timer (60 seconds)
- Question navigation map (desktop sidebar)
- Skip questions and come back
- Submit test with confirmation dialog
- Score ring with percentage display
- Correct / Wrong / Skipped breakdown
- Wrong answer review with correct answers revealed
- Full question-by-question review tab
- Test history with class filter
- Mobile-first responsive design
- Dark theme throughout

---

## Deployment Notes

### Backend (e.g. Railway, Render)
1. Set environment variables in dashboard
2. Set `CLIENT_URL` to your frontend domain
3. Use MongoDB Atlas URI for `MONGODB_URI`

### Frontend (e.g. Vercel, Netlify)
1. Set `REACT_APP_API_URL=https://your-backend.com/api`
2. `npm run build` and deploy the `build/` folder

---
