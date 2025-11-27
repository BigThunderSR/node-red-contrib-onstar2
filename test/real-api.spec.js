/**
 * Real API Integration Tests
 * 
 * These tests only run when RUN_REAL_API_TESTS=true in .env
 * They make actual calls to the OnStar API using real credentials
 * 
 * To run these tests:
 * 1. Copy .env.example to .env
 * 2. Fill in your real OnStar credentials
 * 3. Set RUN_REAL_API_TESTS=true
 * 4. Run: npm run test:real
 * 
 * WARNING: Running these tests will:
 * - Use your actual OnStar account
 * - May trigger actions on your real vehicle
 * - Could lead to account lockout if run too frequently
 */

const helper = require('node-red-node-test-helper');
const onStar = require('../onstar.js');
const TEST_CONFIG = require('./test-config');

// Skip all tests if not using real API
const describeReal = TEST_CONFIG.useRealAPI ? describe : describe.skip;

helper.init(require.resolve('node-red'));

// SAFE READ-ONLY TESTS - Can be run with npm run test:real
describeReal('Real API Integration Tests - Safe Read-Only', function() {
  this.timeout(TEST_CONFIG.timeout);

  beforeEach(function(done) {
    helper.startServer(done);
  });

  afterEach(function(done) {
    helper.unload();
    helper.stopServer(done);
  });

  // Note: Authentication is tested implicitly through all API calls
  // There is no separate "authentication" node - it happens via the config node

  describe('Get Account Vehicles', function() {
    it('Should retrieve vehicle list', function(done) {
      const flow = [
        { 
          id: "n1", 
          type: "get-account-vehicles", 
          name: "Get Vehicles", 
          onstar2: "config1", 
          wires: [["n2"], ["n3"]] 
        },
        { 
          id: "config1", 
          type: "onstar2", 
          carname: "TestCar",
          username: TEST_CONFIG.credentials.username,
          password: TEST_CONFIG.credentials.password,
          pin: TEST_CONFIG.credentials.pin,
          vin: TEST_CONFIG.credentials.vin,
          deviceid: TEST_CONFIG.credentials.deviceid,
          totp: TEST_CONFIG.credentials.totp,
          checkrequeststatus: "true",
          requestpollingtimeoutseconds: "90",
          requestpollingintervalseconds: "6"
        },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function() {
        const n1 = helper.getNode("n1");
        const n2 = helper.getNode("n2");
        const n3 = helper.getNode("n3");
        let completeCalled = false;

        n2.on("input", function(msg) {
          if (completeCalled) return;
          TEST_CONFIG.log('\n=== Get Account Vehicles - Output 1 (Parsed) ===');
          TEST_CONFIG.log(JSON.stringify(msg.payload, null, 2));
          try {
            // First output contains parsed data (array of vehicles)
            msg.should.have.property('payload');
            msg.payload.should.be.an.Array();
            msg.payload.length.should.be.above(0);
            msg.payload[0].should.have.property('vin');
            completeCalled = true;
            done();
          } catch(err) {
            if (!completeCalled) {
              completeCalled = true;
              done(err);
            }
          }
        });

        n3.on("input", function(msg) {
          // Second output contains raw response
          if (!completeCalled && msg.payload && msg.payload.status !== 'success') {
            completeCalled = true;
            done(new Error("Error: " + JSON.stringify(msg.payload)));
          }
        });

        n1.receive({ payload: "" });
      });
    });
  });

  describe('Get Diagnostics', function() {
    it('Should retrieve vehicle diagnostics', function(done) {
      const flow = [
        { 
          id: "n1", 
          type: "get-diagnostics", 
          name: "Get Diagnostics", 
          onstar2: "config1", 
          wires: [["n2"], ["n3"]] 
        },
        { 
          id: "config1", 
          type: "onstar2", 
          carname: "TestCar",
          username: TEST_CONFIG.credentials.username,
          password: TEST_CONFIG.credentials.password,
          pin: TEST_CONFIG.credentials.pin,
          vin: TEST_CONFIG.credentials.vin,
          deviceid: TEST_CONFIG.credentials.deviceid,
          totp: TEST_CONFIG.credentials.totp,
          checkrequeststatus: "true",
          requestpollingtimeoutseconds: "90",
          requestpollingintervalseconds: "6"
        },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function() {
        const n1 = helper.getNode("n1");
        const n2 = helper.getNode("n2");
        const n3 = helper.getNode("n3");
        let completeCalled = false;

        n2.on("input", function(msg) {
          if (completeCalled) return;
          TEST_CONFIG.log('\n=== Get Diagnostics - Output 1 (Parsed) ===');
          TEST_CONFIG.log(JSON.stringify(msg.payload, null, 2));
          try {
            // First output contains parsed diagnostic data
            msg.should.have.property('payload');
            msg.payload.should.be.an.Object();
            // Diagnostics should have properties like odometer, tirePressure, etc.
            completeCalled = true;
            done();
          } catch(err) {
            if (!completeCalled) {
              completeCalled = true;
              done(err);
            }
          }
        });

        n3.on("input", function(msg) {
          // Second output contains raw response
          if (!completeCalled && msg.payload && msg.payload.status !== 'success') {
            completeCalled = true;
            done(new Error("Error: " + JSON.stringify(msg.payload)));
          }
        });

        n1.receive({ payload: "" });
      });
    });
  });

  describe('Locate Vehicle', function() {
    it('Should retrieve vehicle location', function(done) {
      const flow = [
        { 
          id: "n1", 
          type: "locate-vehicle", 
          name: "Locate Vehicle", 
          onstar2: "config1", 
          wires: [["n2"], ["n3"]] 
        },
        { 
          id: "config1", 
          type: "onstar2", 
          carname: "TestCar",
          username: TEST_CONFIG.credentials.username,
          password: TEST_CONFIG.credentials.password,
          pin: TEST_CONFIG.credentials.pin,
          vin: TEST_CONFIG.credentials.vin,
          deviceid: TEST_CONFIG.credentials.deviceid,
          totp: TEST_CONFIG.credentials.totp,
          checkrequeststatus: "true",
          requestpollingtimeoutseconds: "90",
          requestpollingintervalseconds: "6"
        },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function() {
        const n1 = helper.getNode("n1");
        const n2 = helper.getNode("n2");
        const n3 = helper.getNode("n3");
        let completeCalled = false;

        n2.on("input", function(msg) {
          if (completeCalled) return;
          TEST_CONFIG.log('\n=== Locate Vehicle - Output 1 (Parsed) ===');
          TEST_CONFIG.log(JSON.stringify(msg.payload, null, 2));
          try {
            // First output contains parsed location data
            msg.should.have.property('payload');
            msg.payload.should.be.an.Object();
            msg.payload.should.have.property('location');
            msg.payload.location.should.have.property('lat');
            msg.payload.location.should.have.property('long');
            completeCalled = true;
            done();
          } catch(err) {
            if (!completeCalled) {
              completeCalled = true;
              done(err);
            }
          }
        });

        n3.on("input", function(msg) {
          // Second output contains raw response
          TEST_CONFIG.log('\n=== Locate Vehicle - Output 2 (Raw) ===');
          TEST_CONFIG.log(JSON.stringify(msg.payload, null, 2));
          if (!completeCalled && msg.payload && msg.payload.status !== 'success') {
            completeCalled = true;
            done(new Error("Error: " + JSON.stringify(msg.payload)));
          }
        });

        n1.receive({ payload: "" });
      });
    });
  });
});

