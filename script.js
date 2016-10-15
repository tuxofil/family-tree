// constants
var personWidth = 30
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

function Person(id, name, gender, childOf, parentOf) {
    var person = persons[id]
    if (person != null) {
        return
    }
    if (name.length == 0) name = id
    person = {
        "id": id,
        "name": name,
        "gender": gender,
        "childOf": canonicalizeMemberOf(childOf),
        "parentOf": canonicalizeMemberOf(parentOf),
    }
    persons[id] = person
    for (var i = 0; i < person.childOf.length; i++) {
        getFamily(person.childOf[i]).children.push(id)
    }
    for (var i = 0; i < person.parentOf.length; i++) {
        getFamily(person.parentOf[i]).parents.push(id)
    }
}

// ----------------------------------------------------------------------
// Getters

function getFamily(id) {
    var family = families[id]
    if (family == null) {
        family = {
            "id": id,
            "parents":[],
            "children":[],
        }
        families[id] = family
    }
    return family
}

function hasChildren(id) {
    var person = persons[id]
    for (var i = 0; i < person.parentOf.length; i++) {
        var family = getFamily(person.parentOf[i])
        if (0 < family.children.length) return true
    }
    return false
}

function getChildren(id) {
    var person = persons[id]
    var children = []
    for (var i = 0; i < person.parentOf.length; i++) {
        children = children.concat(getFamily(person.parentOf[i]).children)
    }
    return children
}

function getPartner(personId, familyId) {
    var family = families[familyId]
    for (var i = 0; i < family.parents.length; i++) {
        var parent = family.parents[i]
        if (parent != personId) {
            return parent
        }
    }
    return null
}

function canonicalizeMemberOf(obj) {
    if (Array.isArray(obj)) {
        return obj
    }
    if (obj == null) {
        return []
    }
    return [obj]
}

/*
 ----------------------------------------------------------------------
  Dimensions calculation
 ----------------------------------------------------------------------
*/

function getPersonDimensions(id) {
    var person = persons[id]
    if (person.parentOf.length == 0) return [personWidth, personHeight]
    var dims = [0, 0]
    for (var i = 0; i < person.parentOf.length; i++) {
        var famDims = getFamilyDimensions(id, person.parentOf[i])
        dims[0] = Math.max(dims[0], famDims[0])
        if (0 < dims[1]) dims[1] += siblingPad
        dims[1] += famDims[1]
    }
    return dims
}

function getFamilyDimensions(personId, familyId) {
    var famDims = [personWidth, personHeight]
    var partnerId = getPartner(personId, familyId)
    if (partnerId != null)
        famDims[1] += personHeight
    var childrenDims = getChilrenDimensions(familyId)
    if (0 < childrenDims[0] && 0 < childrenDims[1]){
        famDims[0] += childrenDims[0]
        famDims[1] = Math.max(famDims[1], childrenDims[1])
    }
    return famDims
}

function getParentOffset(personId, familyId) {
    var famDims = getFamilyDimensions(personId, familyId)
    if (getPartner(personId, familyId) != null) {
        var childrenDims = getChilrenDimensions(familyId)
        if (childrenDims[1] < famDims[1]) return [0, 0]
        if (childrenDims[1] / 2 < 1.5 * personHeight) {
            return [0, (childrenDims[1] - 2 * personHeight) / 2]
        }
        return [0, (famDims[1] - personHeight) / 2]
    }
    return [0, famDims[1] / 2 - personHeight / 2]
}

function getChilrenDimensions(id) {
    var family = getFamily(id)
    var w = 0
    var h = 0
    if (0 < family.children.length) {
        w += childPad
        var mw = 0
        for (var i = 0; i < family.children.length; i++) {
            var child = family.children[i]
            if (0 < h) h += siblingPad
            var cd = getPersonDimensions(child)
            if (mw < cd[0]) mw = cd[0]
            h += cd[1]
        }
        w += mw
    }
    return [w, h]
}

function vAdd(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]]
}

/*
 ----------------------------------------------------------------------
  SVG Rendering
 ----------------------------------------------------------------------
*/

var svgns = "http://www.w3.org/2000/svg"

