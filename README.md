# Socpost

## Intro

-   Schedule all your social media posts (many AI features)
-   Measure your work with analytics.
-   Collaborate with other team members to exchange or buy posts.
-   Invite your team members to collaborate, comment, and schedule posts.
-   At the moment there is no difference between the hosted version to the self-hosted version

## Tech Stack

-   NX (Monorepo)         <a  alt="Nx logo"  href="https://nx.dev"  target="_blank"  rel="noreferrer"><img  src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png"  width="45"></a>
-   Nest.Js
-   Angular
-   Prisma (Default to PostgreSQL)
-   Redis (BullMQ)
-   Docker

## Installation

1.  **Clone the repository**
    

```bash
git clone https://github.com/dinirichard/socpost

```

2.  **Copy environment variables**
    

Copy the `.env.example` file to `.env` and fill in the values

```bash
DATABASE_URL="postgres database URL"
REDIS_URL="redis database URL"
JWT_SECRET="random string for your JWT secret, make it long"
FRONTEND_URL="By default: http://localhost:4200"
NEXT_PUBLIC_BACKEND_URL="By default: http://localhost:3000"
BACKEND_INTERNAL_URL="If you use docker, you might want something like: http://backend:3000"
YOUTUBE_CLIENT_ID="YouTube Client Id"
YOUTUBE_CLIENT_SECRET="YouTube Client Secret"
GITHUB_CLIENT_ID="GitHub Client ID"
GITHUB_CLIENT_SECRET="GitHub Client Secret"
RESEND_API_KEY="Resend API KEY"
UPLOAD_DIRECTORY="optional: your upload directory path if you host your files locally"
NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY="optional: your upload directory slug if you host your files locally"
NX_ADD_PLUGINS=false
IS_GENERAL="true" # required for now

```

3.  **Install the dependencies**
    

```bash
npm install

```

4.  **Setup postgres & redis via docker compose**
    

```bash
docker compose -f "docker-compose.dev.yaml" up

```

5.  **Generate the prisma client and run the migrations**
    

```bash
npm run prisma-db-push

```

6.  **Run the project**
    

```bash
npm run devApp
```