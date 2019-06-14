// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type Error = {
    code: string;    // One of a set of error codes (BadArgument, Timeout, TokenExpired)
    message: string; // Human-readable representation of the error
}