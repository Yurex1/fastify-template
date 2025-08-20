#!/usr/bin/env node

// Simple E2E tests for your Fastify app
// Assumes the app is already running on localhost:9090

const BASE_URL = 'http://localhost:9000';

async function makeRequest(method, path, body = null, headers = {}) {
  const url = `${BASE_URL}${path}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const responseBody = await response.text();
    
    let jsonBody = null;
    try {
      jsonBody = JSON.parse(responseBody);
    } catch (error) {
      // Response is not JSON
    }

    return {
      status: response.status,
      body: jsonBody || responseBody,
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      body: null,
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('🧪 Testing health check...');
  
  const response = await makeRequest('GET', '/api/health-check');
  
  if (response.status === 200) {
    console.log('  ✅ Health check passed');
    return true;
  } else {
    console.log('  ❌ Health check failed:', response.body);
    return false;
  }
}

async function testAuthSignUp() {
  console.log('🧪 Testing auth sign up...');
  
  const response = await makeRequest('POST', '/auth/sign-up', {
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
  });
  
  if (response.status === 200 && response.body.user) {
    console.log('  ✅ Sign up passed');
    return response.body;
  } else if (response.status === 400 && response.body.message === 'EMAIL_ALREADY_IN_USE') {
    console.log('  ✅ Sign up correctly rejected duplicate email');
    return { user: null, token: null };
  } else {
    console.log('  ❌ Sign up failed:', response.body);
    return null;
  }
}

async function testAuthSignIn() {
  console.log('🧪 Testing auth sign in...');
  
  const response = await makeRequest('POST', '/auth/sign-in', {
    usernameOrEmail: 'test@example.com',
    password: 'password123',
  });
  
  if (response.status === 200 && response.body.token) {
    console.log('  ✅ Sign in passed');
    return response.body;
  } else {
    console.log('  ❌ Sign in failed:', response.body);
    return null;
  }
}

async function testAuthVerify(signInResult) {
  console.log('🧪 Testing auth token verification...');
  
  if (!signInResult || !signInResult.token) {
    console.log('  ❌ No token available');
    return false;
  }
  
  const response = await makeRequest('GET', '/auth/verify', null, {
    authorization: `Bearer ${signInResult.token}`,
  });
  
  if (response.status === 200) {
    console.log('  ✅ Token verification passed');
    return true;
  } else {
    console.log('  ❌ Token verification failed:', response.body);
    return false;
  }
}

async function testUserFindByEmail() {
  console.log('🧪 Testing find user by email...');
  
  const response = await makeRequest('GET', '/user/find-by-username-or-email?value=test@example.com');
  
  if (response.status === 200) {
    console.log('  ✅ Find user by email passed');
    return response.body;
  } else {
    console.log('  ❌ Find user by email failed:', response.body);
    return null;
  }
}

async function testUserFindByUsername() {
  console.log('🧪 Testing find user by username...');
  
  const response = await makeRequest('GET', '/user/find-by-username-or-email?value=testuser');
  
  if (response.status === 200) {
    console.log('  ✅ Find user by username passed');
    return response.body;
  } else {
    console.log('  ❌ Find user by username failed:', response.body);
    return null;
  }
}

async function testUserFindOne(signInResult) {
  console.log('🧪 Testing find user by ID...');
  
  if (!signInResult || !signInResult.token) {
    console.log('  ❌ No token available');
    return false;
  }
  
  const response = await makeRequest('POST', '/user/find-one', {
    definition: { email: 'test@example.com' },
  }, {
    authorization: `Bearer ${signInResult.token}`,
  });
  
  if (response.status === 200) {
    console.log('  ✅ Find user by ID passed');
    return true;
  } else {
    console.log('  ❌ Find user by ID failed:', response.body);
    return false;
  }
}

async function testUserExists() {
  console.log('🧪 Testing user exists check...');
  
  const response = await makeRequest('POST', '/user/is-exists', {
    definition: { email: 'test@example.com' },
  });
  
  if (response.status === 200) {
    console.log('  ✅ User exists check passed');
    return response.body;
  } else {
    console.log('  ❌ User exists check failed:', response.body);
    return null;
  }
}

async function testUserUpdate(signInResult) {
  console.log('🧪 Testing user update...');
  
  if (!signInResult || !signInResult.token) {
    console.log('  ❌ No token available');
    return false;
  }
  
  const response = await makeRequest('PUT', '/user/update/1', {
    username: 'updateduser',
  }, {
    authorization: `Bearer ${signInResult.token}`,
  });
  
  if (response.status === 200) {
    console.log('  ✅ User update passed');
    return true;
  } else {
    console.log('  ❌ User update failed:', response.body);
    return false;
  }
}

async function testUserUpdateEmail(signInResult) {
  console.log('🧪 Testing user email update...');
  
  if (!signInResult || !signInResult.token) {
    console.log('  ❌ No token available');
    return false;
  }
  
  const response = await makeRequest('PUT', '/user/update-email/1', {
    email: 'updated@example.com',
  }, {
    authorization: `Bearer ${signInResult.token}`,
  });
  
  if (response.status === 200) {
    console.log('  ✅ User email update passed');
    return true;
  } else {
    console.log('  ❌ User email update failed:', response.body);
    return false;
  }
}

async function testAuthRefresh(signInResult) {
  console.log('🧪 Testing auth token refresh...');
  
  if (!signInResult || !signInResult.token) {
    console.log('  ❌ No token available');
    return false;
  }
  
  const response = await makeRequest('POST', '/auth/refresh', {}, {
    authorization: `Bearer ${signInResult.token}`,
  });
  
  if (response.status === 200 && response.body.token) {
    console.log('  ✅ Token refresh passed');
    return true;
  } else {
    console.log('  ❌ Token refresh failed:', response.body);
    return false;
  }
}

async function testChangePassword(signInResult) {
  console.log('🧪 Testing change password...');
  
  if (!signInResult || !signInResult.token) {
    console.log('  ❌ No token available');
    return false;
  }
  
  const response = await makeRequest('PUT', '/auth/change-password', {
    oldPassword: 'password123',
    newPassword: 'newpassword123',
  }, {
    authorization: `Bearer ${signInResult.token}`,
  });
  
  if (response.status === 200) {
    console.log('  ✅ Change password passed');
    return true;
  } else {
    console.log('  ❌ Change password failed:', response.body);
    return false;
  }
}

async function testSignOut(signInResult) {
  console.log('🧪 Testing sign out...');
  
  if (!signInResult || !signInResult.token) {
    console.log('  ❌ No token available');
    return false;
  }
  
  const response = await makeRequest('POST', '/auth/sign-out', {}, {
    authorization: `Bearer ${signInResult.token}`,
  });
  
  if (response.status === 200) {
    console.log('  ✅ Sign out passed');
    return true;
  } else {
    console.log('  ❌ Sign out failed:', response.body);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting E2E tests...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  let testResults = {
    healthCheck: false,
    authSignUp: false,
    authSignIn: false,
    authVerify: false,
    userFindByEmail: false,
    userFindByUsername: false,
    userFindOne: false,
    userExists: false,
    userUpdate: false,
    userUpdateEmail: false,
    authRefresh: false,
    changePassword: false,
    signOut: false,
  };
  
  try {
    // Run tests
    testResults.healthCheck = await testHealthCheck();
    
    testResults.authSignUp = await testAuthSignUp();
    
    testResults.authSignIn = await testAuthSignIn();
    
    testResults.authVerify = await testAuthVerify(testResults.authSignIn);
    
    testResults.userFindByEmail = await testUserFindByEmail();
    
    testResults.userFindByUsername = await testUserFindByUsername();
    
    testResults.userFindOne = await testUserFindOne(testResults.authSignIn);
    
    testResults.userExists = await testUserExists();
    
    testResults.userUpdate = await testUserUpdate(testResults.authSignIn);
    
    testResults.userUpdateEmail = await testUserUpdateEmail(testResults.authSignIn);
    
    testResults.authRefresh = await testAuthRefresh(testResults.authSignIn);
    
    testResults.changePassword = await testChangePassword(testResults.authSignIn);
    
    testResults.signOut = await testSignOut(testResults.authSignIn);
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    Object.entries(testResults).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
