(function() {

    angular.module('hb5').controller('HbDashboardController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', '$filter', '$location', '$timeout', 'HB_COLLECTIONS', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, $filter, $location, $timeout, HB_COLLECTIONS, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbDashboardController called... at " + new Date());
    	
    	
    	// ============================================================
    	// Buildings Section - IMMEUBLE
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	var immeublesCollectionId = HB_COLLECTIONS.IMMEUBLE_ID;
    	
		/**
		 *  Apply immeubleListAnyFilter
		 */
		var filterImmeubleElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('immeubleListAnyFilter')(elfins_p, search_p.text);
	    	return filteredSortedElfins;
		};    	
    	
        // Contains ELFINs JSON Array resulting from the GeoxmlService query   
        $scope.immeubleElfins = null;
        
        // Query all available buildings IMMEUBLE 
        GeoxmlService.getCollection(immeublesCollectionId).getList()
	        .then(function(immeubleElfins) {
        		$scope.immeubleElfins = immeubleElfins;
	        }, function(response) {
	            var message = "Le chargement des immeubles a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
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
         * Navigate to user selected list
         */
        $scope.listImmeubles = function() {
        	$location.path('/elfin/'+immeublesCollectionId+'/IMMEUBLE').search('search', $scope.immeubleSearch.text);
        };
        /**
         * Navigate to user selected building (IMMEUBLE)
         */        
        $scope.viewImmeuble = function() {
        	$location.path('/elfin/'+immeublesCollectionId+'/IMMEUBLE/' + $scope.filteredImmeubleElfins[0].Id);
        };        

    	// ==== End user search and related listener ==================        
        /** User entered IMMEUBLE search criterion */
        $scope.immeubleSearch = { "text" : "" };
		
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
		
    	
    	// ============================================================
    	// Apartments (flats) Section - UNITE LOCATIVE
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	var uniteLocCollectionId = HB_COLLECTIONS.LOCATION_UNIT_ID;
    	
		/**
		 *  Apply uniteLocativeListAnyFilter
		 */
		var filterUniteLocElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('uniteLocativeListAnyFilter')(elfins_p, search_p.text);
	    	$log.debug("filteredSortedElfins.length = " + filteredSortedElfins.length);
	    	return filteredSortedElfins;
		};    	
    	
        /** Contains ELFINs JSON Array resulting from the GeoxmlService query */   
        $scope.uniteLocElfins = null;

        /** User entered IMMEUBLE search criterion */
        $scope.uniteLocSearch = { "text" : "" };             
        
        /** Query all available buildings IMMEUBLE */ 
        GeoxmlService.getCollection(uniteLocCollectionId).getList()
	        .then(function(uniteLocElfins) {
        		$scope.uniteLocElfins = uniteLocElfins;
	        }, function(response) {
	            var message = "Le chargement des unités locatives a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
	        });	
        
		/**
		 * uniteLocElfins result is loaded asynchronously.
		 */
    	$scope.$watch('uniteLocElfins', function() { 
    		$log.debug("$watch('uniteLocElfins')");
    		if ($scope.uniteLocElfins!=null) {
				$scope.filteredUniteLocElfins = filterUniteLocElfins($scope.uniteLocElfins, $scope.uniteLocSearch);										
    		}
    	});	        

    	// ==== Navigation ===========================================
        /**
         * Navigate to user uniteLoc selected list
         */
        $scope.listUniteLoc = function() {
        	$location.path('/elfin/'+uniteLocCollectionId+'/SURFACE').search('search', $scope.uniteLocSearch.text);
        };
        /**
         * Navigate to user selected flat (IMMEUBLE)
         */        
        $scope.viewUniteLoc = function() {
        	$location.path('/elfin/'+uniteLocCollectionId+'/SURFACE/' + $scope.filteredUniteLocElfins[0].Id);
        };        

    	// ==== End user search related listener ==================        
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('uniteLocSearch', function(newSearch, oldSearch) {
    		$log.debug("$watch('uniteLocSearch')");
    		if ($scope.uniteLocElfins!=null) {
				$scope.filteredUniteLocElfins = filterUniteLocElfins($scope.uniteLocElfins, $scope.uniteLocSearch);
    		}
    	}, true);								
			
    	// ============================================================
        // Apartments (flats) Section - UNITE LOCATIVE - end
    	// ============================================================    	

    	
    	// ============================================================
    	// WC Section
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	var wcCollectionId = HB_COLLECTIONS.WC_ID;
    	
		/**
		 *  Apply wcListAnyFilter
		 */
		var filterWcElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('wcListAnyFilter')(elfins_p, search_p.text);
	    	$log.debug("filteredSortedElfins.length = " + filteredSortedElfins.length);
	    	return filteredSortedElfins;
		};    	
    	
        /** Contains ELFINs JSON Array resulting from the GeoxmlService query */   
        $scope.wcElfins = null;

        /** User entered IMMEUBLE search criterion */
        $scope.wcSearch = { "text" : "" };             
        
        /** Query all available WC */ 
        GeoxmlService.getCollection(wcCollectionId).getList()
	        .then(function(wcElfins) {
        		$scope.wcElfins = wcElfins;
	        }, function(response) {
	            var message = "Le chargement des WC a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
	        });	
        
		/**
		 * wcElfins result is loaded asynchronously.
		 */
    	$scope.$watch('wcElfins', function() { 
    		$log.debug("$watch('wcElfins')");
    		if ($scope.wcElfins!=null) {
				$scope.filteredWcElfins = filterWcElfins($scope.wcElfins, $scope.wcSearch);										
    		}
    	});	        

    	// ==== Navigation ===========================================
        /**
         * Navigate to user WC selected list
         * There are less than 50 WC. Do not provide extended search yet.
         */
//        $scope.listWc = function() {
//        	$location.path('/elfin/'+wcCollectionId+'/WC').search('search', $scope.wcSearch.text);
//        };
        $scope.listWc = function() {
        	$location.path('/elfin/'+wcCollectionId+'/WC');
        };        
        /**
         * Navigate to user selected WC
         */        
        $scope.viewWc = function() {
        	$location.path('/elfin/'+wcCollectionId+'/WC/' + $scope.filteredWcElfins[0].Id);
        };        

    	// ==== End user search related listener ==================        
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('wcSearch', function(newSearch, oldSearch) {
    		$log.debug("$watch('wcSearch')");
    		if ($scope.wcElfins!=null) {
				$scope.filteredWcElfins = filterWcElfins($scope.wcElfins, $scope.wcSearch);
    		}
    	}, true);								
			
    	// ============================================================
        // WC Section - end
    	// ============================================================    	
    	
    	
    	/*
    	horlogeElfins
    	filteredHorlogeElfins
    	horlogeSearch
    	
    	fontaineElfins
    	filteredFontaineElfins
    	fontaineSearch
    	
    	abribusElfins
    	filteredAbribusElfins
    	abribusSearch
    	*/
    	
    	var focusOnSearchField = function() {
			$('#immeubleSearchTextInput').focus();	
		};        
		
		// TODO: FocusTimeout issue. Find a better solution ? 
		$timeout(focusOnSearchField, 250, false);    	
    	
    	
    }]);


})();

