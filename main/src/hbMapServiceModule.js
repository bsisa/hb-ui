/**
 Service to manage the main view layout
 It mainly relies on JQuery to manipulate top level divs
 */

(function() {


    var hbMapModule = angular.module('hbMap', ['hbGeo']);
    
    hbMapModule.factory('MapService', [
       '$log', 'hbGeoService', function($log, hbGeoService) {

           //TODO: move to controller or constants 
           var MAP_DISPLAY_TYPE = {
           		"FULL": "FULL",
           		"SPLIT": "SPLIT",
           		"HIDDEN":"HIDDEN"
           };
    	   
           // TODO: move to ctrler
           var isMapDisplayed = function() {
               return $('#views-wrapper div.card-view').hasClass('splitViewMargin');
           };

           
           // TODO: move to hbMapLeafletService
           var getPointLayer = function(elfin, style) {

               var point = hbGeoService.getElfinBasePoint(elfin);
               if (!point) {
                   return null;
               }

               var coords = hbGeoService.getLongitudeLatitudeCoordinates(point.X, point.Y);
               var circleMarker = L.circleMarker(L.latLng(coords.lat, coords.lng), style);
               return circleMarker;
           };
           
           
           // TODO: move to hbMapLeafletService
           var getMarkerLayer = function(elfin, style) {

               var point = hbGeoService.getElfinBasePoint(elfin);
               if (!point) {
                   return null;
               }

               var coords = hbGeoService.getLongitudeLatitudeCoordinates(point.X, point.Y);
               var marker = L.marker(L.latLng(coords.lat, coords.lng), style);
           	   return marker;
           };
           
           // TODO: move to hbUtil
           var findElementWithPos = function(array, pos) {
               var element = null;
               angular.forEach(array, function(e) {
                   if (e.POS === parseInt(pos)) {
                       element = e;
                   }
               });
               return element;
           };
           
           
           // TODO: keep it here or move to hbUtil ! 
           // TODO: Split logic to 1) obtain an array of GeoXML POINT 2) transform array of GeoXML POINT to Leaflet latLng.
           // Create new hbGeoUtil/Service to deal with GeoXML FORME actions TODO: move to hbMapLeafletService
           /**
            * Returns an array of GeoXML POINT defining a polygon.
            */
           var getPolygonCoords = function(elfin) {
               if (!elfin.FORME) return null;
               // Check if at least a ZONE is defined, at POS 1. 
               var zoneDef = findElementWithPos(elfin.FORME.ZONE, '1');
               if (!zoneDef) return null;

               var points = [];

               // Process lines (LIGNE) defined by ZONEs
               angular.forEach(zoneDef.LIGNE, function(l) {
                   var lPos = l.Id.split('#')[1];
                   // TODO: HBGeo? - This assumes ZONE Id, ID_G only point to the same ELFIN.
                   // Shouldn't we query the whole database collection for CLASSE/Id/ID_G ?
                   var lineDef = findElementWithPos(elfin.FORME.LIGNE, lPos);

                   // Process each line passage which in turn reference a POINT whose coordinates will be extracted and drawn. 
                   angular.forEach(lineDef.PASSAGE, function(p) {
                       var pPos = p.Id.split('#')[1];
                       // TODO: HBGeo? - This assumes LINE Id, ID_G only point to the same ELFIN.
                       // Shouldn't we query the whole database collection for CLASSE/Id/ID_G ?
                       var pointDef = findElementWithPos(elfin.FORME.POINT, pPos);
                       var coords = hbGeoService.getLongitudeLatitudeCoordinates(pointDef.X,pointDef.Y);
                       points.push(L.latLng(coords.lat, coords.lng));
                   });
               });

               return points;
           };           
           
           // TODO: move to hbMapLeafletService
           /**
            * Returns a L.polygon with provided `style` for the given `elfin` parameter. 
            */
           var getPolygonLayer = function(elfin, style) {
               var coords = getPolygonCoords(elfin);
               if (coords && coords.length > 0) {
            	   var polygon = L.polygon(coords, style);
                   return polygon;
               } else {
                   return null;                    	
               }
           };
           
           /**
            * TODO: This is not generic: Re-design and refactor. 
            * (I.e.: Have template per CLASSE and template list loaded from database at startup.)
            * Microservice architecture: => geo database accessed by hbGeoService...
            */
           var getPopupContent = function(elfin) {
               var popup = '<b>' + elfin.IDENTIFIANT.NOM + ' ' + elfin.IDENTIFIANT.ALIAS + '</b><br>';
               popup += 'No SAI <b>' + elfin.IDENTIFIANT.OBJECTIF + '</b> - ' + elfin.CLASSE + '<br>';
               popup += '<a href="/elfin/' + elfin.ID_G + '/' + elfin.CLASSE + '/' + elfin.Id + '">Détails</a>';
               return popup;
           };
           

           /**
            * TODO: Move to hbMapLeafletService
            */
           var updatePolygonCoords = function(elfin, layer) {
               if (angular.isDefined(layer.setLatLngs)) { 
                   var coords = getPolygonCoords(elfin);
                   if (coords && coords.length > 0) {
                   	//$log.debug("Map service: updatePolygonCoords - layer.setLatLngs(coords)\ncoords =\n" + angular.toJson(coords));
                	   layer.setLatLngs(coords);
                   }
               }

           };
           
           /**
            * TODO: Move to hbMapLeafletService
            * TODO: review, pitfall with marker management. 
            * See monkey patching while used in hbMapController.
            */
           var getObjectLayer = function(elfin, representation, style) {
               var result = null;

               switch (representation.toLowerCase()) {
                   case 'point': result = getPointLayer(elfin, style); break;
                   case 'marker': result = getMarkerLayer(elfin, style); break;
                   case 'polygon': result = getPolygonLayer(elfin, style); break;
               }

               if (result !== null) {
            	   //$log.debug(">>>>    getObjectLayer    ***    START    <<<<");
            	   result.bindPopup(getPopupContent(elfin));
            	   // TODO: Test whether this was necessary !?
            	   //angular.extend(result, {elfin:elfin});
            	   // TODO: CURRENT
            	   angular.extend(result, {representation:representation.toLowerCase()});
               }

               return result;
           };

           
           
           /**
            * TODO: Move to hbMapLeafletService
            * Updates leaflet layer object with ELFIN FORME BASE POINT coordinates
            */
           var updateLayerCoords = function(elfin, layer) {

               if (angular.isDefined(layer.setLatLng)) {
                   var point = hbGeoService.getElfinBasePoint(elfin);
                   if (point) {
                       var coords = hbGeoService.getLongitudeLatitudeCoordinates(point.X, point.Y);
                       layer.setLatLng(L.latLng(coords.lat, coords.lng));
                   }
               }
           };
           
           
           /**
            * TODO: Move to ctrler
            * Code block dealing with div toggle operation
            */
           var toggle = function(mainMarginsDiv, mainCardViewDiv, mainMapViewDiv) {
        	   mainMarginsDiv.toggleClass('splitViewMargin');
	           mainCardViewDiv.toggleClass('splitViewMargin');
	           mainMapViewDiv.toggle();
           };
           
           /**
            * TODO: Move to ctrler
            * Refresh map layout dimensions, position and visibility 
            * depending on display type and current visibility status.
            */
           var refreshLayout = function(mapDisplayType) {
	           
        	   var mainMarginsDiv = $('#views-wrapper div.margin');
	           var mainCardViewDiv = $('#views-wrapper div.card-view');
	           var mainMapViewDiv = $('#views-wrapper div.map-view');
	           var mainMapViewLeafletDiv = $('#views-wrapper div.map-view-leaflet');
	           
	           if (!isMapDisplayed() && mapDisplayType !== MAP_DISPLAY_TYPE.HIDDEN) { // Make map visible for all display types except HIDDEN 
	        	   toggle(mainMarginsDiv, mainCardViewDiv, mainMapViewDiv);
	           } 
	           if (isMapDisplayed() && mapDisplayType === MAP_DISPLAY_TYPE.HIDDEN) { // Hide map for display type HIDDEN
	        	   toggle(mainMarginsDiv, mainCardViewDiv, mainMapViewDiv);
	           }
	           
	           if (mainCardViewDiv.hasClass('splitViewMargin')) {
	           	//$log.debug(">>>>>> hbMapService mainCardViewDiv HAS Class splitViewMargin <<<<<<");
	               var bodyWidth = $('body').width();
	               var windowHeight = $(window).height() - 100;
	               var cardViewWidth = undefined;
	               if (mapDisplayType === 'SPLIT') {
	            	   cardViewWidth = 450;
	               } else {
	            	   cardViewWidth = 0;
	               }
	               mainMarginsDiv.width('10px');
	               mainCardViewDiv.width(cardViewWidth+'px');
	               mainMapViewDiv.width((bodyWidth - cardViewWidth - 20 - 100) + 'px');
	               mainMapViewLeafletDiv.width((bodyWidth - cardViewWidth - 20 - 100) + 'px');
	               mainMapViewDiv.height(windowHeight + 'px');
	               mainMapViewLeafletDiv.height(windowHeight + 'px');
	               return true; // TODO: Legacy behaviour, no return result required, remove 
	           } else {
	           	//$log.debug(">>>>>> hbMapService mainCardViewDiv DOES NOT HAVE Class splitViewMargin <<<<<<");
	               mainMarginsDiv.width('');
	               mainCardViewDiv.width('');
	               return false; // TODO: Legacy behaviour, no return result required, remove
	           }
           };
           
           
            return {

                /**
                 * Provides a function to test whether or not the map is currently displayed. 
                 */
                isMapDisplayed: isMapDisplayed,
                
                /**
                 * Switches map display types in turn: HIDDEN > SPLIT > FULL > HIDDEN
                 */
                switchMapDisplayType: function (mapDisplayType) {
                	var newMapDisplayType = undefined;
                	if (mapDisplayType === MAP_DISPLAY_TYPE.HIDDEN) {
                		newMapDisplayType = MAP_DISPLAY_TYPE.SPLIT;
                		refreshLayout(newMapDisplayType);
                		return newMapDisplayType;
                	} else if (mapDisplayType === MAP_DISPLAY_TYPE.SPLIT) {
                		newMapDisplayType = MAP_DISPLAY_TYPE.FULL;
                		refreshLayout(newMapDisplayType);
                		return newMapDisplayType;
                	} else if (mapDisplayType === MAP_DISPLAY_TYPE.FULL) {
                		newMapDisplayType = MAP_DISPLAY_TYPE.HIDDEN;
                		refreshLayout(newMapDisplayType);
                		return newMapDisplayType;
                	}
                },
                
                getPopupContent:getPopupContent,

                /**
                 * 
                 */
                getObjectLayer: getObjectLayer,

                /**
                 * 
                 */
                getObjectBounds: function (elfin, representation) {
    	            // No need for style when computing bounds
                	var style = {};
    	            var elfinLayer = getObjectLayer(elfin, representation, style);
    	            return elfinLayer.getBounds();
                },                
                
                updateLayerPopupContent: function(elfin, layer) {
                    if (angular.isDefined(layer.getPopup) && layer.getPopup()) {
                        layer.getPopup().setContent(getPopupContent(elfin));
                    }
                },

                getPointLayer:getPointLayer,

                /*
                Return markers
                 */
                getMarkerLayer:getMarkerLayer,

                updateLayerCoords:updateLayerCoords,

                findElementWithPos:findElementWithPos,

                /*
                	Return polygons coordinates for ELFIN.FORME.ZONE if any.
                	TODO: check behaviour for n ZONE definition
                 */
                getPolygonCoords:getPolygonCoords,


                /**
                 * Draws polygon overlays on map
                 */
                getPolygonLayer:getPolygonLayer,

                
                /**
                 * Update `layer` latitude, longitude coordinates from elfin.FORME.ZONE 
                 */
                updatePolygonCoords:updatePolygonCoords
            }
    }]);

})();