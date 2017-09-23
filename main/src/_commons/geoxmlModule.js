/**
 * 
 * Managing REST API exceptions in a single place can be achieved by using 
 * Restangular setErrorInterceptor method to hook up a dedicated function 
 * to proceed with errors. This could be configured hereafter using:
 * Configurer.setErrorInterceptor(...) 
 * 
 * A drawback to do this here is that it is not possible to benefit from
 * the $location and $window services injection at this stage. 
 * These services are necessary to be able to perform redirections upon errors. 
 * 
 * In order to achieve this it is possible and better suited to define the 
 * setErrorInterceptor on the angular application itself using: 
 * application.run(...) 
 * At this stage, with run method, we can benefit from $window, $location 
 * services injections. Please check hb5.js file for this.
 * 
 * @author Guy de Pourtalès
 * @author Patrick Refondini 
 * 
 */

(function() {
    angular.module('geoxml', ['restangular']).factory('GeoxmlService', [
        'Restangular', '$log', 'HB_API', 'HB_EVENTS', '$rootScope', function(Restangular, $log, HB_API, HB_EVENTS, $rootScope) {

        	var restGeoxml = undefined;
            var _geoxmlService = undefined;
            var currentDataManagerAccessRightsCreateUpdate = undefined;
        	
        	var setRestGeoxml = function(dataManagerAccessRightsCreateUpdate, dataManagerAccessRightsRead) {
        		// Update GeoxmlService property by reference
        		currentDataManagerAccessRightsCreateUpdate = dataManagerAccessRightsCreateUpdate;
        		//$log.debug(">>>>>>>>>> GeoxmlService: currentDataManagerAccessRightsCreateUpdate set to : " + currentDataManagerAccessRightsCreateUpdate);
        		
        		restGeoxml = Restangular.withConfig(function(Configurer) {
                	/*
                	   To allow single configuration point on the server side 
                	   apiBaseUrl variable is contained in conf.js file dynamically 
                	   created by the server.
                	*/
                	if (apiBaseUrl==null) {
                		$log.error("GeoxmlService required apiBaseUrl information missing. This information is served dynamically by the HyperBird server, please make sure it is running.");
                	}
                	/* Local hb-ui only test base URL */
                	//var apiBaseUrl = 'api-mocks';
                 	Configurer.setBaseUrl(apiBaseUrl);
                 	
                 	// Default restangular behaviour assuming id field is id not suitable with ELFIN.Id
                	// Helpful reference: 
                	// https://github.com/mgonto/restangular#i-use-mongo-and-the-id-of-the-elements-is-_id-not-id-as-the-default-therefore-requests-are-sent-to-undefined-routes
                	Configurer.setRestangularFields({ id: "Id" });

                	// Add HyperBird specific HTTP headers field if available
                	var defaultHeadersObj = {};
                	defaultHeadersObj[HB_API.HTTP_HEADER_DATA_MANAGER_ACCESS_RIGHTS_CREATE_UPDATE] = dataManagerAccessRightsCreateUpdate;
                	defaultHeadersObj[HB_API.HTTP_HEADER_DATA_MANAGER_ACCESS_RIGHTS_READ] = dataManagerAccessRightsRead;
                	
                	Configurer.setDefaultHeaders( defaultHeadersObj );
                	
                });
        		
        		_geoxmlService = restGeoxml.all('');
        		
        		$rootScope.$emit(HB_EVENTS.ACL_UPDATE, { "dataManagerAccessRightsCreateUpdate" : dataManagerAccessRightsCreateUpdate, "dataManagerAccessRightsRead" : dataManagerAccessRightsRead } );
        		
        	};
        	
        	setRestGeoxml("","");

            return {

            	// TODO: Review: angular does not detect model modifications performed using this function.
                addRow: function(elfin, path, row) {
                    if (!angular.isString(path)) {
                        return;
                    }

                    if (angular.isString(row)) {
                        row += ' ' + Math.floor((1 + Math.random()) * 0x10000);
                    }

                    var pathComponents = path.split('.').reverse();
                    var root = elfin;
                    while (pathComponents.length) {
                        var item = pathComponents.pop();
                        if (!root[item] && pathComponents.length) {
                            root[item] = {};
                        } else if (!root[item] && !pathComponents.length) {
                            root[item] = [];
                        }
                        root = root[item];
                    }
                    root.push(row);
                },
                /**
                 * @deprecated - Please use identical function located in hbUtil.
                 * Function used to renumber POS attributes for instance when element removal takes place.
                 */
                renumberPos: function(array) {
                    if (!angular.isArray(array)) {
                        return;
                    }
                    // Check every element has a POS property. Should not happen with XSD validation.
                    var haveAllPos = _.reduce(array, function(memo, element){ return (memo && (!_.isUndefined(element.POS)) ); }, true);
                    if (!haveAllPos) {
                    	return;
                    } else {
                        for (var i = 0; i < array.length; i++) {
                        	var currentElement = array[i];
                        	currentElement.POS = i+1; 
                        }
                    }
                },                
                validateId: function(identifier) {
                    return angular.isString(identifier) &&
                        identifier.length == 18 &&
                        (/G[0-9]{17}/).test(identifier);
                },
                getConfig: function() {
                    return _geoxmlService.one("config");
                },
                getWhoAmI: function() {
                    return _geoxmlService.one("whoami");
                },
                /**
                 * getXqueryResult (singular) expects xqueryFilename to produce a single JSON object response
                 */
                getXqueryResult: function(xqueryFilename) {
                    return _geoxmlService.one("xquery/"+xqueryFilename);
                },
                /**
                 * getXqueryResults (plural) expects xqueryFilename to produce an array of JSON objects response
                 */
                getXqueryResults: function(xqueryFilename) {
                    return _geoxmlService.all("xquery/"+xqueryFilename);
                },
                getCollections: function() {
                	//TODO: To check, this should certainly be:
                	// return _geoxmlService;
                	// with later call to .getList()
                    return _geoxmlService.getList();
                },
                getCollection: function(collectionId) {
                	return _geoxmlService.all(collectionId);
                },
                getElfin: function(collectionId, elfinId) {
                    return _geoxmlService.one(collectionId, elfinId);
                },
                getElfinById: function(elfinId) {
                    return _geoxmlService.one("collections",elfinId);
                },                
                getNewElfin: function(elfinClasse) {
                    return _geoxmlService.one("catalogue", elfinClasse);
                }, 
                getNewOrderNumber:function() {
                    return _geoxmlService.one("orders/new/order-number");
                },  
                getService: function() {
                	return restGeoxml;
                },
                getHash: function(plainTxtPwd) {
                	return _geoxmlService.one("security/hash", plainTxtPwd);
                },
                getAnnex: function(collectionId, elfinId, fileName) {
                	return _geoxmlService.one(HB_API.ANNEXE_URL_PREFIX+"/"+collectionId+"/"+elfinId, fileName);
                },
                setDataManager: function(dataManagerAccessRightsCreateUpdate, dataManagerAccessRightsRead) {
                	// Set Restangular service with provided dataManagerToken and refreshes _geoxmlService 
                	setRestGeoxml(dataManagerAccessRightsCreateUpdate, dataManagerAccessRightsRead);
                },
                getCurrentDataManagerAccessRightsCreateUpdate: function() {
                	return currentDataManagerAccessRightsCreateUpdate;
                }
                
            };
        }
    ]);

})();