# SmartRide - Full-Stack Ride Booking Platform

SmartRide is a production-ready, full-stack ride-hailing platform (similar to Uber/Careem) built with modern technologies. It features complete ecosystems for Passengers, Drivers, and Administrators, including real-time ride tracking, secure wallets, and a dynamic pricing engine.

## 🚀 Tech Stack

### Frontend
* **Framework:** React.js 19 with Vite
* **Styling:** Tailwind CSS v4
* **State Management:** Redux Toolkit + Redux Persist
* **Routing:** React Router DOM v6
* **Maps:** Leaflet & React-Leaflet
* **Icons:** Lucide React
* **Charts:** Recharts

### Backend
* **Framework:** Python Django 5.1 & Django REST Framework
* **Real-time WebSockets:** Django Channels with Custom JWT Auth
* **Database:** PostgreSQL (Production) / SQLite (Development fallback)
* **Authentication:** SimpleJWT (Access/Refresh Tokens)
* **Task Queues / Caching:** Redis (or local-memory fallback)

---

## ✨ Features

* **Real-time Ride Tracking:** Uses WebSockets to broadcast live driver locations and ride status updates to the passenger.
* **Fidelity Offline Simulator:** The frontend contains a built-in simulation engine. If the backend is unreachable or no drivers are online, the app simulates the full lifecycle of a ride (matching, arriving, driving, completing).
* **Role-based Dashboards:**
  * **Passenger:** Book rides, view fare estimates, manage SmartWallet, rate drivers, view ride history.
  * **Driver:** Toggle online/offline status, view incoming ride requests, track earnings, update vehicle information.
  * **Admin:** Monitor active rides, approve/reject driver verifications, suspend users, view platform revenue charts.
* **Production Hardened:** Includes API rate limiting, robust JWT WebSocket interception, data-anonymized account deletion, and Redux state persistence to survive browser refreshes.

---

## 🛠️ Local Development Setup

To run this project locally, you will need two separate terminal windows—one for the backend API and one for the React frontend.

### 1. Backend Setup

The backend handles the REST API, Database migrations, and WebSocket connections.

```bash
# Navigate to the project root
cd e:/driving

# Create and activate a virtual environment (Windows)
python -m venv .venv
.venv\Scripts\activate

# Install Python dependencies
cd backend
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create a superuser account for the Admin dashboard
python manage.py createsuperuser

# Start the Django ASGI development server
python manage.py runserver
```
*The backend will be available at: http://localhost:8000*

### 2. Frontend Setup

The frontend is a Vite-powered React application.

```bash
# Open a NEW terminal and navigate to the frontend folder
cd e:/driving/frontend

# Install Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend will be available at: http://localhost:5173*

---

## 📱 Demo Accounts

For quick testing without needing to register, you can use the built-in demo credentials on the Login page, or use the superuser account you created above to access the Admin portal.

## 📄 License

This project is open-source and available under the MIT License.
