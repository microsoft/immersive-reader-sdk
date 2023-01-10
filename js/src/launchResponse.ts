// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type LaunchResponse = {
    container: HTMLDivElement;
    sessionId: string;
    readerReadyDuration: number;
    launchDuration: number;
    gcmCorrelationId: string;
    charactersProcessed: number;
};