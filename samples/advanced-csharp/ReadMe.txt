Immersive Reader - Advanced Sample
----------------------------------

Follow these steps to get the sample up and running:

1. Open AdvancedSampleWebApp.sln in Visual Studio

2. Right-click on the project in the Solution Explorer and choose "Manage User Secrets". This will open a file called secrets.json. Replace the contents of that file with the following, supplying your subscription key and endpoint where appropriate:
{
  "SubscriptionKey": YOUR_SUBSCRIPTION_KEY,
  "Endpoint": YOUR_ENDPOINT
}

The endpoint is of the format https://westus.api.cognitive.microsoft.com/sts/v1.0, and you can find it here: https://azure.microsoft.com/try/cognitive-services/my-apis/.

3. Run Debug->Start Debugging

License
----------------------------------

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.