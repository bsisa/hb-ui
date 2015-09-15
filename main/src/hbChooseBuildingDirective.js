(function() {


    /**
     * 
     * hb-choose-building directive provides specific popup to select 
     * an ELFIN of CLASSE='IMMEUBLE' 
     * 
     * 
     * elfinForm
     * 
     * Is a reference to the current form the selection might update. Used to set dirty state.
     * 
     * 
     * buildingElfinModel 
     * 
     * Is a mandatory reference to an object ELFIN of class IMMEUBLE. The target of selection process.
     * 
     * 
     * buildingIdName 
     * 
     * Dynamically defines the building HTML input 'name' property.
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
				'buildingElfinModel' : '=?hbChooseBuildingElfinModel',
				'buildingIdName' : '@hbChooseBuildingIdName', 
				'tooltip' : '@?hbChooseBuildingTooltip',
				'editable' : '@?hbChooseBuildingEditable'
			},		    
		    transclude: true,
			templateUrl : "/assets/views/hbChooseBuilding.html",			
			controller: 'HbChooseBuildingController'
		};
	
    });


})();