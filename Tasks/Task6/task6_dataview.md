## Add a data view to our application

This task will add a data table to our application

### Steps
1. Add Bootstrap Table to our application
2. Add a table to the page
3. Add a function to push the GeoJSON from CartoDB to the table

#### Step 1

[Bootstrap Table](http://bootstrap-table.wenzhixin.net.cn/) is one of the most popular add-ons to Bootstrap, it allows you to add data from local and remote sources, add search, add paignation and many other features. Here we will add it to give a further dimension to our application.

First we need to add both the CSS and JS libraries to our HTML like we have done before. This time we will use the CDN versions rather than local files. So add the following in the correct places:

`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.10.1/bootstrap-table.min.css">`

`<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.10.1/bootstrap-table.min.js"></script>`

#### Step 2

Next we need to add a table to the HTML so that we can display the data. Add the following below the map-container.

```html
<div id="table-container">
  <table id="table" data-pagination="true" data-page-size="5">
        <thead>
        <tr>
            <th data-field="surgery_na" data-sortable="true">Name</th>
            <th data-field="total_doct">Total Doctors</th>
            <th data-field="total_pati">Total Patients</th>
            <th data-field="ratio">Ratio</th>
        </tr>
        </thead>
    </table>
</div>
```

Here we add a container to contain a table with id of 'table' (we need to know this for later). Next we add a table header and set each one to the data they will receive from the GeoJSON. For example, surgery_na is the attribute name found in the data, but to make it more readable we actually give the table column name as 'Name'. We have also added pagination to the table as we know our data is quite larger the pagination gives us a way for the user to navigate through pages of results rather than one big table.

As we are adding an extra element to our page I have tweaked the map div to sit in its own container and have already amended the CSS accordingly.

So we now have a table we now need to add some Javascript to populate the table with data

#### Step 3

To get the table populated we need to wait until our application has received the response from CartoDB as GeoJSON and then fire a function to parse the data and load into the table.

Knowing this replace the sql code to the following:

```javascript
sql.execute("select * from gp_data")
  .done(function(geojson) {
      gpLocations.addData(geojson);
      markers.addLayer(gpLocations);
      markers.addTo(map);
      createTable(geojson);
  });
```

The extra line here invokes the createTable function sending the geojson to it.

Next we need to write the function:

```javascript
function createTable(geojson) {
  var array = [];
  for (var i = 0; i < geojson.features.length; i++) {
    array.push(geojson.features[i].properties);
  }
  $('#table').bootstrapTable({data: array});
}
```

In this function we loop through each of the geojson features and push the properties to a new array called 'array' and then finally set our #table to that new array.

![Task 6 Table](./screenshots/task6_table.png)

Not much code for doing so much thanks to Bootstrap Table.
