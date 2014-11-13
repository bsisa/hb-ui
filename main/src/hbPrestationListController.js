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

								$scope.maxSize = 20;
								$scope.numPages = 0;	
								$scope.currentPage = 1;
								
								$scope.setPage = function (pageNo) {
									$scope.currentPage = pageNo;
								};								
								
								/**
								* Unlike v0.11.0 ui.bootstrap v0.10.0 does not bind currentPage using ng-model.
								* Thus we need to pass page parameter to pageChanged function. 
								*/
								$scope.pageChanged = function(page) {
									$log.debug('Page changed to: ' + page);
									$log.debug('Page before change: ' + $scope.currentPage);
									$scope.currentPage = page;
									$log.debug('Page after change:  ' + $scope.currentPage);
								};								
								
								var computePageNb = function(nbElements, maxSize) {
									var pagesModulo = nbElements % maxSize;
					    			var pagesQuotient = ( nbElements - pagesModulo ) / maxSize;
					    			var endPageOrNot = pagesModulo > 0 ? 1 : 0;
					    			var pageNb = pagesQuotient + endPageOrNot;
									$log.debug("pagesModulo          = " + pagesModulo);
									$log.debug("pagesQuotient        = " + pagesQuotient);
									$log.debug("endPageOrNot         = " + endPageOrNot);	
									$log.debug("pageNb               = " + pageNb);
									return pageNb;
								};								
								
						    	$scope.$watch('[search,predicate,reverse]', function(newSearch, oldSearch) {
						    		$log.debug(">>>>> search, predicate or reverse UPDATED <<<<< \n" + angular.toJson(newSearch) );
						    		if ($scope.elfins!=null) {
								    	$scope.filteredElfins = $filter('prestationListFilter')($scope.elfins, $scope.search);
										$scope.filteredElfins = $filter('orderBy')($scope.filteredElfins, $scope.predicate, $scope.reverse);
										$scope.numPages = computePageNb($scope.filteredElfins.length, $scope.maxSize);
						    		}
						    	}, true);								
								
								/**
								 * elfins can result from queries taking possibly seconds to tens of seconds to complete.
								 * This requires watching for elfins result availability before computing i.e. numPages. 
								 */
						    	$scope.$watch('elfins', function() { 
						    		if ($scope.elfins!=null) {
						    			$log.debug(">>>>> elfins LOADED <<<<<");
						    			
						    			$log.debug("Start filtering..." + new Date());
						    			
								    	$scope.filteredElfins = $filter('prestationListFilter')($scope.elfins, $scope.search);
										$scope.filteredElfins = $filter('orderBy')($scope.filteredElfins, $scope.predicate, $scope.reverse);						    			
						    			
										$log.debug("End filtering...  " + new Date());
										$log.debug("$scope.filteredElfins.length = " + $scope.filteredElfins.length);
										
										$scope.numPages = computePageNb($scope.filteredElfins.length, $scope.maxSize);
										
										$log.debug("$scope.elfins.length = " + $scope.elfins.length);
										$log.debug("$scope.elfinsCount   = " + $scope.elfinsCount);

										$log.debug("$scope.numPages      = " + $scope.numPages);
						    		} else {
						    			$log.debug(">>>>> elfins NOT YET LOADED <<<<<");
						    		}
						    	});			
								
