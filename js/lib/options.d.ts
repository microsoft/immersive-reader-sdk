export declare type Options = {
    uiLang?: string;
    timeout?: number;
    uiZIndex?: number;
    useWebview?: boolean;
    onExit?: () => any;
    customDomain?: string;
    allowFullscreen?: boolean;
    parent?: Node;
    hideExitButton?: boolean;
    cookiePolicy?: CookiePolicy;
    disableFirstRun?: boolean;
    readAloudOptions?: ReadAloudOptions;
    translationOptions?: TranslationOptions;
    displayOptions?: DisplayOptions;
    preferences?: string;
    onPreferencesChanged?: (value: string) => any;
    disableGrammar?: boolean;
    disableTranslation?: boolean;
    disableLanguageDetection?: boolean;
};
export declare enum CookiePolicy {
    Disable = 0,
    Enable = 1
}
export declare type ReadAloudOptions = {
    voice?: string;
    speed?: number;
    autoplay?: boolean;
};
export declare type TranslationOptions = {
    language: string;
    autoEnableDocumentTranslation?: boolean;
    autoEnableWordTranslation?: boolean;
};
export declare enum ThemeOption {
    Light = 0,
    Dark = 1
}
export declare type DisplayOptions = {
    textSize?: number;
    increaseSpacing?: boolean;
    fontFamily?: string;
    themeOption?: ThemeOption;
};
