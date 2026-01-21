# Time Tracker Application

A comprehensive time tracking application with React/Next.js frontend and NestJS backend.

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Ant Design
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Containerization**: Docker, Docker Compose

## Getting Started

### Option 1: Docker Setup (Recommended)

1. Make sure you have Docker and Docker Compose installed on your system.

2. Clone the repository and navigate to the project root directory.

3. The docker-compose.yml sets up the backend service to run on port 3000.

4. To run the complete application with both backend and frontend:

   a. Start the backend API service:
   ```bash
   docker-compose up --build
   ```

   b. In a separate terminal, navigate to the `nextjs-app` directory:
   ```bash
   cd nextjs-app
   ```

   c. Install frontend dependencies:
   ```bash
   npm install
   ```

   d. Create a `.env.local` file in the `nextjs-app` directory with the following content:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

   e. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. The backend API will be accessible at [http://localhost:3000/](http://localhost:3000/)
6. The frontend will be accessible at [http://localhost:3001/](http://localhost:3001/) (or the next available port)

### Option 2: Development Setup (Manual)

#### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

#### Steps

1. **Set up the backend (NestJS API)**:
   - Navigate to the `nestjs` directory: `cd nestjs`
   - Install dependencies: `npm install`
   - Set up your PostgreSQL database and configure the connection in `.env.development`
   - Start the backend: `npm run start:dev`
   - The API will be running on [http://localhost:3000/](http://localhost:3000/)

2. **Set up the frontend (Next.js)**:
   - Navigate to the `nextjs-app` directory: `cd nextjs-app`
   - Install dependencies: `npm install`
   - Create a `.env.local` file in the `nextjs-app` directory with the following content:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:3000
     ```
   - Start the frontend: `npm run dev`
   - The frontend will be running on [http://localhost:3001/](http://localhost:3001/) (or the next available port)

3. Access the application at [http://localhost:3001/](http://localhost:3001/) (frontend) with the backend API at [http://localhost:3000/](http://localhost:3000/)

## Available Scripts

### Backend (nestjs directory)
- `npm run start` - Start the application in development mode
- `npm run start:dev` - Start the application with auto-reload on file changes
- `npm run start:debug` - Start the application in debug mode
- `npm run start:prod` - Start the production build
- `npm run build` - Build the application
- `npm run seed:projects` - Seed default projects

### Frontend (nextjs-app directory)
- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server

## Configuration

### Environment Variables

#### Backend (nestjs/.env.development)
- `DB_NAME` - PostgreSQL database name
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USERNAME` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password

#### Frontend (nextjs-app/.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., http://localhost:3000)

## Troubleshooting

### Docker Issues
If you encounter issues while running the project with Docker, try cleaning up your Docker resources:

```bash
docker system prune -af
docker stop $(docker ps -q)
docker rmi $(docker images -q)
docker rm $(docker ps -a -q)
```

### Database Connection Issues
- Ensure PostgreSQL is running and accessible
- Verify your database credentials in the environment files
- Check that the database specified in `DB_NAME` exists

## Project Structure

- `nestjs/` - Backend API built with NestJS
- `nextjs-app/` - Frontend application built with Next.js
- `docker-compose.yml` - Docker Compose configuration for running the entire application stack

![db](db-shema.png)
