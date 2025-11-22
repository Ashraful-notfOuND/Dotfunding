# 🚀 Dotfunding - Crowdfunding Platform

<div align="center">

![Dotfunding Banner](https://via.placeholder.com/1200x300/4A90E2/FFFFFF?text=Dotfunding+Crowdfunding+Platform)

[![GitHub Repo](https://img.shields.io/badge/GitHub-Dotfunding-blue?style=for-the-badge&logo=github)](https://github.com/Ashraful-notfOuND/Dotfunding)
[![Branch](https://img.shields.io/badge/Branch-frontendWorks-green?style=for-the-badge)](https://github.com/Ashraful-notfOuND/Dotfunding/tree/frontendWorks)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📦 Public Repository

<div align="center">

### **Dotfunding Source Code**

🔗 **[https://github.com/Ashraful-notfOuND/Dotfunding](https://github.com/Ashraful-notfOuND/Dotfunding)**

**Branch:** `frontendWorks`

</div>

### **Technology Stack:**

<table align="center">
<tr>
<td align="center" width="50%">

#### Backend
- **Framework:** FastAPI + Node.js/Express
- **Database:** Supabase (PostgreSQL)
- **Payment:** SSLCommerz
- **Authentication:** JWT + BCrypt

</td>
<td align="center" width="50%">

#### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **State:** Zustand + TanStack Query
- **UI:** Tailwind CSS + Radix UI

</td>
</tr>
</table>

---

## 🎯 Design Patterns Implemented

This project demonstrates four key software design patterns:

| Pattern | Type | Location | Purpose |
|---------|------|----------|---------|
| 🔒 **Singleton** | Creational | Backend | Database connection management |
| 📚 **Repository** | Structural | Backend | Data access abstraction layer |
| 💳 **Strategy** | Behavioral | Backend | Payment gateway abstraction |
| 🔔 **Observer** | Behavioral | Backend | Event-driven notifications |

---

## 📂 Project Structure

```
Dotfunding/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── DatabaseClient.js      # Singleton Pattern
│   │   │   └── supabaseClient.js
│   │   ├── repositories/
│   │   │   ├── ProjectRepository.js   # Repository Pattern
│   │   │   └── UserRepository.js
│   │   ├── services/
│   │   │   └── PaymentStrategy.js     # Strategy Pattern
│   │   ├── controllers/
│   │   │   ├── projectController.js
│   │   │   ├── userController.js
│   │   │   ├── paymentController.js
│   │   │   └── notificationController.js  # Observer Pattern
│   │   └── routes/
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   └── tests/
│
└── docs/
    ├── design-patterns-report.tex
    ├── IMPLEMENTATION_GUIDE.md
    ├── QUICK_REFERENCE.md
    └── TESTING_SUMMARY.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ & npm
- Supabase account
- SSLCommerz credentials (for payments)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

---

## 📊 Test Coverage

| Module | Tests | Pass Rate | Coverage |
|--------|-------|-----------|----------|
| Backend | 42 | 100% | 96% |
| Frontend | 22 | 100% | 92% |
| **Total** | **64** | **100%** | **94%** |

---

## 🎓 Academic Context

This project was developed as part of a **Software Design Patterns** assignment, demonstrating:

- ✅ Practical application of design patterns
- ✅ Test-driven development
- ✅ Clean architecture principles
- ✅ Comprehensive documentation

**Full Report:** See [`docs/design-patterns-report.tex`](docs/design-patterns-report.tex)

---

## 📸 Screenshots

### Homepage
![Homepage](https://via.placeholder.com/800x450/667EEA/FFFFFF?text=Dotfunding+Homepage)

### Project Explorer
![Projects](https://via.placeholder.com/800x450/48BB78/FFFFFF?text=Browse+Projects)

### Payment Integration
![Payment](https://via.placeholder.com/800x450/F6AD55/FFFFFF?text=Secure+Payments)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Developers:** Software Development Project Team  
**Institution:** Department of Computer Science  
**Year:** 2025

---

## 🔗 Links

- **Repository:** [github.com/Ashraful-notfOuND/Dotfunding](https://github.com/Ashraful-notfOuND/Dotfunding)
- **Documentation:** [/docs](./docs)
- **Issues:** [Report a bug](https://github.com/Ashraful-notfOuND/Dotfunding/issues)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ for the Software Design Patterns course

</div>
