# Cognitive Services - Immersive Reader SDK (preview)

[![Build status](https://dev.azure.com/ms/immersive-reader-sdk/_apis/build/status/96)](https://dev.azure.com/ms/immersive-reader-sdk/_build?definitionId=96)

The Immersive Reader SDK is a JavaScript library that allows you to easily and quickly integrate the [Immersive Reader](https://azure.microsoft.com/services/cognitive-services/immersive-reader/) into your web application.

## Usage

Usage of this SDK requires an Azure subscription to Immersive Reader. Follow [these instructions](https://docs.microsoft.com/azure/cognitive-services/immersive-reader/azure-active-directory-authentication) to create an Immersive Reader resource with a custom subdomain and configure Azure Active Directory (Azure AD) authentication in your Azure tenant.

Once you have completed that configuration, you will have a subdomain and will be able to create an Azure AD authentication token. Both the subdomain and a token are required when calling the SDK to launch the Immersive Reader.  

You can find examples of how to acquire an Azure AD token in the [samples](./samples).

Include the library in your web application:

* Stable build

```html
<script type='text/javascript' src='https://contentstorage.onenote.office.net/onenoteltir/immersivereadersdk/immersive-reader-sdk.0.0.2.js'></script>
```

```bash
npm install @microsoft/immersive-reader-sdk
```

```bash
yarn add @microsoft/immersive-reader-sdk
```

* Canary build (use at your own risk!)

```html
<script type='text/javascript' src='https://contentstorage.onenote.office.net/onenoteltir/immersivereadersdk/immersive-reader-sdk.preview.js'></script>
```

```bash
npm install @microsoft/immersive-reader-sdk@next
```

```bash
yarn add @microsoft/immersive-reader-sdk@next
```

Add an HTML element to your webpage with the `immersive-reader-button` class attribute.

```html
<div class='immersive-reader-button' onclick='launchImmersiveReader()'></div>
```

Next, invoke the Immersive Reader when the button is clicked:

```typescript
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

## Building

In order to build the SDK, ensure that you have [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/), and [Yarn](https://yarnpkg.com/) installed.

Clone a copy of the repo:

```bash
git clone https://github.com/Microsoft/immersive-reader-sdk
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

## Contributing

We welcome [contributions](CONTRIBUTING.md) to this project.

* [Submit bugs](https://github.com/Microsoft/immersive-reader-sdk/issues) and help us verify fixes as they are checked in.
* Submit and review [source code changes](https://github.com/Microsoft/immersive-reader-sdk/pulls).
* Join the discussion on [StackOverflow](https://stackoverflow.com/questions/tagged/immersive-reader) and [Twitter](https://twitter.com/hashtag/ImmersiveReader).

## Reporting Security Issues

Security issues and bugs should be reported privately, via email, to the Microsoft Security Response Center (MSRC) at
[secure@microsoft.com](mailto:secure@microsoft.com). You should receive a response within 24 hours. If for some reason
you do not, please follow up via email to ensure we received your original message. Further information, including the
[MSRC PGP](https://technet.microsoft.com/en-us/security/dn606155) key, can be found in the
[Security TechCenter](https://technet.microsoft.com/en-us/security/default).

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](LICENSE.txt) License.
