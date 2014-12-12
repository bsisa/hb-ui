/**
 Service to manage the main view layout
 It mainly relies on JQuery to manipulate top level divs
 */

(function() {


    angular.module('hbMap', []).factory('MapService', [
       '$log', 'GeoxmlService', function($log, GeoxmlService) {

           //TODO: move to constants
           var MAP_DISPLAY_TYPE = {
           		"FULL": "FULL",
           		"SPLIT": "SPLIT",
           		"HIDDEN":"HIDDEN"
           };
    	   
           var isMapDisplayed = function() {
               return $('#views-wrapper div.card-view').hasClass('splitViewMargin');
           };

           /**
            * Code block dealing with div toggle operation
            */
           var toggle = function(mainMarginsDiv, mainCardViewDiv, mainMapViewDiv) {
        	   mainMarginsDiv.toggleClass('splitViewMargin');
	           mainCardViewDiv.toggleClass('splitViewMargin');
	           mainMapViewDiv.toggle();
           };
           
           /**
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
	           } else if (isMapDisplayed() && mapDisplayType === MAP_DISPLAY_TYPE.HIDDEN) { // Hide map for display type HIDDEN
	        	   toggle(mainMarginsDiv, mainCardViewDiv, mainMapViewDiv);
	           }
	           
	           if (mainCardViewDiv.hasClass('splitViewMargin')) {
	           	$log.debug(">>>>>> hbMapService mainCardViewDiv HAS Class splitViewMargin <<<<<<");
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
	           	$log.debug(">>>>>> hbMapService mainCardViewDiv DOES NOT HAVE Class splitViewMargin <<<<<<");
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
                
                getPopupContent: function(elfin) {
                    var popup = '<b>' + elfin.IDENTIFIANT.NOM + ' ' + elfin.IDENTIFIANT.ALIAS + '</b><br>';
                    popup += elfin.CLASSE + '<br>';
                    popup += '<a href="/elfin/' + elfin.ID_G + '/' + elfin.CLASSE + '/' + elfin.Id + '">Détails</a>';

                    return popup;
                },

                getObjectLayer: function(elfin, representation, style) {
                    var result = null;

                    switch (representation.toLowerCase()) {
                        case 'point': result = this.getPointLayer(elfin, style); break;
                        case 'marker': result = this.getMarkerLayer(elfin, style); break;
                        case 'polygon': result = this.getPolygonLayer(elfin, style); break;
                    }

                    if (result !== null) {
                        result.bindPopup(this.getPopupContent(elfin));
                        angular.extend(result, {elfin:elfin});
                    }

                    return result;
                },

                updateLayerPopupContent: function(elfin, layer) {
                    if (angular.isDefined(layer.getPopup) && layer.getPopup()) {
                        layer.getPopup().setContent(this.getPopupContent(elfin));
                    }
                },

                /**
                 * Returns BASE point. 
                 * 
                 * There should only be a single BASE point defined.
                 *  
                 * If more than one BASE point is defined the latest 
                 * only will be considered (the one with the greatest
                 * POS value). 
                 */
                getElfinBasePoint: function(elfin) {
                    var point = null;
                    angular.forEach(elfin.FORME.POINT, function(p) {
                        if (p.FONCTION.toLowerCase() === 'base') {
                            point = p;
                        }
                    });
                    return point;
                },


                getPointLayer: function(elfin, style) {
                    if (!elfin.FORME) return null;

                    var point = this.getElfinBasePoint(elfin);
                    if (!point) {
                        return null;
                    }

                    var coords = this.getLongitudeLatitudeCoordinates({X: parseFloat(point.X), Y: parseFloat(point.Y)});

                    return L.circleMarker(coords, style);
                },

                /*
                Return markers
                 */
                getMarkerLayer: function(elfin, style) {
                    if (!elfin.FORME) return null;

                    var point = this.getElfinBasePoint(elfin);
                    if (!point) {
                        return null;
                    }

                    var coords = this.getLongitudeLatitudeCoordinates({X: parseFloat(point.X), Y: parseFloat(point.Y)});
                    return L.marker(coords, style);
                },

                updateLayerCoords: function(elfin, layer) {

                    if (angular.isDefined(layer.setLatLng)) {
                        var point = this.getElfinBasePoint(elfin);
                        if (point) {
                            var coords = this.getLongitudeLatitudeCoordinates({X: parseFloat(point.X), Y: parseFloat(point.Y)});
                            layer.setLatLng(coords);
                        }
                    }
                },


                findElementWithPos: function(array, pos) {
                    var element = null;
                    angular.forEach(array, function(e) {
                        if (e.POS === parseInt(pos)) {
                            element = e;
                        }
                    });
                    return element;
                },


                /*
                Return polygons
                 */
                getPolygonCoords: function(elfin) {
                    if (!elfin.FORME) return null;

                    var zoneDef = this.findElementWithPos(elfin.FORME.ZONE, '1');
                    if (!zoneDef) return null;

                    var points = [];

                    var that = this;

                    angular.forEach(zoneDef.LIGNE, function(l) {
                        var lPos = l.Id.split('#')[1];
                        var lineDef = that.findElementWithPos(elfin.FORME.LIGNE, lPos);

                        angular.forEach(lineDef.PASSAGE, function(p) {
                            var pPos = p.Id.split('#')[1];
                            var pointDef = that.findElementWithPos(elfin.FORME.POINT, pPos);
                            points.push(that.getLongitudeLatitudeCoordinates({X: parseFloat(pointDef.X), Y: parseFloat(pointDef.Y)}));
                        });
                    });

                    return points;
                },


                getPolygonLayer: function(elfin, style) {
                    var coords = this.getPolygonCoords(elfin);
                    if (coords && coords.length > 0) {
                        return L.polygon(coords, style);
                    }

                    return null;
                },

                updatePolygonCoords: function(elfin, layer) {
                    if (angular.isDefined(layer.setsetLatLngs)) {
                        var coords = this.getPolygonCoords(elfin);
                        if (coords && coords.length > 0) {
                            layer.setLatLngs(coords);
                        }
                    }

                },


                /**
                 * See http://www.swisstopo.admin.ch/internet/swisstopo/fr/home/topics/survey/sys/refsys/switzerland.parsysrelated1.31216.downloadList.63873.DownloadFile.tmp/swissprojectionfr.pdf
                 * and http://mapref.org/LinkedDocuments/swiss_projection_en.pdf section 3.4
                 * @param point
                 */
                getLongitudeLatitudeCoordinates: function(point) {
                    var x = (point.Y - Y_OFFSET_OBSERVED) / 1000000;
                    var x2 = x * x;
                    var x3 = x2 * x;
                    var x4 = x3 * x;

                    var y = (point.X - X_OFFSET_OBSERVED) / 1000000;
                    var y2 = y * y;
                    var y3 = y2 * y;
                    var y4 = y3 * y;
                    var y5 = y4 * y;

                    var a1 = + 4.72973056
                        + 0.7925714 * x
                        + 0.132812 * x2
                        + 0.02550 * x3
                        + 0.0048 * x4;

                    var a3 = - 0.044270
                        - 0.02550 * x
                        - 0.0096 * x2;

                    var a5 = + 0.00096;

                    var p0 = 0
                        + 3.23864877 * x
                        - 0.0025486 * x2
                        - 0.013245 * x3
                        + 0.000048 * x4;

                    var p2 = - 0.27135379
                        - 0.0450442 * x
                        - 0.007553 * x2
                        - 0.00146 * x3;

                    var p4 = + 0.002442
                        + 0.00132 * x;

                    var latPrime = 16.902866 + p0 + p2 * y2 + p4 * y4;
                    var lonPrime = 2.67825 + a1 * y + a3 * y3 + a5 * y5;

                    var latitude = latPrime * 100 / 36;
                    var longitude = lonPrime * 100 / 36;

                    return L.latLng(latitude, longitude);
                },

                /**
                 * See http://www.swisstopo.admin.ch/internet/swisstopo/fr/home/topics/survey/sys/refsys/switzerland.parsysrelated1.31216.downloadList.63873.DownloadFile.tmp/swissprojectionfr.pdf
                 * and http://mapref.org/LinkedDocuments/swiss_projection_en.pdf section 4.1
                 * @param latLong
                 */
                getSwissFederalCoordinates: function(latLng) {
                    if (!latLng) return {x: 0, y : 0};

                    var latPrime = (latLng.lat * 36 / 100 - 169028.66 / 10000) ,
                        latPrime2 = latPrime * latPrime,
                        latPrime3 = latPrime2 * latPrime,
                        lngPrime = (latLng.lng * 36 / 100 - 26782.5 / 10000) ,
                        lngPrime2 = lngPrime * lngPrime,
                        lngPrime3 = lngPrime2 * lngPrime;

                    var y = X_OFFSET_OFFICIAL
                        + 211455.93 * lngPrime
                        - 10938.51 * lngPrime * latPrime
                        - 0.36 * lngPrime * latPrime2
                        - 44.54 * lngPrime3;

                    var x = Y_OFFSET_OFFICIAL
                        + 308807.95 * latPrime
                        + 3745.25 * lngPrime2
                        + 76.63 * latPrime2
                        - 194.56 * lngPrime2 * latPrime
                        + 119.79 * latPrime3;

                    // It is inversed because the original formula gives result in a
                    // transformed coordinate system.
                    return {x: y, y : x};

                }
            }
    }]);

    var X_OFFSET_OFFICIAL = 600072.37; // Official
    var X_OFFSET_OBSERVED = 600067; // Observed
    var Y_OFFSET_OFFICIAL = 200147.07; // Official
    var Y_OFFSET_OBSERVED = 200147.07; // Observed


})();