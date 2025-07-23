# node-red-contrib-onstar2

[![CodeQL](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/codeql-analysis.yml)
[![Dependency Review](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/dependency-review.yml)
[![Lint Code Base](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/super-linter.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/super-linter.yml)
[![Node.js CI](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/node.js.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/node.js.yml)
[![Node.js Package](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/npm-publish.yml)
<!-- [![Notarize Assets with CAS](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/cas_notarize.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/cas_notarize.yml)
[![Authenticate Assets with CAS](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/cas_authenticate.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/cas_authenticate.yml) -->

A Node-RED node package for controlling GM OnStar vehicles powered by [OnStarJS](https://github.com/samrum/OnStarJS), originally written by [caseyjmorton](https://www.npmjs.com/~caseyjmorton) and published [in the npmjs registry here](https://www.npmjs.com/package/node-red-contrib-onstar). Please note that only US and Canadian OnStar accounts are known to work with this integration.

This fork is for me to experiment with the capabilities exposed in the original version and to add custom commands as necessary.

- ***Following a major re-write, this project is now at version 2.x and is fully independent from the original npm package.***

- ***Version 2.x has breaking changes, but no further breaking changes are expected at this time.***

[![npm](https://img.shields.io/npm/v/node-red-contrib-onstar2.svg)](https://www.npmjs.com/package/node-red-contrib-onstar2)

<!-- ![node-red-contrib-onstar2-sample_s](https://user-images.githubusercontent.com/17056173/205470439-c27a5fc0-2ec3-4043-bef3-408042f78d29.png) -->
![Nodes_node-red-contrib-onstar2](https://github.com/BigThunderSR/node-red-contrib-onstar2/assets/17056173/dc0a0993-5e64-4445-b38e-f24a90c2256c)

## Install

```sh
npm install node-red-contrib-onstar2
```

## Documentation

Each node is self-explanatory with hints provided wherever necessary as well as detailed information in the Help section of each node as necessary.

## Running

Collect the following information:

1. [Generate](https://www.uuidgenerator.net/version4) a v4 uuid for the device ID
1. OnStar login: username, password, PIN, [TOTP Key (Please click link for instructions)](https://github.com/BigThunderSR/OnStarJS?tab=readme-ov-file#new-requirement-as-of-2024-11-19)
1. Your car's VIN. Easily found in the monthly OnStar diagnostic emails.

**Important:** [Special Instructions for Running in the official Home Assistant Node-RED Add-on](https://github.com/BigThunderSR/node-red-contrib-onstar2/discussions/430)

## Supported Features

- Lock Doors
- Unlock Doors
- Lock Trunk
- Unlock Trunk
- Start
- Stop (Cancel Start)
- Set Charge Profile
- Get Charge Profile
- Override Charge State
- Vehicle Alert (Lights and Horn)
- Vehicle Alert (Lights Only)
- Vehicle Alert (Horn Only)
- Cancel Vehicle Alert
- Get Vehicle Location
- Get Diagnostic Information
- Get Vehicle Capabilities

## Testing

This project includes comprehensive test suites that use mocked API responses instead of making real calls to OnStar servers.

### Running Tests

```sh
# Run all tests (including mocked tests)
npm test

# Run only authentication tests (mocked)
npm run test:auth

# Run only functionality tests (mocked)
npm run test:functionality

# Run all mocked tests (authentication + functionality)
npm run test:mocked

# Run legacy authentication tests (requires real OnStar credentials)
npm run test:auth-legacy
```

### Mocked Tests

The project now includes comprehensive mocked tests that cover both authentication scenarios and successful OnStar operations without making real API calls.

#### Authentication Tests (`test/authentication.spec.js`)

Using [Sinon](https://sinonjs.org/) to mock the OnStarJS API calls:

- **Fast execution**: No network calls or timeouts
- **Reliable results**: Tests don't depend on external service availability
- **Safe testing**: No risk of accidentally triggering real vehicle actions
- **Predictable outcomes**: Controlled responses for different scenarios

The authentication tests cover:

- Invalid credentials scenarios
- Missing configuration parameters
- Invalid TOTP codes
- Invalid VIN formats
- Successful authentication flows
- Configuration node validation

#### Functionality Tests (`test/functionality-mocked.spec.js`)

Comprehensive mocked tests for OnStar operations:

- **get-account-vehicles**: Mock vehicle list with multiple vehicles
- **get-diagnostics**: Mock diagnostic data (odometer, battery, fuel, etc.)
- **locate-vehicle**: Mock GPS coordinates and address information
- **lock-myvehicle**: Mock successful door locking
- **unlock-myvehicle**: Mock successful door unlocking
- **lock-mytrunk**: Mock successful trunk locking
- **unlock-mytrunk**: Mock successful trunk unlocking
- **start-myvehicle**: Mock successful remote start
- **cancel-start-myvehicle**: Mock successful remote start cancellation
- **alert-myvehicle**: Mock successful vehicle alerts (honk/flash)
- **get-mycharge-profile**: Mock EV charging profile data
- **mycharge-override**: Mock charging override commands

All functionality tests verify:

- Correct API method calls with proper parameters
- Expected response data structures
- Proper error handling
- Node.js output validation

## My other related projects

- [https://github.com/BigThunderSR/onstar2mqtt](https://github.com/BigThunderSR/onstar2mqtt)

- [https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt)
