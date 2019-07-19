Immersive Reader - Node.js Sample
----------------------------------

Follow these steps to get the sample up and running:

1. Follow the instructions at https://docs.microsoft.com/en-us/azure/cognitive-services/immersive-reader/aadauth to create an Immersive Reader resource with a custom subdomain and configure Azure Active Directory (AAD) authentication in your Azure tenant.
   You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.


2. Navigate to the samples/nodejs directory


3. Run "yarn install"


4. Create a file called .env and add the following to it:

    TENANT_ID={YOUR_TENANT_ID}
    CLIENT_ID={YOUR_CLIENT_ID}
    CLIENT_SECRET={YOUR_CLIENT_SECRET}
    CLIENT_SUBDOMAIN={YOUR_SUBDOMAIN}


    You need property values from the AAD authentication configuration in step #1 for this part. Refer back to the text file you saved of that session. See the details section below.

    Property value details:

    TENANT_ID     => Azure subscription TenantId
    CLIENT_ID     => AAD ApplicationId
    CLIENT_SECRET => AAD Application Service Principal password
    SUBDOMAIN     => Immersive Reader resource subdomain (resource 'Name' if the resource was created in the Azure portal, or 'CustomSubDomain' option if the resource was created with Azure CLI Powershell. Check the Azure portal for the subdomain on the Endpoint in the resource Overview page, for example, 'https://[SUBDOMAIN].cognitiveservices.azure.com/')


4. Run "npm start" (or "nodemon start" if you want to view changes you make after doing a browser refresh)


5. View the sample at http://localhost:3000


License
----------------------------------

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.