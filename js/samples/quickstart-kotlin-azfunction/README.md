# Immersive Reader - Quickstart Android Kotlin calling Azure Function

This code sample shows how to get Azure AD token from an Azure function.

## Prerequisites

* A function already created and deployed into Azure, see this [Azure function code sample](https://github.com/microsoft/immersive-reader-sdk/tree/master/js/samples/azure-function-csharp).

    You must have the Azure function code sample setup and running to get the `<YOUR_FUNCTION_LOCAL>` value to be used in the next section.

    Follow the steps in the sample and run the function either pressing **F5** or with the command below:

    > func host start

    You must deploy the function to Azure first to get the `<YOUR_FUNCTION_URL>` value.

* [Android Studio](https://developer.android.com/studio)

## Usage

1. Launch Android Studio and open the project from the **immersive-reader-sdk/js/samples/quickstart-kotlin-azfunction** directory.

2. Create a file named **env** to the **/assets** folder and add the following, supplying values according to **Prerequisites** section. Be sure not to commit this file into source control, as it contains secrets that should not be made public.

    ```text
    FUNCTION_URL=<YOUR_FUNCTION_URL>
    FUNCTION_API_KEY=<YOUR_FUNCTION_APIKEY>
    FUNCTION_URL_LOCAL=<YOUR_FUNCTION_LOCAL>
    ```

3. Choose a device emulator from the AVD Manager and run the project.

## Disclaimer

This approach is for development purposes only and is not how this should be used in Production.

That Production auth is beyond the scope of this sample.

## See also

* [Function Access Keys](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger?tabs=csharp#authorization-keys)

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
