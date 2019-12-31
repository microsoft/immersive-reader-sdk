# Immersive Reader - Swift iOS Sample

## Follow these steps to get the sample up and running

### Create an Immersive Reader resource and configure Azure Active Directory (Azure AD) authentication

1. Follow the instructions at https://docs.microsoft.com/azure/cognitive-services/immersive-reader/azure-active-directory-authentication to create an Immersive Reader resource with a custom subdomain and configure Azure Active Directory (Azure AD) authentication in your Azure tenant.  
You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.

### Installation on OSX

Note: OSX is required for iOS development.

1.    Using [Git](https://git-scm.com/), Launch Terminal and run `git clone https://github.com/Microsoft/immersive-reader-sdk` to a preferred folder then:
2.    Download Xcode from the App Store.

#### Usage

1.    Open Xcode and open **immersive-reader-sdk/js/samples/ios/quickstart-swift/quickstart-swift.xcodeproj**.
2.    Supply your custom property values from installation step one. These secrets should only exist on your machine as part of Xcode project scheme for testing purposes only. Be sure never to commit secrets into source control as they should not be made public. In Xcode from the top menu click on Product --> Scheme --> Edit Scheme...
      *    In the **Run** view click on **Arguments**.
      *    In the **Environment Variables** section, add the following names and values:
      ```Environment Variables
      TENANT_ID=<YOUR_TENANT_ID>
      CLIENT_ID=<YOUR_CLIENT_ID>
      CLIENT_SECRET<YOUR_CLIENT_SECRET>
      SUBDOMAIN=<YOUR_SUBDOMAIN>
      ```
4.    In Xcode press Ctrl + R to run the project.


Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
