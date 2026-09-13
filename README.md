# ChatWave Backend

## Run locally
1. Install Node.js LTS.
2. Copy `.env.example` to `.env`.
3. Create a MongoDB Atlas database and put its connection string in `MONGO_URI`.
4. Run `npm install`.
5. Run `npm start`.

Server: `http://localhost:8080`

## REST endpoints
- POST `/api/auth/register` body `{name,email,password}`
- POST `/api/auth/login` body `{email,password}`
- GET `/api/users` with `Authorization: Bearer TOKEN`
- GET `/api/users/me` with `Authorization: Bearer TOKEN`
- GET `/api/chats` with token
- POST `/api/chats` body `{userId}` with token
- GET `/api/chats/:conversationId/messages` with token

## Socket.IO
Connect with:
`io("YOUR_BASE_URL", { auth: { token: JWT_TOKEN } })`

Events:
- `conversation:join` -> conversationId
- `message:send` -> `{conversationId,text}`
- `message:new` -> received message
- `typing:start` / `typing:stop`
- `presence:update`
- `message:seen`
# chatwave-backend
