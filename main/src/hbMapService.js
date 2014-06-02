/**
 Service to manage the main view layout
 It mainly relies on JQuery to manipulate top level divs
 */

(function() {
    angular.module('hbMap', []).factory('MapService', [
       '$log', 'GeoxmlService', function($log, GeoxmlService) {

            return {
                toggleMap: function() {
                    var mainMarginsDiv = $('#views-wrapper div.margin');
                    var mainCardViewDiv = $('#views-wrapper div.card-view');
                    var mainMapViewDiv = $('#views-wrapper div.map-view');
                    var mainMapViewLeafletDiv = $('#views-wrapper div.map-view-leaflet');

                    // This tells us if the Map DIV is hidden
                    mainMarginsDiv.toggleClass('splitViewMargin');
                    mainCardViewDiv.toggleClass('splitViewMargin');
                    mainMapViewDiv.toggle();

                    if (mainCardViewDiv.hasClass('splitViewMargin')) {
                        var bodyWidth = $('body').width();
                        var windowHeight = $(window).height() - 100;
                        mainMarginsDiv.width('10px');
                        mainCardViewDiv.width('600px');
                        mainMapViewDiv.width((bodyWidth - 600 - 20 - 100) + 'px');
                        mainMapViewLeafletDiv.width((bodyWidth - 600 - 20 - 100) + 'px');
                        mainMapViewDiv.height(windowHeight + 'px');
                        mainMapViewLeafletDiv.height(windowHeight + 'px');
                        return true;
                    }

                    mainMarginsDiv.width('');
                    mainCardViewDiv.width('');
                    return false;
                },

                isMapDisplayed: function() {
                    return $('#views-wrapper div.card-view').hasClass('splitViewMargin');
                },

                getObjectLayer: function(elfin, representation, style) {
                    var result = null;

                    switch (representation.toLowerCase()) {
                        case 'point': result = this.getPointLayer(elfin, style); break;
                        case 'marker': result = this.getMarkerLayer(elfin, style); break;
                        case 'polygon': result = this.getPolygonLayer(elfin, style); break;
                    }

                    if (result !== null) {
                        var popup = '<b>' + elfin.IDENTIFIANT.NOM + ' ' + elfin.IDENTIFIANT.ALIAS + '</b><br>';
                        popup += elfin.CLASSE + '<br>';
                        popup += '<a href="/elfin/' + elfin.ID_G + '/' + elfin.CLASSE + '/' + elfin.Id + '">Détails</a>';
                        result.bindPopup(popup);
                    }

                    return result;
                },

                /*
                Returns points
                 */
                getPointLayer: function(elfin, style) {
                    if (!elfin.FORME) return null;

                    var point = null;
                    angular.forEach(elfin.FORME.POINT, function(p) {
                        if (p.FONCTION.toLowerCase() === 'base') {
                            point = p;
                        }
                    });

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

                    var point = null;
                    angular.forEach(elfin.FORME.POINT, function(p) {
                        if (p.FONCTION.toLowerCase() === 'base') {
                            point = p;
                        }
                    });

                    if (!point) {
                        return null;
                    }


                    var coords = this.getLongitudeLatitudeCoordinates({X: parseFloat(point.X), Y: parseFloat(point.Y)});
                    return L.marker(coords, style);
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
                getPolygonLayer: function(elfin, style) {
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

                    return L.polygon(points, style);
                },


                /**
                 * See http://www.swisstopo.admin.ch/internet/swisstopo/fr/home/topics/survey/sys/refsys/switzerland.parsysrelated1.31216.downloadList.63873.DownloadFile.tmp/swissprojectionfr.pdf
                 * and http://mapref.org/LinkedDocuments/swiss_projection_en.pdf section 3.4
                 * @param point
                 */
                getLongitudeLatitudeCoordinates: function(point) {
                    var x = (point.Y - 200147) / 1000000;
                    var x2 = x * x;
                    var x3 = x2 * x;
                    var x4 = x3 * x;

                    var y = (point.X - 600067) / 1000000;
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
                }



            };



    }]);
})();