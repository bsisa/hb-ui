(function() {

	
	angular.module('hb5').controller(
			'HbChooseOneController',
			[
					'$scope',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'hbAlertMessages',
					'hbUtil',
					function($scope, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil) {

						//$log.debug("    >>>> Using HbChooseOneController");	
	
	
						/**
				         * Modal panel to update a target elfin property 
				         * with a source elfin property whose elfin has 
				         * been selected from a list of elfins.
				         */
				        $scope.hbChooseOne = function (targetElfin, targetPath, elfins, sourcePath, columnsDefinition, template) {
				        	
				        	$log.debug(">>>> ON CHOOSE :: targetElfin = : " + targetElfin.Id);
				        	
				            var modalInstance = $modal.open({
				                templateUrl: template,
				                scope: $scope,
				                controller: 'HbChooseOneModalController',
				                resolve: {
				                	elfins: function () {
				                    	return elfins;
				                    },
				                    columnsDefinition: function() {
				                    	return columnsDefinition;
				                    },
				                    sourcePath: function() {
				                    	return sourcePath;
				                    }
				                },                
				                backdrop: 'static'
				            });
				
				            /**
				             * Process modalInstance.close action
				             */
				            modalInstance.result.then(function (selectedElfins) {
				            	if (selectedElfins && selectedElfins.length > 0) {
				            		var sourceElfin = selectedElfins[0];
				            		hbUtil.applyPaths(targetElfin, targetPath, sourceElfin, sourcePath);
				            		$scope.elfinForm.$setDirty();
				            	} else {
				            		$log.debug("No selection returned!!!");				            		
				            	}
				            	
				            }, function () {
				                $log.debug('Choose params modal dismissed at: ' + new Date());
				            });
				        };

					} ]);
	


	angular
		.module('hb5')
		.controller(
				'HbChooseOneModalController',
				[
						'$scope',
						'$modalInstance',
						'$filter',
						'$log',
						'$timeout',
						'hbUtil',
						'elfins',
						'columnsDefinition',
						'sourcePath',
						function($scope, $modalInstance, $filter, $log,
								$timeout, hbUtil, elfins,
								columnsDefinition, sourcePath) {
							
							// ============================================================
							// Custom search field used to filter elfins
							// ============================================================    	
							$scope.search = { text: ""};
							
							$scope.$watch('search.text', function() { 
								$scope.elfins = $filter('filter')(elfins, $scope.search.text , false);								
							}, true);
							// ============================================================
							
							// sortFields automatically build from columnsDefinition
							//$scope.sortFields = _.pluck(columnsDefinition, 'field');
							// In ui-grid 3 (formerly ng-grid) sort information must be 
							// defined in columnDefs if needed as: 
							/*
							columnDefs: [
							             {
							               field: 'firstFieldName',
							               sort: {
							                 direction: uiGridConstants.ASC,
							                 priority: 2
							               }
							             },
							             {
							               field: 'secondFieldName',
							               sort: {
							                 direction: uiGridConstants.DESC,
							                 priority: 1
							               }
							             }							             
							*/
							// Remarks: 
							// 1) It requires 'uiGridConstants' injection
							// 2) Priorities are used lower first
							// 
							
							// ============================================================
							// Manage user selection
							// ============================================================
							
							// Contains the result of user selection. 
							// While gridOptions multiSelect attribute equals false 
							// the array will only be zero or one element. 
							$scope.selectedElfins = [];
							
							// Used to display current selection value
							$scope.currentSelection = null;
							
							// Listener maintaining currentSelection value 
							$scope.$watchCollection('selectedElfins', function(newSelectedElfins , oldSelectedElfins) {
								// Reset current selection if no elfin selected
								if (!newSelectedElfins || newSelectedElfins.length === 0) {
									$scope.currentSelection = null;
								} else if (newSelectedElfins && newSelectedElfins.length > 0) {
									// Obtain configured sourcePath value on selected elfin dynamically
									$scope.currentSelection = hbUtil.getValueAtPath($scope.selectedElfins[0],sourcePath);
								}
							}, true);
							
							
							var selectionConfirmed = function() {
								$modalInstance.close($scope.selectedElfins);
							};
							
							
							// ui-grid options. See ui-grid API Documentation for details.
							$scope.gridOptions = {
							        data: 'elfins',
							        columnDefs: columnsDefinition,
							        multiSelect: false,	
							        enableFullRowSelection: true,
							        modifierKeysToMultiSelect: false,					        
								    onRegisterApi: function (gridApi) {
								        //set gridApi on scope
								        $scope.gridApi = gridApi;
								        gridApi.selection.on.rowSelectionChanged($scope,function(row){
								          $scope.selectedElfins = gridApi.selection.getSelectedRows();
								        });
								    }								    
							    };    								
							
							$scope.ok = function () {
								selectionConfirmed();
							};
							$scope.cancel = function () {
							    $modalInstance.dismiss('cancel');
							};
							
							var focusOnSearchField = function() {
								$('#searchTextInput').focus();	
							};        
							
							// TODO: FocusTimeout issue. Find a better solution ? 
							$timeout(focusOnSearchField, 250, false);

						}]);	
        
})();
