# EduVista Backend Engine

EduVista is an AI-Powered Educational Discovery Platform helping students search, filter, compare, shortlist, and submit inquiries for universities, colleges, and academic courses.

This repository hosts the production-ready Node.js, Express, TypeScript, and MongoDB backend engine built with a robust **Repository-Service-Controller** architecture.

---

## Architecture Design

The backend conforms strictly to SOLID design principles and isolates database operations, business models, controller routing, validation rules, and helpers.

```
src/
├── config/               # Configuration settings (CORS, Cloudinary, Env)
├── constants/            # Common enums, role definitions, and status codes
├── controllers/          # Request routers routing data mapping responses
├── middleware/           # Token validations, error handlers, rate limiters
├── models/               # Mongoose database collection definitions
├── repositories/         # Isolated MongoDB database access layers
├── routes/               # API endpoint configurations and routing mountings
├── services/             # Platform business logic coordinators
├── types/                # TypeScript interfaces and signatures
├── utils/                # Standardized errors, responses, and helpers
├── validators/           # express-validator payload sanitizers
└── server.ts             # Application bootstrapper and signal handler
```

---

## Tech Stack
- **Runtime**: Node.js (v18+ or v20+)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB (via Mongoose ODM)
- **Security**: JWT, bcryptjs, Helmet, CORS, Express-Rate-Limit, Express-Mongo-Sanitize
- **Logs**: Winston with Daily-Rotate-File
- **Email Service**: Nodemailer
- **Background Schedulers**: Interval-based Cron cleaners
- **Asset Uploads**: Multer disk-storage with Cloudinary integration

---

## Installation & Setup

### Prerequisites
- Node.js installed locally.
- MongoDB instance (local or MongoDB Atlas connection string).
- Cloudinary account details (optional for development, required for profile image uploading).

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the `Backend/` directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduvista

JWT_ACCESS_SECRET=your_jwt_access_secret_key_change_me
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_change_me
JWT_ACCESS_EXPIRE=15m

# SMTP Email
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM_NAME=EduVista Support
SMTP_FROM_EMAIL=support@eduvista.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS Whitelist
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Build and Compile TypeScript to JS
```bash
npm run build
npm start
```

---

## Docker Support

### Run with Docker Compose
To boot the application and a local MongoDB instance:
```bash
docker-compose up --build
```
The server will bind to `http://localhost:5000`.

---

## Testing

### Run Typecheck & Tests
```bash
npm run typecheck
npm test
```
The test suite utilizes **Jest** and **Supertest** to verify registration, login, searches, comparisons, and role validations.

---

## API Endpoints Reference

### 🔐 Authentication (`/api/v1/auth`)
- `POST /register` — Register a student account.
- `POST /login` — Authenticate credentials.
- `POST /logout` — Revoke and clear refresh tokens.
- `GET /me` — Fetch current user details.
- `POST /refresh-token` — Rotate access tokens.

### 🏫 College Listing (`/api/v1/colleges`)
- `GET /` — Search and filter published colleges.
- `GET /:slug` — Detailed view of college.

### 📚 Course Listing (`/api/v1/courses`)
- `GET /` — Search and filter published courses.
- `GET /:slug` — Detailed view of course offering colleges.

### 💖 Wishlist (`/api/v1/wishlist`)
- `GET /` — Retrieve saved colleges.
- `POST /` — Bookmark a college.
- `DELETE /:collegeId` — Unsave a college.
- `DELETE /` — Clear wishlist.

### 📊 Comparisons (`/api/v1/compare`)
- `GET /` — Fetch detailed statistics for compared colleges (max 3).
- `POST /` — Save/update college comparisons list.
- `DELETE /` — Clear compared selections.

### 📨 Enquiries (`/api/v1/enquiries`)
- `POST /` — Public student enquiry submission form.

### 🛠️ Admin Panel (`/api/v1/admin`)
- `GET /dashboard` — Total platform metrics, active/new user signups, recent items.
- `GET /analytics` — Top cities, popular courses, and high-rating colleges.
- `GET /users` — Paginated user lists.
- `PUT /users/:id` — Update user profile.
- `GET /audit-logs` — Administrative action logs.
- `GET /settings` — General, SEO, and contact parameters.
