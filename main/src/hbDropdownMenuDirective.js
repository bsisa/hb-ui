(function() {

    /**
     * Directive for dynamic drop down menus.
     * 
     * Note: When hbDropdownMenuLabel and hbDropdownMenuItems are scoped as read only using @
     * they fail to be bound as properties references but are considered pure strings instead.
     * This behaviour is likely due to the "relatively" long time necessary for menu properties 
     * to be dynamically initialised (menus structure being loaded from database).
     */
    angular.module('hb5').directive('hbDropdownMenu', function () {

		return {
		    restrict: 'A',
			templateUrl : "/assets/views/hbDropdownMenu.html",
			replace : true,
			scope : {
				'menuIconClass' : '@hbDropdownMenuIconClass',
				'menuLabel' : '=hbDropdownMenuLabel',  
				'menuItems' : '=hbDropdownMenuItems'   
			}
		};
	
    });
    
})();