# Immersive Reader - Android Kotlin Sample

## Prerequisites

* An Immersive Reader resource configured for Azure Active Directory authentication. Follow [these instructions](https://docs.microsoft.com/azure/applied-ai-services/immersive-reader/how-to-create-immersive-reader) to get set up. You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.
* [Android Studio](https://developer.android.com/studio)

## Usage

1. Launch Android Studio and open the project from the **immersive-reader-sdk/js/samples/quickstart-kotlin** directory.

1. Cd into the server folder and then [refer to public node server sample here](https://github.com/microsoft/immersive-reader-sdk/tree/dev/js/samples/quickstart-nodejs) in case you want to have the Kotlin sample getting the token from the back end code.

    Please note, **this server is running on port 3001** and you must have the **Token from server** option checked in UI.
    Add **TOKEN_SERVER_URL** value only in **env** file as follows:

    ```text
    TOKEN_SERVER_URL=http://10.0.2.2:3001/GetTokenAndSubdomain
    ```

    **10.0.2.2** is the IP that Android emulator recognizes as server from your local machine.

1. Otherwise create a file named **env** to the **/assets** folder and add the following, supplying values as appropriate. Be sure not to commit this file into source control, as it contains secrets that should not be made public.

    ```text
    TENANT_ID=<YOUR_TENANT_ID>
    CLIENT_ID=<YOUR_CLIENT_ID>
    CLIENT_SECRET=<YOUR_CLIENT_SECRET>
    SUBDOMAIN=<YOUR_SUBDOMAIN>
    ```

1. Choose a device emulator from the AVD Manager and run the project.

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
