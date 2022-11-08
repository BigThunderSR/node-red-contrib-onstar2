import Request from "./Request";
import { RequestResponse } from "./types";
declare class RequestError extends Error {
    private response?;
    private request?;
    constructor(...args: any[]);
    getResponse(): RequestResponse | undefined;
    setResponse(response: RequestResponse): this;
    getRequest(): Request | undefined;
    setRequest(request: Request): this;
}
export default RequestError;
