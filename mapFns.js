export { plotCircle, plotText, plotLine, plotMultiLine, plotPolygon, getLayerIds, getSourceIds, getMsec, extractId }



// General background on Geojson
// https://macwright.org/2015/03/23/geojson-second-bite.html

/*

function plotCircle( map, id, coords, options ) 

function plotText( map, id, coords, text, options ) 

function plotLine( map, id, coords, options ) 

function plotPolygon( map, id, coords, options )

*/




//
// plot a circle (use a unique layer id)
// optional properties as an argument
// see https://observablehq.com/@yuanzf/mapbox-gl-bubble-map
/*
    if (options===undefined) options = {};
color   "red"
radius  10
opacity 0.8
props   {}
minzoom 1
strokeColor color
strokeWidth 0
strokeOpacity = 0.8;
*/
//
function plotCircle( map, id, coords, options ) {

    if (options===undefined) options = {};
    if (options.color===undefined) options.color = "red";
    if (options.radius===undefined) options.radius = 10;
    if (options.opacity===undefined) options.opacity = 0.8;
    if (options.minzoom===undefined) options.minzoom = 1;
    if (options.maxzoom===undefined) options.maxzoom = 22;
    if (options.strokeColor===undefined) options.strokeColor = options.color;
    if (options.strokeWidth===undefined) options.strokeWidth = 0;
    if (options.strokeOpacity===undefined) options.strokeOpacity = 0.5;
    if (options.blur===undefined) options.blur = 0; // Amount to blur the circle. 1 blurs the circle such that only the centerpoint is full opacity.
    if (options.translate===undefined) options.translate = [0,0]; // The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively.

    if (options.props===undefined) options.props = {};
    if (options.unique===undefined) options.unique = true;

    const radiusOut = options.radius/3;  // how far the radius shrinks when zooming out
    const idToAdd = makeUniqueId(id, options.unique)
            console.warn("coords",coords,"isArrayOfCoords",isArrayOfCoords(coords))
    let featuresToAdd = []  // array of features that will be added
    let featureToAdd = {}   // feature object that will be pushed to array of features
    let props = {}          // properties object for each feature

    // is the coords argument an array of coordinates?  
    if (isArrayOfCoords(coords)) {
        // If so, build featuresToAdd array.
        for (let i=0;i<coords.length;i++) {
            // Are the properties also in an array?  If so, add the each feature
            if (isArrayOfProps(options.props )) {
                console.warn("props is ALSO an array")
                props = options.props[i]
            }
            else {
                console.warn("props is NOT an array")
                props = options.props   // same props for all features
            }
            featureToAdd =  { 
                "type": "Feature", 
                "properties": props, 
                "geometry": { 
                    "type": "Point", 
                    "coordinates": coords[i]
                } 
            }  
            featuresToAdd.push(featureToAdd)
        }
    }
    else {
        // variable coords is not an array of points, 
        // so build featuresToAdd array as single feature in that array.
        featureToAdd =  { 
            "type": "Feature", 
            "properties": options.props, 
            "geometry": { 
                "type": "Point", 
                "coordinates": coords
            } 
        }  
        featuresToAdd.push(featureToAdd)
    }
            //console.warn("plotCircle featureToAdd",featureToAdd)
    const result = {
        "function": "plotCircle",
        "idToAdd": idToAdd,
        "featuresToAdd": featuresToAdd
    }
    result.mapAddLayer = map.addLayer({ 
        "id": idToAdd, 
        "type": "circle", 
        "paint": { 
            //"circle-radius":radius, // THIS IS THE NON-INTERPOLATED VERSION. - DEPRECATED
            /*            
            // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions
            A camera expression is any expression that uses the zoom operator. 
            Such expressions allow the the appearance of a layer to change with the map's zoom level. 
            Camera expressions can be used to create the appearance of depth and to control data density.
            */
            "circle-radius": [
                "interpolate", ["linear"], ["zoom"],
                // zoom is 4 (or less) -> circle radius will be smaller by factor of 3
                4, radiusOut,
                // zoom is 14 (or greater) -> circle radius will be per the argument value
                14, options.radius
            ],
            "circle-color": options.color,
            "circle-opacity": options.opacity,
            "circle-stroke-color": options.strokeColor,
            "circle-stroke-width": options.strokeWidth,
            "circle-stroke-opacity": options.strokeOpacity,
            "circle-blur": options.blur,
            "circle-translate": options.translate,
         }, 

        // this layer that is being added also adds a source with the same id
        "source": { 
            "type": "geojson", 
            "data": {
                "type": "FeatureCollection", 
                "features": featuresToAdd
            }
        },
        "minzoom": options.minzoom,
        "maxzoom": options.maxzoom,
    });
        console.warn("result",result)
    return result
}




