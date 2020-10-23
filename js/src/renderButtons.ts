// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

type RenderButtonsOptions = {
    elements: HTMLDivElement[];
};

const attributeIconPxSize = 'data-icon-px-size';
const attributeButtonStyle = 'data-button-style';
const attributeLocale = 'data-locale';

const iconUrl: string = 'https://contentstorage.onenote.office.net/onenoteltir/permanent-static-resources/immersive-reader-icon.svg';

const locs: { [key: string]: string} = {
    af: 'Indompelende leser',
    am: 'በህያው ስሜት ፈጣሪ ዕይታ አንባቢ',
    ar: 'القارئ الشامل',
    as: 'ইমাৰচিভ ৰিডাৰ',
    az: 'İmmersiv Oxuyucu',
    be: 'Імерсіўны чытальнік',
    bg: 'Концентриран четец',
    bn: 'মনোগ্রাহী পাঠক',
    'bn-bd': 'ইমার্সিভ পাঠক',
    bs: 'Koncentrirani čitalac',
    ca: 'Lector immersiu',
    cs: 'Asistivní čtečka',
    'cy-gb': 'Darllenydd Ymdrwythol',
    da: 'Forenklet læser',
    de: 'Plastischer Reader',
    el: 'Προηγμένο πρόγραμμα ανάγνωσης',
    en: 'Immersive Reader',
    es: 'Lector inmersivo',
    et: 'Süvaluger',
    eu: 'Irakurgailu murgiltzailea',
    fa: 'خواننده همه‌جانبه',
    fi: 'Syventävä lukuohjelma',
    fil: 'Immersive Reader',
    fr: 'Lecteur immersif',
    'ga-ie': 'Léitheoir tumthach',
    gd: 'An leughadair ùr-nòsach',
    gl: 'Lector avanzado',
    gu: 'ઇમર્સિવ રીડર',
    ha: 'Mai karatu Mai barbazawa',
    he: 'תצוגת קריאה מודרנית',
    hi: 'इमर्सिव रीडर',
    hr: 'Stopljeni čitač',
    hu: 'Modern olvasó',
    hy: 'Խորասուզված ընթերցիչ',
    id: 'Pembaca Imersif',
    ig: 'Ọgụụ Kenzipụtara',
    is: 'Aðgengilegt lestrarumhverfi',
    it: 'Strumento di lettura immersiva',
    ja: 'イマーシブ リーダー',
    ka: 'იმერსიული წამკითხველი',
    kk: 'Иммерсивті оқу құралы',
    km: 'កម្មវិធីអានពណ៌រំលេចនៅលើអេក្រង់',
    kn: 'ಇಮ್ಮರ್ಸಿವ್ ಓದುಗ',
    ko: '몰입형 리더',
    kok: 'तंद्री लागिल्लो वाचक',
    'ku-arab': 'خوێنەری پڕ',
    ky: 'Курчаган Окугуч',
    lb: 'Immersive Reader',
    lo: 'ຕົວອ່ານອິມເມີສີບ',
    lt: 'Įtraukianti skaitytuvė',
    lv: 'Tīrskata lasītājs',
    mi: 'Pūpānui Rumaki',
    mk: 'Сеопфатен читач',
    ml: 'ഇമ്മേഴ്‌സീവ് റീഡർ',
    mn: 'Идэвхтэй уншигч',
    mr: 'इमर्सिव्ह वाचक',
    ms: 'Pembaca Imersif',
    mt: 'Qarrej Immersiv',
    ne: 'इमेर्सिभ रिडर',
    nl: 'Insluitende lezer',
    'nn-no': 'Engasjerande lesar',
    no: 'Engasjerende leser',
    nso: 'Go Bala ka Mongwalo o Mokoto',
    or: 'ଇମରସିଭ୍ ରିଡର୍',
    pa: 'ਇਮਰਸਿਵ ਰੀਡਰ',
    'pa-arab': 'گھیرن آلا مطالعہ کار',
    pl: 'Czytnik immersyjny',
    prs: 'خواننده نمایش',
    pt: 'Leitura Avançada',
    quc: 'Nim ucholajil sik\'inel uwach',
    quz: 'Wankisqa Ñawiq',
    ro: 'Immersive Reader',
    ru: 'Иммерсивное средство чтения',
    rw: 'Insakazasoma',
    sd: 'امرسو ريڊر',
    si: 'ගිලෙන සුළු කියවනය',
    sk: 'Imerzná čítačka',
    sl: 'Potopni bralnik',
    sq: 'Lexuesi kredhës',
    'sr-cyrl-ba': 'Концентрисани читалац',
    'sr-cyrl-rs': 'Концентрисани читалац',
    'sr-latn-rs': 'Koncentrisani čitalac',
    sv: 'Avancerad läsare',
    sw: 'Kisomaji cha Kuzamisha',
    ta: 'அற்புதமான ரீடர்',
    te: 'మంత్రముగ్ధులను చేసే పఠన సాధనం',
    'tg-cyrl-tj': 'Хонандаи фарогир',
    th: 'โปรแกรมช่วยอ่าน',
    ti: 'ኣንባቢ ሕሉው ስምዒት ፈጣሪ',
    tk: 'Giňişleýin okaýjy',
    tn: 'Sebadi sa Imesife',
    tr: 'Tam Ekran Okuyucu',
    tt: 'Чолгап алучы уку чарасы',
    'ug-cn': 'چۆكمە ئوقۇغۇچ',
    uk: 'Занурення в текст',
    ur: 'امرسیو مطالعہ کار',
    uz: 'Immersiv mutolaa vositasi',
    vi: 'Trình đọc Chân thực',
    wo: 'Jàngukaay bu Rafet',
    xh: 'Isifundi Esikhulu',
    yo: 'Ìwò Alámùtán',
    zh: '沉浸式阅读器',
    'zh-hant': '沈浸式閱讀程式',
    zu: 'Isifundi Sokuzizwisa'
};

