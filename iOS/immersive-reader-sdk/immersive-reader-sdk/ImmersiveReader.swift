// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import Foundation

public struct Content: Encodable {
    var title: String
    var chunks: [Chunk]

    public init(title: String, chunks: [Chunk]) {
        self.title = title
        self.chunks = chunks
    }
}

public struct Chunk: Encodable {
    var content: String
    var lang: String?
    var mimeType: String?

    public init(content: String, lang: String?, mimeType: String?) {
        self.content = content
        self.lang = lang
        self.mimeType = mimeType
    }
}

public struct Options {
    var uiLang: String?
    var timeout: TimeInterval?

    public init(uiLang: String?, timeout: TimeInterval?, uiZIndex: NSNumber?) {
        self.uiLang = uiLang
        self.timeout = timeout
    }
}

public struct Error {
    public var code: String
    public var message: String

    public init(code: String, message: String) {
        self.code = code
        self.message = message
    }
}

struct Message: Encodable {
    let cogSvcsAccessToken: String
    let cogSvcsSubdomain: String
    let resourceName: String?
    let request: Content
    let launchToPostMessageSentDurationInMs: Int

    init(cogSvcsAccessToken: String, cogSvcsSubdomain: String, resourceName: String?, request: Content, launchToPostMessageSentDurationInMs: Int) {
        self.cogSvcsAccessToken = cogSvcsAccessToken
        self.cogSvcsSubdomain = cogSvcsSubdomain
        self.resourceName = resourceName
        self.request = request
        self.launchToPostMessageSentDurationInMs = launchToPostMessageSentDurationInMs
    }
}




