//const OnStar = require('./deps/index.cjs');
const OnStar = require('onstarjs2').default;
const _ = require('lodash');
const Vehicle = require('./deps/vehicle');

function createClient(configNode) {
    let options = {
        username: configNode.username,
        password: configNode.password,
        vin: configNode.vin,
        onStarTOTP: configNode.totp,
        onStarPin: configNode.pin,
        deviceId: configNode.deviceid,
        checkRequestStatus: configNode.checkrequeststatus,
        requestPollingTimeoutSeconds: configNode.requestpollingtimeoutseconds,
        requestPollingIntervalSeconds: configNode.requestpollingintervalseconds
    };

    // Add tokenLocation if configured
    if (configNode.tokenlocation && configNode.tokenlocation.trim() !== '') {
        options.tokenLocation = configNode.tokenlocation.trim();
    }

    return OnStar.create(options);
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
                // onstarjs2 v2.14.1+ returns vehicles at data.vehicles (not response.data.vehicles.vehicle)
                const vehicles = _.map(
                    _.get(vehiclesRes, 'data.vehicles'),
                    v => new Vehicle(v)
                );
                let msg1 = {payload: vehicles};
                // Send full response for debugging/raw access
                let msg2 = {payload: vehiclesRes};
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

        node.on('input', async function () {            
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                // v3 API: diagnostics() no longer accepts diagnosticItem parameter
                // It automatically returns all available diagnostic data
                let client = createClient(configNode);
                let result = await client.diagnostics();
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
                let delay = config.delay;
                let request = {
                    //delay: msg.payload.delay || 0
                    delay: delay || msg.payload.delay || 0
                };

                let result = await client.lockDoor(request);
                // onstarjs2 v2.14.1+ supports v3 API with v1 fallback
                // v3: response.data.status, v1: response.data.commandResponse.status
                const status = result.response.data.status || result.response.data.commandResponse?.status;
                const requestId = result.response.data.requestId || result.response.data.commandResponse?.requestId;
                let msg1 = {payload: {status, requestId}};
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

                let delay = config.delay;
                let request = {
                    //delay: msg.payload.delay || 0
                    delay: delay || msg.payload.delay || 0
                };

                let client = createClient(configNode);
                let result = await client.unlockDoor(request);
                // onstarjs2 v2.14.1+ supports v3 API with v1 fallback
                // v3: response.data.status, v1: response.data.commandResponse.status
                const status = result.response.data.status || result.response.data.commandResponse?.status;
                const requestId = result.response.data.requestId || result.response.data.commandResponse?.requestId;
                let msg1 = {payload: {status, requestId}};
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

    function LockTrunk(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let client = createClient(configNode);
                let delay = config.delay;
                let request = {
                    //delay: msg.payload.delay || 0
                    delay: delay || msg.payload.delay || 0
                };

                let result = await client.lockTrunk(request);
                // onstarjs2 v2.14.1+ supports v3 API with v1 fallback
                // v3: response.data.status, v1: response.data.commandResponse.status
                const status = result.response.data.status || result.response.data.commandResponse?.status;
                const requestId = result.response.data.requestId || result.response.data.commandResponse?.requestId;
                let msg1 = {payload: {status, requestId}};
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

    function UnlockTrunk(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);

                let delay = config.delay;
                let request = {
                    //delay: msg.payload.delay || 0
                    delay: delay || msg.payload.delay || 0
                };

                let client = createClient(configNode);
                let result = await client.unlockTrunk(request);
                // onstarjs2 v2.14.1+ supports v3 API with v1 fallback
                // v3: response.data.status, v1: response.data.commandResponse.status
                const status = result.response.data.status || result.response.data.commandResponse?.status;
                const requestId = result.response.data.requestId || result.response.data.commandResponse?.requestId;
                let msg1 = {payload: {status, requestId}};
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
                // onstarjs2 v2.14.1+ supports v3 API with v1 fallback
                // v3: response.data.status, v1: response.data.commandResponse.status
                const status = result.response.data.status || result.response.data.commandResponse?.status;
                const requestId = result.response.data.requestId || result.response.data.commandResponse?.requestId;
                let msg1 = {payload: {status, requestId}};
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
                // onstarjs2 v2.14.1+ supports v3 API with v1 fallback
                // v3: response.data.status, v1: response.data.commandResponse.status
                const status = result.response.data.status || result.response.data.commandResponse?.status;
                const requestId = result.response.data.requestId || result.response.data.commandResponse?.requestId;
                let msg1 = {payload: {status, requestId}};
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

                let action = config.action;
                let actionArray = undefined;
                let delay = config.delay;
                let duration = config.duration;
                let override = config.override;
                let overrideArray = undefined;

                if (action == '') {
                    actionArray = undefined;
                }
                if (action !== '') {
                    actionArray = action.split(',');
                }
                if (override == '') {
                    overrideArray = undefined
                }
                if (override !== '') {
                    overrideArray = override.split(',');
                }

                let client = createClient(configNode);                              
                let request = {
                    action: actionArray || msg.payload.action || ["Flash", "Honk"],
                    delay: delay || msg.payload.delay || 0,
                    duration: duration || msg.payload.duration || 1,
                    override: overrideArray || msg.payload.override || ["DoorOpen", "IgnitionOn"]
                };

                let result = await client.cancelAlert(request);
                // onstarjs2 v2.14.1+ v3 API returns status directly in response.data
                let msg1 = {payload: {status: result.response.data.status, requestId: result.response.data.requestId}};
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
                // onstarjs2 v2.14.1+ supports v3 API with v1 fallback
                // v3: response.data.status, v1: response.data.commandResponse.status
                const status = result.response.data.status || result.response.data.commandResponse?.status;
                const requestId = result.response.data.requestId || result.response.data.commandResponse?.requestId;
                let msg1 = {payload: {status, requestId}};
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
                // onstarjs2 v2.14.1+ supports v3 API with v1 fallback
                // v3: response.data.status, v1: response.data.commandResponse.status
                const status = result.response.data.status || result.response.data.commandResponse?.status;
                const requestId = result.response.data.requestId || result.response.data.commandResponse?.requestId;
                let msg1 = {payload: {status, requestId}};
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
                // onstarjs2 v2.14.1+ supports v3 API with v1 fallback
                // v3: response.data.status, v1: response.data.commandResponse.status
                const status = result.response.data.status || result.response.data.commandResponse?.status;
                const requestId = result.response.data.requestId || result.response.data.commandResponse?.requestId;
                let msg1 = {payload: {status, requestId}};
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
                // onstarjs2 v2.14.1+ returns location data in telemetry structure
                const locationData = {
                    location: {
                        lat: _.get(result, 'response.data.telemetry.data.position.lat'),
                        long: _.get(result, 'response.data.telemetry.data.position.lng'),
                        elv: _.get(result, 'response.data.telemetry.data.position.elv'),
                        geohash: _.get(result, 'response.data.telemetry.data.position.geohash')
                    },
                    velocity: _.get(result, 'response.data.telemetry.data.velocity'),
                    timestamp: _.get(result, 'response.data.telemetry.occurredTs')
                };
                let msg1 = {payload: locationData};
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

    function SetChargeLevelTarget(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);
                let targetLevel = config.targetlevel;
                let client = createClient(configNode);
                
                // Target charge level (tcl) - percentage value 0-100
                let tcl = parseInt(targetLevel || msg.payload.targetLevel || msg.payload.tcl || 80);
                
                // Optional parameters
                let opts = {
                    noMetricsRefresh: msg.payload.noMetricsRefresh,
                    clientRequestId: msg.payload.clientRequestId,
                    clientVersion: msg.payload.clientVersion,
                    os: msg.payload.os
                };
                
                // Remove undefined properties
                Object.keys(opts).forEach(key => opts[key] === undefined && delete opts[key]);

                let result = await client.setChargeLevelTarget(tcl, Object.keys(opts).length > 0 ? opts : undefined);
                let msg1 = {payload: result.response?.data?.commandResponse?.status || result.status};
                let msg2 = {payload: result.response?.data || result};
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

    function StopCharging(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);
                let client = createClient(configNode);
                
                // Optional parameters
                let opts = {
                    noMetricsRefresh: msg.payload.noMetricsRefresh,
                    clientRequestId: msg.payload.clientRequestId,
                    clientVersion: msg.payload.clientVersion,
                    os: msg.payload.os
                };
                
                // Remove undefined properties
                Object.keys(opts).forEach(key => opts[key] === undefined && delete opts[key]);

                let result = await client.stopCharging(Object.keys(opts).length > 0 ? opts : undefined);
                let msg1 = {payload: result.response?.data?.commandResponse?.status || result.status};
                let msg2 = {payload: result.response?.data || result};
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

    function GetEVChargingMetrics(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);
                let client = createClient(configNode);
                
                // Optional parameters
                let opts = {
                    clientVersion: msg.payload.clientVersion,
                    os: msg.payload.os
                };
                
                // Remove undefined properties
                Object.keys(opts).forEach(key => opts[key] === undefined && delete opts[key]);

                let result = await client.getEVChargingMetrics(Object.keys(opts).length > 0 ? opts : undefined);
                let msg1 = {payload: result.response?.data?.commandResponse?.body || result.response?.data};
                let msg2 = {payload: result.response?.data || result};
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

    function RefreshEVChargingMetrics(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function (msg) {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);
                let client = createClient(configNode);
                
                // Optional parameters
                let opts = {
                    clientVersion: msg.payload.clientVersion,
                    os: msg.payload.os
                };
                
                // Remove undefined properties
                Object.keys(opts).forEach(key => opts[key] === undefined && delete opts[key]);

                let result = await client.refreshEVChargingMetrics(Object.keys(opts).length > 0 ? opts : undefined);
                let msg1 = {payload: result.response?.data?.commandResponse?.body || result.response?.data};
                let msg2 = {payload: result.response?.data || result};
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

    function GetVehicleDetails(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function () {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);
                let client = createClient(configNode);
                let result = await client.getVehicleDetails();
                let msg1 = {payload: result.data || result};
                let msg2 = {payload: result};
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

    function GetOnstarPlan(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function () {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);
                let client = createClient(configNode);
                let result = await client.getOnstarPlan();
                let msg1 = {payload: result.data || result};
                let msg2 = {payload: result};
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

    function GetVehicleRecallInfo(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function () {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);
                let client = createClient(configNode);
                let result = await client.getVehicleRecallInfo();
                let msg1 = {payload: result.data || result};
                let msg2 = {payload: result};
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

    function StopLights(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function () {
            try {
                let configNode = RED.nodes.getNode(config.onstar2);
                let client = createClient(configNode);
                let result = await client.stopLights();
                const status = result.response?.data?.status || result.response?.data?.commandResponse?.status;
                const requestId = result.response?.data?.requestId || result.response?.data?.commandResponse?.requestId;
                let msg1 = {payload: {status, requestId}};
                let msg2 = {payload: result.response?.data || result};
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
        this.totp = config.totp;
        this.pin = config.pin;
        this.vin = config.vin;
        this.deviceid = config.deviceid;
        this.tokenlocation = config.tokenlocation;
        this.checkrequeststatus = config.checkrequeststatus;
        this.requestpollingtimeoutseconds = config.requestpollingtimeoutseconds;
        this.requestpollingintervalseconds = config.requestpollingintervalseconds;
    }

    RED.nodes.registerType('onstar2', OnStarNode);
    RED.nodes.registerType('get-account-vehicles', GetAccountVehicles);
    RED.nodes.registerType('get-diagnostics', GetDiagnostics);
    RED.nodes.registerType('lock-myvehicle', LockVehicle);
    RED.nodes.registerType('unlock-myvehicle', UnlockVehicle);
    RED.nodes.registerType('lock-mytrunk', LockTrunk);
    RED.nodes.registerType('unlock-mytrunk', UnlockTrunk);
    RED.nodes.registerType('start-myvehicle', StartVehicle);
    RED.nodes.registerType('cancel-start-myvehicle', CancelStartVehicle);
    RED.nodes.registerType('alert-myvehicle', AlertVehicle);
    RED.nodes.registerType('alert-myvehicle-lights', AlertVehicleLights);
    RED.nodes.registerType('alert-myvehicle-horn', AlertVehicleHorn);
    RED.nodes.registerType('cancel-alert-myvehicle', CancelAlertVehicle);
    RED.nodes.registerType('locate-vehicle', LocateVehicle);
    RED.nodes.registerType('set-charge-level-target', SetChargeLevelTarget);
    RED.nodes.registerType('stop-charging', StopCharging);
    RED.nodes.registerType('get-ev-charging-metrics', GetEVChargingMetrics);
    RED.nodes.registerType('refresh-ev-charging-metrics', RefreshEVChargingMetrics);
    RED.nodes.registerType('get-vehicle-details', GetVehicleDetails);
    RED.nodes.registerType('get-onstar-plan', GetOnstarPlan);
    RED.nodes.registerType('get-vehicle-recall-info', GetVehicleRecallInfo);
    RED.nodes.registerType('stop-lights', StopLights);
}