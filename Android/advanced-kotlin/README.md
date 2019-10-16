# Immersive Reader - Kotlin Sample

### Installation on Windows

1. Using [Git](https://git-scm.com/), Launch Terminal and run `git clone https://github.com/Microsoft/immersive-reader-sdk` to a preferred folder then:
2. Download and install [Android Studio](https://developer.android.com/studio).

#### Usage

1. Follow the instructions at https://docs.microsoft.com/azure/cognitive-services/immersive-reader/azure-active-directory-authentication to create an Immersive Reader resource with a custom subdomain and configure Azure Active Directory (Azure AD) authentication in your Azure tenant. You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.
2. Launch Android Studio and open the project from the \immersive-reader-sdk\Android\advanced-kotlin\ directory.
4. Add a new Kotlin Class to your project and name it Constants. Supply your custom property values from step one. Keep this file as a local file that only exists on your machine and be sure not to commit this file into source control, as it contains secrets that should not be made public.
```Kotlin
class Constants {
    companion object {
        const val TENANT_ID: String = "<YOUR_TENANT_ID>"
        const val CLIENT_ID: String = "<YOUR_CLIENT_ID>"
        const val CLIENT_SECRET: String = "<YOUR_CLIENT_SECRET>"
        const val SUBDOMAIN: String = "<YOUR_SUBDOMAIN>"
    }
}
```
5. Choose a device emulator from the AVD Manager and run the project.


Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