//
// Round labels demo
// https://bl.ocks.org/stevage/23d881a66e2bcca385d8cc074691b674
//
function plotText( map, id, coords, text, options ) {

    //console.log("addText ",text," with options",options);
if (options===undefined) options = {};
if (options.props===undefined) options.props = {};

if (options.minzoom===undefined) options.minzoom = 1;
if (options.maxzoom===undefined) options.maxzoom = 22;
if (options.size===undefined) options.size = 12;
if (options.color===undefined) options.color = "black";
if (options.opacity===undefined) options.opacity = 0.8;    // 0 to 1

if (options.haloColor===undefined) options.haloColor = "#f8f8f8";
if (options.haloWidth===undefined) options.haloWidth = 1;
if (options.haloBlur===undefined) options.haloBlur = 0; // halo's fadeout distance towards the outside.

if (options.maxWidth===undefined) options.maxWidth = 32;    // in ems, for wrapping
if (options.height===undefined) options.height = 1.2;    // in ems, the line height between lines (1.2=default)
if (options.spacing===undefined) options.spacing = 0;    // in ems, the letter spacing (0=default)
if (options.transform===undefined) options.transform = "none";    // also uppercase or lowercase
if (options.padding===undefined) options.padding = 0;    // in px, additional area around for detecting symbol collisions
if (options.rotate===undefined) options.rotate = 0;    // in degrees
if (options.justify===undefined) options.justify = "auto";    // relative to anchor position: also "left", "center", "right"

if (options.offset===undefined) options.offset = [0, 0.5];  // in ems; this offsets it below its anchor
if (options.unique===undefined) options.unique = true;

const idToAdd = makeUniqueId(id, options.unique)
let featuresToAdd = []  // array of features that will be added
let featureToAdd = {}   // feature object that will be pushed to array of features
let props = {}          // properties object for each feature

                                    /*
                                    featureToAdd =  { 
                                            "type": "Feature",
                                            "properties": options.props, 
                                            "geometry": {
                                                "type": "Point",
                                                "coordinates": coords
                                            },
                                            "properties": {
                                                "title": text,
                                            }
                                    }  
                                    */
                                    //featuresToAdd.push(featureToAdd)


    // is the coords argument an array of coordinates?  
    if (isArrayOfCoords(coords)) {
        // If so, build featuresToAdd array.
        for (let i=0;i<coords.length;i++) {
            // Are the properties also in an array?  If so, add the each feature
            if (isArrayOfProps(options.props )) {
                console.warn("props is ALSO an array")
                props = options.props[i]
            }
            else {
                console.warn("props is NOT an array")
                props = options.props   // same props for all features
            }
                                            /*
                                            featureToAdd =  { 
                                                "type": "Feature", 
                                                "properties": props, 
                                                "geometry": { 
                                                    "type": "Point", 
                                                    "coordinates": coords[i]
                                                } 
                                            }  
                                            */

            featureToAdd =  { 
                "type": "Feature",
                "properties": props, 
                "geometry": {
                    "type": "Point",
                    "coordinates": coords[i]
                },
                "properties": {
                    "title": text[i],
                }
            }  
            featuresToAdd.push(featureToAdd)
        }
    }
    else {
        // variable coords is not an array of points, 
        // so build featuresToAdd array as single feature in that array.

                                                        /*
                                                        featureToAdd =  { 
                                                            "type": "Feature", 
                                                            "properties": options.props, 
                                                            "geometry": { 
                                                                "type": "Point", 
                                                                "coordinates": coords
                                                            } 
                                                        }  
                                                        */

        featureToAdd =  { 
            "type": "Feature",
            "properties": props, 
            "geometry": {
                "type": "Point",
                "coordinates": coords
            },
            "properties": {
                "title": text,
            }
        }  
        featuresToAdd.push(featureToAdd)
    }

    const result = {
        "function": "plotText",
        "idToAdd": idToAdd,
        "featuresToAdd": featuresToAdd
    }

    result.mapAddLayer = map.addLayer({ 
        "id": idToAdd,
        "type": "symbol",
        "source": {
            "type": "geojson",
            "data": 
                {
                "type": "FeatureCollection",
                "features": featuresToAdd
            }
        },
        "minzoom": options.minzoom,
        "maxzoom": options.maxzoom,

        "layout": {
            //"icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": options.offset,
            "text-anchor": "top",
            "text-allow-overlap": true,
            "text-size": options.size,
            "text-max-width": options.maxWidth,
            "text-line-height": options.height,
            "text-letter-spacing": options.spacing,
            "text-transform": options.transform,
            "text-padding": options.padding,
            "text-rotate": options.rotate,
            "text-justify": options.justify,
        },
        "paint": {
            "text-color": options.color,
            "text-halo-color": options.haloColor,
            "text-halo-width": options.haloWidth,
            "text-halo-blur": options.haloBlur,
            "text-opacity": options.opacity,
        }  
    });
        //console.log("addText ",text," with options",options,"------------------");
        console.log("result",result)
    return result
}

