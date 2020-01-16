# Immersive Reader - Node.js Sample

## Prerequisites

* An Immersive Reader resource configured for Azure Active Directory authentication. Follow [these instructions](https://docs.microsoft.com/azure/cognitive-services/immersive-reader/how-to-create-immersive-reader) to get set up. You will need some of the values created here when configuring the sample project properties. Save the output of your session into a text file for future reference.
* Install [Yarn](https://yarnpkg.com), [npm](https://npmjs.com)

## Usage

1. Open a command prompt (Windows) or terminal (OSX, Linux)

1. Navigate to the **immersive-reader-sdk/js/samples/advanced-nodejs** directory

1. Run `yarn install`

1. Create a file called **.env** and add the following, supplying values as appropriate.

    ```text
    TENANT_ID={YOUR_TENANT_ID}
    CLIENT_ID={YOUR_CLIENT_ID}
    CLIENT_SECRET={YOUR_CLIENT_SECRET}
    SUBDOMAIN={YOUR_SUBDOMAIN}
    ```

1. Run `yarn build:dev`

1. Run `yarn run start` (or `nodemon start` if you want to view changes you make after doing a browser refresh)

1. Open a web browser and navigate to [http://localhost:3000](http://localhost:3000) to view the sample

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
