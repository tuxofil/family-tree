/**
   Context menu for persons in family tree.

   Thanks to Nick Salloum and his article at
     https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/

   Author: Aleksey Morarash <aleksey.morarash@gmail.com>
   Copyright: 2016, Aleksey Morarash
   License: BSD
 */

"use strict";

var subMenus = ["cmsBrothers", "cmsPartners", "cmsParents", "cmsChildren",
                "cmsCousins", "cmsUncles", "cmsNephews"]

window.onkeyup = function(event) {
    if (event.keyCode === 27) hideContextMenu()
}

document.addEventListener("click", function(event) {
    var button = event.which || event.button
    if (button === 1) hideContextMenu()
})

function showContextMenu(personId, event) {
    event.preventDefault()
    hideContextMenu()
    var cursorPos = getPosition(event)
    var menu = document.getElementById("contextMenu")
    setPos(menu, cursorPos)
    var person = persons[personId]
    var cmDetailed = document.getElementById("cmiDetailed")
    if (person.url != null && 0 < person.url.length) {
        setCMActive(cmDetailed, true)
        cmDetailed.innerHTML = "<a href=\"" + person.url + "\" target=\"_blank\">" +
            getText(currentLanguage, "cmShowDetails") + "</a>"
    }else{
        setCMActive(cmDetailed, false)
        cmDetailed.innerHTML = getText(currentLanguage, "cmShowDetails")
    }
    setupSubMenu("Brothers", getBrothers(personId))
    setupSubMenu("Partners", getPartners(personId))
    setupSubMenu("Parents", getParents(personId))
    setupSubMenu("Children", getChildren(personId))
    setupSubMenu("Cousins", getCousins(personId))
    setupSubMenu("Uncles", getUncles(personId))
    setupSubMenu("Nephews", getNephews(personId))
    menu.style.display = "block"
    var menuDims = {x: menu.offsetWidth, y: menu.offsetHeight}
    var itemHeight = menuDims.y / menu.childElementCount
    for (var i = 0; i < subMenus.length; i++){
        var coords = vAdd(cursorPos, {x: menuDims.x,
                                      y: itemHeight * (i + 1)})
        setPos(document.getElementById(subMenus[i]), coords)
    }
    // setup settings menu
    var langMenu = document.getElementById("cmiLanguage")
    langMenu.innerHTML = getText(currentLanguage, "language")
    langMenu.setAttribute("onmouseover", "showLanguagesSubMenu()")
    var langs = document.getElementById("cmsLanguage")
    langs.innerHTML = ""
    for (var lang in langData) {
        if (langData.hasOwnProperty(lang)){
            var langName = langData[lang]["langName"]
            langs.innerHTML += "<div class='cmActive' onclick='setLang(\"" + lang + "\")'>" +
                langName + "</div>"
        }
    }
    setPos(langs, vAdd(cursorPos, {x: menuDims.x, y: itemHeight * 9}))
}

function showLanguagesSubMenu() {
    hideSubMenus()
    document.getElementById("cmsLanguage").style.display = "block"
}

function setupSettingsMenu() {
    var langMenu = document.getElementById("cmiLanguage")
    langMenu.innerHTML = getText(currentLanguage, "language")
    langMenu.setAttribute("onmouseover", "showLanguagesSubMenu()")
    var langs = document.getElementById("cmsLanguage")
    langs.innerHTML = ""
    for (var lang in langData) {
        if (langData.hasOwnProperty(lang))
            langs.innerHTML += "<div class='cmActive'>" + langData[lang]["langName"] + "</div>"
    }
    var showIcons = document.getElementById("cmiShowIcons")
    showIcons.setAttribute("onmouseover", "hideSubMenus()")
    var showIconsCheckBox = document.getElementById("cbShowIcons")
    showIconsCheckBox.setAttribute("onchange", "applyShowIcons()")
    showIconsCheckBox.checked = useIcons
    var showIconsLabel = document.getElementById("cmlShowIcons")
    showIconsLabel.innerHTML = getText(currentLanguage, "cmShowIcons")
}

function localizeContextMenu() {
    var t = [
        ["cmiDetailed", "cmShowDetails"],
        ["cmiBrothers", "cmBrothers"],
        ["cmiPartners", "cmPartners"],
        ["cmiParents",  "cmParents"],
        ["cmiChildren", "cmChildren"],
        ["cmiCousins",  "cmCousins"],
        ["cmiUncles",   "cmUncles"],
        ["cmiNephews",  "cmNephews"],
    ]
    for (var i = 0; i < t.length; i++)
        document.getElementById(t[i][0]).innerHTML = getText(currentLanguage, t[i][1])
}

function showSubMenu(name) {
    hideSubMenus()
    document.getElementById("cms" + name).style.display = "block"
}

function setupSubMenu(name, personIds) {
    personIds = uniq(personIds)
    var cmItem = document.getElementById("cmi" + name)
    setCMActive(cmItem, 0 < personIds.length)
    if (0 < personIds.length) {
        cmItem.setAttribute("onmouseover", "showSubMenu('" + name + "')")
    } else {
        cmItem.setAttribute("onmouseover", "hideSubMenus()")
    }
    var cmsItem = document.getElementById("cms" + name)
    cmsItem.innerHTML = ""
    personIds = personIds.sort(function (a, b) {
        if (getLongName(a) < getLongName(b)) return -1
        if (getLongName(a) > getLongName(b)) return 1
        return 0
    })
    for (var i = 0; i < personIds.length; i++) {
        var name = getLongName(personIds[i])
        if (name == null || name.length == 0)
            name = "&lt;" + getText(currentLanguage, "noname") + "&gt;"
        cmsItem.innerHTML += "<div class='cmActive' onclick='onPersonClick(\"" +
            personIds[i] + "\")'>" + name + "</div>"
    }
}

function setCMActive(element, active) {
    if (active) {
        element.className = "cmActive"
    } else {
        element.className = "cmInactive"
    }
}

function hideContextMenu() {
    hideSubMenus()
    document.getElementById("contextMenu").style.display = "none"
}

function hideSubMenus() {
    for (var i = 0; i < subMenus.length; i++)
        document.getElementById(subMenus[i]).style.display = "none"
    document.getElementById("cmsLanguage").style.display = "none"
}

function setPos(elem, coords) {
    elem.style.left = coords.x + "px"
    elem.style.top = coords.y + "px"
}

function getPosition(event) {
    if (!event) event = window.event;
    if (event.pageX || event.pageY) {
        return {x: event.pageX, y: event.pageY}
    } else if (event.clientX || event.clientY)
        return {
            x: event.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft,
            y: event.clientY + document.body.scrollTop +
                document.documentElement.scrollTop}
    return {x: 0, y: 0}
}
