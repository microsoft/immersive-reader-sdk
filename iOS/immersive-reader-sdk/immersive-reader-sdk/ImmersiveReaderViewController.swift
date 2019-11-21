// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import UIKit
import WebKit

public class ImmersiveReaderViewController: UIViewController {
    
    private let accessToken: String
    private let subdomain: String
    private let content: Content
    private let completionHandler: ((_ error: Error?) -> Void)?
    private let startTime: TimeInterval

    private var src = "https://learningtools.onenote.com/learningtoolsapp/cognitive/reader"
    private var webView: WKWebView!
    private var timer: Timer!
    private var timeoutValue: TimeInterval = 15
    
    public init?(accessToken: String, subdomain: String, content: Content, options: Options?, completionHandler: @escaping (_ error: Error?) -> Void) {

        if (content.chunks.count == 0) {
            let badArgumentError = Error(code: "BadArgument", message: "Chunks must not be empty.")
            completionHandler(badArgumentError)
            return nil
        }

        self.accessToken = accessToken
        self.subdomain = subdomain
        self.content = content
        self.completionHandler = completionHandler
        self.startTime = Date().timeIntervalSince1970*1000

        // If uiLang options are set update src to reflect this.
        switch options?.uiLang {
        case .none: break
            // Leave src as is.
        case .some(let value):
            src = src + "?omkt=" + value
        }

        // Set timeout to default or value user specifies.
        switch options?.timeout {
        case .none: break
            // Default to 15 seconds.
        case .some(let value):
            timeoutValue = value
        }

        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override public func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white

        webView = createAndConfigureWebView()
        view.addSubview(webView)
        addConstrainstsToWebView()
        injectJavaScript(webView: webView)

        // Start the timer.
        timer = Timer.scheduledTimer(timeInterval: timeoutValue, target: self, selector: #selector(self.timedOut), userInfo: nil, repeats: false)
        
        // Load the iframe from HTML.
        webView.loadHTMLString("<!DOCTYPE html><html style='width: 100%; height: 100%; margin: 0; padding: 0;'><head><meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'></head><body style='width: 100%; height: 100%; margin: 0; padding: 0;'><iframe id='immersiveReaderIframe' src = '\(src)' width='100%' height='100%' style='border: 0'></iframe></body></html>", baseURL: URL(string: "test://learningtools.onenote.com/learningtoolsapp/cognitive/reader"))
    }

    private func createAndConfigureWebView() -> WKWebView {
        let contentController = WKUserContentController()
        let configuration = WKWebViewConfiguration()
        if #available(iOS 11.0, *) {
            configuration.setURLSchemeHandler(testingHandler(), forURLScheme: "test")
        }
        configuration.userContentController = contentController

        contentController.add(self, name: "readyForContent")
        contentController.add(self, name: "launchSuccessful")
        contentController.add(self, name: "tokenExpired")
        contentController.add(self, name: "throttled")

        return WKWebView(frame: .zero, configuration: configuration)
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

    private func injectJavaScript(webView: WKWebView) {
        // Create framework bundle.
        let frameworkBundle = Bundle(for: ImmersiveReaderViewController.self)

        guard let bundleURL = frameworkBundle.resourceURL?.appendingPathComponent("immersive-reader-sdk.bundle") else {
            completionHandler?(Error(code: "Internal Error", message: "Could not create bundle."))
            return
        }
        let resourceBundle = Bundle(url: bundleURL)
        // Get path to java script file.
        guard let scriptPath = resourceBundle?.path(forResource: "iFrameMessaging", ofType: "js") else {
            completionHandler?(Error(code: "Internal Error", message: "Could not create script path from resource."))
            return
        }
        do {
            let scriptSource = try String(contentsOfFile: scriptPath)
            let userScript = WKUserScript(source: scriptSource, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            webView.configuration.userContentController.addUserScript(userScript)
        } catch {
            completionHandler?(Error(code: "Internal Error", message: "Could not parse JavaScript file."))
            return
        }
    }

    @objc func timedOut(_ timer: AnyObject) {
        let timeoutError = Error(code: "Timeout", message: "Page failed to load after timeout \(String(describing: timeoutValue)) ms.")
        completionHandler?(timeoutError)
    }
}

extension ImmersiveReaderViewController: WKScriptMessageHandler {
    
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "readyForContent" {
            // Stop the timer.
            timer.invalidate()
            
            // Create the message variable
            let message = Message(cogSvcsAccessToken: accessToken, cogSvcsSubdomain: subdomain, resourceName: nil, request: content, launchToPostMessageSentDurationInMs: Int(Date().timeIntervalSince1970*1000 - startTime))
            do {
                let jsonData = try JSONEncoder().encode(message)
                let jsonString = String(data: jsonData, encoding: .utf8)
                self.webView.evaluateJavaScript("sendContentToReader(\(jsonString!))") { (result, error) in
                    if error != nil {
                        self.completionHandler?(Error(code: "Internal Error", message: "Could not parse JavaScript file."))
                    }
                }
            } catch {
                // Logs error to console.
                print("Immersive Reader failed to load with error: \(error)")

                // Displays error alert message in the UI
                let alert = UIAlertController(title: "Immersive Reader failed to load", message: error.localizedDescription, preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: "OK", style: .cancel, handler: nil))
                self.present(alert, animated: true)
            }
        }
        
        if message.name == "launchSuccessful" {
            completionHandler?(nil)
        }
        
        if message.name == "tokenExpired" {
            let tokenExpiredError = Error(code: "TokenExpired", message: "The access token supplied is expired.")
            completionHandler?(tokenExpiredError)
        }
        
        if message.name == "throttled" {
            let throttledError = Error(code: "Throttled", message: "You have exceeded the call rate limit.")
            completionHandler?(throttledError)
        }
        
    }
}