// options:
//  options.color
//  options.width
//  options.opacity
//  options.minzoom
//  options.maxzoom

function plotLine( map, id, coords, options ) {
    if (options===undefined) options = {};

    if (options.props===undefined) options.props = {};

    if (options.color===undefined) options.color = "blue";
    if (options.width===undefined) options.width = 1;

    if (options.translate===undefined) options.translate = [0,0];
    if (options.translateAnchor===undefined) options.translateAnchor = "map" ;  
    if (options.blur===undefined) options.blur = 0;
    if (options.dasharray===undefined) options.dasharray = null; // unit in line widths

    if (options.minzoom===undefined) options.minzoom = 1;
    if (options.maxzoom===undefined) options.maxzoom = 22;
    if (options.opacity===undefined) options.opacity = Math.max(0.25, 1.0 - options.width/10) ;  
    // default to 0.9 opacity and gets lower as line gets wider, but at least 0.25
    if (options.unique===undefined) options.unique = true;

    const idToAdd = makeUniqueId(id, options.unique)

            /*
            var line = turf.lineString(coords);
            // CANT GET BEZIER TO WORK
            // var curved = turf.bezierSpline(line);
            // https://turfjs.org/docs/#bezierSpline

            var turfDistance = turf.lineDistance(line);
            // turf returns km, so multiply to get feet                    
            turfDistance = Math.round(turfDistance*3280.84);  // feet per km
                console.log(id,"addLineSegments turfDistance",turfDistance,"feet");
                console.log("addLineSegments coords,options,id",coords,options,id);
            */

    // Line as a layer
    const result = {
        "function": "plotLine",
        "idToAdd": idToAdd,
    }

    result.mapAddLayer = map.addLayer({ 
        "id": idToAdd,
        "type": "line",
        "source": {
            "type": "geojson",
            "data": {
                "type": "Feature",
                "properties": options.props, 
                "geometry": {
                    "type": "LineString",
                    "coordinates": coords 
                }
            }
        },

        "minzoom": options.minzoom,
        "maxzoom": options.maxzoom,

        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": options.color,
            "line-width": options.width,
            "line-opacity": options.opacity,
            "line-translate": options.translate,
            "line-translate-anchor": options.translateAnchor,
            "line-blur": options.blur,
            //"line-dasharray": options.dasharray,
        }
    });
        console.warn("plotLine id options",idToAdd,options);
    return result
}


// https://jsbin.com/cozudodelo/edit?html,output

function plotMultiLine( map, id, coords, options ) {
    if (options===undefined) options = {};

    if (options.props===undefined) options.props = {};

    if (options.color===undefined) options.color = "blue";
    if (options.width===undefined) options.width = 1;

    if (options.translate===undefined) options.translate = [0,0];
    if (options.translateAnchor===undefined) options.translateAnchor = "map" ;  
    if (options.blur===undefined) options.blur = 0;
    if (options.dasharray===undefined) options.dasharray = null; // unit in line widths

    if (options.minzoom===undefined) options.minzoom = 1;
    if (options.maxzoom===undefined) options.maxzoom = 22;
    if (options.opacity===undefined) options.opacity = Math.max(0.25, 1.0 - options.width/10) ;  
    // default to 0.9 opacity and gets lower as line gets wider, but at least 0.25
    if (options.unique===undefined) options.unique = true;

    const idToAdd = makeUniqueId(id, options.unique)

            /*
            var line = turf.lineString(coords);
            // CANT GET BEZIER TO WORK
            // var curved = turf.bezierSpline(line);
            // https://turfjs.org/docs/#bezierSpline

            var turfDistance = turf.lineDistance(line);
            // turf returns km, so multiply to get feet                    
            turfDistance = Math.round(turfDistance*3280.84);  // feet per km
                console.log(id,"addLineSegments turfDistance",turfDistance,"feet");
                console.log("addLineSegments coords,options,id",coords,options,id);
            */

    // Line as a layer
    const result = {
        "function": "plotMultiLine",
        "idToAdd": idToAdd,
    }

    result.mapAddLayer = map.addLayer({ 
        "id": idToAdd,
        "type": "line",
        "source": {
            "type": "geojson",
            "data": {
                "type": "Feature",
                "properties": options.props, 
                "geometry": {
                    "type": "MultiLineString",
                    "coordinates": [coords]     // note extra array brackets
                }
            }
        },

        "minzoom": options.minzoom,
        "maxzoom": options.maxzoom,

        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": options.color,
            "line-width": options.width,
            "line-opacity": options.opacity,
            "line-translate": options.translate,
            "line-translate-anchor": options.translateAnchor,
            "line-blur": options.blur,
            //"line-dasharray": options.dasharray,
        }
    });
        console.warn("plotLine id options",idToAdd,options);
    return result
}




