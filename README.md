# Family Tree Visualizer

## Summary

A JavaScript utility to draw family tree on a static HTML page, from a JS structure in `persons.js` such as [Web Report plugin](https://github.com/tuxofil/gramps-webreltree) for
 [Gramps](https://gramps-project.org/).

Key features:

* show descendants and ancestors;
* show all generations;
* nodes interactively selectable to display a person's picture and other details;
* quick switching between closest relatives with context menus;
* display person's picture, dates of birth and/or death (normal mode);
* hide pictures and dates in compact mode to fit more nodes on the screen;
* fully client-side generation (no HTTP server needed);
* free to use and modify (see License section).

Known issues:

* wide screen is recommended to view large trees (three or more generations);
* users of mobile devices can find it difficult to access context menus.

## Data model description

Input data for Visualizer are stored in ``persons.js``. It must define two variables:

* `personsSource`: a list of objects. Each object corresponds to a person in the database (see below);
* `startPersonId`: ID of the person to select by default.

### Person object fields description

The only mandatory field is `id`.

* `id`: person's unique identifier;
* `name`: person's name, shown on the generated tree;
* `fullname`: person's full name, shown only in context menus. If not defined, the value of `name` field
 will be shown instead;
* `gender`: `"m"` (male) or `"f"` (female). Used to select a default, generic picture (if no real picture is available via `icon` parameter);
* `icon`: URL of a person's picture. Note that the picture will be shown resized; for best results, use
 a face portrait in 3:4 aspect ratio. When not set, a standard male/female/unknown gender
 icon will be shown;
* `url`: link to a web page with detailed information about this person.
 When set, it will appear in the context menu;
* `bdate`: date of birth, as "YYYY-MM-DD". When month and/or day are unknown, zeros should be used (e.g., "YYYY-MM-00" or "YYYY-00-00");
* `ddate`: date of death. See `bdate` field for format description;
* `childOf`: a list of *family identifiers*, each denoting a partnership where this person was raised as a child;
* `parentOf`: a list of family identifiers where this person entered into a partnership.

Note: you can freely choose any string as a family ID. They can intersect with person IDs
safely because person IDs and family IDs use different scopes.

## Example

```
// persons.js

var personsSource = [
    {"id": "p1",
     "name": "Santiago Perez",
     "gender": "m",
     "fullname": "",
     "icon": "example-pictures/01.png",
     "url": "https://en.wikipedia.org/wiki/Santiago_(name)",
     "bdate": "1937-01-02",
     "ddate": "1973-02-03",
     "childOf": ["f100","f103"],
     "parentOf": ["f1"]},
     // ...
];

var startPersonId = "p1";
```

## License

BSD, two clause license.
