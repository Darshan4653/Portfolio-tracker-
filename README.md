# Portfolio-tracker-
# Stock Portfolio Tracker

A MERN stack application for tracking your stock portfolio. Built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (login/register)
- View available stocks
- Add stocks to portfolio
- Track portfolio performance
- View historical portfolio data
- Edit and remove stocks from portfolio

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-portfolio-tracker
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/stock-portfolio
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
```

5. Start MongoDB:
```bash
# Make sure MongoDB is running on your system
```

6. Start the backend server:
```bash
cd backend
npm start
```

7. Start the frontend development server:
```bash
cd frontend
npm run dev
```

8. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Register a new account or login with existing credentials
2. View available stocks in the Stocks page
3. Add stocks to your portfolio
4. Track your portfolio performance in the Dashboard
5. Manage your portfolio holdings in the Portfolio page

## Technologies Used

- Frontend:
  - React with TypeScript
  - Material-UI
  - Recharts for data visualization
  - Axios for API calls

- Backend:
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT for authentication

## Note

This is a demo application using mock stock data. In a production environment, you would need to:
1. Integrate with a real stock market API
2. Implement proper error handling
3. Add input validation
4. Implement rate limiting
5. Use secure environment variables
6. Add proper logging
7. Implement proper security measures 
