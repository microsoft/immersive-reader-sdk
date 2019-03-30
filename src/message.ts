// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Content } from './content';

export type Message = {
    cogSvcsAccessToken: string;
    request: Content;
    launchToPostMessageSentDurationInMs: number;
};