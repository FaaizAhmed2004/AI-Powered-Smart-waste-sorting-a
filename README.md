♻️ AI-Powered Smart Waste Sorting (MERN + Python)

An intelligent web-based waste classification system that helps users identify and sort waste using AI. This project combines the MERN stack with a TensorFlow/Keras model to promote sustainable recycling habits through automation and gamification.

🚧 Project Status

⚠️ This project is currently under development
✔️ Core structure and partial features implemented
🔄 Remaining features are in progress (see TODO section below)

🎯 Purpose
Classify waste into categories (Plastic, Metal, Paper, Organic, etc.)
Encourage recycling through gamification (points, badges, leaderboard)
Provide insights and analytics for user contributions
Build a scalable AI-powered environmental solution
🏗️ Architecture Overview
Frontend (React)
        ↓
Backend API (Node.js + Express)
        ↓
Inference Service (Flask + TensorFlow Model)
        ↓
Database (MongoDB)
📁 Folder Structure
project-root/
│
├── frontend/          # React app (UI)
├── backend/           # Node.js + Express API
├── inference/         # Flask AI prediction service
├── model/             # Training scripts & saved model
├── docker-compose.yml
└── README.md
⚙️ Tech Stack
💻 Frontend
React.js
Tailwind CSS
Chart.js / Recharts
🧠 Backend
Node.js
Express.js
MongoDB (Mongoose)
🤖 AI / ML
Python
TensorFlow / Keras
Flask (Inference API)
🚀 DevOps
Docker & Docker Compose
GitHub Actions (planned)
Vercel / Railway (deployment planned)
✅ Features Implemented
✔️ Basic project structure (MERN + Python)
✔️ Backend API setup (Express + MongoDB)
✔️ Image upload endpoint (partial)
✔️ Flask inference service (basic setup)
✔️ Initial React UI (Upload component)
✔️ Database schemas (User, Prediction)
🔄 Features In Progress (TODO)
🧠 AI & Backend
 Complete model training (train.py)
 Improve prediction accuracy
 Connect backend with inference service
 Add authentication (JWT)
🎨 Frontend
 Dashboard UI (analytics & charts)
 User profile with points & badges
 Upload preview & result display
🎮 Gamification
 Points system integration
 Achievement badges
 Leaderboard (global & weekly)
📊 Analytics
 Waste statistics (per category)
 User activity tracking
 CO₂ savings estimation
🌍 Community Features
 Recycling centers map
 User-submitted locations
 Weekly eco challenges
🛡️ Quality & Security
 Anti-spam limits
 Flagging system for wrong predictions
 Admin moderation panel
🚀 DevOps & Deployment
 Dockerfiles for all services
 Full docker-compose setup
 CI/CD pipeline (GitHub Actions)
 Deployment (Vercel + Railway + MongoDB Atlas)
🧪 API Example
Upload & Predict Waste
POST /api/upload

Request:

Image file

Response:

{
  "label": "Plastic",
  "confidence": 0.87
}
🗄️ Database Models
User
name
email
password
points
badges[]
Prediction
user
image
label
confidence
flagCount
createdAt

🎮 Gamification Overview
🟢 +10 points → High confidence predictions (>70%)
🟡 +5 points → Medium confidence (50–70%)
🔴 -2 points → Incorrect/flagged results
🏆 Badges
Starter Recycler
Sustainability Hero
Eco Helper
Community Leader
Streak Master
🐳 Run Locally (Docker)
docker-compose up --build

Services:

Frontend → http://localhost:3000
Backend → http://localhost:4000
Inference → http://localhost:5000

 TO RUN :
 Frontend : npm i  
 cd ai-waste-sort
  npm run dev 
 backend : cd backend /base_server/npm run start:dev
model AI : unicorn main --reload


📅 Development Timeline
Phase	Status
Planning & Research	✅ Completed
Model Development	🔄 In Progress
Backend Development	🔄 In Progress
Frontend Development	🔄 In Progress
Integration & Testing	⏳ Pending

Deployment	⏳ Pending
🔮 Future Enhancements
📱 AR-based real-time waste detection
🔗 Blockchain-based eco reward system
🤖 AI chatbot for recycling guidance
📌 Next Steps
Train and optimize ML model
Connect full pipeline (Frontend → Backend → AI)
Implement gamification system
Deploy MVP version

🤝 Contribution

This project is currently in active development. Contributions, ideas, and feedback are welcome!

📜 License

MIT License

👨‍💻 Author

Faaiz Ahmed
MERN Stack Developer | Exploring AI & Blockchain