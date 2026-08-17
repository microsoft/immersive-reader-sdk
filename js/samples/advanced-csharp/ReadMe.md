# Immersive Reader - Advanced Sample

## Overview

This sample demonstrates more of the functionality provided by the Immersive Reader, such as rendering math content, rendering content that contains multiple languages, setting the language of the Immersive Reader UI, and rendering Microsoft Word documents.

This sample also demonstrates how to use a canary to improve security in your web app. A canary is a short-lived, server-generated token, which is generated during an authenticated call to the server. Later, when the user invokes the Immersive Reader, the canary is used to authenticate the call to the server. This mechanism improves security because it adds authentication to the call to launch the Immersive Reader.

## Security

The pages served by `HomeController` embed a real Azure AD bearer token, minted from this sample's confidential service-principal credentials (`ClientId` / `ClientSecret` from **secrets.json**) by `GetTokenAsync()`. Anyone who can reach those pages obtains a usable Cognitive Services token. The canary described above authenticates the call that *launches* the Immersive Reader, but it does not by itself authenticate the users who can reach the app.

* This sample is intended for **local development only**.
* **Do not** expose it on a public interface or deploy it as-is without first adding authentication.
* For any non-local or production use, gate the token-bearing actions with a real authentication mechanism, such as the `[Authorize]` attribute backed by ASP.NET Core authentication, a session check, or an authenticating API gateway in front of the app.

## Prerequisites

* An Immersive Reader resource configured for Azure Active Directory authentication. Follow [these instructions](https://docs.microsoft.com/azure/applied-ai-services/immersive-reader/how-to-create-immersive-reader) to get set up. You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.
* [Visual Studio 2022](https://visualstudio.microsoft.com/downloads)

## Usage

1. Open __AdvancedSampleWebApp.sln__ in Visual Studio.

1. Right-click on the project in the Solution Explorer and choose __Manage User Secrets__. This will open a file called `secrets.json`. Replace the contents of that file with the following, supplying your values as appropriate:

    ```json
    {
      "TenantId": YOUR_TENANT_ID,
      "ClientId": YOUR_CLIENT_ID,
      "ClientSecret": YOUR_CLIENT_SECRET,
      "Subdomain": YOUR_SUBDOMAIN
    }
    ```

> [!IMPORTANT]
> **Be sure not to commit any references that contain secrets into source control, as secrets should not be made public**.
1. Run **Debug > Start Debugging**.

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
