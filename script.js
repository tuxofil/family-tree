// constants
var personWidth = 30
var personHeight = 20
var childPad = 20
var siblingPad = 5
var svgPad = 3

var families = {}
var persons = {}

/*
 ----------------------------------------------------------------------
  Data Model
 ----------------------------------------------------------------------
*/

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

function getFamilyDimensions(id) {
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

function getPersonDimensions(id) {
    var person = persons[id]
    var d = [personWidth, personHeight]
    if(person.parentOf != null){
        var famDim = getFamilyDimensions(person.parentOf)
        if (famDim != null){
            d[0] += famDim[0]
            d[1] = famDim[1]
        }
    }
    return d
}

function hasChildren(id) {
    var person = persons[id]
    if (person.parentOf != null) {
        var family = getFamily(person.parentOf)
        return 0 < family.children.length
    }
    return false
}

function Person(id, name, gender, childOf, parentOf) {
    var person = persons[id]
    if (person != null) {
        return
    }
    person = {
        "id": id,
        "name": name,
        "gender": gender,
        "childOf": childOf,
        "parentOf": parentOf,
    }
    persons[id] = person
    if (childOf != null) {
        getFamily(childOf).children.push(id)
    }
    if (parentOf != null) {
        getFamily(parentOf).parents.push(id)
    }
}

/*
 ----------------------------------------------------------------------
  SVG Rendering
 ----------------------------------------------------------------------
*/

function render(personId) {
    var dims = getPersonDimensions(personId)
    var svg = document.getElementById("cnv")
    svg.setAttribute("width", dims[0] + svgPad * 2)
    svg.setAttribute("height", dims[1] + svgPad * 2)
    renderTree(personId, [svgPad, dims[1] / 2 - personHeight / 2 + svgPad])
}

function renderTree(personId, offset){
    renderPerson(personId, offset)
    if (!hasChildren(personId)) {
        return
    }
    dims = getPersonDimensions(personId)
    var foffset = [offset[0] + personWidth + childPad, offset[1]]
    renderFamily(persons[personId].parentOf, foffset)
}

var svgns = "http://www.w3.org/2000/svg"

function renderPerson(id, offset) {
    var person = persons[id]
    var svg = document.getElementById("cnv")
    var rect = document.createElementNS(svgns, "rect");
    rect.setAttribute("x", offset[0]);
    rect.setAttribute("y", offset[1]);
    rect.setAttribute("rx", 5);
    rect.setAttribute("ry", 5);
    rect.setAttribute("width", personWidth);
    rect.setAttribute("height", personHeight);
    rect.setAttribute("stroke", "green");
    if (person.gender == "m") {
        rect.setAttribute("fill", "#abcdef")
    }else{
        rect.setAttribute("fill", "#fedcba")
    }
    var text = document.createElementNS(svgns, "text");
    text.setAttribute("x", offset[0] + 3);
    text.setAttribute("y", offset[1] + personHeight - 5);
    text.innerHTML = person.name
    svg.appendChild(rect)
    svg.appendChild(text)
}

function renderFamily(id, offset) {
    var svg = document.getElementById("cnv")
    var family = getFamily(id)
    var famDims = getFamilyDimensions(id)
    var hoffset = offset[1] - famDims[1] / 2
    for (var i = 0; i < family.children.length; i++) {
        var child = family.children[i]
        var childDims = getPersonDimensions(child)
        renderTree(child, [offset[0], hoffset + childDims[1] / 2])
        var line = document.createElementNS(svgns, "line");
        line.setAttribute("x1", offset[0] - childPad);
        line.setAttribute("y1", offset[1] + personHeight / 2);
        line.setAttribute("x2", offset[0]);
        line.setAttribute("y2", hoffset + childDims[1] / 2 + personHeight / 2);
        line.setAttribute("style", "stroke:silver;stroke-width:2")
        svg.appendChild(line)
        hoffset += childDims[1] + siblingPad
    }
}
