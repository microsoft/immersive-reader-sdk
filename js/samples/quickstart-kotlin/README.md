# Immersive Reader - Android Kotlin Sample

## Prerequisites

* An Immersive Reader resource configured for Azure Active Directory authentication. Follow [these instructions](https://docs.microsoft.com/azure/cognitive-services/immersive-reader/how-to-create-immersive-reader) to get set up. You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.
* [Android Studio](https://developer.android.com/studio)

## Usage

1. Launch Android Studio and open the project from the **immersive-reader-sdk/js/samples/quickstart-kotlin** directory.

1. Create a file named **env** to the **/assets** folder and add the following, supplying values as appropriate. Be sure not to commit this file into source control, as it contains secrets that should not be made public.

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
