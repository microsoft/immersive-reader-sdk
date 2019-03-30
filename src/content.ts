// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type Content = {
    title?: string;
    chunks: Chunk[];
}

export type Chunk = {
    content: string;
    lang?: string;
    mimeType?: string;
}