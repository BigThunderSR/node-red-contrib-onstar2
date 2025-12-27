const assert = require('assert');
const Vehicle = require('../deps/vehicle');
const apiResponse = require('./vehicles.sample.json');

describe('Vehicle', () => {
    let v;
    beforeEach(() => {
        const vehicleData = apiResponse.vehicles.vehicle[0];
        v = new Vehicle(vehicleData);
    });

    it('should parse a vehicle response', () => {
        assert.notStrictEqual(v.year, 2020);
        assert.strictEqual(v.make, 'Chevrolet');
        assert.strictEqual(v.model, 'Bolt EV');
        assert.strictEqual(v.vin, 'foobarVIN');
    });

    it('should return the list of supported diagnostics', () => {
        const supported = v.getSupported();
        assert.ok(Array.isArray(supported));
        assert.strictEqual(supported.length, 22);
    });

    it('should return common supported and requested diagnostics', () => {
        let supported = v.getSupported(['ODOMETER']);
        assert.ok(Array.isArray(supported));
        assert.strictEqual(supported.length, 1);

        supported = v.getSupported(['ODOMETER', 'foo', 'bar']);
        assert.ok(Array.isArray(supported));
        assert.strictEqual(supported.length, 1);

        supported = v.getSupported(['foo', 'bar']);
        assert.ok(Array.isArray(supported));
        assert.strictEqual(supported.length, 0);
    });

    it('should toString() correctly', () => {
        assert.strictEqual(v.toString(), '2020 Chevrolet Bolt EV')
    });

    it('should check if a diagnostic is supported', () => {
        assert.strictEqual(v.isSupported('ODOMETER'), true);
        assert.strictEqual(v.isSupported('NOT_A_DIAGNOSTIC'), false);
    });

    it('should return supported commands', () => {
        const commands = v.getSupportedCommands();
        assert.ok(Array.isArray(commands));
        assert.ok(commands.length > 0);
        assert.ok(commands.includes('diagnostics'));
    });

    it('should append supported commands to provided list', () => {
        const existingList = ['existing'];
        const result = v.getSupportedCommands(existingList);
        assert.strictEqual(result[0], 'existing');
        assert.ok(result.includes('diagnostics'));
    });

    it('should handle missing commands data gracefully', () => {
        const minimalVehicle = new Vehicle({
            make: 'Test',
            model: 'Car',
            vin: 'TEST123',
            year: '2020'
            // No commands property
        });
        assert.strictEqual(minimalVehicle.supportedCommands, undefined);
        assert.strictEqual(minimalVehicle.supportedDiagnostics, undefined);
    });

    it('should handle null diagnostics when checking support', () => {
        const vehicleNoCommands = new Vehicle({
            make: 'Test',
            model: 'Car',
            vin: 'TEST123',
            year: '2020'
        });
        // Should not throw and should return false
        assert.strictEqual(vehicleNoCommands.isSupported('ODOMETER'), false);
    });

    it('should handle null diagnostics when getting supported list', () => {
        const vehicleNoCommands = new Vehicle({
            make: 'Test',
            model: 'Car',
            vin: 'TEST123',
            year: '2020'
        });
        // Should return undefined (no diagnostics available)
        assert.strictEqual(vehicleNoCommands.getSupported(), undefined);
        // With requested diags, should return empty array (intersection of undefined and array)
        const result = vehicleNoCommands.getSupported(['ODOMETER']);
        assert.ok(Array.isArray(result));
        assert.strictEqual(result.length, 0);
    });

    it('should handle vehicle with commands but no diagnostics command', () => {
        const vehicleNoDiagCmd = new Vehicle({
            make: 'Test',
            model: 'Car',
            vin: 'TEST123',
            year: '2020',
            commands: {
                command: [
                    { name: 'lockDoor' },
                    { name: 'unlockDoor' }
                ]
            }
        });
        assert.strictEqual(vehicleNoDiagCmd.supportedDiagnostics, undefined);
        assert.strictEqual(vehicleNoDiagCmd.isSupported('ODOMETER'), false);
    });
});
