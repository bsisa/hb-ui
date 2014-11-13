(function() {

	angular
			.module('hb5')
			.controller(
					'HbPrestationListController',
					[
							'$attrs',
							'$scope',
							'GeoxmlService',
							'$routeParams',
							'$log',
							'$filter',
							'hbAlertMessages',
							'hbUtil',
							function($attrs, $scope, GeoxmlService,
									$routeParams, $log, $filter, hbAlertMessages, hbUtil) {

								$log.debug("    >>>> HbPrestationListController called...");

								// Default order is by "Building management"
								$scope.predicate = 'IDENTIFIANT.OBJECTIF';
								$scope.reverse = false;

								// Object holding user entered search (filter)
								// criteria
								$scope.search = {
									"group" : "",
									"origin" : "",
									"account" : "",
									"goal" : "",
									"from" : "2015",
									"replacementValue" : "",
									"manager" : "",
									"owner" : "",
									"remark" : ""
								};
								
								/**
								 * Proceeds to elfin update to hb-api.
								 */
								$scope.save = function(elfin) {
									elfin.put().then( 
					               			function() { 
					               				//$log.debug("Elfin: " + elfin.ID_G + "/" + elfin.Id + " saved.");
					               			}, 
					               			function(response) { 
					               				//$log.debug("Error Elfin: " + elfin.ID_G + "/" + elfin.Id + " could not be saved.", response.status);
					               				var message = "La mise à jour a échoué (statut de retour: "+ response.status+ ")";
					        					hbAlertMessages.addAlert("danger",message);
					               			} 
					               		);        											
								};
								
								// ============================================================================================
								//     Pagination
								// ============================================================================================

								$scope.maxItemsPerPage = 20;
								//$scope.numPages = 0;	
								$scope.currentPage = 1;
								
								$scope.setPage = function (pageNo) {
									$scope.currentPage = pageNo;
								};								

								/**
								 * Extract current page data for modified page index
								 */
								var updateCurrentFilteredElfinPage = function(maxItemsPerPage_p, filteredElfins_p) {
									var pageStartIndex = ($scope.currentPage - 1) * maxItemsPerPage_p;
									var pageStopIndex =  ( Math.min( pageStartIndex + maxItemsPerPage_p, filteredElfins_p.length) + 1);
									$log.debug("pageStartIndex :: pageStopIndex = " + pageStartIndex + "::" + pageStopIndex);
									var currentFilteredElfinPageResult = filteredElfins_p.slice( pageStartIndex , pageStopIndex);
									return currentFilteredElfinPageResult;
								};
								
								/**
								 * Proceed to elfin_p collection `prestationListFilter` filtering and sorting
								 */
								var filterSortElfins = function(elfins_p, search_p, predicate_p, reverse_p) {
									// Apply prestationListFilter
							    	var filteredSortedElfins = $filter('prestationListFilter')(elfins_p, search_p);
							    	// Apply predicate, reverse sorting
							    	filteredSortedElfins = $filter('orderBy')(filteredSortedElfins, predicate_p, reverse_p);
							    	return filteredSortedElfins;
								};
								
								/**
								* Unlike v0.11.0 ui.bootstrap v0.10.0 does not bind currentPage using ng-model.
								* Thus we need to pass page parameter to pageChanged function. 
								*/
								$scope.pageChanged = function(page) {
									$log.debug("pageChanged from " + $scope.currentPage + " to " + page);
									$scope.currentPage = page;
									$scope.currentFilteredElfinPage = updateCurrentFilteredElfinPage($scope.maxItemsPerPage, $scope.filteredElfins);
								};								
								
								/**
								 * Update filtered collection and associated number of pages when search
								 * or sorting criteria are modified. 
								 */
						    	$scope.$watch('[search,predicate,reverse]', function(newSearch, oldSearch) {
						    		$log.debug(">>>>> search, predicate or reverse UPDATED <<<<< \n" + angular.toJson(newSearch) );
						    		if ($scope.elfins!=null) {
										$scope.filteredElfins = filterSortElfins($scope.elfins, $scope.search, $scope.predicate, $scope.reverse);

										// On search, sort change of filtered collection reset current page to first page
										$scope.currentPage = 1;
										$scope.currentFilteredElfinPage = updateCurrentFilteredElfinPage($scope.maxItemsPerPage, $scope.filteredElfins);
						    		}
						    	}, true);								
								
								/**
								 * elfins can result from queries taking possibly seconds to tens of seconds to complete.
								 * This requires watching for elfins result availability before computing i.e. numPages. 
								 */
						    	$scope.$watch('elfins', function() { 
						    		if ($scope.elfins!=null) {
										$scope.filteredElfins = filterSortElfins($scope.elfins, $scope.search, $scope.predicate, $scope.reverse);										
										
										// On search, sort change of filtered collection reset current page to first page
										$scope.currentPage = 1;
										$scope.currentFilteredElfinPage = updateCurrentFilteredElfinPage($scope.maxItemsPerPage, $scope.filteredElfins);										
						    		} else {
						    			$log.debug(">>>>> elfins NOT YET LOADED <<<<<");
						    		}
						    	});			
								
								// ============================================================================================
								// ============================================================================================								

							} ]);

})();
