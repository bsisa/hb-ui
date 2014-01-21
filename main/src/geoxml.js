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