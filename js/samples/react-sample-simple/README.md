# Immersive Reader - React Sample Simple

## Prerequisites

* An Immersive Reader resource configured for Azure Active Directory authentication. Follow [these instructions](https://docs.microsoft.com/azure/cognitive-services/immersive-reader/how-to-create-immersive-reader) to get set up. You will need some of the values created here when configuring the sample project properties. Securely save the output from Step 4 into a text file for future reference.
* Install [Yarn](https://yarnpkg.com)

## Usage

1. Open a command prompt (Windows) or terminal (OSX, Linux)

1. Navigate to the **immersive-reader-sdk/js/samples/react-sample-simple** directory

1. Run `yarn install`

1. Create a file called **.env** and add the following, supplying values as appropriate.
    1. Alternatively you can use the .env_sample and remove the [_sample] suffix

    ```text
    REACT_APP_TENANT_ID={YOUR_TENANT_ID}
    REACT_APP_CLIENT_ID={YOUR_CLIENT_ID}
    REACT_APP_CLIENT_SECRET={YOUR_CLIENT_SECRET}
    REACT_APP_SUBDOMAIN={YOUR_SUBDOMAIN}
    ```

1. Run `yarn start`

1. Open a web browser and navigate to [http://localhost:3000](http://localhost:3000) to view the sample

1. Press the Immersive Reader button to launch it

### Notes
Given the recent browser changes regarding CORS and we are doing a simple react sample without a server,
we set the proxy in our package.json to trick the browser in thinking that when we make a request to localhost:3000 (our origin), we really are making it login.windows.net which is what we want.

- Please refer to this link to understand why we ping localhost (our host) to be proxied over
// Quick note: this is due to the recent changes in browsers for stricter CORS policies: https://medium.com/swlh/avoiding-cors-errors-on-localhost-in-2020-5a656ed8cefa
- Alternatively you can try the following URL: https://cors-anywhere.herokuapp.com/. See here for more info: https://dev.to/andypotts/avoiding-cors-errors-on-localhost-in-2020-4mfn


## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
