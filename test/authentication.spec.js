/**
 * OnStar Authentication Tests with Mocking
 * 
 * These tests use mocked responses instead of making actual API calls.
 * This provides faster, more reliable tests that don't depend on external services.
 */

var sinon = require("sinon");
var flatted = require("flatted");
var helper = require("node-red-node-test-helper");
var onStar = require("../onstar.js");
var OnStarJS = require('onstarjs2');

helper.init(require.resolve('node-red'));

describe('OnStar Authentication (Mocked)', function () {
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

  it('Should fail authentication with invalid credentials', function (done) {
    // Mock OnStar.create to return a client that throws authentication error
    var mockClient = {
      getAccountVehicles: sinon.stub().rejects(new Error('Unauthorized: Invalid credentials'))
    };
    sandbox.stub(OnStarJS, 'create').returns(mockClient);

    var flow = [
      { id:"n1",type:"get-account-vehicles",name:"Test Authentication",onstar2:"17dfaade45168b46",wires:[["n2"],["n3"]] },
      { id:"17dfaade45168b46",type:"onstar2",carname:"TestCar1",username:"invalid@example.com",password:"wrongpassword",pin:"0000",vin:"INVALID12345678901",deviceid:"00000000-0000-0000-0000-000000000000",totp:"INVALID",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
      { id: "n2", type: "helper" },
      { id: "n3", type: "helper" }
    ];
    
    helper.load(onStar, flow, function () {
      var n2 = helper.getNode("n2");
      var n3 = helper.getNode("n3");
      var n1 = helper.getNode("n1");
      
      var messageReceived = false;
      
      n2.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          if (!messageReceived) {
            messageReceived = true;
            msg.payload.should.have.property('message');
            var errorMessage = msg.payload.message.toLowerCase();
            var isAuthError = errorMessage.includes('unauthorized') || 
                             errorMessage.includes('invalid credentials');
            isAuthError.should.be.true();
            done();
          }
        } catch(err) {     
          done(err);
        }
      });
      
      n3.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          if (!messageReceived) {
            messageReceived = true;
            msg.payload.should.have.property('message');
            var errorMessage = msg.payload.message.toLowerCase();
            var isAuthError = errorMessage.includes('unauthorized') || 
                             errorMessage.includes('invalid credentials');
            isAuthError.should.be.true();
            done();
          }
        } catch(err) {
          done(err);
        }
      });
      
      n1.receive({ payload: "test_auth" });
    });
  });

  it('Should fail authentication with missing credentials', function (done) {
    // Mock OnStar.create to return a client that throws configuration error
    var mockClient = {
      getAccountVehicles: sinon.stub().rejects(new Error('Missing required configuration parameters'))
    };
    sandbox.stub(OnStarJS, 'create').returns(mockClient);

    var flow = [
      { id:"n1",type:"get-account-vehicles",name:"Test Missing Creds",onstar2:"17dfaade45168b46",wires:[["n2"],["n3"]] },
      { id:"17dfaade45168b46",type:"onstar2",carname:"TestCar1",username:"",password:"",pin:"",vin:"",deviceid:"",totp:"",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
      { id: "n2", type: "helper" },
      { id: "n3", type: "helper" }
    ];
    
    helper.load(onStar, flow, function () {
      var n2 = helper.getNode("n2");
      var n3 = helper.getNode("n3");
      var n1 = helper.getNode("n1");
      
      var messageReceived = false;
      
      n2.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          if (!messageReceived) {
            messageReceived = true;
            msg.payload.should.have.property('message');
            var errorMessage = msg.payload.message.toLowerCase();
            var isConfigError = errorMessage.includes('missing') || 
                               errorMessage.includes('required') || 
                               errorMessage.includes('configuration') ||
                               errorMessage.includes('parameters');
            isConfigError.should.be.true();
            done();
          }
        } catch(err) {     
          done(err);
        }
      });
      
      n3.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          if (!messageReceived) {
            messageReceived = true;
            msg.payload.should.have.property('message');
            var errorMessage = msg.payload.message.toLowerCase();
            var isConfigError = errorMessage.includes('missing') || 
                               errorMessage.includes('required') || 
                               errorMessage.includes('configuration') ||
                               errorMessage.includes('parameters');
            isConfigError.should.be.true();
            done();
          }
        } catch(err) {
          done(err);
        }
      });
      
      n1.receive({ payload: "test_missing_creds" });
    });
  });

  it('Should fail authentication with invalid TOTP', function (done) {
    // Mock OnStar.create to return a client that throws TOTP error
    var mockClient = {
      getAccountVehicles: sinon.stub().rejects(new Error('Authentication failed: Invalid TOTP code'))
    };
    sandbox.stub(OnStarJS, 'create').returns(mockClient);

    var flow = [
      { id:"n1",type:"get-account-vehicles",name:"Test Invalid TOTP",onstar2:"17dfaade45168b46",wires:[["n2"],["n3"]] },
      { id:"17dfaade45168b46",type:"onstar2",carname:"TestCar1",username:"test@example.com",password:"testpassword",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"90892463-2243-4cd7-9144-3492df757ff2",totp:"INVALIDTOTP123",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
      { id: "n2", type: "helper" },
      { id: "n3", type: "helper" }
    ];
    
    helper.load(onStar, flow, function () {
      var n2 = helper.getNode("n2");
      var n3 = helper.getNode("n3");
      var n1 = helper.getNode("n1");
      
      var messageReceived = false;
      
      n2.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          if (!messageReceived) {
            messageReceived = true;
            msg.payload.should.have.property('message');
            var errorMessage = msg.payload.message.toLowerCase();
            var isAuthError = errorMessage.includes('authentication') || 
                             errorMessage.includes('invalid') || 
                             errorMessage.includes('totp');
            isAuthError.should.be.true();
            done();
          }
        } catch(err) {     
          done(err);
        }
      });
      
      n3.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          if (!messageReceived) {
            messageReceived = true;
            msg.payload.should.have.property('message');
            var errorMessage = msg.payload.message.toLowerCase();
            var isAuthError = errorMessage.includes('authentication') || 
                             errorMessage.includes('invalid') || 
                             errorMessage.includes('totp');
            isAuthError.should.be.true();
            done();
          }
        } catch(err) {
          done(err);
        }
      });
      
      n1.receive({ payload: "test_invalid_totp" });
    });
  });

  it('Should fail authentication with invalid VIN format', function (done) {
    // Mock OnStar.create to return a client that throws VIN error
    var mockClient = {
      getAccountVehicles: sinon.stub().rejects(new Error('Invalid VIN format provided'))
    };
    sandbox.stub(OnStarJS, 'create').returns(mockClient);

    var flow = [
      { id:"n1",type:"get-account-vehicles",name:"Test Invalid VIN",onstar2:"17dfaade45168b46",wires:[["n2"],["n3"]] },
      { id:"17dfaade45168b46",type:"onstar2",carname:"TestCar1",username:"test@example.com",password:"testpassword",pin:"1234",vin:"INVALID",deviceid:"90892463-2243-4cd7-9144-3492df757ff2",totp:"TESTTOTP123456",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
      { id: "n2", type: "helper" },
      { id: "n3", type: "helper" }
    ];
    
    helper.load(onStar, flow, function () {
      var n2 = helper.getNode("n2");
      var n3 = helper.getNode("n3");
      var n1 = helper.getNode("n1");
      
      var messageReceived = false;
      
      n2.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          if (!messageReceived) {
            messageReceived = true;
            msg.payload.should.have.property('message');
            var errorMessage = msg.payload.message.toLowerCase();
            var isError = errorMessage.includes('vin') || 
                         errorMessage.includes('invalid') || 
                         errorMessage.includes('format');
            isError.should.be.true();
            done();
          }
        } catch(err) {     
          done(err);
        }
      });
      
      n3.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          if (!messageReceived) {
            messageReceived = true;
            msg.payload.should.have.property('message');
            var errorMessage = msg.payload.message.toLowerCase();
            var isError = errorMessage.includes('vin') || 
                         errorMessage.includes('invalid') || 
                         errorMessage.includes('format');
            isError.should.be.true();
            done();
          }
        } catch(err) {
          done(err);
        }
      });
      
      n1.receive({ payload: "test_invalid_vin" });
    });
  });

  it('Should successfully authenticate with valid credentials', function (done) {
    // Mock OnStar.create to return a client that succeeds
    var mockVehicleResponse = {
      response: {
        data: {
          vehicles: {
            vehicle: [
              {
                vin: '1G1ZB5ST5JF260429',
                make: 'CHEVROLET',
                model: 'VOLT',
                year: '2018',
                nickname: 'TestCar1'
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
      { id:"n1",type:"get-account-vehicles",name:"Test Valid Auth",onstar2:"17dfaade45168b46",wires:[["n2"],["n3"]] },
      { id:"17dfaade45168b46",type:"onstar2",carname:"TestCar1",username:"valid@example.com",password:"validpassword",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"90892463-2243-4cd7-9144-3492df757ff2",totp:"VALIDTOTP123456",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
      { id: "n2", type: "helper" },
      { id: "n3", type: "helper" }
    ];
    
    helper.load(onStar, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      
      var successReceived = false;
      
      n2.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          if (!successReceived) {
            successReceived = true;
            // Should receive successful vehicle data
            msg.payload.should.be.an.Array();
            msg.payload.length.should.be.greaterThan(0);
            msg.payload[0].should.have.property('vin', '1G1ZB5ST5JF260429');
            done();
          }
        } catch(err) {     
          done(err);
        }
      });
      
      n1.receive({ payload: "test_valid_auth" });
    });
  });
  
  it('Should validate proper configuration node setup', function (done) {
    var flow = [
      { id:"n1",type:"get-account-vehicles",name:"Test Config Node",onstar2:"17dfaade45168b46",wires:[["n2"],["n3"]] },
      { id:"17dfaade45168b46",type:"onstar2",carname:"TestCar1",username:"test@example.com",password:"testpassword",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"90892463-2243-4cd7-9144-3492df757ff2",totp:"TESTTOTP123456",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
      { id: "n2", type: "helper" },
      { id: "n3", type: "helper" }
    ];
    helper.load(onStar, flow, function () {
      var n1 = helper.getNode("n1");
      var configNode = helper.getNode("17dfaade45168b46");
      
      try {
        // Verify the config node is properly set up
        n1.should.have.property('name', 'Test Config Node');
        n1.should.have.property('type', 'get-account-vehicles');
        
        // Verify the OnStar config node exists and has the right properties
        configNode.should.have.property('username', 'test@example.com');
        configNode.should.have.property('password', 'testpassword');
        configNode.should.have.property('pin', '1234');
        configNode.should.have.property('vin', '1G1ZB5ST5JF260429');
        configNode.should.have.property('deviceid', '90892463-2243-4cd7-9144-3492df757ff2');
        configNode.should.have.property('totp', 'TESTTOTP123456');
        configNode.should.have.property('checkrequeststatus', 'true');
        configNode.should.have.property('requestpollingtimeoutseconds', '90');
        configNode.should.have.property('requestpollingintervalseconds', '6');
        
        done();
      } catch(err) {
        done(err);
      }
    });
  });

});
