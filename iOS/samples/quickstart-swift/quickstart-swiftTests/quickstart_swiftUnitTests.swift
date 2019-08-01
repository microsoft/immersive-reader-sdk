import XCTest
@testable import quickstart_swift
import immersive_reader_sdk

class quickstart_swiftUnitTests: XCTestCase {
    
     var navigationController: UINavigationController = UINavigationController(rootViewController: LaunchViewController())

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
        var window: UIWindow?
        window = UIWindow(frame: UIScreen.main.bounds)
        if let window = window {
            window.rootViewController = navigationController
            window.makeKeyAndVisible()
        }
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }
    
    // Ensures onFailure returns with the BadArgument error code when the chunk sent is empty.
    func testEmptyChunks() {
        let expectation = self.expectation(description: #function)
        
        let testContent = Content(title: "emptychunks", chunks: [])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)
        let sampleToken = "SampleToken"
        let sampleSubdomain = "SampleSubdomain"
    
        launchImmersiveReader(navController: self.navigationController, token: sampleToken, subdomain: sampleSubdomain, content: testContent, options: testOptions, onSuccess: {
                XCTAssert(false)
        }, onFailure: { error in
            print("Test testEmptyChunks returned onFailure with the following error: \(error)")
            if (error.code == "BadArgument") {
                expectation.fulfill()
            }
                    
        })
        
        waitForExpectations(timeout: 15)
    }
    
    // Test the expired token callback.
    func testExpiredToken() {
        let expectation = self.expectation(description: #function)
        
        let testContent = Content(title: "title", chunks: [])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)
        let sampleToken = "ExpiredToken"
        let sampleSubdomain = "SampleSubdomain"
        
        //Call the view controller
        let immersiveReaderViewController = ImmersiveReaderViewController(tokenToPass: sampleToken, subdomainToPass: sampleSubdomain, contentToPass: testContent, optionsToPass: testOptions, onSuccessImmersiveReader: {
            XCTAssert(false)
            
        }, onFailureImmersiveReader: { error in
            if (error.code == "TokenExpired") {
                expectation.fulfill()
            } else {
                XCTAssert(false)
            }
            
        }, onTimeout: { timeout in
            XCTAssert(false)
            
        }, onError: { error in
            XCTAssert(false)
            
        })

        immersiveReaderViewController.src = "test://learningtools.onenote.com/learningtoolsapp/cognitive/reader"
        navigationController.pushViewController(immersiveReaderViewController, animated: true)
        
        waitForExpectations(timeout: 15)
    }
    
    // Tests the throttled call back.
    func testThrottled() {
        let expectation = self.expectation(description: #function)
        
        let testContent = Content(title: "throttled", chunks: [])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)
        let sampleToken = "SampleToken"
        let sampleSubdomain = "SampleSubdomain"

        //Call the view controller
        let immersiveReaderViewController = ImmersiveReaderViewController(tokenToPass: sampleToken, subdomainToPass: sampleSubdomain, contentToPass: testContent, optionsToPass: testOptions, onSuccessImmersiveReader: {
            XCTAssert(false)
            
        }, onFailureImmersiveReader: { error in
            if(error.code == "Throttled") {
                expectation.fulfill()
            }
            
        }, onTimeout: { timeout in
            XCTAssert(false)

        }, onError: { error in
            XCTAssert(false)
            
        })
        
        immersiveReaderViewController.src = "test://learningtools.onenote.com/learningtoolsapp/cognitive/reader"
        navigationController.pushViewController(immersiveReaderViewController, animated: true)
        
        waitForExpectations(timeout: 15)
        
    }
    
    // Tests the timeout call back.
    func testTimeout() {
        let expectation = self.expectation(description: #function)
        
        let testContent = Content(title: "timeout", chunks: [])
        let testOptions = Options(uiLang: nil, timeout: 0.1, uiZIndex: nil)
        let sampleToken = "SampleToken"
        let sampleSubdomain = "SampleSubdomain"
        
        //Call the view controller
        let immersiveReaderViewController = ImmersiveReaderViewController(tokenToPass: sampleToken, subdomainToPass: sampleSubdomain, contentToPass: testContent, optionsToPass: testOptions, onSuccessImmersiveReader: {
            XCTAssert(false)
            
        }, onFailureImmersiveReader: { error in
           XCTAssert(false)
            
        }, onTimeout: { timeout in
             expectation.fulfill()
            
        }, onError: { error in
            XCTAssert(false)
            
        })
        
        immersiveReaderViewController.src = "test://learningtools.onenote.com/learningtoolsapp/cognitive/reader"
        navigationController.pushViewController(immersiveReaderViewController, animated: true)
        
        waitForExpectations(timeout: 15)
        
    }
    
    // Tests the onSuccess call back.
    func testOnSuccess() {
        let expectation = self.expectation(description: #function)
        
        let testContent = Content(title: "title", chunks: [])
        let testOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil)
        let sampleToken = "SampleToken"
        let sampleSubdomain = "SampleSubdomain"
        
        //Call the view controller
        let immersiveReaderViewController = ImmersiveReaderViewController(tokenToPass: sampleToken, subdomainToPass: sampleSubdomain, contentToPass: testContent, optionsToPass: testOptions, onSuccessImmersiveReader: {
            expectation.fulfill()
            
        }, onFailureImmersiveReader: { error in
            XCTAssert(false)
            
        }, onTimeout: { timeout in
            XCTAssert(false)
            
        }, onError: { error in
            XCTAssert(false)
            
        })
        
        immersiveReaderViewController.src = "test://learningtools.onenote.com/learningtoolsapp/cognitive/reader"
        navigationController.pushViewController(immersiveReaderViewController, animated: true)
        
        waitForExpectations(timeout: 15)
        
    }
}
