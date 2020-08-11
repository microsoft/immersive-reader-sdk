// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// launchAsync.ts needs to read VERSION (which is passed in from package.json via webpack)
(window as any).VERSION = '000.000.000';

import { launchWithoutContentAsync } from '../src/immersive-reader-sdk';
import { isValidSubdomain, resetLoadingForTest } from '../src/launchAsync';

describe('launchAsync tests', () => {
    it('able to launch reader', () => {
        expect.assertions(1);

        const launchPromise = launchWithoutContentAsync()
            .then(response => {
                resetLoadingForTest();
                expect(response).not.toBeNull();
            });

        return launchPromise;
    });

    it('send invalid api response', async () => {
        expect.assertions(1);

        launchWithoutContentAsync()
            .then(async response => {
                try {
                    await response.provideApiResponse(null);
                } catch (error) {
                    resetLoadingForTest();
                    expect(error.code).toBe('BadArgument');
                }
            });
    });

    it('send invalid status', async () => {
        expect.assertions(1);

        launchWithoutContentAsync()
            .then(async response => {
                try {
                    const provideApiResponse: any = {
                        data: null,
                        meta: null,
                        status: null
                    };

                    await response.provideApiResponse(provideApiResponse);
                } catch (error) {
                    resetLoadingForTest();
                    expect(error.code).toBe('BadArgument');
                }
            });
    });

    it('send invalid data', async () => {
        expect.assertions(1);

        launchWithoutContentAsync()
            .then(async response => {
                try {
                    const provideApiResponse: any = {
                        data: null,
                        meta: null,
                        status: 200
                    };

                    await response.provideApiResponse(provideApiResponse);
                } catch (error) {
                    resetLoadingForTest();
                    expect(error.code).toBe('BadArgument');
                }
            });
    });

    it('send invalid meta', async () => {
        expect.assertions(1);

        launchWithoutContentAsync()
            .then(async response => {
                try {
                    const provideApiResponse: any = {
                        data: {},
                        meta: null,
                        status: 200
                    };

                    await response.provideApiResponse(provideApiResponse);
                } catch (error) {
                    resetLoadingForTest();
                    expect(error.code).toBe('BadArgument');
                }
            });
    });
});

describe('Utility method isValidSubdomain', () => {
    it('should return false', () => {
        expect(isValidSubdomain(null)).toBe(false);
        expect(isValidSubdomain(undefined)).toBe(false);
        expect(isValidSubdomain('')).toBe(false);
        expect(isValidSubdomain('é')).toBe(false);
        expect(isValidSubdomain('hasaccént')).toBe(false);
        expect(isValidSubdomain('1é2')).toBe(false);
        expect(isValidSubdomain('É')).toBe(false);
        expect(isValidSubdomain('Ã')).toBe(false);
        expect(isValidSubdomain('has space')).toBe(false);
        expect(isValidSubdomain('has.period')).toBe(false);
        expect(isValidSubdomain(' startswithspace')).toBe(false);
        expect(isValidSubdomain('endswithspace ')).toBe(false);
        expect(isValidSubdomain('-startswithdash')).toBe(false);
        expect(isValidSubdomain('endswithdash-')).toBe(false);
    });

    it('should return true', () => {
        expect(isValidSubdomain('valid')).toBe(true);
        expect(isValidSubdomain('valid10with2numbers')).toBe(true);
        expect(isValidSubdomain('1234')).toBe(true);
    });
});

const fs = require('fs');
describe('Verify SDK version is valid', () => {
    it('check version', () => {
        const packageJson: string = fs.readFileSync("package.json", "utf8");
        const sdkVersion: string = JSON.parse(packageJson).version;
        console.log(`SDK version: ${sdkVersion}`);

        expect(isValidSDKVersion(sdkVersion)).toBe(true);
    });
});

// sdk version must be in format xxx.xxx.xxx (each version segment between 1 and 3 digits)
function isValidSDKVersion(sdkVersion: string): boolean {
    if (!sdkVersion) {
        return false;
    }

    const regExp = /^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$/;
    return regExp.test(sdkVersion);
}