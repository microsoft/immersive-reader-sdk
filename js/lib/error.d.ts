export declare type Error = {
    code: ErrorCode;
    message: string;
    sessionId?: string;
};
export declare enum ErrorCode {
    BadArgument = "BadArgument",
    Timeout = "Timeout",
    TokenExpired = "TokenExpired",
    Throttled = "Throttled",
    ServerError = "ServerError",
    InvalidSubdomain = "InvalidSubdomain"
}
