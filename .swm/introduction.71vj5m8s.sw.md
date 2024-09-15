---
title: Introduction
---
## **What is SocPost?**

Gitroom can help you launch your open-source tool every week

- Schedule social media and articles.

- Exchange or buy posts from other members.

- Monitor your GitHub trending, and so much more.

## [**​**](https://docs.postiz.com/introduction#architecture)

Architecture

Gitroom is an [**NX monorepo**](https://nx.dev/) that contains a backend, a frontend, workers, cron jobs and the docs.\
\
Unlike other NX project, this project has one `.env` file that is shared between all the apps.\
It makes it easier to develop and deploy the project.\
\
When deploying to websites like [**Railway**](https://railway.app/) or [**Heroku**](https://heroku.com/), you can use a shared environment variables for all the apps.

**It has four main components:**

- `frontend` - Angular control panel serving as the admin dashboard for the project.

- `backend` - NestJS backend that serves as the API for the frontend.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBc29jcG9zdCUzQSUzQWRpbmlyaWNoYXJk" repo-name="socpost"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
