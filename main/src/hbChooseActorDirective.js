(function() {


    /**
     * hb-choose-actor directive provides specific popup to select 
     * an ELFIN of CLASSE='ACTEUR' with IDENTIFIANT/QUALITE='{"collaborateur, propriétaire,..."}'
     */
    angular.module('hb5').directive('hbChooseActor', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
			scope : {
				'elfinForm' : '=hbChooseActorElfinForm',
				'actorModel' : '=hbChooseActorModel',
				'actorElfinModel' : '=?hbChooseActorElfinModel',
				'actorIdName' : '@hbChooseActorIdName', 
				'actorRole' : '@?hbChooseActorRole',
				'defaultByName' : '@?hbChooseActorDefaultByName',
				'tooltip' : '@?hbChooseActorTooltip'
			},		    
		    transclude: true,
			templateUrl : "/assets/views/hbChooseActor.html",			
			controller: 'HbChooseActorController'
		};
	
    });


})();