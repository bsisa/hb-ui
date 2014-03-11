/**
 * Created by guy on 19.01.14.
 */

(function() {
	// TODO: solve functions naming clash between 'mgcrea.ngStrap' and 'ui.bootstrap' on $modal
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
            .when('/elfin/:collectionId/IMMEUBLE', {
                templateUrl: 'views/IMMEUBLE.html',
                controller: 'DefaultListsController'
            })
            .otherwise({
                redirectTo: '/'
            })
        ;

    }]);
    

    /**
     * Basic filter to add an "s" to result titles 
     * depending on the number of entries returned. 
     */
	hb5.filter('plural', function() {
		return function(number) {
			if (number > 1) {
				return "s";
			} else {
				return "";
			}
		};
	});
	
	
	/**
	 * Small service used to exchange messages data between miscellaneous controllers.
	 * For instance when deleting a card the success message must be displayed on the
	 * redirect to page within redirect page controller scope.
	 */
	hb5.service('sharedMessages', function () {
        var statusMessage = {
            data: "First"
        };

        return {
            getStatusMessage:function () {
                return statusMessage;
            },
            setStatusMessage:function (value) {
            	statusMessage.data = value;
            }
        };
    });

   
})();


