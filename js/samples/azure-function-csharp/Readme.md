# Immersive Reader - Azure Function C# Sample

This function returns an Azure AD token in order to call an Immersive Reader resource. It works based on Azure Managed Identities.

## Prerequisites

* An Immersive Reader resource configured for Azure Active Directory authentication. Follow [these instructions](https://docs.microsoft.com/azure/cognitive-services/immersive-reader/how-to-create-immersive-reader) to get set up. You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.
* [Visual Studio Code](https://code.visualstudio.com/).
* [Azure Account](https://marketplace.visualstudio.com/items?itemName=ms-vscode.azure-account) extension.
* [Azure Functions](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) extension.

## Usage

In order to use this Azure function in your apps you can either run it locally by following the steps below or go to **Deploy Function into Azure** section.

1. Open **AzureFunction-csharp** folder in VSCode.

1. Install Azure Functions Core Tools, it lets you develop and test your functions on your local computer from the command prompt or terminal.

    > npm i -g -azure-functions-core-tools

1. Install the required dependencies using VSCode Terminal. It uses the developer's credentials to authenticate to Azure services during local development.

    > dotnet add package Microsoft.Azure.Services.AppAuthentication --version 1.6.1

1. Replace the `<subdomain>` placeholder value with your own subdomain value on the subdomain variable in **ManagedIdentityAzureADTokenProvider.cs**. Subdomain value is generated when creating your Immersive Reader resource as described in the **Prerequisites** section.

1. Run the command below to test the function locally.

    > func host start

    The command output will show the function name followed by the function URL to be used in you application, you can notice that GET and POST requests are allowed by the function.

    ![FuncHost](images/funchost.png)

1. This will start a local development server on port 7071, you can change the port number in **local.settings.json** file if needed.

    Browse to `http://localhost:7071/api/GetAzureADToken` and you will see an Azure AD token displayed on the page.

    ![FuncResponse](images/funcresponse.png)

## Deploy Function into Azure

Deploying the function is optional if you want to test, debug or use it during your development process, in those cases you can only consider to run the function locally. Otherwise consider to deploy the function when your application is also ready to be deployed.

1. Click on the Azure extension, and then **Deploy to Function App..**.

    ![Click on the azure extension and then click deploy function](images/azfunc1.png)

2. Select the first option to **Create new Function App in Azure…**

    Make sure it is NOT the **Advanced**.

    ![Select Create new function app in Azure](images/azfunc2.png)

3. You must enter a unique globally name for the function.

    An error will be shown in case it already exists.

    ![Enter a unique globally name](images/azfunc3.png)

4. Select the runtime stack .Net 5

    ![Select .Net 5](images/azfunc4.png)

5. Select the region where your function is going to be deployed.

    ![Select region](images/azfunc5.png)

6. The function is being created on Azure now.

    You will see the status on the bottom right corner of VS Code and a confirmation message when completed.

    ![Dialog box displaying deployment process messages](images/azfunc6.png)

7. Go to your subscription.

    Expand your function > **Functions**.

    Right-click over your function name and click on **Copy Function Url**.

    ![Right click on the function and Copy Function Url](images/azfunc7.png)

8. This is the URL to be used in your apps to call this function.

    It includes a `code` param that can be passed either in the querystring parameters or in the request header.

    > Example: https://funcazureadtoken.azurewebsites.net/api/getazureadtoken?code=[YOUR_FUNCTION_SECRET_APIKEY]

    `code` is an API key assigned by default to your function 

    See the code samples below to see how the Azure function is called.

    • [.Net / C#](https://github.com/microsoft/immersive-reader-sdk/tree/master/js/samples/quickstart-csharp-azfunction)

    • [Android / Kotlin](https://github.com/microsoft/immersive-reader-sdk/tree/master/js/samples/quickstart-kotlin-azfunction)

## CORS

1. Log in into Azure portal.

2. Go to Function App on the left panel and select your function from the list.

    ![Select Function App and then your function](images/azpor1.png)

3. Scroll down until **CORS** option and click on it.

    Add all the allowed origins for this function.

    This config is needed when the callers are web applications.

    Example values are `https://localhost:44347` when you call it from your local host server in .Net, or `https://localhost:3000` when called from a local NodeJS app. Port number can vary depending on the application caller, for a .Net web application it can be changed at **launchSettings.json** file and **src\www** file for NodeJS applications.

    ![Go to CORS option and add all your origins](images/azpor2.png)

## Configure Managed Identities

Follow the next steps to add permissions to your Immersive Reader resource for the Managed identities. This allowas the Azure AD tokens acquired by the MI to work with your IR resource.

1. Scroll down until **Identity** option and click on it.

2. Make sure you have selected the **System assigned** tab.

    Set **Status On** and click on **Save**.

    ![Set status On in System assigned tab](images/azid1.png)

3. You will get a confirmation dialog box, click Yes.

    ![Click Yes on confirmation dialog](images/azid2.png)

4. Go to the **Search resources** textbox in the top of the Azure portal.

    Search for **Immersive Reader** resource and click on the listed resource.

    ![Search for Immersive reader resource](images/azid3.png)

5. Select the option **Access control (IAM)** from the left panel, click on **Add** and then **Add role assignment**.

    ![Select Access Control IAM](images/azid4.png)

6. Select **Cognitive Services User** role and press **Next**.

    ![Select Cognitive Services User role](images/azid6.png)

7. Select **Managed identity** in the **Assign access to** option and then press **+ Select members**.

    Specify the values below for the options displayed on the right.

    **Managed identity**: Function App

    **Select**: click on your function name. After this your function must be added into **Selected members:**.

    Press **Select**.

    ![Select Managed Identity and add members](images/azid7.png)

8. Your function info is displayed now.

    Press **Review + assign**.

    ![Function info and press Review and assign](images/azid8.png)

9. Confirmation message is displayed when the role is assigned.

    ![Confirmation message](images/azid9.png)


## See also

* [About Azure Functios](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview)
* [Create first function C#](https://docs.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-csharp?tabs=in-process&pivots=programming-runtime-functions-v3)
* [Running functions on .NET 5.0 in Azure](https://docs.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide)

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
