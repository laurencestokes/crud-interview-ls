# ⚡ CRUD Interview App

A React/TypeScript CRUD dashboard using Material UI, TanStack React Query, and MSW for API mocking. Features user management, search, notifications. Developer Experience is enhanced through pre-commit hooks, eslint + prettier (which share an ignore file) and a CI pipeline.

[![CI](https://github.com/laurencestokes/crud-interview-ls/actions/workflows/ci.yml/badge.svg)](https://github.com/laurencestokes/crud-interview-ls/actions/workflows/ci.yml)

[**Live Website**](https://lozstokes.co.uk/crud-interview-ls/)

![Statements](./badges/badge-statements.svg)
![Branches](./badges/badge-branches.svg)
![Functions](./badges/badge-functions.svg)
![Lines](./badges/badge-lines.svg)

# Table of Contents
1. [🚀 Quick start guide](#-quick-start-guide)
   1. [Installing](#installing)
   2. [Running locally](#running-locally)
   3. [Usage](#usage)
2. [📝 Contributing Code](#-contributing-code)
   1. [How to contribute summary](#how-to-contribute-summary)
   2. [Version Bumping](#version-bumping)
3. [✅ Testing](#-testing)
4. [📘 Changelog](#-changelog)
5. [License](#license)

## 🚀 Quick start guide

---

### Installing

```sh
git clone <repository-url>
cd crud-interview-ls

yarn install
```

### Running locally

```sh
yarn dev
```

### General Features
- Dashboard UI with Material UI and DataGrid
- User CRUD operations (create, read, update, delete)
- Search, sort, and filter users
- Snackbar notifications for user actions
- Mocked API with MSW for local development
- Robust test coverage and CI/CD

### Version Bumping
Versioning uses SemVer and commits follow the Conventional Commits specification.
1. Make changes
2. Commit those changes
3. Pull all the tags
4. Run `npm version [patch|minor|major]`
5. Stage the `CHANGELOG.md`, `package-lock.json` and `package.json` changes
6. Commit those changes with the release number
7. Push your changes with `git push` and push the tag with `git push origin $tagname` where `$tagname` will be `v$version` e.g. `v1.0.4`

## ✅ Testing

---

![Coverage lines](./badges/badge-lines.svg)
![Coverage functions](./badges/badge-functions.svg)
![Coverage branches](./badges/badge-branches.svg)
![Coverage statements](./badges/badge-statements.svg)

1. Clone the repository
2. Install dependencies: `yarn install`
3. Test: `yarn test`
4. Coverage: `yarn test-coverage`

## 📘 Changelog

---

See [CHANGELOG.md](./CHANGELOG.md)

## License

MIT License

## Releases


### Versioning
Versioning uses SemVer and commits follow the Conventional Commits specification.

1. Make changes
2. Commit those changes
3. Pull all the tags
4. Run `npm version [patch|minor|major]`
5. Stage the `CHANGELOG.md`, `package-lock.json` and `package.json` changes
6. Commit those changes with the release number
7. Push your changes with `git push` and push the tag with `git push origin $tagname` where `$tagname` will be `v$version` e.g. `v1.0.4`

### Deploying to GitHub Pages

To deploy the app to GitHub Pages:

1. Ensure the `homepage` field in `package.json` is set to `"https://<your-username>.github.io/crud-interview-ls/"`.
2. Ensure the `base` option in `vite.config.ts` matches the subpath (e.g. `/crud-interview-ls/`).
4. Deploy to GitHub Pages:
   ```sh
   yarn deploy
   ```

---

Endpoints used to retrieve/manipulate mocked data are implemented using MSW library (https://mswjs.io/) and MSW data (https://github.com/mswjs/data).

### List of available BFF endpoints:

GET - https://example.com/user - Retrieve all available users  
GET - https://example.com/user/:id - Retrieve user with a certain id  
POST - https://example.com/user - Create a new user. Provide first name  
PUT - https://example.com/user/:id - Edit a user. Provide first name  
DELETE - https://example.com/user/:id - Delete a user
