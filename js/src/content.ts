// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type Content = {
    title?: string;    // Title text shown at the top of the Immersive Reader (optional)
    chunks: Chunk[];   // Array of chunks
}

export type Chunk = {
    content: string;   // Plain text string
    lang?: string;     // Language of the text, e.g. en, es-ES (optional). Language will be detected automatically if not specified.
    mimeType?: string; // MIME type of the content (optional). Currently 'text/plain', 'application/mathml+xml', 'text/html', and 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' (Word docx files) are supported. Defaults to 'text/plain' if not specified.
}