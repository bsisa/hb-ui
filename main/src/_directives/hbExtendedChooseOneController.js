(function () {


    angular
        .module('hb5')
        .controller(
            'HbExtendedChooseOneModalController',
            [
                '$scope',
                '$uibModalInstance',
                '$filter',
                '$log',
                '$timeout',
                'hbUtil',
                'elfins',
                'secondElfinList',
                'columnsDefinition',
                'sourcePath',
                function ($scope, $uibModalInstance, $filter, $log,
                          $timeout, hbUtil, elfins, secondElfinList,
                          columnsDefinition, sourcePath) {

                    $scope.elfins = elfins;
                    $scope.secondElfinList = secondElfinList;

                        // ============================================================
                    // Custom search field used to filter elfins
                    // ============================================================
                    // End user search field
                    $scope.search = {text: ""};

                    // Filter search criterion restraining search to property named: columnsDefinition[i].field
                    $scope.dynSearchObj = {};

                    // Create properties defined in columns definition for dynamic search object, supporting
                    // multilevels nested properties.
                    for (var i = 0; i < columnsDefinition.length; i++) {
                        var colDefFieldPath = columnsDefinition[i].field;
                        hbUtil.initPath($scope.dynSearchObj, colDefFieldPath, "");
                    }

                    // Custom filter predicate function
                    var matchAny = function (actual, index, array) {
                        var expected = $scope.dynSearchObj;

                        for (var i = 0; i < columnsDefinition.length; i++) {
                            var colDefFieldPath = columnsDefinition[i].field;
                            var actualValue = hbUtil.getValueAtPath(actual, colDefFieldPath);
                            var expectedValue = hbUtil.getValueAtPath(expected, colDefFieldPath);
                            if (hbUtil.icontains(actualValue, expectedValue)) {
                                return true;
                            }
                        }

                        return false;
                    };

                    $scope.$watch('search.text', function () {

                        //
                        // Update dynamic search object
                        //
                        // Warning: Information at columnsDefinition[x].field can be nested
                        // multilevel property such as: 'IDENTIFIANT.OBJECTIF'
                        for (var i = 0; i < columnsDefinition.length; i++) {
                            var colDefFieldPath = columnsDefinition[i].field;
                            hbUtil.applyPath($scope.dynSearchObj, colDefFieldPath, $scope.search.text);
                        }

                        // Use custom predicate function `matchAny` to achieve `OR` search on
                        // defined properties only.
                        $scope.elfins = $filter('filter')(elfins, matchAny);
                        $scope.secondElfinList = $filter('filter')(secondElfinList, matchAny);
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
                    $scope.$watchCollection('selectedElfins', function (newSelectedElfins, oldSelectedElfins) {
                        // Reset current selection if no elfin selected
                        if (!newSelectedElfins || newSelectedElfins.length === 0) {
                            $scope.currentSelection = null;
                        } else if (newSelectedElfins && newSelectedElfins.length > 0) {
                            // Obtain configured sourcePath value on selected elfin dynamically
                            $scope.currentSelection = hbUtil.getValueAtPath($scope.selectedElfins[0], sourcePath);
                        }
                    }, true);


                    var selectionConfirmed = function () {
                        $uibModalInstance.close($scope.selectedElfins);
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
                            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                                $scope.selectedElfins = gridApi.selection.getSelectedRows();
                            });
                        }
                    };

                    if (angular.isArray(secondElfinList) && secondElfinList.length !== 0) {
                        $scope.secondGridOptions = {
                            data: 'secondElfinList',
                            columnDefs: columnsDefinition,
                            multiSelect: false,
                            enableFullRowSelection: true,
                            modifierKeysToMultiSelect: false,
                            onRegisterApi: function (gridApi) {
                                //set gridApi on scope
                                $scope.secondGridApi = gridApi;
                                $scope.secondGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                                    $scope.selectedElfins = $scope.secondGridApi.selection.getSelectedRows();
                                });
                            }
                        };
                    }

                    $scope.ok = function () {
                        selectionConfirmed();
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                    var focusOnSearchField = function () {
                        $('#searchTextInput').focus();
                    };

                    // TODO: FocusTimeout issue. Find a better solution ?
                    $timeout(focusOnSearchField, 250, false);

                }]);

})();
