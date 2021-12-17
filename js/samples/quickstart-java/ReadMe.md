# Immersive Reader - Java Sample

## Prerequisites

* An Immersive Reader resource configured for Azure Active Directory authentication. Follow [these instructions](https://docs.microsoft.com/azure/applied-ai-services/immersive-reader/how-to-create-immersive-reader) to get set up. You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.
* [IntelliJ IDEA Community](https://www.jetbrains.com/idea/download)
* [Java 8 JDK](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

## Usage

1. Create a new project in IntelliJ by clicking **New -> Project from Existing Sources...** from the menu bar.
    1. Choose the **immersive-reader-sdk/js/samples/quickstart-java** folder.
    1. Click **Import project from external model** and select **Maven**. Click Next.
    1. Leave all default settings and click Next.
    1. Under **Select Maven projects to import**, ensure **Microsoft.ImmersiveReader.quickstart-java:1.0-SNAPSHOT** is checked and press Next.
    1. Under **Project SDK**, if the Java JDK does not show up, click the plus sign and select the Java JDK from the location it was downloaded to, then click Next.
    1. After naming the project and selecting a location for the project, click Finish.

1. Add a new run configuration by clicking **Run -> Edit Configurations...**
    1. Click the plus sign on the left side of the **Run/Debug Configurations** popup to add a new configuration and select **Maven**.
    1. In the **Name** field, enter **Tomcat**.
    1. Under the **Parameters** tab, in the **Working directory** field, ensure the path to the project is entered.
    1. In the **Command line** field, enter **tomcat7:run**.
    1. At the bottom of the popup under **Before launch: Activate tool window**, click the plus sign and select **Run Maven Goal**.
    1. In the **Command line** field enter **clean**. Click OK.
    1. Click Apply, then click OK to close the window.

1. Add a file named `.env` to the root folder and add the following, supplying values as appropriate. Be sure not to commit this file into source control, as it contains secrets that should not be made public.

    ```text
    TENANT_ID=<YOUR_TENANT_ID>
    CLIENT_ID=<YOUR_CLIENT_ID>
    CLIENT_SECRET<YOUR_CLIENT_SECRET>
    SUBDOMAIN=<YOUR_SUBDOMAIN>
    ```

1. Run the sample project by pressing **Shift + F10** or by clicking the **Run** button.

1. Open a web browser and navigate to [http://localhost:8888](http://localhost:8888) to view the sample.

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
