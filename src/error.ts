// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type Error = {
    code: ErrorCode;
    message: string; // Human-readable representation of the error
}

export enum ErrorCode {
    BadArgument = 'BadArgument',
    Timeout = 'Timeout',
    TokenExpired = 'TokenExpired'
}