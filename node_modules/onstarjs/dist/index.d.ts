import RequestService from "./RequestService";
import { OnStarConfig, Result, AlertRequestOptions, DiagnosticsRequestOptions, SetChargingProfileRequestOptions, DoorRequestOptions, ChargeOverrideOptions } from "./types";
declare class OnStar {
    private requestService;
    constructor(requestService: RequestService);
    static create(config: OnStarConfig): OnStar;
    getAccountVehicles(): Promise<Result>;
    start(): Promise<Result>;
    cancelStart(): Promise<Result>;
    lockDoor(options?: DoorRequestOptions): Promise<Result>;
    unlockDoor(options?: DoorRequestOptions): Promise<Result>;
    alert(options?: AlertRequestOptions): Promise<Result>;
    cancelAlert(): Promise<Result>;
    chargeOverride(options?: ChargeOverrideOptions): Promise<Result>;
    getChargingProfile(): Promise<Result>;
    setChargingProfile(options?: SetChargingProfileRequestOptions): Promise<Result>;
    diagnostics(options?: DiagnosticsRequestOptions): Promise<Result>;
    location(): Promise<Result>;
    setCheckRequestStatus(checkStatus: boolean): void;
}
export default OnStar;
