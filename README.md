# Family Tree Visualizer

## Summary

Draw family relations between persons on a static HTML page.

Key features:

* show descendants and ancestors of any of stored persons;
* show all available generations;
* you can choose any person as a main person for view;
* quick switch between nearest relatives with context menus;
* in normal mode can show photo, birth and/or death dates;
* compact mode: photos and dates are not shown but much more people can fit your window;
* no HTTP server needed to use;
* once published on a HTTP server, whole page can be safely saved for local use;
* it is free to use and change (see License section).

Known disadvantages:

* wide screen is recommended to view large trees (three and more generations);
* users of mobile devices can face problems accessing context menus.

## Data model description

Input data for Visualizer are stored in ``persons.js``. It contains definition
of two required variables:

* personsSource - list of objects. Each object corresponds to a person in the database.
 Format of the object will be described below;
* startPersonId - ID of the person to show as main by default.

### Person object fields description

* id - the only mandatory field. Any string which will identify the person from others;
* name - person name shown on the graph. Optional;
* fullname - full person name, shown only in context menus. Optional. Value of 'name' field
 will be shown if not defined;
* gender - "m" (male) or "f" (female). Optional. If not defined, person will be drawn
 as unknown gender;
* icon - url of the person picture. Optional. Note the photo will be shown resized, so
 the best kind of photo is only face with 3x4 ratio. When not set, standard male/female/unknown
 icon will be shown;
* url - link to web page with detailed information about the person. Optional.
 When set, available from context menu;
* bdate - birth date of format "YYYY-MM-DD". Optional. When month and/or day are unknown,
 use "YYYY-MM-00" or "YYYY-00-00" format;
* ddate - death date. Optional. See ``bdate`` field for format description;
* childOf - list of family identifiers where the person was grown up;
* parentOf - list of family identifiers where the person is a spouse.

Note: you can freely choose any strings as a family ID. They can intersect with person IDs
safely because person IDs and family IDs use different scopes.

## Example

```
git clone https://github.com/tuxofil/family-tree.git
```

and open family-tree/index.html in any modern browser with JavaScript support.

## Integration with 3dparty software

* [Web Report plugin](https://github.com/tuxofil/gramps-webreltree) for
 [Gramps](https://gramps-project.org/) - generates ``persons.js`` file for the Visualizer.

## License

BSD, two clause license.
