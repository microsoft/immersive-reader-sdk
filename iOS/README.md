# Cognitive Services - Immersive Reader iOS SDK

The Immersive Reader iOS SDK is a Swift CocoaPod that allows you to easily and quickly integrate the [Immersive Reader](https://azure.microsoft.com/services/cognitive-services/immersive-reader/) into your iOS application.

### Installation on OSX

Using [Git](https://git-scm.com/), Launch Terminal and run `git clone https://github.com/Microsoft/immersive-reader-sdk` to a preferred folder then:

1. Download Xcode from the Mac App Store.
2. Open terminal and enter the following command: `sudo gem install cocoapods` and enter your password when prompted. 
3. Enter the follow command in the terminal for setup: `pod setup –verbose` this may take a few minutes.

#### Usage

Microsoft 1st Party Office applications should use the `v0.0.3` Immersive Reader JavaScript SDK and the `v0.0.1` SDK's authentication token retrieved by providing a `SubscriptionKey` and `Region`. This will ensure the Immersive Reader uses Office compliant APIs deployed to OSI.

Here are the steps:

1. Create a Microsoft Internal billable App Service Subscription via the AIRS portal: https://aka.ms/airs and be sure to add more than one owner.
1. Once you have access to the Subscription created via AIRS in the Azure portal https://portal.azure.com - use it to create the Immersive Reader Resource.
1. From the Subscription go to Resources and click the `Add` button.
1. Search for "Immersive Reader" and click the `Create` button.
1. Provide the project details, ensuring one of the following regions is selected: `eastus`, `westus`, `northeurope`, `westeurope`, `centralindia`, `japaneast`, `australiaeast` (the Learning tools Service on OSI only supports these regions) and click next.
1. (optional) Add any tags and click next.
1. Review the terms and click the `Create` button (it’ll take a moment to deploy).
1. Once deployed, click the `Go to resource` button.
1. Click on the `Keys and Endpoint` button in the side menu.
1. These are your secrets. `KEY 1` is the `SubscriptionKey`, `LOCATION` is the `Region`.
1. Open Xcode and create a new project and choose **Single View App**.
1. In the terminal, navigate to the directory that contains the Xcode project created in the previous step, and enter the following command to create a Podfile for the project: `pod init`.
1. Open the Podfile created in step 2 in either Xcode or your preferred editor, and uncomment the line that stays 'platform :ios, '9.0'' by removing the #. Add the following two lines after the 'use_frameworks!' line: 
```ruby
# Pods for project
pod 'immersive-reader-sdk', :path => 'https://github.com/microsoft/immersive-reader-sdk/iOS/immersive-reader-sdk.git'
``` 
1. In the terminal, in the same directory as the sample project created earlier type the following command: `pod install`. Close the Xcode project and reopen it using **ProjectName.xcworkspace** that was created in the project’s folder.
1. Add ‘import immersive_reader_sdk’ at the top of any file to be able to access the iOS SDK from that file.
1. Invoke the Immersive Reader when the button is clicked: 
```swift
let sampleContent = Content(title: "Immersive Reader", chunks: [Chunk(content: "Hello World!", lang: nil, mimeType: nil)])
launchImmersiveReader(navController: self.navigationController!, token: YOUR_TOKEN, nil, content: sampleContent, options: nil, onSuccess: {

}, onFailure: { error in

})
```
> [!IMPORTANT]
> **Be sure not to commit your secrets into source control, as secrets should not be made public**.

17. In Xcode press Ctrl + R to run the project.


Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
