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
        language: "Language",
        cmShowDetails: "Show detailed",
        cmBrothers: "Siblings",
        cmPartners: "Spouses",
        cmParents: "Parents",
        cmChildren: "Children",
        cmCousins: "Cousins",
        cmUncles: "Uncles",
        cmNephews: "Nephews",
        noname: "unknown name",
        cmShowIcons: "Show pictures",
    },
    es: {
        langName: "Español",
        language: "Idioma",
        cmShowDetails: "Ver los detalles",
        cmBrothers: "Hermanos y hermanas",
        cmPartners: "Cónyuges",
        cmParents: "Padres",
        cmChildren: "Niños",
        cmCousins: "Primos",
        cmUncles: "Tíos",
        cmNephews: "Sobrinos",
        noname: "nombre desconocido",
        cmShowIcons: "Mostrar fotos",
    },
    ua: {
        langName: "Українська",
        language: "Мова",
        cmShowDetails: "Показати детально",
        cmBrothers: "Брати та сестри",
        cmPartners: "Чоловіки/дружини",
        cmParents: "Батьки",
        cmChildren: "Діти",
        cmCousins: "Двоюрідні брати та сестри",
        cmUncles: "Дядьки та тітки",
        cmNephews: "Племінники",
        noname: "ім’я невідоме",
        cmShowIcons: "Показувати фото",
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
