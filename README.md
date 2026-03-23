# MPI-Project

> A modern stock & crypto tracking platform that provides real-time insights, portfolio management, and analytics for investors.

---

# 1. Description and Objectives

This application solves the problem of **fragmented financial tracking**. Most users use multiple platforms to monitor stocks, cryptocurrencies, and portfolios, which leads to inefficiency and lack of clarity.

Our app centralizes everything into a single dashboard where users can:
- Track stock and crypto prices
- Manage their portfolio
- Analyze performance
- Receive insights

### Objectives

- **Objective 1:** Provide real-time tracking for stocks and cryptocurrencies  
- **Objective 2:** Allow users to manage and visualize their portfolio  
- **Objective 3:** Deliver a clean, intuitive dashboard for financial insights  
- **Objective 4:** Ensure scalability and performance using modern DevOps practices  

### Target Audience

- Beginner investors  
- Crypto traders  
- Stock market enthusiasts  
- Students learning financial markets  

---

# 2. Team and Roles

| Name        | Main Role  | GitHub Username |
|------------|-----------|----------------|
| Iftime Razvan | Backend   | @IftimeRazvan      |
| Hermeneanu Ionut-Silviu | DevOps & Team Lead | @hsilviu05 |
| Dragomir Cezar-Andrei  | Frontend  | @Cezar-Andreii      |
| Ionita Petru Adrian  | QA Engineer  | @AdryanI20     |

---

# 3. Architecture and Technologies

- **Backend:** FastAPI (Python)  
- **Database:** PostgreSQL  
- **Frontend:** React (Vite)  
- **DevOps:** Docker, Docker Compose, GitHub Actions (CI/CD)  

### Architecture Overview

- REST API built with FastAPI  
- PostgreSQL for persistent storage  
- React frontend consuming API endpoints  
- Dockerized environment for consistency across all developers  
- CI pipeline for automated testing and validation  

---

# 4. Local Setup

```bash
git clone <repo-url>
cd mpi-app
docker compose up --build
