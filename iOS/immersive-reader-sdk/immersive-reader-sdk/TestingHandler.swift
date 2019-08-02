// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import Foundation
import WebKit

@available(iOS 11.0, *)
class testingHandler: NSObject, WKURLSchemeHandler {
    
    // A WKURLSchemeHandler to handle urls for testing to allow for a local file iframe src.
    // If the URL scheme is "test", the request will be handled by this function.
    // This redirects the URL to a local html file.
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        
        let frameworkBundle = Bundle(for: ImmersiveReaderViewController.self)
        if let bundleURL = frameworkBundle.resourceURL?.appendingPathComponent("immersive-reader-sdk.bundle") {
            let resourceBundle = Bundle(url: bundleURL)
            if let webpageURL = resourceBundle!.url(forResource: "TestPage", withExtension: "html") {
                
                // Create a URLResponse.
                let urlResponse = URLResponse(url: URL(string: "test://learningtools.onenote.com/learningtoolsapp/cognitive/reader")!, mimeType: nil, expectedContentLength: -1, textEncodingName: nil)
                
                // Forward the response to the task.
                urlSchemeTask.didReceive(urlResponse)
                
                let htmlString = try? String(contentsOf: webpageURL)
                
                urlSchemeTask.didReceive((htmlString?.data(using: String.Encoding.utf8, allowLossyConversion: false))!)
            }
        }
        
        urlSchemeTask.didFinish()
        
    }
    
    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        
    }
}

@available(iOS 11.0, *)
public class ImmersiveReaderWebView: WKWebView {
    
    init(frame: CGRect, contentController: WKUserContentController) {
        let conf = WKWebViewConfiguration()
        // If the URL scheme is "test" the request will be handled by the WKURLSchemeHandler, testingHandler().
        conf.setURLSchemeHandler(testingHandler(), forURLScheme: "test")
        conf.userContentController = contentController
        super.init(frame: frame, configuration: conf)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
