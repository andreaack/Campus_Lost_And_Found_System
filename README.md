
# Campus Lost & Found System

A full‑stack web application for reporting and recovering lost items on campus.  


**Live API:** [campus-lost-and-found-system-be.vercel.app](https://campus-lost-and-found-system-be.vercel.app)  
**Swagger Docs:** [campus-lost-and-found-system-be.vercel.app/api-docs](https://campus-lost-and-found-system-be.vercel.app/api-docs)

![Dashboard Screenshot](https://github.com/user-attachments/assets/61e7c6f6-0e55-43f1-9db2-3516138db4e9)



#### Features

- Student / admin registration & login (JWT, 30‑min session)
- Report lost or found items with up to 3 images (Cloudinary)
- Full‑text keyword search & multi‑field filters
- Claim submission with verification questions
- Admin panel – manage users, approve/reject claims, view statistics
- Dark / light mode toggle
- Interactive Swagger API documentation
- Deployed on Vercel with MongoDB Atlas

![Landing Page Screenshot](https://github.com/user-attachments/assets/8d71e2dc-cb6c-43e4-9499-eccc06729ab5)


### Stack Used:

| Layer       | Technology |
|-------------|------------|
| Frontend    | React (Vite), React Router, Chart.js |
| Backend     | Node.js, Express, Mongoose, JWT, bcryptjs |
| Database    | MongoDB Atlas |
| File Storage| Cloudinary |
| Docs        | Swagger (OpenAPI 3.0) |
| Deployment  | Vercel |



#### Quick Start

### Backend
```bash
cd backend
npm install
# create a .env file with the required variables (see below)
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

**Required environment variables (`backend/.env`):**  
`MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `FRONTEND_URL`, `NODE_ENV`.

> **Important for Vercel:** Set these in the project's **Environment Variables** dashboard. The `MONGODB_URI` password must be URL‑encoded if it contains special characters.

![Item Detail Screenshot](https://github.com/user-attachments/assets/8f2b9c35-442e-4faa-ac97-5d8d2217d082)


## API Reference

**Base URL (production):** `https://campus-lost-and-found-system-be.vercel.app`  
**Base URL (local):** `http://localhost:5000`

### System / Diagnostic

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | — | API status |
| GET | `/health` | — | Database connection status |
| GET | `/db-debug` | — | Direct MongoDB ping test |
| GET | `/api-docs` | — | Swagger UI |

### Authentication (`/api/v1/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register new user (student/admin) |
| POST | `/login` | — | Login user |
| GET | `/me` | Bearer | Get current user info |
| POST | `/logout` | — | Logout user |

### Users (`/api/v1/users`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | Get all users |
| GET | `/{id}` | Bearer | Get single user profile |
| PUT | `/{id}` | Bearer | Update user profile |
| DELETE | `/{id}` | Admin | Delete user |

### Items (`/api/v1/items`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Bearer | Report a new item (multipart, up to 3 images) |
| GET | `/` | — | Get all approved items (paginated) |
| GET | `/search?q=...` | — | Search items by keyword |
| GET | `/filter?type=lost&category=electronics&...` | — | Filter items by type, location, date, status |
| GET | `/{id}` | — | Get single item details |
| PUT | `/{id}` | Bearer | Update an item |
| DELETE | `/{id}` | Bearer | Delete an item |
| PUT | `/{id}/mark-recovered` | Bearer | Mark item as recovered/returned |

### Claims (`/api/v1/claims`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Bearer | Submit claim on an item |
| GET | `/` | Admin | Get all claims |
| GET | `/user/{userId}` | Bearer | Get claims by user |
| GET | `/item/{itemId}` | — | Get claims for specific item |
| GET | `/{id}` | Bearer | Get single claim details |
| PUT | `/{id}/approve` | Admin | Approve claim |
| PUT | `/{id}/reject` | Admin | Reject claim |
| DELETE | `/{id}` | Bearer | Delete claim |

### Rate Limits

| Scope | Limit |
|---|---|
| All `/api/*` routes | 100 requests / 15 minutes per IP |
| `/api/v1/auth/login` | 10 requests / 15 minutes per IP |

> **Note:** Every `/api/v1/*` endpoint runs through a database‑guard middleware. If MongoDB is disconnected, you will receive HTTP 503 `{ "code": "DB_NOT_READY" }`. This is why login/signup/items may fail when the database is unreachable.


<img width="1671" height="868" alt="image" src="https://github.com/user-attachments/assets/a5ae81dc-6b8d-43dc-8ba8-f577f1f4a090" />

## Deployment Notes

- The backend is deployed on **Vercel** as a serverless function. The database connection is cached globally to improve cold starts.
- The health endpoint (`/health`) reports database connectivity (`db: connected` / `disconnected`).
- Rate‑limiting is configured; the `trust proxy` setting is enabled for Vercel's infrastructure.
- For production, set `FRONTEND_URL` to your deployed frontend URL to enable CORS.

---

## License

This project was developed for academic purposes.
