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
    	// FONTAINE Section
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	var fontaineCollectionId = HB_COLLECTIONS.FONTAINE_ID;
    	
		/**
		 *  Apply uniteLocativeListAnyFilter
		 */
		var filterFontaineElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('fontaineListAnyFilter')(elfins_p, search_p.text);
	    	$log.debug("filteredSortedElfins.length = " + filteredSortedElfins.length);
	    	return filteredSortedElfins;
		};    	
    	
        /** Contains ELFINs JSON Array resulting from the GeoxmlService query */   
        $scope.fontaineElfins = null;

        /** User entered IMMEUBLE search criterion */
        $scope.fontaineSearch = { "text" : "" };             
        
        /** Query all available buildings IMMEUBLE */ 
        GeoxmlService.getCollection(fontaineCollectionId).getList()
	        .then(function(fontaineElfins) {
        		$scope.fontaineElfins = fontaineElfins;
	        }, function(response) {
	            var message = "Le chargement des unités locatives a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
	        });	
        
		/**
		 * fontaineElfins result is loaded asynchronously.
		 */
    	$scope.$watch('fontaineElfins', function() { 
    		$log.debug("$watch('fontaineElfins')");
    		if ($scope.fontaineElfins!=null) {
				$scope.filteredFontaineElfins = filterFontaineElfins($scope.fontaineElfins, $scope.fontaineSearch);										
    		}
    	});	        

    	// ==== Navigation ===========================================
        /**
         * Navigate to user FONTAINE selected list
         */
        $scope.listFontaines = function() {
        	$location.path('/elfin/'+fontaineCollectionId+'/FONTAINE').search('search', $scope.fontaineSearch.text);
        };
        /**
         * Navigate to user selected FONTAINE
         */        
        $scope.viewFontaine = function() {
        	$location.path('/elfin/'+fontaineCollectionId+'/FONTAINE/' + $scope.filteredFontaineElfins[0].Id);
        };        

    	// ==== End user search related listener ==================        
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('fontaineSearch', function(newSearch, oldSearch) {
    		$log.debug("$watch('fontaineSearch')");
    		if ($scope.fontaineElfins!=null) {
				$scope.filteredFontaineElfins = filterFontaineElfins($scope.fontaineElfins, $scope.fontaineSearch);
    		}
    	}, true);								
			
    	// ============================================================
        // FONTAINE Section - end
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
    	

    	// ============================================================
    	// HORLOGE Section
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	var horlogeCollectionId = HB_COLLECTIONS.HORLOGE_ID;
    	
        /** Contains ELFINs JSON Array resulting from the GeoxmlService query */   
        $scope.horlogeElfins = null;

        /** Query all available WC */ 
        GeoxmlService.getCollection(horlogeCollectionId).getList()
	        .then(function(horlogeElfins) {
        		$scope.horlogeElfins = horlogeElfins;
	        }, function(response) {
	            var message = "Le chargement des HORLOGE a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
	        });	
        
    	// ==== Navigation ===========================================
        /**
         * Navigate to user HORLOGE selected list
         * There are 2 HORLOGE. Do not provide extended search yet.
         */
        $scope.listHorloges = function() {
        	$location.path('/elfin/'+horlogeCollectionId+'/HORLOGE');
        };        
        /**
         * Navigate to user selected WC
         */        
        $scope.viewHorloge = function() {
        	$location.path('/elfin/'+horlogeCollectionId+'/HORLOGE/' + $scope.filteredWcElfins[0].Id);
        };        

    	// ============================================================
        // HORLOGE Section - end
    	// ============================================================    	
    	
    	
    	// ============================================================
    	// ABRIBUS Section
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	var abribusCollectionId = HB_COLLECTIONS.ABRIBUS_ID;
    	
        /** Contains ELFINs JSON Array resulting from the GeoxmlService query */   
        $scope.abribusElfins = null;

        /** Query all available ABRIBUS */ 
        GeoxmlService.getCollection(abribusCollectionId).getList()
	        .then(function(abribusElfins) {
        		$scope.abribusElfins = abribusElfins;
	        }, function(response) {
	            var message = "Le chargement des ABRIBUS a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
	        });	
        
    	// ==== Navigation ===========================================
        /**
         * Navigate to user ABRIBUS selected list
         * There are 2 ABRIBUS. Do not provide extended search yet.
         */
        $scope.listAbribus = function() {
        	$location.path('/elfin/'+abribusCollectionId+'/ABRIBUS');
        };        
        /**
         * Navigate to user selected ABRIBUS
         */        
        $scope.viewAbribus = function() {
        	$location.path('/elfin/'+abribusCollectionId+'/ABRIBUS/' + $scope.filteredWcElfins[0].Id);
        };        

    	// ============================================================
        // ABRIBUS Section - end
    	// ============================================================    	
        
        
        
    	var focusOnSearchField = function() {
			$('#immeubleSearchTextInput').focus();	
		};        
		
		// TODO: FocusTimeout issue. Find a better solution ? 
		$timeout(focusOnSearchField, 250, false);    	
    	
    	
    }]);


})();

