// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import XCTest

class quickstart_swiftUITests: XCTestCase {
    
    var app: XCUIApplication!

    override func setUp() {

        // Stop immediately when a failure occurs.
        continueAfterFailure = false

        app = XCUIApplication()
        app.launch()

    }

    override func tearDown() {

    }
    
    // Tests if the Immersive Reader Launch button is working.
    func testLaunchButton() {
        
        app.buttons["Immersive Reader"].tap()
    
        // Ensure the Immersive Reader launched.
        XCTAssert(immeriveReaderLaunchHelper())
    }
    
    // Tests if the exit button to exit the Immerive Reader is working.
    func testExitButton() {
        
        let immersiveReaderButton = app.buttons["Immersive Reader"]
        immersiveReaderButton.tap()
        
        let webViewsQuery = app.webViews
        // Ensure Immersive Reader launched.
        if(!immeriveReaderLaunchHelper()) {
            XCTAssert(false)
        }
        
        // Ensure the Immersive Reader launch button does not exist.
        if (immersiveReaderButton.exists) {
            XCTAssert(false)
        }
        
        app.navigationBars["immersive_reader_sdk.ImmersiveReaderView"].buttons["Back"].tap()
    
        // Ensure Immersive Reader is no longer open.
        if (webViewsQuery.buttons["Text Preferences"].exists) {
            XCTAssert(false)
        }
        
        // Ensure the Immersive Reader launch button is available.
        XCTAssert(app.buttons["Immersive Reader"].isHittable)
    }
    
    // Tests that the Immersive Reader is filling the full screen width.
    func testWebViewFullScreen() {

        let appWidth = app.frame.size.width
        
        app.buttons["Immersive Reader"].tap()
        let webViewsQueryWidth = app.webViews.element.frame.size.width
        
        // Ensure the WebView's width is equal to the application's width.
        XCTAssert(Int(appWidth) == Int(webViewsQueryWidth))
    }
    
    // Tests launching the Immersive Reader, then exiting, and then relaunching the Immersive Reader.
    func testReopenImmersiveReader() {
        
        let immersiveReaderButton = app.buttons["Immersive Reader"]
        
        // Launch the Immersive Reader.
        immersiveReaderButton.tap()
        
        // Ensure the Immersive Reader launched.
        if (!immeriveReaderLaunchHelper()) {
            XCTAssert(false)
        }
        
        // Exit the Immersive Reader.
        app.navigationBars["immersive_reader_sdk.ImmersiveReaderView"].buttons["Back"].tap()
        
        // Ensure the Immersive Reader exited.
        if (!immersiveReaderButton.exists) {
            XCTAssert(false)
        }
        // Relaunch the Immersive Reader.
        immersiveReaderButton.tap()
        
        // Ensure the Immersive Reader relaunched.
        XCTAssert(immeriveReaderLaunchHelper())
    }
    
    // A helper function which ensures the Immersive Reader lauched successfully.
    func immeriveReaderLaunchHelper() -> Bool {
        let webViewsQuery = app.webViews
        return (webViewsQuery.buttons["Text Preferences"].isHittable && webViewsQuery.buttons["Grammar Options"].isHittable && webViewsQuery.buttons["Reading Preferences"].isHittable && app.webViews.otherElements["The"].staticTexts["The"].exists && app.webViews.staticTexts["often"].exists)
    }
    
}
