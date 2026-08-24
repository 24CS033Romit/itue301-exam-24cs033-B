# FitZone — Gym & Class Booking System

FitZone is a simple web-based gym and class booking system where members can log in, view available trainers/classes, book classes, and manage their bookings.

---

## 2. Project Purpose

The purpose of this project is to provide a clean, lightweight, and viva-friendly full-stack application developed for practical examinations. It demonstrates:

- **React Frontend**: Functional components, client-side routing, and context-based state management.
- **Node.js + Express Backend**: Clean REST API architecture, custom middleware pipeline, and JWT verification.
- **MongoDB + Mongoose Database**: Data schemas with strict validation, default values, enums, and population references.
- **REST APIs**: Structured JSON communication with standard HTTP status codes.
- **JWT-Based Authentication**: Stateless token generation and route protection.
- **React Router**: Seamless client-side navigation without browser reloads.
- **Context API**: Centralized authentication state with `localStorage` persistence.
- **Protected Routes**: Client-side route guards and server-side request authorization.
- **Code-Splitting & Lazy Loading**: Dynamic module loading using `React.lazy()` and `Suspense`.

---

## 3. Features

- **Member Login**: Email-based authentication returning a signed JSON Web Token (JWT).
- **Trainer Listing**: Dynamic retrieval of certified trainers from MongoDB.
- **Trainer Specialization Search**: Instant, case-insensitive client-side search filtering by specialization without redundant API calls.
- **Class Booking**: Class reservation linking the authenticated member (from JWT) with a trainer and time slot.
- **My Bookings**: View member's active bookings with populated trainer details (name and specialization).
- **Booking Status Update**: Cancellation action updating status to `cancelled` via REST API.
- **JWT Authentication & AuthGuard**: Secure endpoints protected by Bearer token verification.
- **Protected Routes**: Unauthenticated users visiting `/classes` or `/my-bookings` are automatically redirected to `/`.
- **Global Request Logging**: Terminal logging tracking HTTP method, path, final status code, and response time.
- **Global Error Handling**: Centralized error middleware returning clean JSON and suppressing raw stack traces.
- **Lazy Loading**: `AdminPanel` is code-split and loaded on-demand via `React.lazy()` and `Suspense`.
- **Responsive Clean White UI**: Polished white theme with light borders, subtle shadows, and responsive card grids.

---

## 4. Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 | Functional components and hooks (`useState`, `useEffect`, `useContext`) |
| **Routing** | React Router 6 | Client-side routing, navigation, and protected routes |
| **Build Tool** | Vite 5 | Fast development server and module bundler |
| **Styling** | Vanilla CSS | Custom design system tokens with clean white theme |
| **Backend** | Node.js / Express 4 | REST API web framework |
| **Database** | MongoDB | Document database |
| **ODM** | Mongoose 8 | Schema modeling, validation, and reference population |
| **Authentication**| JSON Web Token (`jsonwebtoken`) | Stateless token generation and verification |
| **Utilities** | CORS, Dotenv | Cross-origin resource sharing and environment management |

---

## 5. Project Architecture

The application follows a standard 2-tier client-server architecture:

```text
User / Browser
      ↓
React Frontend (Vite)
      ↓  (HTTP / JSON + Bearer Token)
Express REST API
      ↓  (Mongoose ODM)
MongoDB Database
```

---

## 6. Project Structure

```text
24cs033/
├── backend/
│   ├── models/
│   │   ├── Member.js            # Member Mongoose model
│   │   ├── Trainer.js           # Trainer Mongoose model
│   │   └── ClassBooking.js      # ClassBooking Mongoose model
│   ├── middleware/
│   │   ├── authGuard.js         # JWT validation middleware
│   │   ├── requestLogger.js     # Request duration logger
│   │   └── errorHandler.js      # Centralized error handler
│   ├── routes/
│   │   ├── authRoutes.js        # /api/v1/auth routes
│   │   ├── trainerRoutes.js     # /api/v1/trainers routes
│   │   └── bookingRoutes.js     # /api/v1/bookings routes
│   ├── .env                     # Local environment file (git-ignored)
│   ├── .gitignore               # Backend gitignore
│   ├── package.json             # Backend dependencies & start script
│   └── server.js                # Express app entry point & DB connection
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation bar with Link components
│   │   │   ├── TrainerCard.jsx    # Card rendering trainer info & availability
│   │   │   └── ProtectedRoute.jsx # Route authorization guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Centralized auth state & persistence
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx      # Login page with demo credentials
│   │   │   ├── ClassesPage.jsx    # Classes catalogue, search & booking
│   │   │   ├── MyBookingsPage.jsx # Bookings table & cancellation
│   │   │   └── AdminPanel.jsx     # Lazy-loaded admin panel
│   │   ├── App.jsx                # Router setup & Suspense configuration
│   │   ├── main.jsx               # React DOM entry point
│   │   └── index.css              # Clean white theme stylesheet
│   ├── index.html                 # HTML application template
│   ├── package.json               # Frontend dependencies & scripts
│   └── vite.config.js             # Vite configuration
│
├── .env.example                 # Environment variable template
├── .gitignore                   # Root gitignore
└── README.md                    # Project documentation
```

