(function() {


    /**
     * 
     * hb-choose-surface directive provides specific popup to select 
     * an ELFIN of CLASSE='IMMEUBLE' 
     * 
     * 
     * elfinForm
     * 
     * Is a reference to the current form the selection might update. Used to set dirty state.
     * 
     * 
     * surfaceElfinModel 
     * 
     * Is a mandatory reference to an object ELFIN of class IMMEUBLE. The target of selection process.
     * 
     * 
     * surfaceIdName 
     * 
     * Dynamically defines the surface HTML input 'name' property.
     * 
     * 
     * tooltip
     * 
     * A text for the tooltip
     * 
     * 
     * editable { true / false }
     * 
     * If false the button to access the surface selection is disabled. 
     * The current widget only provides read only access to the `surfaceDisplay` information. 
     */
    angular.module('hb5').directive('hbChooseSurface', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
			scope : {
				'elfinForm' : '=hbChooseSurfaceElfinForm',
				'buildingElfinModel' : '=?hbChooseSurfaceElfinModel',
				'buildingIdName' : '@hbChooseSurfaceIdName', 
				'tooltip' : '@?hbChooseSurfaceTooltip',
				'editable' : '@?hbChooseSurfaceEditable'
			},		    
		    transclude: true,
			templateUrl : "/assets/views/hbChooseSurface.html",			
			controller: 'HbChooseSurfaceController'
		};
	
    });


})();