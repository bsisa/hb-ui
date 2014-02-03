/**
 * Created by guy on 19.01.14.
 */

(function() {
    angular.module('geoxml', ['restangular']).factory('GeoxmlService', [
        'Restangular', function(Restangular) {

            var restGeoxml = Restangular.withConfig(function(Configurer) {
                Configurer.setBaseUrl('api-mocks');
            });

            var _geoxmlService = restGeoxml.all('')


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