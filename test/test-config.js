/**
 * Test configuration helper
 * Loads real credentials from .env file if RUN_REAL_API_TESTS=true
 * Otherwise uses mock credentials for safe testing
 */

require('dotenv').config();

const USE_REAL_API = process.env.RUN_REAL_API_TESTS === 'true';
const REAL_API_TIMEOUT = parseInt(process.env.REAL_API_TEST_TIMEOUT || '120000', 10);
const DEBUG_OUTPUT = process.env.DEBUG_TEST_OUTPUT === 'true';

const TEST_CONFIG = {
  useRealAPI: USE_REAL_API,
  timeout: USE_REAL_API ? REAL_API_TIMEOUT : 2000,
  debug: DEBUG_OUTPUT,
  
  credentials: USE_REAL_API ? {
    username: process.env.ONSTAR_USERNAME,
    password: process.env.ONSTAR_PASSWORD,
    pin: process.env.ONSTAR_PIN,
    vin: process.env.ONSTAR_VIN,
    deviceid: process.env.ONSTAR_DEVICEID,
    totp: process.env.ONSTAR_TOTP
  } : {
    username: 'test@example.com',
    password: 'testpass',
    pin: '1234',
    vin: '1G1ZB5ST5JF260429',
    deviceid: 'test-device-id',
    totp: 'TESTTOTP'
  },
  
  // Helper function for conditional debug logging
  log: function(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }
};

// Validate real credentials are provided if real API testing is enabled
if (USE_REAL_API) {
  const required = ['username', 'password', 'pin', 'vin', 'deviceid', 'totp'];
  const missing = required.filter(key => !TEST_CONFIG.credentials[key]);
  
  if (missing.length > 0) {
    console.error('❌ Real API testing enabled but missing credentials:', missing.join(', '));
    console.error('Please create a .env file with all required ONSTAR_* variables');
    console.error('See .env.example for template');
    process.exit(1);
  }
  
  console.log('⚠️  RUNNING TESTS WITH REAL API CREDENTIALS');
  console.log(`⚠️  Test timeout set to ${REAL_API_TIMEOUT}ms`);
}

module.exports = TEST_CONFIG;
