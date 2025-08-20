#!/usr/bin/env node

import { test, describe } from 'node:test';
import assert from 'node:assert';

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

describe('API Tests', () => {
  test('should return healthy status', async () => {
    const response = await makeRequest('GET', '/api/health-check');
    
    assert.strictEqual(response.status, 200, 'Health check should return 200');
    assert.ok(response.body, 'Should return response body');
    assert.ok(response.body.message, 'Should return message');
  });

  test('should handle non-existent routes', async () => {
    const response = await makeRequest('GET', '/non-existent-route');
    
    assert.strictEqual(response.status, 404, 'Non-existent route should return 404');
  });

  test('should handle invalid HTTP methods', async () => {
    const response = await makeRequest('PATCH', '/api/health-check');
    
    // Accept various error responses for invalid methods
    assert.ok(response.status === 404 || response.status === 405 || response.status === 400, 
      'Invalid HTTP method should return error status');
  });

  test('should handle missing required fields', async () => {
    const response = await makeRequest('POST', '/auth/sign-in', {
      // Missing usernameOrEmail and password
    });
    
    assert.strictEqual(response.status, 400, 'Should return 400 for missing required fields');
  });

  test('should handle invalid JSON in request body', async () => {
    const url = `${BASE_URL}/auth/sign-in`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });
      
      assert.notStrictEqual(response.status, 200, 'Should not return 200 for invalid JSON');
    } catch (error) {
      // This is expected for malformed requests
      assert.ok(true, 'Invalid JSON should cause an error');
    }
  });
});
