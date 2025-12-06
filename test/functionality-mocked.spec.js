/**
 * OnStar Functionality Tests with Mocking
 * 
 * These tests mock successful OnStar API responses to verify node behavior
 * without making actual API calls to OnStar servers.
 */

require("should");
var sinon = require("sinon");
var helper = require("node-red-node-test-helper");
var onStar = require("../onstar.js");
var OnStarJS = require('onstarjs2').default;

helper.init(require.resolve('node-red'));

describe('OnStar Functionality Tests (Mocked)', function () {
  let sandbox;

  beforeEach(function (done) {
    sandbox = sinon.createSandbox();
    helper.startServer(done);
  });

  afterEach(function (done) {
    sandbox.restore();
    helper.unload();
    helper.stopServer(done);
  });

  describe('get-account-vehicles', function () {
    it('Should return vehicle list successfully', function (done) {
      // Mock response matching onstarjs2 v2.14.1+ structure
      var mockVehicleResponse = {
        data: {
          vehicles: [
            {
              vin: '1G1ZB5ST5JF260429',
              make: 'CHEVROLET',
              model: 'VOLT',
              year: '2018',
              nickname: 'My Volt',
              color: 'Summit White',
              licensePlate: 'ABC123'
            },
            {
              vin: '1G1ZC5ST8JF123456',
              make: 'CHEVROLET',
              model: 'BOLT EV',
              year: '2022',
              nickname: 'My Bolt',
              color: 'Electric Blue',
              licensePlate: 'XYZ789'
            }
          ]
        }
      };

      var mockClient = {
        getAccountVehicles: sinon.stub().resolves(mockVehicleResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"get-account-vehicles",name:"Get Vehicles",onstar2:"config1",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");
        var n3 = helper.getNode("n3");

        var vehicleDataReceived = false;
        var rawDataReceived = false;

        n2.on("input", function (msg) {
          try {
            vehicleDataReceived = true;
            msg.payload.should.be.an.Array();
            msg.payload.length.should.equal(2);
            msg.payload[0].should.have.property('vin', '1G1ZB5ST5JF260429');
            msg.payload[0].should.have.property('make', 'CHEVROLET');
            msg.payload[1].should.have.property('vin', '1G1ZC5ST8JF123456');
            
            if (vehicleDataReceived && rawDataReceived) done();
          } catch(err) {
            done(err);
          }
        });

        n3.on("input", function (msg) {
          try {
            rawDataReceived = true;
            // onstarjs2 v2.14.1+ returns raw response without status wrapper
            msg.payload.should.have.property('data');
            msg.payload.data.should.have.property('vehicles');
            
            if (vehicleDataReceived && rawDataReceived) done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('get-diagnostics', function () {
    it('Should return diagnostic information successfully', function (done) {
      var mockDiagnosticsResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              body: {
                diagnosticResponse: [
                  {
                    diagnosticElement: 'ODOMETER',
                    value: '45230',
                    unit: 'miles',
                    timestamp: '2025-07-22T10:30:00Z'
                  },
                  {
                    diagnosticElement: 'FUEL TANK INFO',
                    value: '85',
                    unit: 'percent',
                    timestamp: '2025-07-22T10:30:00Z'
                  },
                  {
                    diagnosticElement: 'EV BATTERY LEVEL',
                    value: '92',
                    unit: 'percent',
                    timestamp: '2025-07-22T10:30:00Z'
                  },
                  {
                    diagnosticElement: 'ENGINE RPM',
                    value: '0',
                    unit: 'rpm',
                    timestamp: '2025-07-22T10:30:00Z'
                  }
                ]
              }
            }
          }
        }
      };

      var mockClient = {
        diagnostics: sinon.stub().resolves(mockDiagnosticsResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"get-diagnostics",name:"Get Diagnostics",onstar2:"config1",diagnostics:"ODOMETER,FUEL TANK INFO,EV BATTERY LEVEL",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            msg.payload.should.have.property('diagnosticResponse');
            msg.payload.diagnosticResponse.should.be.an.Array();
            msg.payload.diagnosticResponse.length.should.equal(4);
            
            var odometer = msg.payload.diagnosticResponse.find(d => d.diagnosticElement === 'ODOMETER');
            odometer.should.have.property('value', '45230');
            odometer.should.have.property('unit', 'miles');
            
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: { diagnosticItem: ['ODOMETER', 'FUEL TANK INFO', 'EV BATTERY LEVEL', 'ENGINE RPM'] } });
      });
    });
  });

  describe('locate-vehicle', function () {
    it('Should return vehicle location successfully', function (done) {
      // Mock response matching onstarjs2 v2.14.1+ telemetry structure
      var mockLocationResponse = {
        response: {
          data: {
            telemetry: {
              occurredTs: '2025-07-22T10:30:00Z',
              data: {
                position: {
                  lat: 42.331427,
                  lng: -83.045754,
                  geohash: 'test123'
                },
                velocity: {
                  spdInKph: 0,
                  dir: null
                }
              }
            }
          }
        }
      };

      var mockClient = {
        location: sinon.stub().resolves(mockLocationResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"locate-vehicle",name:"Locate Vehicle",onstar2:"config1",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            // onstarjs2 v2.14.1+ returns structured location data
            msg.payload.should.have.property('location');
            msg.payload.location.should.have.property('lat', 42.331427);
            msg.payload.location.should.have.property('long', -83.045754);
            msg.payload.should.have.property('velocity');
            msg.payload.should.have.property('timestamp', '2025-07-22T10:30:00Z');
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('lock-myvehicle', function () {
    it('Should lock vehicle successfully', function (done) {
      // Mock response matching onstarjs2 v2.14.1+ v3 API structure
      var mockLockResponse = {
        response: {
          data: {
            requestId: 'req-lock-12345',
            status: 'SUCCESS',
            requestTime: '2025-11-26T22:00:00Z',
            completionTime: '2025-11-26T22:00:15Z'
          }
        }
      };

      var mockClient = {
        lockDoor: sinon.stub().resolves(mockLockResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"lock-myvehicle",name:"Lock Vehicle",onstar2:"config1",delay:"0",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            msg.payload.should.have.property('status', 'SUCCESS');
            msg.payload.should.have.property('requestId', 'req-lock-12345');
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('unlock-myvehicle', function () {
    it('Should unlock vehicle successfully', function (done) {
      // Mock response matching onstarjs2 v2.14.1+ v3 API structure
      var mockUnlockResponse = {
        response: {
          data: {
            requestId: 'req-unlock-12346',
            status: 'SUCCESS',
            requestTime: '2025-11-26T22:00:00Z',
            completionTime: '2025-11-26T22:00:15Z'
          }
        }
      };

      var mockClient = {
        unlockDoor: sinon.stub().resolves(mockUnlockResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"unlock-myvehicle",name:"Unlock Vehicle",onstar2:"config1",delay:"0",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            msg.payload.should.have.property('status', 'SUCCESS');
            msg.payload.should.have.property('requestId', 'req-unlock-12346');
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('alert-myvehicle', function () {
    it('Should trigger vehicle alert successfully', function (done) {
      // Mock response matching onstarjs2 v2.14.1+ v3 API structure
      var mockAlertResponse = {
        response: {
          data: {
            requestId: 'req-alert-12348',
            status: 'SUCCESS',
            requestTime: '2025-11-26T22:00:00Z',
            completionTime: '2025-11-26T22:00:15Z'
          }
        }
      };

      var mockClient = {
        alert: sinon.stub().resolves(mockAlertResponse),
        cancelAlert: sinon.stub().resolves(mockAlertResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"alert-myvehicle",name:"Alert Vehicle",onstar2:"config1",action:"Honk,Flash",delay:"0",duration:"1",override:"DoorOpen,IgnitionOn",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            msg.payload.should.have.property('status', 'SUCCESS');
            msg.payload.should.have.property('requestId', 'req-alert-12348');
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('get-ev-charging-metrics', function () {
    it('Should trigger vehicle alert successfully', function (done) {
      // Mock response matching onstarjs2 v2.14.1+ v3 API structure
      var mockAlertResponse = {
        response: {
          data: {
            requestId: 'req-alert-12348',
            status: 'SUCCESS',
            requestTime: '2025-11-26T22:00:00Z',
            completionTime: '2025-11-26T22:00:15Z'
          }
        }
      };

      var mockClient = {
        alert: sinon.stub().resolves(mockAlertResponse),
        cancelAlert: sinon.stub().resolves(mockAlertResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"alert-myvehicle",name:"Alert Vehicle",onstar2:"config1",action:"Honk,Flash",delay:"0",duration:"1",override:"DoorOpen,IgnitionOn",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            msg.payload.should.have.property('status', 'SUCCESS');
            msg.payload.should.have.property('requestId', 'req-alert-12348');
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('get-ev-charging-metrics', function () {
    it('Should return EV charging metrics successfully', function (done) {
      var mockChargingMetricsResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              body: {
                batteryLevel: 75,
                chargeState: 'CHARGING',
                estimatedTimeToFull: 120,
                plugState: 'PLUGGED',
                voltage: 240,
                chargingSettings: {
                  targetChargeLevel: 90,
                  chargeMode: 'IMMEDIATE'
                },
                rangeEstimate: {
                  electric: 180,
                  total: 180
                }
              }
            }
          }
        }
      };

      var mockClient = {
        getEVChargingMetrics: sinon.stub().resolves(mockChargingMetricsResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"get-ev-charging-metrics",name:"Get EV Charging Metrics",onstar2:"config1",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            var metrics = msg.payload;
            metrics.should.have.property('batteryLevel', 75);
            metrics.should.have.property('chargeState', 'CHARGING');
            metrics.should.have.property('plugState', 'PLUGGED');
            metrics.rangeEstimate.should.have.property('electric', 180);
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('cancel-start-myvehicle', function () {
    it('Should cancel vehicle remote start successfully', function (done) {
      // Mock response matching onstarjs2 v2.14.1+ v3 API structure
      var mockCancelStartResponse = {
        response: {
          data: {
            requestId: 'req-cancel-12349',
            status: 'SUCCESS',
            requestTime: '2025-11-26T22:00:00Z',
            completionTime: '2025-11-26T22:00:15Z'
          }
        }
      };

      var mockClient = {
        cancelStart: sinon.stub().resolves(mockCancelStartResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"cancel-start-myvehicle",name:"Cancel Start Vehicle",onstar2:"config1",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            msg.payload.should.have.property('status', 'SUCCESS');
            msg.payload.should.have.property('requestId', 'req-cancel-12349');
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('lock-mytrunk', function () {
    it('Should lock trunk successfully', function (done) {
      // Mock response matching onstarjs2 v2.14.1+ v3 API structure
      var mockLockTrunkResponse = {
        response: {
          data: {
            requestId: 'req-lock-trunk-12350',
            status: 'SUCCESS',
            requestTime: '2025-11-26T22:00:00Z',
            completionTime: '2025-11-26T22:00:15Z'
          }
        }
      };      var mockClient = {
        lockTrunk: sinon.stub().resolves(mockLockTrunkResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"lock-mytrunk",name:"Lock Trunk",onstar2:"config1",delay:"0",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            msg.payload.should.have.property('status', 'SUCCESS');
            msg.payload.should.have.property('requestId', 'req-lock-trunk-12350');
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('unlock-mytrunk', function () {
    it('Should unlock vehicle trunk successfully', function (done) {
      // Mock response matching onstarjs2 v2.14.1+ v3 API structure
      var mockUnlockTrunkResponse = {
        response: {
          data: {
            requestId: 'req-unlock-trunk-12351',
            status: 'SUCCESS',
            requestTime: '2025-11-26T22:00:00Z',
            completionTime: '2025-11-26T22:00:15Z'
          }
        }
      };

      var mockClient = {
        unlockTrunk: sinon.stub().resolves(mockUnlockTrunkResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"unlock-mytrunk",name:"Unlock Trunk",onstar2:"config1",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            msg.payload.should.have.property('status', 'SUCCESS');
            msg.payload.should.have.property('requestId', 'req-unlock-trunk-12351');
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('set-charge-level-target', function () {
    it('Should set charge level target successfully', function (done) {
      var mockSetChargeLevelResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              requestId: 'req-12352',
              status: 'success',
              body: {
                remoteActionResponse: {
                  status: 'success',
                  message: 'Charge level target set successfully'
                }
              }
            }
          }
        }
      };

      var mockClient = {
        setChargeLevelTarget: sinon.stub().resolves(mockSetChargeLevelResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"set-charge-level-target",name:"Set Charge Level Target",onstar2:"config1",targetlevel:"85",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            msg.payload.should.equal('success');
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('get-vehicle-details', function () {
    it('Should return vehicle details successfully', function (done) {
      // Mock response matching actual OnStar API v3 structure from OnStar2MQTT samples
      var mockVehicleDetailsResponse = {
        errors: [],
        data: {
          vehicleDetails: {
            vin: '1G1ZB5ST5JF260429',
            make: 'Chevrolet',
            model: 'Volt',
            year: '2018',
            onstarCapable: true,
            imageUrl: 'https://cgi.chevrolet.com/mmgprod-us/image.jpg',
            rpoCodes: ['ABC', 'DEF', 'GHI']
          }
        },
        extensions: null,
        dataPresent: true
      };

      var mockClient = {
        getVehicleDetails: sinon.stub().resolves(mockVehicleDetailsResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"get-vehicle-details",name:"Get Vehicle Details",onstar2:"config1",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");
        var n3 = helper.getNode("n3");

        var processedDataReceived = false;
        var rawDataReceived = false;

        n2.on("input", function (msg) {
          try {
            processedDataReceived = true;
            // Node outputs result.data or result
            msg.payload.should.have.property('vehicleDetails');
            msg.payload.vehicleDetails.should.have.property('vin', '1G1ZB5ST5JF260429');
            msg.payload.vehicleDetails.should.have.property('make', 'Chevrolet');
            msg.payload.vehicleDetails.should.have.property('model', 'Volt');
            msg.payload.vehicleDetails.should.have.property('onstarCapable', true);
            
            if (processedDataReceived && rawDataReceived) done();
          } catch(err) {
            done(err);
          }
        });

        n3.on("input", function (msg) {
          try {
            rawDataReceived = true;
            // Second output returns full result
            msg.payload.should.have.property('errors');
            msg.payload.should.have.property('data');
            msg.payload.should.have.property('dataPresent', true);
            
            if (processedDataReceived && rawDataReceived) done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('get-onstar-plan', function () {
    it('Should return OnStar plan successfully', function (done) {
      // Mock response matching actual OnStar API v3 structure from OnStar2MQTT samples
      var mockOnstarPlanResponse = {
        errors: [],
        data: {
          vehicleDetails: {
            model: 'Volt',
            make: 'Chevrolet',
            year: '2018',
            planExpiryInfo: [],
            planInfo: [
              {
                productCode: 'Connected Access',
                billingCadence: 'PREPAID',
                status: 'Active',
                startDate: '2024-04-27',
                endDate: '2032-04-26',
                productType: 'ONSTAR',
                isTrial: true
              },
              {
                productCode: 'Remote Access',
                billingCadence: 'PREPAID',
                status: 'Active',
                startDate: '2024-04-27',
                endDate: '2032-04-26',
                productType: 'ONSTAR',
                isTrial: true
              }
            ],
            offers: []
          }
        },
        extensions: null,
        dataPresent: true
      };

      var mockClient = {
        getOnstarPlan: sinon.stub().resolves(mockOnstarPlanResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"get-onstar-plan",name:"Get OnStar Plan",onstar2:"config1",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");
        var n3 = helper.getNode("n3");

        var processedDataReceived = false;
        var rawDataReceived = false;

        n2.on("input", function (msg) {
          try {
            processedDataReceived = true;
            // Node outputs result.data or result
            msg.payload.should.have.property('vehicleDetails');
            msg.payload.vehicleDetails.should.have.property('planInfo');
            msg.payload.vehicleDetails.planInfo.should.be.an.Array();
            msg.payload.vehicleDetails.planInfo[0].should.have.property('productCode', 'Connected Access');
            msg.payload.vehicleDetails.planInfo[0].should.have.property('status', 'Active');
            
            if (processedDataReceived && rawDataReceived) done();
          } catch(err) {
            done(err);
          }
        });

        n3.on("input", function (msg) {
          try {
            rawDataReceived = true;
            // Second output returns full result
            msg.payload.should.have.property('errors');
            msg.payload.should.have.property('data');
            msg.payload.should.have.property('dataPresent', true);
            
            if (processedDataReceived && rawDataReceived) done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('get-vehicle-recall-info', function () {
    it('Should return vehicle recall info successfully', function (done) {
      // Mock response matching actual OnStar API v3 structure from OnStar2MQTT samples
      var mockRecallInfoResponse = {
        errors: [],
        data: {
          vehicleDetails: {
            recallInfo: [
              {
                recallId: 'N252503010',
                title: 'Unintended Parking Brake Engagement',
                type: 'ZPSR',
                typeDescription: 'Product Safety Recall',
                description: 'Test recall description',
                recallStatus: 'A',
                repairStatus: 'incomplete',
                repairStatusCode: '00',
                repairDescription: 'Dealers will inspect and replace if necessary.',
                safetyRiskDescription: 'Risk of crash if parking brake actuates while driving.',
                completedDate: null
              }
            ]
          }
        },
        extensions: null,
        dataPresent: true
      };

      var mockClient = {
        getVehicleRecallInfo: sinon.stub().resolves(mockRecallInfoResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"get-vehicle-recall-info",name:"Get Vehicle Recall Info",onstar2:"config1",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");
        var n3 = helper.getNode("n3");

        var processedDataReceived = false;
        var rawDataReceived = false;

        n2.on("input", function (msg) {
          try {
            processedDataReceived = true;
            // Node outputs result.data or result
            msg.payload.should.have.property('vehicleDetails');
            msg.payload.vehicleDetails.should.have.property('recallInfo');
            msg.payload.vehicleDetails.recallInfo.should.be.an.Array();
            msg.payload.vehicleDetails.recallInfo[0].should.have.property('recallId', 'N252503010');
            msg.payload.vehicleDetails.recallInfo[0].should.have.property('repairStatus', 'incomplete');
            
            if (processedDataReceived && rawDataReceived) done();
          } catch(err) {
            done(err);
          }
        });

        n3.on("input", function (msg) {
          try {
            rawDataReceived = true;
            // Second output returns full result
            msg.payload.should.have.property('errors');
            msg.payload.should.have.property('data');
            msg.payload.should.have.property('dataPresent', true);
            
            if (processedDataReceived && rawDataReceived) done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });

  describe('stop-lights', function () {
    it('Should stop lights successfully', function (done) {
      // Mock response matching onstarjs2 v2.14.1+ v3 API structure
      var mockStopLightsResponse = {
        response: {
          data: {
            requestId: 'req-stop-lights-12353',
            status: 'SUCCESS',
            requestTime: '2025-11-26T22:00:00Z',
            completionTime: '2025-11-26T22:00:15Z'
          }
        }
      };

      var mockClient = {
        stopLights: sinon.stub().resolves(mockStopLightsResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"stop-lights",name:"Stop Lights",onstar2:"config1",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            msg.payload.should.have.property('status', 'SUCCESS');
            msg.payload.should.have.property('requestId', 'req-stop-lights-12353');
            done();
          } catch(err) {
            done(err);
          }
        });

        n1.receive({ payload: "test" });
      });
    });
  });
});
