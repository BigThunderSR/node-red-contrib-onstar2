class Vehicle {
    constructor(vehicle) {
        this.make = vehicle.make;
        this.model = vehicle.model;
        this.vin = vehicle.vin;
        this.year = vehicle.year;

        const diagCmd = (vehicle.commands?.command || []).find(
            cmd => cmd.name === 'diagnostics'
        );
        this.supportedDiagnostics = diagCmd?.commandData?.supportedDiagnostics?.supportedDiagnostic;

        this.supportedCommands = vehicle.commands?.command;
    }

    isSupported(diag) {
        return (this.supportedDiagnostics || []).includes(diag);
    }

    getSupported(diags = []) {
        if (diags.length === 0) {
            return this.supportedDiagnostics;
        }
        return (this.supportedDiagnostics || []).filter(item => diags.includes(item));
    }

    toString() {
        return `${this.year} ${this.make} ${this.model}`;
    }

    getSupportedCommands(commandList = []) {
        this.supportedCommands.forEach(command => {
            commandList.push(command.name);
        });
        return commandList;
    }
}

module.exports = Vehicle;