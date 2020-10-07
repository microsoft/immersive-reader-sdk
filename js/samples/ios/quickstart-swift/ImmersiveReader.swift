// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import Foundation

@objc public class Content: NSObject, Encodable {
    var title: String
    var chunks: [Chunk]

    @objc public init(title: String, chunks: [Chunk]) {
        self.title = title
        self.chunks = chunks
    }
}

@objc public class Chunk: NSObject, Encodable {
    var content: String
    var lang: String?
    var mimeType: String?

    @objc public init(content: String, lang: String?, mimeType: String?) {
        self.content = content
        self.lang = lang
        self.mimeType = mimeType
    }
}

@objc public class Options: NSObject, Encodable {
    var uiLang: String?
    var timeout: Int?
    var uiZIndex: Int?
    var useWebview: Bool?
    var customDomain: String?
    var allowFullscreen: Bool?
    var hideExitButton: Bool?
    var cookiePolicy: CookiePolicy?
    var disableFirstRun: Bool?
    var readAloudOptions: ReadAloudOptions?
    var translationOptions: TranslationOptions?
    var displayOptions: DisplayOptions?
    var preferences: String?

    public init(uiLang: String?, timeout: Int?, uiZIndex: Int?, hideExitButton: Bool?, preferences: String?) {
        self.uiLang = uiLang
        self.timeout = timeout
        self.hideExitButton = hideExitButton
        self.preferences = preferences
    }
}

public enum CookiePolicy: String, CodingKey, Encodable {
    case Disable
    case Enable
}

@objc public class ReadAloudOptions: NSObject, Encodable {
    var voice: String;
    var speed: Int?
    var autoplay: Bool?
    
    @objc public init(voice: String, speed: Int, autoplay: Bool) {
        self.voice = voice
        self.speed = speed
        self.autoplay = autoplay
    }
}

@objc public class TranslationOptions: NSObject, Encodable {
    var language: String?
    var autoEnableDocumentTranslation: Bool?
    var autoEnableWordTranslation: Bool?
    
    @objc public init(language: String, autoEnableDocumentTranslation: Bool, autoEnableWordTranslation: Bool) {
        self.language = language
        self.autoEnableDocumentTranslation = autoEnableDocumentTranslation
        self.autoEnableWordTranslation = autoEnableWordTranslation
    }
}

@objc public class DisplayOptions: NSObject, Encodable {
    var textSize: Int?
    var increaseSpacing: Bool?
    var fontFamily: String?
    
    @objc public init(textSize: Int, increaseSpacing: Bool, fontFamily: String) {
        self.textSize = textSize
        self.increaseSpacing = increaseSpacing
        self.fontFamily = fontFamily
    }
};

@objc public class Error: NSObject {
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
    let content: Content
    let options: Options?

    init(cogSvcsAccessToken: String, cogSvcsSubdomain: String, content: Content, options: Options? = nil) {
        self.cogSvcsAccessToken = cogSvcsAccessToken
        self.cogSvcsSubdomain = cogSvcsSubdomain
        self.content = content
        self.options = options
    }
}

public protocol ImmersiveReaderDelegate {
    func didExitImmersiveReader()
    func didFinishLaunching(_ error: Error?)
}
