/**
 * Provides helper functions for Leaflet related objects 
 */

(function() {


    angular.module('hbMap').factory('HbMapLeafletService', [
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
           
           
           
            return {
                /**
                 * Provides default for angular-leaflet-directive variables extending controllers using leaftlet.
                 */
            	getDefaultLeafletScopeVars: getDefaultLeafletScopeVars,
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