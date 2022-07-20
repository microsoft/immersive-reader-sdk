# Immersive Reader - Swift iOS Sample

## Prerequisites

* [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
* An Immersive Reader resource configured for Azure Active Directory authentication. Follow [these instructions](https://docs.microsoft.com/azure/applied-ai-services/immersive-reader/how-to-create-immersive-reader) to get set up. You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.

## Usage

1. Open Xcode and open **immersive-reader-sdk/js/samples/ios/quickstart-swift/quickstart-swift.xcodeproj**.
1. In the top menu, click on **Product > Scheme > Edit Scheme...**
1. In the **Run** view, click on the **Arguments** tab.
1. In the **Environment Variables** section, add the following names and values, supplying the values given when you created your Immersive Reader resource.

      ```text
      TENANT_ID=<YOUR_TENANT_ID>
      CLIENT_ID=<YOUR_CLIENT_ID>
      CLIENT_SECRET<YOUR_CLIENT_SECRET>
      SUBDOMAIN=<YOUR_SUBDOMAIN>
      ```

1. This sample utilizes two different approaches for obtaining the access token that is needed to launch the Reader -1) from within the sample app itself, and 2) from the app backend.

    Requesting tokens from the backend is the recommended way to go, since it keeps secrets out of the client app.

    This sample shows both approaches, but you will have to toggle between them.

    If you want to have the sample get the token from the backend, Cd into the **server** folder and then [refer to public node server sample here](https://github.com/microsoft/immersive-reader-sdk/tree/dev/js/samples/quickstart-nodejs).

    Please note, **this server is running on port 3001** and you must have the **Token from server** option checked in UI.

1. In Xcode, press **Ctrl-R** to run the project.

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
