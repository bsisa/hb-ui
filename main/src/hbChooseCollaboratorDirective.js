(function() {


    /**
     * hb-choose-collaborator directive provides specific popup to select 
     * an ELFIN of CLASSE='ACTOR' with IDENTIFIANT/QUALITE='Collaborateur'
     * 
     * 
     * See: hbConstatCardController.js, chooseActor.html for example usage.
     * 
     */
    angular.module('hb5').directive('hbChooseCollaborator', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
			controller: 'HbChooseCollaboratorController'
		};
	
    });


})();