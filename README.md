# Deno Nestjs Fastify

## Project Overview
This is a template RESTful API built with NestJS running on Deno, using Fastify as the HTTP server framework. It provides a simple CRUD operations example.

## Features
- Built on Deno runtime environment
- NestJS framework for structured application development
- Fastify for high-performance HTTP server
- Environment configuration using dotenv

## Setup

### Prerequisites
- Deno runtime installed (version 2.2 or higher)

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
deno install --allow-scripts
```

### Configuration
The project uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
```

### Running the Application
```bash
deno task start:dev
```

### Compile for Production
```bash
# Compile the application
deno task build

# Run the compiled application for windows
./main.exe

# Run the compiled application for linux
./main
```