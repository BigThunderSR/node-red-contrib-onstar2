const OnStar = require('onstarjs');
const _ = require('lodash');
const Vehicle = require('./vehicle');

function createClient(configNode) {
    return OnStar.create({
        username: configNode.username,
        password: configNode.password,
        vin: configNode.vin,
        onStarPin: configNode.pin,
        deviceId: configNode.deviceid,
        checkRequestStatus: configNode.checkrequeststatus,
        requestPollingTimeoutSeconds: configNode.requestpollingtimeoutseconds,
        requestPollingIntervalSeconds: configNode.requestpollingintervalseconds
    });
}

module.exports = function(RED) {
    function GetAccountVehicles(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        //node.on('input', async function (msg) 
        node.on('input', async function () {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                const vehiclesRes = await client.getAccountVehicles();
                const vehicles = _.map(
                    _.get(vehiclesRes, 'response.data.vehicles.vehicle'),
                    v => new Vehicle(v)
                );
                let msg1 = {payload: vehicles};
                let msg2 = {payload: vehiclesRes.response};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }
    
    function GetDiagnostics(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let request = {
                    diagnosticItem: msg.payload.diagnosticItem || ["ENGINE COOLANT TEMP", "ENGINE RPM", "LAST TRIP FUEL ECONOMY", "OIL LIFE", "LIFETIME FUEL ECON", "HOTSPOT CONFIG", "LIFETIME FUEL USED", "ODOMETER", "HOTSPOT STATUS", "TIRE PRESSURE", "AMBIENT AIR TEMPERATURE", "LAST TRIP DISTANCE", "INTERM VOLT BATT VOLT", "FUEL TANK INFO", "HANDS FREE CALLING", "VEHICLE RANGE", "ENGINE AIR FILTER MONITOR STATUS"]
                };

                let result = await client.diagnostics(request);
                let msg1 = {payload: result.response.data.commandResponse.body};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function LockVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let request = {
                    delay: msg.payload.delay || 0
                };

                let result = await client.lockDoor(request);
                let msg1 = {payload: result.response.data.commandResponse.status};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function UnlockVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);
                let request = {
                    delay: msg.payload.delay || 0
                };

                let client = createClient(configNode);
                let result = await client.unlockDoor(request);
                let msg1 = {payload: result.response.data.commandResponse.status};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function StartVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        //node.on('input', async function (msg) 
        node.on('input', async function () {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let result = await client.start();
                let msg1 = {payload: result.response.data.commandResponse.status};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function CancelStartVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        //node.on('input', async function (msg) 
        node.on('input', async function () {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let result = await client.cancelStart();
                let msg1 = {payload: result.response.data.commandResponse.status};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function AlertVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let request = {
                    action: msg.payload.action || ["Flash", "Honk"],
                    delay: msg.payload.delay || 0,
                    duration: msg.payload.duration || 1,
                    override: msg.payload.override || ["DoorOpen", "IgnitionOn"]
                };

                let result = await client.alert(request);
                let msg1 = {payload: result.response.data.commandResponse.status};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function AlertVehicleLights(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let request = {
                    action: msg.payload.action || ["Flash"],
                    delay: msg.payload.delay || 0,
                    duration: msg.payload.duration || 1,
                    override: msg.payload.override || ["DoorOpen", "IgnitionOn"]
                };

                let result = await client.alert(request);
                let msg1 = {payload: result.response.data.commandResponse.status};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function AlertVehicleHorn(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let request = {
                    action: msg.payload.action || ["Honk"],
                    delay: msg.payload.delay || 0,
                    duration: msg.payload.duration || 1,
                    override: msg.payload.override || ["DoorOpen", "IgnitionOn"]
                };

                let result = await client.alert(request);
                let msg1 = {payload: result.response.data.commandResponse.status};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }
    
    function CancelAlertVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        //node.on('input', async function (msg) 
        node.on('input', async function () {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let result = await client.cancelAlert();
                let msg1 = {payload: result.response.data.commandResponse.status};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function LocateVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        //node.on('input', async function (msg) 
        node.on('input', async function () {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let result = await client.location();
                let msg1 = {payload: result.response.data.commandResponse.body};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function ChargeOverride(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let request = {
                    mode: msg.payload.mode || "CHARGE_NOW"
                };

                let result = await client.chargeOverride(request);
                let msg1 = {payload: result.response.data.commandResponse.status};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function GetChargeProfile(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        //node.on('input', async function (msg) 
        node.on('input', async function () {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let result = await client.getChargingProfile();
                let msg1 = {payload: result.response.data.commandResponse.body};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function SetChargeProfile(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let request = {
                    chargeMode: msg.payload.chargeMode || "IMMEDIATE",
                    rateType: msg.payload.rateType || "MIDPEAK"
                };

                let result = await client.setChargingProfile(request);
                let msg1 = {payload: result.response.data.commandResponse.status};
                let msg2 = {payload: result.response.data};
                node.send(
                    [(msg1), (msg2)]
                );
            } catch (err) {
                let errmsg = {payload: err}
                node.send(
                    [errmsg, errmsg]
                );
            }
        });
    }

    function OnStarNode(config) {
        RED.nodes.createNode(this, config);
        this.username = config.username;
        this.password = config.password;
        this.pin = config.pin;
        this.vin = config.vin;
        this.deviceid = config.deviceid;
        this.checkrequeststatus = config.checkrequeststatus;
        this.requestpollingtimeoutseconds = config.requestpollingtimeoutseconds;
        this.requestpollingintervalseconds = config.requestpollingintervalseconds;
    }

    RED.nodes.registerType('onstar2', OnStarNode);
    RED.nodes.registerType('get-account-vehicles', GetAccountVehicles);
    RED.nodes.registerType('get-diagnostics', GetDiagnostics);
    RED.nodes.registerType('lock-myvehicle', LockVehicle);
    RED.nodes.registerType('unlock-myvehicle', UnlockVehicle);
    RED.nodes.registerType('start-myvehicle', StartVehicle);
    RED.nodes.registerType('cancel-start-myvehicle', CancelStartVehicle);
    RED.nodes.registerType('alert-myvehicle', AlertVehicle);
    RED.nodes.registerType('alert-myvehicle-lights', AlertVehicleLights);
    RED.nodes.registerType('alert-myvehicle-horn', AlertVehicleHorn);
    RED.nodes.registerType('cancel-alert-myvehicle', CancelAlertVehicle);
    RED.nodes.registerType('locate-vehicle', LocateVehicle);
    RED.nodes.registerType('mycharge-override', ChargeOverride);
    RED.nodes.registerType('get-mycharge-profile', GetChargeProfile);
    RED.nodes.registerType('set-mycharge-profile', SetChargeProfile);
}