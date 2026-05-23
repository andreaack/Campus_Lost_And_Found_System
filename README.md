<img width="1820" height="907" alt="image" src="https://github.com/user-attachments/assets/61e7c6f6-0e55-43f1-9db2-3516138db4e9" />

# Campus Lost & Found System

A web app to report and recover lost items on campus. 



## What it does

- Register and login (student / admin)
- Report lost or found items with photos
- Search and filter items
- Submit claims with verification answers
- Admin can approve/reject claims and manage users
- Dark / light mode


## API

All routes use `/api/v1`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register |
| POST | /auth/login | Login |
| GET  | /items | List items |
| POST | /items | Report item |
| GET  | /items/search?q= | Search |
| POST | /claims | Submit claim |
| PUT  | /claims/:id/approve | Approve claim (admin) |
| PUT  | /claims/:id/reject | Reject claim (admin) |

**Complete API reference:** Open `/api-docs`.

