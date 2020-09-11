// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import XCTest
@testable import quickstart_swift
import immersive_reader_sdk

class quickstart_swiftTests: XCTestCase {
    
    var navigationController: UINavigationController = UINavigationController(rootViewController: LaunchViewController())

    override func setUp() {
        
        var window: UIWindow?
        window = UIWindow(frame: UIScreen.main.bounds)
        if let window = window {
            window.rootViewController = navigationController
            window.makeKeyAndVisible()
        }
    
    }

    override func tearDown() {
        // Put teardown code here.
    }
    
    // Ensures onSuccess returns when all optional values are set to null.
    func testAllOptionalNull() {
        let expectation = self.expectation(description: #function)

        let testChunk = Chunk(content: "content", lang: nil, mimeType: nil)
        let testContent = Content(title: "title", chunks: [testChunk])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)

        getToken(onSuccess: { responseToken in
            DispatchQueue.main.async {
                launchImmersiveReader(navController: self.navigationController, token: responseToken, content: testContent, options: testOptions, onSuccess: {
                    expectation.fulfill()
                    
                }, onFailure: { error in
                    print("Test testAllOptionalNull failed with the following error: \(error)")
                    
                })
            }
        }, onFailure: { error in
            print("Token failed to be recieved.")
        })
        
        waitForExpectations(timeout: 15)
    }
    
