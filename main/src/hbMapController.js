(function() {

    angular.module('hb5').controller('MapController', ['$scope', '$rootScope', '$log', 'leafletData',
        function($scope, $rootScope, $log, leafletData) {

        $log.debug("    >>>> MapController called... with data");

        $scope.center = {
            lat: 46.9915,
            lng: 6.9293,
            zoom: 16
        };

        $rootScope.$on("displayMapEvent", function(event, displayMap) {
            if (displayMap === true) {
                leafletData.getMap().then(function(map) {
                    map.invalidateSize();
                });
            }
        });

    }]);


})();