function render(personId) {
    var dims = getPersonDimensions(personId)
    var svg = document.getElementById("cnv")
    svg.setAttribute("width", dims[0] + svgPad * 2)
    svg.setAttribute("height", dims[1] + svgPad * 2)
    renderPerson(personId, [svgPad, svgPad])
}

function renderPerson(id, offset, parentBind) {
    var person = persons[id]
    if (0 == person.parentOf.length) {
        if (parentBind != null)
            renderLine(
                parentBind[0], parentBind[1],
                offset[0], offset[1] + personHeight / 2)
        renderPersonRect(id, offset, [personWidth, personHeight])
        return
    }
    if (debug) {
        var personDims = getPersonDimensions(id)
        renderGroup(offset, personDims, "lime")
    }
    var hoffset = 0
    var lastPersonRectHOffset = 0
    for (var i = 0; i < person.parentOf.length; i++) {
        var family = getFamily(person.parentOf[i])
        var partnerId = getPartner(id, family.id)
        var children = getFamily(family.id).children
        var famDims = getFamilyDimensions(id, family.id)
        var famOffset = vAdd(offset, [0, hoffset])
        if (debug) renderGroup(famOffset, famDims, "magenta")
        var parentOffset = getParentOffset(id, family.id)
        var parentAbs = vAdd(famOffset, parentOffset)
        if (0 < i) {
            renderLine(
                offset[0] + partnerShift / 2, lastPersonRectHOffset + personHeight,
                offset[0] + partnerShift / 2, parentAbs[1])
        }
        if (i == 0 && parentBind != null)
            renderLine(
                parentBind[0], parentBind[1],
                parentAbs[0], parentAbs[1] + personHeight / 2)
        renderPersonRect(id, parentAbs)
        lastPersonRectHOffset = parentAbs[1]
        if (partnerId != null) {
            renderPersonRect(
                partnerId,
                vAdd(vAdd(famOffset, parentOffset), [partnerShift, personHeight]),
                [personWidth - partnerShift, personHeight])
        }
        renderChildren(
            family.id,
            vAdd(famOffset, [personWidth + childPad, 0]),
            vAdd(parentAbs, [personWidth, personHeight / 2]))
        hoffset += famDims[1] + siblingPad
    }
}

function renderChildren(familyId, offset, parentBind) {
    var family = getFamily(familyId)
    var chDims = getChilrenDimensions(familyId)
    var hoffset = 0
    if (debug) renderGroup(vAdd(offset, [-childPad, 0]), chDims)
    for (var i = 0; i < family.children.length; i++) {
        var childId = family.children[i]
        var childDims = getPersonDimensions(childId)
        renderPerson(childId, vAdd(offset, [0, hoffset]), parentBind)
        hoffset += childDims[1] + siblingPad
    }
}

// ----------------------------------------------------------------------
// rendering routines

function renderPersonRect(id, offset, dims) {
    var person = persons[id]
    var svg = document.getElementById("cnv")
    var rect = document.createElementNS(svgns, "rect");
    if (dims == null) dims = [personWidth, personHeight]
    rect.setAttribute("x", offset[0]);
    rect.setAttribute("y", offset[1]);
    rect.setAttribute("rx", 5);
    rect.setAttribute("ry", 5);
    rect.setAttribute("width", dims[0]);
    rect.setAttribute("height", dims[1]);
    rect.setAttribute("stroke", "green");
    if (person.gender == "m") {
        rect.setAttribute("fill", "#abcdef")
    }else{
        rect.setAttribute("fill", "#fedcba")
    }
    var text = document.createElementNS(svgns, "text");
    text.setAttribute("x", offset[0] + 3);
    text.setAttribute("y", offset[1] + dims[1] - 5);
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

function renderGroup(offset, dims, color) {
    var svg = document.getElementById("cnv")
    var rect = document.createElementNS(svgns, "rect")
    rect.setAttribute("x", offset[0])
    rect.setAttribute("y", offset[1])
    rect.setAttribute("rx", 5)
    rect.setAttribute("ry", 5)
    rect.setAttribute("width", dims[0])
    rect.setAttribute("height", dims[1])
    rect.setAttribute("stroke", "green")
    if (color == null) color = "pink"
    rect.setAttribute("style", "fill:none;stroke:" + color + ";stroke-width:0.5")
    svg.appendChild(rect)
}

function log(msg) {
    setTimeout(function() { throw new Error(msg); }, 0);
}
