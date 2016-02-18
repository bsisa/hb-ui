(function() {

	    angular
			.module('hb5')
			.controller(
					'HbAnnexesComponentController',
					[
							'$attrs',
							'$scope',
							'$log',
							'$modal',
							'hbUtil',
							'hbAlertMessages', 
							function($attrs, $scope, $log, $modal, hbUtil, hbAlertMessages) {
    
									//$log.debug("    >>>> Using HbAnnexesComponentController");
							        
						        	// Set a default to 0 before computation.
						        	$scope.annexesNoPhotoNb = 0;
						        	
									$scope.annexes = [];

									$scope.isMergeFeatureOn = ($attrs.hbAnnexesMerge === 'true');									
									
									// By default validate. Special case where successful validation
									// requires upload to be performed need to prevent this default
									// to set free from a dead lock situation.
									$scope.isRequired = ($attrs.hbAnnexesUploadNoValidation === 'true');
									
									// Parameter used to make at least one annex mandatory.
						        	$scope.minBound = $scope.isRequired ? 1 : 0;									
									
						        	// Pass $attrs.hbAnnexesUploadNoValidation value to scope to pass it to hb-annexes-upload in turn...
									if ($attrs.hbAnnexesUploadNoValidation === 'true') {
										$scope.hbAnnexesUploadNoValidation = $attrs.hbAnnexesUploadNoValidation;
									}
									
									$scope.hbUtil = hbUtil;
									
							    	$scope.$watchCollection('elfin.ANNEXE.RENVOI', function(newRenvois, oldRenvois) {
							    		//$log.debug(">>>> elfin.ANNEXE.RENVOI: newRenvois = " + newRenvois + ", oldRenvois = " + oldRenvois);
										// We want at least one annex mandatory, except photo, although it should not apply to CONSTAT.
							    		$scope.annexesWithoutPhoto = hbUtil.getAnnexesExcludingTag($scope.elfin, 'photo');
							    		// Preserve default 0 value if no annexesWithoutPhoto exists.
							    		if ($scope.annexesWithoutPhoto && $scope.annexesWithoutPhoto.length > 0) {
											// Property bound to elfinForm to make at least one annex mandatory.
							    			$scope.annexesNoPhotoNb = $scope.annexesWithoutPhoto.length;
							    		}
							        });	
							    	
							    	/**
							    	 * Returns a new trimmed string with leading and trailing commas removed. 
							    	 */
							    	var cleanUpCommas = function(stringToCleanUp) {
							    		// Trim
							    		var cleanedUpString = stringToCleanUp.trim()
							    		// Check for leading ','
							    		var STR_TO_CLEAN = ",";
							    		// Found leading clean up to perform
							    		if (cleanedUpString.indexOf(STR_TO_CLEAN) === 0) {
							    			cleanedUpString = cleanedUpString.substring( 0 + STR_TO_CLEAN.length)
							    		}
							    		if ( cleanedUpString.endsWith(STR_TO_CLEAN) ) {
							    			cleanedUpString = cleanedUpString.substring(0, cleanedUpString.length - STR_TO_CLEAN.length)
							    		}
							    		return cleanedUpString;
							    	};

							    	var MERGE_ACTION_TAG_PART = "action::merge";
							    	var MERGE_BEFORE_TAG = "action::merge::before";
						    		var MERGE_AFTER_TAG = "action::merge::after";
						    		
						    		/**
						    		 * Return true if `string` contains `searchedString`
						    		 */
						    		var contains = function(stringParam, searchedString) {
						    			if (stringParam.length < searchedString.length) {
						    				return false;
						    			} else {
						    				return (stringParam.indexOf(searchedString) != -1)
						    			}						    				
						    		};
						    		
						    		/**
						    		 * Removes `tag` from `stringParam` returning a new string
						    		 * leaving stringParam unmodified.
						    		 */
						    		var remove = function(stringParam, tag) {
						    			var newString = _.clone(stringParam);
						    			if ( contains(newString, tag) ) {
								    		newString = newString.replace(tag, '');
								    		newString = cleanUpCommas(newString);
								    		return newString;
						    			} else {
						    				return newString;
						    			}
						    		};
						    		
						    		/**
						    		 * Moves `targetArray` element at `fromIndex` position to `toIndex` position.
						    		 * Check closely inspired by: http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another#5306832
						    		 * for more on this.
						    		 */
						    		var moveArrayItemFromTo = function (targetArray, fromIndex, toIndex) {
						    		    if (toIndex >= targetArray.length) {
						    		        var k = toIndex - targetArray.length;
						    		        while ((k--) + 1) {
						    		        	targetArray.push(undefined);
						    		        }
						    		    }
						    		    targetArray.splice(toIndex, 0, targetArray.splice(fromIndex, 1)[0]);
						    		};						    		
						    		
						    		
							    	$scope.isMerged = function(renvoi) {
							    		return (contains(renvoi.VALUE, MERGE_ACTION_TAG_PART));
							    	};
							    	
							    	$scope.isMergedBefore = function(renvoi) {
							    		return (contains(renvoi.VALUE, MERGE_BEFORE_TAG));
							    	};
							    	
							    	$scope.isMergedAfter = function(renvoi) {
							    		return (contains(renvoi.VALUE, MERGE_AFTER_TAG));
							    	};							    	

							    	/**
							    	 * Set or unset renvoi for report merge action. 
							    	 */
							    	$scope.merge = function(renvoi) {
							    		if ( contains(renvoi.VALUE, MERGE_ACTION_TAG_PART) ) {
							    			renvoi.VALUE = renvoi.VALUE.replace(MERGE_AFTER_TAG, '');
							    			renvoi.VALUE = cleanUpCommas(renvoi.VALUE);
							    			renvoi.VALUE = renvoi.VALUE.replace(MERGE_BEFORE_TAG, '');
							    			renvoi.VALUE = cleanUpCommas(renvoi.VALUE);
							    		} else {
							    			renvoi.VALUE = renvoi.VALUE + "," + MERGE_BEFORE_TAG;
							    			renvoi.VALUE = cleanUpCommas(renvoi.VALUE);
							    		}
							    		// Auto-save
							    		$scope.saveElfin($scope.elfin);
							    	};							    	
							    	
						    		/**
						    		 * Switch back and forth from merge before to merge after actions
						    		 * updating `RENVOI.LIEN.VALUE` by reference.
						    		 * If neither actions exists it does nothing.
						    		 */
						    		$scope.mergeBeforeAfter = function(renvoi) {
						    			if (angular.isDefined(renvoi)) {
							    			if ( contains(renvoi.VALUE, MERGE_BEFORE_TAG) ) {
							    				renvoi.VALUE = remove(renvoi.VALUE, MERGE_BEFORE_TAG)
							    				renvoi.VALUE = renvoi.VALUE + "," + MERGE_AFTER_TAG;
									    		// Auto-save
									    		$scope.saveElfin($scope.elfin);
							    			} else if ( contains(renvoi.VALUE, MERGE_AFTER_TAG) ) {
							    				renvoi.VALUE = remove(renvoi.VALUE, MERGE_AFTER_TAG)
							    				renvoi.VALUE = renvoi.VALUE + "," + MERGE_BEFORE_TAG;
									    		// Auto-save
									    		$scope.saveElfin($scope.elfin);
							    			}
						    			}
						    		};

					    			var MOVE_UP = -1;
					    			var MOVE_DOWN = +1;
						    		
						    		/**
						    		 * moveDirection is expected to be -1 (up) or +1 (down)
						    		 */
						    		var moveRenvoi = function(renvoi, move) {

						    			if (move === MOVE_UP || move === MOVE_DOWN ) {
							    			var arrayIdx = -1;
							    			for (var i = 0; i < $scope.elfin.ANNEXE.RENVOI.length; i++) {
												var currRenvoi = $scope.elfin.ANNEXE.RENVOI[i];
												if (currRenvoi.POS === renvoi.POS) {
													arrayIdx = i;
													break;
												}
											}
							    			// Reorder array only if selected element is not out of bound with new pos. 
							    			if ( 
							    					!(arrayIdx === 0 && move === MOVE_UP) && 
							    					!(arrayIdx === $scope.elfin.ANNEXE.RENVOI.length - 1 && move === MOVE_DOWN ) ) {
							    				
								    			moveArrayItemFromTo($scope.elfin.ANNEXE.RENVOI, arrayIdx, arrayIdx + move);
								    			hbUtil.renumberPos($scope.elfin.ANNEXE.RENVOI);
									    		// Auto-save
									    		$scope.saveElfin($scope.elfin);
							    			}
						    			};
						    		};
						    		
						    		/**
						    		 * Move RENVOI element up both dealing with array and XML POS positions.
						    		 */
						    		$scope.moveUp = function(renvoi) {
						    			moveRenvoi(renvoi, MOVE_UP);
						    		};
						    		
						    		/**
						    		 * Move RENVOI element down both dealing with array and XML POS positions.
						    		 */
						    		$scope.moveDown = function(renvoi) {
						    			moveRenvoi(renvoi, MOVE_DOWN);
						    		};							    		
							    	
							    	/**
							    	 * Delete the corresponding RENVOI node from ELFIN.
							    	 * Note: delete is a reserved Javascript keyword. Do not name function `delete`
							    	 */
							    	$scope.deleteRenvoi = function(renvoi) {
							    		$log.debug("Perform RENVOI deletion.");
							    		
							        	var modalInstance = $modal.open({
							                templateUrl: '/assets/views/deleteAnnexeConfirmModalPanel.html',
							                controller: 'DeleteConfirmController',
							                scope: $scope,
							                backdrop: 'static'
							            });

							            modalInstance.result.then(function () {
							            	// Update elfin model
							            	hbUtil.removeAnnexeRenvoiByPos($scope.elfin, renvoi.POS);
								            // Automatically save elfin to server (we already ask for user confirmation). 
							            	$scope.saveElfin($scope.elfin);
							            }, function () {
							            	// Do not annoy end-user with more messages.
							            	//var message = "Suppression de l'annexe " + hbUtil.getLinkFileName(renvoi.LIEN) + " annulée.";
							   				//hbAlertMessages.addAlert("warning",message);
							            });        								    		

							    	};
							    	
									        
							    } ]);

})();