---

## 7. Database Design

### Member Model (`backend/models/Member.js`)

| Field | Type | Required | Unique | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `name` | `String` | Yes | No | — | Full name of the member |
| `email` | `String` | Yes | Yes | — | Unique email (lowercase, trimmed) |
| `phone` | `String` | No | No | — | Contact phone number |
| `membershipType` | `String` | No | No | `'basic'` | Enum: `['basic', 'premium', 'platinum']` |
| `createdAt` / `updatedAt` | `Date` | Auto | No | Auto | Mongoose timestamps |

### Trainer Model (`backend/models/Trainer.js`)

| Field | Type | Required | Unique | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `name` | `String` | Yes | No | — | Trainer's full name |
| `specialization` | `String` | Yes | No | — | Fitness specialty (e.g. Yoga, HIIT) |
| `available` | `Boolean` | No | No | `true` | Availability indicator |
| `createdAt` / `updatedAt` | `Date` | Auto | No | Auto | Mongoose timestamps |

### ClassBooking Model (`backend/models/ClassBooking.js`)

| Field | Type | Required | Reference | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `memberId` | `ObjectId` | Yes | `Member` | — | Reference to booking Member |
| `trainerId` | `ObjectId` | Yes | `Trainer` | — | Reference to assigned Trainer |
| `className` | `String` | Yes | — | — | Name of fitness class |
| `date` | `Date` | Yes | — | — | Scheduled class date |
| `timeSlot` | `String` | Yes | — | — | Scheduled time slot |
| `status` | `String` | No | — | `'booked'` | Enum: `['booked', 'attended', 'cancelled']` |
| `createdAt` / `updatedAt` | `Date` | Auto | — | Auto | Mongoose timestamps |

---

## 8. Database Relationships

```text
ClassBooking
 ├── memberId  ──► References Member (populates: 'name email')
 └── trainerId ──► References Trainer (populates: 'name specialization')
```

- When querying `GET /api/v1/bookings/my`, Mongoose `.populate('memberId', 'name email')` and `.populate('trainerId', 'name specialization')` replace reference ObjectIds with populated member and trainer documents.

---

## 9. API Documentation

| Method | Endpoint | Authentication | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Validate email and issue JWT |
| `GET` | `/api/v1/trainers` | Public | Fetch all trainer profiles |
| `POST` | `/api/v1/bookings` | Protected (`authGuard`) | Create a new class booking |
| `GET` | `/api/v1/bookings/my` | Protected (`authGuard`) | Retrieve current member's bookings |
| `PATCH` | `/api/v1/bookings/:id/status` | Protected (`authGuard`) | Update status (`booked`, `attended`, `cancelled`) |

### 1. `POST /api/v1/auth/login`
- **Body**:
  ```json
  {
    "email": "member@fitzone.com"
  }
  ```
- **Success (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "member": {
      "_id": "66c9f1a0e1b2c3d4e5f6a7b1",
      "name": "Rahul Sharma",
      "email": "member@fitzone.com",
      "membershipType": "basic"
    },
    "role": "member"
  }
  ```
- **Errors**: `400 Bad Request` (missing email), `401 Unauthorized` (member not found).

### 2. `GET /api/v1/trainers`
- **Authentication**: None (Public).
- **Success (200 OK)**:
  ```json
  {
    "success": true,
    "trainers": [
      {
        "_id": "66c9f1a0e1b2c3d4e5f6a7b8",
        "name": "Priya Sharma",
        "specialization": "Yoga & Mindfulness",
        "available": true
      }
    ]
  }
  ```

### 3. `POST /api/v1/bookings`
- **Authentication**: Header `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "trainerId": "66c9f1a0e1b2c3d4e5f6a7b8",
    "className": "Morning Yoga Flow",
    "date": "2026-08-25",
    "timeSlot": "07:00 AM - 08:00 AM"
  }
  ```
- **Success (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Booking created successfully",
    "booking": {
      "_id": "66c9f2b1e1b2c3d4e5f6a7c9",
      "memberId": "66c9f1a0e1b2c3d4e5f6a7b1",
      "trainerId": "66c9f1a0e1b2c3d4e5f6a7b8",
      "className": "Morning Yoga Flow",
      "date": "2026-08-25T00:00:00.000Z",
      "timeSlot": "07:00 AM - 08:00 AM",
      "status": "booked"
    }
  }
  ```
