/**
 * OnStar Authentication Tests
 * 
 * These tests are skipped by default to avoid making actual API calls during regular test runs.
 * To run authentication tests, use one of the following methods:
 * 
 * 1. Set environment variable: RUN_AUTH_TESTS=true npm test
 * 2. Use command line flag: npm test -- --auth-tests
 * 3. Run specific test file: RUN_AUTH_TESTS=true npx mocha test/authentication.spec.js
 * 
 * Note: These tests may make actual API calls to OnStar servers.
 */

//var should = require("should");
var flatted = require("flatted");
var helper = require("node-red-node-test-helper");
var onStar = require("../onstar.js");

helper.init(require.resolve('node-red'));

// Only run authentication tests when explicitly requested
const runAuthTests = process.env.RUN_AUTH_TESTS === 'true' || process.argv.includes('--auth-tests');

// Use describe.skip to skip tests unless explicitly requested
const describeAuth = runAuthTests ? describe : describe.skip;

describeAuth('OnStar Authentication', function () {

  beforeEach(function (done) {
      helper.startServer(done);
  });

  afterEach(function (done) {
      helper.unload();
      helper.stopServer(done);
  });

  it('Should fail authentication with invalid credentials', function (done) {
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
          messageReceived = true;
          // Should receive an error message indicating authentication failure
          msg.payload.should.have.property('message');
          // Common authentication error patterns from OnStarJS
          var errorMessage = msg.payload.message.toLowerCase();
          var isAuthError = errorMessage.includes('unauthorized') || 
                           errorMessage.includes('invalid credentials') || 
                           errorMessage.includes('authentication') ||
                           errorMessage.includes('401') ||
                           errorMessage.includes('missing required configuration parameters');
          isAuthError.should.be.true();
          done();
        } catch(err) {     
          done(err);
        }
      });
      
      n3.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          if (!messageReceived) {
            messageReceived = true;
            // Alternative output path for errors
            msg.payload.should.have.property('message');
            var errorMessage = msg.payload.message.toLowerCase();
            var isAuthError = errorMessage.includes('unauthorized') || 
                             errorMessage.includes('invalid credentials') || 
                             errorMessage.includes('authentication') ||
                             errorMessage.includes('401') ||
                             errorMessage.includes('missing required configuration parameters');
            isAuthError.should.be.true();
            done();
          }
        } catch(err) {
          done(err);
        }
      });
      
      // Trigger the authentication test
      n1.receive({ payload: "test_auth" });
    });
  });

  it('Should fail authentication with missing credentials', function (done) {
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
            // Should receive an error related to authentication
            var errorMessage = msg.payload.message.toLowerCase();
            var isAuthError = errorMessage.includes('unauthorized') || 
                             errorMessage.includes('invalid') || 
                             errorMessage.includes('authentication') ||
                             errorMessage.includes('401') ||
                             errorMessage.includes('totp') ||
                             errorMessage.includes('missing required configuration parameters');
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
                             errorMessage.includes('invalid') || 
                             errorMessage.includes('authentication') ||
                             errorMessage.includes('401') ||
                             errorMessage.includes('totp') ||
                             errorMessage.includes('missing required configuration parameters');
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
            // Should receive an error related to VIN or authentication
            var errorMessage = msg.payload.message.toLowerCase();
            var isError = errorMessage.includes('vin') || 
                         errorMessage.includes('invalid') || 
                         errorMessage.includes('unauthorized') ||
                         errorMessage.includes('401') ||
                         errorMessage.includes('missing required configuration parameters');
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
                         errorMessage.includes('unauthorized') ||
                         errorMessage.includes('401') ||
                         errorMessage.includes('missing required configuration parameters');
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