//
//
//
function plotPolygon( map, id, coords, options ) {
    if (options===undefined) options = {};

    if (options.props===undefined) options.props = {};

    if (options.color===undefined) options.color = "#fff";
    if (options.opacity===undefined) options.opacity = 0.8 ;  
    if (options.outlineColor===undefined) options.outlineColor = "#000" ;  
    if (options.outlineWidth===undefined) options.outlineWidth = 0 ;  
    if (options.outlineWidth==0) options.outlineColor = options.color ;  // if there is no outline, specify same color as fill
    if (options.outlineBlur===undefined) options.outlineBlur = 0 ;  

    if (options.outlineOpacity===undefined) options.outlineOpacity = 0.8 ;  

    // The geometry's offset in px. Values are [x, y] where negatives indicate left and up, respectively.
    if (options.translate===undefined) options.translate = [0, 0] ;  
    if (options.translateAnchor===undefined) options.translateAnchor = "map" ;  

    //if (options.width===undefined) options.width = 1;
    if (options.minzoom===undefined) options.minzoom = 1;
    if (options.maxzoom===undefined) options.maxzoom = 22;
    // default to 0.9 opacity and gets lower as line gets wider, but at least 0.25
    if (options.unique===undefined) options.unique = true;

    const idToAdd = makeUniqueId(id, options.unique)

            /*
            var line = turf.lineString(coords);
            // CANT GET BEZIER TO WORK
            // var curved = turf.bezierSpline(line);
            // https://turfjs.org/docs/#bezierSpline

            var turfDistance = turf.lineDistance(line);
            // turf returns km, so multiply to get feet                    
            turfDistance = Math.round(turfDistance*3280.84);  // feet per km
                console.log(id,"addLineSegments turfDistance",turfDistance,"feet");
                console.log("addLineSegments coords,options,id",coords,options,id);
            */

    // Line as a layer
    const result = {
        "function": "plotPolygon",
        "idToAdd": idToAdd,
    }

    result.mapAddLayer = map.addLayer({ 
        "id": idToAdd,
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": {
                "type": "Feature",
                "properties": options.props, 
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [ coords ]
                }
            }
        },

        "minzoom": options.minzoom,
        "maxzoom": options.maxzoom,

        "layout": {
        },
        "paint": {
            'fill-color': options.color,
            'fill-opacity': options.opacity,
            'fill-outline-color': options.outlineColor,
            'fill-translate': options.translate,
            'fill-translate-anchor': options.translateAnchor,

            //'fill-extrusion-height': 0,

        }
    });
        //console.log("addLineSegment minzoom",options.minzoom);


        /*
        You can not specify an outline border width greater than 1.  
        Must use an additional layer via plotLine( )
        So here we automatically add that additional layer, thereby
        enhancing the polygon functionality to have a variable outline width,
        as well as other outline properties such as blur
        */

        if (options.outlineWidth>1) {
            console.warn("options.outlineWidth",options.outlineWidth)
            const idOutline = id+"_outline"
            const outlineOptions = { 
                "color":options.outlineColor, 
                "width":options.outlineWidth, 
                "opacity":options.outlineOpacity,
                "blur": options.outlineBlur,
                "translate": options.translate,
                "minzoom": options.minzoom,
                "maxzoom": options.maxzoom,
                "props": options.props,
                "unique":options.unique
            }
            const xxx = plotLine( map, idOutline, coords, outlineOptions)
                console.warn("adding an Outline",xxx)
        }

    return result

}

//
// return a unique id based on the id argument, plus the timestamp, plus a random number
//
function makeUniqueId(id, unique) {
    if (unique) {
        return id+"_time-"+getMsec()+"_random-"+Math.random()
    }
    else {
        return id    
    }
}

//
// number of milliseconds since midnight, January 1, 1970
//
function getMsec() {
    const d = new Date();
    return d.getTime();
}