- **Errors**: `400 Bad Request` (missing required fields), `401 Unauthorized` (missing/invalid token).

### 4. `GET /api/v1/bookings/my`
- **Authentication**: Header `Authorization: Bearer <token>`
- **Success (200 OK)**:
  ```json
  {
    "success": true,
    "bookings": [
      {
        "_id": "66c9f2b1e1b2c3d4e5f6a7c9",
        "className": "Morning Yoga Flow",
        "date": "2026-08-25T00:00:00.000Z",
        "timeSlot": "07:00 AM - 08:00 AM",
        "status": "booked",
        "memberId": {
          "_id": "66c9f1a0e1b2c3d4e5f6a7b1",
          "name": "Rahul Sharma",
          "email": "member@fitzone.com"
        },
        "trainerId": {
          "_id": "66c9f1a0e1b2c3d4e5f6a7b8",
          "name": "Priya Sharma",
          "specialization": "Yoga & Mindfulness"
        }
      }
    ]
  }
  ```

### 5. `PATCH /api/v1/bookings/:id/status`
- **Authentication**: Header `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "cancelled"
  }
  ```
- **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Booking status updated successfully",
    "booking": {
      "_id": "66c9f2b1e1b2c3d4e5f6a7c9",
      "status": "cancelled"
    }
  }
  ```
- **Errors**: `400 Bad Request` (invalid status value), `404 Not Found` (booking not found).

---

## 10. Authentication Flow

1. **Member Login**: The user enters their email on `LoginPage`.
2. **API Call**: Frontend sends `POST /api/v1/auth/login`.
3. **Lookup & Token Generation**: Backend finds the `Member` record in MongoDB and generates a JWT signed with `process.env.JWT_SECRET`:
   ```javascript
   const token = jwt.sign({ memberId: member._id, role: 'member' }, process.env.JWT_SECRET);
   ```
4. **State Storage**: Frontend receives `{ token, member, role }` and stores them in `AuthContext` and `localStorage`.
5. **Route Navigation**: React Router navigates the user to `/classes`.
6. **Protected Requests**: Protected API requests attach the header:
   ```http
   Authorization: Bearer <token>
   ```
7. **AuthGuard Verification**: `authGuard.js` extracts and verifies the token, injecting `req.member` into the Express request object.

---

## 11. React Routing

| Route | Component | Protection | Description |
| :--- | :--- | :--- | :--- |
| `/` | `LoginPage` | Public | Entry page / member login portal |
| `/classes` | `ClassesPage` | Protected | Browse classes, filter trainers, book sessions |
| `/my-bookings` | `MyBookingsPage` | Protected | View member bookings and cancel sessions |
| `/bookings` | `MyBookingsPage` | Protected | Route alias for My Bookings |
| `/admin` | `AdminPanel` | Lazy Loaded | Lazy-loaded admin component demonstration |
| `*` | Redirect | Public | Fallback redirecting to `/` |

---

## 12. React State Management

State is managed using standard React Hooks without external libraries:

- **`useState`**:
  - `LoginPage`: Manages `email`, `loading`, `error`.
  - `ClassesPage`: Manages `trainers`, `loading`, `error`, `search`, `selectedTrainer`, `selectedTimeSlot`, `bookingMessage`.
  - `MyBookingsPage`: Manages `bookings`, `loading`, `error`, `message`.
  - `AuthContext`: Manages global `member`, `token`, `role`.
- **`useEffect`**:
  - `ClassesPage`: Fetches trainers on component mount.
  - `MyBookingsPage`: Fetches user bookings when `token` is ready.
- **`useContext` (`AuthContext`)**:
  - Provides `{ member, token, role, login, logout }` to all components and protected routes.

---

## 13. API Data Flow

### Trainer Data Flow
```text
ClassesPage (Mounts)
      ↓
useEffect() triggers fetch()
      ↓
GET /api/v1/trainers (Express)
      ↓
Trainer.find() (Mongoose)
      ↓
MongoDB Collection
      ↓
JSON Response: { success: true, trainers: [...] }
      ↓
