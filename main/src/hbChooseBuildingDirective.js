(function() {


    /**
     * hb-choose-building directive provides specific popup to select 
     * an ELFIN of CLASSE='IMMEUBLE' 
     * 
     * 
     * elfinForm
     * 
     * Is a reference to the current form the selection might update. Used to set dirty state.
     * 
     * 
     * buildingModel 
     * 
     * Is a mandatory reference to a non persistent scope level javascript object with structure: {Id : "", ID_G : "", GROUPE : "", NOM : ""};
     * It is simply used to old these properties value. They may be used to load the corresponding ELFIN
     * of class ACTEUR or be copied as is to data structure such as FRACTION/L/C... 
     * 
     * 
     * buildingElfinModel 
     * 
     * Is an optional reference to the ELFIN of class IMMEUBLE
     * corresponding to the buildingModel ID_G/Id identifier. 
     * 
     * 
     * buildingIdName 
     * 
     * Dynamically defines the building HTML input 'name' property.
     * 
     * 
     * buildingRole
     * 
     * Optional property used to narrow the available ACTEUR list.
     * It supports commas separated values corresponding to ACTEUR IDENTIFIANT/QUALITE values. 
     * For instance: 
     * To restrict ACTEUR to type 'owner': hb-choose-building-role="owner"
     * To restrict ACTEUR to type 'owner' and 'company': hb-choose-building-role="owner, company"
     * To restrict ACTEUR to type other than 'owner' and 'company': hb-choose-building-role="!owner, !company"
     * 
     * 
     * defaultByName 
     * 
     * Optional property which allows defining an ACTEUR entity by name as a default.
     * For instance: hb-choose-building-default-by-name="NE" provided an ACTEUR for which
     * INDENTIFIANT/NAME matches 'NE'. 
     * 
     * 
     * tooltip
     * 
     * A text for the tooltip
     * 
     * 
     * editable { true / false }
     * 
     * If false the button to access the building selection is disabled. 
     * The current widget only provides read only access to the `buildingDisplay` information. 
     */
    angular.module('hb5').directive('hbChooseBuilding', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
			scope : {
				'elfinForm' : '=hbChooseBuildingElfinForm',
				'buildingModel' : '=hbChooseBuildingModel',
				'buildingElfinModel' : '=?hbChooseBuildingElfinModel',
				'buildingIdName' : '@hbChooseBuildingIdName', 
				'buildingRole' : '@?hbChooseBuildingRole',
				'defaultByName' : '@?hbChooseBuildingDefaultByName',
				'tooltip' : '@?hbChooseBuildingTooltip',
				'editable' : '@?hbChooseBuildingEditable'
			},		    
		    transclude: true,
			templateUrl : "/assets/views/hbChooseBuilding.html",			
			controller: 'HbChooseBuildingController'
		};
	
    });


})();