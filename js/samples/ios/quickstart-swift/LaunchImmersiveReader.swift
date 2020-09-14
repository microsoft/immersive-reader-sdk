// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import UIKit
import Foundation

var navigationController: UINavigationController?

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

@objc public class Options: NSObject {
    var uiLang: String?
    var timeout: TimeInterval?
    
    public init(uiLang: String?, timeout: TimeInterval?, uiZIndex: NSNumber?) {
        self.uiLang = uiLang
        self.timeout = timeout
    }
}

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
    let resourceName: String?
    let request: Content
    let launchToPostMessageSentDurationInMs: Int
    
    init(cogSvcsAccessToken: String, resourceName: String?, request: Content, launchToPostMessageSentDurationInMs: Int) {
        self.cogSvcsAccessToken = cogSvcsAccessToken
        self.resourceName = resourceName
        self.request = request
        self.launchToPostMessageSentDurationInMs = launchToPostMessageSentDurationInMs
    }
}

public func launchImmersiveReader(navController: UINavigationController, token: String, content: Content, options: Options?, onSuccess: @escaping () -> Void, onFailure: @escaping (_ error: Error) -> Void, onExit: @escaping () -> Void) {
    
    if (content.chunks.count == 0) {
        let badArgumentError = Error(code: "BadArgument", message: "Chunks must not be empty.")
        onFailure(badArgumentError)
    }
    DispatchQueue.main.async {
        navigationController = navController
        // The Office compliant v0.0.1 token endpoint does not require a subdomain, pass in an empty string instead.
        let immersiveReaderViewController = ImmersiveReaderViewController(tokenToPass: token, contentToPass: content, optionsToPass: options, onSuccessImmersiveReader: {
            onSuccess()
        }, onFailureImmersiveReader: { error in
            onFailure(error)
        }, onTimeout: { timeout in
            navigationController?.popViewController(animated: true)
            let timeoutError = Error(code: "Timeout", message: "Page failed to load after timeout \(timeout) ms.")
            onFailure(timeoutError)
        }, onError: { error in
            navigationController?.popViewController(animated: true)
            let errorMessage = Error(code: "Internal Error", message: error)
            onFailure(errorMessage);
        }, onExitImmersiveReader: {
            navigationController?.popViewController(animated: true)
            onExit()
        })
        navigationController!.pushViewController(immersiveReaderViewController, animated: true)
    }
}
