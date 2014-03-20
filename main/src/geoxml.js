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
 * In thsi method we can benefit from $window, $location services injections. 
 * Please check hb5.js file for this.
 * 
 * Created by guy on 19.01.14.
 * 
 */

(function() {
    angular.module('geoxml', ['restangular']).factory('GeoxmlService', [
        'Restangular', function(Restangular) {

            var restGeoxml = Restangular.withConfig(function(Configurer) {
            	/* TODO: Make baseUrl configurable. (Using grunt ?) */
            	/* Local hb-ui only test base URL */
            	//var baseUrl = 'api-mocks';
            	/* Local hb-ui and hb-api integration test base URL */
            	console.log("conf.js: ")
            	var baseUrl = 'http://localhost:9000/api/melfin';
             	Configurer.setBaseUrl(baseUrl);
            	// Default restangular behaviour assuming id field is id not suitable with ELFIN.Id
            	// Helpful reference: 
            	// https://github.com/mgonto/restangular#i-use-mongo-and-the-id-of-the-elements-is-_id-not-id-as-the-default-therefore-requests-are-sent-to-undefined-routes
            	Configurer.setRestangularFields({ id: "Id" });
            	
            });

            var _geoxmlService = restGeoxml.all('');


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

                validateId: function(identifier) {
                    return angular.isString(identifier) &&
                        identifier.length == 18 &&
                        (/G[0-9]{17}/).test(identifier);
                },
                getConfig: function() {
                    return _geoxmlService.one("config");
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
                }
            };
        }
    ]);

})();