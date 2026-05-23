<img width="1820" height="907" alt="image" src="https://github.com/user-attachments/assets/61e7c6f6-0e55-43f1-9db2-3516138db4e9" />

## Campus Lost & Found System

Features

- Student / admin registration & login
- Report lost or found items with up to 3 images (Cloudinary)
- Full‑text keyword search & multi‑field filters
- Claim submission with verification questions
- Admin panel – manage users, approve/reject claims, view statistics
- Swagger API documentation
- Deployed on Vercel with MongoDB Atlas



<img width="1816" height="906" alt="image" src="https://github.com/user-attachments/assets/8d71e2dc-cb6c-43e4-9499-eccc06729ab5" />




## Quick Start

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

<img width="1814" height="912" alt="image" src="https://github.com/user-attachments/assets/8f2b9c35-442e-4faa-ac97-5d8d2217d082" />

## API Reference

**Base URL (production):** `https://campus-lost-and-found-system-be.vercel.app`  
**Base URL (local):** `http://localhost:5000`

### System / Diagnostic

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | — | API status |
| GET | `/health` | — | DB connection status + diagnostics |
| GET | `/db-debug` | — | Direct MongoDB ping test |
| GET | `/api-docs` | — | Swagger UI |
| GET | `/api-docs.json` | — | Swagger spec |

### Authentication (`/api/v1/auth`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | — | Sign up (returns `token`, `user`) |
| POST | `/login` | — | Sign in (returns `token`, `user`) |
| GET | `/me` | Bearer | Get current user |
| POST | `/logout` | — | Logout |

### Users (`/api/v1/users`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Admin | List all users |
| GET | `/:id` | Bearer | Get user by ID |
| PUT | `/:id` | Bearer (self or admin) | Update user |
| DELETE | `/:id` | Admin | Delete user |

### Items (`/api/v1/items`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/` | Bearer | Report new item (multipart, up to 3 images) |
| GET | `/` | — | List approved items (paginated) |
| GET | `/mine` | Bearer | Items reported by current user |
| GET | `/search?q=...` | — | Text search (with optional `category`, `location`) |
| GET | `/filter?...` | — | Filter by `type`, `category`, `location`, `status`, `dateFrom`, `dateTo` |
| GET | `/:id` | — | Item detail |
| PUT | `/:id` | Bearer (owner) | Update item |
| DELETE | `/:id` | Bearer (owner) | Delete item |
| PUT | `/:id/mark-recovered` | Bearer | Mark item recovered |
| GET | `/admin/all` | Admin | All items (incl. pending) |
| PATCH | `/:id/status` | Admin | Approve/reject item |

### Claims (`/api/v1/claims`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/` | Bearer | Submit claim |
| GET | `/` | Admin | List all claims |
| GET | `/user/:userId` | Bearer | Claims by user |
| GET | `/item/:itemId` | — | Claims on an item |
| GET | `/:id` | Bearer | Get claim by ID |
| DELETE | `/:id` | Bearer (owner) | Delete claim |
| PUT | `/:id/approve` | Admin | Approve claim |
| PUT | `/:id/reject` | Admin | Reject claim |



## Deployment Notes

- The backend is deployed on **Vercel** as a serverless function. The database connection is cached globally to improve cold starts.
- The health endpoint (`/health`) reports database connectivity (`db: connected` / `disconnected`).
- Rate‑limiting is configured; the `trust proxy` setting is enabled for Vercel's infrastructure.
- For production, set `FRONTEND_URL` to your deployed frontend URL to enable CORS.



## License

This project was developed for academic purposes .

