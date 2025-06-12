# CRUD Interview App

[![CI](https://github.com/laurencestokes/crud-interview-ls/actions/workflows/ci.yml/badge.svg)](https://github.com/laurencestokes/crud-interview-ls/actions/workflows/ci.yml)

![Statements](./badges/badge-statements.svg)
![Branches](./badges/badge-branches.svg)
![Functions](./badges/badge-functions.svg)
![Lines](./badges/badge-lines.svg)

This project is a simple CRUD Front End built with ReactJS, using TypeScript, TanStack React Query, and Material UI.

## Prerequisites

- Node.js (v14 or higher)
- Yarn

## Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd crud-interview
   ```

2. Install dependencies:
   ```sh
   yarn install
   ```

## Available Scripts

- **Development:**
  ```sh
  yarn dev
  ```

- **Build:**
  ```sh
  yarn build
  ```

- **Lint:**
  ```sh
  yarn lint
  ```

- **Format:**
  ```sh
  yarn format
  ```

- **Type Check:**
  ```sh
  yarn check-types
  ```

- **Validate (Lint, Format, Type Check, Build):**
  ```sh
  yarn validate
  ```

- **Run Tests:**
  ```sh
  yarn test
  ```

- **Run Tests with Coverage:**
  ```sh
  yarn test-coverage
  ```

- **Generate Coverage Badges:**
  ```sh
  yarn test:badges
  ```

## Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. Commits are linted using `commitlint` and `husky`.

## Code Quality

- **Prettier** is used for code formatting.
- **ESLint** is used for linting.
- **TypeScript** is used for type checking.

## License

This project is licensed under the MIT License.

Endpoints used to retrieve/manipulate mocked data are implemented using MSW library (https://mswjs.io/) and MSW data (https://github.com/mswjs/data).

## List of available BFF endpoints:

GET - https://example.com/user - Retrieve all available users  
GET - https://example.com/user/:id - Retrieve user with a certain id  
POST - https://example.com/user - Create a new user. Provide first name  
PUT - https://example.com/user/:id - Edit a user. Provide first name  
DELETE - https://example.com/user/:id - Delete a user
