import { OAuthToken, OnStarConfig } from "./types";
declare class TokenHandler {
    private config;
    constructor(config: OnStarConfig);
    static authTokenIsValid(authToken: OAuthToken): boolean;
    createUpgradeJWT(): string;
    createAuthJWT(): string;
    decodeAuthRequestResponse(encodedToken: string): OAuthToken;
    private decodeToken;
    private generateTimestamp;
    private generateNonce;
}
export default TokenHandler;
