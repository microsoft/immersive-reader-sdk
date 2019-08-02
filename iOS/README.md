# Cognitive Services - Immersive Reader iOS SDK

The Immersive Reader iOS SDK is a Swift CocoaPod that allows you to easily and quickly integrate the [Immersive Reader](https://azure.microsoft.com/services/cognitive-services/immersive-reader/) into your iOS application.

## Usage

Usage of this SDK requires an Azure subscription to Immersive Reader. Follow [these instructions](https://docs.microsoft.com/azure/cognitive-services/immersive-reader/azure-active-directory-authentication) to create an Immersive Reader resource with a custom subdomain and configure Azure Active Directory (Azure AD) authentication in your Azure tenant.

Once you have completed the Azure AD authentication configuration, you will have a subdomain and will be able to create an Azure AD authentication token. Both the subdomain and a token are required when calling the SDK to launch the Immersive Reader.

You can find examples of how to acquire an Azure AD token in the [samples](./samples).

### Installation on OSX

Note: OSX is required for iOS development.

Using [Git](https://git-scm.com/), Launch Terminal and run `git clone https://github.com/Microsoft/immersive-reader-sdk` to a preferred folder then:

1.    Download Xcode from the Mac App Store.
2.    Open terminal and enter the following command: `sudo gem install cocoapods` and enter your password when prompted. 
3.    Enter the following command in the terminal for setup: `pod setup –verbose` This may take a few minutes.

#### Usage

1.    Open Xcode and create a new project and choose **Single View App**.
2.    In the terminal, navigate to the directory that contains the Xcode project created in the previous step, and enter the following command to create a Podfile for the project: `pod init`.
3.    Open the Podfile created in step 2 in either Xcode or your preferred editor, and uncomment the line that stays 'platform :ios, '9.0'' by removing the #. Add the following two lines after the 'use_frameworks!' line: 
```ruby
# Pods for project
pod 'immersive-reader-sdk', :path => 'https://github.com/microsoft/immersive-reader-sdk/iOS/immersive-reader-sdk.git'
``` 
4.    In the terminal, in the same directory as the sample project created earlier type the following command: `pod install`. Close the Xcode project and reopen it using **ProjectName.xcworkspace** that was created in the project’s folder.
5.    Add ‘import immersive_reader_sdk’ at the top of any file to be able to access the iOS SDK from that file.
6.    Invoke the Immersive Reader when the button is clicked: 
```swift
let sampleContent = Content(title: "Immersive Reader", chunks: [Chunk(content: "Hello World!", lang: nil, mimeType: nil)])
launchImmersiveReader(navController: self.navigationController!, token: YOUR_TOKEN, subdomain: YOUR_SUBDOMAIN, content: sampleContent, options: nil, onSuccess: {

}, onFailure: { error in

})
```
7.    In Xcode press Ctrl + R to run the project.



Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
