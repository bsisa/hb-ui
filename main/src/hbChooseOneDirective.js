(function() {


    /**
     * hb-choose-one directive provides hbChooseOne function with the following signature: 
     * 
     * hbChooseOne(targetElfin, targetPath, elfins, sourcePath, columnsDefinition, template)
     * Where targetElfin is the elfin to be updated by the user selected value from the elfins list.
     * The elfin property to be updated is specified by the targetPath provided as a string.
     * From the elfins list, the selected elfin property to take the value for updating the 
     * target elfin property is specified by the sourcePath provided as a string.
     * The columnsDefinition is specified after ng-grid gridOptions.columnDefs format for instance: 
     * $scope.myColumnsDefinition =  [
     *  { field:"PARTENAIRE.FOURNISSEUR.VALUE", displayName: "Provider"},
     *  { field:"PARTENAIRE.GERANT.VALUE", displayName: "Manager"},
     *  { field:"PARTENAIRE.USAGER.VALUE", displayName: "User"}
     * ];
     * The template is a URL such as '/assets/views/chooseActor.html' providing the selection list 
     * 
     * See: hbConstatCardController.js, chooseActor.html for example usage.
     * 
     */
    angular.module('hb5').directive('hbChooseOne', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
			controller: 'HbChooseOneController'
		};
	
    });


})();