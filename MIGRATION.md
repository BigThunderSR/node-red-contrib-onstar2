# Migration Guide: v2.x to v3.0

## Overview

Version 3.0 modernizes node-red-contrib-onstar2 to use the latest onstarjs2 library with enhanced v3 API support. This brings improved reliability, better EV charging control, and automatic API version detection.

## Breaking Changes

### 1. API Response Structure Changes

**onstarjs2 v2.14.1+** returns data in a different structure:

**get-account-vehicles:**

- Old: `response.data.vehicles.vehicle` (array)
- New: `data.vehicles` (array)
- **Impact:** If you're using the second output (raw response) in function nodes, update the path

**locate-vehicle:**

- Old: `response.data.commandResponse.body` (raw location data)
- New: Structured object with `location` (lat/long), `velocity`, and `timestamp`
- **Impact:** The first output now provides a consistent, easy-to-use structure

**What changed in outputs:**

- **First output (n2):** Still returns parsed, user-friendly data (now even better structured for location)
- **Second output (n3):** Returns full raw API response (path changes noted above)

**Action Required:**

- If using raw response (2nd output) in function nodes, update property paths
- Location data: Access `msg.payload.location.lat` instead of parsing raw body

### 2. EV Charging Nodes - REPLACED

The following v1 API charging nodes are **deprecated and removed**:

| Old Node (v2.x)        | New Node (v3.0)                             | Notes                                     |
| ---------------------- | ------------------------------------------- | ----------------------------------------- |
| `mycharge-override`    | `set-charge-level-target` + `stop-charging` | Split into two focused nodes              |
| `get-mycharge-profile` | `get-ev-charging-metrics`                   | Enhanced with more metrics                |
| `set-mycharge-profile` | `set-charge-level-target`                   | Simplified with direct percentage control |

**Action Required:**

- Replace `mycharge-override` nodes with either:
  - `set-charge-level-target` (to set target battery %)
  - `stop-charging` (to stop charging session)
- Replace `get-mycharge-profile` with `get-ev-charging-metrics`
- Replace `set-mycharge-profile` with `set-charge-level-target`

### 3. Diagnostics Node - SIMPLIFIED

The `get-diagnostics` node no longer accepts specific diagnostic item selection.

**What changed:**

- The `diagnostics` configuration parameter is removed
- The `msg.payload.diagnosticItem` input parameter is ignored
- The v3 API automatically returns **all available diagnostics** for your vehicle

**Action Required:**

- Remove any diagnostic item configuration from existing nodes
- Update flows that rely on `msg.payload.diagnosticItem` input
- Parse the full diagnostic response to extract specific items you need

### 3. Node ID Changes

Update your flows if you're using these node type IDs:

```javascript
// Old (v2.x)
type: "mycharge-override";
type: "get-mycharge-profile";
type: "set-mycharge-profile";

// New (v3.0)
type: "set-charge-level-target";
type: "stop-charging";
type: "get-ev-charging-metrics";
type: "refresh-ev-charging-metrics";
```

## New Features

### Automatic API Version Detection

Action commands (lock/unlock, start/cancel, alert) now automatically:

- Attempt v3 API first
- Fall back to v1 API if vehicle doesn't support v3
- Cache the working API version for optimal performance
- Parse both v3 and v1 response structures transparently

**No configuration needed** - this happens transparently!

The response parsing handles both API formats:

- **v3 API**: `response.data.status` and `response.data.requestId`
- **v1 API**: `response.data.commandResponse.status` and `response.data.commandResponse.requestId`

Your flows will continue to work regardless of which API your vehicle uses.

### Enhanced EV Charging Control

#### Set Charge Level Target

```javascript
// Simple usage - set target to 80%
msg.payload = {
  targetLevel: 80,
};

// Advanced usage with options
msg.payload = {
  tcl: 85, // target charge level
  noMetricsRefresh: false,
  clientRequestId: "custom-id",
  clientVersion: "1.0",
  os: "A", // "A" for Android, "I" for iOS
};
```

#### Stop Charging

```javascript
// Simple usage
msg.payload = {}; // No parameters needed

// Advanced usage with options
msg.payload = {
  noMetricsRefresh: false,
  clientRequestId: "custom-id",
};
```

#### Get/Refresh EV Charging Metrics

```javascript
// Get cached metrics (fast)
// Use 'get-ev-charging-metrics' node

// Force refresh from vehicle (slower, more current)
// Use 'refresh-ev-charging-metrics' node

// Optional parameters for both:
msg.payload = {
  clientVersion: "1.0",
  os: "A",
};
```

## Migration Steps

### Step 1: Backup Your Flows

Before starting, export and save your current flows.

### Step 2: Update EV Charging Nodes

For each deprecated charging node:

1. **mycharge-override:**

   ```text
   If mode was "CHARGE_NOW" → Replace with 'set-charge-level-target'
   If mode was "CANCEL_OVERRIDE" → Replace with 'stop-charging'
   ```

2. **get-mycharge-profile:**

   ```text
   Simply replace with 'get-ev-charging-metrics'
   Response structure is similar but enhanced
   ```

3. **set-mycharge-profile:**

   ```text
   Replace with 'set-charge-level-target'
   Instead of chargeMode/rateType, use targetLevel (0-100)
   ```

### Step 3: Update Diagnostics Nodes

1. Remove the "Diagnostic Items to Query" configuration
2. Update downstream flows to parse the full diagnostic response
3. Example response structure:

   ```javascript
   {
     diagnosticResponse: [
       {
         name: "ODOMETER",
         diagnosticElement: [
           {
             name: "ODOMETER",
             status: "SUCCESS",
             value: "12345",
             unit: "miles",
           },
         ],
       },
       // ... more diagnostic items
     ];
   }
   ```

### Step 4: Test Action Commands

Action commands (lock, unlock, start, cancel start, alert) should work without changes. The library now:

- Automatically detects the best API version
- Handles fallback transparently
- Improves reliability across vehicle types (ICE, Hybrid, EV)

### Step 5: Deploy and Verify

1. Deploy your updated flows
2. Test each modified node
3. Check Node-RED debug output for any errors
4. Verify vehicle commands work as expected

## Troubleshooting

### "Unknown node type" Error

If you see errors about unknown node types after upgrading:

- Restart Node-RED completely
- Clear browser cache
- Re-import the updated package

### EV Charging Commands Not Working

- Ensure your vehicle is an EV or PHEV
- Check that OnStar subscription includes EV features
- Verify TOTP authentication is working correctly

### Missing Diagnostic Data

The v3 API returns all available diagnostics. If you're missing specific items:

- They may not be available for your vehicle model/year
- Check the response to see what diagnostics are actually returned
- Some v1 diagnostic names may have changed in v3

## Getting Help

- GitHub Issues: [https://github.com/BigThunderSR/node-red-contrib-onstar2/issues](https://github.com/BigThunderSR/node-red-contrib-onstar2/issues)
- Discussions: [https://github.com/BigThunderSR/node-red-contrib-onstar2/discussions](https://github.com/BigThunderSR/node-red-contrib-onstar2/discussions)

## Benefits of Upgrading

- ✅ Better reliability with automatic API version fallback
- ✅ Enhanced EV charging control with granular options
- ✅ More comprehensive diagnostic data
- ✅ Improved error handling and reporting
- ✅ Future-proof architecture supporting latest OnStar APIs
- ✅ Simplified diagnostic node (no manual item selection needed)
