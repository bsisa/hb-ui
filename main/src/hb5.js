/**
 * Created by guy on 19.01.14.
 */

(function() {
	// TODO: solve functions naming clash between 'mgcrea.ngStrap' and 'localytics.directives' on $modal
	//['ngAnimate', 'ngSanitize', 'mgcrea.ngStrap']
	//  var hb5 = angular.module('hb5', ['geoxml', 'ngRoute', 'ui.bootstrap', 'localytics.directives']);	
    var hb5 = angular.module('hb5', ['ngAnimate', 'ngSanitize', 'geoxml', 'ngRoute', 'ui.bootstrap', 'localytics.directives']);
	
    hb5.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/welcome.html',
                controller: function($scope) {}
            })
            .when('/elfin/:collectionId/:classe/:elfinId', {
                templateUrl: 'views/default_card_view.html',
                controller: 'DefaultCardController'
            })
            .otherwise({
                redirectTo: '/'
            })
        ;

    }]);
})();


