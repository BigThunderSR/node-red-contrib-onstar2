import { Result, RequestResponse } from "./types";
declare class RequestResult {
    private status;
    private response?;
    private message?;
    constructor(status: string);
    setResponse(response: RequestResponse): this;
    setMessage(message: string): this;
    getResult(): Result;
}
export default RequestResult;