// DANGEROUS ACTION TESTS - Must be run explicitly with --grep
// DO NOT include these in npm run test:real
// Only run manually: npx mocha test/real-api.spec.js --grep "Flash Lights Only" --timeout 120000
describe.skip('Real API Integration Tests - Action Commands (DANGEROUS)', function() {
  this.timeout(TEST_CONFIG.timeout);

  before(function() {
    if (!TEST_CONFIG.useRealAPI) {
      this.skip();
    }
    console.warn('⚠️  WARNING: These tests will perform REAL ACTIONS on your vehicle!');
    console.warn('⚠️  Only run these tests if you understand the consequences!');
  });

  beforeEach(function(done) {
    helper.startServer(done);
  });

  afterEach(function(done) {
    helper.unload();
    helper.stopServer(done);
  });

  describe('Lock Vehicle (CAUTION: Will lock your vehicle)', function() {
    it('Should lock vehicle doors', function(done) {
      const flow = [
        { 
          id: "n1", 
          type: "lock-myvehicle", 
          name: "Lock Vehicle", 
          onstar2: "config1", 
          wires: [["n2"], ["n3"]] 
        },
        { 
          id: "config1", 
          type: "onstar2", 
          carname: "TestCar",
          username: TEST_CONFIG.credentials.username,
          password: TEST_CONFIG.credentials.password,
          pin: TEST_CONFIG.credentials.pin,
          vin: TEST_CONFIG.credentials.vin,
          deviceid: TEST_CONFIG.credentials.deviceid,
          totp: TEST_CONFIG.credentials.totp,
          checkrequeststatus: "true",
          requestpollingtimeoutseconds: "90",
          requestpollingintervalseconds: "6"
        },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function() {
        const n1 = helper.getNode("n1");
        const n2 = helper.getNode("n2");
        const n3 = helper.getNode("n3");

        n2.on("input", function(msg) {
          try {
            msg.should.have.property('payload');
            msg.payload.should.have.property('status', 'success');
            done();
          } catch(err) {
            done(err);
          }
        });

        n3.on("input", function(msg) {
          done(new Error("Error: " + JSON.stringify(msg.payload)));
        });

        n1.receive({ payload: "" });
      });
    });
  });

  describe('Start Vehicle (CAUTION: Will start your vehicle)', function() {
    it('Should start vehicle remotely', function(done) {
      const flow = [
        { 
          id: "n1", 
          type: "start-myvehicle", 
          name: "Start Vehicle", 
          onstar2: "config1", 
          wires: [["n2"], ["n3"]] 
        },
        { 
          id: "config1", 
          type: "onstar2", 
          carname: "TestCar",
          username: TEST_CONFIG.credentials.username,
          password: TEST_CONFIG.credentials.password,
          pin: TEST_CONFIG.credentials.pin,
          vin: TEST_CONFIG.credentials.vin,
          deviceid: TEST_CONFIG.credentials.deviceid,
          totp: TEST_CONFIG.credentials.totp,
          checkrequeststatus: "true",
          requestpollingtimeoutseconds: "90",
          requestpollingintervalseconds: "6"
        },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function() {
        const n1 = helper.getNode("n1");
        const n2 = helper.getNode("n2");
        const n3 = helper.getNode("n3");

        n2.on("input", function(msg) {
          try {
            msg.should.have.property('payload');
            msg.payload.should.have.property('status', 'success');
            done();
          } catch(err) {
            done(err);
          }
        });

        n3.on("input", function(msg) {
          done(new Error("Error: " + JSON.stringify(msg.payload)));
        });

        n1.receive({ payload: "" });
      });
    });
  });

  describe('Flash Lights Only (CAUTION: Will flash your vehicle lights)', function() {
    it('Should flash vehicle lights', function(done) {
      const flow = [
        { 
          id: "n1", 
          type: "alert-myvehicle-lights", 
          name: "Flash Lights", 
          onstar2: "config1",
          wires: [["n2"], ["n3"]] 
        },
        { 
          id: "config1", 
          type: "onstar2", 
          carname: "TestCar",
          username: TEST_CONFIG.credentials.username,
          password: TEST_CONFIG.credentials.password,
          pin: TEST_CONFIG.credentials.pin,
          vin: TEST_CONFIG.credentials.vin,
          deviceid: TEST_CONFIG.credentials.deviceid,
          totp: TEST_CONFIG.credentials.totp,
          checkrequeststatus: "true",
          requestpollingtimeoutseconds: "90",
          requestpollingintervalseconds: "6"
        },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function() {
        const n1 = helper.getNode("n1");
        const n2 = helper.getNode("n2");
        const n3 = helper.getNode("n3");
        let completeCalled = false;

        n2.on("input", function(msg) {
          if (completeCalled) return;
          TEST_CONFIG.log('\n=== Flash Lights - Output 1 (Parsed) ===');
          TEST_CONFIG.log(JSON.stringify(msg.payload, null, 2));
          try {
            msg.should.have.property('payload');
            // Check what the actual response structure is
            completeCalled = true;
            done();
          } catch(err) {
            if (!completeCalled) {
              completeCalled = true;
              done(err);
            }
          }
        });

        n3.on("input", function(msg) {
          TEST_CONFIG.log('\n=== Flash Lights - Output 2 (Raw) ===');
          TEST_CONFIG.log(JSON.stringify(msg.payload, null, 2));
          if (!completeCalled && msg.payload && msg.payload.status !== 'success') {
            completeCalled = true;
            done(new Error("Error: " + JSON.stringify(msg.payload)));
          }
        });

        n1.receive({ payload: "" });
      });
    });
  });

  describe('Alert Vehicle (CAUTION: Will honk/flash your vehicle)', function() {
    it('Should trigger vehicle alert', function(done) {
      const flow = [
        { 
          id: "n1", 
          type: "alert-myvehicle", 
          name: "Alert Vehicle", 
          onstar2: "config1",
          action: "both",
          wires: [["n2"], ["n3"]] 
        },
        { 
          id: "config1", 
          type: "onstar2", 
          carname: "TestCar",
          username: TEST_CONFIG.credentials.username,
          password: TEST_CONFIG.credentials.password,
          pin: TEST_CONFIG.credentials.pin,
          vin: TEST_CONFIG.credentials.vin,
          deviceid: TEST_CONFIG.credentials.deviceid,
          totp: TEST_CONFIG.credentials.totp,
          checkrequeststatus: "true",
          requestpollingtimeoutseconds: "90",
          requestpollingintervalseconds: "6"
        },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function() {
        const n1 = helper.getNode("n1");
        const n2 = helper.getNode("n2");
        const n3 = helper.getNode("n3");

        n2.on("input", function(msg) {
          try {
            msg.should.have.property('payload');
            msg.payload.should.have.property('status', 'success');
            done();
          } catch(err) {
            done(err);
          }
        });

        n3.on("input", function(msg) {
          done(new Error("Error: " + JSON.stringify(msg.payload)));
        });

        n1.receive({ payload: "" });
      });
    });
  });
});
