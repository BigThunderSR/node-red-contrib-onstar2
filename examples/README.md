# Example Flow Documentation

This directory contains example Node-RED flows demonstrating the usage of node-red-contrib-onstar2 nodes.

## Example-Flow-File.json

This flow demonstrates all available OnStar nodes in node-red-contrib-onstar2 v3.0.

### Importing the Flow

1. Open Node-RED
2. Click the hamburger menu (☰) in the top-right corner
3. Select **Import** → **Clipboard**
4. Copy the contents of `Example-Flow-File.json` and paste into the import dialog
5. Click **Import**

### Configuration Required

Before using the flow, you must configure the OnStar2 configuration node:

1. Double-click any OnStar node in the flow
2. Click the pencil icon next to the "OnStar2" dropdown
3. Fill in your OnStar credentials:
   - **Car Name**: Any friendly name for your vehicle
   - **Username**: Your OnStar account email
   - **Password**: Your OnStar account password
   - **PIN**: Your 4-digit OnStar PIN
   - **VIN**: Your vehicle's 17-character VIN
   - **Device ID**: A UUID v4 (generate at <https://www.uuidgenerator.net/version4>)
   - **TOTP Key**: Your Time-based One-Time Password secret (see [OnStarJS TOTP Instructions](https://github.com/BigThunderSR/OnStarJS?tab=readme-ov-file#new-requirement-as-of-2024-11-19))
   - **Check Request Status**: Enable to poll for command completion
   - **Request Polling Timeout**: Maximum time to wait for command completion (seconds)
   - **Request Polling Interval**: How often to check command status (seconds)

### Understanding Dual Outputs

All OnStar nodes in v3.0 provide **two outputs**:

#### Output 1 (Top Wire) - Parsed Data

Contains cleaned, structured data for easy use in your flows.

**Example outputs:**

- **Get Account Vehicles**:

  ```json
  [
    {
      "make": "Chevrolet",
      "model": "Bolt EV",
      "vin": "1G1FZ6S07L4123456",
      "year": "2020"
    }
  ]
  ```

- **Locate Vehicle**:

  ```json
  {
    "location": {
      "lat": 37.7749,
      "long": -122.4194,
      "elv": 52,
      "geohash": "9q8yy"
    },
    "velocity": {
      "spdInKph": 0,
      "dir": null
    },
    "timestamp": "2025-11-26T22:42:27.215Z"
  }
  ```

- **Lock/Unlock/Start/Alert Commands**:

  ```json
  {
    "status": "SUCCESS",
    "requestId": "lock1603422491764196346746"
  }
  ```

- **Get Diagnostics**:
  Returns all available diagnostic data from the vehicle (v3 API automatically returns complete diagnostics).

#### Output 2 (Bottom Wire) - Raw API Response

Contains the complete, unmodified response from the OnStar API, useful for debugging or accessing additional metadata.

**Example structure:**

```json
{
  "requestId": "lock1603422491764196346746",
  "status": "SUCCESS",
  "requestTime": "2025-11-26T22:32:26.746Z",
  "completionTime": "2025-11-26T22:33:42.018Z",
  "url": "https://api.gm.com/...",
  "payload": {
    /* original request */
  },
  "error": null
}
```

### Available Nodes in Example

The example flow includes all available nodes:

#### Vehicle Information

- **Get Account Vehicles** - Lists all vehicles on your OnStar account
- **Get Vehicle Details** - Returns comprehensive vehicle information (make, model, year, RPO codes, etc.)
- **Get OnStar Plan** - Returns current OnStar subscription plan information
- **Get Vehicle Recall Info** - Check for any active recalls on your vehicle
- **Diagnostics** - Returns comprehensive vehicle diagnostic data (v3 API)
- **Get Vehicle Location** - Returns GPS coordinates, velocity, and timestamp

#### Vehicle Control

- **Lock Vehicle** - Locks all vehicle doors
- **Unlock Vehicle** - Unlocks all vehicle doors
- **Start Vehicle** - Remotely starts the vehicle
- **Cancel Start Vehicle** - Cancels a remote start
- **Alert Vehicle** - Triggers lights and/or horn
- **Alert Vehicle Lights Only** - Flashes lights without horn
- **Alert Vehicle Horn Only** - Honks horn without flashing lights
- **Cancel Alert Vehicle** - Cancels an active alert
- **Stop Lights** - Stop flashing vehicle lights

#### Trunk Control

- **Lock Trunk** - Locks the trunk
- **Unlock Trunk** - Unlocks the trunk

#### EV Charging Control (v3 API)

- **Get EV Charging Metrics** - Retrieves current charging status and metrics
- **Refresh EV Charging Metrics** - Force-refresh live data from vehicle
- **Set Charge Level Target** - Set desired battery percentage (0-100%)
- **Stop Charging** - Stop current charging session

> **Note:** These v3 API charging commands replace the deprecated v1 API commands (`chargeOverride`, `getChargingProfile`, `setChargingProfile`). See [MIGRATION.md](../MIGRATION.md) for details on API changes.

### Debug Nodes

The example flow includes two debug nodes connected to all command outputs:

1. **msg.payload** - Shows the parsed data from Output 1
2. **Command Debug Output** - Shows the raw API response from Output 2

### Testing the Flow

⚠️ **Important Safety Notes:**

- Test with **read-only commands first**: Get Account Vehicles, Diagnostics, Locate Vehicle
- Verify outputs look correct before testing control commands
- Be aware that Start Vehicle, Lock/Unlock commands will actually affect your vehicle
- Some commands may drain your vehicle's battery if used excessively
- Respect OnStar rate limits to avoid account lockout

### Recommended Testing Order

1. **Get Account Vehicles** - Verifies authentication
2. **Diagnostics** - Tests data retrieval
3. **Locate Vehicle** - Tests GPS functionality
4. **Lock/Unlock** - Test door control (ensure you have physical key access)
5. **Alert Lights Only** - Safe visual test
6. Other commands as needed

### Troubleshooting

If commands fail:

1. **Check credentials** - Verify all configuration values are correct
2. **Review debug output** - Check Output 2 for detailed error messages
3. **TOTP issues** - Ensure TOTP key is correct and time-synced
4. **Rate limiting** - Wait several minutes between repeated commands
5. **API version** - v3 API is used automatically; check if your vehicle supports it

### API Version Information

This example flow uses **onstarjs2 v2.14.1+** which:

- Automatically uses v3 API for action commands with v1 fallback
- Uses v3 API exclusively for diagnostics (returns all diagnostics automatically)
- Uses v3 API exclusively for EV charging commands
- Provides enhanced error handling and performance

See [MIGRATION.md](../MIGRATION.md) for complete details on API changes and response structures.

### Need Help?

- Review the [main README](../README.md) for general usage
- Check [MIGRATION.md](../MIGRATION.md) for v2.x to v3.0 upgrade details
- Review [REAL_API_TESTING.md](../REAL_API_TESTING.md) for testing guidance
- Open an issue on [GitHub](https://github.com/BigThunderSR/node-red-contrib-onstar2/issues)
