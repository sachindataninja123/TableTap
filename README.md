# TableTap 🍽️

**Multi-Restaurant Table Booking SaaS**

🔗 **Live:** [tabletap-1.onrender.com](https://tabletap-1.onrender.com/)
📦 **Repo:** [github.com/sachindataninja123/TableTap](https://github.com/sachindataninja123/TableTap)

> Hosted on Render's free tier — the backend spins down after periods of inactivity, so the first request may take 30–60 seconds to wake up.

TableTap is a production-style SaaS platform that lets customers discover restaurants, check real-time table availability, and reserve tables online — with a full approval workflow between customers, restaurant owners, and platform admins.

Built on the MERN stack with role-based authentication, a pending-approval booking system with automatic seat validation, and a scalable multi-restaurant architecture.

---

## ✨ Features

### Customer
- Register / login / logout
- Browse, search, and filter restaurants (by cuisine, location, price, rating)
- View real-time table availability by date and time slot
- Request a table reservation (pending owner approval)
- View booking history and cancel bookings
- Edit profile, change password, upload profile photo

### Restaurant Owner
- List a restaurant (goes live only after admin approval)
- Upload restaurant photos (via Cloudinary)
- Set opening hours, booking time slots, and tags
- Approve or decline incoming booking requests
- Mark completed bookings
- Dashboard with booking stats overview

### Admin
- Approve / reject restaurant listings
- Mark restaurants as featured / exclusive
- Manage users — ban / unban, delete accounts
- View platform-wide statistics (users, restaurants, bookings)

---

## 🔒 How bookings actually work

A booking isn't instantly confirmed — it goes through a **pending → approved** flow, similar to real reservation platforms:

1. Customer requests a table for a specific date/time → booking is created as `pending`
2. The seat is **held** for 30 minutes while the owner reviews it
3. Owner approves → seats are re-validated (in case another request grabbed them first) → status becomes `confirmed`
4. Owner declines → status becomes `cancelled`
5. If the owner doesn't respond within 30 minutes, the booking **auto-expires** and the seat is released (via a background cron job + a check-on-read safety net)

This prevents double-booking even when multiple customers request the same last table at the same time.

---

## 🛠️ Tech Stack

**Frontend**
- React.js + Vite
- React Router DOM
- Redux Toolkit
- Tailwind CSS
- Axios
- React Hook Form
- React Hot Toast
- Framer Motion
- React Icons
- Fully Responsiveness

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication (httpOnly cookies)
- bcrypt
- Multer
- Cloudinary
- node-cron

---

## 📁 Project Structure

```
tabletap/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── restaurant.controller.js
│   │   │   ├── booking.controller.js
│   │   │   └── admin.controller.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── restaurant.model.js
│   │   │   └── booking.model.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── multer.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── restaurant.routes.js
│   │   │   ├── booking.routes.js
│   │   │   └── admin.routes.js
│   │   ├── jobs/
│   │   │   └── expireBookings.job.js
│   │   ├── scripts/
│   │   │   └── seedAdmin.js
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   ├── generateToken.js
│   │   │   ├── generateSlug.js
│   │   │   └── cloudinary.js
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axiosInstance.js
    │   ├── app/
    │   │   └── store.js
    │   ├── features/
    │   │   ├── auth/authSlice.js
    │   │   ├── restaurant/restaurantSlice.js
    │   │   └── booking/bookingSlice.js
    │   ├── components/
    │   │   └── common/ (Navbar, ProtectedRoute, ...)
    │   ├── pages/
    │   │   ├── auth/ (Login, Register)
    │   │   ├── customer/ (Home, RestaurantList, RestaurantDetail, BookingForm, MyBookings, Profile)
    │   │   ├── owner/ (Dashboard, MyRestaurant, ManageBookings)
    │   │   └── admin/ (Dashboard, ManageRestaurants, ManageUsers)
    │   └── routes/AppRoutes.jsx
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- A [Cloudinary](https://cloudinary.com/) account (free tier is fine)

### 1. Clone the repo
```bash
git clone https://github.com/sachindataninja123/TableTap.git
cd TableTap
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
NODE_ENV=development

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

ADMIN_EMAIL=admin@tabletap.com
ADMIN_PASSWORD=choose_a_secure_password
```

Seed the first admin account (run once):
```bash
node src/scripts/seedAdmin.js
```

Start the backend:
```bash
npm run dev
```

> `app.js` configures Express (middleware, routes, error handler) and `server.js` boots the HTTP server + DB connection + cron job — keeping the two separate makes the app testable independently of the server lifecycle.

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

The app should now be running at `http://localhost:5173`, connected to the API at `http://localhost:8000`.

---

## 🌐 Deployment Notes

- **Backend** needs to run as a long-lived process (not serverless) because of the `node-cron` job that auto-expires stale pending bookings — hosts like **Render** or **Railway** work well. Vercel serverless functions will **not** run the cron reliably.
- **Frontend** deploys cleanly to **Vercel** or **Netlify** as a static Vite build.
- **MongoDB Atlas** is recommended for the database in production.
- When frontend and backend are on different domains, make sure:
  - CORS is configured with `credentials: true` and the exact frontend origin
  - Auth cookies are set with `secure: true` and `sameSite: "none"` in production (required for cross-domain cookies to work over HTTPS)

---

## 🔑 Roles & Permissions

| Role | Can do |
|---|---|
| **Guest** | Browse restaurants, view details |
| **Customer** (`user`) | Everything a guest can, plus book tables, manage own bookings/profile |
| **Owner** (`owner`) | Manage own restaurant(s), approve/decline bookings for their restaurant |
| **Admin** (`admin`) | Approve/reject restaurants, feature listings, manage all users, view platform stats |

> Admin accounts cannot be created through public registration — the first admin is created via `scripts/seedAdmin.js`, and (optionally) additional admins can be promoted via backend-only endpoints.

---

## 📄 License

This project is available for personal and educational use.

---

Built as a full-stack learning project — MERN + Redux Toolkit + real-world booking logic (seat holds, expiry, and approval workflows).