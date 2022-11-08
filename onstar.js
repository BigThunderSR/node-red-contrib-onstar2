const OnStar = require('onstarjs');

function createClient(configNode) {
    return OnStar.create({
        username: configNode.username,
        password: configNode.password,
        vin: configNode.vin,
        onStarPin: configNode.pin,
        deviceId: configNode.deviceid
    });
}

module.exports = function(RED) {
    function GetDiagnostics(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar);

                let client = createClient(configNode);
                let result = await client.diagnostics();
                node.send({
                    payload: result.response.data.commandResponse.body,
                });
            } catch (err) {
                node.send({
                    payload: err,
                });
            }
        });
    }

    function LockVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar);

                let client = createClient(configNode);
                let request = {
                    delay: msg.payload.delay || 0
                };

                let result = await client.lockDoor(request);
                node.send({
                    payload: result.response.data.commandResponse.body,
                });
            } catch (err) {
                node.send({
                    payload: err,
                });
            }
        });
    }

    function UnlockVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar);
                let request = {
                    delay: msg.payload.delay || 0
                };

                let client = createClient(configNode);
                let result = await client.unlockDoor(request);
                node.send({
                    payload: result.response.data.commandResponse.body,
                });
            } catch (err) {
                node.send({
                    payload: err,
                });
            }
        });
    }

    function StartVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar);

                let client = createClient(configNode);
                let result = await client.start();
                node.send({
                    payload: result.response.data.commandResponse.body,
                });
            } catch (err) {
                node.send({
                    payload: err,
                });
            }
        });
    }

    function CancelStartVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar);

                let client = createClient(configNode);
                let result = await client.cancelStart();
                node.send({
                    payload: result.response.data.commandResponse.body,
                });
            } catch (err) {
                node.send({
                    payload: err,
                });
            }
        });
    }

    function AlertVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar);

                let client = createClient(configNode);
                let request = {
                    action: msg.payload.action || ["Flash", "Honk"],
                    delay: msg.payload.delay || 0,
                    duration: msg.payload.duration || 1,
                    override: msg.payload.override || ["DoorOpen", "IgnitionOn"]
                };

                let result = await client.alert(request);
                node.send({
                    payload: result.response.data.commandResponse.body,
                });
            } catch (err) {
                node.send({
                    payload: err,
                });
            }
        });
    }

    function CancelAlertVehicle(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar);

                let client = createClient(configNode);
                let result = await client.cancelAlert();
                node.send({
                    payload: result.response.data.commandResponse.body,
                });
            } catch (err) {
                node.send({
                    payload: err,
                });
            }
        });
    }

    function Location(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar);

                let client = createClient(configNode);
                let result = await client.location();
                node.send({
                    payload: result.response.data.commandResponse.body,
                });
            } catch (err) {
                node.send({
                    payload: err,
                });
            }
        });
    }

    function ChargeOverride(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar);

                let client = createClient(configNode);
                let request = {
                    mode: msg.payload.mode || "CHARGE_NOW"
                };

                let result = await client.chargeOverride(request);
                node.send({
                    payload: result.response.data.commandResponse.body,
                });
            } catch (err) {
                node.send({
                    payload: err,
                });
            }
        });
    }

    function GetChargeProfile(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar);

                let client = createClient(configNode);
                let result = await client.getChargingProfile();
                node.send({
                    payload: result.response.data.commandResponse.body,
                });
            } catch (err) {
                node.send({
                    payload: err,
                });
            }
        });
    }

    function SetChargeProfile(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar);

                let client = createClient(configNode);
                let request = {
                    chargeMode: msg.payload.chargeMode || "IMMEDIATE",
                    rateType: msg.payload.rateType || "MIDPEAK"
                };

                let result = await client.setChargingProfile(request);
                node.send({
                    payload: result.response.data.commandResponse.body,
                });
            } catch (err) {
                node.send({
                    payload: err,
                });
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
    }

    RED.nodes.registerType('onstar', OnStarNode);
    RED.nodes.registerType('diagnostics', GetDiagnostics);
    RED.nodes.registerType('lock-vehicle', LockVehicle);
    RED.nodes.registerType('unlock-vehicle', UnlockVehicle);
    RED.nodes.registerType('start-vehicle', StartVehicle);
    RED.nodes.registerType('cancel-start-vehicle', CancelStartVehicle);
    RED.nodes.registerType('alert-vehicle', AlertVehicle);
    RED.nodes.registerType('cancel-alert-vehicle', CancelAlertVehicle);
    RED.nodes.registerType('location', Location);
    RED.nodes.registerType('charge-override', ChargeOverride);
    RED.nodes.registerType('get-charge-profile', GetChargeProfile);
    RED.nodes.registerType('set-charge-profile', SetChargeProfile);
}