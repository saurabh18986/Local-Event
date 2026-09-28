# Local Event Hub

A MERN stack local event discovery and management platform for finding nearby events such as games, concerts, and developer meetups.

## Run Locally

### Install dependencies

From the project root:

```bash
npm run install:all
```

### Start the project

Run the frontend and backend together:

```bash
npm run dev
```

Open the application at:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/api/health

### Run services separately

Backend:

```bash
npm run server
```

Frontend, in another terminal:

```bash
npm run client
```

The frontend proxies API requests to `http://localhost:5000`.
