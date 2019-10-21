// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import UIKit
import WebKit

public class ImmersiveReaderViewController: UIViewController, WKUIDelegate, WKNavigationDelegate {
    
    let tokenToSend: String
    let subdomainToSend: String
    let contentToSend: Content
    let optionsToSend: Options?
    let onSuccessImmersiveReader: (() -> Void)?
    let onFailureImmersiveReader: ((_ error: Error) -> Void)?
    let onTimeout: ((_ timeoutValue: TimeInterval) -> Void)?
    let onError: ((_ error: String) -> Void)?
    
    let startTime = Date().timeIntervalSince1970*1000
    public var src = "https://learningtools.onenote.com/learningtoolsapp/cognitive/reader"
    var webView: WKWebView!
    var timer: Timer!
    var timeoutValue: TimeInterval!
    
    public init(tokenToPass: String, subdomainToPass: String, contentToPass: Content, optionsToPass: Options?, onSuccessImmersiveReader: @escaping () -> Void, onFailureImmersiveReader: @escaping (_ status: Error) -> Void, onTimeout: @escaping (_ timeoutValue: TimeInterval) -> Void, onError: @escaping (_ error: String) -> Void) {
        self.tokenToSend = tokenToPass
        self.subdomainToSend = subdomainToPass
        self.contentToSend = contentToPass
        self.optionsToSend = optionsToPass
        self.onSuccessImmersiveReader = onSuccessImmersiveReader
        self.onFailureImmersiveReader = onFailureImmersiveReader
        self.onTimeout = onTimeout
        self.onError = onError
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override public func viewDidLoad() {
        super.viewDidLoad()

        // If uiLang options are set update src to reflect this.
        switch optionsToSend?.uiLang {
        case .none: break
            // Leave src as is.
        case .some(let value):
            src = src + "?omkt=" + value
        }
        
        // Set timeout to default or value user specifies.
        switch optionsToSend?.timeout {
        case .none:
            // Default to 15 seconds.
            timeoutValue = 15
        case .some(let value):
            timeoutValue = value
        }
      
        view.backgroundColor = .white
        webView = WKWebView()
        
        let contentController = WKUserContentController()
        if #available(iOS 11.0, *) {
            webView = ImmersiveReaderWebView(frame: .zero, contentController: contentController)
        } else {
            // Fallback on earlier versions
            webView = WKWebView()
            let config = WKWebViewConfiguration()
            config.userContentController = contentController
            webView = WKWebView(frame: .zero, configuration: config)
        }
        webView.navigationDelegate = self
        webView.uiDelegate = self

        contentController.add(self, name: "readyForContent")
        contentController.add(self, name: "launchSuccessful")
        contentController.add(self, name: "tokenExpired")
        contentController.add(self, name: "throttled")
        
        view.addSubview(webView)
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

        // Create framework bundle.
        let frameworkBundle = Bundle(for: ImmersiveReaderViewController.self)
        
        guard let bundleURL = frameworkBundle.resourceURL?.appendingPathComponent("immersive-reader-sdk.bundle") else {
            onError!("Could not create bundle.")
            return
        }
        let resourceBundle = Bundle(url: bundleURL)
        // Get path to java script file.
        guard let scriptPath = resourceBundle?.path(forResource: "iFrameMessaging", ofType: "js") else {
            onError!("Could not create script path from resource.")
            return
        }
        do {
            let scriptSource = try String(contentsOfFile: scriptPath)
            let userScript = WKUserScript(source: scriptSource, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            contentController.addUserScript(userScript)
        } catch {
            onError!("Could not parse JavaScript file.")
            return
        }
        
        // Start the timer.
        timer = Timer.scheduledTimer(timeInterval: timeoutValue, target: self, selector: #selector(self.timedOut), userInfo: nil, repeats: false)
        
        // Load the iframe from HTML.
        webView.loadHTMLString("<!DOCTYPE html><html style='width: 100%; height: 100%; margin: 0; padding: 0;'><head><meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'></head><body style='width: 100%; height: 100%; margin: 0; padding: 0;'><iframe id='immersiveReaderIframe' src = '\(src)' width='100%' height='100%' style='border: 0'></iframe></body></html>", baseURL: URL(string: "test://learningtools.onenote.com/learningtoolsapp/cognitive/reader"))

    }

    @objc func timedOut(_ timer: AnyObject) {
        onTimeout!(timeoutValue)
    }
    
    public func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        decisionHandler(.allow)
    }
    
    public func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void ) {
        decisionHandler(.allow)
    }

}

extension ImmersiveReaderViewController: WKScriptMessageHandler {
    
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "readyForContent" {
            // Stop the timer.
            timer.invalidate()
            
            // Create the message variable
            let message = Message(cogSvcsAccessToken: tokenToSend, cogSvcsSubdomain: subdomainToSend, resourceName: nil, request: contentToSend, launchToPostMessageSentDurationInMs: Int(Date().timeIntervalSince1970*1000 - startTime))
            do {
                let jsonData = try JSONEncoder().encode(message)
                let jsonString = String(data: jsonData, encoding: .utf8)
                self.webView.evaluateJavaScript("sendContentToReader(\(jsonString!))") { (result, error) in
                    if error != nil {
                        self.onError!("Error evaluating JavaScript \(String(describing: error))")
                    }
                }
            } catch { print(error)}
        }
        
        if message.name == "launchSuccessful" {
            onSuccessImmersiveReader!()
        }
        
        if message.name == "tokenExpired" {
            let tokenExpiredError = Error(code: "TokenExpired", message: "The access token supplied is expired.")
            onFailureImmersiveReader!(tokenExpiredError)
        }
        
        if message.name == "throttled" {
            let throttledError = Error(code: "Throttled", message: "You have exceeded the call rate limit.")
            onFailureImmersiveReader!(throttledError)
        }
        
    }
}
