(function() {


    /**
     * hb-choose-actor directive provides specific popup to select 
     * an ELFIN of CLASSE='ACTEUR' 
     * 
     * 
     * elfinForm
     * 
     * Is a reference to the current form the selection will be used to update to.
     * 
     * 
     * actorModel 
     * 
     * Is a mandatory reference to a non persistent scope level javascript object with structure: {Id : "", ID_G : "", GROUPE : "", NOM : ""};
     * It is simply used to old these properties value. They may be used to load the corresponding ELFIN
     * of class ACTEUR or be copied as is to data structure such as FRACTION/L/C... 
     * 
     * 
     * actorElfinModel 
     * 
     * Is an optional reference to the ELFIN of class ACTEUR
     * corresponding to the actorModel ID_G/Id identifier. 
     * 
     * 
     * actorIdName 
     * 
     * Dynamically defines the actor HTML input 'name' property.
     * 
     * 
     * actorRole
     * 
     * Optional property used to narrow the available ACTEUR list to for instance with
     * commas separated values corresponding to ACTEUR IDENTIFIANT/QUALITE values. 
     * For instance: 
     * To restrict ACTEUR to type 'owner': hb-choose-actor-role="owner"
     * To restrict ACTEUR to type 'owner' and 'company': hb-choose-actor-role="owner, company"
     * To restrict ACTEUR to type other than 'owner' and 'company': hb-choose-actor-role="!owner, !company"
     * 
     * 
     * defaultByName 
     * 
     * Optional property which allows defining an ACTEUR entity by name as a default.
     * For instance: hb-choose-actor-default-by-name="NE" provided an ACTEUR for which
     * INDENTIFIANT/NAME matches 'NE'. 
     * 
     * tooltop, editable: straight forward.
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
				'tooltip' : '@?hbChooseActorTooltip',
				'editable' : '@?hbChooseActorEditable'
			},		    
		    transclude: true,
			templateUrl : "/assets/views/hbChooseActor.html",			
			controller: 'HbChooseActorController'
		};
	
    });


})();