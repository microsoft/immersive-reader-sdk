# Cognitive Services - Immersive Reader JavaScript SDK (preview)

The Immersive Reader JavaScript SDK is a JavaScript library that allows you to easily and quickly integrate the Immersive Reader into your web application.

## Usage

Microsoft 1st Party Office applications should use the `v0.0.3` Immersive Reader JavaScript SDK and the `v0.0.1` SDK's authentication token retrieved by providing a `SubscriptionKey` and `Region`. This will ensure the Immersive Reader uses Office compliant APIs deployed to OSI.

Here are the steps:

1. Create a Microsoft Internal billable App Service Subscription via the AIRS portal: https://aka.ms/airs and be sure to add more than one owner.
1. Once you have access to the Subscription created via AIRS in the Azure portal https://portal.azure.com - use it to create the Immersive Reader Resource.
1. From the Subscription go to Resources and click the `Add` button.
1. Search for "Immersive Reader" and click the `Create` button.
1. Provide the project details, ensuring one of the following regions is selected: `eastus`, `westus`, `northeurope`, `westeurope`, `centralindia`, `japaneast`, `australiaeast` (the Learning tools Service on OSI only supports these regions) and click next.
1. (optional) Add any tags and click next.
1. Review the terms and click the `Create` button (it’ll take a moment to deploy).
1. Once deployed, click the `Go to resource` button.
1. Click on the `Keys and Endpoint` button in the side menu.
1. These are your secrets. `KEY 1` is the `SubscriptionKey`, `LOCATION` is the `Region`.

Include the library of the v0.0.3 stable build in your web application:

```html
<script type='text/javascript' src='https://contentstorage.onenote.office.net/onenoteltir/immersivereadersdk/immersive-reader-sdk.0.0.3.js'></script>
```

```bash
npm install @microsoft/immersive-reader-sdk@0.0.3
```

```bash
yarn add @microsoft/immersive-reader-sdk@0.0.3
```

You can find examples of how to acquire a v0.0.1 authentication token in the [samples](./samples).

Add an HTML element to your webpage with the `immersive-reader-button` class attribute.

```html
<div class='immersive-reader-button' onclick='launchImmersiveReader()'></div>
```

Next, invoke the Immersive Reader when the button is clicked:

```javascript
function launchImmersiveReader() {
    const content = {
        title: 'Immersive Reader',
        chunks: [ {
            content: 'Hello, world!'
        } ]
    };
    // The Office compliant v0.0.1 token does not require a subdomain, use null instead.
    ImmersiveReader.launchAsync(YOUR_TOKEN, null, content);
}
```

Take a look at the [samples](./samples) for examples of a full end-to-end integration.

The Immersive Reader may use persistent cookies to maintain user preferences and track feature usage. When embedding the Immersive Reader into applications, please consider the requirements of EU Cookie Compliance Policy. Setting the [cookiePolicy option](./src/options.ts) to **CookiePolicy.Enable** will enable the Immersive Reader to use cookies. It is the responsibility of the host application to obtain any necessary user consent in accordance with EU Cookie Compliance Policy.

## Building

In order to build the backfix branch v0.0.3 SDK, ensure that you have [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/), and [Yarn](https://yarnpkg.com/) installed.

Clone a copy of the repo:

```bash
git clone https://github.com/microsoft/immersive-reader-sdk
```

Fetch the v1.1.0-backfix branch (a modified version of v1.1.0 that retains the same overall structure of the v1.1.0 SDK but uses the v0.0.3 SDK and Office Compliant v0.0.1 authentication token)
```bash
git fetch origin v1.1.0-backfix
```

Checkout the v1.1.0-backfix branch

```bash
git checkout v1.1.0-backfix
```

Change to the immersive-reader-sdk/js directory:

```bash
cd immersive-reader-sdk/js
```

Install dependencies:

```bash
yarn
```

Build and test:

```bash
yarn run build
yarn run test
```
