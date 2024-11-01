# Full Stack Content API Example

An example repository containing a Pocketbase instance to store API keys and
basic content associated with a user account, a Next.js application to register
and login to accounts, create content, and generate API keys, and a custom API
server built in Golang with gin and cobra to fetch and query for user content
with the generated API keys.

## Setup

### Pre-requisites

- [Lando](https://lando.dev/download/)

### Local environment

1. Run `lando start`
2. Run `lando next` to start the frontend
3. In another terminal, run `lando api` to start the API server

## Authentication flow

1. Go to https://authexample.lndo.site/register
2. Register an account
3. Go to https://authexample.lndo.site/login
4. Login with the created account
5. You will be redirected to `/content`
6. Create some content
7. Go to https://authexample.lndo.site/api-keys`
8. Generate an API key
9. Make a `curl` request with the email you used to register and the API key
you generated like this:

```shell
curl -X GET "http://api.authexample.lndo.site/api/content?email=<email>" \
  -H "Authorization: Bearer <API key>"
```

Example:

```shell
curl -X GET "http://api.authexample.lndo.site/api/content?email=example1@example.com" \
  -H "Authorization: Bearer 79d4805877d7f8b3c9410a51cb8a26845103eca7d0dd00bf7f6a18bbbcd82d44"
```

## Developer info

### Next.js frontend

Read through the `frontend/middleware.ts` and `frontned/app/actions.ts` to see
how the authentication flow works with Pocketbase and Next.js

Read through `frontend/app/login/page.tsx` and `frontend/app/register.page.tsx`
to see how the frontend interacts with the middleware and server actions.

The dashboards for /content and /api-keys use a server component for the
authenticated portion of the pages and client components with calls to Next.js
API routes for rendering the dashboards and making the CRUD requests to
Pocketbase.

### API server (Golang with gin)

The API server runs on gin and is built with Cobra and Viper libraries to store
default credentials to Pocketbase (for the API server connection) and to
provide a CLI for running the server.

Read through `server/cmd/serve.go` to see how the server itself runs.

Initial connection is handled via `server/internal/token_manager.go` which
generates a token for the admin connection to Pocketbase, which is needed to
fetch rows from collections when the account owner is not the user who is
requesting them.

The server finds a user account ID from the provided email in the URL and then
gets all of the hashed API keys stored for that given account.

Each hashed API key is compared to the raw key the user provides in their
request headers using bcrypt, and once verified as a match to a key on the
account, will allow for fetching and returning a JSON response of the user's
content.

## Pocketbase (database)

You can login to Pocketbase to check logs and collection information with the
credentials stored in `.lando.env` and by navigating to:
https://db.authexample.lndo.site

API rules are set on the example_content and api_keys collections to prevent
users from accessing other users' data.

--- 

Originally researched Pocketbase + Next.js authentication here: 
https://github.com/heloineto/nextjs-13-pocketbase-auth-example