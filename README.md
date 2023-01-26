# Library Server

Server for the Library project, containing routes, authentications and validations.

## Tech

This project is built in Node.js using TypeScript and some other libs like:

- [TypeScript](https://www.typescriptlang.org/) - TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.
- [Express](https://expressjs.com/) - Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties
- [dotenv](https://www.npmjs.com/package/dotenv) - Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env
- [Yup](https://www.npmjs.com/package/yup) - Yup is a JavaScript schema builder for value parsing and validation.

 (for more libs look package.json)

## Installation

Install the dependencies and devDependencies

```sh
npm i
```


## How to use

Start the server

```sh
npm run dev
```

After installing the dependencies and starting the servers, the server will be running on port 3000 on your localhost: [http://localhost:3000/](http://localhost:3000/)

## Routes

**Method GET "/books"** - Route used to return a list of all books.
**Method GET "/books/rent"** - Route used to return a list of all rent history of books.
**Method GET "/books/:id"** - Route used to return a specific book by id.
**Method POST "/books"** - Route used to add a new book with validation.
**Method PUT "/books/:id"** - Route used to edit a specific book by id with validation.
**Method POST "/books/:id/rent"** - Route used to add a rent history for a specific book by id with validation.
**Method PUT "/books/:id/rent"** - Route used to rent a book by its id.
**Method PATCH "/books/:id/rent"** - Route used to return a book by its id.
**Method GET "/books/:id/rent"** - Route used to get the rent history of a book by its id.
**Method PATCH "/books/:id/status"** - Route used to update a book status by its id.
**Method POST "/user"** - Route used to validate a user and generate an access token if the user is valid.
**Method GET "/validate-token"** - Route used to validate an access token.