Immersive Reader - Advanced Sample
----------------------------------

Follow these steps to get the sample up and running:

1. Follow the instructions at https://docs.microsoft.com/en-us/azure/cognitive-services/immersive-reader/aadauth to create an Immersive Reader resource with a custom subdomain and configure Azure Active Directory (AAD) authentication in your Azure tenant.


2. Open AdvancedSampleWebApp.sln in Visual Studio.


3. Right-click on the project in the Solution Explorer and choose "Manage User Secrets". This will open a file called secrets.json. Replace the contents of that file with the following, supplying your custom property values as appropriate:

        {
          "TenantId": YOUR_TENANT_ID,
          "ClientId": YOUR_CLIENT_ID,
          "ClientSecret": YOUR_CLIENT_SECRET,
          "Subdomain": YOUR_SUBDOMAIN
        }

        (end file contents)


    Property value details:

    TenantId     => Azure subscription TenantId
    ClientId     => AAD ApplicationId
    ClientSecret => AAD Application Service Principal password
    Subdomain    => Immersive Reader cognitive service resource subdomain (resource 'Name' if the resource was created in the Azure portal, or 'CustomSubDomain' option if the resource was created in Azure CLI Powershell - check the Azure portal for the subdomain on the Endpoint in the resource Overview page, for example 'https://[SUBDOMAIN].cognitiveservices.azure.com/')


4. Run Debug->Start Debugging.


License
----------------------------------

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.