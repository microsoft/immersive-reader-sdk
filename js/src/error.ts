// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type Error = {
    code: ErrorCode;
    message: string; // Human-readable representation of the error
    sessionId?: string; // Session ID which can be used for debugging
};

export enum ErrorCode {
    BadArgument = 'BadArgument',
    Timeout = 'Timeout',
    TokenExpired = 'TokenExpired',
    Throttled = 'Throttled',
    ServerError = 'ServerError',
    InvalidSubdomain = 'InvalidSubdomain'
}