/**
   Context menu for persons in family tree.

   Thanks to Nick Salloum and his article at
     https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/

   Author: Aleksey Morarash <tuxofil@gmail.com>
 */

"use strict";

var subMenus = ["cmsBrothers", "cmsPartners", "cmsParents", "cmsChildren", "cmsCousins"]

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
    setCMActive(cmDetailed, person.url != null)
    setupSubMenu("Brothers", getBrothers(personId))
    setupSubMenu("Partners", getPartners(personId))
    setupSubMenu("Parents", getParents(personId))
    setupSubMenu("Children", getChildren(personId))
    setupSubMenu("Cousins", getCousins(personId))
    menu.style.display = "block"
    var menuDims = {x: menu.offsetWidth, y: menu.offsetHeight}
    for (var i = 0; i < subMenus.length; i++){
        var coords = vAdd(cursorPos, {x: menuDims.x,
                                      y: menuDims.y / menu.childElementCount * (i + 1)})
        setPos(document.getElementById(subMenus[i]), coords)
    }
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
    for (var i = 0; i < personIds.length; i++) {
        var person = persons[personIds[i]]
        cmsItem.innerHTML += "<div class='cmActive' onclick='onPersonClick(\"" +
            person.id + "\")'>" + person.name + "</div>"
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