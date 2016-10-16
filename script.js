"use strict";

// constants
var personWidth = 40
var personHeight = 20
var childPad = 20
var siblingPad = 5
var svgPad = 3
var partnerShift = 10

var debug = false

var families = {}
var persons = {}

/*
 ----------------------------------------------------------------------
  Data Model
 ----------------------------------------------------------------------
*/

function Person(personId, name, gender, childOf, parentOf) {
    storePerson({
        "id": personId, "name": name, "gender": gender,
        "childOf": childOf, "parentOf": parentOf,
    })
}

function storePerson(person) {
    if (person.id == null || persons[person.id] != null) return
    if (person.name.length == 0) {
        person.name = "#" + person.id
    }
    person.childOf = canonicalizeMemberOf(person.childOf)
    person.parentOf = canonicalizeMemberOf(person.parentOf)
    persons[person.id] = person
    for (var i = 0; i < person.childOf.length; i++)
        getFamily(person.childOf[i]).children.push(person.id)
    for (var i = 0; i < person.parentOf.length; i++)
        getFamily(person.parentOf[i]).parents.push(person.id)
}

// ----------------------------------------------------------------------
// Getters

function getFamily(familyId) {
    if (families[familyId] == null)
        families[familyId] = {
            "id": familyId,
            "parents": [],
            "children": []}
    return families[familyId]
}

function getChildren(personId) {
    var person = persons[personId]
    var children = []
    for (var i = 0; i < person.parentOf.length; i++)
        children = children.concat(getFamily(person.parentOf[i]).children)
    return children
}

function getPartner(personId, familyId) {
    var family = families[familyId]
    for (var i = 0; i < family.parents.length; i++)
        if (family.parents[i] != personId) return family.parents[i]
    return null
}

function getBrothers(personId) {
    var parents = getParents(personId)
    var brothers = []
    for (var i = 0; i < parents.length; i++) {
        var children = getChildren(parents[i])
        for (var j = 0; j < children[j]; j++)
            if (children[j] != personId) brothers.push(children[j])
    }
    return brothers
}

function getPartners(personId) {
    var person = persons[personId]
    var partners = []
    for (var i = 0; i < person.parentOf.length; i++) {
        var family = getFamily(person.parentOf[i])
        for (var j = 0; j < family.parents.length; j++)
            if (family.parents[j] != personId)
                partners.push(family.parents[j])
    }
    return partners
}

function getParents(personId) {
    var person = persons[personId]
    var parents = []
    for (var i = 0; i < person.childOf.length; i++)
        parents = parents.concat(getFamily(person.childOf[i]).parents)
    return parents
}

function getCousins(personId) {
    // TODO: implement
    return []
}

// Return copy of source list with all duplicate elements removed.
function uniq(list) {
    var res = []
    for (var i = 0; i < list.length; i++){
        var alreadyIn = false
        for (var j = 0; j < res.length; j++)
            if (list[i] == res[j]) {
                alreadyIn = true
                break
            }
        if (!alreadyIn) res.push(list[i])
    }
    return res
}

function canonicalizeMemberOf(obj) {
    if (Array.isArray(obj)) return obj
    if (obj == null) return []
    return [obj]
}

/*
 ----------------------------------------------------------------------
  Navigation
 ----------------------------------------------------------------------
*/

function onPersonClick(personId) {
    render(personId)
}

/*
 ----------------------------------------------------------------------
  Dimensions calculation
 ----------------------------------------------------------------------
*/

// From person up to eldest ancestors.
function getParentsDimensions(personId) {
    var person = persons[personId]
    var dims = {x:0, y:0}
    for (var i = 0; i < person.childOf.length; i++) {
        if (getFamily(person.childOf[i]).parents.length == 0) continue
        var famDims = getParentsFamilyDimensions(person.childOf[i])
        if (0 < famDims.x && 0 < famDims.y) {
            dims.x = Math.max(dims.x, famDims.x + childPad)
            if (0 < dims.y) dims.y += siblingPad
            dims.y += famDims.y
        }
    }
    return dims
}

// From family up to eldest ancestors.
function getParentsFamilyDimensions(familyId) {
    var family = getFamily(familyId)
    var famDims = {x:0, y:0}
    if (family.parents.length == 0) return famDims
    var parBlockHeight = family.parents.length * personHeight
    for (var i = 0; i < family.parents.length; i++) {
        var grandDims = getParentsDimensions(family.parents[i])
        if (0 < famDims.y) famDims.y += siblingPad
        famDims = {
            x: Math.max(famDims.x, grandDims.x + personWidth),
            y: famDims.y + grandDims.y}
    }
    famDims.y = Math.max(famDims.y, parBlockHeight)
    return famDims
}

function getPersonDescendantsDimensions(personId) {
    var person = persons[personId]
    if (person.parentOf.length == 0) return {x:personWidth, y:personHeight}
    var dims = {x:0, y:0}
    for (var i = 0; i < person.parentOf.length; i++) {
        var famDims = getFamilyDescendantsDimensions(personId, person.parentOf[i])
        dims.x = Math.max(dims.x, famDims.x)
        if (0 < dims.y) dims.y += siblingPad
        dims.y += famDims.y
    }
    return dims
}

