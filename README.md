# Feature-Rich Express API

Production-style backend API built with Node.js, Express, and MongoDB.

This project is designed to demonstrate backend engineering skills that matter in interviews and real products:
- Clean API architecture (`routes -> controllers -> services -> models`)
- Authentication with JWT
- Authorization with RBAC + permission layer
- User CRUD with validation and consistent response/error structure
- Pagination, filtering, and sorting for scalable list endpoints
- OpenAPI spec for API documentation

## Live API

- **Base URL:** [https://feature-rich-express-api.onrender.com](https://feature-rich-express-api.onrender.com)
- **API status:** [https://feature-rich-express-api.onrender.com/api](https://feature-rich-express-api.onrender.com/api)
- **OpenAPI specification:** [https://feature-rich-express-api.onrender.com/api/docs/openapi.json](https://feature-rich-express-api.onrender.com/api/docs/openapi.json)

## Tech Stack
- Node.js
- Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Security middleware (`helmet`, `cors`)
- Environment management (`dotenv`)

## Core Features

### 1. Auth (Register/Login)
- `POST /api/auth/register`
- `POST /api/auth/login`
- Secure password hashing utility
- JWT token generation utility

### 2. User Management (Full CRUD)
- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### 3. Pagination + Filtering + Sorting
Supported on `GET /api/users`:
- `page`, `limit`
- `role`, `isActive`, `search`
- `sort` (`createdAt`, `updatedAt`, `name`, `email`)
- `order` (`asc`, `desc`)

Example:
```http
GET /api/users?page=1&limit=10&sort=createdAt&order=desc&role=admin
```

### 4. RBAC + Permissions
Protected endpoints use:
- Auth middleware (`protect`) for JWT verification
- Permission middleware (`requirePermissions`)

Permissions examples:
- `canViewUsers`
- `canManageUsers`
- `canProcessPayments`

### 5. OpenAPI Documentation
- OpenAPI JSON: `GET /api/docs/openapi.json`
- Docs helper endpoint: `GET /api/docs/swagger`

## Project Structure

```txt
feature-rich-express-api/
  app.js
  server.js
  config/
  controllers/
    auth.controller.js
    user.controller.js
  docs/
    openapi.js
  dtos/
    auth.dto.js
    user.dto.js
  middlewares/
    async.middleware.js
    auth.middleware.js
    error.middleware.js
    rbac.middleware.js
    validate.middleware.js
  models/
    user.model.js
  routes/
    auth.route.js
    docs.route.js
    user.route.js
    index.js
  services/
    auth.service.js
    user.service.js
  utils/
    ApiError.js
    ApiResponce.js
    generateToken.js
    passwordHashing.js
```

## Getting Started

### 1. Clone and install
```bash
git clone <your-repo-url>
cd feature-rich-express-api
npm install
```

### 2. Configure environment
Create `.env` in project root:

```env
PORT=5000
MONGO_URL=mongodb://127.0.0.1:27017/feature-rich-express-api
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1w
```

### 3. Run server
```bash
npm run dev
```

Server starts on `http://localhost:5000` (or your `PORT`).

## Deploy to Render

The GitHub Actions pipeline deploys this API to Render only after CI passes on a push to `main`.

1. Create a Render **Web Service** connected to this GitHub repository and set its deploy branch to `main`.
2. Set the build command to `npm ci` and the start command to `npm start`. Use Node.js 22.
3. Configure these environment variables in Render:
   - `MONGO_URL` — connection string for a hosted MongoDB database.
   - `JWT_SECRET` — a strong, private signing secret.
   - `JWT_EXPIRES_IN` — for example, `1w`.
   - `IMGBB_API_KEY` — optional; required only for image uploads.
   Render provides `PORT` automatically.
4. In the Render service settings, set the health-check path to `/api`. This endpoint responds with the API welcome message.
5. Create a Render deploy hook for the service and add its URL to the GitHub repository as an Actions secret named `RENDER_DEPLOY_HOOK_URL`.
6. Turn off Render's automatic deploy-on-commit setting so it does not deploy before GitHub Actions finishes CI.

After setup, pull requests run CI without deploying. A successful push or merge to `main` triggers the Render deploy hook, and Render builds and starts the latest commit on its configured branch. Deployments can also be manually started from the Render dashboard.

## API Usage Quick Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Sudeep","email":"sudeep@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sudeep@example.com","password":"password123"}'
```

### Get users (with token)
```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=10&sort=createdAt&order=desc" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Why This Project Is Strong for GitHub/Interviews
- Demonstrates real-world API concerns: auth, authorization, validation, pagination, and docs.
- Uses layered architecture and reusable middleware/util patterns.
- Shows practical backend design decisions for maintainability and scaling.

## Future Enhancements
- Automated tests (unit + integration)
- Docker setup
- Rate limiting and request logging
- CI pipeline (lint/test checks)

## License
ISC
