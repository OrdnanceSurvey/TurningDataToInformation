## Add search to our application

This task will walk you through how to add a search box to query OS Names API to find locations and postcodes.

### Steps
1. Add Twitter Typeahead to our app
2. Configure Typeahead and Bloodhound to query OS Names API
3. On clicking a location, zoom to map and run NEAREST, DISTANCE and COUNT

#### Step 1
Add the following script to your HTML *after* your bootstrap script.
```html
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/typeahead.bundle.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js"></script>
```
Then add an input with the typeahead class to your navbar where your previous ```navbar-header``` div is closed.
```html
<div class="navbar-header navbar-right">
  <input class="typeahead" type="text" placeholder="Search" class="typeahead">
</div>
```
Lastly add the following CSS to your ```<style>``` tag:
```css
.typeahead,
.tt-query,
.tt-hint {
    border: 1px solid #d6d6d6;
    height: 30px;
    line-height: 15px;
    outline: medium none;
    padding: 4px 6px;
    padding-right: 30px;
    width: 220px;
    font-size: 10pt;
    color: #000;
}

.typeahead {
    background-color: #FFFFFF;
    margin-top: 10px;
}

.typeahead:focus {
    border: 1px solid rgb(215, 215, 215);
}

.tt-query {
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset;
}

.tt-hint {
    color: #000;
}

.tt-menu {
    right: -15px;
    background-color: #FFFFFF;
    padding: 4px 0;
    width: 320px;
    height: auto;
    overflow: none;
}

.tt-suggestion {
    background-color: #FFFFFF;
    font-size: 14px;
    height: 80px;
    padding-left: 10px;
    padding-right: 10px;
    vertical-align: middle;
}

.tt-suggestion:hover {
    background-color: #F5F5F5;
    color: rgba(0, 153, 206, 0.7);
    cursor: pointer;
}

.tt-suggestion p {
    margin: 0;
}

.typeahead-header {
    margin: 0 5px 5px 5px;
    padding: 3px 0;
    border-bottom: 2px solid #333;
}
```
#### Step 2
Now we need to configure Typeahead to use the OS Names API.
First we need to construct a new Bloodhound suggestion engine (insert this into your ```<script>``` tags):
```javascript
var gazSearch = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: 'https://api.ordnancesurvey.co.uk/opennames/v1/find?query=%QUERY&key=***REMOVED***',
        wildcard: '%QUERY',
        filter: function(json) {
            uri = decodeURIComponent(json.header.uri);
            var datums = [];
            for (var i = 0; i < json.results.length; i++) {
                var result = json.results[i];
                var datum = {};
                if (result.GAZETTEER_ENTRY.hasOwnProperty('NAME2')) {
                    datum.value = result.GAZETTEER_ENTRY.NAME1 +
                        ', ' + result.GAZETTEER_ENTRY.NAME2;
                } else {
                    datum.value = result.GAZETTEER_ENTRY.NAME1;
                }
                datum.GEOMETRY_X = result.GAZETTEER_ENTRY.GEOMETRY_X;
                datum.GEOMETRY_Y = result.GAZETTEER_ENTRY.GEOMETRY_Y;
                datum.SCALE = result.GAZETTEER_ENTRY.MOST_DETAIL_VIEW_RES * 2;
                datum.TYPE = result.GAZETTEER_ENTRY.TYPE;

                datum.MBR_XMIN = result.GAZETTEER_ENTRY.MBR_XMIN;
                datum.MBR_YMIN = result.GAZETTEER_ENTRY.MBR_YMIN;
                datum.MBR_XMAX = result.GAZETTEER_ENTRY.MBR_XMAX;
                datum.MBR_YMAX = result.GAZETTEER_ENTRY.MBR_YMAX;

                if (result.GAZETTEER_ENTRY.hasOwnProperty('DISTRICT_BOROUGH')) {
                    datum.LOCALE = result.GAZETTEER_ENTRY.DISTRICT_BOROUGH;
                } else {
                    datum.LOCALE = result.GAZETTEER_ENTRY.COUNTY_UNITARY;
                }
                datums.push(datum);
            }
            return datums;
        }
    }
});
// Initialize the Bloodhound suggestion engine
gazSearch.initialize();
```
This creates and initializes the suggestion engine. With it we will call the OS Names API and constructs an object that we can use to change the focus of the map.

For now, lets continue to build the functionality, and configure what is displayed by the browser, insert the below snippet into your code:
```javascript
$('.typeahead').typeahead(null, {
    displayKey: 'value',
    source: gazSearch.ttAdapter(),
    templates: {
        suggestion: Handlebars.compile('<div><br><strong>{{value}}</strong><br>{{LOCALE}}<br></div>')
    }
});
```
This is setting out that we want to use ``datum.value`` as the display key (this is what will auto-complete into our ``input`` element). Then we set up a template for our suggestions. We're using handlebars here as a template renderer, and this allows us to access our ``datum`` keys with relative ease.

Now if you start typing, you will notice that the results are off the page. We need to do a bit of correction to the inline css of the typeahead ``tt-menu``. To do this just place:
```javascript
$('.tt-menu').prop('style').removeProperty('left');
$('.tt-menu').css('right', '0px');
```
Below your Typeahead UI code.

#### Step 3
Now we want to be able to re-center and zoom the map when we click on a result, in order to do this we will need to use a library to convert coordinates for us, as the OS Open Names API uses British National Grid, and cartodb and leaflet use WGS84 for coordinate references.

We're going to go with Proj4js in this exercise but there are many alternatives that you can use.

To start place the following script with the others.
```html
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.14/proj4.js"></script>
```

We then need to declare our coordinate reference definitions in javascript, you can find plenty on http://spatialreference.org.
Just insert the followingwng into your JavaScript:
```javascript
var bng = '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs';
```

Now the fun part!
We need to tell our map to *move* and *zoom* when we click an item in our results. We do this by using an event listener on the `typeahead` class.
It will sit there quietly waiting until we `select` an item from the list, then it will execute the code. The bit that does the hard work for us is the `proj4` function. We need to use the `inverse` method to transform from `bng` to WGS84 - notice we do not need to define or state WGS84 anywhere in our code. This is built in to `proj4` and implied when only one projection is given to the function.

```javascript
$('.typeahead').on('typeahead:selected', function(event, datum) {
    if (datum.MBR_XMIN !== undefined) {
      var bottomLeft = proj4(bng).inverse([datum.MBR_XMIN, datum.MBR_YMIN]);
      var topRight = proj4(bng).inverse([datum.MBR_XMAX, datum.MBR_YMAX]);
      map.fitBounds([
        [bottomLeft[1], bottomLeft[0]],
        [topRight[1], topRight[0]]
      ]);
    } else {
      var newCenter = proj4(bng).inverse([datum.GEOMETRY_X, datum.GEOMETRY_Y]);
      map.setView([newCenter[1], newCenter[0]], 18);
    }
    $('#gazSearch .typeahead').typeahead('val', '');
});
```

## WOAH
Load it up and see how it looks!!
