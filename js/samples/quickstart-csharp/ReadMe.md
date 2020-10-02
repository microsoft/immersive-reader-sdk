# Immersive Reader - C# Sample

## Prerequisites

* An Immersive Reader resource configured for Azure Active Directory authentication. Follow [these instructions](https://docs.microsoft.com/azure/cognitive-services/immersive-reader/how-to-create-immersive-reader) to get set up. You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.
* [Visual Studio 2019](https://visualstudio.microsoft.com/downloads)

## Usage

1. Open **QuickstartSampleWebApp.sln** in Visual Studio.

1. Right-click on the project in the Solution Explorer and choose **Manage User Secrets**. This will open a file called **secrets.json**. Replace the contents of that file with the following, supplying your values as appropriate:

    ```json
    {
      "TenantId": "<YOUR_TENANT_ID>",
      "ClientId": "<YOUR_CLIENT_ID>",
      "ClientSecret": "<YOUR_CLIENT_SECRET>",
      "Subdomain": "<YOUR_SUBDOMAIN>"
    }
    ```

1. Run **Debug > Start Debugging**.

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
