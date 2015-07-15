(function() {

	angular.module('hb5').controller(
			'HbUserCardController',
			[
					'$scope',
					'GeoxmlService',
					'hbQueryService',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'hbAlertMessages',
					'hbUtil', 
					'$rootScope',
					'$timeout',
					function($scope, GeoxmlService, hbQueryService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil, $rootScope, $timeout) {

						//$log.debug("    >>>> Using HbUserCardController ");
						
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
						
			        	
			        	$scope.availableRolesCheckboxModel = null;
			        	
			        	// Load available roles
				        $scope.getAvailableRoles = function () {
				        	
				            // Asychronous roles preloading
				        	var xpathForRoles = "//ELFIN[@CLASSE='ROLE']";
				            hbQueryService.getRoleList(xpathForRoles)
							.then(function(availableRoles) {

								$log.debug(">>>> HbUserCardController: loaded availableRoles.");

								// Map available roles to checkbox dedicated model
								$scope.availableRolesCheckboxModel = [];

								for (var i = 0; i < availableRoles.length; i++) {
									var currentRole = availableRoles[i];
									$scope.availableRolesCheckboxModel.push({"id":i,"name": currentRole.IDENTIFIANT.NOM , "group" : currentRole.GROUPE, "state" : false});
								}									

								// Expose availableRoles to scope for use by $scope.updateUserRoles create operation,
								// only once $scope.availableRolesCheckboxModel update is complete as $scope.availableRoles is checked 
								// against in $watch('elfin.Id') listener. (Fix #5)
								$scope.availableRoles = availableRoles;									
								
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

			        	/**
			        	 * Performs match of user roles against available roles to initialise check boxes state. 
			        	 */
			        	$scope.initWithUserRoles = function () {
			        		
			        		if ($scope.elfin) {
			        			$log.debug(">>>> HbUserCardController: initWithUserRoles - elfin AVAILABLE");
			        		} else {
			        			$log.debug(">>>> HbUserCardController: initWithUserRoles - DAMNED!!! elfin  NOT AVAILABLE");
			        		}
			        		
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
			        		
			        		// If role.state is true remove this role
			        		if (role.state) {
			        			$log.debug("      >>>>>>>>>>>> DELETE ROLE <<<<<<<<<<<<");
			        			var deletePosition = undefined;
			        			for (var i = 0; i < $scope.elfin['CARACTERISTIQUE']['FRACTION']['L'].length; i++) {
									var L = $scope.elfin['CARACTERISTIQUE']['FRACTION']['L'][i];
									var currRoleName = L.C[2].VALUE;
									if (role.name == currRoleName) {
										$log.debug("      >>>>>>>>>>>> DELETE ROLE at position "+i+" <<<<<<<<<<<<");
										// POS are 1 based not 0 based like array, thus +1
										deletePosition = i+1;
										break;
									}
								}
								// Preserves continuous POS values in addition to perform splicing.
			        			hbUtil.removeFractionLByPos($scope.elfin, deletePosition);
			        			
			        		} else { // If the role.state is false create this role
			        			$log.debug("      >>>>>>>>>>>> CREATE ROLE <<<<<<<<<<<<");
			        			// Search the available roles for the matching definition
			        			var roleDefinition = _.find($scope.availableRoles, function(roleDef){ return roleDef['IDENTIFIANT']['NOM'] == role.name; } );
			        			// Obtain the number of roles defined for the user
			        			var nbUserRole = $scope.elfin['CARACTERISTIQUE']['FRACTION']['L'].length;
			        			// Add the new role at the end of the list of existing user roles
			        			$scope.elfin['CARACTERISTIQUE']['FRACTION']['L'].push($scope.createRole(roleDefinition['ID_G'],roleDefinition['Id'],role.name, nbUserRole+1));
			        		}
			        	};			        	
			        	
			        	/**
			        	 * Empty role template
			        	 */
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

			            // Load available roles
			            $scope.getAvailableRoles();			        	

			        	// Perform user roles set/available initialisation once user and available roles are available.  
				    	$scope.$watch('elfin.Id', function() { 
				    		if ($scope.elfin!=null) {
				    			$log.debug(">>>>> USER ELFIN AVAILABLE:         $scope.elfin.Id = "+ $scope.elfin.Id +" <<<<<");
			            		// Only proceed with $scope.initWithUserRoles() if $scope.availableRoles have been loaded. (Fix #5)
				            	if ($scope.availableRoles) {
				            		$log.debug(">>>> HbUserCardController: PERFORM $scope.initWithUserRoles() (nb.available = ) "+ $scope.availableRoles.length +" in $watch('elfin.Id'), OK.");
				            		$scope.initWithUserRoles();	
				            	} else {
				            		$log.debug(">>>> HbUserCardController: DELAY   $scope.initWithUserRoles() $scope.availableRoles not yet available while in $watch('elfin.Id'), PENDING.");
				            	}				    			
				    		} else {
				    			$log.debug(">>>>> USER ELFIN NOT YET AVAILABLE: $scope.elfin.Id = null <<<<<");
				    		}
				    	});
			        				            
					} ]);
	

})();