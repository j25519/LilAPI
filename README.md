# LilAPI

A super basic test API project. Not to be used for production.

Has a basic UI that shows you realtime logs of the API via websockets as well as the current contents of the (in-memory) SQLite database.

Uses React + Vite + Express + SQLite.

## How to run it

Clone the repo and `cd` into it. Run `npm install`.

Create `.env` and insert:

> API_KEY=test-api-key-123

Save it and run `npm start`.

Open `http://localhost:5173` in your browser to see the front end. It should connect to the database but it starts off empty.

The API is at `http://localhost:3000` and can be interacted with using curl or whatever you use to talk to APIs.

Example:

> curl -H "x-api-key: test-api-key-123" \
     -H "Content-Type: application/json" \
     -d '{"name":"Tesla Cybertruck"}' \
     -X POST http://localhost:3000/api/data

# API Documentation

*Yes, I used AI to document the API for me. That's why it's super detailed. You're welcome.*

This API, built with Express and SQLite, manages items and provides health checks. It runs on `http://localhost:3000`, with a Vite proxy on `http://localhost:5173`. Most endpoints require authentication via an API key (`x-api-key`) set in `.env`. The `/proxy/data` endpoint allows UI or external access without client-side authentication, using the server-side key. Interact via `curl`, the UI (`http://localhost:5173`), or other HTTP clients.

## Base URL
- **Direct**: `http://localhost:3000`
- **Vite Proxy**: `http://localhost:5173` (proxies `/api/*` and `/proxy/*` to 3000)

## Authentication
- **Header**: `x-api-key: <API_KEY>` (e.g., `test-api-key-123` from `.env`)
- Required for `/api/data` endpoints.
- Not required for `/api/health` or `/proxy/data` (server handles key for proxy).

## Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Checks server status.
- **Authentication**: None
- **Request** (Direct):
  ```bash
  curl http://localhost:3000/api/health
  ```
- **Request** (Vite Proxy):
  ```bash
  curl http://localhost:5173/api/health
  ```
- **Response** (200 OK):
  ```json
  {
    "status": "ok",
    "time": "2025-05-20T10:29:00.000Z"
  }
  ```

### 2. List Items
- **Endpoint**: `GET /api/data`
- **Description**: Retrieves all items from the SQLite `items` table.
- **Authentication**: Required (`x-api-key`)
- **Request** (Direct):
  ```bash
  curl -H "x-api-key: test-api-key-123" http://localhost:3000/api/data
  ```
- **Request** (Vite Proxy):
  ```bash
  curl -H "x-api-key: test-api-key-123" http://localhost:5173/api/data
  ```
- **Response** (200 OK):
  ```json
  [
    {"id": 1, "name": "Book"},
    {"id": 2, "name": "Pen"}
  ]
  ```
- **Errors**:
  - 401 Unauthorized: `{"error": "API key required"}` (missing key)
  - 401 Unauthorized: `{"error": "Invalid API key"}` (wrong key)

### 3. Create Item
- **Endpoint**: `POST /api/data`
- **Description**: Adds a new item to the `items` table.
- **Authentication**: Required (`x-api-key`)
- **Request** (Direct):
  ```bash
  curl -H "x-api-key: test-api-key-123" \
       -H "Content-Type: application/json" \
       -d '{"name":"Tablet"}' \
       -X POST http://localhost:3000/api/data
  ```
- **Request** (Vite Proxy):
  ```bash
  curl -H "x-api-key: test-api-key-123" \
       -H "Content-Type: application/json" \
       -d '{"name":"Tablet"}' \
       -X POST http://localhost:5173/api/data
  ```
- **Body**:
  ```json
  {
    "name": "string" // Required
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": 3,
    "name": "Tablet"
  }
  ```
- **Errors**:
  - 400 Bad Request: `{"error": "Name is required"}` (missing `name`)
  - 401 Unauthorized: `{"error": "API key required"}` or `{"error": "Invalid API key"}`

### 4. Delete Item
- **Endpoint**: `DELETE /api/data/:id`
- **Description**: Removes an item by ID.
- **Authentication**: Required (`x-api-key`)
- **Request** (Direct):
  ```bash
  curl -H "x-api-key: test-api-key-123" \
       -X DELETE http://localhost:3000/api/data/1
  ```
- **Request** (Vite Proxy):
  ```bash
  curl -H "x-api-key: test-api-key-123" \
       -X DELETE http://localhost:5173/api/data/1
  ```
