/**
 * Created by guy on 19.01.14.
 */

(function() {
    angular.module('geoxml', ['restangular']).factory('GeoxmlService', [
        'Restangular', function(Restangular) {

            var restGeoxml = Restangular.withConfig(function(Configurer) {
            	/* TODO: Make baseUrl configurable. (Using grunt ?) */
            	/* Local hb-ui only test base URL */
            	//var baseUrl = 'api-mocks';
            	/* Local hb-ui and hb-api integration test base URL */
            	var baseUrl = 'http://localhost:9000/api/melfin'
             	Configurer.setBaseUrl(baseUrl);
            	// Default restangular behaviour assuming id field is id not suitable with ELFIN.Id
            	// Helpful reference: 
            	// https://github.com/mgonto/restangular#i-use-mongo-and-the-id-of-the-elements-is-_id-not-id-as-the-default-therefore-requests-are-sent-to-undefined-routes
            	Configurer.setRestangularFields({ id: "Id" });
            });

            var _geoxmlService = restGeoxml.all('');


            return {

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
                    return _geoxmlService.getList();
                },
                getCollection: function(collectionId) {
                    return _geoxmlService.getList(collectionId);
                },
                getElfin: function(collectionId, elfinId) {
                    return _geoxmlService.one(collectionId, elfinId);
                }
                
            }
        }
    ])

})();