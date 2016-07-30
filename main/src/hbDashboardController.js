(function() {

    angular.module('hb5').controller('HbDashboardController', ['$attrs', '$scope', 'hbQueryService', 'GeoxmlService', '$routeParams', '$log', '$filter', '$location', '$timeout', 'userDetails', 'HB_COLLECTIONS', 'HB_ROLE_FONCTION', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, hbQueryService, GeoxmlService, $routeParams, $log, $filter, $location, $timeout, userDetails, HB_COLLECTIONS, HB_ROLE_FONCTION, hbAlertMessages, hbUtil) {
    
    	//$log.debug("    >>>> HbDashboardController called at " + new Date());
    	
    	
		$scope.canManageOrders = _.contains(userDetails.getRoles(), HB_ROLE_FONCTION.ORDERS_STATISTICS);
    	
    	
    	// ============================================================
    	// Buildings Section - IMMEUBLE
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	
    	$scope.immeublesActiveStates = [
    	                                {label:'Actifs', value: 'yes'},
    	                                {label:'Sortis', value: 'no'},
    	                                {label:'Tous', value: 'any'}
    	                               ];
    	
    	var immeublesCollectionId = HB_COLLECTIONS.IMMEUBLE_ID;
    	
    	
    	// Init distinct PRESTATION groupe comptable
    	$scope.accountingGroups = new Array();

		hbQueryService.getJsonAccountingGroups().then(function(jsonAccountingGroups) {
			$scope.accountingGroups = jsonAccountingGroups.choices;
		}, function(response) {
        	var errorMessage = "Error with status code " + response.status + " while getting JSON accountingGroups.";
        	$log.error(errorMessage);
        	hbAlertMessages.addAlert("danger","Les groupes comptables n'ont pu être obtenus.");
        });						

    	
		/**
		 *  Apply immeubleListAnyFilter
		 */
		var filterImmeubleElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('immeubleListAnyFilter')(elfins_p, search_p.text, search_p.active);
	    	return filteredSortedElfins;
		};    	
    	
        // Contains ELFINs JSON Array resulting from the hbQueryService query   
        $scope.immeubleElfins = null;
        
        // Query all available buildings IMMEUBLE 
        hbQueryService.getAugmentedImmeubles("//ELFIN[@CLASSE='IMMEUBLE']")
	        .then(function(immeubleElfins) {
        		$scope.immeubleElfins = immeubleElfins;
        		$scope.filteredImmeubleElfins = filterImmeubleElfins($scope.immeubleElfins, $scope.immeubleSearch);
	        }, function(response) {
	            //var message = "Le chargement des immeubles a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",response);
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
        		$location.path('/elfin/'+immeublesCollectionId+'/IMMEUBLE').search('search', $scope.immeubleSearch.text).search('active', $scope.immeubleSearch.active);
        	} else if ($scope.filteredImmeubleElfins.length == 1) {
        		$location.path('/elfin/'+immeublesCollectionId+'/IMMEUBLE/' + $scope.filteredImmeubleElfins[0].Id);	
        	}
        };                

        
    	// ==== End user search and related listener ==================        
        /** User entered IMMEUBLE search criterion */
        $scope.immeubleSearch = { 
        		"active" : "yes",
        		"text" : "",
        		"GROUPE_COMPTABLE" : ""
        };
		
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
	    	var filteredSortedElfins = $filter('uniteLocativeListAnyFilter')(elfins_p, search_p.text, $scope.immeubleElfins);
	    	return filteredSortedElfins;
		};    	
    	
        /** Contains ELFINs JSON Array resulting from the hbQueryService query */   
        $scope.uniteLocElfins = null;

        /** User entered IMMEUBLE search criterion */
        $scope.uniteLocSearch = { "text" : "" };             
        
        /** Query all available buildings IMMEUBLE */ 
        hbQueryService.getLocationUnits()
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
        	// filteredUniteLocElfins takes time to load
        	if ($scope.filteredUniteLocElfins) {
	        	if ($scope.filteredUniteLocElfins.length > 1) {
	            	$location.path('/elfin/'+uniteLocCollectionId+'/SURFACE').search('search', $scope.uniteLocSearch.text);
	        	} else if ($scope.filteredUniteLocElfins.length == 1) {
	            	$location.path('/elfin/'+uniteLocCollectionId+'/SURFACE/' + $scope.filteredUniteLocElfins[0].Id);	
	        	}
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
    	
        /** Contains ELFINs JSON Array resulting from the hbQueryService query */   
        $scope.fontaineElfins = null;

        /** User entered FONTAINE search criterion */
        $scope.fontaineSearch = { "text" : "" };             
        
        /** Query all available fountain FONTAINE */ 
        hbQueryService.getFontaines()
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
    	
        /** Contains ELFINs JSON Array resulting from the hbQueryService query */   
        $scope.wcElfins = null;
        
        /** User entered WC search criterion */
        $scope.wcSearch = { "text" : "" };                    

        /** Query all available WC */ 
        hbQueryService.getWcList()
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
    	
        /** Contains ELFINs JSON Array resulting from the hbQueryService query */   
        $scope.horlogeElfins = null;

        /** Query all available Horloges */ 
        hbQueryService.getHorlogeList()
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
    	
        /** Contains ELFINs JSON Array resulting from the hbQueryService query */   
        $scope.abribusElfins = null;

        /** Query all available ABRIBUS */ 
        hbQueryService.getAbribusList()
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
        
        
        
        
    	// ============================================================
    	// COMMANDE Section
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	var commandeCollectionId = HB_COLLECTIONS.COMMANDE_ID;
    	
		/**
		 *  Apply commandeListAnyFilter
		 */
		var filterCommandeElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('commandeListAnyFilter')(elfins_p, search_p.text);
	    	return filteredSortedElfins;
		};    	    	
    	
        /** Contains ELFINs JSON Array resulting from the hbQueryService query */   
        $scope.commandeElfins = null;
        
        /** User entered COMMANDE search criterion */
        $scope.commandeSearch = { 
        		"text" : "" ,
        		"id" : ""
        	};                    

        /** Query all available COMMANDE */ 
        hbQueryService.getCommandes()
	        .then(function(commandeElfins) {
        		$scope.commandeElfins = commandeElfins;
        		$scope.filteredCommandeElfins = filterCommandeElfins($scope.commandeElfins, $scope.commandeSearch);
	        }, function(response) {
	            var message = "Le chargement des COMMANDEs a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
	        });	
        

    	// ==== Navigation ===========================================
        /**
         * Navigate to end user selected COMMANDE. 
         * Either a list, a card or stay on current page if selection is 0.
         */
        $scope.listOrViewCommandes = function() {
        	if ($scope.commandeElfins.length > 1) {
            	$location.path('/elfin/'+commandeCollectionId+'/COMMANDE').search('search', $scope.commandeSearch.text);
        	} else if ($scope.commandeElfins.length == 1) {
            	$location.path('/elfin/'+commandeCollectionId+'/COMMANDE/' + $scope.commandeElfins[0].Id);	
        	}
        };      	
        
    	// ==== End user search related listener ==================        
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('commandeSearch', function(newSearch, oldSearch) {
    		if ($scope.commandeElfins!=null) {
				$scope.filteredCommandeElfins = filterCommandeElfins($scope.commandeElfins, $scope.commandeSearch);
    		}
    	}, true);        
			
    	
    	// ==== Order creation function ===========================
    	
        $scope.createNewCommande = function() {
			$location.path( "/elfin/create/COMMANDE" );
        };
    	
        /**
         * Generic find ELFIN by Id function. Currently intended to COMMANDE by will work for any valid ELFIN Id.
         */
        $scope.findById = function(elfinId) {
        	
            /* Load global configuration */
            GeoxmlService.getElfinById(elfinId).get()      
              .then(function(elfin) {
            	  var redirectUrl = "/elfin/"+ elfin.ID_G +"/"+elfin.CLASSE+"/"+elfin.Id;
            	  $location.path(redirectUrl);
              }, function(response) {
              	var errorMessage = (response.status === 404) ? "Aucun objet trouvé pour l'identifiant `Id` = " + idParam : "Error with status code " + response.status + " while getting object for Id = " + idParam;
               	$log.error(errorMessage);
                hbAlertMessages.addAlert("danger",errorMessage);
              }
            );         	
        	
        };
    	
    	
    	// ============================================================
        // COMMANDE Section - end
    	// ============================================================
        
        
        
        
    	var focusOnSearchField = function() {
			$('#immeubleSearchTextInput').focus();	
		};        
		
		// TODO: FocusTimeout issue. Find a better solution ? 
		$timeout(focusOnSearchField, 250, false);    	
    	
    	
    }]);


})();

