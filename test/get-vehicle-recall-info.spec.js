var sinon = require("sinon");
var flatted = require("flatted");
var helper = require("node-red-node-test-helper");
var onStar = require("../onstar.js");
var OnStarJS = require('onstarjs2').default;

helper.init(require.resolve('node-red'));

describe('get-vehicle-recall-info', function () {
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

  it('Should be loaded', function (done) {
    var flow = [
      { id:"n1",type:"get-vehicle-recall-info",name:"Get Vehicle Recall Info",onstar2:"Onstar Config",wires:[["n2"],["n3"]] }
    ];
    helper.load(onStar, flow, function () {
      var n1 = helper.getNode("n1");
      try {
        n1.should.have.property('name', 'Get Vehicle Recall Info');
        n1.should.have.property('type', 'get-vehicle-recall-info');
        done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('Should output error with mocked authentication failure', function (done) {
    var mockClient = {
      getVehicleRecallInfo: sinon.stub().rejects(new Error('Unauthorized'))
    };
    sandbox.stub(OnStarJS, 'create').returns(mockClient);

    var flow = [
      { id:"n1",type:"get-vehicle-recall-info",name:"Test Node",onstar2:"17dfaade45168b46",wires:[["n2"],["n3"]] },
      { id:"17dfaade45168b46",type:"onstar2",carname:"TestCar1",username:"test@example.com",password:"testpass",pin:"1234",vin:"1G1ZB5ST5JF260429",deviceid:"test-device-id",totp:"TESTTOTP",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
      { id: "n2", type: "helper" },
      { id: "n3", type: "helper" }
    ];
    helper.load(onStar, flow, function () {
      var n3 = helper.getNode("n3");
      var n1 = helper.getNode("n1");
      n3.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          msg.should.have.property('payload');
          msg.payload.should.have.property('message');
          msg.payload.message.should.match(/Unauthorized/);
          done();
        } catch(err) {     
          done(err);
        }
      });
      n1.receive({ payload: "timestamp" });
    });
  });
});