function getFamilyDescendantsDimensions(personId, familyId) {
    var famDims = {x: personWidth, y: personHeight}
    var partnerId = getPartner(personId, familyId)
    if (partnerId != null)
        famDims.y += personHeight
    var childrenDims = getChilrenDimensions(familyId)
    if (0 < childrenDims.x && 0 < childrenDims.y){
        famDims.x += childrenDims.x
        famDims.y = Math.max(famDims.y, childrenDims.y)
    }
    return famDims
}

function getParentOffset(personId, familyId) {
    var famDims = getFamilyDescendantsDimensions(personId, familyId)
    if (getPartner(personId, familyId) != null) {
        var childrenDims = getChilrenDimensions(familyId)
        if (childrenDims.y < famDims.y) return {x:0, y:0}
        if (childrenDims.y / 2 < 1.5 * personHeight)
            return {x:0, y:(childrenDims.y - 2 * personHeight) / 2}
    }
    return {x:0, y:(famDims.y - personHeight) / 2}
}

function getChilrenDimensions(familyId) {
    var family = getFamily(familyId)
    var dims = {x: 0, y: 0}
    if (0 < family.children.length) {
        dims.x += childPad
        var maxWidth = 0
        for (var i = 0; i < family.children.length; i++) {
            var child = family.children[i]
            if (0 < dims.y) dims.y += siblingPad
            var desDims = getPersonDescendantsDimensions(child)
            maxWidth = Math.max(maxWidth, desDims.x)
            dims.y += desDims.y
        }
        dims.x += maxWidth
    }
    return dims
}

function vAdd(v1, v2) {
    return {x: v1.x + v2.x, y: v1.y + v2.y}
}

/*
 ----------------------------------------------------------------------
  SVG Rendering
 ----------------------------------------------------------------------
*/

function render(personId) {
    hideContextMenu()
    var ancDims = getParentsDimensions(personId)
    var desDims = getPersonDescendantsDimensions(personId)
    var svg = document.getElementById("cnv")
    svg.innerHTML = ''
    var width = ancDims.x + desDims.x + svgPad * 2
    var height = Math.max(ancDims.y, desDims.y) + svgPad * 2
    svg.setAttribute("width", width)
    svg.setAttribute("height", height)
    renderPersonDescendants(
        personId,
        {x: svgPad + ancDims.x,
         y: svgPad + (height - desDims.y) / 2})
    renderPersonAncestors(
        personId,
        {x: svgPad, y: svgPad + (height - ancDims.y) / 2},
        {x: svgPad + ancDims.x, y: height / 2})
}

function renderPersonAncestors(personId, offset, childBind) {
    var person = persons[personId]
    var ancDims = getParentsDimensions(person.id)
    if (debug) renderGroup(offset, ancDims, "lime")
    var famHOffset = 0
    for (var i = 0; i < person.childOf.length; i++) {
        var family = getFamily(person.childOf[i])
        if (family.parents.length == 0) continue
        var famDims = getParentsFamilyDimensions(family.id)
        var famOffset = vAdd(offset, {x: ancDims.x - famDims.x - childPad, y: famHOffset})
        renderPersonAncestorsFamily(family.id, famOffset, childBind)
        famHOffset += famDims.y + siblingPad
    }
}

function renderPersonAncestorsFamily(familyId, offset, childBind) {
    var family = getFamily(familyId)
    var ancDims = getParentsFamilyDimensions(family.id)
    if (debug) renderGroup(offset, ancDims, "pink")
    var grandHOffset = 0
    var parHOffset = 0
    var parBlockHeight = family.parents.length * personHeight
    for (var j = 0; j < family.parents.length; j++) {
        var parent = persons[family.parents[j]]
        var parRectOffset = {
            x: offset.x + ancDims.x - personWidth,
            y: offset.y + ancDims.y / 2 - parBlockHeight / 2 + parHOffset}
        renderPersonRect(parent.id, parRectOffset)
        var grandDims = getParentsDimensions(parent.id)
        renderPersonAncestors(
            parent.id,
            {x: offset.x + ancDims.x - grandDims.x - personWidth, y: offset.y + grandHOffset},
            vAdd(parRectOffset, {x: 0, y: personHeight / 2}))
        grandHOffset += grandDims.y + siblingPad
        parHOffset += personHeight
    }
    if (childBind != null)
        renderLine(
            childBind.x, childBind.y,
            offset.x + ancDims.x, offset.y + ancDims.y / 2)
}

