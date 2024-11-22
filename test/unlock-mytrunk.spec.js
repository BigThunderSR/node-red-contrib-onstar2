//var should = require("should");
var flatted = require("flatted");
var helper = require("node-red-node-test-helper");
var onStar = require("../onstar.js");

helper.init(require.resolve('node-red'));

describe('unlock-mytrunk Node', function () {

  beforeEach(function (done) {
      helper.startServer(done);
  });

  afterEach(function (done) {
      helper.unload();
      helper.stopServer(done);
  });

  it('Should be loaded', function (done) {
    var flow = [
      { id:"n1",type:"unlock-mytrunk",name:"Unlock Trunk",onstar2:"Onstar Config",delay:"",wires:[["n2"],["n3"]] }
    ];
    helper.load(onStar, flow, function () {
      var n1 = helper.getNode("n1");
      try {
        n1.should.have.property('name', 'Unlock Trunk');
        n1.should.have.property('type', 'unlock-mytrunk');
        done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('Should output 401 error due to not having valid credentials', function (done) {
    var flow = [
      { id:"n1",type:"unlock-mytrunk",name:"Unlock Trunk",onstar2:"17dfaade45168b46",delay:"",wires:[["n2"],["n3"]] },
      { id:"17dfaade45168b46",type:"onstar2",carname:"TestCar1",username:"homer@simpson.com",password:"Doh!",pin:"1234",vin:"3N1AB6AP7BL687841",deviceid:"90892463-2243-4cd7-9144-3492df757ff2",checkrequeststatus:"true",requestpollingtimeoutseconds:"90",requestpollingintervalseconds:"6" },
      { id: "n2", type: "helper" }
    ];
    helper.load(onStar, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        try {
          flatted.stringify(msg);
          msg.payload.should.have.property('message', 'Missing required configuration parameters') ;
          done();
        } catch(err) {     
          done(err);
        }
      });
      n1.receive({ payload: "timestamp" });
    });
  });
});