//
// check if this object is an array of coordinates
//
function isArrayOfCoords(coords) {
    return Array.isArray( coords[0] );
}
//
// check if this object is an array of properties
//
function isArrayOfProps(props) {
    return Array.isArray( props );
}

//
// given an id of a geojson that has been made unique, extract the given id
//
function extractId(idAdded) {
    return idAdded.split("_")[0];
}

//
// get a list of all the layer ids
//
function getLayerIds(map) {
    var layers = map.getStyle().layers;
        //console.log("layers",layers);
    var layerIds = layers.map(function (layer) {
        return layer.id;
    });
    return layerIds;
}

//
// get a list of all the source ids
//
function getSourceIds(map) {
    var sources = map.getStyle().sources;
        //console.log("layers",layers);
    //var sourceIds = sources.map(function (source) {
        //return source.id;
    //});
    return sources;
}

//
// make an html string showing the coordinate
//
function coordinatesHTMLline(coord) {
    var myHTML = "";
    myHTML += coord[0].toFixed(5);
    myHTML += ", ";        
    myHTML += coord[1].toFixed(5);    
    return myHTML;
}



// refactored from geoFunctions_2b3.js and geometry_2b1.js


//
// test if 2 geojson objects share 2 or more coordinates
// 1 point where they touch IS enough to be adjacent
//
function isAdjacent(objX,objY) {
	if (objX.geometry===undefined) return false;
	if (objY.geometry===undefined) return false;
	if (objX.geometry.coordinates===undefined) return false;
	if (objY.geometry.coordinates===undefined) return false;
	var isAdj = "";
	coordX = objX.geometry.coordinates[0];
	coordY = objY.geometry.coordinates[0];
	if (coordX==coordY) return false;  // don't allow self-identity
	var coordTest=0;
	for (var x=0;x<coordX.length;x++) {
		for (var y=0;y<coordY.length;y++) {
			if (compareCoords(coordX[x], coordY[y])) coordTest++;
			if (coordTest>=1) {
				//console.warn("adj "+x+" = "+y);
				return true;
			}
		}
	}
	return false;
}

//
// match coords of a point against an array of vertices and return the nearest properties
//
function nearestVertexDistance(coords,vertices,verticesCount) {
	var nearest = {};
	nearest.distance = Infinity;
	nearest.index = -1;
	for (var i=0;i<verticesCount;i++) {
		var x0=coords[0];
		var y0=coords[1];
		var x1=vertices[i][0];
		var y1=vertices[i][1];
		var dx = x0-x1;
		var dy = y0-y1;
		var d = Math.sqrt( dx*dx + dy*dy);
		if (d<nearest.distance) {
			nearest.distance = d;
			nearest.index = i;	
		}		
	}
	return nearest;
}

//
// compute centroid of a set of coordinates
// return the lat and lng of the centroid
//
var getCentroid = function (coord) 
{
    var center = coord.reduce(function (x,y) {
        return [x[0] + y[0]/coord.length, x[1] + y[1]/coord.length] 
    }, [0,0])
    return center;
}

//
// creates a square around a point at center, with width specified
//
function createSquare(center, width) {

    // these factors works for latitudes around 42
    var offsetX = .5*width;
    var offsetY = .38*width;

    var coords = [];
    coords = [
    [ center[0]+offsetX, center[1]+offsetY ],
    [ center[0]+offsetX, center[1]-offsetY ],
    [ center[0]-offsetX, center[1]-offsetY ],
    [ center[0]-offsetX, center[1]+offsetY ],
    [ center[0]+offsetX, center[1]+offsetY ],    
    ];
    	console.log("center,width,offset,coords",center,width,offsetX,offsetY,coords);
    return coords;
}


// Add labels to a multiLine
// http://jsfiddle.net/brianssheldon/wm18a33d/8/

/*

map.getStyle().sources

function createSource(coords)


map.addSource("route", {
    "type": "geojson",
    "data": {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-88.451092, 33.325422],
                [-88.248037, 33.436312],
                [-88.548037, 33.426312],

            ]
        }
    }
});

map.addLayer({
    "id": "route",
    "type": "line",
    "source": "route",
    "layout": {
        "line-join": "round",
        "line-cap": "round"
    },
    "paint": {
        "line-color": "#888",
        "line-width": 8
    }
});

map.addLayer({
    "id": "symbols",
    "type": "symbol",
    "source": "route",
    "layout": {
        "symbol-placement": "line",
        "text-font": ["Open Sans Regular"],
        "text-field": 'this is a test',
        "text-size": 32
    },
    "paint": { 
        "text-color": "blue",
            }
});

*/