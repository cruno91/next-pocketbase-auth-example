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
2. Run `lando npm run dev`
3. Go to https://authexample.lndo.site

## Pocketbase

Login credentials to the Pocketbase admin are in `.lando.env`.

## Authentication flow

1. Go to https://authexample.lndo.site/register
2. Register an account
3. Go to https://authexample.lndo.site/login
4. Login with the created account
5. You will be redirected to `/api-keys`
6. You can add and delete api keys
7. You can navigate to `/content`
8. You can add, edit, and delete content here

## Developer info

Read through the `frontend/middleware.ts` and `frontned/app/actions.ts` to see
how the authentication flow works with Pocketbase.

Read through `frontend/app/login/page.tsx` and `frontend/app/register.page.tsx`
to see how the frontend interacts with the middleware and server actions.

Originally researched via https://github.com/heloineto/nextjs-13-pocketbase-auth-example