export function renderButtons(options?: RenderButtonsOptions): void {
    const buttonStyle: HTMLStyleElement = document.createElement('style');
    buttonStyle.innerHTML = '.immersive-reader-button{cursor:pointer;display:inline-block;padding:5px;} .immersive-reader-button:hover{background:rgba(0,0,0,.05);border-radius:2px';
    document.head.appendChild(buttonStyle);
    let iconElements = <HTMLDivElement[]>[].slice.call(document.getElementsByClassName('immersive-reader-button'));
    if (options && options.elements) {
        iconElements = options.elements;
    }
    for (const div of iconElements) {
        div.setAttribute('role', 'button');
        const locale = div.getAttribute(attributeLocale) || 'en';
        div.setAttribute('aria-label', getLocalizedString(locale));
        div.textContent = '';
        
        const style = div.getAttribute(attributeButtonStyle) || 'icon';
        switch (style) {
            case 'icon':
                renderIcon(div);
                break;
            case 'text':
                renderText(div);
                break;
            case 'iconAndText':
                renderIcon(div);
                renderMargin(div);
                renderText(div);
                break;
        }
    }
}

function renderIcon(div: HTMLDivElement) {
    const image = document.createElement('img');
    image.src = iconUrl;
    const iconSize = div.getAttribute(attributeIconPxSize) || '20';
    image.style.height = image.style.width = iconSize + 'px';
    image.style.verticalAlign = 'middle';
    image.style.marginTop = '-2px';
    const locale = div.getAttribute(attributeLocale) || 'en';
    image.alt = getLocalizedString(locale);
    div.appendChild(image);
}

function renderMargin(div: HTMLDivElement) {
    const span = document.createElement('span');
    span.style.marginLeft = '8px';
    div.appendChild(span);
}

function renderText(div: HTMLDivElement) {
    const span = document.createElement('span');
    const locale = div.getAttribute(attributeLocale) || 'en';
    span.textContent = getLocalizedString(locale);
    div.appendChild(span);
}

function getLocalizedString(locale: string) {
    locale = locale.toLowerCase();

    // Look for the localization, if the language is supported.
    if (locs[locale]) {
        return locs[locale];
    }

    // Special case handling for Chinese, in which certain locales should resolve to Traditional Chinese, and
    // the others should resolve to Simplified Chinese.
    if (locale === 'zh-hk' || locale === 'zh-mo' || locale === 'zh-tw') {
        return locs['zh-hant'];
    }

    // Remove the subscript portion (or the region) portion of the locale, and check to see if the
    // localization exists for the resulting locale.
    locale = locale.substring(0, locale.lastIndexOf('-'));
    if (locs[locale]) {
        return locs[locale];
    }

    // Remove the region portion of the locale, and check to see if the localization exists for the resulting locale.
    locale = locale.substring(0, locale.lastIndexOf('-'));
    if (locs[locale]) {
        return locs[locale];
    }

    // If all else fails, show the string in English.
    return locs['en'];
}
