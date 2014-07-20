/**
 * hb5 module filters 
 *  
 * @author Patrick Refondini 
 */
(function() {

	/**
	 * Filter returning all array elements except last one
	 */
	angular.module('hb5').filter('notLastFilter', [function () {

		return function (elements) {
	        if (!angular.isUndefined(elements)) {
	            var tempElements = [];
	            for (var i = 0; i < elements.length-1; i++) {
					var element = elements[i];
					tempElements.push(element);
				}
	            return tempElements;
	        } else {
	            return elements;
	        }
	    };
	}]);
	
	
	/**
	 * Filter specialised for ELFIN ANNEXE RENVOI ...
	 */
	angular.module('hb5').filter('annexNoPhototFilter', [function () {

		return function (RENVOIS) {
	        if (!angular.isUndefined(RENVOIS)) {
	            var tempElements = [];
	            for (var i = 0; i < RENVOIS.length; i++) {
					var RENVOI = RENVOIS[i];
					if ( RENVOI.VALUE.toLowerCase().indexOf("photo") == -1 ) {
					tempElements.push(RENVOI);
					}
				}
	            return tempElements;
	        } else {
	            return RENVOIS;
	        }
	    };
	}]);	
	
})();