# Fastify Template

A modern, production-ready Fastify.js template with TypeScript, PostgreSQL, JWT authentication, and comprehensive testing setup.

## 🚀 Features

- **Fastify.js 5.x** - High-performance web framework
- **TypeScript** - Full type safety and modern JavaScript features
- **PostgreSQL** - Robust database with migrations via node-pg-migrate
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Typed Database Client** - Type-safe database queries without manual casting
- **Comprehensive Testing** - Full test coverage with Node.js test runner
- **Database Migrations** - Automated schema management
- **JSON Schema Validation** - Type-safe request/response validation
- **Swagger/OpenAPI** - Auto-generated API documentation
- **CORS** - Cross-origin resource sharing enabled
- **Environment Configuration** - Flexible environment variable management
- **ESLint + Prettier** - Code quality and formatting
- **Hot Reload** - Development server with automatic restarts

## ✨ Typed Database Client

This template includes a typed database client that automatically infers return types from your queries, eliminating the need for manual type casting with `as User`.

### Before (with manual casting):

```typescript
const result = await pool.query(query, params);
return result.rows[0] as User;
```

### After (with typed client):

```typescript
const result = await pool.queryOne<User>(query, params);
return result!;
```

### Available Methods:

- `query<T>()` - Returns full result with rows and rowCount
- `queryOne<T>()` - Returns single row or null
- `queryAll<T>()` - Returns array of rows
- `end()` - Closes the database connection

### Example Usage:

```typescript
// Single user query
const user = await pool.queryOne<User>('SELECT * FROM users WHERE id = $1', [userId]);

// Multiple users query
const users = await pool.queryAll<User>('SELECT * FROM users');

// Full result with metadata
const result = await pool.query<User>('SELECT * FROM users WHERE active = $1', [true]);
console.log(`Found ${result.rows.length} active users`);
```

## 🏗️ EntityRepo - Generic CRUD Repository

This template includes a generic `EntityRepo` class that provides automatic CRUD operations for any entity. Simply extend this class and get all basic database operations for free!

### Features:

- **Automatic CRUD operations**: `create`, `findOne`, `findById`, `findAll`, `update`, `remove`, `exists`
- **Type-safe**: Full TypeScript support with proper typing
- **Extensible**: Add custom methods while keeping all basic operations
- **Consistent interface**: Same pattern for all entities

### How to Use:

1. **Define your entity** (must extend `BaseEntity`):

```typescript
import type { BaseEntity } from '../data/EntityRepo';

interface Product extends BaseEntity {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

2. **Create your repository class**:

```typescript
import { EntityRepo } from '../data/EntityRepo';

class ProductRepository extends EntityRepo<Product> {
  constructor(pool: TypedPool) {
    super(pool, 'products', ['id', 'name', 'price', 'category', 'inStock', 'createdAt', 'updatedAt']);
  }

  // Add custom methods
  async findByCategory(category: string): Promise<Product[]> {
    const { query, params } = this.buildSelectByCategoryQuery(category);
    return await this.pool.queryAll<Product>(query, params);
  }
}
```

3. **Use the repository**:

```typescript
// Automatic CRUD operations
const product = await productRepo.create({
  name: 'Laptop',
  price: 999.99,
  category: 'Electronics',
  inStock: true,
});

const allProducts = await productRepo.findAll();
const laptop = await productRepo.findById(1);
const updated = await productRepo.update(1, { price: 899.99 });
const removed = await productRepo.remove(1);

// Custom methods
const electronics = await productRepo.findByCategory('Electronics');
```

### Available Methods:

**Basic CRUD (inherited from EntityRepo):**

- `create(data)` - Create a new entity
- `findOne(definition)` - Find one entity by criteria
- `findById(id)` - Find entity by ID
- `findAll()` - Get all entities
- `update(id, data)` - Update an entity
- `remove(id)` - Delete an entity
- `exists(definition)` - Check if entity exists
- `existsById(id)` - Check if entity exists by ID

See `src/data/EntityRepo.example.ts` for a complete example.

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
   # Create .env file with required variables
   touch .env
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

Create a `.env` file in the project root with the following variables:

```bash
# Server Configuration
SERVER_URL=http://localhost:8080
HTTP_PORT=8080
HOST=0.0.0.0

