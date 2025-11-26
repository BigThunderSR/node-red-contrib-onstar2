# Real API Testing Guide

This document explains how to run integration tests against the real OnStar API.

## ⚠️ Important Warnings

**DO NOT use real API testing in CI/CD pipelines!**

Running tests against the real OnStar API:

- Makes actual calls to your OnStar account
- May trigger real actions on your vehicle
- Could lead to account lockout if run too frequently
- Uses your actual API rate limits

**This feature is intended for manual testing only.**

## Setup

### 1. Check Your Environment File

You should already have a `.env` file in the project root. If not, copy the example:

```bash
cp .env.example .env
```

### 2. Add Test Credentials to .env

Add or update these variables in your `.env` file:

```bash
# Enable real API testing
RUN_REAL_API_TESTS=true

# Your OnStar credentials
ONSTAR_USERNAME=your.email@example.com
ONSTAR_PASSWORD=YourPassword
ONSTAR_PIN=1234
ONSTAR_VIN=YOUR17DIGITVIN
ONSTAR_DEVICEID=your-device-id-uuid
ONSTAR_TOTP=YOURBASE32TOTPSECRET

# Optional: Adjust timeout (default 120000ms = 2 minutes)
REAL_API_TEST_TIMEOUT=120000

# Optional: Enable detailed console output for debugging
DEBUG_TEST_OUTPUT=false
```

### 3. Security Notes

- The `.env` file is already in `.gitignore` and will never be committed
- Never share your `.env` file or commit it to version control
- Never use real credentials in test files themselves

## Running Real API Tests

### Run Safe Read-Only Real API Tests

```bash
npm run test:real-safe-only
```

**Enable detailed console output (optional):**

```bash
# Edit .env and set:
DEBUG_TEST_OUTPUT=true

# Or set inline:
DEBUG_TEST_OUTPUT=true npm run test:real-safe-only
```

This will show the actual API responses (both parsed and raw) for each test.

This runs **only safe read-only tests** that won't affect your vehicle:

- Authentication
- Get Account Vehicles
- Get Diagnostics
- Locate Vehicle

These tests:

- Load credentials from `.env`
- Skip tests if `RUN_REAL_API_TESTS` is not `true`
- Run with 2-minute timeout
- Make actual API calls to OnStar
- **Will NOT lock/unlock, start, or alert your vehicle**

### Run Specific Safe Tests

You can run individual safe test suites:

```bash
# Run only authentication tests
mocha test/real-api.spec.js --grep "Safe Read-Only.*Authentication" --timeout 120000

# Run only vehicle list tests
mocha test/real-api.spec.js --grep "Get Account Vehicles" --timeout 120000

# Run only diagnostics tests
mocha test/real-api.spec.js --grep "Get Diagnostics" --timeout 120000

# Run only location tests
mocha test/real-api.spec.js --grep "Locate Vehicle" --timeout 120000
```

### ⚠️ DANGEROUS: Action Command Tests (MANUAL ONLY - NO NPM SCRIPT)

**WARNING: Action tests will perform REAL ACTIONS on your vehicle!**

Action command tests (lock, start, alert) are intentionally excluded from all npm scripts and must be run with explicit manual mocha commands:

```bash
# These commands will perform REAL ACTIONS on your vehicle
# Use with EXTREME CAUTION

# Lock your vehicle doors
mocha test/real-api.spec.js --grep "Lock Vehicle" --timeout 120000

# Start your vehicle engine
mocha test/real-api.spec.js --grep "Start Vehicle" --timeout 120000

# Honk horn and flash lights
mocha test/real-api.spec.js --grep "Alert Vehicle" --timeout 120000
```

**These tests:**

- 🚗 Will lock your vehicle doors
- 🚀 Will start your vehicle engine
- 📢 Will honk horn and flash lights
- ❌ Have NO npm script for safety
- ⚠️ Must be invoked manually with full mocha command
- 🚫 Should NEVER be run in automated environments

### Run Normal Mocked Tests (Default)

```bash
npm test
```

This runs all tests with mocked responses (safe for CI/CD).

### Disable Real API Testing

To disable real API testing, either:

1. Set `RUN_REAL_API_TESTS=false` in `.env`, or
2. Remove/comment out the `RUN_REAL_API_TESTS` line

Then `npm run test:real-safe-only` will skip all tests.

## Available Real API Tests

Currently implemented:

- ✅ Authentication with real credentials
- ✅ Get Account Vehicles
- ✅ Get Diagnostics
- ✅ Locate Vehicle

**Note:** Action commands (lock/unlock, start, alert) are intentionally not included in automated tests to prevent accidental vehicle actions.

## Troubleshooting

### "Missing credentials" error

Make sure all required variables are set in `.env`:

- ONSTAR_USERNAME
- ONSTAR_PASSWORD
- ONSTAR_PIN
- ONSTAR_VIN
- ONSTAR_DEVICEID
- ONSTAR_TOTP

### Tests are skipped

Check that `RUN_REAL_API_TESTS=true` in your `.env` file.

### Authentication failures

- Verify your credentials are correct
- Ensure your TOTP key is properly configured
- Check that your account is not locked

### Timeout errors

Increase `REAL_API_TEST_TIMEOUT` in `.env` (value in milliseconds).

## Best Practices

1. **Use sparingly**: Only run real API tests when necessary to verify actual integration
2. **Test in stages**: Start with read-only tests (vehicles, diagnostics, location)
3. **Monitor your account**: Watch for any unusual activity or lockouts
4. **Keep credentials secure**: Never commit `.env` or share credentials
5. **Manual testing only**: Never enable in CI/CD or automated pipelines
