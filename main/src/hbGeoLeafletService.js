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


    angular.module('hbMap').factory('hbGeoLeafletService', [
       '$log', function($log) {

           /**
            * See doc at bottom service return definition. 
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
            * See doc at bottom service return definition. 
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
            * See doc at bottom service return definition. 
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
            * See doc at bottom service return definition. 
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
           
           
            return {
                /**
                 * Provides default for angular-leaflet-directive variables extending controllers using leaftlet.
                 */
            	getDefaultLeafletScopeVars: getDefaultLeafletScopeVars,
                /**
                 * Returns tooltips, buttons, actions, toolbar,... labels translated properties to extend/merge with L.drawLocal. 
                 * (Currently hardcoded to french only, can be extended to database configured per language locale as needed).
                 */            	
            	getDrawLocalTranslation: getDrawLocalTranslation,
                /**
                 * Returns a custom L.Icon intended for selected object marker styling.
                 */
            	getSelectedObjectMarkerStyle:getSelectedObjectMarkerStyle,
                /**
                 * Returns a custom L.Icon intended for standard object marker styling.
                 */
            	getStandardObjectMarkerStyle:getStandardObjectMarkerStyle
            	
            }
    }]);

})();