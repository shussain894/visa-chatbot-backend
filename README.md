# 🇬🇧 UK Visa Eligibility Chatbot (Backend)

This is a simple chatbot API that helps users check if they need a UK visa or a tuberculosis (TB) test based on their visa type and country of origin. It supports rule-based logic and optionally falls back to a local LLM (llama3) for natural conversation flow.

---

## 🧠 Features

- Determines UK visa requirements (e.g., tourist, work, family)
- Checks if a TB test is needed for visa applications
- Uses MongoDB seed data for visa and country rules
- Asks follow-up questions to collect missing details
- Optionally integrates with a local LLaMA model for fallback responses
- Stores conversation sessions to keep chat context

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/visa-chatbot-backend.git
cd visa-chatbot-backend
```

### 2. Install Dependancies
```bash
npm install
```

### 3. Setup MongoDB (macOS)
1. Install Homebrew (if you don’t have it yet):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Install MongoDB Community Edition
```bash
brew install mongodb-community@7.0
```

3. Start MongoDB Server
```bash
brew services start mongodb-community@7.0
```

4. Verify MongoDB is Running
```bash
mongosh
```

### 4. Configure Your App
Create a .env file in the project root with this line:
```bash
MONGO_URI=mongodb://localhost:27017/visa_rules_db
```

### 5. Seed the Database
```bash
node seed.js
```

### 6. Run the Server
```bash
node index.js
```
Server runs at:
```bash
http://localhost:5000
```

### 7. LLM Fallback with LLaMA

When country or visa type can't be matched, the chatbot will optionally use a local LLaMA model.

1. Install Ollama:

Download and install from: [https://ollama.com](https://ollama.com)

2. Pull the model:

```bash
ollama pull llama3
```

3. Run Llama3:
```bash
ollama run llama3
```

4. Run Ollama server:
```bash
ollama serve
```
Once Ollama is running, the backend will automatically query it when needed.

### 8. Frontend

1. Now clone the frontend here (https://github.com/shussain894/visa-chatbot-frontend) and follow the instructions

Example Messages to Test
- "I’m a tourist from France" → Visa not required, no TB test

- "I'm from South Africa" → Visa required, TB test required

- "I want to work in the UK" → Work visa logic

- "Can I visit family from Nigeria?" → Family visa, visa required, TB test required






