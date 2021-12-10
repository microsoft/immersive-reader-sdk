// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type LaunchResponse = {
    container: HTMLDivElement;
    sessionId: string;
    charactersProcessed: number;
    postLaunchOperations: PostLaunchOperations;
};

export type PostLaunchOperations = {
    pause: () => void,
    pauseIfWasPlaying: () => void,
    play: () => void,
    playIfWasPaused: () => void
};