(function() {

	/**
	 * Small utility service intended to share functions not states between miscellaneous controllers
	 * without code duplication.
	 */
	
	angular.module('hb5').service('hbUtil', ['$window',function ($window) {

		/**
		 * Returns the YYYY-MM-DD string corresponding to the date parameter
		 */
		var getDateInHbTextFormat = function(date) {
			// Get day as string
			var dd = date.getDate().toString();
			// Get month as string. Note monthes are
			// zero based.
			var mm = (date.getMonth() + 1).toString();
			// Get full year
			var yyyy = date.getFullYear().toString();
			// Make sure string day and month are padded
			// with zero when necessary
			return yyyy
					+ "-"
					+ (mm.length === 2 ? mm : "0"
							+ mm[0])
					+ "-"
					+ (dd.length === 2 ? dd : "0"
							+ dd[0]);
		};
		
		
        /**
         * Sort any array by its elements POS property.
         * Assumes the array elements possess POS property of Int type.  
         */
        var reorderArrayByPOS = function(array) {
            array.sort(function(a, b) {
                return parseInt(a.POS) - parseInt(b.POS);
            });
        };		
		
        
        /**
         * Encode a URL parameter with notable exception of single quote '.
         * 
         * Use encodeURIComponent to encode a URL parameter.
         * Do not use this on a full URL it will break it escaping forward slashes,...
         * encodeURI() can be used on URL instead.
         */
        var encodeUriParameter = function(uriParameter) {
        	return $window.encodeURIComponent(uriParameter);
        };
        
        /**
         * Builds a URL query string such as "?FIRST_PARAM=test&SECOND_PARAM=xxx"
         * where parameters is expected to be an array of objects with 
         * name and value properties.
         * 
         * The parameters are encoded. 
         */
        var buildUrlQueryString = function(parameters) {

	        var queryString = "";
	    	for (var i=0; i < parameters.length; i++) {
	    		var field = parameters[i];
	    		if (i===0) {
	    			queryString += "?" + field.name + "=" + encodeUriParameter(field.value);
	    		} else {
	    			queryString += "&" + field.name + "=" + encodeUriParameter(field.value);
	    		}
	    	}
	    	return queryString;
        };
        
        /**
         * Transforms parameters array of objects with properties {label,name,value}
         * to a single object with {key1:value1, key2:value2, key3,value3} 
         * where names are mapped to keys and values to values.
         */
        var buildKeyValueObject = function(parameters) {
	        var keyValueObj = {};
	    	for (var i=0; i < parameters.length; i++) {
	    		var field = parameters[i];
	    		keyValueObj[field.name] = field.value;
	    	}
	    	return keyValueObj;
        };        


        /**
         * Reads a source object property value defined at sourcePath.
         * Example: getValueAtPath(elfin, 'PARTENAIRE.FOURNISSEUR.VALUE')
         */
        var getValueAtPath = function (source, sourcePath) {
            var sourcePathComponents = sourcePath.split('.');
            var objectRef = source;
            var value = null;
            var index;
            for (index = 0; index < sourcePathComponents.length; ++index) {
                var pathElement = sourcePathComponents[index];
                if (index == sourcePathComponents.length - 1) {
                	// Get value at sourcePath
                	value = objectRef[pathElement];
                } else {
                    // Go down a level
                    objectRef = objectRef[pathElement];
                }
            }
            return value;
        };        
        
        
        /**
         * Performs update of 'target' object property at 'path' with newValue 
         * given a target object a path defined JSON path as string and a new 
         * value to assign.
         * 
         * For instance: applyPath(elfin, 'IDENTIFIANT.NOM', 'Nouveau nom')
         * 
         */
        var applyPath = function(target, path, newValue) {
        	// The path is expected to be a string.
        	if (!angular.isString(path)) {
                  return;
            }
            var pathComponents = path.split('.');
            var objectRef = target;
            var index;
            for (index = 0; index < pathComponents.length; ++index) {
                var pathElement = pathComponents[index];
                if (index == pathComponents.length - 1) {
                	// Assign the new value
                    objectRef[pathElement] = newValue;
                } else {
                    // Go down a level
                    objectRef = objectRef[pathElement];
                }
            }
        };
        
        
        /**
         * Performs update of 'target' elfin object property at 'targetPath' with new value 
         * found at sourcePath of source elfin object.
         * 
         * For instance: applyPaths(elfin, 'IDENTIFIANT.NOM', elfinSource, 'GROUPE')
         * 
         */
        var applyPaths = function(target, targetPath, source, sourcePath) {
        	// The paths are expected to be a strings.
        	if (!angular.isString(targetPath) && !angular.isString(sourcePath) ) {
                  return;
            }

            var targetPathComponents = targetPath.split('.');
            var objectRef = target;
            var index;
            
            for (index = 0; index < targetPathComponents.length; ++index) {
                var pathElement = targetPathComponents[index];
                // Check for last level
                if (index == targetPathComponents.length - 1) {
                	// Assign the new value
                    objectRef[pathElement] = getValueAtPath(source, sourcePath);
                } else {
                    // Go down a level
                    objectRef = objectRef[pathElement];
                }
            }
        };
        
        
        /**
         * HyperBird catalogue default format is as follow: 
         * value1|value2|value3
         * The current function returns the above format as follow:
         * 
         * [
         *   {
         *     "name": "value1",
         *     "value": "value1"
         *   },
         *   {
         *     "name": "value2",
         *     "value": "value2"
         *   },
         *   {
         *     "name": "value3",
         *     "value": "value3"
         *   }   
         *  ]
         *  
         *  Although name and value are strictly identical in the current
         *  version the might differ if need arise, for instance for translating
         *  labels. This should be possible to implement in the current function
         *  without modifying code relying on name, value structure. 
         *  
         */
        var buildArrayFromCatalogueDefault = function(catalogueDefaultString) {
			var catalogueDefaultValuesArray = catalogueDefaultString.split("|");
			var jsonString = '[';
			for (var i = 0; i < catalogueDefaultValuesArray.length; i++) {
				jsonString += '{"name" : "' + catalogueDefaultValuesArray[i] + '", "value":' + '"' + catalogueDefaultValuesArray[i] + '"}';  
				if (i < (catalogueDefaultValuesArray.length - 1)) {
					jsonString += ',';
				}
			};
			jsonString += ']';
			var catalogueDefaultNameValueArray = angular.fromJson(jsonString);    
			return catalogueDefaultNameValueArray;
        };
        
        return {
        	reorderArrayByPOS:reorderArrayByPOS,
        	buildUrlQueryString:buildUrlQueryString,
        	buildKeyValueObject:buildKeyValueObject,
        	applyPath:applyPath,
        	applyPaths:applyPaths,
        	getValueAtPath:getValueAtPath,
        	buildArrayFromCatalogueDefault:buildArrayFromCatalogueDefault,
        	encodeUriParameter:encodeUriParameter,
        	getDateInHbTextFormat:getDateInHbTextFormat
        };
    }]);
	
})();