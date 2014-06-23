(function() {

	angular.module('hb5').controller(
			'HbUserCardController',
			[
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'hbAlertMessages',
					'hbUtil', 
					'$rootScope',
					'HB_EVENTS',
					function($scope, GeoxmlService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil, $rootScope, HB_EVENTS) {

						$log.debug("    >>>> Using HbUserCardController ");
						
						// Actor linked to the current user.
						$scope.selected = { "collaborator" : null };
						// Actors selection list 
						//$scope.collaboratorActors = null;
						
						// Plain text passwords used to obtain the encrypted password signature. 
						// Must never be persisted nor logged.
						$scope.pwd1 = null;
						$scope.pwd2 = null;
						
						// Used to obtain hash for plain text passwords
						$scope.hash = function(pwd) {
							// Check pwd1 === pwd2 ?
							GeoxmlService.getHash(pwd).get()
					        .then(
					        	function(pwdHash) {
					        		$scope.elfin.IDENTIFIANT.ALIAS = pwdHash.hash;
					        		$scope.elfinForm.$setDirty();
					        	}, 
					        	function(response) {
					        		var message = "La modification du mot de passe a échoué (statut de retour: " + response.status + ")";
					        		hbAlertMessages.addAlert("danger",message);
					        	}
					        );
							// Reset values at each submission.
							$scope.pwd1 = null;
							$scope.pwd2 = null;
						};
						
						// Link to user actor for personal information (name, email, phone...)
				        $scope.getElfinActor = function (collectionId, elfinId) {
				        	
				        	//if (GeoxmlService.validateId(collectionId) && GeoxmlService.validateId(elfinId)) {
						        GeoxmlService.getElfin(collectionId, elfinId).get()
						        .then(function(elfin) {
						        	// Force CAR array sorting by POS attribute
						        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
						        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
						        	//       Need review of other similar operations
						        	if ( elfin['CARACTERISTIQUE'] != null && elfin['CARACTERISTIQUE']['CARSET'] != null && elfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
						        		hbUtil.reorderArrayByPOS(elfin['CARACTERISTIQUE']['CARSET']['CAR']);
						        	}
						        	$log.debug(">>>>>>>>>>>> collaboratorActor.Id = " + elfin.Id);
						        	$scope.selected.collaborator = elfin;
						        	}, function(response) {
						        	var message = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
						            hbAlertMessages.addAlert("danger",message);
						        });
//				            }
//				            else {
//				                var message = "Les identifiants de collection (" + $scope.collectionId + " ) et/ou (" + $scope.elfinId + ") ne sont pas corrects";
//				                hbAlertMessages.addAlert("warning",message);
//				            }        		
			        		
			        	};
			        	
			        	$scope.availableRolesCheckboxModel = null;
			        	
			        	// Load available roles
				        $scope.getAvailableRoles = function () {
				        	
				            var xpathForRoles = "//ELFIN[@CLASSE='ROLE']";
				            // TODO: rolesCollectionId must come from server configuration resource.
				            var rolesCollectionId = 'G10000101010101000';			        	

				            // Asychronous roles preloading
				            GeoxmlService.getCollection(rolesCollectionId).getList({"xpath" : xpathForRoles})
							.then(function(availableRoles) {
									$log.debug(">>>> HbUserCardController: loaded availableRoles.");

									// Get available role name
									var availableRoleNames = _.chain(availableRoles).pluck('IDENTIFIANT').pluck('NOM').value();
									
									$scope.availableRolesCheckboxModel = [];

									for (var i = 0; i < availableRoleNames.length; i++) {
										//$log.debug("availableRoleNames["+i+"] = " + availableRoleNames[i]);	
										$scope.availableRolesCheckboxModel.push({"id":i,"name": availableRoleNames[i] , "state" : false});
									}

									// Expose availableRoles to scope for use by $scope.updateUserRoles create operation,
									// only once $scope.availableRolesCheckboxModel update is complete as $scope.availableRoles is checked 
									// against in $on HB_EVENTS.ELFIN_LOADED listener. (Fix #5)
									$scope.availableRoles = availableRoles;									
									
									$log.debug(">>>> HbUserCardController: $scope.availableRolesCheckboxModel.length = " + $scope.availableRolesCheckboxModel.length);
									// Only proceed with user roles initialisation if USER elfin is available (Fix #5)
									if ($scope.elfin) {
										$log.debug(">>>> HbUserCardController: PERFORM $scope.initWithUserRoles() in getAvailableRoles, OK");
										$scope.initWithUserRoles();										
									} else {
										$log.debug(">>>> HbUserCardController: DELAY   $scope.initWithUserRoles() in getAvailableRoles, current USER elfin not yet available, PENDING.");	
									}
								},
								function(response) {
									var message = "Le chargement des roles a échoué (statut de retour: "+ response.status+ ")";
						            hbAlertMessages.addAlert("danger",message);
								});				

			        	};

			        	$scope.initWithUserRoles = function () {
			        		
			        		if ($scope.elfin) {
			        			$log.debug(">>>> HbUserCardController: initWithUserRoles - elfin AVAILABLE");
			        		} else {
			        			$log.debug(">>>> HbUserCardController: initWithUserRoles - DAMNED!!! elfin  NOT AVAILABLE");
			        		}
			        		
			        		//var userRoleNames = _.chain($scope.elfin).pluck('CARACTERISTIQUE').pluck('FRACTION').pluck('L').C[2].value();
			        		//var userRoleNames = angular.toJson($scope.elfin['CARACTERISTIQUE']['FRACTION'], true);
			        		var userRoleNames = [];
			        		var userRolesRef = $scope.elfin['CARACTERISTIQUE']['FRACTION']['L'];
			            	/* Sort menu lines by POS */
			                if (angular.isArray(userRolesRef)) {
			                	hbUtil.reorderArrayByPOS(userRolesRef);
			                    /* Sort each role line cells */
			                    angular.forEach(userRolesRef, function(L) {
			                    	var lineCells = L.C;
			                        if (angular.isArray(lineCells)) {
			                        	hbUtil.reorderArrayByPOS(lineCells);
			                        }
			                        userRoleNames.push(L.C[2].VALUE);
			                    });
			                }			        		
			        		
			        		for (var i = 0; i < $scope.availableRolesCheckboxModel.length; i++) {
								var roleModel = $scope.availableRolesCheckboxModel[i];
								var matches = _.find(userRoleNames, function(name){ return name == roleModel.name; } );
								//$log.debug("roleModel.name: " + roleModel.name + ", matches: " + matches);
								if ( matches ) {
									$scope.availableRolesCheckboxModel[i].state = true;
								};
							};
			        	};
			        	
		        	
			        	/**
			        	 * Performs addition or deletion of role following user action. 
			        	 * Save button need to be pressed to send updates to backend.
			        	 */
			        	$scope.updateUserRoles = function (role) {

			        		$log.debug("      >>>>>>>>>>>> updateUserRoles for name / state "+ role.name +" / "+role.state+" called <<<<<<<<<<<<");
			        		if (role.state) {
			        			$log.debug("      >>>>>>>>>>>> DELETE ROLE <<<<<<<<<<<<");
			        			// Loop backward while deleting possibly more than a single element (should not happen)
			        			for (var i = $scope.elfin['CARACTERISTIQUE']['FRACTION']['L'].length-1; i >=0; i--) {
									var L = $scope.elfin['CARACTERISTIQUE']['FRACTION']['L'][i];
									var currRoleName = L.C[2].VALUE;
									if (role.name == currRoleName) {
										$log.debug("      >>>>>>>>>>>> DELETE ROLE at position "+i+" <<<<<<<<<<<<");
										//TODO: manage POS values while removing an entry.
										$scope.elfin['CARACTERISTIQUE']['FRACTION']['L'].splice(i,1);
									} else {
										$log.debug("      >>>>>>>>>>>> NO DELETE at position "+i+" <<<<<<<<<<<<");	
									}
								}
			        		} else {
			        			$log.debug("      >>>>>>>>>>>> CREATE ROLE <<<<<<<<<<<<");
			        			var roleDefinition = _.find($scope.availableRoles, function(roleDef){ return roleDef['IDENTIFIANT']['NOM'] == role.name; } );
			        			var nbUserRole = $scope.elfin['CARACTERISTIQUE']['FRACTION']['L'].length;
			        			$scope.elfin['CARACTERISTIQUE']['FRACTION']['L'].push($scope.createRole(roleDefinition['ID_G'],roleDefinition['Id'],role.name, nbUserRole+1));
			        		}
			        	};			        	
			        	
			        	$scope.createRole = function(ID_G,Id,name,pos) {
			        		var newRole = {
			                        "C": [
			                              {
			                                  "POS": 1,
			                                  "VALUE": ID_G
			                              },
			                              {
			                                  "POS": 2,
			                                  "VALUE": Id
			                              },
			                              {
			                                  "POS": 3,
			                                  "VALUE": name
			                              }
			                          ],
			                          "POS": pos
			                      };
			        		return newRole;
			        	};
			        	
			            // Load ELFIN collaborator ACTOR only once main elfin (here USER) has been loaded
			            $rootScope.$on(HB_EVENTS.ELFIN_LOADED, function(event, elfin) {
			            	
			            	$log.debug(">>>> HbUserCardController: HB_EVENTS.ELFIN_LOADED for elfin.Id = " + elfin.Id);
		            		// Only proceed with $scope.initWithUserRoles() if $scope.availableRoles have been loaded. (Fix #5)
			            	if ($scope.availableRoles) {
			            		$log.debug(">>>> HbUserCardController: PERFORM $scope.initWithUserRoles() (nb.available = ) "+ $scope.availableRoles.length +" in HB_EVENTS.ELFIN_LOADED, OK.");
			            		$scope.initWithUserRoles();	
			            	} else {
			            		$log.debug(">>>> HbUserCardController: DELAY   $scope.initWithUserRoles() $scope.availableRoles not yet available while in HB_EVENTS.ELFIN_LOADED, PENDING.");
			            	}
			            	
			            	// Make sure a collaborator reference exists before loading
				        	if ($scope.elfin.PARTENAIRE && $scope.elfin.PARTENAIRE.USAGER && $scope.elfin.PARTENAIRE.USAGER.Id && $scope.elfin.PARTENAIRE.USAGER.ID_G) {
				        		$scope.getElfinActor($scope.elfin.PARTENAIRE.USAGER.ID_G, $scope.elfin.PARTENAIRE.USAGER.Id);	
				        	}			            	

			            });			        	
			        	
			            
			            /**
			             * Update current USER link to ACTOR upon new ACTOR selection
			             */
			            $scope.$watch('selected.collaborator.Id', function(newId, oldId) {
			            	
			            	if ( newId && $scope.elfin && ($scope.elfin.PARTENAIRE.USAGER.Id != $scope.selected.collaborator.Id) ) {

				            	// Update the new ACTOR ids
				            	$scope.elfin.PARTENAIRE.USAGER.ID_G = $scope.selected.collaborator.ID_G;
				            	$scope.elfin.PARTENAIRE.USAGER.Id = $scope.selected.collaborator.Id;
				            	// According to the GeoXML Schema GROUP and NOM are part of USAGER.
				            	$scope.elfin.PARTENAIRE.USAGER.GROUPE = $scope.selected.collaborator.GROUPE;
				            	$scope.elfin.PARTENAIRE.USAGER.NOM = $scope.selected.collaborator.IDENTIFIANT.NOM;
				            	// Notify the user the data need saving.
				            	$scope.elfinForm.$setDirty();			            		
			            	}

			            });
			            
			            // Load available roles
			            $scope.getAvailableRoles();
			            
					} ]);
	

})();