// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { launchAsync } from '../src/immersive-reader-sdk';
import { Content } from '../src/content';
import { Options } from '../src/options';

describe('launchAsync tests', () => {
    const SampleToken: string = 'not-a-real-token';
    const SampleContent: Content = { chunks: [ { content: 'Hello, world' } ] };

    it('fails due to missing token', async () => {
        expect.assertions(1);
        try {
            await launchAsync(null, null, { chunks: [] });
        } catch (reason) {
            expect(reason.code).toBe('BadArgument');
        }
    });

    it('fails due to missing content', async () => {
        expect.assertions(1);
        try {
            await launchAsync(SampleToken, null, null);
        } catch (reason) {
            expect(reason.code).toBe('BadArgument');
        }
    });

    it('fails due to missing chunks', async () => {
        expect.assertions(1);
        try {
            await launchAsync(SampleToken, null, { chunks: null });
        } catch (reason) {
            expect(reason.code).toBe('BadArgument');
        }
    });

    it('fails due to empty chunks', async () => {
        expect.assertions(1);
        try {
            await launchAsync(SampleToken, null, { chunks: [] });
        } catch (reason) {
            expect(reason.code).toBe('BadArgument');
        }
    });

    it('succeeds', () => {
        expect.assertions(1);
        const launchPromise = launchAsync(SampleToken, null, SampleContent)
            .then(iframe => {
                expect(iframe).not.toBeNull();
            });

        // launchAsync creates an iframe which points to the Immersive Reader,
        // which then sends a postMessage to the parent window with the message
        // 'ImmersiveReader-ReadyForContent'. This mocks that behavior.
        window.postMessage('ImmersiveReader-ReadyForContent', '*');

        return launchPromise;
    });

    it('sets the display language', async () => {
        expect.assertions(1);
        const options: Options = { uiLang: 'zh-Hans' };
        const launchPromise = launchAsync(SampleToken, null, SampleContent, options);
        window.postMessage('ImmersiveReader-ReadyForContent', '*');

        const container = await launchPromise;
        const iframe = <HTMLIFrameElement>container.firstElementChild;
        expect(iframe.src.toLowerCase()).toMatch('omkt=zh-hans');
    });

    it('sets the z-index of the iframe', async () => {
        const zIndex = 12345;
        expect.assertions(1);
        const options: Options = { uiZIndex: zIndex };
        const launchPromise = launchAsync(SampleToken, null, SampleContent, options);
        window.postMessage('ImmersiveReader-ReadyForContent', '*');

        const container = await launchPromise;
        expect(container.style.zIndex).toEqual('' + zIndex);
    });

    it('launches with default z-index', async () => {
        expect.assertions(1);
        const launchPromise = launchAsync(SampleToken, null, SampleContent);
        window.postMessage('ImmersiveReader-ReadyForContent', '*');

        const container = await launchPromise;
        expect(container.style.zIndex).toEqual('1000'); // Default is 1000;
    });

    it('fails to launch due to timeout', async () => {
        jest.useFakeTimers();

        expect.assertions(1);
        const launchPromise = launchAsync(SampleToken, null, SampleContent);

        // Skip forward in time to trigger timeout logic
        jest.runAllTimers();

        try {
            await launchPromise;
        } catch (reason) {
            expect(reason.code).toBe('Timeout');
        }
    });
});