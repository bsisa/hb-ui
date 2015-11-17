(function() {

    angular.module('hb5').controller('HbDashboardDomController', ['$attrs', '$scope', '$rootScope', '$routeParams', '$log', '$filter', '$location', '$timeout', 'HB_COLLECTIONS', 'HB_EVENTS', 'HB_ACCOUNTING_GROUPS', 'hbAlertMessages', 'hbUtil', 'hbQueryService', 'hbPrintService', 'GeoxmlService', function($attrs, $scope, $rootScope, $routeParams, $log, $filter, $location, $timeout, HB_COLLECTIONS, HB_EVENTS, HB_ACCOUNTING_GROUPS, hbAlertMessages, hbUtil, hbQueryService, hbPrintService, GeoxmlService) {
    
    	//$log.debug("    >>>> HbDashboardDomController called at " + new Date());
    	
    	// ============================================================
    	// Buildings Section - IMMEUBLE
    	// ============================================================    	
    	
        /** User entered IMMEUBLE search criterion */
        $scope.immeubleSearch = { 
        		"active" : "yes",
        		"text" : "",
        		"GER" : ""
        };    	
        
        $scope.immeubleTerrainDdpSearch = { 
        		"active" : $scope.immeubleSearch.active,
        		"text" : "",
        		"GER" : "",
        		"GROUPE_COMPTABLE" : HB_ACCOUNTING_GROUPS.DOM_TERRAIN_DDP
        };    	
        
        
        $scope.immeubleBatAgricoleSearch = { 
        		"active" : $scope.immeubleSearch.active,
        		"text" : "",
        		"GER" : "",
        		"GROUPE_COMPTABLE" : HB_ACCOUNTING_GROUPS.DOM_BATIMENT_AGRICOLE
        };
        
        $scope.immeubleBatLocatifSearch = { 
        		"active" : $scope.immeubleSearch.active,
        		"text" : "",
        		"GER" : "",
        		"GROUPE_COMPTABLE" : HB_ACCOUNTING_GROUPS.DOM_BATIMENT_LOCATIF
        };

        $scope.immeubleHangarDepotSearch = { 
        		"active" : $scope.immeubleSearch.active,
        		"text" : "",
        		"GER" : "",
        		"GROUPE_COMPTABLE" : HB_ACCOUNTING_GROUPS.DOM_HANGAR_DEPOT
        };


    	$scope.immeublesActiveStates = [
    	                                {label:'Actifs', value: 'yes'},
    	                                {label:'Sortis', value: 'no'},
    	                                {label:'Tous', value: 'any'}
    	                               ];
    	
    	
    	var immeublesCollectionId = HB_COLLECTIONS.IMMEUBLE_ID;
    	var immeublesXpath = '';
    	
    	
    	
    	
    	$scope.locationUnitSearch = { 
        		"text" : "",
        		"GER" : ""
    	};
    	
    	var locationUnitsCollectionId = HB_COLLECTIONS.LOCATION_UNIT_ID;
    	var locationUnitsXpath = '';

    	
    	// ============================================================
    	// ==== ACL update procedure ==================================
    	// ============================================================    	
    	
    	// Centralises ACL update procedure
        // Note: there is no security issue regarding this information, only
        // better end-user data selection.
        var updateAclRelatedData = function(dataManagerAccessRightsCreateUpdate) {
        	immeublesXpath = "//ELFIN[@CLASSE='IMMEUBLE' and IDENTIFIANT/GER='"+dataManagerAccessRightsCreateUpdate+"']"
        	locationUnitsXpath = "//ELFIN[@CLASSE='SURFACE' and IDENTIFIANT/GER='"+dataManagerAccessRightsCreateUpdate+"']"
        	$scope.immeubleSearch.GER = dataManagerAccessRightsCreateUpdate;
        	$scope.immeubleTerrainDdpSearch.GER = dataManagerAccessRightsCreateUpdate;
        	$scope.immeubleBatAgricoleSearch.GER = dataManagerAccessRightsCreateUpdate;
        	$scope.immeubleBatLocatifSearch.GER = dataManagerAccessRightsCreateUpdate;
        	$scope.immeubleHangarDepotSearch.GER = dataManagerAccessRightsCreateUpdate;
        	
        	$scope.locationUnitSearch.GER = dataManagerAccessRightsCreateUpdate;
        };    	
    	
        // Update on ACL_UPDATE events (Business end-user selection, geoxml reload, init.) 
        var aclUpdateRootscopeListenerUnregister = $rootScope.$on(HB_EVENTS.ACL_UPDATE, function(event, acl) {
        	//$log.debug("HbDashboardDomController: Received ACL_UPDATE notification, new acl = " + angular.toJson(acl))
        	updateAclRelatedData(acl.dataManagerAccessRightsCreateUpdate);
        	updateImmeubles();
        });           	
    	
        // Initialisation at current controller creation
        updateAclRelatedData(GeoxmlService.getCurrentDataManagerAccessRightsCreateUpdate());

        
        
        
    	// ============================================================
    	// ==== DOM IMMEUBLE list  ====================================
    	// ============================================================
        
		/**
		 *  Apply immeubleListAnyFilter
		 */
		var filterImmeubleElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('immeubleListAnyFilter')(elfins_p, search_p.text, search_p.active);
	    	return filteredSortedElfins;
		};    	
    	
        // ELFINs JSON Array for all IMMEUBLE matching immeublesXpath
        $scope.immeubleElfins = null;
        
        // Query all available buildings IMMEUBLE 
        var updateImmeubles = function() {
        	hbQueryService.getAugmentedImmeubles(immeublesXpath)
        		.then(function(augmentedImmeubles) {
					$scope.immeubleElfins = augmentedImmeubles;
		    		$scope.filteredImmeubleElfins = filterImmeubleElfins($scope.immeubleElfins, $scope.immeubleSearch);
		    		refreshFilteredImmeubleTerrainDdpElfins();
		    		refreshFilteredImmeubleBatAgricoleElfins();
		    		refreshFilteredImmeubleBatLocatifElfins();
		    		refreshFilteredImmeubleHangarDepotElfins();
        		}, function(message) {
		            hbAlertMessages.addAlert("danger",message);
		        });	
        };
        
        updateImmeubles();
    	
        
		/**
		 * immeubleElfins result is loaded asynchronously. Filtering need to be triggered on 
		 * immeubleElfins change except when empty. 
		 */
    	$scope.$watch('immeubleElfins', function() { 
    		if ($scope.immeubleElfins!=null) {
				$scope.filteredImmeubleElfins = filterImmeubleElfins($scope.immeubleElfins, $scope.immeubleSearch);		
        		refreshFilteredImmeubleTerrainDdpElfins();	
        		refreshFilteredImmeubleBatAgricoleElfins();
        		refreshFilteredImmeubleBatLocatifElfins();
        		refreshFilteredImmeubleHangarDepotElfins();
    		}
    	}, true);        
    	
    	
        /**
         * Navigates to end user selection result which leads to either 
         * a list, a card or stay on current page if selection is 0. 
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

		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('immeubleSearch', function(newSearch, oldSearch) {
    		if ($scope.immeubleElfins!=null) {
				$scope.filteredImmeubleElfins = filterImmeubleElfins($scope.immeubleElfins, $scope.immeubleSearch);
				
				// Current behaviour is to make use immeubleSearch active state for all immeuble sub-groups.
				$scope.immeubleTerrainDdpSearch.active = $scope.immeubleSearch.active;
				$scope.immeubleBatAgricoleSearch.active = $scope.immeubleSearch.active;
				$scope.immeubleBatLocatifSearch.active = $scope.immeubleSearch.active;
				$scope.immeubleHangarDepotSearch.active = $scope.immeubleSearch.active;
	    		
				refreshFilteredImmeubleTerrainDdpElfins();
	    		refreshFilteredImmeubleBatAgricoleElfins();
	    		refreshFilteredImmeubleBatLocatifElfins();
	    		refreshFilteredImmeubleHangarDepotElfins();
    		}
    	}, true);        
        
    	

    	
    	// ============================================================
    	// ==== DOM LOCATION UNIT/SURFACE list   ======================
    	// ============================================================    	
    	
        var filterLocationUnitElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('uniteLocativeListAnyFilter')(elfins_p, search_p.text);
	    	return filteredSortedElfins;
        };
        
        // Query all available location units SURFACE 
        var updateLocationUnits = function() {
        	hbQueryService.getLocationUnits(locationUnitsXpath)
        		.then(function(locationUnits) {
					$scope.locationUnitElfins = locationUnits;
		    		$scope.filteredLocationUnitElfins = filterLocationUnitElfins($scope.locationUnitElfins, $scope.locationUnitSearch);
        		}, function(message) {
        			// TODO: fix alert ...
		            hbAlertMessages.addAlert("danger",message);
		        });	
        };
        
        updateLocationUnits();        
        
		/**
		 * locationUnitElfins result is loaded asynchronously. Filtering need to be triggered on 
		 * locationUnitElfins change except when empty. 
		 */
    	$scope.$watch('locationUnitElfins', function() { 
    		if ($scope.locationUnitElfins!=null) {
    			$scope.filteredLocationUnitElfins = filterLocationUnitElfins($scope.locationUnitElfins, $scope.locationUnitSearch);
    		}
    	}, true);        
        

        /**
         * Navigates to end user selection result which leads to either 
         * a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewlocationUnit = function() {
        	// 
        	if ($scope.filteredLocationUnitElfins.length > 1) {
        		$location.path('/elfin/'+locationUnitsCollectionId+'/SURFACE')
        			.search('search', $scope.locationUnitSearch.text)
        			.search('GER', $scope.locationUnitSearch.GER);
        	} else if ($scope.filteredLocationUnitElfins.length == 1) {
        		$location.path('/elfin/'+locationUnitsCollectionId+'/SURFACE/' + $scope.filteredLocationUnitElfins[0].Id);	
        	}
        };                

		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('locationUnitSearch', function(newSearch, oldSearch) {
    		if ($scope.locationUnitElfins!=null) {
				$scope.filteredLocationUnitElfins = filterImmeubleElfins($scope.locationUnitElfins, $scope.locationUnitSearch);
    		}
    	}, true);

    	
    	
		
    	// ============================================================
    	// ==== HB_ACCOUNTING_GROUPS.DOM_TERRAIN_DDP section ==========
    	// ============================================================
		/**
		 *  Applies immeubleListFilter with predefined GROUPE_COMPTABLE parameter 'GROUPE_COMPTABLE'
		 */
		var filterImmeubleTerrainDdpElfins = function(elfins_p) {
	    	var filteredSortedElfins = $filter('immeubleListFilter')(elfins_p, $scope.immeubleTerrainDdpSearch);
	    	return filteredSortedElfins;
		};

    	/**
    	 *	Refreshes IMMEUBLE per GROUPE_COMPTABLE DOM_TERRAIN_DDP with filtering.
    	 */
    	var	refreshFilteredImmeubleTerrainDdpElfins = function () {
    		var fImmTerrDdp = filterImmeubleTerrainDdpElfins($scope.immeubleElfins);
    		$scope.immeubleTerrainDdpElfins = filterImmeubleElfins(fImmTerrDdp, $scope.immeubleTerrainDdpSearch);
    	};		

        /**
         * Navigates to end user selection result which leads to either 
         * a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewTerrainDdp = function() {
        	
        	if ($scope.immeubleTerrainDdpElfins.length > 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.IMMEUBLE_ID+'/IMMEUBLE')
        			.search('search', $scope.immeubleTerrainDdpSearch.text)
        			.search('active', $scope.immeubleTerrainDdpSearch.active)
        			.search('GER', $scope.immeubleTerrainDdpSearch.GER)
        			.search('GROUPE_COMPTABLE', $scope.immeubleTerrainDdpSearch.GROUPE_COMPTABLE);        		
        	} else if ($scope.immeubleTerrainDdpElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.IMMEUBLE_ID+'/IMMEUBLE/' + $scope.immeubleTerrainDdpElfins[0].Id);	
        	}
        };
        
		
		/**
		 * Updates filtered collection when search criteria are modified for 'immeubleTerrainDdp search' 
		 */
    	$scope.$watch('immeubleTerrainDdpSearch', function(newSearch, oldSearch) {
    		if ($scope.immeubleElfins!=null) {
    			refreshFilteredImmeubleTerrainDdpElfins();
    		}
    	}, true);								

    	
    	
    	
    	// ============================================================
    	// ==== HB_ACCOUNTING_GROUPS.DOM_BATIMENTS_AGRICOLES section ==
    	// ============================================================    	
    	
		/**
		 *  Applies immeubleListFilter with predefined GROUPE_COMPTABLE parameter 'GROUPE_COMPTABLE'
		 */
		var filterImmeubleBatAgricoleElfins = function(elfins_p) {
	    	var filteredSortedElfins = $filter('immeubleListFilter')(elfins_p, $scope.immeubleBatAgricoleSearch);
	    	return filteredSortedElfins;
		};

    	/**
    	 *	Refreshes IMMEUBLE per GROUPE_COMPTABLE DOM_BATIMENTS_AGRICOLES with filtering.
    	 */
    	var	refreshFilteredImmeubleBatAgricoleElfins = function () {
    		var fImmBatAgricole = filterImmeubleBatAgricoleElfins($scope.immeubleElfins);
    		$scope.immeubleBatAgricoleElfins = filterImmeubleElfins(fImmBatAgricole, $scope.immeubleBatAgricoleSearch);
    	};		

        /**
         * Navigates to end user selection result which leads to either 
         * a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewBatAgricole = function() {
        	
        	if ($scope.immeubleBatAgricoleElfins.length > 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.IMMEUBLE_ID+'/IMMEUBLE')
        			.search('search', $scope.immeubleBatAgricoleSearch.text)
        			.search('active', $scope.immeubleBatAgricoleSearch.active)
        			.search('GER', $scope.immeubleBatAgricoleSearch.GER)
        			.search('GROUPE_COMPTABLE', $scope.immeubleBatAgricoleSearch.GROUPE_COMPTABLE);        		
        	} else if ($scope.immeubleBatAgricoleElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.IMMEUBLE_ID+'/IMMEUBLE/' + $scope.immeubleBatAgricoleElfins[0].Id);	
        	}
        };
        
		
		/**
		 * Updates filtered collection when search criteria are modified for 'immeubleBatAgricole search' 
		 */
    	$scope.$watch('immeubleBatAgricoleSearch', function(newSearch, oldSearch) {
    		if ($scope.immeubleElfins!=null) {
    			refreshFilteredImmeubleBatAgricoleElfins();
    		}
    	}, true);
    	
    	
    	
    	
    	// ============================================================
    	// ==== HB_ACCOUNTING_GROUPS.DOM_BATIMENT_LOCATIF section =====
    	// ============================================================
    	
		/**
		 *  Applies immeubleListFilter with predefined GROUPE_COMPTABLE parameter 'GROUPE_COMPTABLE'
		 */
		var filterImmeubleBatLocatifElfins = function(elfins_p) {
	    	var filteredSortedElfins = $filter('immeubleListFilter')(elfins_p, $scope.immeubleBatLocatifSearch);
	    	return filteredSortedElfins;
		};

    	/**
    	 *	Refreshes IMMEUBLE per GROUPE_COMPTABLE DOM_BATIMENT_LOCATIF with filtering.
    	 */
    	var	refreshFilteredImmeubleBatLocatifElfins = function () {
    		var fImmBatLocatif = filterImmeubleBatLocatifElfins($scope.immeubleElfins);
    		$scope.immeubleBatLocatifElfins = filterImmeubleElfins(fImmBatLocatif, $scope.immeubleBatLocatifSearch);
    	};		

        /**
         * Navigates to end user selection result which leads to either 
         * a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewBatLocatif = function() {
        	
        	if ($scope.immeubleBatLocatifElfins.length > 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.IMMEUBLE_ID+'/IMMEUBLE')
        			.search('search', $scope.immeubleBatLocatifSearch.text)
        			.search('active', $scope.immeubleBatLocatifSearch.active)
        			.search('GER', $scope.immeubleBatLocatifSearch.GER)
        			.search('GROUPE_COMPTABLE', $scope.immeubleBatLocatifSearch.GROUPE_COMPTABLE);        		
        	} else if ($scope.immeubleBatLocatifElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.IMMEUBLE_ID+'/IMMEUBLE/' + $scope.immeubleBatLocatifElfins[0].Id);	
        	}
        };
        
		
		/**
		 * Updates filtered collection when search criteria are modified for 'immeubleBatLocatif search' 
		 */
    	$scope.$watch('immeubleBatLocatifSearch', function(newSearch, oldSearch) {
    		if ($scope.immeubleElfins!=null) {
    			refreshFilteredImmeubleBatLocatifElfins();
    		}
    	}, true);
    	
    	
    	
    	
    	// ============================================================
    	// ==== HB_ACCOUNTING_GROUPS.DOM_HANGAR_DEPOT section =========
    	// ============================================================
    	
		/**
		 *  Applies immeubleListFilter with predefined GROUPE_COMPTABLE parameter 'GROUPE_COMPTABLE'
		 */
		var filterImmeubleHangarDepotElfins = function(elfins_p) {
	    	var filteredSortedElfins = $filter('immeubleListFilter')(elfins_p, $scope.immeubleHangarDepotSearch);
	    	return filteredSortedElfins;
		};

    	/**
    	 *	Refreshes IMMEUBLE per GROUPE_COMPTABLE DOM_HANGAR_DEPOT with filtering.
    	 */
    	var	refreshFilteredImmeubleHangarDepotElfins = function () {
    		var fImmHangarDepot = filterImmeubleHangarDepotElfins($scope.immeubleElfins);
    		$scope.immeubleHangarDepotElfins = filterImmeubleElfins(fImmHangarDepot, $scope.immeubleHangarDepotSearch);
    	};		

        /**
         * Navigates to end user selection result which leads to either 
         * a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewHangarDepot = function() {
        	
        	if ($scope.immeubleHangarDepotElfins.length > 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.IMMEUBLE_ID+'/IMMEUBLE')
        			.search('search', $scope.immeubleHangarDepotSearch.text)
        			.search('active', $scope.immeubleHangarDepotSearch.active)
        			.search('GER', $scope.immeubleHangarDepotSearch.GER)
        			.search('GROUPE_COMPTABLE', $scope.immeubleHangarDepotSearch.GROUPE_COMPTABLE);        		
        	} else if ($scope.immeubleHangarDepotElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.IMMEUBLE_ID+'/IMMEUBLE/' + $scope.immeubleHangarDepotElfins[0].Id);	
        	}
        };
        
		
		/**
		 * Updates filtered collection when search criteria are modified for 'immeubleHangarDepot search' 
		 */
    	$scope.$watch('immeubleHangarDepotSearch', function(newSearch, oldSearch) {
    		if ($scope.immeubleElfins!=null) {
    			refreshFilteredImmeubleHangarDepotElfins();
    		}
    	}, true);

    	

    	
    	var focusOnSearchField = function() {
			$('#immeubleSearchTextInput').focus();	
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

