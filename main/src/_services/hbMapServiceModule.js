/**
 Service to manage the main view layout
 It mainly relies on JQuery to manipulate top level divs
 */
(function() {

    var hbMapModule = angular.module('hbMap', []);
    
    hbMapModule.factory('MapService', [
       '$log', function($log) {

    	   /**
    	    * Constants corresponding to available map display types.
    	    */
           var MAP_DISPLAY_TYPE = {
           		"FULL": "FULL",
           		"SPLIT": "SPLIT",
           		"HIDDEN":"HIDDEN"
           };
    	   
    	   /**
    	    * Returns true if the map is currently displayed. 
    	    */
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
	           
	           // Make map visible for all display types except HIDDEN
	           if (!isMapDisplayed() && mapDisplayType !== MAP_DISPLAY_TYPE.HIDDEN) {  
	        	   toggle(mainMarginsDiv, mainCardViewDiv, mainMapViewDiv);
	           }
	           
	           // Hide map for display type HIDDEN
	           if (isMapDisplayed() && mapDisplayType === MAP_DISPLAY_TYPE.HIDDEN) { 
	        	   toggle(mainMarginsDiv, mainCardViewDiv, mainMapViewDiv);
	           }
	           
	           if (mainCardViewDiv.hasClass('splitViewMargin')) {
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
	           } else {
	               mainMarginsDiv.width('');
	               mainCardViewDiv.width('');
	           }
           };

    	   /**
			* Switches map display types in turn: HIDDEN > SPLIT > FULL > HIDDEN
			*/
           var switchMapDisplayType = function (mapDisplayType) {
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
    	   };
           
           return {
        	   isMapDisplayed: isMapDisplayed,
        	   switchMapDisplayType:switchMapDisplayType
           }
    }]);

})();