    // Ensures onFailure returns with the Timeout error code when a very small timeout is set.
    func testTimeout() {
        let expectation = self.expectation(description: #function)
        
        let testChunk = Chunk(content: "content", lang: nil, mimeType: nil)
        let testContent = Content(title: "title", chunks: [testChunk])
        let testOptions = Options(uiLang: nil, timeout: 0.1, uiZIndex: nil)
        
        getToken(onSuccess: { responseToken in
            DispatchQueue.main.async {
                launchImmersiveReader(navController: self.navigationController, token: responseToken, content: testContent, options: testOptions, onSuccess: {
                    
                }, onFailure: { error in
                    print("Test testTimeout returned onFailure with the following error: \(error)")
                    if(error.code == "Timeout") {
                        expectation.fulfill()
                    }

                })
            }
        }, onFailure: { error in
            print("Token failed to be recieved.")
        })
        
        waitForExpectations(timeout: 15)
    }
    
    // Ensures onFailure returns with the TokenExpired error code when an expired token is passed in.
    func testExpiredToken() {
        let expiredToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6InU0T2ZORlBId0VCb3NIanRyYXVPYlY4NExuWSIsImtpZCI6InU0T2ZORlBId0VCb3NIanRyYXVPYlY4NExuWSJ9.eyJhdWQiOiJodHRwczovL2NvZ25pdGl2ZXNlcnZpY2VzLmF6dXJlLmNvbS8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNTY0MDk4NjU2LCJuYmYiOjE1NjQwOTg2NTYsImV4cCI6MTU2NDEwMjU1NiwiYWlvIjoiNDJGZ1lIaHRxcUZhRWhCWGY2RGdjVlgrbWFVYUFBPT0iLCJhcHBpZCI6IjZkZjM3ZTc1LWJlZGUtNDZkMS05YWEzLTY3OTMxZjdlNDRhMyIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0Ny8iLCJvaWQiOiIzYWU2NmYyZi0zYmYxLTQyOWMtODNlMS1jM2M3ZTIxMjViODYiLCJzdWIiOiIzYWU2NmYyZi0zYmYxLTQyOWMtODNlMS1jM2M3ZTIxMjViODYiLCJ0aWQiOiI3MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDciLCJ1dGkiOiJSWG9Cem5pSW5FZVNWZzBObW84QUFBIiwidmVyIjoiMS4wIn0.IpCUiYAND0J9X7UBnGfysVKhCeBaPbEElnkI-rSpX4oHr8CPETeWBLWeLEzQ0HntsEB6_1SZnkrB0wdED6ieKGA_EMgLJQSz3Tow1tChljbugyW27kdW7JrYsdXS8-cWmEEWbmjPJ8DIKXd4QwYfbCNYlTic1pC_o_H3NGbZCMaOy_sYnQnF-GEMqnsJFcUnmPCuPdQVcGRqSvBzkH89ppIS0gkypt90viWrKM6ghDPaq_X0bSMXpqsye2pwQ_wunX1WaPoRq_tyLbdChqiLbNJ4_x-cTm0aYGolduM7JNadfqLcXqxwEv4RICSVfvRZZj7LTe1bdMPeXLi8Hm7bUw"
        
        let expectation = self.expectation(description: #function)
        
        let testChunk = Chunk(content: "content", lang: nil, mimeType: nil)
        let testContent = Content(title: "title", chunks: [testChunk])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)
        
        launchImmersiveReader(navController: self.navigationController, token: expiredToken, content: testContent, options: testOptions, onSuccess: {
            
            }, onFailure: { error in
                print("Test testExpiredToken returned onFailure with the following error: \(error)")
                if(error.code == "TokenExpired") {
                        expectation.fulfill()
                }
                
            })
        
        waitForExpectations(timeout: 15)
    }
    
    // Ensures onSuccess returns when the content in the chunk sent is empty.
    func testChunkEmptyContent() {
        let expectation = self.expectation(description: #function)
        
        let testChunk = Chunk(content: "", lang: nil, mimeType: nil)
        let testContent = Content(title: "title", chunks: [testChunk])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)
        
        getToken(onSuccess: { responseToken in
            DispatchQueue.main.async {
                launchImmersiveReader(navController: self.navigationController, token: responseToken, content: testContent, options: testOptions, onSuccess: {
                      expectation.fulfill()
                    
                }, onFailure: { error in
                    print("Test testChunkEmptyContent returned onFailure with the following error: \(error)")

                })
            }
        }, onFailure: { error in
            print("Token failed to be recieved.")
        })
        
        waitForExpectations(timeout: 15)
    }
    
    // Ensures onFailure returns with the BadArgument error code when the chunk sent is empty.
    func testEmptyChunks() {
        let expectation = self.expectation(description: #function)
        
        let testContent = Content(title: "title", chunks: [])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)
        
        getToken(onSuccess: { responseToken in
            DispatchQueue.main.async {
                launchImmersiveReader(navController: self.navigationController, token: responseToken, content: testContent, options: testOptions, onSuccess: {
                    
                }, onFailure: { error in
                    print("Test testEmptyChunks returned onFailure with the following error: \(error)")
                    if (error.code == "BadArgument") {
                         expectation.fulfill()
                    }
                    
                })
            }
        }, onFailure: { error in
            print("Token failed to be recieved.")
        })
        
        waitForExpectations(timeout: 15)
    }
    
    // Ensures onSuccess returns when an invalid uiLang is set.
    func testInvalidUILang() {
        let expectation = self.expectation(description: #function)
        
        let testChunk = Chunk(content: "content", lang: nil, mimeType: nil)
        let testContent = Content(title: "title", chunks: [testChunk])
        let testOptions = Options(uiLang: "invalidLang", timeout: nil, uiZIndex: nil)
        
        getToken(onSuccess: { responseToken in
            DispatchQueue.main.async {
                launchImmersiveReader(navController: self.navigationController, token: responseToken, content: testContent, options: testOptions, onSuccess: {
                    expectation.fulfill()
                    
                }, onFailure: { error in
                    print("Test testInvalidUILang returned onFailure with the following error: \(error)")
                    
                })
            }
        }, onFailure: { error in
            print("Token failed to be recieved.")
        })
        
        waitForExpectations(timeout: 15)
    }
    
    // Ensures onSuccess returns when an invalid lang is set.
    func testInvalidLang() {
        let expectation = self.expectation(description: #function)
        
        let testChunk = Chunk(content: "content", lang: "invalidLang", mimeType: nil)
        let testContent = Content(title: "title", chunks: [testChunk])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)
        
        getToken(onSuccess: { responseToken in
            DispatchQueue.main.async {
                launchImmersiveReader(navController: self.navigationController, token: responseToken, content: testContent, options: testOptions, onSuccess: {
                    expectation.fulfill()
                    
                }, onFailure: { error in
                    print("Test testInvalidLang returned onFailure with the following error: \(error)")
                    
                })
            }
        }, onFailure: { error in
            print("Token failed to be recieved.")
        })
        
        waitForExpectations(timeout: 15)
    }
    
    // Ensures onSuccess returns when the math mime type is set on plain text.
    func testMathMimeOnPlainText() {
        let expectation = self.expectation(description: #function)
        
        let testChunk = Chunk(content: "content", lang: nil, mimeType: "application/mathml+xml")
        let testContent = Content(title: "title", chunks: [testChunk])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)
        
        getToken(onSuccess: { responseToken in
            DispatchQueue.main.async {
                launchImmersiveReader(navController: self.navigationController, token: responseToken, content: testContent, options: testOptions, onSuccess: {
                    expectation.fulfill()
                    
                }, onFailure: { error in
                    print("Test testMathMimeOnPlainText returned onFailure with the following error: \(error)")
                    
                })
            }
        }, onFailure: { error in
            print("Token failed to be recieved.")
        })
        
        waitForExpectations(timeout: 15)
    }
 
    // Ensures onSuccess returns when the plain mime type is set on math text.
    func testPlainMimeOnMathText() {
        let expectation = self.expectation(description: #function)
        
        let testChunk = Chunk(content: "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"> <mi>x</mi> <mo>+</mo> <mn>5</mn> <mo>=</mo> <mn>0</mn> </math>", lang: nil, mimeType: "text/plain")
        let testContent = Content(title: "title", chunks: [testChunk])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)
        
        getToken(onSuccess: { responseToken in
            DispatchQueue.main.async {
                launchImmersiveReader(navController: self.navigationController, token: responseToken, content: testContent, options: testOptions, onSuccess: {
                    expectation.fulfill()
                    
                }, onFailure: { error in
                    print("Test testPlainMimeOnMathText returned onFailure with the following error: \(error)")
                    
                })
            }
        }, onFailure: { error in
            print("Token failed to be recieved.")
        })
        
        waitForExpectations(timeout: 15)
    }
    
    // Ensures onSuccess returns when an invalid mime type is set.
    func testInvalidMimeType() {
        let expectation = self.expectation(description: #function)
        
        let testChunk = Chunk(content: "content", lang: nil, mimeType: "invalidMime")
        let testContent = Content(title: "title", chunks: [testChunk])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)
        
        getToken(onSuccess: { responseToken in
            DispatchQueue.main.async {
                launchImmersiveReader(navController: self.navigationController, token: responseToken, content: testContent, options: testOptions, onSuccess: {
                    expectation.fulfill()
                    
                }, onFailure: { error in
                    print("Test testInvalidMimeType returned onFailure with the following error: \(error)")
                    
                })
            }
        }, onFailure: { error in
            print("Token failed to be recieved.")
        })
        
        waitForExpectations(timeout: 15)
    }
    
    /// Retrieves the token for the Immersive Reader using Azure Active Directory authentication
    ///
    /// - Parameters:
    ///     -onSuccess: A closure that gets called when the token is successfully recieved using Azure Active Directory authentication.
    ///     -theToken: The token for the Immersive Reader recieved using Azure Active Directory authentication.
    ///     -onFailure: A closure that gets called when the token fails to be obtained from the Azure Active Directory Authentication.
    ///     -theError: The error that occured when the token fails to be obtained from the Azure Active Directory Authentication.
    func getToken(onSuccess: @escaping (_ theToken: String) -> Void, onFailure: @escaping ( _ theError: String) -> Void) {
        
        let tokenForm = "grant_type=client_credentials&resource=https://cognitiveservices.azure.com/&client_id=" + Constants.clientId + "&client_secret=" + Constants.clientSecret
        let tokenUrl = "https://login.windows.net/" + Constants.tenantId + "/oauth2/token"
        print("token url: \(tokenUrl)")
        
        var responseTokenString: String = "0"
        
        let url = URL(string: tokenUrl)!
        var request = URLRequest(url: url)
        request.httpBody = tokenForm.data(using: .utf8)
        request.httpMethod = "POST"
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data,
                let response = response as? HTTPURLResponse,
                // Check for networking errors.
                error == nil else {
                    print("error", error ?? "Unknown error")
                    onFailure("Error")
                    return
            }
            
            // Check for http errors.
            guard (200 ... 299) ~= response.statusCode else {
                print("statusCode should be 2xx, but is \(response.statusCode)")
                print("response = \(response)")
                onFailure(String(response.statusCode))
                return
            }
            
            let responseString = String(data: data, encoding: .utf8)
            print("responseString = \(String(describing: responseString!))")
            
            let jsonResponse = try? JSONSerialization.jsonObject(with: data, options: [])
            guard let jsonDictonary = jsonResponse as? [String: Any] else {
                onFailure("Error parsing JSON response.")
                return
            }
            guard let responseToken = jsonDictonary["access_token"] as? String else {
                onFailure("Error retrieving token from JSON response.")
                return
            }
            responseTokenString = responseToken
            onSuccess(responseTokenString)
        }
        
        task.resume()
    }

}
