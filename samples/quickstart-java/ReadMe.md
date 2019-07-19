# Immersive Reader - Java Sample

----------------------------------

## Follow these steps to get the sample up and running

### Create an Immersive Reader resource and configure Azure Active Directory (AAD) authentication

1. Follow the instructions at https://docs.microsoft.com/en-us/azure/cognitive-services/immersive-reader/aadauth to create an Immersive Reader resource with a custom subdomain and configure Azure Active Directory (AAD) authentication in your Azure tenant.  
You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.

### Installation on Windows

Using [Git](https://git-scm.com/), open a Command Prompt and run `git clone https://github.com/Microsoft/immersive-reader-sdk` to a preferred folder then:

1. Download IntelliJ IDEA Community (https://www.jetbrains.com/idea/download/#section=windows).
2. Download the Java 8 JDK (https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).

### Installation on OSX

Using [Git](https://git-scm.com/), Launch Terminal and run `git clone https://github.com/Microsoft/immersive-reader-sdk` to a preferred folder then:

1. Download IntelliJ IDEA Community (https://www.jetbrains.com/idea/download/#section=mac).
2. Download the Java 8 JDK (https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).


#### USAGE

1. Create a new project in IntelliJ by clicking **New -> Project from Existing Sources...** from the menu bar.
    * Select the **JavaSample** folder from the cloned repo.
    * Click **Import project from external model** and select **Maven**. Click next.
    * Leave all default setting and click next.
    * Under **Select Maven projects to import**, ensure **Microsoft.ImmersiveReader.quickstart-java:1.0-SNAPSHOT** is checked and press next.
    * Under **Project SDK**, if the Java JDK does not show up, click the plus sign and select the Java JDK from the location it was downloaded in the previous section, then click next.
    * After naming the project and selecting a location for the project click Finish.

2. Add a new run configuration by clicking **Run -> Edit Configurations...**
    * Click the plus sign on the left side of the **Run/Debug Configurations** popup to add a new configuration and select **Maven**.
    * In the **Name** field, enter **Tomcat**.
    * Under the **Parameters** tab, in the **Working directory** field, ensure the path to the project is entered.
    * In the **Command line** field, enter **tomcat7:run**.
    * At the bottom of the popup under **Before launch: Activate tool window**, click the plus sign and select **Run Maven Goal**.
    * In the **Command line** field enter **clean**. Click OK.
    * Click Apply, then click OK to close the window.

3. In the JavaSample/src/main/Java/Microsoft.ImmersiveReader folder create a new Java Class called Constants.
    * Add the following public static final Strings:
        * TENANT_ID
        * CLIENT_ID
        * CLIENT_SECRET
        * SUBDOMAIN
    * This should resolve the errors in the GetAuthTokenServlet.java file.

   You need property values from the AAD authentication configuration in step above for this part. Refer back to the text file you saved of that session. See the details section below.  

   Property value details:

   * TENANT_ID => Azure subscription TenantId  
   * CLIENT_ID => AAD ApplicationId  
   * CLIENT_SECRET => AAD Application Service Principal password  
   * SUBDOMAIN => Immersive Reader resource subdomain (resource 'Name' if the resource was created in the Azure portal, or 'CustomSubDomain' option if the resource was created with Azure CLI Powershell. Check the Azure portal for the subdomain on the Endpoint in the resource Overview page, for example, 'https://[SUBDOMAIN].cognitiveservices.azure.com/')    

4. Run the sample project by pressing Shift + F10 or by clicking the Run button.

5. Click the link **http://localhost:8888** in the Maven tool build window or open a browser and navigate to http://localhost:8888.


Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.