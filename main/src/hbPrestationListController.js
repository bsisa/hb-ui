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
								* Unlike v0.11.0 ui.bootstrap v0.10.0 does not bind currentPage using ng-model.
								* Thus we need to pass page parameter to pageChanged function. 
								*/
								$scope.pageChanged = function(page) {
									$log.debug("pageChanged from " + $scope.currentPage + " to " + page);
									$scope.currentPage = page;
									
									// Compute current page data for modified page index
									var pageStartIndex = ($scope.currentPage - 1) * $scope.maxItemsPerPage;
									var pageStopIndex =  ( Math.min( pageStartIndex + $scope.maxItemsPerPage, $scope.filteredElfins.length) + 1);
									$log.debug("pageStartIndex :: pageStopIndex = " + pageStartIndex + "::" + pageStopIndex);
									$scope.currentFilteredElfinPage = $scope.filteredElfins.slice( pageStartIndex , pageStopIndex);									
									
								};								
								
								/**
								 * Computes the total number of pages for a given number of elements 
								 * and maximum number of elements per page.
								 */
//								var computePageNb = function(nbElements, maxItemsPerPage) {
//									var pagesModulo = nbElements % maxItemsPerPage;
//					    			var pagesQuotient = ( nbElements - pagesModulo ) / maxItemsPerPage;
//					    			var endPageOrNot = pagesModulo > 0 ? 1 : 0;
//					    			var pageNb = pagesQuotient + endPageOrNot;
//									return pageNb;
//								};								
								
								/**
								 * Update filtered collection and associated number of pages when search
								 * or sorting criteria are modified. 
								 */
						    	$scope.$watch('[search,predicate,reverse]', function(newSearch, oldSearch) {
						    		$log.debug(">>>>> search, predicate or reverse UPDATED <<<<< \n" + angular.toJson(newSearch) );
						    		if ($scope.elfins!=null) {
								    	$scope.filteredElfins = $filter('prestationListFilter')($scope.elfins, $scope.search);
										$scope.filteredElfins = $filter('orderBy')($scope.filteredElfins, $scope.predicate, $scope.reverse);
//										$scope.numPages = computePageNb($scope.filteredElfins.length, $scope.maxItemsPerPage);

										// On search, sort change of filtered collection reset current page to first page
										$scope.currentPage = 1;
										
										// Compute current page data for modified collection
										var pageStartIndex = ($scope.currentPage - 1) * $scope.maxItemsPerPage;
										var pageStopIndex =  ( Math.min( pageStartIndex + $scope.maxItemsPerPage, $scope.filteredElfins.length) + 1);
										$log.debug("pageStartIndex :: pageStopIndex = " + pageStartIndex + "::" + pageStopIndex);
										$scope.currentFilteredElfinPage = $scope.filteredElfins.slice( pageStartIndex , pageStopIndex); 
						    		}
						    	}, true);								
								
								/**
								 * elfins can result from queries taking possibly seconds to tens of seconds to complete.
								 * This requires watching for elfins result availability before computing i.e. numPages. 
								 */
						    	$scope.$watch('elfins', function() { 
						    		if ($scope.elfins!=null) {
								    	$scope.filteredElfins = $filter('prestationListFilter')($scope.elfins, $scope.search);
										$scope.filteredElfins = $filter('orderBy')($scope.filteredElfins, $scope.predicate, $scope.reverse);						    			
//										$scope.numPages = computePageNb($scope.filteredElfins.length, $scope.maxItemsPerPage);
										
										// On search, sort change of filtered collection reset current page to first page
										$scope.currentPage = 1;
										
										// Compute current page data for modified collection
										var pageStartIndex = ($scope.currentPage - 1) * $scope.maxItemsPerPage;
										var pageStopIndex =  ( Math.min( pageStartIndex + $scope.maxItemsPerPage, $scope.filteredElfins.length) + 1);
										$log.debug("pageStartIndex :: pageStopIndex = " + pageStartIndex + "::" + pageStopIndex);
										$scope.currentFilteredElfinPage = $scope.filteredElfins.slice( pageStartIndex , pageStopIndex);										
						    		} else {
						    			$log.debug(">>>>> elfins NOT YET LOADED <<<<<");
						    		}
						    	});			
								
								// ============================================================================================
								// ============================================================================================								

							} ]);

})();
