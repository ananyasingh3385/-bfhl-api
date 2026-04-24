# 🚀 BFHL API - Node Hierarchy Explorer

This project is a full-stack application that processes node relationships and builds hierarchical tree structures from given input.

---

## 🌐 Live Links

- 🔗 **Frontend (Vercel):**  
  https://bfhl-api-five-beige.vercel.app  

- 🔗 **Backend API (Render):**  
  https://bfhl-api-l66m.onrender.com/bfhl  

- 🔗 **GitHub Repository:**  
  https://github.com/ananyasingh3385/bfhl-api  

---

## 📌 Features

- Accepts node relationships (e.g., `A->B, B->C`)
- Builds hierarchical tree structures
- Identifies:
  - Root nodes
  - Cycles
  - Invalid inputs
  - Duplicate edges
- Displays results in a structured UI
- Fully deployed (Frontend + Backend)

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js

### Frontend
- HTML
- CSS
- JavaScript (Fetch API)

### Deployment
- Backend: Render
- Frontend: Vercel

---

## 📥 API Endpoint

### POST `/bfhl`

#### Request Body:
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
