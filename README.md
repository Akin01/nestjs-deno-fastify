# Deno Nestjs Fastify

## Project Overview
This is a template RESTful API built with NestJS running on Deno, using Fastify as the HTTP server framework. It provides a simple CRUD operations example.

## Features
- Built on Deno runtime environment
- NestJS framework for structured application development
- Fastify for high-performance HTTP server
- Environment configuration using dotenv
- Data persistence using Deno KV
- Pagination for user listing endpoint (`GET /users`)

## Setup

### Prerequisites
- Deno runtime installed (version 1.40.0 or higher recommended for Deno KV features used)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd [repository-directory-name] # Navigate into the project directory

# (Optional but recommended) Check Deno tasks defined in deno.json
deno task
```
*Note: The `deno install --allow-scripts` command is typically for installing scripts as executables, not for installing project dependencies. Deno manages dependencies via imports and the `deno.json` file.*

### Configuration
The project uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
```

### Running the Application
To run the application, Deno requires explicit permissions. The necessary permissions (including `--allow-kv` for Deno KV access) are pre-configured in the `deno.json` tasks.

```bash
# Run in development mode with auto-restarts
deno task start:dev

# Run for production
deno task start
```
These tasks (`start:dev`, `start`) defined in `deno.json` already include the `-A` flag (allow all permissions) or specific flags like `--allow-kv`, `--allow-env`, and `--allow-net`. For Deno KV, the `--allow-kv` permission is essential.

### Compile for Production
```bash
# Compile the application
deno task build
```
The `build` task in `deno.json` also includes necessary permissions for compilation, including `--allow-kv` if the application logic directly initializes KV at compile time (though typically KV access is a runtime concern).

Running the compiled application:
```bash
# For Windows
./main.exe

# For Linux/macOS
./main
```
When running the compiled binary, it inherits the permissions baked into it during compilation.

## API Endpoints

The application provides CRUD operations for users.

### `GET /users` - List Users with Pagination

Retrieves a list of users with pagination.

**Query Parameters:**

*   `page` (optional): The page number to retrieve.
    *   Type: `number`
    *   Default: `1`
    *   Minimum: `1`
*   `limit` (optional): The number of users to retrieve per page.
    *   Type: `number`
    *   Default: `10`
    *   Minimum: `1`

**Example Request:**

```
GET /users?page=2&limit=5
```

**Example Response:**

```json
{
  "data": [
    {
      "id": "user-id-6",
      "name": "User Six",
      "age": 28
    },
    // ... up to 4 more users
  ],
  "total": 100,
  "page": 2,
  "limit": 5,
  "totalPages": 20
}
```
**Response Structure:**

*   `data`: An array of user objects for the current page.
*   `total`: The total number of users in the database.
*   `page`: The current page number.
*   `limit`: The number of items per page.
*   `totalPages`: The total number of pages available.

### Other Endpoints

*   **`POST /users`**: Creates a new user.
    *   Request Body: `UserDto` (e.g., `{ "name": "John Doe", "age": 30 }`)
*   **`GET /users/:id`**: Retrieves a specific user by their ID.
*   **`PUT /users/:id`**: Updates a specific user by their ID.
    *   Request Body: `UserDto` (e.g., `{ "name": "John Updated", "age": 31 }`)
*   **`DELETE /users/:id`**: Deletes a specific user by their ID.
```