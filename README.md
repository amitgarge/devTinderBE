# devTinder Backend

Backend API for **devTinder**, a Tinder-style networking app for developers. It supports user authentication, profile management, connection requests, user feeds, real-time chat, online presence, delivery receipts, and seen receipts.

## Tech Stack

- Node.js 18+
- Express.js
- MongoDB with Mongoose
- JWT authentication stored in HTTP-only cookies
- Socket.IO for real-time chat and presence
- bcrypt for password hashing
- CORS with credential support

## Project Structure

```text
.
|-- app.js
|-- apiList.md
|-- package.json
`-- src
    |-- config
    |   `-- database.js
    |-- middlewares
    |   |-- auth.js
    |   `-- errorHandler.js
    |-- models
    |   |-- connectionRequest.js
    |   |-- message.js
    |   `-- user.js
    |-- routes
    |   |-- auth.js
    |   |-- message.js
    |   |-- profile.js
    |   |-- request.js
    |   `-- user.js
    |-- socket
    |   `-- index.js
    `-- util
        |-- AppError.js
        |-- asyncHandler.js
        `-- validators
            `-- user.validator.js
```

## Getting Started

### Prerequisites

- Node.js `>=18`
- MongoDB database connection string
- A frontend/client URL for CORS

### Installation

```bash
npm install
```

### Environment Variables

The app loads environment variables from:

- `.env.local` when `NODE_ENV` is not `production`
- `.env.production` when `NODE_ENV=production`

Create `.env.local` in the project root:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/devtinder
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

### Run Locally

```bash
npm run dev
```

The server runs on `http://localhost:3000` by default.

### Run in Production

```bash
npm start
```

## API Base URL

```text
/api/v1
```

Health check:

```http
GET /
```

Returns:

```json
{
  "status": "success",
  "message": "DevTinder API running"
}
```

## Authentication

Authentication uses a JWT stored in an HTTP-only `token` cookie. Protected routes require this cookie to be sent with the request.

For browser or frontend requests, enable credentials:

```js
fetch("http://localhost:3000/api/v1/profile/view", {
  credentials: "include",
});
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/signup` | Register a new user and set auth cookie |
| `POST` | `/api/v1/auth/login` | Log in and set auth cookie |
| `POST` | `/api/v1/auth/logout` | Clear auth cookie |

Signup body:

```json
{
  "firstName": "Amit",
  "lastName": "Garge",
  "email": "amit@example.com",
  "password": "StrongPass@123",
  "age": 25,
  "gender": "male",
  "about": "Full-stack developer",
  "skills": ["Node.js", "React", "MongoDB"],
  "photoURL": "https://example.com/photo.jpg"
}
```

Login body:

```json
{
  "email": "amit@example.com",
  "password": "StrongPass@123"
}
```

### Profile

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/profile/view` | Get logged-in user's profile |
| `PATCH` | `/api/v1/profile/edit` | Update allowed profile fields |
| `PATCH` | `/api/v1/profile/password` | Change password |

Allowed profile edit fields:

- `firstName`
- `lastName`
- `age`
- `gender`
- `about`
- `skills`
- `photoURL`

Change password body:

```json
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewPass@123"
}
```

### Connection Requests

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/request/send/:status/:toUserId` | Send or ignore a connection request |
| `POST` | `/api/v1/request/review/:status/:requestId` | Accept or reject a received request |

Allowed send statuses:

- `interested`
- `ignored`

Allowed review statuses:

- `accepted`
- `rejected`

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/user/feed?page=1&limit=10` | Get profiles not already connected/requested |
| `GET` | `/api/v1/user/connections` | Get accepted connections |
| `GET` | `/api/v1/user/requests/received` | Get pending received requests |
| `GET` | `/api/v1/user/online/:userId` | Check if a user is online |
| `GET` | `/api/v1/user/last-seen/:userId` | Get a user's last seen timestamp |

Feed pagination:

- `page` defaults to `1`
- `limit` defaults to `10`
- `limit` is capped at `50`

### Messages

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/messages/:targetUserId?cursor=&limit=20` | Get chat history with an accepted connection |

The message API only returns messages if both users have an accepted connection.

Response shape:

```json
{
  "data": [],
  "nextCursor": "2026-01-01T10:00:00.000Z"
}
```

## Socket.IO Events

Socket connections are authenticated using the same `token` cookie as the REST API.

### Client Emits

| Event | Payload | Description |
| --- | --- | --- |
| `get_online_users` | none | Request all currently online user IDs |
| `join_room` | `{ "targetUserId": "..." }` | Join a chat room with an accepted connection |
| `send_message` | `{ "targetUserId": "...", "text": "Hello" }` | Send a chat message |
| `typing` | `{ "targetUserId": "..." }` | Notify the room that user is typing |
| `stop_typing` | `{ "targetUserId": "..." }` | Notify the room that typing stopped |

### Server Emits

| Event | Payload | Description |
| --- | --- | --- |
| `online_users` | `string[]` | List of online user IDs |
| `user_online` | `{ "userId": "..." }` | A user came online |
| `user_offline` | `{ "userId": "...", "lastSeen": "..." }` | A user went offline |
| `receive_message` | message object | New message for the room |
| `message_delivered` | `{ "messageId": "..." }` | A message was delivered |
| `message_delivered_bulk` | `{ "deliveredTo": "..." }` | Multiple messages were delivered |
| `messages_seen` | `{ "seenBy": "..." }` | Messages were marked as seen |
| `user_typing` | `{ "userId": "..." }` | A user is typing |
| `user_stop_typing` | none | A user stopped typing |
| `error` | string | Socket authorization or validation error |

## Data Models

### User

Core fields:

- `firstName`
- `lastName`
- `email`
- `password`
- `age`
- `gender`
- `about`
- `skills`
- `photoURL`
- `lastSeen`

### ConnectionRequest

Core fields:

- `fromUserId`
- `toUserId`
- `status`: `ignored`, `interested`, `accepted`, or `rejected`

The model prevents duplicate connection requests in both directions.

### Message

Core fields:

- `senderId`
- `targetUserId`
- `text`
- `delivered`
- `deliveredAt`
- `seen`
- `seenAt`

## Scripts

```bash
npm run dev
npm start
```

- `npm run dev`: starts the server with `nodemon` in development mode.
- `npm start`: starts the server with `NODE_ENV=production`.

## Notes

- CORS is configured using `CLIENT_URL`, and credentials are enabled.
- Cookies are marked `secure` and `sameSite=none` in production.
- Chat is allowed only between users with an accepted connection.
- Passwords must pass strong password validation.
