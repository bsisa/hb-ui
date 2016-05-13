/**
 * Provides helper functions for Leaflet related objects. 
 * `L` is freely used as abbreviation for `Leaflet`
 * 
 * Useful references to Leaflet documentation:
 * <ul>
 * <li>Leaflet API Reference: http://leafletjs.com/reference.html</li>
 * <li>LatLng: Represents a geographical point with a certain latitude and longitude: http://leafletjs.com/reference.html#latlng</li> 
 * </ul>
 *  
 */

(function() {

    angular.module('hbUi.geo').factory('hbGeoLeafletService', [
       '$log', 'hbGeoService', function($log, hbGeoService) {

    	   // =================================================================
    	   //     Leaflet configuration objects
    	   //     Might move in a hbGeoConfig service in the future 
    	   // =================================================================

           /**
            * Provides default for angular-leaflet-directive variables 
            * extending controllers using leaflet.
            */
           var getDefaultLeafletScopeVars = function() {
        	 
        	   var defaultLeafletAdditionToScope = {
					iconStyles: {
						selectedMarker: getSelectedObjectMarkerStyle(),
						standardMarker: getStandardObjectMarkerStyle()
					},
					center: {
						lat: 0,
						lng: 0,
						zoom: 10
					},
					defaults: {
						drawControl: true
					},
					layers: {
						baselayers: {
							standard: {
								name: 'Standard',
								url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
								type: 'xyz'
							}
					   // Image overlay test (WIP. GIS funct. dev.)
					//                   		,
					//                           gespatri: {
					//                               name: 'Gespatri',
					//                               type: 'imageOverlay',
					//                               url: '/assets/images/abribus.jpeg',
					//                               bounds: [[46.992737010038404, 6.931471483187033], [46.99302251894073, 6.931947239697114]],
					//                               //{"_southWest":{"lat":46.992737010038404,"lng":6.931471483187033},"_northEast":{"lat":46.99302251894073,"lng":6.931947239697114}}
					//                               layerParams: {
					//                                 noWrap: true,
					//                                 attribution: 'Custom map <a href="http://www.bsisa.ch/">by BSI SA</a>'
					//                               }
					//                           }
							,
							transport: {
								name: 'Transport',
								url: 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
								type: 'xyz'
							}
					//                   		,
					//                         landscape: {
					//                             name: 'Paysage',
					//                             url: 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
					//                             type: 'xyz'
					//                         },
					//                         grayscale: {
					//                             name: 'Routes - Gris',
					//                             url: 'http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}',
					//                             type: 'xyz'
					//                         },
					//                         watercoloe: {
					//                             name: 'Aquarelle',
					//                             url: 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
					//                             type: 'xyz'
					//                         },                        
					
						},
						overlays: {
						}
					}
        	   };
        	   
        	   // Hack: Serialisation prevents modification by reference, but breaks
        	   // $scope.drawControl.draw.marker.icon definition in caller i.e. hbMapController
        	   //return angular.fromJson(angular.toJson(defaultLeafletAdditionToScope));
        	   return defaultLeafletAdditionToScope;
           };
           
           
           /**
            * Returns tooltips, buttons, actions, toolbar,... labels translated
            * properties to extend/merge with L.drawLocal. 
            * 
            * (Currently hardcoded to french only, can be extended to database 
            * configured per language locale as needed).
            */
           var getDrawLocalTranslation = function() {
        	   
        	   var drawLocalTranslation_fr = {
								               draw: {
								                   toolbar: {
								                       actions: {
								                           title: 'Annuler le dessin',
								                           text: 'Annuler'
								                       },
								                       undo : {
								                           title: 'Effacer le dernier point dessiné',
								                           text: 'Effacer le dernier point'
								                       },
								                       buttons: {
								                           polyline: 'Dessiner une polyligne',
								                           polygon: 'Dessiner un polygone',
								                           marker: 'Dessiner un point',
								                           rectangle: 'Draw a rectangle',
								                           circle: 'Draw a circle'
								                       }
								                   },
								                   handlers: {
								                       circle: {
								                           tooltip: {
								                               start: 'Click and drag to draw circle.'
								                           }
								                       },
								                       rectangle: {
								                           tooltip: {
								                               start: 'Click and drag to draw rectangle.'
								                           }
								                       },
								                       simpleshape: {
								                           tooltip: {
								                               end: 'Release mouse to finish drawing.'
								                           }
								                       },
								                       marker: {
								                           tooltip: {
								                               start: 'Click sur le plan pour placer un point.'
								                           }
								                       },
								                       polygon: {
								                           tooltip: {
								                               start: 'Click pour commencer à dessiner la forme.',
								                               cont: 'Click pour continuer de dessiner.',
								                               end: 'Click sur le premier point pour fermer la forme.'
								                           }
								                       },
								                       polyline: {
								                           error: '<strong>Erreur:</strong> les côtés ne peuvent pas se croiser!',
								                           tooltip: {
								                               start: 'Click pour commencer à dessiner la ligne.',
								                               cont: 'Click pour continuer de dessiner.',
								                               end: 'Click sur le dernier point pour terminer.'
								                           }
								                       }
								                   }
								               },
								               edit: {
								                   toolbar: {
								                       actions: {
								                           save: {
								                               title: 'Save changes.',
								                               text: 'Save'
								                           },
								                           cancel: {
								                               title: 'Cancel editing, discards all changes.',
								                               text: 'Cancel'
								                           }
								                       },
								                       buttons: {
								                           edit: 'Edit layers.',
								                           editDisabled: 'No layers to edit.',
								                           remove: 'Delete layers.',
								                           removeDisabled: 'No layers to delete.'
								                       }
								                   },
								                   handlers: {
								                       edit: {
								                           tooltip: {
								                               text: 'Drag handles, or marker to edit feature.',
								                               subtext: 'Click cancel to undo changes.'
								                           }
								                       },
								                       remove: {
								                           tooltip: {
								                               text: 'Click on a feature to remove'
								                           }
								                       }
								                   }
								               }
								           };

        	   return drawLocalTranslation_fr;
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
    	   
    	   // =================================================================
    	   //     Leaflet objects from/to GeoXml utilities
    	   // =================================================================           
           
    	   /**
    	    * Returns L.circleMarker for `elfin` base point translated swiss 
    	    * coordinates to latitudes, longitudes and `style`.
    	    */
           var getPointLayer = function(elfin, style) {

               var point = hbGeoService.getElfinBasePoint(elfin);
               if (!point) {
                   return null;
               }

               var coords = hbGeoService.getLongitudeLatitudeCoordinates(point.X, point.Y);
               var circleMarker = L.circleMarker(L.latLng(coords.lat, coords.lng), style);
               return circleMarker;
           };
           
           
    	   /**
    	    * Returns L.marker for `elfin` base point translated swiss 
    	    * coordinates to latitudes, longitudes and `style`.
    	    */
           var getMarkerLayer = function(elfin, style) {

               var point = hbGeoService.getElfinBasePoint(elfin);
               if (!point) {
                   return null;
               }

               var coords = hbGeoService.getLongitudeLatitudeCoordinates(point.X, point.Y);
               var marker = L.marker(L.latLng(coords.lat, coords.lng), style);
           	   return marker;
           };    	   

           /**
            * Returns an array of L.latLng defining a polygon corresponding to 
            * the `elfin` FORME.ZONE at POS=1  
            */
           var getPolygonCoords = function(elfin) {

        	   var points = hbGeoService.getElfinZone1Points(elfin);
        	   // Transform each GeoXml POINT to Leaflet L.latLng 
        	   var latLngs = _.map(points, function(point){
        		   var coords = hbGeoService.getLongitudeLatitudeCoordinates(point.X,point.Y);
        		   return L.latLng(coords.lat, coords.lng); 
        		 });
        	   return latLngs;
           };


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
            * Returns ILayer object {L.circleMarker, L.marker, L.polygon} given
            * @param elfin
            * @param representation {'point', 'marker', 'polygon'}
            * @param style
            * 
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
            * Returns a custom L.Icon intended for selected object marker styling.
            */
           var getSelectedObjectMarkerStyle = function() {

       		// zIndexOffset only effective in higher version... 
       		var CustomIcon = L.Icon.extend({
       		    options: {
  		    			iconSize: [25, 41],
  		    			iconAnchor: [12, 41],
  		    			popupAnchor: [1, -34],
  		    			shadowSize: [41, 41],
  		    			zIndexOffset: 1000
       		    }
       		});	                        		
       		
//       		var selectedIcon = new CustomIcon({iconUrl: '/assets/lib/leaflet/custom/markers/marker-icon-orange.png'});
       		var selectedIcon = new CustomIcon({iconUrl: '/assets/lib/leaflet/custom/markers/marker-icon-purple.png'});
//       		var selectedIcon = new CustomIcon({iconUrl: '/assets/lib/leaflet/custom/markers/marker-icon-red.png'});
//       		var selectedIcon = new CustomIcon({iconUrl: '/assets/lib/leaflet/custom/markers/marker-icon-yellow.png'});
//       		var selectedIcon = new CustomIcon({iconUrl: '/assets/lib/leaflet/custom/markers/marker-icon-green.png'});
       		var customStyle = {icon: selectedIcon};                	
           	return customStyle;
           };           


           /**
            * Returns a custom L.Icon intended for standard object marker styling.
            */
           var getStandardObjectMarkerStyle = function() {
        	   
       		// zIndexOffset only effective in higher version... 
       		var CustomIcon = L.Icon.extend({
       		    options: {
  		    			iconSize: [25, 41],
  		    			iconAnchor: [12, 41],
  		    			popupAnchor: [1, -34],
  		    			shadowSize: [41, 41],
  		    			zIndexOffset: 999
       		    }
       		});	                        		
       		var selectedIcon = new CustomIcon({iconUrl: '/assets/lib/leaflet/custom/markers/marker-icon.png'});
       		var customStyle = {icon: selectedIcon};
           	return customStyle;
           };


           /**
            * Returns L.bounds for the layer identified by 
            * @param elfin 
            * @param representation
            */
           var getObjectBounds = function (elfin, representation) {
        	   // No need for style when computing bounds
        	   var style = {};
        	   var elfinLayer = getObjectLayer(elfin, representation, style);
        	   return elfinLayer.getBounds();
           };
           

           /**
            * Updates `layer` popup content with `elfin` data if layer has a popup.
            */
           var updateLayerPopupContent = function(elfin, layer) {
               if (angular.isDefined(layer.getPopup) && layer.getPopup()) {
                   layer.getPopup().setContent(getPopupContent(elfin));
               }
           };
           
           
           /**
            * Updates `layer` latitude, longitude coordinates from elfin.FORME.ZONE 
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
           
           return {
           	   getDefaultLeafletScopeVars: getDefaultLeafletScopeVars,
        	   getDrawLocalTranslation: getDrawLocalTranslation,
        	   getObjectBounds: getObjectBounds,
        	   getObjectLayer: getObjectLayer,
        	   getSelectedObjectMarkerStyle: getSelectedObjectMarkerStyle,
        	   getStandardObjectMarkerStyle: getStandardObjectMarkerStyle,
               updateLayerCoords: updateLayerCoords,
        	   updateLayerPopupContent: updateLayerPopupContent,
        	   updatePolygonCoords: updatePolygonCoords
           }
    }]);

})();