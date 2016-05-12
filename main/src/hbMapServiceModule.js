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
                }
                
            }
    }]);

})();