# node-red-contrib-onstar2

[![CodeQL](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/codeql-analysis.yml)
[![Dependency Review](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/dependency-review.yml)
[![Lint Code Base](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/super-linter.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/super-linter.yml)
[![Node.js CI](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/node.js.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/node.js.yml)
[![Node.js Package](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/npm-publish.yml)
[![Notarize Assets with CAS](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/cas_notarize.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/cas_notarize.yml)
[![Authenticate Assets with CAS](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/cas_authenticate.yml/badge.svg)](https://github.com/BigThunderSR/node-red-contrib-onstar2/actions/workflows/cas_authenticate.yml)

A node-red flow for controlling GM OnStar vehicles powered by [onstarjs](https://github.com/samrum/OnStarJS) originally written by [caseyjmorton](https://www.npmjs.com/~caseyjmorton) and published [here](https://www.npmjs.com/package/node-red-contrib-onstar).

This fork is for me to experiment with the capabilities exposed in the original version and to add custom commands as necessary.

- ***Following a major re-write, this project is now at version 2.x and is fully independent from the original npm package.***

- ***Version 2.x has breaking changes, but no further breaking changes are expected at this time.***

[![npm](https://img.shields.io/npm/v/node-red-contrib-onstar2.svg)](https://www.npmjs.com/package/node-red-contrib-onstar2)

![node-red-contrib-onstar2-sample_s](https://user-images.githubusercontent.com/17056173/205470439-c27a5fc0-2ec3-4043-bef3-408042f78d29.png)

## Install

```sh
npm install node-red-contrib-onstar2
```

## Documentation

Each node is self-explanatory with hints provided wherever necessary as well as detailed information in the Help section of each node as necessary.

## Running

Collect the following information:

1. [Generate](https://www.uuidgenerator.net/version4) a v4 uuid for the device ID
1. OnStar login: username, password, PIN
1. Your car's VIN. Easily found in the monthly OnStar diagnostic emails.

## Supported Features

- Lock
- Unlock
- Start
- Stop
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


## My other related projects

- [https://github.com/BigThunderSR/onstar2mqtt](https://github.com/BigThunderSR/onstar2mqtt)

- [https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt)