# Database Configuration
PG_HOST=localhost
PG_PORT=5432
PG_USER=your_username
PG_DATABASE=fastify-template-db
PG_PASSWORD=your_password
DATABASE_URL=your_database_url

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Environment
NODE_ENV=development

#CORS
CORS_ALLOWED_ORIGINS=your_cors_allowed_origins
```

### Database Setup

The project uses PostgreSQL. Make sure PostgreSQL is running:

```bash
# On macOS with Homebrew
brew services start postgresql@14

# On Ubuntu/Debian
sudo systemctl start postgresql

# On Windows
# Start PostgreSQL service from Services
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

# Run specific test suites
pnpm test:auth
pnpm test:user

# Linting and formatting
pnpm lint
pnpm lint:fix
pnpm lint:check
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

# Run migrations with custom command
pnpm migrate
```

For detailed migration documentation, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md).

## 📁 Project Structure

```
fastify-template/
├── src/
│   ├── api/                # API routes and handlers
│   │   ├── auth/           # Authentication endpoints
│   │   ├── chats/          # Chats endpoints
│   │   ├── healthCheck/    # Health check endpoints
│   │   ├── photo/          # Photo management endpoints
│   │   ├── post/           # Post management endpoints
│   │   ├── user/           # User management endpoints
│   │   ├── main.ts         # API server entry point
│   │   ├── schemas.ts      # Shared schemas
│   │   └── types.ts        # API types
│   ├── config.ts           # Application configuration
│   ├── data/               # Data access layer
│   │   ├── chat/           # Chat data operations
│   │   ├── chatMember/     # Chat member data operations
│   │   ├── message/        # Message data operations
│   │   ├── post/           # Post data operations
│   │   ├── user/           # User data operations
│   │   ├── session/        # Session data operations
│   │   ├── EntityRepo.ts   # Base abstract repository and SQL builder for automated CRUD operations
│   │   ├── main.ts         # Data layer initialization
│   │   └── types.ts        # Data layer types
│   ├── entities/           # Database entity definitions
│   │   ├── chat.ts         # Chat entity
│   │   ├── message.ts      # Message entity
│   │   ├── post.ts         # Post entity
│   │   ├── session.ts      # Session entity
│   │   └── user.ts         # User entity
│   ├── firebase/           # Firebase infrastructure and services
│   │   └── notification/   # Push notification service using Firebase Admin SDK
│   ├── infra/              # Infrastructure (database, etc.)
│   │   └── pg.ts           # PostgreSQL connection
│   ├── main.ts             # Main application entry point
│   ├── server/             # Server configuration
│   │   ├── http.ts         # HTTP server setup
│   │   ├── plugins.ts      # Fastify plugins
│   │   ├── types.ts        # Server types
│   │   └── ws.ts           # WebSocket server
│   ├── services/           # Business logic services
│   │   ├── auth/           # Authentication service
│   │   ├── chat/           # Chat service
│   │   ├── post/           # Post service
│   │   ├── s3/             # S3 service
│   │   ├── service/        # Service for monitoring API availability and status
│   │   ├── user/           # User service
│   │   ├── main.ts         # Service initialization
│   │   └── types.ts        # Service types
│   └── utils/              # Utility functions
│       ├── cookies/        # Cookies utilities
│       ├── env/            # Environment utilities
│       ├── exception/      # Exception handling
│       ├── passwords/      # Password utilities
│       ├── rowSql/         # SQL utilities
│       └── sessions/       # Session management
├── db/
│   └── migrations/         # Database migration files
├── test/                   # Test files
├── dist/                   # Build output
├── .env                    # Environment variables
├── pgmigrate.json          # Migration configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔧 API Development

### System Endpoints

- `GET /api/health-check` - Health check endpoint

### Authentication Endpoints

The template includes a complete JWT authentication system:

- `POST /auth/sign-up` - User registration
- `POST /auth/sign-in` - User login
- `POST /auth/refresh` - Refresh access token
- `PUT /auth/change-password` - Change user password
- `POST /auth/sign-out` - User logout