setTrainers(data.trainers)
      ↓
filteredTrainers.map() ──► <TrainerCard trainer={...} />
```

### Class Booking Flow
```text
User selects Trainer & Time Slot
      ↓
Clicks "Book Class"
      ↓
POST /api/v1/bookings (with Bearer Token)
      ↓
authGuard verifies JWT & injects req.member.memberId
      ↓
new ClassBooking({ memberId, trainerId, className, date, timeSlot })
      ↓
booking.save() (Mongoose ──► MongoDB)
      ↓
HTTP 201 Response: { success: true, booking: {...} }
      ↓
Navigate to /my-bookings
```

### My Bookings Data Flow
```text
MyBookingsPage (Mounts)
      ↓
GET /api/v1/bookings/my (with Bearer Token)
      ↓
authGuard verifies JWT
      ↓
ClassBooking.find({ memberId: req.member.memberId })
  .populate('memberId', 'name email')
  .populate('trainerId', 'name specialization')
      ↓
JSON Response: { success: true, bookings: [...] }
      ↓
setBookings(data.bookings) ──► Render Table with Populated Trainer Details
```

---

## 14. Middleware

### 1. `authGuard` (`backend/middleware/authGuard.js`)
- Inspects `req.headers.authorization`.
- Ensures token starts with `Bearer `.
- Verifies JWT with `process.env.JWT_SECRET`.
- Attaches decoded payload `{ memberId, role }` to `req.member`.
- Returns HTTP 401 `{ success: false, message: 'Authentication required' }` if missing or invalid.

### 2. `requestLogger` (`backend/middleware/requestLogger.js`)
- Global middleware executing on every request.
- Uses `res.on('finish')` to calculate response duration.
- Outputs formatted log:
  ```text
  [GET] /api/v1/trainers 200 12ms
  [POST] /api/v1/bookings 201 18ms
  ```

### 3. `errorHandler` (`backend/middleware/errorHandler.js`)
- Placed as the LAST middleware in `server.js`.
- Formats Mongoose `ValidationError` into `{ success: false, message: 'Validation failed', errors: [...] }`.
- Formats Mongoose `CastError` into `{ success: false, message: 'Invalid ID format' }`.
- Returns clean JSON without exposing `err.stack`.

---

## 15. Frontend Components

- **`Navbar`** (`src/components/Navbar.jsx`): Header containing logo, React Router `<Link>` components, user authentication badge, and `logout()` trigger.
- **`TrainerCard`** (`src/components/TrainerCard.jsx`): Reusable presentation card displaying trainer initials avatar, name, specialization, and `Available` vs `Fully Booked` badge.
- **`ProtectedRoute`** (`src/components/ProtectedRoute.jsx`): Route wrapper checking `token` presence; redirects unauthenticated visitors to `/`.
- **`AuthProvider`** (`src/context/AuthContext.jsx`): Context provider exposing authentication state and actions.

---

## 16. UI / UX Design

- **Clean White Theme**:
  - Background: White (`#ffffff`) and very light slate (`#f8fafc`).
  - Typography: Dark slate headings (`#111827`) and muted text (`#64748b`).
  - Primary Accent: Clean Blue (`#2563eb`).
  - Borders: Subtle gray (`#e2e8f0`).
  - Shadows: Soft box-shadows (`0 1px 3px rgba(0,0,0,0.06)`).
- **Responsive Layout**: Adapts gracefully across desktop (3 columns), tablet (2 columns), and mobile devices (1 column).
- **Interactive Feedback**:
  - Availability badges (`badge-open` for Available, `badge-full` for Fully Booked).
  - Explicit loading states (*"Loading trainers..."*, *"Loading bookings..."*).
  - Clean alert messages for booking success and error states.

---

## 17. Error Handling

- **Mongoose Validation**: Schema validation failures return structured error messages listing missing or invalid fields.
- **Authentication Errors**: Missing or malformed JWT tokens return HTTP 401.
- **Client-Side Failure Handling**: `fetch()` errors trigger clean in-page alerts without breaking the user interface.
- **Safe Fallbacks**: Stack traces are never returned to the client in API responses.

---

## 18. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

*(See `.env.example` in the root workspace for the template)*

---

## 🚀 Running the Application

### 1. Backend Server
```bash
cd backend
npm install
node server.js
```
Runs at: `http://localhost:5000`

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Runs at: `http://localhost:3000`

### 3. Demo Member Login
- **Email**: `member@fitzone.com` *(Available via the 1-click "Member Demo" button on the login page)*
