(function() {

    /**
     * Directive encapsulating ELFIN.ANNEXE.RENVOI structure update
     * together with HTML 5 file API based HTTP POST file upload 
     * relying on flow.js library and ng-flow angularJs integration.
     */
    angular.module('hb5').directive('hbAnnexesUpload', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbAnnexesUpload.html",
			controller: 'HbAnnexesUploadController',
			scope: true
		};
	
    });

})();