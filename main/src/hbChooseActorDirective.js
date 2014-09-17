(function() {


    /**
     * hb-choose-actor directive provides specific popup to select 
     * an ELFIN of CLASSE='ACTOR' with IDENTIFIANT/QUALITE='{"collaborateur, propriétaire,..."}'
     * 
     */
    angular.module('hb5').directive('hbChooseActor', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
			controller: 'HbChooseActorController',
			scope: true
		};
	
    });


})();