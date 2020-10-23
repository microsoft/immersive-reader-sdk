# Cognitive Services - Immersive Reader JavaScript SDK

[![Build status](https://dev.azure.com/ms/immersive-reader-sdk/_apis/build/status/96)](https://dev.azure.com/ms/immersive-reader-sdk/_build?definitionId=96)

The Immersive Reader JavaScript SDK is a JavaScript library that allows you to easily and quickly integrate the [Immersive Reader](https://azure.microsoft.com/services/cognitive-services/immersive-reader/) into your web application.

## Usage

Usage of this SDK requires an Azure subscription to Immersive Reader. Follow [these instructions](https://docs.microsoft.com/azure/cognitive-services/immersive-reader/how-to-create-immersive-reader) to create an Immersive Reader resource and configure Azure Active Directory authentication. Save the output of your session into a text file for future reference.

You can find examples of how to acquire an authentication token in the [samples](./samples).

Include the library of the stable build in your web application:

```html
<script type='text/javascript' src='https://contentstorage.onenote.office.net/onenoteltir/immersivereadersdk/immersive-reader-sdk.1.1.0.js'></script>
```

```bash
npm install @microsoft/immersive-reader-sdk
```

```bash
yarn add @microsoft/immersive-reader-sdk
```

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
    ImmersiveReader.launchAsync(YOUR_TOKEN, YOUR_SUBDOMAIN, content);
}
```

Take a look at the [samples](./samples) for examples of a full end-to-end integration.

The Immersive Reader may use persistent cookies to maintain user preferences and track feature usage. When embedding the Immersive Reader into applications, please consider the requirements of EU Cookie Compliance Policy. Setting the [cookiePolicy option](./src/options.ts) to **CookiePolicy.Enable** will enable the Immersive Reader to use cookies. It is the responsibility of the host application to obtain any necessary user consent in accordance with EU Cookie Compliance Policy.

## Building

In order to build the SDK, ensure that you have [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/), and [Yarn](https://yarnpkg.com/) installed.

Clone a copy of the repo:

```bash
git clone https://github.com/microsoft/immersive-reader-sdk
```

Change to the immersive-reader-sdk directory:

```bash
cd immersive-reader-sdk
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
