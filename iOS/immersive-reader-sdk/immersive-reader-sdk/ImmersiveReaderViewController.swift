// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import UIKit
import WebKit

public class ImmersiveReaderViewController: UIViewController {

    private enum ScriptHandlers: String {
        case readyForContent
        case launchSuccessful
        case tokenExpired
        case throttled
        case invalidMessagePassed
        case onExit
    }
    
    private let token: String
    private let subdomain: String
    private let content: Content
    private let startTime: TimeInterval
    private let options: Options?
    private let delegate: ImmersiveReaderDelegate?

    private var webView: WKWebView!
    
    public init?(token: String, subdomain: String, content: Content, options: Options?, delegate: ImmersiveReaderDelegate?) {

        if (content.chunks.count == 0) {
            let badArgumentError = Error(code: "BadArgument", message: "Chunks must not be empty.")
            delegate?.didFinishLaunching(badArgumentError)
            return nil
        }
        self.token = token
        self.subdomain = subdomain
        self.content = content
        self.delegate = delegate
        self.startTime = Date().timeIntervalSince1970*1000
        self.options = options

        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override public func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white

        webView = createAndConfigureWebView()
        webView.navigationDelegate = self
        view.addSubview(webView)
        addConstrainstsToWebView()

        // Load the main HTML in the WebView.
        loadMainHTML()
    }

    private func createAndConfigureWebView() -> WKWebView {
        let contentController = WKUserContentController()
        let configuration = WKWebViewConfiguration()
        if #available(iOS 11.0, *) {
            configuration.setURLSchemeHandler(testingHandler(), forURLScheme: "test")
        }
        configuration.userContentController = contentController

        contentController.add(self, name: ScriptHandlers.readyForContent.rawValue)
        contentController.add(self, name: ScriptHandlers.launchSuccessful.rawValue)
        contentController.add(self, name: ScriptHandlers.tokenExpired.rawValue)
        contentController.add(self, name: ScriptHandlers.throttled.rawValue)
        contentController.add(self, name: ScriptHandlers.invalidMessagePassed.rawValue)
        contentController.add(self, name: ScriptHandlers.onExit.rawValue)

        return WKWebView(frame: .zero, configuration: configuration)
    }


    func loadMainHTML() {
        guard let htmlContents = getFileContentsFor(filename: "ImmersiveReader", type: "html")  else {
            self.delegate?.didFinishLaunching(Error(code: "Internal Error", message: "Could not get the contents of html file"))
            return
        }
        webView.loadHTMLString(htmlContents, baseURL: nil)
    }

    func getFileContentsFor(filename: String, type: String) -> String? {
        let frameworkBundle = Bundle(for: ImmersiveReaderViewController.self)
        guard let filePath = frameworkBundle.path(forResource: filename, ofType: type) else {
            return nil
        }
        do {
            let contents = try String(contentsOfFile: filePath)
            return contents
        } catch {
            return nil
        }
    }

    private func addConstrainstsToWebView() {
        webView.translatesAutoresizingMaskIntoConstraints = false

        if #available(iOS 11.0, *) {
            let layoutGuide = view.safeAreaLayoutGuide
            webView.leadingAnchor.constraint(equalTo: layoutGuide.leadingAnchor).isActive = true
            webView.trailingAnchor.constraint(equalTo: layoutGuide.trailingAnchor).isActive = true
            webView.topAnchor.constraint(equalTo: layoutGuide.topAnchor).isActive = true
            webView.bottomAnchor.constraint(equalTo: layoutGuide.bottomAnchor).isActive = true
        } else {
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor).isActive = true
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor).isActive = true
            webView.topAnchor.constraint(equalTo: view.topAnchor).isActive = true
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor).isActive = true
        }
    }
}

extension ImmersiveReaderViewController: WKNavigationDelegate {

    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Create the message variable
        let message = Message(cogSvcsAccessToken: token, cogSvcsSubdomain: subdomain, content: content, options: options)
        do {
            let jsonData = try JSONEncoder().encode(message)
            guard let jsonString = String(data: jsonData, encoding: .utf8) else {
                print("Immersive Reader failed convert message to json string")
                return
            }
            self.webView.evaluateJavaScript("launchImmersiveReader(\(jsonString))") { (result, error) in
                if error != nil {
                    self.delegate?.didFinishLaunching(Error(code: "Internal Error", message: "Error in executing JavaScript in WkWebView."))
                }
            }
        } catch let error {
            self.delegate?.didFinishLaunching(Error(code: "Internal Error", message: error.localizedDescription))
        }
    }
}

extension ImmersiveReaderViewController: WKScriptMessageHandler {
    
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {

        if message.name == ScriptHandlers.readyForContent.rawValue {

        }
        
        if message.name == ScriptHandlers.launchSuccessful.rawValue {
             self.delegate?.didFinishLaunching(nil)
        }
        
        if message.name == ScriptHandlers.tokenExpired.rawValue {
            let tokenExpiredError = Error(code: "TokenExpired", message: "The access token supplied is expired.")
             self.delegate?.didFinishLaunching(tokenExpiredError)
        }
        
        if message.name == ScriptHandlers.throttled.rawValue {
            let throttledError = Error(code: "Throttled", message: "You have exceeded the call rate limit.")
            self.delegate?.didFinishLaunching(throttledError)
        }

        if message.name == ScriptHandlers.invalidMessagePassed.rawValue {
            let invalidMessageError = Error(code: "Invalid message passed to Immersive Reader", message: "Please check if the message value passed is valid")
            self.delegate?.didFinishLaunching(invalidMessageError)
        }

        if message.name == ScriptHandlers.onExit.rawValue {
            self.delegate?.didExitImmersiveReader()
            dismiss(animated: true, completion: nil)
        }
    }
}


