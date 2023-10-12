// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type LaunchResponse = {
    container: HTMLDivElement;
    charactersProcessed: number;
    readerReadyDuration: number;
    launchDuration: number;
    gcmCorrelationId: string;
    sessionId: string;
};