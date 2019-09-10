Immersive Reader - Quick Start Sample
----------------------------------

Follow these steps to get the sample up and running:

1. Follow the instructions at https://docs.microsoft.com/azure/cognitive-services/immersive-reader/azure-active-directory-authentication to create two Immersive Reader resources with custom subdomains and configure Azure Active Directory (Azure AD) authentication in your Azure tenant.
   You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.


2. Open MultipleResourcesSampleWebApp.sln in Visual Studio.


3. Right-click on the project in the Solution Explorer and choose "Manage User Secrets". This will open a file called secrets.json. Replace the contents of that file with the following, supplying your custom property values as appropriate:

        {
			"ImmersiveReaderResourceOne": {
			  "TenantId": YOUR_FIRST_TENANT_ID,
			  "ClientId": YOUR_FIRST_CLIENT_ID,
			  "ClientSecret": YOUR_FIRST_CLIENT_SECRET,
			  "Subdomain": YOUR_FIRST_SUBDOMAIN
			}, 
			"ImmersiveReaderResourceTwo": {
			  "TenantId": YOUR_SECOND_TENANT_ID,
			  "ClientId": YOUR_SECOND_CLIENT_ID,
			  "ClientSecret": YOUR_SECOND_CLIENT_SECRET,
			  "Subdomain": YOUR_SECOND_SUBDOMAIN
			}
		}

        (end file contents)


    You need property values from the Azure AD authentication configuration in step #1, for each of your resources, for this part. Refer back to the text files you saved of that session. See the details section below.

    Property value details:

    TenantId     => Azure subscription TenantId
    ClientId     => Azure AD ApplicationId
    ClientSecret => Azure AD Application Service Principal password
    Subdomain    => Immersive Reader resource subdomain (resource 'Name' if the resource was created in the Azure portal, or 'CustomSubDomain' option if the resource was created with Azure CLI Powershell. Check the Azure portal for the subdomain on the Endpoint in the resource Overview page, for example, 'https://[SUBDOMAIN].cognitiveservices.azure.com/')
    

4. Run Debug->Start Debugging.


License
----------------------------------

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.