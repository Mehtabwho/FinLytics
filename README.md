# FinLytics - AI-Powered Finance & Tax Manager for Bangladeshi SMEs

FinLytics is a comprehensive MERN stack SaaS application designed to help Bangladeshi Small and Medium Enterprise (SME) owners manage their finances, calculate taxes according to NBR rules, and receive AI-driven insights.

## Features

1.  **Authentication & User Profile**: Secure JWT-based auth with business profile management.
2.  **Income Management**: Add, edit, delete income records. Supports Natural Language Input (e.g., "Sold 50 units for 5000 tk yesterday").
3.  **Expense Management**: AI-assisted categorization and tax-deductibility checks.
4.  **Rule-Based Tax Engine**: strict implementation of Bangladesh NBR tax slabs and thresholds (Tax-free limits based on gender/age/location).
5.  **AI Tax Explanation**: Gemini AI explains your tax liability in simple terms.
6.  **Dashboard**: Real-time overview of financial health with charts and key metrics.
7.  **AI Insights**: Intelligent analysis of your finances with reinvestment and optimization suggestions.
8.  **Multi-Year Records**: Filter and view data across different financial years.
9.  **AI Chatbot**: Context-aware assistant to guide you through the system and answer financial queries.

## Tech Stack

-   **Frontend**: React.js, Tailwind CSS, Chart.js, Vite
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB
-   **AI**: Google Gemini API (gemini-1.5-flash)
-   **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

-   Node.js (v18+ recommended)
-   MongoDB Database URI
-   Google Gemini API Key

## Installation & Setup

1.  **Clone the repository** (if applicable)

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create .env file with:
    # MONGO_URI=...
    # JWT_SECRET=...
    # GEMINI_API_KEY=...
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the Application**
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

-   `backend/`: Express API server
    -   `src/models/`: Mongoose schemas (User, Income, Expense)
    -   `src/controllers/`: Request logic
    -   `src/services/`: Business logic (Tax Engine, AI Service)
    -   `src/routes/`: API endpoints
-   `frontend/`: React Vite application
    -   `src/pages/`: Main views (Dashboard, Income, Tax, Chat)
    -   `src/components/`: Reusable UI components
    -   `src/context/`: State management (Auth)

## Tax Calculation Rules (NBR Bangladesh)

The system uses a **Rule-Based** engine for accuracy:
-   **General Tax-Free Threshold**: 3,50,000 BDT
-   **Women/Senior (65+)**: 4,00,000 BDT
-   **Third Gender**: 4,75,000 BDT
-   **War Wounded Freedom Fighters**: 5,00,000 BDT
-   **Slabs**:
    -   Next 1,00,000 @ 5%
    -   Next 4,00,000 @ 10%
    -   Next 5,00,000 @ 15%
    -   Next 5,00,000 @ 20%
    -   Rest @ 25%

## AI Capabilities

-   **Expense Classification**: Automatically categorizes expenses based on description.
-   **Deductibility Check**: Suggests if an expense is tax-deductible.
-   **Natural Language Parsing**: Converts text like "Spent 500 on transport" into structured data.
-   **Advisory**: Provides personalized financial advice based on your real-time data.
