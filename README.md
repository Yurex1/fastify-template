# Fastify Template

A modern, production-ready Fastify template with TypeScript, PostgreSQL, WebSocket support, and comprehensive tooling.

## 🚀 Features

- **Fastify 5.x** - High-performance web framework
- **TypeScript** - Full type safety and modern JavaScript features
- **PostgreSQL** - Robust database with migrations via node-pg-migrate
- **WebSocket Support** - Real-time communication capabilities
- **Swagger/OpenAPI** - Auto-generated API documentation
- **CORS** - Cross-origin resource sharing enabled
- **Environment Configuration** - Flexible environment variable management
- **ESLint + Prettier** - Code quality and formatting
- **Hot Reload** - Development server with automatic restarts

## 📋 Prerequisites

- **Node.js** 20.11.0 or higher
- **PostgreSQL** 14 or higher
- **pnpm** (recommended) or npm

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fastify-template
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database configuration
   ```

4. **Set up the database:**
   ```bash
   # Create your database
   createdb fastify-template-db
   
   # Run migrations
   pnpm migrate:up
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL=postgresql://username@localhost:5432/fastify-template-db

# Server Configuration
SERVER_URL=http://localhost:8080
HTTP_PORT=8080
HOST=0.0.0.0
WS_PORT=9090
```

### Database Setup

The project uses PostgreSQL with peer authentication (no password required for local development). Make sure PostgreSQL is running:

```bash
# On macOS with Homebrew
brew services start postgresql@14

# On Ubuntu/Debian
sudo systemctl start postgresql
```

## 🏃‍♂️ Development

### Available Scripts

```bash
# Development server with hot reload
pnpm dev

# Build the project
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test
```

### Database Migrations

```bash
# Run all pending migrations
pnpm migrate:up

# Rollback the last migration
pnpm migrate:down

# Create a new migration
pnpm migrate:create <migration_name>

# Redo the last migration
pnpm migrate:redo

# Dry run (see what would be executed)
pnpm migrate:up --dry-run
```

For detailed migration documentation, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md).

## 📁 Project Structure

```
fastify-template/
├── src/
│   ├── api/                 # API routes and handlers
│   │   ├── api/            # API-specific code
│   │   └── main.ts         # API server entry point
│   ├── config.ts           # Application configuration
│   ├── data/               # Data access layer
│   ├── entities/           # Database entity definitions
│   ├── infra/              # Infrastructure (database, etc.)
│   ├── main.ts             # Main application entry point
│   ├── server/             # Server configuration
│   │   ├── http.ts         # HTTP server setup
│   │   ├── plugins.ts      # Fastify plugins
│   │   └── ws.ts           # WebSocket server
│   ├── services/           # Business logic services
│   └── utils/              # Utility functions
├── db/
│   └── migrations/         # Database migration files
├── .env                    # Environment variables
├── pgmigrate.json          # Migration configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔧 API Development

### Adding New Routes

1. **Create a new route file** in `src/api/api/`:
   ```typescript
   import { FastifyInstance } from 'fastify';
   import { z } from 'zod';

   const userSchema = z.object({
     username: z.string().min(3),
     email: z.string().email(),
   });

   export default async function userRoutes(fastify: FastifyInstance) {
     fastify.post('/users', {
       schema: {
         body: userSchema,
       },
       handler: async (request, reply) => {
         const userData = request.body;
         // Your logic here
         return { success: true, user: userData };
       },
     });
   }
   ```

2. **The route will be automatically loaded** by the autoload plugin.

### Database Operations

```typescript
import { fastify } from 'fastify';
import { sql } from 'pg';

// In your route handler
const result = await fastify.pg.query(
  sql`SELECT * FROM users WHERE id = ${userId}`
);
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test -- test/user.test.js
```

## 📚 API Documentation

Once the server is running, you can access:

- **Swagger UI**: http://localhost:8080/documentation
- **OpenAPI JSON**: http://localhost:8080/documentation/json

The documentation is automatically generated from your route schemas.

## 🚀 Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Environment Variables for Production

Make sure to set appropriate environment variables for production:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
NODE_ENV=production
```

### Database Migrations in Production

```bash
# Run migrations on production database
pnpm migrate:up
```

## 🛠️ Development Tools

### Code Quality

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

### VS Code Extensions (Recommended)

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- PostgreSQL (for database management)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues:**
- Ensure PostgreSQL is running
- Check your `DATABASE_URL` in `.env`
- Verify database exists: `createdb fastify-template-db`

**Migration Issues:**
- See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed troubleshooting
- Use `pnpm migrate:up --dry-run` to preview changes

**TypeScript Errors:**
- Run `pnpm build` to check for type errors
- Ensure all dependencies are installed: `pnpm install`

### Getting Help

- Check the [Fastify documentation](https://fastify.dev/docs/latest/)
- Review the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for database issues
- Open an issue in the repository

## 🔗 Useful Links

- [Fastify Documentation](https://fastify.dev/docs/latest/)
- [node-pg-migrate Documentation](https://github.com/salsita/node-pg-migrate)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
