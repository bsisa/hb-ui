/**
 * hbGeoService provides GIS JS client functionalities as AngularJS service.  
 */

(function() {



	angular.module('hbGeo').factory('hbGeoService', ['$log', function($log) {

		// ====================================================================
		//     GeoXML ELFIN.FORME utilities
		// ====================================================================	
	
		/**
		 * TODO: remove it from hbMap service
         * Returns BASE point. 
         * 
         * There should only be a single BASE point defined.
         *  
         * If more than one BASE point is defined the latest 
         * only will be considered (the one with the greatest
         * POS value). 
         */		
		var getElfinBasePoint = function(elfin) {

			if (!elfin.FORME) return null;

			var point = null;               

			angular.forEach(elfin.FORME.POINT, function(p) {
				if (p.FONCTION.toLowerCase() === 'base') {
					point = p;
				}
			});
			return point;
		};
           
		
		// ====================================================================
		//     Swiss Federal Coordinates conversion utilities
		// 
		// References, section 4.1:
		// * http://www.swisstopo.admin.ch/internet/swisstopo/fr/home/topics/survey/sys/refsys/switzerland.parsysrelated1.31216.downloadList.63873.DownloadFile.tmp/swissprojectionfr.pdf
		// * http://mapref.org/LinkedDocuments/swiss_projection_en.pdf 
		// 
		// ====================================================================		
		
		var X_OFFSET_OFFICIAL = 600072.37; // Official
		var X_OFFSET_OBSERVED = 600067; // Observed
		var Y_OFFSET_OFFICIAL = 200147.07; // Official
		var Y_OFFSET_OBSERVED = 200147.07; // Observed

		/**
		 * Returns an object with properties {lat: float, lng: float } 
		 * for swiss federal coordinates {x_param, y_param}
		 * 
		 * @param x_param
		 * @param y_param
		 */
		var getLongitudeLatitudeCoordinates = function(x_param, y_param) {

			var point = {
				X : parseFloat(x_param),
				Y : parseFloat(y_param)
			};

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
				- 0.0025486	* x2 
				- 0.013245 * x3 
				+ 0.000048 * x4;

			var p2 = -0.27135379 
				- 0.0450442 * x
				- 0.007553 * x2 
				- 0.00146 * x3;

			var p4 = + 0.002442 
				+ 0.00132 * x;

			var latPrime = 16.902866 + p0 + p2 * y2 + p4 * y4;
			var lngPrime = 2.67825 + a1 * y + a3 * y3 + a5 * y5;

			var latitude = latPrime * 100 / 36;
			var longitude = lngPrime * 100 / 36;

			return {
				lat : latitude,
				lng : longitude
			};
		};


		/**
		 * Returns swiss federal coordinates {x,y} for latitude, longitude.
		 * Returns {0,0} If one of the parameter is missing
		 * 
		 * @param lat_param
		 * @param lng_param
		 */
		var getSwissFederalCoordinates = function(lat_param,lng_param) {
		
			if (!lat_param || !lng_param) return {x: 0, y : 0};
			
			var latLng = {lat: parseFloat(lat_param), lng: parseFloat(lng_param)}
			
			var latPrime = (latLng.lat * 36 / 100 - 169028.66 / 10000);
			var latPrime2 = latPrime * latPrime;
			var latPrime3 = latPrime2 * latPrime;
			
			var lngPrime = (latLng.lng * 36 / 100 - 26782.5 / 10000);
			var lngPrime2 = lngPrime * lngPrime;
			var lngPrime3 = lngPrime2 * lngPrime;
			
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
		};           

		return {
                getElfinBasePoint:getElfinBasePoint,
                getLongitudeLatitudeCoordinates:getLongitudeLatitudeCoordinates,
                getSwissFederalCoordinates:getSwissFederalCoordinates
		}
    }]);

})();