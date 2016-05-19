(function () {

    angular.module('hb5').controller('MapController', ['$scope', '$rootScope', '$log', 'leafletData', 'MapService', 'hbGeoService', 'hbGeoLeafletService', '$location', 'GeoxmlService', 'HB_EVENTS','hbOffline',
        function ($scope, $rootScope, $log, leafletData, MapService, hbGeoService, hbGeoLeafletService, $location, GeoxmlService, HB_EVENTS, hbOffline) {

    	// Get controller reference as "view model" var. 
        var vm = this;
    	
        /**
         * Sets Leaflet translations to drawLocal object.
         */ 
        angular.extend( L.drawLocal, hbGeoLeafletService.getDrawLocalTranslation() );

        /**
         * Add Leaflet Directive scope extension
         */ 
        angular.extend($scope, hbGeoLeafletService.getDefaultLeafletScopeVars());

        /**
        	Reference to current displayed object
         */
        $scope.elfin = null;
        
		/**
			The objects dictionary holds for each idg/class/id combination as text, all layers in an array
		 */
        $scope.layerDictionary = {};

        /**
        	Layer array that serve as guides
         */
        $scope.guideLayers = [];

        $scope.snappedLayer = null;

        /**
         * Returns an ELFIN identifier as a single string.
         */
        var getElfinIdentifier = function(elfin) {
            return elfin.ID_G + '/' + elfin.CLASSE + '/' + elfin.Id;
        };


        /**
         * Builds a hbLayer javascript object from HB layer definition as ELFIN.CARACTERISTIQUE.FRACTION.L data structure.
         */
        var buildHbLayer = function(hbLayerDef) {
            var hbLayer = {
                    representationStyle : {}
                };
                angular.forEach(hbLayerDef.C, function (c) {
                    switch (c.POS) {
                        case 1: hbLayer.label = c.VALUE; break;
                        case 2: hbLayer.idg = c.VALUE; break;
                        case 3: hbLayer.xpath = c.VALUE; break;
                        case 4: hbLayer.representationType = c.VALUE || 'point'; break;
                        case 5: hbLayer.representationStyle.color = c.VALUE || null; break;
                        case 6: hbLayer.representationStyle.opacity = parseFloat(c.VALUE) || null; break;
                        case 7: hbLayer.representationStyle.weight = parseFloat(c.VALUE) || null; break;
                        case 8: hbLayer.representationStyle.dashArray = c.VALUE || null; break;
                        case 9: hbLayer.representationStyle.fillColor = c.VALUE || null; break;
                        case 10: hbLayer.representationStyle.fillOpacity = parseFloat(c.VALUE) || null; break;
                        case 11: hbLayer.representationStyle.radius = parseFloat(c.VALUE) || null; break;
                    }
                });
             return hbLayer;
        };
            
        /**
         * Pushes hbLayer to objects by reference (your warned) and updates scope dictionary of objects identifiers. 
         */
        var pushLayer = function(objectLayer, objects, elfin) {
            if (objectLayer !== null) {
            	// Adds hbLayer for object on top of existing hb layer objects.
                objects.unshift(objectLayer);
                // Get triplet ID_G/CLASSE/Id
                var identifier = getElfinIdentifier(elfin);
                if (angular.isUndefined($scope.layerDictionary[identifier])) {
                	// Create a new single element array of hb layer objects.
                    $scope.layerDictionary[identifier] = [objectLayer];
                } else {
                	// Adds hbLayer for object on top of existing hb layer objects for that specific ELFIN
                    $scope.layerDictionary[identifier].unshift(objectLayer);
                }
            }            	
        };             
            
        /**
         * Procedure to build and display a HyperBird layer on a map given its definition found in an ELFIN of CLASSE='PLAN' 
         * Parameter: `hbMapDefId` is the map definition `ELFIN.Id` 
         * Parameter: `hbLayerDef` is a given layer definition found in a line L of list `ELFIN.CARACTERISTIQUE.FORME.L` 
         * 
         * IMPORTANT: The term `layer` in HyperBird matches `overlays` in Leaflet context. 
         * While `layer` in Leaflet context is used for `basemap` or `fond de plan` with regards to HyperBird semantic. 
         */
        var displayLayer = function (map, hbMapDefId, hbLayerDef) {
        	
        	//$log.debug(">>>> Map ctrler: displayLayer: hbMapDefId="+hbMapDefId+", hbLayerDef:\n"+ angular.toJson(hbLayerDef));
        	
            var hbLayer = buildHbLayer(hbLayerDef);

            // TODO: find documentation about leaflet LayerGroup properties.
            var layerGroup = {
                name: hbLayer.label,
                type: 'group',
                visible: true
            };
            
            // Build overlay Id from HB definition
            var overlayId = hbMapDefId + '#' + hbLayerDef.POS;
            
        	//$log.debug(">>>> Map ctrler: overlayId = "+overlayId+ ", layerGroup = " + angular.toJson(layerGroup) );
            $scope.layers.overlays[overlayId] = layerGroup;
            
            // Using GeoxmlService to obtain layers objects
            GeoxmlService.getCollection(hbLayer.idg).getList({"xpath" : hbLayer.xpath})
			.then(
					function(elfins) {
        				$log.debug("Using GeoxmlService service from HbMapController. Obtained " + elfins.length + " layers objects.");
						
        				var objects = [];
        				// We want this marker hbLayer to be on top 
        				var currentObjectMarkerLayer = null;
        				
						angular.forEach(elfins, function (elfin) {
	                    	
	                        var objectLayerStyle = {};
                        	var objectLayer = null;
	                        
                        	if ($scope.elfin && $scope.elfin.Id === elfin.Id && hbLayer.representationType.toLowerCase() == 'marker') {
                        		currentObjectMarkerLayer = hbGeoLeafletService.getObjectLayer(elfin, hbLayer.representationType, hbGeoLeafletService.getSelectedObjectMarkerStyle());
                        	} else {
                        		if (hbLayer.representationType.toLowerCase() == 'marker') {
                        			objectLayerStyle = hbGeoLeafletService.getStandardObjectMarkerStyle();
                        		} else {
                        			objectLayerStyle = hbLayer.representationStyle;
                        		}
                        		objectLayer = hbGeoLeafletService.getObjectLayer(elfin, hbLayer.representationType, objectLayerStyle);
                        	}		                    	
                        	
							pushLayer(objectLayer, objects, elfin);
	                    });
						
						// If available put currentObjectMarkerLayer on top of objects array
						pushLayer(currentObjectMarkerLayer, objects, $scope.elfin);
						
	
						// TODO: refactor as function => used in replaceLayer... see updateElfinRepresentation
	                    leafletData.getLayers().then(function(layers) {
	                        angular.forEach(objects, function(objectLayer) {
	                            layers.overlays[overlayId].addLayer(objectLayer);
                            });
                            // Handle snapping facilities
                            $scope.guideLayers.push(layers.overlays[overlayId]);
	                    });
						
					},
					function(response) {
						var message = "Le chargement des objets du plan a échoué (statut de retour: "+ response.status+ ")";
						$log.error(message);
						hbAlertMessages.addAlert("danger",message);
					}
				);                
        };
            
        
        var updateElfinRepresentation = function(elfin, markerStyle) {
        	$log.debug(">>>> updateElfinRepresentation(elfin.Id = "+elfin.Id+")");
            var identifier = getElfinIdentifier(elfin);
            if (angular.isDefined($scope.layerDictionary[identifier])) {
                angular.forEach($scope.layerDictionary[identifier], function (layer) {
                	
                	// TODO: investigate cyclic object value. Thought was fixed by
                	// removing hbMapService.js angular.extend(result, {elfin:elfin}); from getObjectLayer
                	// $log.debug(">>>> layer = " + angular.toJson(layer));
                	
                	//MapService.updateMarkerLayer(elfin, layer, markerStyle);
               	
                   	$log.debug(">>>> FOUND entry for identifier = " + identifier + " with nb entries = " + ($scope.layerDictionary[identifier].length) );
                   	$log.debug(">>>> layer.representation = " + layer.representation);

                   	if (layer.representation === "marker") {

						// TODO: refactor as function => used in replaceLayer... see updateElfinRepresentation
	                    leafletData.getLayers().then(function(layers) {
               	
	                        	var elfinUpdatedMarkerLayer = hbGeoLeafletService.getObjectLayer(elfin, 'marker', markerStyle);
		                    	
	                            //[overlayId].addLayer(objectLayer);
	                            angular.forEach(layers.overlays, function(overlay) {
	                            	if ( overlay.hasLayer( layer) ) {
	                            		
	                            		var gdeIdx = $scope.guideLayers.indexOf(overlay);
	                            		overlay.removeLayer(layer);
	                            		overlay.addLayer(elfinUpdatedMarkerLayer);
	                            		// Update guideLayers with updated overlay.
	                            		$scope.guideLayers.splice(gdeIdx,1);
	                            		$scope.guideLayers.push(overlay);
	                            		$log.debug(">>>> Found marker, guide idx = "+gdeIdx+", replacing by new one...");
	                            		
	                            		// Required - layer dictionary update
	                            		var dictIdx = $scope.layerDictionary[identifier].indexOf(layer);
	                            		$scope.layerDictionary[identifier].splice(dictIdx,1);
	                            		$scope.layerDictionary[identifier].push(elfinUpdatedMarkerLayer);
	                            		$log.debug(">>>> Found layer, idx = "+dictIdx+", replacing by new one...");		                            		
	                            		
//					                    	for (var property in $scope.drawControl) {
//					                    		$log.debug("Property name 2: " + property );
//					                    	}
	                            		
//		                            		$scope.drawControl.draw.marker.guideLayers = $scope.guideLayers;
//					                    	$scope.drawControl.removeFrom(layer);
//					                    	$scope.drawControl.removeFrom(overlay);
//					                    	$scope.drawControl.addTo(elfinUpdatedMarkerLayer);
//		                            		$scope.drawControl.addTo(overlay);
	                            	};		                            	
	                            });
                            // Handle snapping facilities
	                        // TODO: make it inside loop above where overlay is directly accessible
                            //$scope.guideLayers.push(layers.overlays[overlayId]);
	                    });                        	
                   		
                   	} else {
                   		hbGeoLeafletService.updateLayerCoords(elfin, layer);
                        hbGeoLeafletService.updatePolygonCoords(elfin, layer);
                        hbGeoLeafletService.updateLayerPopupContent(elfin, layer);                       		
                   	}

                });
            }
        };



        $scope.registerSnap = function(event) {
        	$log.debug(">>>> registerSnap - " + (event === null ? "event not null, " : event.layer === null ? "event.layer IS null" : "event.layer NOT null")  );
            $scope.snappedLayer = event.layer;
        };

        $scope.unregisterSnap = function(event) {
        	$log.debug(">>>> unregisterSnap - " + (event === null ? "event not null, " : event.layer === null ? "event.layer IS null" : "event.layer NOT null")  );            	
            $scope.snappedLayer = null;
        };

        /*
        Display Map Events
         */

        var displayMapViewListenerDeregister = $rootScope.$on(HB_EVENTS.DISPLAY_MAP_VIEW, function (event, displayMap) {
            if (displayMap === true) {
                leafletData.getMap().then(function (map) {
                    map.invalidateSize();
                });
            }
        });


        var displayMapContentListenerDeregister = $rootScope.$on(HB_EVENTS.DISPLAY_MAP_CONTENT, function(event, hbMapDef) {

        	// Store hb map definition in controller.  
        	vm.hbMapDef = hbMapDef;
            // Load hb map definition center latitude/longitude and zoom level.        	
        	vm.center = vm.hbMapDef.CARACTERISTIQUE.CAR2.VALEUR.split(' ');
        	
        	// Initialise leaflet tag center attribute (could be changed to vm.center...)
            $scope.center = {
                    lat: parseFloat(vm.center[0]),
                    lng: parseFloat(vm.center[1]),
                    zoom: parseFloat(vm.center[2])
            };        	
        	
        	//$log.debug(">>>> HB_EVENTS.DISPLAY_MAP_CONTENT event : " + HB_EVENTS.DISPLAY_MAP_CONTENT + " " + angular.toJson(event));
        	
            leafletData.getMap().then(function (map) {

            	$log.debug("Map zoom options before: min = " + map.options.minZoom + ", max = " +  map.options.maxZoom);
            	
            	// TODO: review hardcoded zoom limits.
            	map.options.minZoom = 1;
            	map.options.maxZoom = 40;
            	
            	// TODO: review hardcoded WIP for raster layer based on a single image.
            	var imageUrl = '/assets/images/Morges-CentreCharpentiers-RezSup.jpg';

//                <POINT POS="1" X="550000.0" Y="150000.0" Z="0.0" ALPHA="0" XS="335.98797607421875" YS="717.868896484375" ZS="0.0" ALPHAS="0" FONCTION="LIBRE" REMARQUE="repérage"/>
//                <POINT POS="2" X="550000.0" Y="150061.41" Z="0.0" ALPHA="0" XS="2813.943115234375" YS="718.0824584960938" ZS="0.0" ALPHAS="0" FONCTION="LIBRE" REMARQUE="repérage"/>
            	var point1 = {"x" : 550000.85, "y" : 150002.65};
            	var latLng1 = hbGeoService.getLongitudeLatitudeCoordinates(point1.x, point1.y);

            	//var point2 = {"x" : 550000.0, "y" : 150061.41};
            	var point2 = {"x" : 550020.45, "y" : 150014.91};
            	var latLng2 = hbGeoService.getLongitudeLatitudeCoordinates(point2.x, point2.y);
            	
            	$log.debug("    >>>>>>>>>>>>>>>>>>>>>>>>>>>>    <<<<<<<<<<<<<<<<<<<<<<<<<<<<<    ");
            	$log.debug("point1                : " + angular.toJson(point1));
            	$log.debug("point1  => latLng1    : " + angular.toJson(latLng1));
            	var point1bis = hbGeoService.getSwissFederalCoordinates(latLng1.lat, latLng1.lng);
            	$log.debug("latLng1 => point1bis  : " + angular.toJson(point1bis));
            	
            	$log.debug("point2  : " + angular.toJson(point2));
            	$log.debug("latLng2 : " + angular.toJson(latLng2));
            	$log.debug("    >>>>>>>>>>>>>>>>>>>>>>>>>>>>    <<<<<<<<<<<<<<<<<<<<<<<<<<<<<    ");
            	
            	var southWest = L.latLng(latLng1.lat, latLng1.lng);
                var northEast = L.latLng(latLng2.lat, latLng2.lng);
                var imageBounds = L.latLngBounds(southWest, northEast);

            	L.imageOverlay(imageUrl, imageBounds).addTo(map);
            	

            	
            	$log.debug("Map zoom options after:  min = " + map.options.minZoom + ", max = " +  map.options.maxZoom);            	
            	
            	// Add scale control to map with metric only (m/km, no mi/ft). 
            	L.control.scale({imperial:false, updateWhenIdle: true}).addTo(map);
            	
                // First clean all layers overlays 
                angular.forEach($scope.layers.overlays, function(overlay) {
                	// TODO: https://github.com/bsisa/hb-ui/issues/8 
                	// Fix the hereafter clearLayers call, it always complains: Error: layer.clearLayers is not a function
                	// Possible ex. see: http://stackoverflow.com/questions/22987804/mapbox-clear-marker-not-working
                	// TODO: Removing the clearLayers() call lead to problems. Notice coordinates display piling up 
                	// for each new map reload.
                	overlay.clearLayers();
                    map.removeLayer(overlay);
                });

                // Reset guideLayers
                $scope.guideLayers = [];

                // Remove draw controls
                if ($scope.drawControl) {
                    map.removeControl($scope.drawControl);
                }

                // Display each HB layer of the HB map  
                angular.forEach(hbMapDef.CARACTERISTIQUE.FRACTION.L, function (hbLayerDef) {
                    displayLayer(map, hbMapDef.Id, hbLayerDef);
                });

                // Center map
                updateCenter(map);                
                
                // Once all layers are loaded, add the drawing layer and register all events
                leafletData.getLayers().then(function(layers) {
                    var drawLayerId = "drawLayer";

                    // Initialise the FeatureGroup to store editable layers
                    layers.overlays[drawLayerId] = new L.FeatureGroup();

                    // Initialise the draw control and pass it the FeatureGroup of editable layers
                    $scope.drawControl = new L.Control.Draw({
                        draw: {
                            rectangle: false,
                            circle: false,
                            marker: { 
                            	guideLayers: $scope.guideLayers ,
                                icon: $scope.iconStyles.selectedMarker.icon
                            },
                            polyline: { guideLayers: $scope.guideLayers },
                            polygon: { guideLayers: $scope.guideLayers }
                        },
                        edit: {
                            featureGroup: layers.overlays[drawLayerId],
                            edit: false,
                            remove: false
                        }
                    });

                    layers.overlays[drawLayerId].on({
                        'snap': $scope.registerSnap,
                        'unsnap': $scope.unregisterSnap
                    });

                    map.addControl($scope.drawControl);

                    var coordinatesPlugin = L.control.coordinates({
                        position:"bottomright", //optional default "bootomright"
                        decimals:2, //optional default 4
                        decimalSeperator:".", //optional default "."
                        labelTemplateLat:"Y: {y}", //optional default "Lat: {y}"
                        labelTemplateLng:"X: {x}", //optional default "Lng: {x}"
                        enableUserInput:false, //optional default true
                        useDMS:false, //optional default false
                        useLatLngOrder: false //ordering of labels, default false-> lng-lat
                    });

                    // Override update function to get swiss federal coordinates
                    coordinatesPlugin._update = function (evt) {
                    	var pos = undefined;
                    	if (evt.latlng) {
                    		pos = hbGeoService.getSwissFederalCoordinates(evt.latlng.lat, evt.latlng.lng);	
                    	} else {
                    		pos = {x:0,y:0};
                    	}
                        
                        var opts = this.options;
                        if (pos) {
                            // pos = pos.wrap();
                            this._currentPos = pos;
                            this._inputY.value = L.NumberFormatter.round(pos.x, opts.decimals, opts.decimalSeperator);
                            this._inputX.value = L.NumberFormatter.round(pos.y, opts.decimals, opts.decimalSeperator);
                            this._label.innerHTML = this._createCoordinateLabel({lng: pos.x, lat: pos.y});
                        }
                    };
                    coordinatesPlugin.addTo(map);



                    var emitDrawEvent = function(event) {
                        $scope.$emit(HB_EVENTS.ELFIN_FORM_DRAW_EVENT, event);
                    };

                    map.on({
                        'snap': $scope.registerSnap,
                        'unsnap': $scope.unregisterSnap,
                        'draw:created' : emitDrawEvent,
                        'draw:drawstart': $scope.setDrawModeOn,
                        'draw:drawstop': $scope.setDrawModeOff,
                        'overlayadd': $scope.addLayerGuides,
                        'overlayremove': $scope.removeLayerGuides
                    });

                });
            });
        });


        /**
         * Updates leaflet bound `center` property with current 
         * elfin BASE POINT if available, otherwise uses the 
         * map configuration center and zoom default from ELFIN @ CLASSE='PLAN'  
         * @param map - a leaflet map
         */
        function updateCenter(map) {
        	// Cannot center without initialised configuration.
        	if (vm.center) {
        		var zoomVal = parseFloat(vm.center[2]);
        		
    	    	var point = hbGeoService.getElfinBasePoint($scope.elfin);
    	    	// Use base point if available
    	        if (point) {
    	        	var coords = hbGeoService.getLongitudeLatitudeCoordinates(point.X, point.Y);
    	        	var centerLatLng = L.latLng(coords.lat, coords.lng);
    	        	
    	        	// Smooth panning creates angular digest loops problems in some map load situations.
    	        	// Check if upgrading leaflet / leaflet directive solves it.
					// map.setZoom( zoomVal );
					// map.panTo( centerLatLng , {animate: true, duration: 2.0} );

    	        	// KISS solution.
    	            $scope.center = {
    	                    lat: centerLatLng.lat,
    	                    lng: centerLatLng.lng,
    	                    zoom: zoomVal
    	            };
    	        } else { // Otherwise fall back to configuration
    	            $scope.center = {
    	                    lat: parseFloat(vm.center[0]),
    	                    lng: parseFloat(vm.center[1]),
    	                    zoom: parseFloat(vm.center[2])
    	            };
    	        }
            }
        };

        // ================================================================
        // ====                    Elfin Card Events                   ====
        // ================================================================

        /**
         * An Elfin has been loaded
         */
        var elfinLoadedListenerDeregister = $rootScope.$on(HB_EVENTS.ELFIN_LOADED, function(event, elfin) {
        	// TODO: review: not relevant for all ELFIN@CLASSE, should we filter ? Base on which criteria ? FORME...
            $scope.elfin = elfin;
            $log.debug(">>>> MapController: HB_EVENTS.ELFIN_LOADED => " + elfin.CLASSE +"/"+elfin.Id);
    		if (elfin !== null) {
    			// Set newly selected elfin style to selected style.
    			var selStyle = hbGeoLeafletService.getSelectedObjectMarkerStyle();
    			updateElfinRepresentation(elfin, selStyle);
                // Center map on newly selected elfin.
    			leafletData.getMap().then(function (map) {
    				updateCenter(map);
    			});
    		}
        });


        /**
         * An Elfin has been unloaded, thus no more current elfin.
         * 
         * Warning note: On ELFIN_LOADED event may happen before or after 
         * ELFIN_UNLOADED event.
         * Do not perform operations which assert any event sequence, such as
         * $scope.elfin = null; This could reset newly loaded data! 
         */
        var elfinUnloadedListenerDeregister = $rootScope.$on(HB_EVENTS.ELFIN_UNLOADED, function(event, elfin) {

        	$log.debug(">>>> MapController: HB_EVENTS.ELFIN_UNLOADED => " + elfin.CLASSE +"/"+elfin.Id);
			if (elfin !== null) {
    			// Reset former selected elfin style to standard.
    			var stdStyle = hbGeoLeafletService.getStandardObjectMarkerStyle();
    			updateElfinRepresentation(elfin, stdStyle);
			}
        });


        /**
         * Elfin has been updated, thus update eventually coords and popup.
         * 
         * Note: Unlike in hbCardContainerController we do always need to   
         * update the ELFIN representation on the map.
         */
        var elfinUpdatedListenerDeregister = $rootScope.$on(HB_EVENTS.ELFIN_UPDATED, function(event, elfin) {
            // Check if updated elfin is the currently end user selected elfin.
        	// Note: Only `marker` style is different for selected and non selected objects.
            if ($scope.elfin.Id === elfin.Id) {
    			// Update with selected marker style.
            	updateElfinRepresentation(elfin, hbGeoLeafletService.getSelectedObjectMarkerStyle());	
            } else {
    			// Update with default marker style
            	updateElfinRepresentation(elfin, hbGeoLeafletService.getStandardObjectMarkerStyle());
            }
        });

        // Elfin has been deleted, thus remove it from the map
        var elfinDeletedListenerDeregister = $rootScope.$on(HB_EVENTS.ELFIN_DELETED, function(event, elfin) {
            var identifier = getElfinIdentifier(elfin);
            if (angular.isDefined($scope.layerDictionary[identifier])) {

                leafletData.getMap().then(function (map) {
                    angular.forEach($scope.layerDictionary[identifier], function(layer) {
                        map.removeLayer(layer);
                    });
                    delete $scope.layerDictionary[identifier];
                });
            }
        });


        /*
         Elfin Form Draw Events
         */
        $scope.removeLayerGuides = function(event) {
            // Do not change layer guides in draw mode
            if ($scope.drawModeFlag) {return;}
            var i = $scope.guideLayers.indexOf(event.layer);
            $scope.guideLayers.splice(i, 1);
        };

        $scope.addLayerGuides = function(event) {
            // Do not change layer guides in draw mode
            if ($scope.drawModeFlag) {return;}
            $scope.guideLayers.push(event.layer);
        };


        $scope.drawModeFlag = false;

        $scope.toggleDrawMode = function() {
            $scope.drawModeFlag = !$scope.drawModeFlag;
        };

        $scope.setDrawModeOn = function() {
            $scope.drawModeFlag = true;
            $scope.snappedLayer = null;
        };

        $scope.setDrawModeOff = function() {
            $scope.drawModeFlag = false;
            $scope.snappedLayer = null;
        };


        /**
         * 
         */
        $scope.$on(HB_EVENTS.ELFIN_FORM_DRAW_EVENT, function(e, mapEvent){
            if (angular.isUndefined($scope.elfin) || $scope.elfin === null) {
                return;
            }

            switch (mapEvent.layerType) {
                case 'marker': updateBasePoint(mapEvent.layer, $scope); break;
                case 'polyline': break; // TODO: implement polyline update
                case 'polygon': break; // TODO: implement polygon update

            }
        });

        /**
         * Update current `scope` parameter elfin base point with snappedLayer.elfin base point if available 
         * and has different Id than current scope elfin. Otherwise updates current scope elfin base point
         * with marker coordinates.
         * Emits HB_EVENTS.ELFIN_UPDATED for current 
         */
        // TODO: Noticed exception for snappedLayer without elfin. Check if this is a valid or invalid state.  
        var updateBasePoint = function(marker, scope) {
        	
            if (!scope.drawModeFlag) {
                return;
            }

            var currentElfinBasePoint = hbGeoService.getElfinBasePoint(scope.elfin);

            if (currentElfinBasePoint &&
                scope.snappedLayer &&
                scope.snappedLayer.elfin && // TODO: Noticed exception for snappedLayer without elfin. Check if this is a valid or invalid state.  
                scope.snappedLayer.elfin.ID_G + scope.snappedLayer.elfin.Id !== scope.elfin.ID_G + scope.elfin.Id
            ) {
            	// If the snappedLayer elfin is not the same elfin as the current selected elfin update 
            	// base point Id, ID_G, CLASSE with snapped elfin.
                var snappedExternalBasePoint = hbGeoService.getElfinBasePoint(scope.snappedLayer.elfin);
                currentElfinBasePoint.X = snappedExternalBasePoint.X;
                currentElfinBasePoint.Y = snappedExternalBasePoint.Y;
                currentElfinBasePoint.Id = scope.snappedLayer.elfin.Id + '#' + snappedExternalBasePoint.POS;
                currentElfinBasePoint.ID_G = scope.snappedLayer.elfin.ID_G;
                currentElfinBasePoint.CLASSE = scope.snappedLayer.elfin.CLASSE;

            } else {
                var coords = hbGeoService.getSwissFederalCoordinates(marker.getLatLng().lat,marker.getLatLng().lng);

                currentElfinBasePoint.X = coords.x;
                currentElfinBasePoint.Y = coords.y;
                // TODO: Shouldn't we preserve existing Id, ID_G, CLASSE instead of resetting them ?
                currentElfinBasePoint.Id = null;
                currentElfinBasePoint.ID_G = null;
                currentElfinBasePoint.CLASSE = null;
            }

            $scope.$emit(HB_EVENTS.ELFIN_UPDATED, scope.elfin);
        };
        
        // ================================================================
        // ======================= geographie test bed ====================
        // ================================================================

        /**
         * Zoom map to current selected ELFIN
         */
        vm.zoomToCurrentObject = function() {
            // zoom the map to the currentElfinLayerToZoomTo
        	leafletData.getMap().then(function (map) {
//        		map.fitBounds(hbGeoLeafletService.getObjectBounds($scope.elfin, 'polygon'));
        		map.fitBounds(hbGeoLeafletService.getObjectBounds($scope.elfin, 'marker'));
            });
        };           

        var getHbLayerForStyle = function(color, opacity) {
        	
			// Let change layer color to red for this object
    		var updatefleetLayerConf = getFleetHbLayerDefault();
    		updatefleetLayerConf.label = "not used";
    		updatefleetLayerConf.styleFillColor = color;
    		updatefleetLayerConf.styleFillOpacity = opacity;

        	var hbLayerDef = getHbLayerDefLine(updatefleetLayerConf.posNb, updatefleetLayerConf.label, updatefleetLayerConf.collectionId, updatefleetLayerConf.xpath, updatefleetLayerConf.type, updatefleetLayerConf.styleColor, updatefleetLayerConf.styleOpacity, 
        			updatefleetLayerConf.styleWeight, updatefleetLayerConf.styleDashArray, updatefleetLayerConf.styleFillColor, updatefleetLayerConf.styleFillOpacity, updatefleetLayerConf.styleRadius);					        		
		
			var hbLayer = buildHbLayer(hbLayerDef);            	
        	return hbLayer;
        }; 
        
        var getLayerForElfin = function(elfin, state) {
        	var color = (state === "moving") ? "red" : "green";
        	var opacity = (state === "moving") ? "0.8" : "0.6";
        	// Builds hb layer customising styles.
        	var hbLayer = getHbLayerForStyle(color, opacity);
        	// Builds leaflet layer for hbLayer representation type and style and sets position and popup information using elfin data. 
        	var elfinUpdatedLeafletLayer = hbGeoLeafletService.getObjectLayer(elfin, hbLayer.representationType, hbLayer.representationStyle);
        	return elfinUpdatedLeafletLayer;
        };



        // ================================================================
        // ================================================================
        
        /**
         * Clean up rootScope listeners explicitely (required). 
         */
        $scope.$on('$destroy', function(event, data){
        	$log.debug(">>>> $destroy called for hbMapController <<<<<<<<<<");
        	$log.debug(">>>> MapController: proceed with rootscope listeners deregistration:  displayMapViewListenerDeregister, displayMapContentListenerDeregister, elfinLoadedListenerDeregister, elfinUnloadedListenerDeregister, elfinUpdatedListenerDeregister, elfinDeletedListenerDeregister");
        	//switchMapDisplayListener;
        	displayMapViewListenerDeregister();
        	displayMapContentListenerDeregister();
        	elfinLoadedListenerDeregister();
        	elfinUnloadedListenerDeregister();
        	elfinUpdatedListenerDeregister();
        	elfinDeletedListenerDeregister();
        });
        
        
        // =======================================================================================
        // =========================== Display connection status using SSE =======================
        // =======================================================================================        	
        
        $scope.sseConnected = true;
        $scope.sseLastCheck = new Date();
        $scope.sseSupport = hbOffline.getIsSseSupported;

        // Set up status EventSource listeners only if SSE is supported
        if (hbOffline.getIsSseSupported) {
        	
            var statusEventSource = hbOffline.getStatusEventSource();
            
            // Process SSE message {"group" : "", "text" : "", "user" : "" , "time" : ""} 
    		statusEventSource.onmessage = function(event) {  
    			//$log.debug("onmessage: Received server side event.data = " + event.data);
    			$scope.$apply(function () {
    				$scope.sseConnected = true;
    				$scope.sseMessage = JSON.parse(event.data);
    				$scope.sseLastCheck = new Date();
    			});
    		}
    		
			statusEventSource.onopen = function(event) {
				$log.debug("onopen: Connected to server. Waiting for data...");
				$scope.$apply(function () {
					$scope.sseConnected = false;
				});
			}

			statusEventSource.onerror = function(event) {
				var txt;
				switch (event.target.readyState) {
					case EventSource.CONNECTING:
						$scope.$apply(function () {
							$scope.sseConnected = false;
						});
						txt = 'Reconnecting...';
						break;
					case EventSource.CLOSED:
						$scope.$apply(function () {
							$scope.sseConnected = false;
						});
						txt = 'Connection failed. Will not retry.';
						break;
				}
				$log.debug("onerror: " + txt);
			}    	

        } else {
        	$scope.sseConnected = false;
        	$scope.sseMessage = {"group" : "status", "text" : "no SSE support", "user" : "client", "time" : new Date() };
        	$scope.sseLastCheck = new Date();
        }
        
        $scope.sse = {
        	"userMessage" : ""
        };

        $scope.checkConnectionStatus = function() {
        	hbOffline.forceStatusEvenSourceReload();
        };
        
        // =======================================================================================        

    }]);

})();

