# E2E Tests

This directory contains end-to-end tests for your Fastify application.

## Test Files

- `e2e.test.js` - Complete test suite covering all endpoints
- `auth.test.js` - Focused tests for authentication endpoints
- `user.test.js` - Focused tests for user management endpoints

## Prerequisites

Before running the tests, make sure:

1. Your application is built: `npm run build`
2. Your application is running: `npm start`
3. Your database is set up and accessible
4. Environment variables are configured (see `.env` file)

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Auth Tests Only
```bash
npm run test:auth
```

### User Tests Only
```bash
npm run test:user
```

### Node.js Test Runner
```bash
npm test
```

## Test Configuration

The tests assume your application is running on `http://localhost:8080`. If your app runs on a different port, update the `BASE_URL` constant in the test files.

## What the Tests Cover

### Auth API Tests
- ✅ User sign up
- ✅ User sign in (with email and username)
- ✅ Token verification
- ✅ Token refresh
- ✅ Password change
- ✅ Sign out
- ✅ Error handling (duplicate emails, wrong passwords, etc.)

### User API Tests
- ✅ User creation
- ✅ User lookup (by email, username, ID)
- ✅ User updates
- ✅ User deletion
- ✅ Existence checks
- ✅ Error handling (duplicate usernames, non-existent users, etc.)

### Health Check
- ✅ API health endpoint

## Test Results

Tests will output:
- ✅ Passed tests
- ❌ Failed tests
- 📊 Summary of results
- 🎯 Overall pass/fail status

## Troubleshooting

### Common Issues

1. **Connection refused**: Make sure your app is running
2. **Database errors**: Check your database connection and migrations
3. **Authentication errors**: Verify JWT configuration
4. **Port conflicts**: Ensure port 8080 is available

### Debug Mode

To see more detailed output, you can modify the test files to log request/response details.

## Adding New Tests

To add new tests:

1. Create a new test file or add to existing ones
2. Use the `makeRequest` helper function
3. Follow the existing pattern for assertions
4. Add the test to the results summary

Example:
```javascript
async function testNewFeature() {
  console.log('🧪 Testing new feature...');
  
  const response = await makeRequest('POST', '/new-endpoint', {
    data: 'test'
  });
  
  if (response.status === 200) {
    console.log('  ✅ New feature passed');
    return true;
  } else {
    console.log('  ❌ New feature failed:', response.body);
    return false;
  }
}
```
