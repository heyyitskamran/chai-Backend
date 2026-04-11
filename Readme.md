# Chai Backend

A Node.js + Express backend for a video platform-style application. The project currently focuses on user authentication, profile media uploads, JWT-based session handling, and MongoDB persistence.

## Features

- User registration with avatar and optional cover image upload
- User login with access token and refresh token generation
- Secure logout with JWT verification
- Refresh token endpoint for renewing access tokens
- MongoDB models for users, videos, and subscriptions
- Cloudinary integration for media uploads
- Cookie-based auth support with `httpOnly` cookies

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for multipart file uploads
- Cloudinary for asset storage
- bcrypt for password hashing

## Project Structure

```text
src/
  app.js                     Express app configuration
  index.js                   Server entry point
  constants.js               Shared constants
  controllers/
    user.controller.js       Auth and user account logic
  db/
    db.js                    MongoDB connection setup
  middelware/
    auth.middelware.js       JWT auth middleware
    multer.middelware.js     File upload middleware
  models/
    user.model.js            User schema and auth helpers
    video.model.js           Video schema
    subscription.model.js    Subscription schema
  routes/
    user.routes.js           User-related API routes
  utils/
    ApiError.js              Error helper
    ApiResponse.js           Response helper
    asyncHandler.js          Async controller wrapper
    cloudinary.js            Cloudinary upload utility
public/
  temp/                      Temporary upload storage for Multer
```

## Environment Variables

Create a `.env` file in the project root and add the following values:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Installation

```bash
npm install
```

## Run Locally

Development mode:

```bash
npm run dev
```

The server starts on:

```text
http://localhost:8000
```

Base API path:

```text
/api/v1/users
```

## API Endpoints

### `POST /api/v1/users/register`

Register a new user using `multipart/form-data`.

Required form fields:

- `fullname`
- `username`
- `email`
- `password`
- `avatar` (file)

Optional form field:

- `coverImage` (file)

### `POST /api/v1/users/login`

Login with either `username` or `email`, plus `password`.

Example JSON body:

```json
{
  "username": "kamran",
  "password": "your-password"
}
```

### `POST /api/v1/users/logout`

Protected route. Requires a valid access token in either:

- `Authorization: Bearer <token>`
- `accessToken` cookie

### `POST /api/v1/users/refresh-token`

Refreshes the access token using the refresh token.

## Data Models

### User

- `username`
- `email`
- `fullname`
- `avatar`
- `coverImage`
- `watchHistory`
- `password`
- `refreshToken`

### Video

- `videoFile`
- `thumbnail`
- `title`
- `discription`
- `duration`
- `view`
- `isPublished`
- `owner`

### Subscription

- `subscriber`
- `channel`

## Notes

- The database name is currently set to `videotube` in `src/constants.js`.
- Multer stores uploaded files temporarily in `public/temp` before they are pushed to Cloudinary.
- Only a subset of user controller methods are wired to routes right now.
- There is no test suite configured yet. Running `npm test` currently returns the default placeholder error.

## Scripts

```bash
npm run dev
```

## Repository

GitHub: <https://github.com/heyyitskamran/chai-Backend>
