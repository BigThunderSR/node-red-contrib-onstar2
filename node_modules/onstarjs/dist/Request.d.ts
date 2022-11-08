export declare enum RequestMethod {
    Get = 0,
    Post = 1
}
declare class Request {
    private url;
    private method;
    private body;
    private contentType;
    private authRequired;
    private upgradeRequired;
    private checkRequestStatus;
    private headers;
    constructor(url: string);
    getUrl(): string;
    getMethod(): RequestMethod;
    setMethod(method: RequestMethod): this;
    getHeaders(): object;
    setHeaders(headers: object): this;
    getBody(): string;
    setBody(body: string | object): this;
    isAuthRequired(): boolean;
    setAuthRequired(authRequired: boolean): this;
    isUpgradeRequired(): boolean;
    setUpgradeRequired(upgradeRequired: boolean): this;
    getContentType(): string;
    setContentType(type: string): this;
    getCheckRequestStatus(): boolean | null;
    setCheckRequestStatus(checkStatus: boolean | null): this;
}
export default Request;
