(function() {

    angular.module('hb5').controller('HbDashboardDomController', ['$attrs', '$scope', '$rootScope', '$routeParams', '$log', '$filter', '$location', '$timeout', 'HB_COLLECTIONS', 'HB_EVENTS', 'hbAlertMessages', 'hbUtil', 'hbQueryService', 'hbPrintService', 'GeoxmlService', function($attrs, $scope, $rootScope, $routeParams, $log, $filter, $location, $timeout, HB_COLLECTIONS, HB_EVENTS, hbAlertMessages, hbUtil, hbQueryService, hbPrintService, GeoxmlService) {
    
    	//$log.debug("    >>>> HbDashboardDomController called at " + new Date());
    	
    	
    	// ============================================================
    	// Buildings Section - IMMEUBLE
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	
        /** User entered IMMEUBLE search criterion */
        $scope.immeubleSearch = { 
        		"active" : "yes",
        		"text" : "",
        		"GER" : ""
        };    	
        
        $scope.immeubleTerrainDdpSearch = { 
        		"active" : $scope.immeubleSearch.active,
        		"text" : "",
        		"GER" : ""
        };    	
    	
    	$scope.immeublesActiveStates = [
    	                                {label:'Actifs', value: 'yes'},
    	                                {label:'Sortis', value: 'no'},
    	                                {label:'Tous', value: 'any'}
    	                               ];
    	
    	
    	var immeublesCollectionId = HB_COLLECTIONS.IMMEUBLE_ID;
    	var immeublesXpath = '';

    	// Centralises ACL update procedure
        // Note: there is no security issue regarding this information, only
        // better end-user data selection.
        var updateAclRelatedData = function(dataManagerAccessRightsCreateUpdate) {
        	immeublesXpath = "//ELFIN[@CLASSE='IMMEUBLE' and IDENTIFIANT/GER='"+dataManagerAccessRightsCreateUpdate+"']"
        	$scope.immeubleSearch.GER = dataManagerAccessRightsCreateUpdate;
        	$scope.immeubleTerrainDdpSearch.GER = dataManagerAccessRightsCreateUpdate;
        };    	
    	
        // Update on ACL_UPDATE events (Business end-user selection, geoxml reload, init.) 
        var aclUpdateRootscopeListenerUnregister = $rootScope.$on(HB_EVENTS.ACL_UPDATE, function(event, acl) {
        	//$log.debug("HbDashboardDomController: Received ACL_UPDATE notification, new acl = " + angular.toJson(acl))
        	updateAclRelatedData(acl.dataManagerAccessRightsCreateUpdate);
        	updateImmeubles();
        });           	
    	
        // Initialisation at current controller creation
        updateAclRelatedData(GeoxmlService.getCurrentDataManagerAccessRightsCreateUpdate());

        
		/**
		 *  Apply immeubleListAnyFilter
		 */
		var filterImmeubleElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('immeubleListAnyFilter')(elfins_p, search_p.text, search_p.active);
	    	return filteredSortedElfins;
		};    	
    	
        // Contains ELFINs JSON Array resulting from the GeoxmlService query   
        $scope.immeubleElfins = null;
        
        // Query all available buildings IMMEUBLE 
        //hbQueryService.getImmeubles("//ELFIN[@CLASSE='IMMEUBLE' and IDENTIFIANT/GER='"+ger+"']")
        var updateImmeubles = function() {

        	hbQueryService.getAugmentedImmeubles(immeublesXpath)
        		.then(function(augmentedImmeubles) {
					$scope.immeubleElfins = augmentedImmeubles;
		    		$scope.filteredImmeubleElfins = filterImmeubleElfins($scope.immeubleElfins, $scope.immeubleSearch);
		    		
		    		refreshFilteredImmeubleTerrainDdpElfins();
		    		
        		}, function(message) {
		            hbAlertMessages.addAlert("danger",message);
		        });	
        };
        
        updateImmeubles();
    	
		/**
		 * immeubleElfins result is loaded asynchronously.
		 */
    	$scope.$watch('immeubleElfins', function() { 
    		if ($scope.immeubleElfins!=null) {
				$scope.filteredImmeubleElfins = filterImmeubleElfins($scope.immeubleElfins, $scope.immeubleSearch);		
				
	   			// Initialise AMENAGEMENT_SPORTIF per GROUPE without filtering.
    			$scope.immeubleTerrainDdpElfinsLength = filterImmeubleTerrainDdpElfins($scope.immeubleElfins).length;
    			$log.debug("$scope.immeubleTerrainDdpElfinsLength = " + $scope.immeubleTerrainDdpElfinsLength);

    			// Refresh IMMEUBLE per GROUPE_COMPTABLE with filtering.
        		refreshFilteredImmeubleTerrainDdpElfins();				
				
    		}
    	}, true);        

    	// ==== Navigation ===========================================

        /**
         * Navigate to end user selected buildings. 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewImmeuble = function() {
        	// 
        	if ($scope.filteredImmeubleElfins.length > 1) {
        		$location.path('/elfin/'+immeublesCollectionId+'/IMMEUBLE')
        			.search('search', $scope.immeubleSearch.text)
        			.search('active', $scope.immeubleSearch.active)
        			.search('GER', $scope.immeubleSearch.GER);
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
				$log.debug("$scope.filteredImmeubleElfins.length = " + $scope.filteredImmeubleElfins.length);
 
				
    		}
    	}, true);								
			
    	// ============================================================
        // Buildings search - end
    	// ============================================================    	
    	
    	
    	
    	
    	var IMMEUBLE_GC_TERRAIN_DDP = "Terrains – D.D.P."
    	
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
		 *  Apply immeubleListFilter with predefined GROUPE_COMPTABLE parameter 'GROUPE_COMPTABLE'
		 */
		var filterImmeubleTerrainDdpElfins = function(elfins_p) {
			$log.debug("filterImmeubleTerrainDdpElfins >>>> elfins_p.length = " + elfins_p.length);
	    	var filteredSortedElfins = $filter('immeubleListFilter')(elfins_p, $scope.immeubleTerrainDdpSearch);
	    	
//    		{
//    			"active" : $scope.immeubleSearch.active,
//    			"GROUPE_COMPTABLE" : IMMEUBLE_GC_TERRAIN_DDP,
//    			"GER" : $scope.immeubleSearch.GER
//    		}	    	
	    	
	    	$log.debug("filterImmeubleTerrainDdpElfins >>>> filteredSortedElfins.length = " + filteredSortedElfins.length);
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
        		//refreshFilteredImmeubleTerrainDdpElfins();
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
    			//$scope.asStadiumElfinsLength = filterImmeubleTerrainDdpElfins($scope.asElfins).length;
    			$scope.asPoolElfinsLength = filterAmenagementSportifPoolElfins($scope.asElfins).length;
    			$scope.asRinkElfinsLength = filterAmenagementSportifRinkElfins($scope.asElfins).length;
    			$scope.asHallElfinsLength = filterAmenagementSportifHallElfins($scope.asElfins).length;
    			$scope.asSportsAreaElfinsLength = filterAmenagementSportifSportsAreaElfins($scope.asElfins).length;
    			$scope.asSurfaceRightElfinsLength = filterAmenagementSportifSurfaceRightElfins($scope.asElfins).length;
    			
    			// Refresh AMENAGEMENT_SPORTIF per GROUPE with filtering.
        		//refreshFilteredImmeubleTerrainDdpElfins();
        		refreshFilteredAsPoolElfins();
        		refreshFilteredAsRinkElfins();
        		refreshFilteredAsHallElfins();
        		refreshFilteredAsSportsAreaElfins();
        		refreshFilteredAsSurfaceRightElfins();										
    		}
    	});	        

    	// ==== Navigation ===========================================

        /**
         * Navigate to end user selected IMMEUBLE_GC_TERRAIN_DDP 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewTerrainDdp = function() {
        	
        	if ($scope.immeubleTerrainDdpElfins.length > 1) {
        		//var searchObj = { 'search' : $scope.immeubleTerrainDdpSearch.text, 'GROUPE_COMPTABLE' : IMMEUBLE_GC_TERRAIN_DDP};
        		$location.path('/elfin/'+HB_COLLECTIONS.IMMEUBLE_ID+'/IMMEUBLE')
        			.search('search', $scope.immeubleTerrainDdpSearch.text)
        			.search('active', $scope.immeubleTerrainDdpSearch.active)
        			.search('GER', $scope.immeubleTerrainDdpSearch.GER);

        		
        		
//        		.search('search', $scope.immeubleSearch.text)
//    			.search('active', $scope.immeubleSearch.active)
//    			.search('GER', $scope.immeubleSearch.GER);        		
        		
        		
        	} else if ($scope.immeubleTerrainDdpElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.IMMEUBLE_ID+'/IMMEUBLE/' + $scope.immeubleTerrainDdpElfins[0].Id);	
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
        $scope.immeubleTerrainDdpSearch = { "text" : "" };        
        //$scope.asStadiumSearch = { "text" : "" };
        $scope.asPoolSearch = { "text" : "" };
        $scope.asRinkSearch = { "text" : "" };
        $scope.asHallSearch = { "text" : "" };
        $scope.asSportsAreaSearch = { "text" : "" };
        $scope.asSurfaceRightSearch = { "text" : "" };
        
		
		/**
		 * Update filtered collection when search criteria are modified for 'immeubleTerrainDdp search' 
		 */
    	$scope.$watch('immeubleTerrainDdpSearch', function(newSearch, oldSearch) {
    		if ($scope.immeubleElfins!=null) {
    			refreshFilteredImmeubleTerrainDdpElfins();
    			//refreshFilteredAsStadiumElfins();
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

    	
    	// TODO: rename to DDP
    	//var refreshFilteredAsStadiumElfins = function() {
    	var	refreshFilteredImmeubleTerrainDdpElfins = function () {
        	// TODO: 
    		// * rename to DDP
    		// * make use of $scope.immeuble ref
    		// * make use of $scope.immeubleDdpSearch ref
    		// * make use of filterImmeuble...
    		// * update filteredImmeubleDdp...     

    		$log.debug(">>>> REFRESHING TERRAIN DDP: $scope.immeubleElfins.length = " + $scope.immeubleElfins.length +", $scope.immeubleTerrainDdpSearch = " + angular.toJson($scope.immeubleTerrainDdpSearch)) ;
    		var fImmTerrDdp = filterImmeubleTerrainDdpElfins($scope.immeubleElfins);
    		$log.debug(">>>> REFRESHING: $scope.immeubleElfins ("+$scope.immeubleElfins.length+") => fImmTerrDdp ("+fImmTerrDdp.length+") ");
    		$scope.immeubleTerrainDdpElfins = filterImmeubleElfins(fImmTerrDdp, $scope.immeubleTerrainDdpSearch);
    		$log.debug(">>>> REFRESHING TERRAIN DDP: $scope.immeubleTerrainDdpElfins.length = " + $scope.immeubleTerrainDdpElfins.length);
    		//$scope.filteredAsStadiumElfins          = filterAmenagementSportifElfins(filterImmeubleTerrainDdpElfins($scope.immeubleElfins), $scope.asStadiumSearch);
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
    	
		
		
        /**
         * Clean up rootScope listeners explicitely (required). 
         */
        $scope.$on('$destroy', function(event, data){
        	aclUpdateRootscopeListenerUnregister();
        });
		
		
    	
    }]);


})();

