(function () {

    angular.module('hb5').controller('MapController', ['$scope', '$rootScope', '$log', 'leafletData', 'MapService', '$location', 'GeoxmlService', 'HB_EVENTS',
        function ($scope, $rootScope, $log, leafletData, MapService, $location, GeoxmlService, HB_EVENTS) {


            /**
             * Add Leaflet Directive scope extension
             */ 
            angular.extend($scope, {
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
                        },
// www.toolserver.org moved and could not find resource anymore.
//                        black_white: {
//                            name: 'Noir et Blanc',
//                            url: 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
//                            type: 'xyz'
//                        },
//                        hot: {
//                            name: 'HOT',
//                            url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
//                            type: 'xyz'
//                        },
//                        transport: {
//                            name: 'Transport',
//                            url: 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
//                            type: 'xyz'
//                        },
//                        landscape: {
//                            name: 'Paysage',
//                            url: 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
//                            type: 'xyz'
//                        },
//                        grayscale: {
//                            name: 'Routes - Gris',
//                            url: 'http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}',
//                            type: 'xyz'
//                        },
//                        watercoloe: {
//                            name: 'Aquarelle',
//                            url: 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
//                            type: 'xyz'
//                        },
                        gespatri: {
                            name: 'Gespatri',
                            type: 'imageOverlay',
                            url: '/assets/images/abribus.jpeg',
                            bounds: [[46.992737010038404, 6.931471483187033], [46.99302251894073, 6.931947239697114]],
                            //{"_southWest":{"lat":46.992737010038404,"lng":6.931471483187033},"_northEast":{"lat":46.99302251894073,"lng":6.931947239697114}}
                            layerParams: {
                              noWrap: true,
                              attribution: 'Custom map <a href="http://www.bsisa.ch/">by BSI SA</a>'
                            }
                        }                        

                    },
                    overlays: {

                    }
                }
            });

            /**
            	Reference to current displayed object
             */
            $scope.elfin = null;
            
			/**
			 * Listener on current displayed object Id change
			 */
			$scope.$watch('elfin.Id', function(newVal, oldVal) {
				$log.debug(">>>> Map selected elfin.Id changed from: "+oldVal+" to: " + newVal);
			}, true);            
            
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
             * Procedure to build and display a HyperBird layer on a map given its ELFIN.CARACTERISTIQUE.FORME.L definition
             * found in an ELFIN of CLASSE='PLAN'
             * IMPORTANT: The term `layer` in HyperBird matches `overlays` in Leaflet context. 
             * While `layer` in Leaflet context is used for `basemap` or `fond de plan` with regards to HyperBird semantic. 
             */
            var displayLayer = function (map, id, hbLayerDef) {
            	
            	$log.debug(">>>> Map ctrler: displayLayer: id="+id+", hbLayerDef:\n"+ angular.toJson(hbLayerDef));
            	
                var layer = {
                    representationStyle : {}
                };
                angular.forEach(hbLayerDef.C, function (c) {
                    switch (c.POS) {
                        case 1: layer.label = c.VALUE; break;
                        case 2: layer.idg = c.VALUE; break;
                        case 3: layer.xpath = c.VALUE; break;
                        case 4: layer.representationType = c.VALUE || 'point'; break;
                        case 5: layer.representationStyle.color = c.VALUE || null; break;
                        case 6: layer.representationStyle.opacity = parseFloat(c.VALUE) || null; break;
                        case 7: layer.representationStyle.weight = parseFloat(c.VALUE) || null; break;
                        case 8: layer.representationStyle.dashArray = c.VALUE || null; break;
                        case 9: layer.representationStyle.fillColor = c.VALUE || null; break;
                        case 10: layer.representationStyle.fillOpacity = parseFloat(c.VALUE) || null; break;
                        case 11: layer.representationStyle.radius = parseFloat(c.VALUE) || null; break;
                    }
                });

                var layerGroup = {
                    name: layer.label,
                    type: 'group',
                    visible: true
                };
                var layerId = id + '#' + hbLayerDef.POS;
            	$log.debug(">>>> Map ctrler: layerId = "+layerId+ ", layerGroup = " + angular.toJson(layerGroup) );
                $scope.layers.overlays[layerId] = layerGroup;

                
                /**
                 * Pushes layer to objects by reference (your warned) and updates scope dictionary of objects identifiers. 
                 */
                var pushLayer = function(objectLayer, objects, elfin) {
                    if (objectLayer !== null) {
                        objects.unshift(objectLayer);
                        var identifier = getElfinIdentifier(elfin);
                        if (angular.isUndefined($scope.layerDictionary[identifier])) {
                            $scope.layerDictionary[identifier] = [objectLayer];
                        } else {
                            $scope.layerDictionary[identifier].unshift(objectLayer);
                        }
                    }            	
                };                
                
                
                // Using GeoxmlService to obtain layers objects
                GeoxmlService.getCollection(layer.idg).getList({"xpath" : layer.xpath})
				.then(
						function(elfins) {
            				$log.debug("Using GeoxmlService service from HbMapController. Obtained " + elfins.length + " layers objects.");
							
            				var objects = [];
            				// We want this marker layer to be on top 
            				var currentObjectMarkerLayer = null;
            				
							angular.forEach(elfins, function (elfin) {
		                    	
		                        var objectLayerStyle = {};
	                        	var objectLayer = null;
		                        
	                        	if ($scope.elfin.Id === elfin.Id && layer.representationType.toLowerCase() == 'marker') {
	                        		currentObjectMarkerLayer = MapService.getObjectLayer(elfin, layer.representationType, MapService.getSelectedObjectMarkerStyle());
	                        	} else {
	                        		objectLayerStyle = layer.representationStyle;
	                        		objectLayer = MapService.getObjectLayer(elfin, layer.representationType, objectLayerStyle);
	                        	}		                    	
	                        	
								pushLayer(objectLayer, objects, elfin);
		                    });
							
							// If available put currentObjectMarkerLayer on top of objects array
							pushLayer(currentObjectMarkerLayer, objects, $scope.elfin);
							
		
		                    leafletData.getLayers().then(function(layers) {
		                        angular.forEach(objects, function(objectLayer) {
		                            layers.overlays[layerId].addLayer(objectLayer);
                                });
                                // Handle snapping facilities
                                $scope.guideLayers.push(layers.overlays[layerId]);
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
                    	MapService.getObjectLayer(elfin, 'marker', markerStyle);
                    	
                    	
                    	
                    	// Perform update... >>> $scope.layerDictionary[identifier]
                    	var identifier = getElfinIdentifier(elfin);
                        if (angular.isUndefined($scope.layerDictionary[identifier])) {
                        	$log.debug(">>>> NOT FOUND entry for identifier = " + identifier );
                        } else {
                        	$log.debug(">>>> FOUND entry for identifier = " + identifier + " with nb entries = " + ($scope.layerDictionary[identifier].length) );
                        	
                        	//$scope.layers.overlays[layerId].addLayer(objectLayer);
                        	//$log.debug(">>>> FOUND entry for identifier = " + identifier + "\n" + angular.toJson($scope.layerDictionary[identifier]));
                        }                    	
                    	
                        MapService.updateLayerCoords(elfin, layer);
                        MapService.updatePolygonCoords(elfin, layer);
                        MapService.updateLayerPopupContent(elfin, layer);
                    });
                }
            };



            $scope.registerSnap = function(event) {
                $scope.snappedLayer = event.layer;
            };

            $scope.unregisterSnap = function(event) {
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


            var displayMapContentListenerDeregister = $rootScope.$on(HB_EVENTS.DISPLAY_MAP_CONTENT, function(event, mapDef) {

                leafletData.getMap().then(function (map) {

                    // First clean all layers and controls
                    angular.forEach($scope.layers.overlays, function(layer) {
                    	// TODO: https://github.com/bsisa/hb-ui/issues/8 
                    	// Fix the hereafter clearLayers call, it always complains: Error: layer.clearLayers is not a function
                    	// Possible ex. see: http://stackoverflow.com/questions/22987804/mapbox-clear-marker-not-working
                    	// TODO: Removing the clearLayers() call lead to problems. Notice coordinates display piling up 
                    	// for each new map reload.
                    	layer.clearLayers();
                        map.removeLayer(layer);
                    });

                    $scope.guideLayers = [];

                    if ($scope.drawControl) {
                        map.removeControl($scope.drawControl);
                    }

                    var center = mapDef.CARACTERISTIQUE.CAR2.VALEUR.split(' ');

                    $scope.center = {
                        lat: parseFloat(center[0]),
                        lng: parseFloat(center[1]),
                        zoom: parseFloat(center[2])
                    };


                    angular.forEach(mapDef.CARACTERISTIQUE.FRACTION.L, function (hbLayerDef) {
//TODO:                     	$log.debug("hbLayerDef = " + angular.toJson(hbLayerDef));
                        displayLayer(map, mapDef.Id, hbLayerDef);
                    });

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
                                marker: { guideLayers: $scope.guideLayers },
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
                            var pos = MapService.getSwissFederalCoordinates(evt.latlng),
                                opts = this.options;
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


            /*
             Elfin Card Events
             */

            // Elfin has been loaded
            var elfinLoadedListenerDeregister = $rootScope.$on(HB_EVENTS.ELFIN_LOADED, function(event, elfin) {
            	// TODO: review: not relevant for all ELFIN@CLASSE !
                $scope.elfin = elfin;
                updateElfinRepresentation($scope.elfin, MapService.getSelectedObjectMarkerStyle());
                $log.debug(">>>> MapController: HB_EVENTS.ELFIN_LOADED => " + elfin.CLASSE +"/"+elfin.Id);
            });

            // Elfin has been unloaded, thus no more current elfin
            var elfinUnloadedListenerDeregister = $rootScope.$on(HB_EVENTS.ELFIN_UNLOADED, function(event, elfin) {
                if (elfin) {
                    updateElfinRepresentation(elfin, {});
                }
                $log.debug(">>>> MapController: HB_EVENTS.ELFIN_UNLOADED => " + elfin.CLASSE +"/"+elfin.Id);
                // TODO: This causes problem due to possible reset of formerly updated elfin 
                // on ELFIN_LOADED event. Indeed the events order is not necessarily as UNLOAD => LOAD but can be
                // reversed due to asynchronous execution. 
                //$scope.elfin = null; 

            });


            /**
             * Elfin has been updated, thus update eventually coords and popup.
             * 
             * Note: Unlike in hbCardContainerController we do always need to   
             * update the ELFIN representation on the map.
             */
            var elfinUpdatedListenerDeregister = $rootScope.$on(HB_EVENTS.ELFIN_UPDATED, function(event, elfin) {
                $log.debug(">>>> MapController: HB_EVENTS.ELFIN_UPDATED => " + elfin.CLASSE +"/"+elfin.Id);            	
               	updateElfinRepresentation(elfin, {});            		
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


            $scope.$on(HB_EVENTS.ELFIN_FORM_DRAW_EVENT, function(e, mapEvent){
                if (angular.isUndefined($scope.elfin) || $scope.elfin === null) {
                    return;
                }

                switch (mapEvent.layerType) {
                    case 'marker': updateBasePoint(mapEvent.layer, $scope); break;
                    case 'polyline': break;
                    case 'polygon': break;

                }
            });

            var updateBasePoint = function(marker, scope) {
                if (!scope.drawModeFlag) {
                    return;
                }


                var basePoint = MapService.getElfinBasePoint(scope.elfin);

                if (basePoint &&
                    scope.snappedLayer &&
                    scope.snappedLayer.elfin.ID_G + scope.snappedLayer.elfin.Id !== scope.elfin.ID_G + scope.elfin.Id
                ) {
                    var externalBasePoint = MapService.getElfinBasePoint(scope.snappedLayer.elfin);
                    basePoint.X = externalBasePoint.X;
                    basePoint.Y = externalBasePoint.Y;
                    basePoint.Id = scope.snappedLayer.elfin.Id + '#' + externalBasePoint.POS;
                    basePoint.ID_G = scope.snappedLayer.elfin.ID_G;
                    basePoint.CLASSE = scope.snappedLayer.elfin.CLASSE;

                } else {
                    var coords = MapService.getSwissFederalCoordinates(marker.getLatLng());

                    basePoint.X = coords.x;
                    basePoint.Y = coords.y;
                    basePoint.Id = null;
                    basePoint.ID_G = null;
                    basePoint.CLASSE = null;
                }



                $scope.$emit(HB_EVENTS.ELFIN_UPDATED, scope.elfin);
            };
            
            // ================================================================
            // ======================= geographie test bed ====================
            // ================================================================

            /**
             * Zoom map to current selected ELFIN
             */
            $scope.zoomToCurrentObject = function() {
	            // zoom the map to the currentElfinLayerToZoomTo
            	leafletData.getMap().then(function (map) {
            		map.fitBounds(MapService.getObjectBounds($scope.elfin, 'polygon'));
                });
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
            
        }]);


    // Translations
    angular.extend(L.drawLocal, {
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
                        start: 'Click our commencer à dessiner la ligne.',
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
    });
})();

