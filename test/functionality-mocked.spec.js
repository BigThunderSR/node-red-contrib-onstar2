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
var OnStarJS = require('onstarjs2');

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
      var mockVehicleResponse = {
        response: {
          status: 'success',
          data: {
            vehicles: {
              vehicle: [
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
          }
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
            msg.payload.should.have.property('status', 'success');
            msg.payload.should.have.property('data');
            
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
      var mockLocationResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              body: {
                locationResponse: {
                  position: {
                    latitude: '42.331427',
                    longitude: '-83.045754',
                    timestamp: '2025-07-22T10:30:00Z'
                  },
                  address: {
                    formattedAddress: '1234 Main Street, Detroit, MI 48201',
                    street: '1234 Main Street',
                    city: 'Detroit',
                    state: 'MI',
                    zipCode: '48201'
                  }
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
            var location = msg.payload.locationResponse;
            location.position.should.have.property('latitude', '42.331427');
            location.position.should.have.property('longitude', '-83.045754');
            location.address.should.have.property('city', 'Detroit');
            location.address.should.have.property('state', 'MI');
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
      var mockLockResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              requestId: 'req-12345',
              status: 'success',
              body: {
                remoteActionResponse: {
                  status: 'success',
                  message: 'Vehicle doors have been locked successfully'
                }
              }
            }
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

  describe('unlock-myvehicle', function () {
    it('Should unlock vehicle successfully', function (done) {
      var mockUnlockResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              requestId: 'req-12346',
              status: 'success',
              body: {
                remoteActionResponse: {
                  status: 'success',
                  message: 'Vehicle doors have been unlocked successfully'
                }
              }
            }
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

  describe('start-myvehicle', function () {
    it('Should start vehicle successfully', function (done) {
      var mockStartResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              requestId: 'req-12347',
              status: 'success',
              body: {
                remoteActionResponse: {
                  status: 'success',
                  message: 'Vehicle remote start initiated successfully'
                }
              }
            }
          }
        }
      };

      var mockClient = {
        start: sinon.stub().resolves(mockStartResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"start-myvehicle",name:"Start Vehicle",onstar2:"config1",wires:[["n2"],["n3"]] },
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

  describe('alert-myvehicle', function () {
    it('Should trigger vehicle alert successfully', function (done) {
      var mockAlertResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              requestId: 'req-12348',
              status: 'success',
              body: {
                remoteActionResponse: {
                  status: 'success',
                  message: 'Vehicle alert activated successfully'
                }
              }
            }
          }
        }
      };

      var mockClient = {
        alert: sinon.stub().resolves(mockAlertResponse)
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

  describe('get-mycharge-profile', function () {
    it('Should return charge profile successfully', function (done) {
      var mockChargeProfileResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              body: {
                chargeProfile: {
                  chargeMode: 'DELAYED_CHARGE',
                  departureTime: '07:30',
                  departDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
                  chargeSettings: {
                    maxChargeLevel: 90,
                    chargeRate: 'STANDARD'
                  },
                  climateSettings: {
                    preconditioningEnabled: true,
                    targetTemperature: 72
                  }
                }
              }
            }
          }
        }
      };

      var mockClient = {
        getChargingProfile: sinon.stub().resolves(mockChargeProfileResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"get-mycharge-profile",name:"Get Charge Profile",onstar2:"config1",wires:[["n2"],["n3"]] },
        { id:"config1",type:"onstar2",carname:"TestCar",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
        { id: "n2", type: "helper" },
        { id: "n3", type: "helper" }
      ];

      helper.load(onStar, flow, function () {
        var n1 = helper.getNode("n1");
        var n2 = helper.getNode("n2");

        n2.on("input", function (msg) {
          try {
            var chargeProfile = msg.payload.chargeProfile;
            chargeProfile.should.have.property('chargeMode', 'DELAYED_CHARGE');
            chargeProfile.should.have.property('departureTime', '07:30');
            chargeProfile.chargeSettings.should.have.property('maxChargeLevel', 90);
            chargeProfile.climateSettings.should.have.property('preconditioningEnabled', true);
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
    it('Should cancel vehicle start successfully', function (done) {
      var mockCancelStartResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              requestId: 'req-12349',
              status: 'success',
              body: {
                remoteActionResponse: {
                  status: 'success',
                  message: 'Vehicle remote start cancelled successfully'
                }
              }
            }
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

  describe('lock-mytrunk', function () {
    it('Should lock trunk successfully', function (done) {
      var mockLockTrunkResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              requestId: 'req-12350',
              status: 'success',
              body: {
                remoteActionResponse: {
                  status: 'success',
                  message: 'Vehicle trunk has been locked successfully'
                }
              }
            }
          }
        }
      };

      var mockClient = {
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

  describe('unlock-mytrunk', function () {
    it('Should unlock trunk successfully', function (done) {
      var mockUnlockTrunkResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              requestId: 'req-12351',
              status: 'success',
              body: {
                remoteActionResponse: {
                  status: 'success',
                  message: 'Vehicle trunk has been unlocked successfully'
                }
              }
            }
          }
        }
      };

      var mockClient = {
        unlockTrunk: sinon.stub().resolves(mockUnlockTrunkResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"unlock-mytrunk",name:"Unlock Trunk",onstar2:"config1",delay:"0",wires:[["n2"],["n3"]] },
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

  describe('mycharge-override', function () {
    it('Should override charge successfully', function (done) {
      var mockChargeOverrideResponse = {
        response: {
          status: 'success',
          data: {
            commandResponse: {
              requestId: 'req-12352',
              status: 'success',
              body: {
                remoteActionResponse: {
                  status: 'success',
                  message: 'Charge override initiated successfully'
                }
              }
            }
          }
        }
      };

      var mockClient = {
        chargeOverride: sinon.stub().resolves(mockChargeOverrideResponse)
      };
      sandbox.stub(OnStarJS, 'create').returns(mockClient);

      var flow = [
        { id:"n1",type:"mycharge-override",name:"Charge Override",onstar2:"config1",chargeoverridetype:"CHARGE_NOW",wires:[["n2"],["n3"]] },
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
});
