// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * Append an <img/> of assets/icon.svg to every element with the specified className. Intended to be used with empty divs to avoid default styles
 */
export function renderLaunchButtons(className: string): void {
    const launchDivs: HTMLCollectionOf<Element> = document.getElementsByClassName(className);
    const iconImagePath: string = 'https://contentstorage.onenote.office.net/onenoteltir/permanent-static-resources/immersive-reader-icon.svg';

    for (const launchDiv of launchDivs) {
        const castedLaunchDiv = launchDiv as HTMLDivElement;
        const iconImage: HTMLImageElement = document.createElement('img');
        iconImage.src = iconImagePath;

        castedLaunchDiv.style.height = castedLaunchDiv.style.width = '20px';
        castedLaunchDiv.appendChild(iconImage);
    }
}