//								function ctrlRead($scope, $filter) {
//								    // init
//								    $scope.sortingOrder = sortingOrder;
//								    $scope.reverse = false;
//								    $scope.filteredItems = [];
//								    $scope.groupedItems = [];
//								    $scope.itemsPerPage = 5;
//								    $scope.pagedItems = [];
//								    $scope.currentPage = 0;
//								    $scope.items = [
//								        {"id":"1","name":"name 1","description":"description 1","field3":"field3 1","field4":"field4 1","field5 ":"field5 1"}, 
//								        {"id":"2","name":"name 2","description":"description 1","field3":"field3 2","field4":"field4 2","field5 ":"field5 2"}, 
//								        {"id":"3","name":"name 3","description":"description 1","field3":"field3 3","field4":"field4 3","field5 ":"field5 3"}, 
//								        {"id":"4","name":"name 4","description":"description 1","field3":"field3 4","field4":"field4 4","field5 ":"field5 4"}, 
//								        {"id":"5","name":"name 5","description":"description 1","field3":"field3 5","field4":"field4 5","field5 ":"field5 5"}, 
//								        {"id":"6","name":"name 6","description":"description 1","field3":"field3 6","field4":"field4 6","field5 ":"field5 6"}, 
//								        {"id":"7","name":"name 7","description":"description 1","field3":"field3 7","field4":"field4 7","field5 ":"field5 7"}, 
//								        {"id":"8","name":"name 8","description":"description 1","field3":"field3 8","field4":"field4 8","field5 ":"field5 8"}, 
//								        {"id":"9","name":"name 9","description":"description 1","field3":"field3 9","field4":"field4 9","field5 ":"field5 9"}, 
//								        {"id":"10","name":"name 10","description":"description 1","field3":"field3 10","field4":"field4 10","field5 ":"field5 10"}, 
//								        {"id":"11","name":"name 11","description":"description 1","field3":"field3 11","field4":"field4 11","field5 ":"field5 11"}, 
//								        {"id":"12","name":"name 12","description":"description 1","field3":"field3 12","field4":"field4 12","field5 ":"field5 12"}, 
//								        {"id":"13","name":"name 13","description":"description 1","field3":"field3 13","field4":"field4 13","field5 ":"field5 13"}, 
//								        {"id":"14","name":"name 14","description":"description 1","field3":"field3 14","field4":"field4 14","field5 ":"field5 14"}, 
//								        {"id":"15","name":"name 15","description":"description 1","field3":"field3 15","field4":"field4 15","field5 ":"field5 15"}, 
//								        {"id":"16","name":"name 16","description":"description 1","field3":"field3 16","field4":"field4 16","field5 ":"field5 16"}, 
//								        {"id":"17","name":"name 17","description":"description 1","field3":"field3 17","field4":"field4 17","field5 ":"field5 17"}, 
//								        {"id":"18","name":"name 18","description":"description 1","field3":"field3 18","field4":"field4 18","field5 ":"field5 18"}, 
//								        {"id":"19","name":"name 19","description":"description 1","field3":"field3 19","field4":"field4 19","field5 ":"field5 19"}, 
//								        {"id":"20","name":"name 20","description":"description 1","field3":"field3 20","field4":"field4 20","field5 ":"field5 20"}
//								    ];
//
//								    var searchMatch = function (haystack, needle) {
//								        if (!needle) {
//								            return true;
//								        }
//								        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
//								    };
//
//								    // init the filtered items
//								    $scope.search = function () {
//								        $scope.filteredItems = $filter('filter')($scope.items, function (item) {
//								            for(var attr in item) {
//								                if (searchMatch(item[attr], $scope.query))
//								                    return true;
//								            }
//								            return false;
//								        });
//								        // take care of the sorting order
//								        if ($scope.sortingOrder !== '') {
//								            $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortingOrder, $scope.reverse);
//								        }
//								        $scope.currentPage = 0;
//								        // now group by pages
//								        $scope.groupToPages();
//								    };
//								    
//								    // calculate page in place
//								    $scope.groupToPages = function () {
//								        $scope.pagedItems = [];
//								        
//								        for (var i = 0; i < $scope.filteredItems.length; i++) {
//								            if (i % $scope.itemsPerPage === 0) {
//								                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
//								            } else {
//								                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
//								            }
//								        }
//								    };
//								    
//								    $scope.range = function (start, end) {
//								        var ret = [];
//								        if (!end) {
//								            end = start;
//								            start = 0;
//								        }
//								        for (var i = start; i < end; i++) {
//								            ret.push(i);
//								        }
//								        return ret;
//								    };
//								    
//								    $scope.prevPage = function () {
//								        if ($scope.currentPage > 0) {
//								            $scope.currentPage--;
//								        }
//								    };
//								    
//								    $scope.nextPage = function () {
//								        if ($scope.currentPage < $scope.pagedItems.length - 1) {
//								            $scope.currentPage++;
//								        }
//								    };
//								    
//								    $scope.setPage = function () {
//								        $scope.currentPage = this.n;
//								    };
//
//								    // functions have been describe process the data for display
//								    $scope.search();
//
//								    // change sorting order
//								    $scope.sort_by = function(newSortingOrder) {
//								        if ($scope.sortingOrder == newSortingOrder)
//								            $scope.reverse = !$scope.reverse;
//
//								        $scope.sortingOrder = newSortingOrder;
//
//								        // icon setup
//								        $('th i').each(function(){
//								            // icon reset
//								            $(this).removeClass().addClass('icon-sort');
//								        });
//								        if ($scope.reverse)
//								            $('th.'+new_sorting_order+' i').removeClass().addClass('icon-chevron-up');
//								        else
//								            $('th.'+new_sorting_order+' i').removeClass().addClass('icon-chevron-down');
//								    };
//								};
//								ctrlRead.$inject = ['$scope', '$filter'];

								
								// ============================================================================================
								// ============================================================================================								
								
								
								
								
								

							} ]);

})();