### User Management Endpoints

- `GET /user/get-all` - Get all users
- `GET /user/:id` - Get user by ID
- `PUT /user/:id` - Update user
- `DELETE /user/:id` - Delete user
- `PUT /user/:id/update-email` - Update user email

### Adding New Routes

1. **Create a new route file** in `src/api/`:

   ```typescript
   import { FastifyInstance } from 'fastify';
   import { Services } from '../services/types';

   export default async function userRoutes(fastify: FastifyInstance, services: Services) {
     fastify.get('/users', {
       schema: {
         type: 'object',
         properties: {},
         required: [],
       },
       handler: async (request, reply) => {
         const users = await services.user.findAll();
         return { success: true, users };
       },
     });
   }
   ```

2. **Register the route** in `src/api/main.ts`:

   ```typescript
   import { init as userRoutesInit } from './userRoutes';

   export const init = (services: Services): APIs => {
     // ... existing code ...
     const userRoutes = userRoutesInit(services);

     return {
       // ... existing APIs ...
       userRoutes,
     };
   };
   ```

### Database Operations with Typed Client

```typescript
import { TypedPool } from '../infra/pg';

// In your service or repository
const user = await pool.queryOne<User>('SELECT * FROM users WHERE id = $1', [userId]);
const users = await pool.queryAll<User>('SELECT * FROM users WHERE active = $1', [true]);
```

## 🧪 Testing

The project includes comprehensive tests for all endpoints and database operations.

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:auth
pnpm test:user

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test -- test/user.test.js
```

### Test Structure

- **Auth Tests**: Registration, login, token refresh, password change, logout
- **User Tests**: CRUD operations, email updates, user removal
- **Repository Tests**: Direct database access testing

## 📚 API Documentation

Once the server is running, you can access:

- **Swagger UI**: http://localhost:8080/documentation
- **OpenAPI JSON**: http://localhost:8080/documentation/json

The documentation is automatically generated from your route schemas and includes:

- Request/response schemas
- Authentication requirements
- Example requests and responses

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
NODE_ENV=production
SERVER_URL=https://your-domain.com
PG_HOST=your-db-host
PG_USER=your-db-user
PG_PASSWORD=your-secure-password
PG_DATABASE=your-db-name
JWT_SECRET=your-super-secure-jwt-secret
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
- REST Client (for API testing)

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
- Check your environment variables in `.env`
- Verify database exists: `createdb fastify-template-db`
- Check connection with: `psql -h localhost -U your_username -d fastify-template-db`

**Migration Issues:**

- See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed troubleshooting
- Use `pnpm migrate:up --dry-run` to preview changes
- Check migration files in `db/migrations/`

**TypeScript Errors:**

- Run `pnpm build` to check for type errors
- Ensure all dependencies are installed: `pnpm install`
- Check `tsconfig.json` configuration

**JWT Issues:**

- Ensure `JWT_SECRET` is set in your `.env` file
- Check token expiration settings
- Verify token format in requests

### Getting Help

- Check the [Fastify documentation](https://fastify.dev/docs/latest/)
- Review the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for database issues
- Open an issue in the repository

## 🔔 Firebase Push Notifications

This template includes Firebase push notifications support. The health check endpoint automatically sends a notification when called.

### Setup Firebase:

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)

2. **Generate a service account key**:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

3. **Add Firebase environment variables** to your `.env`:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### Usage:

**Health Check Notification:**

- Every time `/api/health-check` is called, a notification is sent to the `health-check` topic
- Notification title: "App Status"
- Notification body: "APP is running"

**Manual Notifications:**

```typescript
// Send to specific device
await notification.sendNotification('device-token', 'Title', 'Message body', { key: 'value' });

// Send to topic
await notification.sendNotificationToTopic('topic-name', 'Title', 'Message body', { key: 'value' });

// Subscribe devices to topic
await notification.subscribeToTopic(['token1', 'token2'], 'topic-name');
```

## 🔗 Useful Links

- [Fastify Documentation](https://fastify.dev/docs/latest/)
- [node-pg-migrate Documentation](https://github.com/salsita/node-pg-migrate)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/) - JWT token debugging
