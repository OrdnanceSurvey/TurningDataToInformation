## Turning Data To Information

This is a self paced workshop to turn data released from Health and Social Care Information Centre (HSCIC) into information using open source tools. The purpose of it is to gently walk the user through using different tools with the end result being a web mapping application for finding your nearest GP and seeing the number of doctors, patients and the distance from a location specified.

### Tasks
1. Process the data

  In this task we will take the released data from HSCIC and add XY coordinates by using OS Names API, which is one of Ordnance Survey's APIs which contains all postcodes and their Easting and Northings. For this we will use NodeJS and a number of npm modules that will help us read and process the data.

2. Visualise the data in QGIS

  We will open the data (a CSV file) in QGIS and then style the data and visualise the data on a map.

3. Create a web map application

  For this we will use CartoDB (a cloud based mapping platform) and style the data and create a visualisation that can be viewed online and shared.

4. Write our own Web Map Application

  We will build on Task 2 by continuing to use CartoDB to host the data however we will now write our own application to pull in the data and style the data in the web browser (client).

5. Use Leaflet Plugins

  Here we will use a number of Leaflet plugins to improve the performance and the look and feel of our application.

6. Add Data View

  Improve our application by adding a table view of the data that can be used to list surgeries by name order.

7. Online GIS

  Add some geoprocessing functions to our application that will show you the distance to a GP surgery and those that fall within a county.

8. Add search capabilities

  Add a search box that will use the OS Names API to allow us to search by postcode, street or town name and then move and zoom the map to that location.

By this point we should have a great web mapping application and along the way you will have learnt to use a number of open source tools.

### Data
The data is published by  HSCIC on Data.gov.uk and can be found here https://data.gov.uk/dataset/numbers_of_patients_registered_at_a_gp_practice and is released under the Open Government Licence. As part of this licence we need to acknowledge the source of the data and having looked on the HSCIC website we need to use the following copyright statement.

`Copyright © 2015, Re-used with the permission of the Health and Social Care Information Centre. All rights reserved.`

In Task 1 we will match the HSCIC data to OS Open Names API which uses OS Open Names data which is also released under the OGL, so we will also need to include a number of acknowledgements for it also.

`Contains OS data © Crown copyright [and database right] 2016`

`Contains Royal Mail data © Royal Mail copyright and Database right 2016`

`Contains National Statistics data © Crown copyright and database right 2016`

### Licence
TBC

### Prerequisites

During the workshop we need a few different pieces of software, please make sure you have used the following instructions to get them setup and configured.

1. NodeJS

  Before we can get started we need to get NodeJS installed, if you do not already, by visiting https://nodejs.org/en/ and downloading and installing the correct version for your platform and operating system of the LTS. At the time of writing this was v4.4.2. During the installation it should add it to your PATH, you can check this by opening a console window or a terminal and running the following:

  `node --version`

  You should get the following response

  `v4.4.2`

  If you do not, try and make sure it has been added to your PATH and try again.

2. Sign up for a free CartoDB account

3. Have QGIS installed, go for 2.14 if you can as that is the latest Long Term Release (LTR)

4. A good text editor - Sublime, Atom, Visual Studio, VIM even Notepad++ will do

### Feedback or Pull Requests

Please feel free to raise issues or if you want to expand on the workshop then fork and pull

# READY STEADY GO....
