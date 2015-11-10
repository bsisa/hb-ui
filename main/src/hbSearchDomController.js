(function() {

    angular.module('hb5').controller('HbSearchDomController', ['$scope', '$rootScope', 'GeoxmlService', '$log', '$filter', '$location', 'HB_COLLECTIONS', 'HB_EVENTS', 'hbAlertMessages', 'hbQueryService', function($scope, $rootScope, GeoxmlService, $log, $filter, $location, HB_COLLECTIONS, HB_EVENTS, hbAlertMessages, hbQueryService) {
    
    	//$log.debug("    >>>> HbSearchDomController called at " + new Date());
    	
    	// ============================================================
    	// Buildings Section - IMMEUBLE
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	var immeublesCollectionId = HB_COLLECTIONS.IMMEUBLE_ID;
    	var immeublesXpath = '';
        /** User entered IMMEUBLE search criterion */
        $scope.immeubleSearch = { "text" : "" , "GER" : ""};
        $scope.immeubleElfins = null;

    	// Centralises ACL update procedure
        // Note: there is no security issue regarding this information, only
        // better end-user data selection.
        var updateAclRelatedData = function(dataManagerAccessRightsCreateUpdate) {
        	immeublesXpath = "//ELFIN[@CLASSE='IMMEUBLE' and IDENTIFIANT/GER='"+dataManagerAccessRightsCreateUpdate+"']"
        	$scope.immeubleSearch.GER = dataManagerAccessRightsCreateUpdate;
        };    	

        // Initialisation at current controller creation
        updateAclRelatedData(GeoxmlService.getCurrentDataManagerAccessRightsCreateUpdate());        

		/**
		 *  Apply immeubleListAnyFilter
		 */
		var filterImmeubleElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('immeubleListAnyFilter')(elfins_p, search_p.text);
	    	return filteredSortedElfins;
		};    	

		/**
		 *	Query immeubles from repository and updates immeubleElfins in $scope 
		 */
        var updateImmeubles = function() {
		    hbQueryService.getImmeubles(immeublesXpath)
		        .then(function(immeubleElfins) {
		        	//$log.debug("immeublesXpath at getImmeubles() call time = " + immeublesXpath);
		    		$scope.immeubleElfins = immeubleElfins;
		        }, function(response) {
		            var message = "Le chargement des immeubles a échoué (statut de retour: " + response.status + ")";
		            hbAlertMessages.addAlert("danger",message);
		        });	
        };        
        
        // Initialises $scope.immeubleElfins at controller creation time
        updateImmeubles();
        
        // Update on ACL_UPDATE events (Business end-user selection, geoxml reload, init.) 
        var aclUpdateRootscopeListenerUnregister = $rootScope.$on(HB_EVENTS.ACL_UPDATE, function(event, acl) {
        	//$log.debug("HbSearchDomController: Received ACL_UPDATE notification, new acl = " + angular.toJson(acl))
        	updateAclRelatedData(acl.dataManagerAccessRightsCreateUpdate);
        	updateImmeubles();
        });           	

        
		/**
		 * immeubleElfins result is loaded asynchronously.
		 */
    	$scope.$watch('immeubleElfins', function() { 
    		if ($scope.immeubleElfins!=null) {
				$scope.filteredImmeubleElfins = filterImmeubleElfins($scope.immeubleElfins, $scope.immeubleSearch);										
    		}
    	});	        

    	// ==== Navigation ===========================================

        /**
         * Navigate to end user selected buildings. 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewImmeuble = function() {
    		// Clean up any former irrelevant sticky search parameter such as ?xpath=...
    		$location.search({}); 
        	if ($scope.filteredImmeubleElfins.length > 1) {
        		$location.path('/elfin/'+immeublesCollectionId+'/IMMEUBLE')
        			.search('search', $scope.immeubleSearch.text)
        			.search('GER', $scope.immeubleSearch.GER);;
        	} else if ($scope.filteredImmeubleElfins.length == 1) {
        		$location.path('/elfin/'+immeublesCollectionId+'/IMMEUBLE/' + $scope.filteredImmeubleElfins[0].Id);	
        	}
        };                

        
    	// ==== End user search and related listener ==================        
		
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('immeubleSearch', function(newSearch, oldSearch) {
    		if ($scope.immeubleElfins!=null) {
				$scope.filteredImmeubleElfins = filterImmeubleElfins($scope.immeubleElfins, $scope.immeubleSearch);
    		}
    	}, true);								
			
    	// ============================================================
        // Buildings search - end
    	// ============================================================    	
    	

    	/**
         * Clean up rootScope listeners explicitely (required). 
         */
        $scope.$on('$destroy', function(event, data){
        	aclUpdateRootscopeListenerUnregister();
        });    	

    	
    }]);


})();

