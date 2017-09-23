(function() {


    /**
     * 
     * hb-choose-code directive provides specific popup to select 
     * an ELFIN of CLASSE='CODE' 
     * 
     * 
     * elfinForm
     * 
     * Is a reference to the current form the selection might update. Used to set dirty state.
     * 
     * 
     * codeElfinModel 
     * 
     * Is a mandatory reference to an object ELFIN of class CODE. The target of selection process.
     * 
     * 
     * codeIdName 
     * 
     * Dynamically defines the code HTML input 'name' property.
     * 
     * 
     * tooltip
     * 
     * A text for the tooltip
     * 
     * 
     * editable { true / false }
     * 
     * If false the button to access the code selection is disabled. 
     * The current widget only provides read only access to the `codeDisplay` information. 
     */
    angular.module('hb5').directive('hbChooseCode', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
			scope : {
				'elfinForm' : '=hbChooseCodeElfinForm',
				'codeElfinModel' : '=hbChooseCodeElfinModel',
				'codeIdName' : '@hbChooseCodeIdName', 
				'tooltip' : '@?hbChooseCodeTooltip',
				'editable' : '@?hbChooseCodeEditable'
			},		    
		    transclude: true,
			templateUrl : "/assets/views/hbChooseCode.html",			
			controller: 'HbChooseCodeController'
		};
	
    });


})();