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
});
