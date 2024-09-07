---
title: QuickStart
---
## **Prerequisites**

To run the project you need to have multiple things:

- Node.js (version 18+)

- PostgreSQL (or any other SQL database)

- Redis

- Resend account

- Cloudflare R2 for uploads (optional, can use local machine)

- Social Media Client and Secret (more details later)

&nbsp;

### **NodeJS (version 18+)**

A complete guide of how to install NodeJS can be found [**here**](https://nodejs.org/en/download/).

&nbsp;

## **Installation**

1. **Clone the repository**

```bash
git clone https://github.com/gitroomhq/gitroom

```

2. **Copy environment variables**

&nbsp;&nbsp;&nbsp;&nbsp;Copy the `.env.example` file to `.env` and fill in the values

```bash
DATABASE_URL="postgres database URL"
REDIS_URL="redis database URL"
JWT_SECRET="random string for your JWT secret, make it long"
FRONTEND_URL="By default: http://localhost:4200"
NEXT_PUBLIC_BACKEND_URL="By default: http://localhost:3000"
BACKEND_INTERNAL_URL="If you use docker, you might want something like: http://backend:3000"
X_API_KEY="Twitter API key for normal oAuth not oAuth2"
X_API_SECRET="Twitter API secret for normal oAuth not oAuth2"
LINKEDIN_CLIENT_ID="Linkedin Client ID"
LINKEDIN_CLIENT_SECRET="Linkedin Client Secret"
REDDIT_CLIENT_ID="Reddit Client ID"
REDDIT_CLIENT_SECRET="Linkedin Client Secret"
GITHUB_CLIENT_ID="GitHub Client ID"
GITHUB_CLIENT_SECRET="GitHub Client Secret"
RESEND_API_KEY="Resend API KEY"
UPLOAD_DIRECTORY="optional: your upload directory path if you host your files locally"
NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY="optional: your upload directory slug if you host your files locally"
CLOUDFLARE_ACCOUNT_ID="Cloudflare R2 Account ID"
CLOUDFLARE_ACCESS_KEY="Cloudflare R2 Access Key"
CLOUDFLARE_SECRET_ACCESS_KEY="Cloudflare R2 Secret Access Key"
CLOUDFLARE_BUCKETNAME="Cloudflare R2 Bucket Name"
CLOUDFLARE_BUCKET_URL="Cloudflare R2 Backet URL"
NX_ADD_PLUGINS=false
IS_GENERAL="true" # required for now

```

3. **Install the dependencies**

```bash
npm install

```

4. **Setup postgres & redis via docker compose**

```bash
docker compose -f "docker-compose.dev.yaml" up

```

5. **Generate the prisma client and run the migrations**

```bash
npm run prisma-db-push

```

6. **Run the project**

```bash
npm run dev
```

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBc29jcG9zdCUzQSUzQWRpbmlyaWNoYXJk" repo-name="socpost"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
