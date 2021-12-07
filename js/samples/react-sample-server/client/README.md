# Immersive Reader - React + node server Sample

## Prerequisites

* An Immersive Reader resource configured for Azure Active Directory authentication. Follow [these instructions](https://docs.microsoft.com/azure/cognitive-services/immersive-reader/how-to-create-immersive-reader) to get set up. You will need some of the values created here when configuring the sample project properties. Securely save the output from Step 4 into a text file for future reference.
* Install [Yarn](https://yarnpkg.com)

## Usage

1. Open a command prompt (Windows) or terminal (OSX, Linux)

1. Navigate to the **immersive-reader-sdk/js/samples/react-sample-server/client** directory

1. Create a file called **.env** and add the following, supplying values as appropriate. This is for package dependencies further up the project tree that could cause issues.
    1. Alternatively you can use the .env_sample and remove the [_sample] suffix

    ```text
    SKIP_PREFLIGHT_CHECK=true 
    ```

1. Run `yarn install`

1. Run `yarn start`

1. For setting up the node server: Navigate to the **immersive-reader-sdk/js/samples/react-sample-server/server** directory

1. Create a file called **.env** and add the following, supplying values as appropriate.
    1. Alternatively you can use the .env_sample and remove the [_sample] suffix

    ```text
    TENANT_ID={YOUR_TENANT_ID}
    CLIENT_ID={YOUR_CLIENT_ID}
    CLIENT_SECRET={YOUR_CLIENT_SECRET}
    SUBDOMAIN={YOUR_SUBDOMAIN}
    ```
1. Open a separate command prompt (Windows) or terminal (OSX, Linux)

1. Run `yarn install`

1. Run `npm start` (or `nodemon start` if you want to view changes you make after doing a browser refresh)
    - Also please note, **this server is running on port 3001**

1. Open a web browser and navigate to [http://localhost:3000](http://localhost:3000) to view the sample

1. Press the Immersive Reader button to launch it

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.
