// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { renderButtons } from '../src/renderButtons';

function expectIcon(button: HTMLDivElement, text: string) {
    let imageCount = 0;
    for (const child of <any>button.children) {
        if (child.tagName === 'IMG') {
            expect(child.getAttribute('alt')).toBe(text);
            imageCount++;
        }
    }
    expect(imageCount).toBe(1);
}

function expectText(button: HTMLDivElement, text: string) {
    let spanCount = 0;
    for (const child of <any>button.children) {
        if (child.tagName === 'SPAN' && child.textContent) {
            expect(child.textContent).toBe(text);
            spanCount++;
        }
    }
    expect(spanCount).toBe(1);
}

describe('renderButtons', () => {
    it('styles a single icon button', () => {
        const button: HTMLDivElement = document.createElement('div');
        button.className = 'immersive-reader-button';
        document.body.appendChild(button);

        renderButtons();

        expectIcon(button, 'Immersive Reader');

        // Cleanup the DOM
        button.remove();
    });

    it('styles a single icon+text button', () => {
        const button: HTMLDivElement = document.createElement('div');
        button.className = 'immersive-reader-button';
        button.setAttribute('data-button-style', 'iconAndText');
        document.body.appendChild(button);

        renderButtons();

        expectIcon(button, 'Immersive Reader');
        expectText(button, 'Immersive Reader');

        // Cleanup the DOM
        button.remove();
    });

    it('styles a single text button', () => {
        const button: HTMLDivElement = document.createElement('div');
        button.className = 'immersive-reader-button';
        button.setAttribute('data-button-style', 'text');
        document.body.appendChild(button);

        renderButtons();

        expectText(button, 'Immersive Reader');

        // Cleanup the DOM
        button.remove();
    });

    it('styles a single button in a different language', () => {
        const button: HTMLDivElement = document.createElement('div');
        button.className = 'immersive-reader-button';
        button.setAttribute('data-button-style', 'iconAndText');
        button.setAttribute('data-locale', 'fr-FR');
        document.body.appendChild(button);

        renderButtons();

        expectIcon(button, 'Lecteur immersif');
        expectText(button, 'Lecteur immersif');

        // Cleanup the DOM
        button.remove();
    });

    it('styles multiple buttons', () => {
        const button: HTMLDivElement = document.createElement('div');
        const button2: HTMLDivElement = document.createElement('div');
        button.className = 'immersive-reader-button';
        button2.className = 'immersive-reader-button';
        button2.setAttribute('data-button-style', 'iconAndText');
        document.body.appendChild(button);
        document.body.appendChild(button2);

        renderButtons();

        expectIcon(button, 'Immersive Reader');
        expectIcon(button2, 'Immersive Reader');
        expectText(button2, 'Immersive Reader');

        // Cleanup the DOM
        button.remove();
        button2.remove();
    });

    it('does nothing for other buttons', () => {
        const newDiv1: HTMLDivElement = document.createElement('div');
        const newDiv2: HTMLDivElement = document.createElement('div');
        newDiv1.className = 'button1';
        newDiv2.className = 'something-else';

        document.body.appendChild(newDiv1);
        document.body.appendChild(newDiv2);

        renderButtons();

        expect(newDiv1.children.length).toBe(0);
        expect(newDiv2.children.length).toBe(0);

        // Cleanup the DOM
        newDiv1.remove();
        newDiv2.remove();
    });

    it('works when applied to an array of elements', () => {
        const button: HTMLDivElement = document.createElement('div');
        const button2: HTMLDivElement = document.createElement('div');
        button.className = 'immersive-reader-button';
        button2.className = 'immersive-reader-button';
        button2.setAttribute('data-button-style', 'iconAndText');
        document.body.appendChild(button);
        document.body.appendChild(button2);

        renderButtons({
            elements: [button, button2]
        });

        expectIcon(button, 'Immersive Reader');
        expectIcon(button2, 'Immersive Reader');
        expectText(button2, 'Immersive Reader');

        // Cleanup the DOM
        button.remove();
        button2.remove();

    });
});