- **Response** (200 OK):
  ```json
  {
    "message": "Item deleted"
  }
  ```
- **Errors**:
  - 404 Not Found: `{"error": "Item not found"}` (invalid ID)
  - 401 Unauthorized: `{"error": "API key required"}` or `{"error": "Invalid API key"}`

### 5. Proxy List Items
- **Endpoint**: `GET /proxy/data`
- **Description**: Fetches all items for the UI or testing, using the server-side `.env` API key to authenticate against `/api/data`. Bypasses client-side authentication.
- **Authentication**: None (server handles key)
- **Significance**:
  - **Security**: Eliminates hardcoded API keys in client-side code, preventing exposure in browser dev tools.
  - **Ease of Use**: Simplifies UI integration (no key management) and allows quick testing without auth headers.
  - **Cool Factor**: Enables real-time data display in the UI (`http://localhost:5173`) alongside logs, making monitoring seamless.
  - **Usefulness**: Ideal for dev/testing, prototyping, or scenarios where clients (UI, scripts) shouldn’t handle keys directly.
- **Request** (Direct):
  ```bash
  curl http://localhost:3000/proxy/data
  ```
- **Request** (Vite Proxy):
  ```bash
  curl http://localhost:5173/proxy/data
  ```
- **Response** (200 OK):
  ```json
  [
    {"id": 1, "name": "Book"},
    {"id": 2, "name": "Pen"}
  ]
  ```
- **Errors**:
  - 500 Internal Server Error: `{"error": "Internal server error"}` (e.g., database or key issue)
- **UI Integration**:
  - The UI at `http://localhost:5173` polls `/proxy/data` every 5 seconds, displaying items in a table next to real-time logs.
  - No client-side API key needed, as the server uses `.env` (`API_KEY`).

## Notes
- **Database**: SQLite, in-memory (`:memory:`) or file-based (`database.db`). In-memory resets on restart; use `database.db` for persistence.
- **Logs**: Requests/errors logged to `logs/app.log`, viewable in UI (`http://localhost:5173`) via WebSocket.
- **Security**:
  - API key in `.env` (`API_KEY`) for `/api/data` endpoints.
  - `/proxy/data` is public for dev; secure with authentication (e.g., JWT) in production.
- **Vite Proxy**:
  - Requests to `http://localhost:5173/api/*` or `/proxy/*` are proxied to `http://localhost:3000`.
  - Simplifies UI development and testing.

## Example Workflow
1. Start servers:
   ```bash
   npm start
   ```
2. Check health:
   ```bash
   curl http://localhost:3000/api/health
   ```
3. Add item:
   ```bash
   curl -H "x-api-key: test-api-key-123" \
        -H "Content-Type: application/json" \
        -d '{"name":"Laptop"}' \
        -X POST http://localhost:3000/api/data
   ```
4. List items (authenticated):
   ```bash
   curl -H "x-api-key: test-api-key-123" http://localhost:3000/api/data
   ```
5. List items (proxy, no auth):
   ```bash
   curl http://localhost:5173/proxy/data
   ```
6. Delete item:
   ```bash
   curl -H "x-api-key: test-api-key-123" -X DELETE http://localhost:3000/api/data/1
   ```
7. View in UI:
   - Visit `http://localhost:5173` to see logs and items update in real-time (items via `/proxy/data`, ~5s delay).

# Why the Proxy Endpoint?

The `/proxy/data` endpoint was introduced to remove hardcoded API keys from client-side code (`DataViewer.jsx`), allowing the UI to fetch data securely without exposing the API key (`test-api-key-123`) in the browser. Instead, the server handles authentication using the .env key, making it a secure intermediary for the protected `GET /api/data` endpoint.

This is significant because:

* Security: Prevents API key exposure in client-side JavaScript, reducing the risk of key theft via browser dev tools.
* Simplicity: The UI (or external tools) can fetch data without managing authentication headers, streamlining development.
* Flexibility: Enables public access for dev/testing while allowing future restrictions (e.g., user auth) in production.
* Cool Factor: It’s a neat way to bridge client and server, keeping sensitive logic server-side while providing a seamless UI experience. Real-time data updates in the UI (via polling `/proxy/data`) alongside logs make monitoring a breeze.
* Usefulness: Ideal for prototyping, local dev, and scenarios where the UI needs data without direct API key access. It also supports `curl` testing without auth, which is handy for quick checks.

In production, `/proxy/data` would be secured with authentication (e.g. `authMiddleware`, JWT).