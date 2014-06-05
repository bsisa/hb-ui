(function () {

    angular.module('hb5').controller('MapController', ['$scope', '$rootScope', '$log', 'leafletData', 'MapService', '$location', 'GeoxmlService', 'HB_EVENTS',
        function ($scope, $rootScope, $log, leafletData, MapService, $location, GeoxmlService, HB_EVENTS) {

            $scope.center = {
                lat: 0,
                lng: 0,
                zoom: 10
            };

            $scope.layers = {
                baselayers: {
                    standard: {
                        name: 'Standard',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz'
                    },
                    black_white: {
                        name: 'Noir et Blanc',
                        url: 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
                        type: 'xyz'
                    },
                    hot: {
                        name: 'HOT',
                        url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                        type: 'xyz'
                    },
                    transport: {
                        name: 'Transport',
                        url: 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
                        type: 'xyz'
                    },
                    landscape: {
                        name: 'Paysage',
                        url: 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
                        type: 'xyz'
                    },
                    grayscale: {
                        name: 'Routes - Gris',
                        url: 'http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}',
                        type: 'xyz'
                    },
                    watercoloe: {
                        name: 'Aquarelle',
                        url: 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
                        type: 'xyz'
                    }

                },
                overlays: {

                }
            };

            /*
            The objects dictionary holds for each idg/class/id combination as text, all layers in an array
             */
            $scope.layerDictionary = {

            };

            var getElfinIdentifier = function(elfin) {
                return elfin.ID_G + '/' + elfin.CLASSE + '/' + elfin.Id;
            };


            $rootScope.$on(HB_EVENTS.DISPLAY_MAP_VIEW, function (event, displayMap) {
                if (displayMap === true) {
                    leafletData.getMap().then(function (map) {
                        map.invalidateSize();
                    });
                }
            });



            var displayLayer = function (map, id, layerDef) {
                var layer = {
                    representationStyle : {}
                };
                angular.forEach(layerDef.C, function (c) {
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
                var layerId = id + '#' + layerDef.POS;

                $scope.layers.overlays[layerId] = layerGroup;

                // Using GeoxmlService to obtain layers objects
                GeoxmlService.getCollection(layer.idg).getList({"xpath" : layer.xpath})
				.then(
						function(elfins) {
            				$log.debug("Using GeoxmlService service (2), obtained " + elfins.length + " objects.");
							var objects = [];
							var identifier;
		                    angular.forEach(elfins, function (elfin) {
		                        var objectLayer = MapService.getObjectLayer(elfin, layer.representationType, layer.representationStyle);
		                        if (objectLayer !== null) {
		                            objects.push(objectLayer);
		                            identifier = getElfinIdentifier(elfin);
		                            if (angular.isUndefined($scope.layerDictionary[identifier])) {
		                                $scope.layerDictionary[identifier] = [objectLayer];
		                            } else {
		                                $scope.layerDictionary[identifier].push(objectLayer);
		                            }
		
		                        }
		                    });
		
		                    leafletData.getLayers().then(function(layers) {
		                        angular.forEach(objects, function(objectLayer) {
		                            layers.overlays[layerId].addLayer(objectLayer);
		                        });
		                    });					
							
						},
						function(response) {
							var message = "Le chargement des objets du plan a échoué (statut de retour: "+ response.status+ ")";
							$log.error(message);
							hbAlertMessages.addAlert("danger",message);
						}
					);                

            };

            $rootScope.$on(HB_EVENTS.DISPLAY_MAP_CONTENT, function(event, mapDef) {

                leafletData.getMap().then(function (map) {

                    var center = mapDef.CARACTERISTIQUE.CAR2.VALEUR.split(' ');

                    $scope.center = {
                        lat: parseFloat(center[0]),
                        lng: parseFloat(center[1]),
                        zoom: parseFloat(center[2])
                    };

                    angular.forEach(mapDef.CARACTERISTIQUE.FRACTION.L, function (layerDef) {
                        displayLayer(map, mapDef.Id, layerDef);
                    });
                });
            });

            //"elfinUpdatedEvent"
            $rootScope.$on(HB_EVENTS.ELFIN_UPDATED, function(event, elfin) {
                var identifier = getElfinIdentifier(elfin);
                if (angular.isDefined($scope.layerDictionary[identifier])) {
                    angular.forEach($scope.layerDictionary[identifier], function(layer) {
                        MapService.updateLayerCoords(elfin, layer);
                        MapService.updatePolygonCoords(elfin, layer);
                        MapService.updateLayerPopupContent(elfin, layer);
                    });
                }
            });

        }]);


})();

