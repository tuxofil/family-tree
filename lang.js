/**
   Internationalization definitions for Family Tree visualizer.

   Author: Aleksey Morarash <aleksey.morarash@gmail.com>
   Copyright: 2016, Aleksey Morarash
   License: BSD
 */

"use strict";

var defaultLanguage = "en"

var langData = {
    en: {
        langName: "English",
        cmShowDetails: "Show detailed",
        cmBrothers: "Siblings",
        cmPartners: "Spouses",
        cmParents: "Parents",
        cmChildren: "Children",
        cmCousins: "Cousins",
        cmUncles: "Uncles",
        cmNephews: "Nephews",
    },
    ua: {
        langName: "Українська",
        cmShowDetails: "Показати детально",
        cmBrothers: "Брати та сестри",
        cmPartners: "Чоловіки/дружини",
        cmParents: "Батьки",
        cmChildren: "Діти",
        cmCousins: "Двоюрідні брати та сестри",
        cmUncles: "Дядьки та тітки",
        cmNephews: "Племінники",
    },
}

function getText(lang, textId) {
    var m = langData[lang]
    if (m == null) {
        // fallback to English
        m = langData.en
    }
    return m[textId]
}