function renderPersonDescendants(personId, offset, parentBind) {
    var person = persons[personId]
    var isMainPerson = parentBind == null
    if (0 == person.parentOf.length) {
        if (parentBind != null)
            renderLine(
                parentBind.x, parentBind.y,
                offset.x, offset.y + personHeight / 2)
        renderPersonRect(personId, offset, {x: personWidth, y: personHeight}, isMainPerson)
        return
    }
    if (debug) {
        var personDims = getPersonDescendantsDimensions(personId)
        renderGroup(offset, personDims, "lime")
    }
    var hoffset = 0
    var lastPersonRectHOffset = 0
    for (var i = 0; i < person.parentOf.length; i++) {
        var family = getFamily(person.parentOf[i])
        var partnerId = getPartner(personId, family.id)
        var children = getFamily(family.id).children
        var famDims = getFamilyDescendantsDimensions(personId, family.id)
        var famOffset = vAdd(offset, {x: 0, y: hoffset})
        if (debug) renderGroup(famOffset, famDims, "magenta")
        var parentOffset = getParentOffset(personId, family.id)
        var parentAbs = vAdd(famOffset, parentOffset)
        if (0 < i) {
            renderLine(
                offset.x + partnerShift / 2, lastPersonRectHOffset + personHeight,
                offset.x + partnerShift / 2, parentAbs.y)
        }
        if (i == 0 && parentBind != null)
            renderLine(
                parentBind.x, parentBind.y,
                parentAbs.x, parentAbs.y + personHeight / 2)
        renderPersonRect(personId, parentAbs, null, isMainPerson)
        isMainPerson = false
        lastPersonRectHOffset = parentAbs.y
        if (partnerId != null) {
            renderPersonRect(
                partnerId,
                vAdd(vAdd(famOffset, parentOffset), {x: partnerShift, y: personHeight}),
                {x: personWidth - partnerShift, y: personHeight})
        }
        renderChildren(
            family.id,
            vAdd(famOffset, {x: personWidth + childPad, y: 0}),
            vAdd(parentAbs, {x: personWidth, y: personHeight / 2}))
        hoffset += famDims.y + siblingPad
    }
}

function renderChildren(familyId, offset, parentBind) {
    var family = getFamily(familyId)
    var chDims = getChilrenDimensions(familyId)
    var hoffset = 0
    if (debug) renderGroup(vAdd(offset, {x: -childPad, y: 0}), chDims)
    for (var i = 0; i < family.children.length; i++) {
        var childId = family.children[i]
        var childDims = getPersonDescendantsDimensions(childId)
        renderPersonDescendants(childId, vAdd(offset, {x: 0, y: hoffset}), parentBind)
        hoffset += childDims.y + siblingPad
    }
}

/*
 ----------------------------------------------------------------------
  Lowlevel rendering routines
 ----------------------------------------------------------------------
*/

var svgns = "http://www.w3.org/2000/svg"

function renderPersonRect(personId, offset, dims, isHighlighted) {
    var person = persons[personId]
    var svg = document.getElementById("cnv")
    var rect = document.createElementNS(svgns, "rect");
    if (dims == null) dims = {x: personWidth, y: personHeight}
    rect.setAttribute("x", offset.x);
    rect.setAttribute("y", offset.y);
    rect.setAttribute("rx", 5);
    rect.setAttribute("ry", 5);
    rect.setAttribute("width", dims.x);
    rect.setAttribute("height", dims.y);
    var strokeColor = "black"
    var strokeWidth = 1
    if (isHighlighted) {
        strokeColor = "navy"
        strokeWidth = 3
    }
    rect.setAttribute("stroke", strokeColor);
    rect.setAttribute("stroke-width", strokeWidth);
    rect.setAttribute("onclick", "onPersonClick('" + person.id + "')")
    rect.addEventListener("contextmenu", function(event) {
        showContextMenu(person.id, event)
    })
    if (person.gender == "m") {
        rect.setAttribute("fill", "#abcdef")
    }else{
        rect.setAttribute("fill", "#fedcba")
    }
    var text = document.createElementNS(svgns, "text");
    text.setAttribute("x", offset.x + 3);
    text.setAttribute("y", offset.y + dims.y - 5);
    text.setAttribute("onclick", "onPersonClick('" + person.id + "')")
    text.addEventListener("contextmenu", function(event) {
        showContextMenu(person.id, event)
    })
    text.innerHTML = person.name
    svg.appendChild(rect)
    svg.appendChild(text)
}

function renderLine(x1, y1, x2, y2) {
    var svg = document.getElementById("cnv")
    var line = document.createElementNS(svgns, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("style", "stroke:silver;stroke-width:2")
    svg.appendChild(line)
}

// Used for layout debugging.
function renderGroup(offset, dims, color) {
    var svg = document.getElementById("cnv")
    var rect = document.createElementNS(svgns, "rect")
    rect.setAttribute("x", offset.x)
    rect.setAttribute("y", offset.y)
    rect.setAttribute("rx", 5)
    rect.setAttribute("ry", 5)
    rect.setAttribute("width", dims.x)
    rect.setAttribute("height", dims.y)
    rect.setAttribute("stroke", "green")
    if (color == null) color = "pink"
    rect.setAttribute("style", "fill:none;stroke:" + color + ";stroke-width:0.5")
    svg.appendChild(rect)
}

// Used for debugging.
function log(msg) {
    setTimeout(function() { throw new Error(msg); }, 0);
}
