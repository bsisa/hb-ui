(function() {

    angular.module('hb5').controller('HbDashboardController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', '$filter', '$location', '$timeout', 'HB_COLLECTIONS', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, $filter, $location, $timeout, HB_COLLECTIONS, hbAlertMessages, hbUtil) {
    
    	//$log.debug("    >>>> HbDashboardController called at " + new Date());
    	
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
        		$scope.filteredImmeubleElfins = filterImmeubleElfins($scope.immeubleElfins, $scope.immeubleSearch);
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
         * Navigate to end user selected buildings. 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewImmeuble = function() {
        	// 
        	if ($scope.filteredImmeubleElfins.length > 1) {
        		$location.path('/elfin/'+immeublesCollectionId+'/IMMEUBLE').search('search', $scope.immeubleSearch.text);
        	} else if ($scope.filteredImmeubleElfins.length == 1) {
        		$location.path('/elfin/'+immeublesCollectionId+'/IMMEUBLE/' + $scope.filteredImmeubleElfins[0].Id);	
        	}
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
        		$scope.filteredUniteLocElfins = filterUniteLocElfins($scope.uniteLocElfins, $scope.uniteLocSearch);
	        }, function(response) {
	            var message = "Le chargement des unités locatives a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
	        });	
        
		/**
		 * uniteLocElfins result is loaded asynchronously.
		 */
    	$scope.$watch('uniteLocElfins', function() { 
    		if ($scope.uniteLocElfins!=null) {
				$scope.filteredUniteLocElfins = filterUniteLocElfins($scope.uniteLocElfins, $scope.uniteLocSearch);										
    		}
    	});	        

    	// ==== Navigation ===========================================

        /**
         * Navigate to end user selected uniteLoc (flats). 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewUniteLoc = function() {
        	// 
        	if ($scope.filteredUniteLocElfins.length > 1) {
            	$location.path('/elfin/'+uniteLocCollectionId+'/SURFACE').search('search', $scope.uniteLocSearch.text);
        	} else if ($scope.filteredUniteLocElfins.length == 1) {
            	$location.path('/elfin/'+uniteLocCollectionId+'/SURFACE/' + $scope.filteredUniteLocElfins[0].Id);	
        	}
        };      	

    	// ==== End user search related listener ==================        
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('uniteLocSearch', function(newSearch, oldSearch) {
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
		 *  Apply fontaineListAnyFilter
		 */
		var filterFontaineElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('fontaineListAnyFilter')(elfins_p, search_p.text);
	    	return filteredSortedElfins;
		};    	
    	
        /** Contains ELFINs JSON Array resulting from the GeoxmlService query */   
        $scope.fontaineElfins = null;

        /** User entered FONTAINE search criterion */
        $scope.fontaineSearch = { "text" : "" };             
        
        /** Query all available fountain FONTAINE */ 
        GeoxmlService.getCollection(fontaineCollectionId).getList()
	        .then(function(fontaineElfins) {
        		$scope.fontaineElfins = fontaineElfins;
        		$scope.filteredFontaineElfins = filterFontaineElfins($scope.fontaineElfins, $scope.fontaineSearch);
	        }, function(response) {
	            var message = "Le chargement des unités locatives a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
	        });	
        
		/**
		 * fontaineElfins result is loaded asynchronously.
		 */
    	$scope.$watch('fontaineElfins', function() { 
    		if ($scope.fontaineElfins!=null) {
				$scope.filteredFontaineElfins = filterFontaineElfins($scope.fontaineElfins, $scope.fontaineSearch);										
    		}
    	});	        

    	// ==== Navigation ===========================================
        /**
         * Navigate to end user selected FONTAINE. 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewFontaines = function() {
        	// 
        	if ($scope.filteredFontaineElfins.length > 1) {
            	$location.path('/elfin/'+fontaineCollectionId+'/FONTAINE').search('search', $scope.fontaineSearch.text);
        	} else if ($scope.filteredFontaineElfins.length == 1) {
            	$location.path('/elfin/'+fontaineCollectionId+'/FONTAINE/' + $scope.filteredFontaineElfins[0].Id);	
        	}
        };  
    	
    	// ==== End user search related listener ==================        
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('fontaineSearch', function(newSearch, oldSearch) {
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
	    	return filteredSortedElfins;
		};    	    	
    	
        /** Contains ELFINs JSON Array resulting from the GeoxmlService query */   
        $scope.wcElfins = null;
        
        /** User entered WC search criterion */
        $scope.wcSearch = { "text" : "" };                    

        /** Query all available WC */ 
        GeoxmlService.getCollection(wcCollectionId).getList()
	        .then(function(wcElfins) {
        		$scope.wcElfins = wcElfins;
        		$scope.filteredWcElfins = filterWcElfins($scope.wcElfins, $scope.wcSearch);
	        }, function(response) {
	            var message = "Le chargement des WC a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
	        });	
        

    	// ==== Navigation ===========================================
        /**
         * Navigate to end user selected WC. 
         * Either a list, a card or stay on current page if selection is 0.
         * (Although there are less than 50 WC extended search has been requested.) 
         */
        $scope.listOrViewWcs = function() {
        	if ($scope.wcElfins.length > 1) {
            	$location.path('/elfin/'+wcCollectionId+'/WC').search('search', $scope.wcSearch.text);
        	} else if ($scope.wcElfins.length == 1) {
            	$location.path('/elfin/'+wcCollectionId+'/WC/' + $scope.wcElfins[0].Id);	
        	}
        };      	
        
    	// ==== End user search related listener ==================        
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('wcSearch', function(newSearch, oldSearch) {
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
         * Navigate to end user selected HORLOGE. 
         * Either a list, a card or stay on current page if selection is 0.
         * (There are 2 HORLOGE. Do not provide extended search yet.) 
         */
        $scope.listOrViewHorloges = function() {
        	if ($scope.horlogeElfins.length > 1) {
            	$location.path('/elfin/'+horlogeCollectionId+'/HORLOGE');
        	} else if ($scope.horlogeElfins.length == 1) {
        		$location.path('/elfin/'+horlogeCollectionId+'/HORLOGE/' + $scope.horlogeElfins[0].Id);	
        	}        	
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
         * Navigate to end user selected ABRIBUS. 
         * Either a list, a card or stay on current page if selection is 0.
         * (There are 23 ABRIBUS. Do not provide extended search yet.)
         */
        $scope.listOrViewAbribus = function() {
        	if ($scope.abribusElfins.length > 1) {
            	$location.path('/elfin/'+abribusCollectionId+'/ABRIBUS');
        	} else if ($scope.abribusElfins.length == 1) {
        		$location.path('/elfin/'+abribusCollectionId+'/ABRIBUS/' + $scope.abribusElfins[0].Id);	
        	}
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

