(function() {

    angular.module('hb5').controller('HbDashboardSdsController', ['$attrs', '$scope', '$routeParams', '$log', '$filter', '$location', '$timeout', 'HB_COLLECTIONS', 'hbAlertMessages', 'hbUtil', 'hbQueryService', function($attrs, $scope, $routeParams, $log, $filter, $location, $timeout, HB_COLLECTIONS, hbAlertMessages, hbUtil, hbQueryService) {
    
    	//$log.debug("    >>>> HbDashboardSdsController called at " + new Date());
    	
    	var AMENAGEMENT_SPORTIF_GROUPE_STADIUM = "Stade et terrain";
    	var AMENAGEMENT_SPORTIF_GROUPE_POOL = "Piscine";
    	var AMENAGEMENT_SPORTIF_GROUPE_RINK = "Patinoire";
    	var AMENAGEMENT_SPORTIF_GROUPE_HALL = "Salle";
    	var AMENAGEMENT_SPORTIF_GROUPE_SPORTS_AREA = "Place de sport";
    	var AMENAGEMENT_SPORTIF_GROUPE_SURFACE_RIGHT = "Droit de superficie et autre infra.";
    	
    	// ============================================================
    	// Section - AMENAGEMENT_SPORTIF
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	
		/**
		 *  Apply amenagementSportifListAnyFilter
		 */
		var filterAmenagementSportifElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('amenagementSportifListAnyFilter')(elfins_p, search_p.text);
	    	return filteredSortedElfins;
		};    	
		
		/**
		 *  Apply amenagementSportifListFilter with predefined group parameter 'Stadium'
		 */
		var filterAmenagementSportifStadiumElfins = function(elfins_p) {
	    	var filteredSortedElfins = $filter('amenagementSportifListFilter')(elfins_p, { "group" : AMENAGEMENT_SPORTIF_GROUPE_STADIUM } );
	    	return filteredSortedElfins;
		};
		
		/**
		 *  Apply amenagementSportifListFilter with predefined group parameter 'Pool'
		 */
		var filterAmenagementSportifPoolElfins = function(elfins_p) {
	    	var filteredSortedElfins = $filter('amenagementSportifListFilter')(elfins_p, { "group" : AMENAGEMENT_SPORTIF_GROUPE_POOL } );
	    	return filteredSortedElfins;
		};  
		
		/**
		 *  Apply amenagementSportifListFilter with predefined group parameter 'Rink'
		 */
		var filterAmenagementSportifRinkElfins = function(elfins_p) {
	    	var filteredSortedElfins = $filter('amenagementSportifListFilter')(elfins_p, { "group" : AMENAGEMENT_SPORTIF_GROUPE_RINK } );
	    	return filteredSortedElfins;
		};  
		
		/**
		 *  Apply amenagementSportifListFilter with predefined group parameter 'Hall'
		 */
		var filterAmenagementSportifHallElfins = function(elfins_p) {
	    	var filteredSortedElfins = $filter('amenagementSportifListFilter')(elfins_p, { "group" : AMENAGEMENT_SPORTIF_GROUPE_HALL } );
	    	return filteredSortedElfins;
		};  
		
		/**
		 *  Apply amenagementSportifListFilter with predefined group parameter 'Sports area'
		 */
		var filterAmenagementSportifSportsAreaElfins = function(elfins_p) {
	    	var filteredSortedElfins = $filter('amenagementSportifListFilter')(elfins_p, { "group" : AMENAGEMENT_SPORTIF_GROUPE_SPORTS_AREA } );
	    	return filteredSortedElfins;
		};  
		
		/**
		 *  Apply amenagementSportifListFilter with predefined group parameter 'Surface right'
		 */
		var filterAmenagementSportifSurfaceRightElfins = function(elfins_p) {
	    	var filteredSortedElfins = $filter('amenagementSportifListFilter')(elfins_p, { "group" : AMENAGEMENT_SPORTIF_GROUPE_SURFACE_RIGHT } );
	    	return filteredSortedElfins;
		};  
		
    	
        // Contains all AMENAGEMENT_SPORTIF ELFINs in a single JSON Array resulting from the hbQueryService   
        $scope.asElfins = null;
        
        // Query all available AMENAGEMENT_SPORTIF 
        hbQueryService.getAmenagementSportifs()        
	        .then(function(asElfins) {
        		
	        	$scope.asElfins = asElfins;
        		// Here above asElfins is a promise an might not be fully loaded 
	        	// when hereafter calls are performed. Reason for asElfins $watch.
        		refreshFilteredAsStadiumElfins();
        		refreshFilteredAsPoolElfins();
        		refreshFilteredAsRinkElfins();
        		refreshFilteredAsHallElfins();
        		refreshFilteredAsSportsAreaElfins();
        		refreshFilteredAsSurfaceRightElfins();
        		
	        }, function(response) {
	            var message = "Le chargement des immeubles a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
	        });	
    	
		/**
		 * asElfins result is loaded asynchronously.
		 */
    	$scope.$watch('asElfins', function() { 
    		if ($scope.asElfins!=null) {
    			
    			// Initialise AMENAGEMENT_SPORTIF per GROUPE without filtering.
    			$scope.asStadiumElfinsLength = filterAmenagementSportifStadiumElfins($scope.asElfins).length;
    			$scope.asPoolElfinsLength = filterAmenagementSportifPoolElfins($scope.asElfins).length;
    			$scope.asRinkElfinsLength = filterAmenagementSportifRinkElfins($scope.asElfins).length;
    			$scope.asHallElfinsLength = filterAmenagementSportifHallElfins($scope.asElfins).length;
    			$scope.asSportsAreaElfinsLength = filterAmenagementSportifSportsAreaElfins($scope.asElfins).length;
    			$scope.asSurfaceRightElfinsLength = filterAmenagementSportifSurfaceRightElfins($scope.asElfins).length;
    			
    			// Refresh AMENAGEMENT_SPORTIF per GROUPE with filtering.
        		refreshFilteredAsStadiumElfins();
        		refreshFilteredAsPoolElfins();
        		refreshFilteredAsRinkElfins();
        		refreshFilteredAsHallElfins();
        		refreshFilteredAsSportsAreaElfins();
        		refreshFilteredAsSurfaceRightElfins();										
    		}
    	});	        

    	// ==== Navigation ===========================================

        /**
         * Navigate to end user selected stadium 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewStadium = function() {
        	
        	if ($scope.filteredAsStadiumElfins.length > 1) {
        		var searchObj = { 'search' : $scope.asStadiumSearch.text, 'group' : AMENAGEMENT_SPORTIF_GROUPE_STADIUM};
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF').search(searchObj);
        	} else if ($scope.filteredAsStadiumElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF/' + $scope.filteredAsStadiumElfins[0].Id);	
        	}
        };
        
        /**
         * Navigate to end user selected pool 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewPool = function() {
        	
        	if ($scope.filteredAsPoolElfins.length > 1) {
        		var searchObj = { 'search' : $scope.asPoolSearch.text, 'group' : AMENAGEMENT_SPORTIF_GROUPE_POOL};
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF').search(searchObj);
        	} else if ($scope.filteredAsPoolElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF/' + $scope.filteredAsPoolElfins[0].Id);	
        	}
        };  
        
        /**
         * Navigate to end user selected stadium 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewRink = function() {
        	
        	if ($scope.filteredAsRinkElfins.length > 1) {
        		var searchObj = { 'search' : $scope.asRinkSearch.text, 'group' : AMENAGEMENT_SPORTIF_GROUPE_RINK};
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF').search(searchObj);
        	} else if ($scope.filteredAsRinkElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF/' + $scope.filteredAsRinkElfins[0].Id);	
        	}
        };  
        
        /**
         * Navigate to end user selected stadium 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewHall = function() {
        	
        	if ($scope.filteredAsHallElfins.length > 1) {
        		var searchObj = { 'search' : $scope.asHallSearch.text, 'group' : AMENAGEMENT_SPORTIF_GROUPE_HALL};
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF').search(searchObj);
        	} else if ($scope.filteredAsHallElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF/' + $scope.filteredAsHallElfins[0].Id);	
        	}
        };  
        
        /**
         * Navigate to end user selected stadium 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewSportsArea = function() {
        	
        	if ($scope.filteredAsSportsAreaElfins.length > 1) {
        		var searchObj = { 'search' : $scope.asSportsAreaSearch.text, 'group' : AMENAGEMENT_SPORTIF_GROUPE_SPORTS_AREA};
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF').search(searchObj);
        	} else if ($scope.filteredAsSportsAreaElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF/' + $scope.filteredAsSportsAreaElfins[0].Id);	
        	}
        };  
        
        /**
         * Navigate to end user selected stadium 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewSurfaceRight = function() {
        	
        	if ($scope.filteredAsSurfaceRightElfins.length > 1) {
        		var searchObj = { 'search' : $scope.asSurfaceRightSearch.text, 'group' : AMENAGEMENT_SPORTIF_GROUPE_SURFACE_RIGHT};
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF').search(searchObj);
        	} else if ($scope.filteredAsSurfaceRightElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF/' + $scope.filteredAsSurfaceRightElfins[0].Id);	
        	}
        };          

        
    	// ==== End user search and related listener ==================        
        /** User entered AMENAGEMENT_SPORTIF search criterion */
        $scope.asStadiumSearch = { "text" : "" };
        $scope.asPoolSearch = { "text" : "" };
        $scope.asRinkSearch = { "text" : "" };
        $scope.asHallSearch = { "text" : "" };
        $scope.asSportsAreaSearch = { "text" : "" };
        $scope.asSurfaceRightSearch = { "text" : "" };
        
		
		/**
		 * Update filtered collection when search criteria are modified for 'Stadium search' 
		 */
    	$scope.$watch('asStadiumSearch', function(newSearch, oldSearch) {
    		if ($scope.asElfins!=null) {
    			refreshFilteredAsStadiumElfins();
    		}
    	}, true);								
    	
		/**
		 * Update filtered collection when search criteria are modified for 'Hall search' 
		 */
    	$scope.$watch('asHallSearch', function(newSearch, oldSearch) {
    		if ($scope.asElfins!=null) {
    			refreshFilteredAsHallElfins();
    		}
    	}, true);
    	
		/**
		 * Update filtered collection when search criteria are modified for 'Rink search' 
		 */
    	$scope.$watch('asRinkSearch', function(newSearch, oldSearch) {
    		if ($scope.asElfins!=null) {
    			refreshFilteredAsRinkElfins();
    		}
    	}, true);
    	
		/**
		 * Update filtered collection when search criteria are modified for 'Pool search' 
		 */
    	$scope.$watch('asPoolSearch', function(newSearch, oldSearch) {
    		if ($scope.asElfins!=null) {
    			refreshFilteredAsPoolElfins();
    		}
    	}, true);
    	
		/**
		 * Update filtered collection when search criteria are modified for 'Sports area search' 
		 */
    	$scope.$watch('asSportsAreaSearch', function(newSearch, oldSearch) {
    		if ($scope.asElfins!=null) {
    			refreshFilteredAsSportsAreaElfins();
    		}
    	}, true);
    	
		/**
		 * Update filtered collection when search criteria are modified for 'Surface right search' 
		 */
    	$scope.$watch('asSurfaceRightSearch', function(newSearch, oldSearch) {
    		if ($scope.asElfins!=null) {
    			refreshFilteredAsSurfaceRightElfins();
    		}
    	}, true);    	

    	
    	var refreshFilteredAsStadiumElfins = function() {
    		$scope.filteredAsStadiumElfins = filterAmenagementSportifElfins(filterAmenagementSportifStadiumElfins($scope.asElfins), $scope.asStadiumSearch);
    	};
    	
    	var refreshFilteredAsPoolElfins = function() {
    		$scope.filteredAsPoolElfins = filterAmenagementSportifElfins(filterAmenagementSportifPoolElfins($scope.asElfins), $scope.asPoolSearch);
    	};
    	
    	var refreshFilteredAsRinkElfins = function() {
    		$scope.filteredAsRinkElfins = filterAmenagementSportifElfins(filterAmenagementSportifRinkElfins($scope.asElfins), $scope.asRinkSearch);
    	};
    	
    	var refreshFilteredAsHallElfins = function() {
    		$scope.filteredAsHallElfins = filterAmenagementSportifElfins(filterAmenagementSportifHallElfins($scope.asElfins), $scope.asHallSearch);
    	};
    	
    	var refreshFilteredAsSportsAreaElfins = function() {
    		$scope.filteredAsSportsAreaElfins = filterAmenagementSportifElfins(filterAmenagementSportifSportsAreaElfins($scope.asElfins), $scope.asSportsAreaSearch);
    	};
    	
    	var refreshFilteredAsSurfaceRightElfins = function() {
    		$scope.filteredAsSurfaceRightElfins = filterAmenagementSportifElfins(filterAmenagementSportifSurfaceRightElfins($scope.asElfins), $scope.asSurfaceRightSearch);
    	};    	
    	
    	// ============================================================
        // AMENAGEMENT_SPORTIF search - end
    	// ============================================================    	
		
        
        
    	var focusOnSearchField = function() {
			$('#asStadiumSearchTextInput').focus();	
		};        
		
		// Focus needs delay otherwise it fails finding the field 
		$timeout(focusOnSearchField, 250, false);    	
    	
    	
    }]);


})();

