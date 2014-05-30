/**
 Service to manage the main view layout
 It mainly relies on JQuery to manipulate top level divs
 */

(function() {
    angular.module('hbMap', []).factory('MapService', [
       '$log', function($log) {

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

                displayMap: function(mapDefinition) {
                    $log.debug(mapDefinition);
                }

            }



    }]);
})();