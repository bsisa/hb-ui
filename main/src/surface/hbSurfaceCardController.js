(function() {

    angular.module('hb5').controller(
        'HbSurfaceCardController',
        [
            '$scope',
            '$attrs',
            'GeoxmlService',
            '$modal',
            '$routeParams',
            '$location',
            '$log',
            '$timeout',
            'hbAlertMessages',
            'hbUtil',
            'hbQueryService',
            'hbTabCacheService',
            'userDetails',
            'HB_COLLECTIONS',
            'HB_ROLE_FONCTION',
            'HB_ORDER_TYPE',
            function($scope, $attrs, GeoxmlService, $modal,
                     $routeParams, $location, $log, $timeout,
                     hbAlertMessages, hbUtil, hbQueryService, hbTabCacheService, userDetails, HB_COLLECTIONS, HB_ROLE_FONCTION, HB_ORDER_TYPE) {

                //$log.debug("    >>>> Using HbSurfaceCardController");

                // ================= Tab state management - start =============
                /**
                 * Check parent controller and hbTabStateService for complete overview.
                 */
                var cachedTab = hbTabCacheService.getTabState($location.absUrl());

                // Expose order type constants to scope
                $scope.HB_ORDER_TYPE = HB_ORDER_TYPE;

                $scope.commandPredicate = 'IDENTIFIANT.DE';
                $scope.commandReverse = true;


                /** Create tabState object if not already available in cache,
                 */
                if (cachedTab === undefined) {
                    $scope.tabState = {
                        "surface" : { "active" : true },
                        "commande" : { "active" : false },
                        "commande_subtab_ouvertes" : { "active" : false },
                        "commande_subtab_closes" : { "active" : false },
                        "commande_subtab_toutes" : { "active" : false },
                        "annexe" : { "active" : false }
                    };
                } else {
                    $scope.tabState = cachedTab;
                }
                /**
                 * Link to $parent scope tabState reference.
                 */
                $scope.$parent.tabState = $scope.tabState;
                // ================= Tab state management - end ===============



                $scope.getMomentDateFromHbTextDateFormat = hbUtil.getMomentDateFromHbTextDateFormat;
                $scope.canManageOrders = _.contains(userDetails.getRoles(), HB_ROLE_FONCTION.ORDERS_STATISTICS);


                $scope.canArchive = function() {
                    // If the form is not pristine we could have a valid archiveMoment which is not
                    // persisted to database letting us move on to archiveLocationUnit process.
                    if ($scope.elfin && $attrs["hbMode"] !== "create" && $scope.elfinForm.$pristine) {
                        var currentMoment = moment();
                        var archiveMoment = hbUtil.getMomentDateFromHbTextDateFormat($scope.elfin.IDENTIFIANT.A);
                        return ( archiveMoment.isAfter(currentMoment) || archiveMoment.isSame(currentMoment, 'day') );

                    } else {
                        return false;
                    }
                };


                $scope.archiveLocationUnit = function() {
                    if ($scope.canArchive) {
                        // Save current archived LOCATION UNIT
                        $scope.saveElfin($scope.elfin);
                        // Create new LOCATION_UNIT FROM current one
                        var searchObj = {Id: $scope.elfin.Id, ID_G: $scope.elfin.ID_G};
                        $location.search(searchObj).path( "/elfin/create/SURFACE" );
                    }
                };


                $scope.createNewCommande = function() {
                    if ($attrs["hbMode"] !== "create") {
                        // Added id,classe,idg for generic link to creation source/parent prototype.
                        var searchObj = {
                            id: $scope.elfin.Id,
                            classe: $scope.elfin.CLASSE,
                            idg: $scope.elfin.ID_G };
                        $location.search(searchObj).path( "/elfin/create/COMMANDE" );
                    }
                };

                /**
                 * Helper function to link and if necessary create CAR elements by position.
                 */
                var linkCARByPos = function (pos) {
                    // Link CAR by pos to currentCAR variable. If not found currentCAR === undefined
                    var currentCAR = hbUtil.getCARByPos($scope.elfin, pos);
                    // If currentCAR undefined
                    if (!currentCAR) {
                        // Create missing CAR for position pos
                        //$log.debug(">>>> Create missing CAR for position pos = " + pos);
                        hbUtil.initPath($scope.elfin, "CARACTERISTIQUE.CARSET.CAR", []);
                        $scope.elfin.CARACTERISTIQUE.CARSET.CAR.splice(pos - 1, 0, {"VALEUR": "", "POS": pos});
                        // Link newly created CAR by pos to currentCAR variable
                        currentCAR = hbUtil.getCARByPos($scope.elfin, pos);
                    }
                    return currentCAR;
                };

                $scope.sourceAbaImmo = "";

                $scope.loadSourceElfin = function(sourceAttr) {
                    var that = this;
                    hbQueryService.loadSourceElfin(sourceAttr,
                        function (sourceElfin) {
                            that.sourceAbaImmo = hbUtil.getCARByPos(sourceElfin, 2).VALEUR;
                        },
                        function (response) {
                            that.sourceAbaImmo = "";
                            var message = "Le chargement de l'Immeuble source a échoué (statut de retour: " + response.status + ")";
                            hbAlertMessages.addAlert("danger", message);
                        }
                    );
                };


                // Check when elfin instance becomes available
                $scope.$watch('elfin.Id', function() {

                    if ($scope.elfin) {

                        // No AbaIMMO
                        $scope.CARSET_CAR_POS_2 = linkCARByPos(2);

                        /**
                         * Perform template clean up tasks while in create mode.
                         */
                        if ($attrs["hbMode"] === "create") {

                            $scope.elfin.GROUPE = "";

                            // When creation is part of SURFACE archiving procedure
                            // let's get archived SURFACE information to init the new
                            // SURFACE from, saving end-user typing.
                            if ($routeParams.ID_G && $routeParams.Id) {

                                GeoxmlService.getElfin($routeParams.ID_G, $routeParams.Id).get()
                                    .then(
                                        function(archivedLocationUnit) {
                                            // Preserve new Id, ID_G
                                            // var newId = angular.copy($scope.elfin.Id);
                                            // var newID_G = angular.copy($scope.elfin.ID_G);
                                            // Copy property value from archived to new
                                            $scope.elfin.IDENTIFIANT = angular.copy(archivedLocationUnit.IDENTIFIANT);
                                            $scope.elfin.IDENTIFIANT.DE = hbUtil.getDateInHbTextFormat(new Date());
                                            $scope.elfin.IDENTIFIANT.A = "";

                                            $scope.elfin.PARTENAIRE = angular.copy(archivedLocationUnit.PARTENAIRE);
                                            $scope.elfin.PARTENAIRE["USAGER"]["VALUE"] = "";

                                            $scope.elfin.CARACTERISTIQUE = angular.copy(archivedLocationUnit.CARACTERISTIQUE);
                                            $scope.elfin.ACTIVITE = angular.copy(archivedLocationUnit.ACTIVITE);
                                            $scope.elfin.GROUPE  = angular.copy(archivedLocationUnit.GROUPE);
                                            $scope.elfin.NATURE  = angular.copy(archivedLocationUnit.NATURE);
                                            $scope.elfin.TYPE  = angular.copy(archivedLocationUnit.TYPE);
                                            $scope.elfin.SOURCE  = angular.copy(archivedLocationUnit.SOURCE);

                                            // Force creation of new UNITE LOCATION.
                                            $scope.saveElfin($scope.elfin);
                                            // $scope.elfin.Id = newId;
                                            // $scope.elfin.ID_G = newID_G;
                                            $scope.loadSourceElfin($scope.elfin.SOURCE);
                                        },
                                        function(response) {
                                            var message = "Les valeurs par défaut pour la CLASSE UNITE_LOCATIVE n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
                                            hbAlertMessages.addAlert("danger", message);
                                        });
                            } else if ($routeParams.ORIGINE) {
                                $scope.elfin.IDENTIFIANT.ORIGINE = $routeParams.ORIGINE;
                                // Build reference to parent IMMEUBLE.
                                $scope.elfin.SOURCE = HB_COLLECTIONS.IMMEUBLE_ID + "/IMMEUBLE/" + $routeParams.ORIGINE;
                                $scope.loadSourceElfin($scope.elfin.SOURCE);
                            }

                        } else {

                            // Need loading related data only when not in create mode
                            $scope.loadSourceElfin($scope.elfin.SOURCE);

                            // Only load orders if user as rights to see them
                            if ($scope.canManageOrders) {
                                hbQueryService.getCommandesForSource($scope.elfin.ID_G+ "/" +$scope.elfin.CLASSE + "/" +  $scope.elfin.Id).then(function(elfins) {
                                        $scope.commandes = elfins;

                                        $scope.commandes.forEach(function (commande) {
                                            var xpath = "//ELFIN[FILIATION/PARENT/@Id='" + commande.Id + "'and FILIATION/PARENT/@ID_G='" + commande.ID_G + "' and FILIATION/PARENT/@CLASSE='" + commande.CLASSE + "']";

                                            hbQueryService.getTransactions(xpath).then(
                                                function (transactions) {
                                                    var nbTransactions = transactions.length;
                                                    var total = 0;
                                                    transactions.forEach(function(transaction) {
                                                        total += transaction.IDENTIFIANT.VALEUR || 0;
                                                    });
                                                    commande.transactionSummary = total + " CHF (" + nbTransactions + ")";
                                                },
                                                function (response) {
                                                    var message = "L'obtention des TRANSACTIONS pour la source: " + xpath + " a échoué. (statut: " + response.status + ")";
                                                    hbAlertMessages.addAlert("danger", message);
                                                }
                                            )
                                        });

                                    },
                                    function(response) {
                                        var message = "Le chargement des COMMANDES a échoué (statut de retour: "+ response.status+ ")";
                                        hbAlertMessages.addAlert("danger",message);
                                    });
                            }

                        }
                    }

                }, true);

                GeoxmlService.getNewElfin("SURFACE").get()
                    .then(function(unite_locative) {
                            // Get groupeChoices from catalogue default
                            $scope.groupeChoices = hbUtil.buildArrayFromCatalogueDefault(unite_locative.GROUPE);
                        },
                        function(response) {
                            var message = "Les valeurs par défaut pour la CLASSE UNITE_LOCATIVE n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
                            hbAlertMessages.addAlert("danger",message);
                        });

                // Load ACTEUR `Propriétaire` list
                $scope.ownerActors = null;
                var xpathForOwners = "//ELFIN[IDENTIFIANT/QUALITE='Propriétaire']";
                hbQueryService.getActors(xpathForOwners).then(
                    function(ownerActors) {
                        $scope.ownerActors = ownerActors;
                    },
                    function(response) {
                        var message = "Le chargement des ACTEURS Propriétaire a échoué (statut de retour: "
                            + response.status
                            + ")";
                        hbAlertMessages.addAlert(
                            "danger", message);
                    });


                // Parameters to hbChooseOne service function for ACTOR selection
                $scope.actorChooseOneColumnsDefinition = [
                    { field:"IDENTIFIANT.NOM", displayName: "Nom"},
                    { field:"GROUPE", displayName: "Groupe"}
                ];

                $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor.html';



            } ]);

})();
