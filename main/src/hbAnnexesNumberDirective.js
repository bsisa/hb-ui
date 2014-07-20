(function() {


    /**
     * Directive encapsulating ELFIN.ANNEXE number count text plural...
     */
    angular.module('hb5').directive('hbAnnexesNumber', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbAnnexesNumber.html",
		    controller: 'HbAnnexesNumberController'
		};
	
    });

})();