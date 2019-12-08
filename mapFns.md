
# MapPlotFns
Note that these functions all create a new Mapbox GL JS map layer with id, paint, and source. 

### Usage
    import { plotCircle, plotText, plotLine, plotMultiLine, plotPolygon } from  '../js/mapFns'

### Common arguments
Several of the arguments are common among all functions.
#### map
`map` object to plot onto
#### id
The id needs to be unique, so to handle larger volumes of plotting, the id specified can be made unique by adding a timestamp plus a random number to it.  This can be suppressed by the "unique" option.
#### coords
A single point as a 2-element array [lng,lat], or
an array of points such as [ [lng0,lat0], [lng1,lat1], ...  ]
#### options
An object with properties that dictate layout and paint properties of the plotted item.



## plotCircle( )
Draws a circle at a point.

```    plotCircle( map, id, coords, options )```
```
| map     | map object to plot onto           |
| id      | layer id (before the uniqueness)  |
| coords  | [lng,lat] (center of circle)      |
|               can also be an array to plot  |
|                   multiple circles          |
| options | object: defaults                  |
|         |   color: "red"                    |
|         |   radius: 10                      |
|         |   opacity: 0.8 (0 to 1)           |
|         |   strokeColor: color              |
|         |   strokeWidth: 0                  |
|         |   strokeOpacity: 0.8 (0 to 1)     |
|         |   blur: 0 (0 to 1)                |
|         |   strokeOpacity: 0.8 (0 to 1)     |
|         |   minzoom: 1                      |
|         |   maxzoom: 22                     |
|         |   props: {} additional properties |
|                can be an array if coords    |
|                is also an array             |
|         |   unique: true                    |
```
 - Note that multiple circles can be draw as a single layer, by making `coords` an array of points (which are in turn arrays of [lng,lat] ).  If so, `props` may also vary by point if also provided as an array of objects. Other options will not vary by point (such as color, radius, etc.).  If they need to vary by point their circles will need to be plotted individually.
 
## plotText( )
Draws text at a point.

    plotText( map, id, coords, text, options )
```
| map     | map object to plot onto           |
| id      | layer id (before the uniqueness)  |
| coords  | [lng,lat]                         |
|              can also be an array to plot   |
|              multiple text instances        |
| text    | text to plot                      |
|              must be an array if coords     |
|              is also an array               |
| options | object: defaults                  |
|         |   size: 12                        |
|         |   color: "black"                  |
|         |   opacity: 0.8 (0 to 1)           |
|         |   haloColor: "#f8f8f8"            |
|         |   haloWidth: 1                    |
|         |   haloBlur: 0                     |
|         |   maxWidth: 32 (ems, for wrapping)|  
|         |   rotate: 0 (degrees)             | 
|         |   transform: "none" ("lowercase", |
|                           "uppercase")      | 
|         |   minzoom: 1                      |
|         |   maxzoom: 22                     |
|         |   props: {} additional properties |
|                can be an array if coords    |
|                is also an array             |
|         |   unique: true                    |
```
 - Note that `coords` can optionally be an array of points (which are in turn arrays of [lng,lat].   
 - If so, `text` *must* also be an array, so that the text for each point can vary.
 - If so, `props` *can* also vary by point *if* it is an array.  
 
## plotLine( )
Draws a line from point 0 to point 1.

    plotLine( map, id, coords, options)

```
| map     | map object to plot onto           |
| id      | layer id (before the uniqueness)  |
| coords  | e.g., [[lng0,lat0], [lng1,lat1]]  |
| options | object: defaults                  |
|         |   color: "blue"                   |
|         |   width: 1                        |
|         |   opacity: 0.9 (0 to 1)           |
|         |   blur: 0                         |
|         |   translate: [0, 0]  in px        |
|         |   minzoom: 1                      |
|         |   maxzoom: 22                     |
|         |   props: {}     custom properties |
|         |   unique: true                    |
```

## plotMultiLine( )
Draws a multi-segment line from point 0 to point 1 to point 2, etc.

    plotMultiLine( map, id, coords, options)

```
| map     | map object to plot onto           |
| id      | layer id (before the uniqueness   |
| coords  | e.g., [ [lng0,lat0], [lng1,lat1], | 
|		  |			 [lng2,lat2], ... ]  	  |
| options | object: defaults                  |
|         |   color: "blue"                   |
|         |   width: 1                        |
|         |   opacity: 0.9 (0 to 1)           |
|         |   blur: 0                         |
|         |   translate: [0, 0]  in px        |
|         |   minzoom: 1                      |
|         |   maxzoom: 22                     |
|         |   props: {} additional properties |
|         |   unique: true                    |
```

 - Note that `coords` is an array of points that when connected form line segments.  

## plotPolygon( )
Draws a polygon (essentially a closed multi-segment line) with vertices at point 0, point 1, point 2, etc.

    plotPolygon( map, id, coords, options)
```
| map     | map object to plot onto           |
| id      | layer id (before the uniqueness   |
| coords  | e.g., [[lng0,lat0], [lng1,lat1]], |
|             [lng2,lat2], [lng0,lat0]]       |
| text    | text to plot                      |
| options | object: defaults                  |
|         |   color: "#ffffff" (fill)         |
|         |   opacity: 0.8 (fill)             |
|         |   outlineColor: "#000000"     	  |
|         |   outlineWidth: 0			      |
|         |   outlineOpacity: 0.8		      |
|         |   outlineBlur: 0			      |
|         |   translate: [0,0] (in px)    |
|         |   minzoom: 1                      |
|         |   maxzoom: 22                     |
|         |   props: {} additional properties |
|         |   unique: true                    |
```

 - Note that coords is actually an array of points (which are in turn arrays of [lng,lat].  First and last coordinate points must be the same. 
 - You *can* specify an outlineWidth greater than 1.  Doing so will automatically will create an additional layer via plotLine( ).  The layer id for the outline will have "_outline" appended to it.


### Option Properties:
 **minzoom:** The minimum zoom level at which this layer becomes visible.
 **maxzoom:** The maximum zoom level to which this layer is visible.
 **props:** This object is added to the layer source/data object to set custom properties, using the property "properties".  Usually the properties object consists of single-depth key⇢value mappings.
 **unique:** If true, ensures that the layer id is unique.



>  [StackEdit](https://stackedit.io/).


<!--stackedit_data:
eyJoaXN0b3J5IjpbLTExNDg0MTUyOV19
-->