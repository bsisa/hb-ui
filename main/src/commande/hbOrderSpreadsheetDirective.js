(function() {


    /**
     * 
     * hb-order-spreadsheet directive provides UI to enter order lines and 
     * miscellaneous deductions lines in both percentage or absolute values. 
     * Based on these entries it computes and creates the associated figures
     * and data model to store them.
     * 
     * The directive modifies the ELFIN data model CARACTERISTIQUE/CARSET element 
     * and CAR sub-elements. Although aimed at CLASSE='COMMANDE' it is not strictely
     * limited to it with provision that CARACTERISTIQUE/CARSET element use does not
     * conflicts with already existing data.
     * 
     * 
     * elfinForm
     * 
     * Is a reference to the current form the selection might update. Used to set dirty state.
     * 
     * 
     * elfinModel 
     * 
     * Is a mandatory reference to an ELFIN object
     *  
     */
    angular.module('hb5').directive('hbOrderSpreadsheet', function () {

    	return {
    		require: ['hbOrderSpreadsheet', 'ngModel'],
			restrict: 'A',   
			templateUrl : "/assets/views/hbOrderSpreadsheet.html",			
			controller: 'HbOrderSpreadsheetController',
			scope : {
				'elfinForm' : '=hbOrderElfinForm',
				'editable' : '=hbOrderEditable'
			},		 
			link: function ($scope, $element, $attrs, ctrls) {
				var hbOrderSpreadsheetController = ctrls[0];
				var ngModelController = ctrls[1];
				hbOrderSpreadsheetController.setNgModelCtrl(ngModelController);
			}
		};
	
    });


})();