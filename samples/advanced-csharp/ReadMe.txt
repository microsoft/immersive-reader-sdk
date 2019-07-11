Immersive Reader - Advanced Sample
----------------------------------

Follow these steps to get the sample up and running:

1. Create an Immersive Reader cognitive service resource in Azure with a custom Subdomain.

   Azure portal - https://portal.azure.com/#create/Microsoft.CognitiveServicesImmersiveReader

   When using the Azure portal to create the Immersive Reader cognitive service resource, it will ask you to provide a 'Name' for the resource. This resource name becomes the 'Subdomain' name behind the scenes. You will need to provide this 'Subdomain' in the sample and when making calls to the SDK.


2. Follow the instructions at https://docs.microsoft.com/en-us/azure/cognitive-services/authentication?#authenticate-with-azure-active-directory to get Cognitive Service AAD Authentication set up in Azure. 
  
   This involves 3 simple steps:

       1) Creating an AAD application
       2) Creating a Service Principal for the AAD application
       3) Assigning the 'Cognitive Services User' role to the service principal, granting it access to the Immersive Reader resource created above (via the -scope option)


3. Open AdvancedSampleWebApp.sln in Visual Studio.


4. Right-click on the project in the Solution Explorer and choose "Manage User Secrets". This will open a file called secrets.json. Replace the contents of that file with the following, supplying your custom property values as appropriate:

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
    Subdomain    => Immersive Reader cognitive service resource subdomain (resource 'Name' if the resource was created in the Azure portal, or 'CustomSubDomain' option if the resource was created in Powershell - check the Azure portal for the subdomain on the Endpoint in the resource Overview page, e.g. it will look like 'https://[SUBDOMAIN].cognitiveservices.azure.com/')


5. Run Debug->Start Debugging.


License
----------------------------------

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.