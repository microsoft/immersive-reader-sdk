// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type Error = {
    type: ErrorType;
    message: string; // Human-readable representation of the error
}

export enum ErrorType {
    BadArgument = 'BadArgument',
    Timeout = 'Timeout',
    TokenExpired = 'TokenExpired'
}