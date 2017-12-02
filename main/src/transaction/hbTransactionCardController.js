(function () {

    angular
        .module('hb5')
        .controller(
            'HbTransactionCardController',
            [
                '$attrs',
                '$scope',
                '$rootScope',
                'GeoxmlService',
                '$modal',
                '$routeParams',
                '$location',
                '$log',
                '$timeout',
                'hbAlertMessages',
                'hbUtil',
                'HB_EVENTS',
                'userDetails',
                'hbQueryService',
                function ($attrs, $scope, $rootScope, GeoxmlService,
                          $modal, $routeParams, $location, $log,
                          $timeout, hbAlertMessages, hbUtil,
                          HB_EVENTS, userDetails, hbQueryService) {

                    $scope.reallocate = !!$routeParams.reallocate;
                    $scope.prestationSelection = false;
                    //$log.debug("    >>>> Using HbTransactionCardController, reallocate = " + $scope.reallocate );


                    // ===================================================================================
                    // Input fields used to select IMMEUBLE related to current TRANSACTION backing models
                    // ===================================================================================
                    // Owner Actor (ACTEUR role=Propriétaire)
                    //$scope.searchOwner = {Id : "", ID_G : "", GROUPE : "", NOM : ""};
                    // No SAI user input field used to select IMMEUBLE related to current TRANSACTION
                    $scope.helper = {constatSelectionSai: ""};
                    // ===================================================================================

                    // Available repartition codes list loaded asynchronously from catalogue
                    $scope.repartitions = null;

                    // Benefit from server side cache...
                    var xpathForImmeubles = "//ELFIN[@CLASSE='IMMEUBLE']";



                    $scope.$watch('searchOwner', function (newOwner, oldOwner) {
                        $log.debug("searchOwner changed \nFrom : " + angular.toJson(oldOwner) + "\nTo   : " + angular.toJson(newOwner));
                    }, true);

                    /**
                     * Refresh address found with helpers CONSTAT and ACTOR 'Propriétaire' information changes.
                     */
                    /*
                    $scope.$watch('[helper.constatSelectionSai,searchOwner.Id]', function () {
                        $scope.displayBuildingAddress($scope.helper.constatSelectionSai, $scope.searchOwner);
                    }, true);
                    */

                    // Copy VALEUR_A_NEUF to VALEUR only if VALEUR is 0
                    $scope.copyValeur_a_Neuf2Valeur = function (valneuf) {
                        // Only initialise to valneuf if no set (=== 0)
                        if ($scope.elfin.IDENTIFIANT.VALEUR === 0) {
                            $scope.elfin.IDENTIFIANT.VALEUR = valneuf;
                        }
                    };


                    // Allow triggering reallocate mode to allow editing of sensitive fields.
                    $scope.reallocateTransaction = function () {
                        var xpathForPrestationBySOURCE = "//ELFIN[@SOURCE='" + $scope.sourcePrestation.SOURCE + "' and @ID_G='" + $scope.sourcePrestation.ID_G + "' and @CLASSE='" + $scope.sourcePrestation.CLASSE + "']";

                        hbQueryService.getPrestations(xpathForPrestationBySOURCE).then(
                            function (prestations) {
                                $scope.selectOnePrestation(
                                    $scope.elfin,
                                    "SOURCE",
                                    prestations,
                                    "IDENTIFIANT.COMPTE",
                                    $scope.selectOnePrestationColumnsDefinition,
                                    $scope.selectOnePrestationTemplate
                                );
                            },
                            function (response) {
                                var message = "L'obtention des PRESTATIONs pour la source: " + xpathForPrestationBySOURCE + " a échoué. (statut: "
                                    + response.status
                                    + ")";
                                hbAlertMessages.addAlert("danger", message);
                                $scope.searchOwner = {Id: "", ID_G: "", GROUPE: "", NOM: ""};
                            }
                        );

                    };

                    // Parameters to selectOnePrestation function for PRESTATION selection
                    $scope.selectOnePrestationColumnsDefinition = [
                        {field: "IDENTIFIANT.OBJECTIF", displayName: "No Prestation"},
                        {field: "GROUPE", displayName: "Groupe"},
                        {field: "IDENTIFIANT.COMPTE", displayName: "Compte / Nature"},
                        {field: "IDENTIFIANT.DE", displayName: "Année"}
                    ];

                    $scope.selectOnePrestationTemplate = '/assets/views/chooseOnePrestation.html';


                    /**
                     * Modal panel to select a prestation when more than one is available.
                     */
                    $scope.selectOnePrestation = function (targetElfin, targetPath, elfins, sourcePath, columnsDefinition, template) {

                        $log.debug(">>>> selectPrestation = " + elfins.length);

                        var modalInstance = $modal.open({
                            templateUrl: template,
                            scope: $scope,
                            controller: 'HbChooseOneModalController',
                            resolve: {
                                elfins: function () {
                                    return elfins;
                                },
                                columnsDefinition: function () {
                                    return columnsDefinition;
                                },
                                sourcePath: function () {
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

                                $scope.sourcePrestation = selectedElfins[0];
                                $scope.elfin.SOURCE = $scope.sourcePrestation.ID_G + "/" + $scope.sourcePrestation.CLASSE + "/" + $scope.sourcePrestation.Id;

                                $scope.elfin.IDENTIFIANT.COMPTE = $scope.sourcePrestation.IDENTIFIANT.COMPTE;
                                $scope.elfin.IDENTIFIANT.OBJECTIF = $scope.sourcePrestation.IDENTIFIANT.OBJECTIF;

                                $scope.elfinForm.$setDirty();
                            } else {
                                $log.debug("No selection returned!!!");
                            }

                        }, function () {
                            $log.debug('Choose params modal dismissed at: ' + new Date());
                        });
                    };


                    /**
                     * TODO: Do not use. User workflow might change actual expected PRESTATION from original calling one with ID_G, Id.
                     */
                    $scope.getPrestationPerId = function (ID_G, Id) {
                        $log.debug(">>>>>> HbTransactionCardController - $scope.getPrestationPerId : ID_G / Id = " + ID_G + " / " + Id);
                        GeoxmlService.getElfin(ID_G, Id).get().then(
                            function (prestation) {
                                $scope.constatPrestation = prestation;
                                $scope.elfin.IDENTIFIANT.COMPTE = $scope.constatPrestation.IDENTIFIANT.COMPTE;
                                $scope.elfin.IDENTIFIANT.OBJECTIF = $scope.constatPrestation.IDENTIFIANT.OBJECTIF;
                                $scope.prestationStatus = null;
                                $scope.prestationStatusTooltips = "Prestation correspondant aux informations: ID_G / Id = " + ID_G + " / " + Id;
                                $log.debug(">>>>>> HbTransactionCardController - $scope.constatPrestation = " + $scope.constatPrestation);
                            },
                            function (response) {
                                var message = "Le chargement de la PRESTATION correspondant aux informations: ID_G / Id = " + ID_G + " / " + Id + " a échoué (statut de retour: " + response.status + ")";
                                hbAlertMessages.addAlert(
                                    "danger", message);
                            });
                    };


                    /**
                     * Search existing PRESTATION for no SAI, groupe prestation, year, owner
                     */
                    $scope.getPrestation = function (sai, groupePrestation, year, owner) {

                        //if ( sai !== null && sai.length > 0 && groupePrestation !== null && groupePrestation.length > 0 && year !== null && year.length === 4 && owner.Id !== null && owner.Id.length > 0) {
                        //if ( sai !== null && sai.length > 0 && groupePrestation !== null && groupePrestation.length > 0 && year !== null && owner.Id !== null && owner.Id.length > 0) {
                        if (sai !== null && groupePrestation !== null && groupePrestation.length > 0 && year !== null && owner !== undefined && owner !== null && owner.Id !== null && owner.Id !== 'null' && owner.Id.length > 0) {

                            $log.debug(">>>>>> HbTransactionCardController - getPrestation = " + "sai = " + sai + ", groupePrestation = " + groupePrestation + ", year = " + year + ", owner = " + angular.toJson(owner));

                            var xpathForPrestation = "//ELFIN[@GROUPE='" + groupePrestation + "' and IDENTIFIANT/DE='" + year + "' and starts-with(IDENTIFIANT/OBJECTIF, '" + sai + ".')  and PARTENAIRE/PROPRIETAIRE/@Id='" + owner.Id + "' and PARTENAIRE/PROPRIETAIRE/@ID_G='" + owner.ID_G + "']";

                            // Asychronous PRESTATIONS preloading
                            hbQueryService.getPrestations(xpathForPrestation).then(
                                function (prestations) {
                                    // Need to expose prestations to scope for use
                                    // from hbTransactionCreateCard.html, hbTransactionCard.html views
                                    $scope.prestations = prestations;
                                    if (prestations.length === 1) {
                                        $scope.constatPrestation = prestations[0];
                                        $scope.elfin.IDENTIFIANT.COMPTE = $scope.constatPrestation.IDENTIFIANT.COMPTE;
                                        $scope.elfin.IDENTIFIANT.OBJECTIF = $scope.constatPrestation.IDENTIFIANT.OBJECTIF;
                                        $scope.prestationStatus = null;
                                        $scope.prestationSelection = false;
                                        $scope.prestationStatusTooltips = "Prestation correspondant aux informations: SAI = " + sai + ", propriétaire: " + $scope.searchOwner.NOM + ", groupe de prestation = " + groupePrestation + ", année = " + year;
                                        $log.debug(">>>>>> HbTransactionCardController - $scope.constatPrestation = " + $scope.constatPrestation);
                                    } else if (prestations.length < 1) {
                                        $scope.constatPrestation = null;
                                        $scope.elfin.IDENTIFIANT.COMPTE = null;
                                        $scope.elfin.IDENTIFIANT.OBJECTIF = null;
                                        $scope.prestationStatus = "Aucun résultat";
                                        $scope.prestationStatusTooltips = "Pas de prestation correspondant aux informations: SAI = " + sai + ", propriétaire: " + $scope.searchOwner.NOM + ", groupe de prestation = " + groupePrestation + ", année = " + year;
                                        $scope.prestationSelection = false;
//													hbAlertMessages.addAlert(
//															"warning", "Pas de prestation correspondant aux informations: SAI = " + sai + ", propriétaire: " + $scope.searchOwner.NOM + ", groupe de prestation = " + groupePrestation + ", année = " + year);
                                    } else if (prestations.length > 1) {
                                        $scope.constatPrestation = null;
                                        $scope.elfin.IDENTIFIANT.COMPTE = null;
                                        $scope.elfin.IDENTIFIANT.OBJECTIF = null;
                                        $scope.prestationStatus = "Sélectionnez!";
                                        $scope.prestationStatusTooltips = "Plusieurs no prestations correspondent aux informations: SAI = " + sai + ", propriétaire: " + $scope.searchOwner.NOM + ", groupe de prestation = " + groupePrestation + ", année = " + year;
                                        $scope.prestationSelection = true;
//													hbAlertMessages.addAlert(
//															"warning", "Plusieurs prestations correspondent aux informations: SAI = " + sai + ", propriétaire: " + $scope.searchOwner.NOM + ", groupe de prestation = " + groupePrestation + ", année = " + year);

                                        $scope.selectOnePrestation($scope.elfin, 'IDENTIFIANT.OBJECTIF', prestations, 'IDENTIFIANT.OBJECTIF', $scope.selectOnePrestationColumnsDefinition, $scope.selectOnePrestationTemplate);
                                    }
                                },
                                function (response) {
                                    var message = "Le chargement de la PRESTATION correspondant aux informations: SAI = " + sai + ", propriétaire: " + $scope.searchOwner.NOM + ", groupe de prestation = " + groupePrestation + ", année = " + year + " a échoué (statut de retour: "
                                        + response.status
                                        + ")";
                                    hbAlertMessages.addAlert(
                                        "danger", message);
                                });

                        } else if ($attrs.hbMode === "create") {
                            $scope.constatPrestation = null;
                            $scope.elfin.IDENTIFIANT.COMPTE = null;
                            $scope.elfin.IDENTIFIANT.OBJECTIF = null;
                            $scope.prestationStatus = "Aucun résultat";
                            $scope.prestationSelection = false;
                        }

                    };


                    /**
                     * Updates PRESTATION.GROUPE on TRANSACTION.GROUPE update
                     */
                    $scope.$watch('elfin.GROUPE', function () {
                        if ($scope.elfin !== null) {
                            if ($scope.elfin.GROUPE !== null) {
                                var prestaGrp = hbUtil.getPrestationGroupForTransactionGroup($scope.elfin.GROUPE);
                                $log.debug(">>>>>> HbTransactionCardController - ($watch('elfin.GROUPE') updating $scope.elfin.CARACTERISTIQUE.CAR1.UNITE (PrestationGroupForTransactionGroup) from >" + $scope.elfin.CARACTERISTIQUE.CAR1.UNITE + "< to >" + prestaGrp + "<");
                                $scope.elfin.CARACTERISTIQUE.CAR1.UNITE = prestaGrp;
                            } else {
                                $scope.elfin.CARACTERISTIQUE.CAR1.UNITE = '';
                            }
                        }
                    }, true);

                    /**
                     * TODO: review behaviour when prestations.length > 1
                     * Maintain helper for SAI updated ...
                     */
                    $scope.$watch('elfin.IDENTIFIANT.OBJECTIF', function () {
                        if ($scope.elfin !== null && $scope.elfin.IDENTIFIANT.OBJECTIF) {
                            $scope.helper.constatSelectionSai = $scope.elfin.IDENTIFIANT.OBJECTIF.split('.')[0];
                        }
//						    		if ($scope.elfin!==null && $scope.elfin.IDENTIFIANT.OBJECTIF) {
//						    			if (prestations.length > 1) {
//						    				$log.debug(">>> several prestation for no SAI: " + $scope.elfin.IDENTIFIANT.OBJECTIF);
//						    			} else {
//						    				$scope.helper.constatSelectionSai = $scope.elfin.IDENTIFIANT.OBJECTIF.split('.')[0];
//						    			}
//						    		}

                    }, true);



                    /**
                     * TODO: disable when prestations.length > 1
                     * Listen to informations required to find out related PRESTATION
                     */
                    $scope.$watch('[helper.constatSelectionSai,elfin.CARACTERISTIQUE.CAR1.UNITE,elfin.IDENTIFIANT.PAR,searchOwner.Id]', function () {
                        // Prevent unnecessary call to getPrestation
                        //if ($scope.elfin!==null && $scope.elfin.IDENTIFIANT.PAR.length === 4 && $scope.helper.constatSelectionSai.length > 0 && $scope.elfin.CARACTERISTIQUE.CAR1.UNITE.length > 0) {
                        if ($scope.elfin !== null) {
                            // TODO: review situation in which this resets the searchOwner to null values...
                            // $routeParams.Id && $routeParams.ID_G
                            $log.debug(">>>>                                    <<<<");
                            $log.debug(">>>> $routeParams.sai                        = " + $routeParams.sai);
                            $log.debug(">>>> $routeParams.Id                         = " + $routeParams.Id);
                            $log.debug(">>>> $routeParams.ID_G                       = " + $routeParams.ID_G);
                            $log.debug(">>>> $scope.helper.constatSelectionSai       = " + $scope.helper.constatSelectionSai);
                            $log.debug(">>>> $scope.elfin.CARACTERISTIQUE.CAR1.UNITE = " + $scope.elfin.CARACTERISTIQUE.CAR1.UNITE);
                            $log.debug(">>>> $scope.elfin.IDENTIFIANT.PAR            = " + $scope.elfin.IDENTIFIANT.PAR);
                            $log.debug(">>>> $scope.searchOwner                      = " + $scope.searchOwner);
                            $log.debug(">>>>                                    <<<<");

//										if ($routeParams.ID_G && $routeParams.Id) {
//											$log.debug(">>>> getPrestationPerId <<<<");
//											$scope.getPrestationPerId($routeParams.ID_G, $routeParams.Id);
//										} else {
                            $log.debug(">>>> getPrestation <<<<");
                            $scope.getPrestation($scope.helper.constatSelectionSai, $scope.elfin.CARACTERISTIQUE.CAR1.UNITE, $scope.elfin.IDENTIFIANT.PAR, $scope.searchOwner);
//										}
                        }
                        //}
                    }, true);

                    $scope.sourceAbaImmo = "";
                    $scope.sourcePrestation = null;

                    $scope.loadSourceElfin = function (sourceAttr) {
                        if (angular.isString(sourceAttr)) {
                            var prestationAttrComponents = sourceAttr.split("/");
                            var prestationSourceIDG = prestationAttrComponents[0];
                            var prestationSourceId = prestationAttrComponents[2];
                            if (prestationSourceIDG && prestationSourceId) {
                                var that = this;
                                GeoxmlService.getElfin(prestationSourceIDG, prestationSourceId).get()
                                    .then(
                                        function (prestationElfin) {
                                            $scope.sourcePrestation = prestationElfin;
                                            $scope.loadSourceImmeuble(prestationElfin);
                                        },
                                        function (response) {
                                            that.sourceAbaImmo = "";
                                            $scope.sourcePrestation = null;
                                            var message = "Le chargement de la Prestation source a échoué (statut de retour: " + response.status + ")";
                                            hbAlertMessages.addAlert("danger", message);
                                        });
                            }
                        }
                    };

                    $scope.loadSourceImmeuble = function(prestationElfin) {

                        var immeubleAttrComponents = prestationElfin.SOURCE.split("/");
                        var immeubleSourceIDG = immeubleAttrComponents[0];
                        var immeubleSourceId = immeubleAttrComponents[2];
                        if (immeubleSourceIDG && immeubleSourceId) {
                            GeoxmlService.getElfin(immeubleSourceIDG, immeubleSourceId).get()
                                .then(
                                    function (immeubleElfin) {
                                        $scope.sourceAbaImmo = hbUtil.getCARByPos(immeubleElfin, 2).VALEUR;
                                        $scope.selectedImmeuble = immeubleElfin;
                                    },
                                    function (response) {
                                        $scope.sourceAbaImmo = "";
                                        var message = "Le chargement de l'Immeuble source a échoué (statut de retour: " + response.status + ")";
                                        hbAlertMessages.addAlert("danger", message);
                                    });
                        }
                    };

                    /**
                     * Perform operations once we are guaranteed to have access to $scope.elfin instance.
                     */
                    $scope.$watch('elfin.Id', function () {

                        if (!!$scope.elfin) {

                            // Update elfin properties from catalogue while in create mode
                            if ($attrs["hbMode"] === "create") {

                                var currentDate = new Date();
                                $scope.elfin.IDENTIFIANT.DE = hbUtil
                                    .getDateInHbTextFormat(currentDate);
                                $scope.elfin.IDENTIFIANT.PAR = currentDate
                                    .getFullYear()
                                    .toString();

                                // Reset default value from catalogue is not relevant
                                $scope.elfin.IDENTIFIANT.QUALITE = "";
                                // Get user abbreviation from userDetails service
                                $scope.elfin.IDENTIFIANT.AUT = userDetails.getAbbreviation();
                                // Default value from catalogue contains constatTypes list: Reset it.
                                $scope.elfin.GROUPE = "";
                                // Default value from catalogue contains repartition list: Reset it.
                                $scope.elfin.CARACTERISTIQUE.CAR3.VALEUR = "";

                                // If a No SAI corresponding to an existing PRESTATION is provided
                                // set it to elfin.IDENTIFIANT.OBJECTIF
                                //if ($routeParams.sai) {
                                if (!!$routeParams.Id && !!$routeParams.ID_G && !!$routeParams.classe) {
                                    // Check the corresponding PRESTATION exists and if available, copy relevant information to
                                    // current new TRANSACTION.
                                    //var xpathForPrestationByObjectif = "//ELFIN[IDENTIFIANT/OBJECTIF='"+$routeParams.sai+"']";
                                    var xpathForPrestationByIdAndID_G = "//ELFIN[@Id='" + $routeParams.Id + "' and @ID_G='" + $routeParams.ID_G + "' and @CLASSE='" + $routeParams.classe + "']";

                                    // Prototype generic link to creation source/parent - done for SDS.
                                    $scope.elfin.SOURCE = $routeParams.ID_G + "/" + $routeParams.classe + "/" + $routeParams.Id;

                                    //hbQueryService.getPrestations(xpathForPrestationByObjectif).then(
                                    hbQueryService.getPrestations(xpathForPrestationByIdAndID_G).then(
                                        function (prestations) {
                                            var message;
                                            if (prestations.length === 1) {
                                                var prestation = prestations[0];
                                                // Update OBJECTIF
                                                $scope.elfin.IDENTIFIANT.OBJECTIF = prestation.IDENTIFIANT.OBJECTIF;

                                                // Update helper fields
                                                $scope.searchOwner = {
                                                    Id: prestation.PARTENAIRE.PROPRIETAIRE.Id,
                                                    ID_G: prestation.PARTENAIRE.PROPRIETAIRE.ID_G,
                                                    GROUPE: prestation.PARTENAIRE.PROPRIETAIRE.GROUPE,
                                                    NOM: prestation.PARTENAIRE.PROPRIETAIRE.NOM
                                                };
                                                $scope.helper.constatSelectionSai = prestation.IDENTIFIANT.OBJECTIF.split('.')[0];
                                                // Groupe prestation
                                                $scope.elfin.CARACTERISTIQUE.CAR1.UNITE = prestation.GROUPE;
                                                // Year prestation
                                                $scope.elfin.IDENTIFIANT.PAR = prestation.IDENTIFIANT.DE;

                                                $scope.loadSourceImmeuble(prestation);

                                            } else {
                                                if (prestations.length === 0)
                                                    message = "Pas de source trouvée pour:" + xpathForPrestationByIdAndID_G;
                                                else {
                                                    message = "Deux prestations trouvées pour la requête: " + xpathForPrestationByIdAndID_G;
                                                }
                                                hbAlertMessages.addAlert("warning", message);
                                                $scope.searchOwner = {Id: "", ID_G: "", GROUPE: "", NOM: ""};
                                            }
                                        },
                                        function (response) {
                                            var message = "L'obtention d'une PRESTATION pour le numéro d'objectif: " + $routeParams.sai + " a échoué. (statut: "
                                                + response.status
                                                + ")";
                                            hbAlertMessages.addAlert(
                                                "danger", message);
                                            $scope.searchOwner = {Id: "", ID_G: "", GROUPE: "", NOM: ""};
                                        });
                                } else {
                                    $scope.searchOwner = {Id: "", ID_G: "", GROUPE: "", NOM: ""};
                                }

                            } else if ($scope.reallocate) { // updates in reallocate mode
                                if ($scope.elfin) {
                                    $log.debug(">>>>>>>>>> REALLOCATING ...");

                                    // If a No SAI corresponding to an existing PRESTATION is provided
                                    // set it to elfin.IDENTIFIANT.OBJECTIF
                                    if ($scope.elfin.IDENTIFIANT.OBJECTIF) {
                                        $log.debug(" >>>>>>>>>>>>>>>>>>> searching for prestation...");
                                        $scope.helper.constatSelectionSai = $scope.elfin.IDENTIFIANT.OBJECTIF.split('.')[0];

                                        // Check the corresponding PRESTATION exists and if available, copy relevant information to
                                        // current new TRANSACTION.
                                        var xpathForPrestationByObjectif = "//ELFIN[IDENTIFIANT/OBJECTIF='" + $scope.elfin.IDENTIFIANT.OBJECTIF + "']";
                                        hbQueryService.getPrestations(xpathForPrestationByObjectif).then(
                                            function (prestations) {
                                                $log.debug(" >>>>>>>>>>>>>>>>>>> found " + prestations.length + " prestation for " + xpathForPrestationByObjectif);
                                                var message;
                                                if (prestations.length === 1) {
                                                    var prestation = prestations[0];
                                                    // Update OBJECTIF
                                                    //$scope.elfin.IDENTIFIANT.OBJECTIF = prestation.IDENTIFIANT.OBJECTIF;
                                                    // Update helper fields
                                                    $scope.searchOwner = {
                                                        Id: prestation.PARTENAIRE.PROPRIETAIRE.Id,
                                                        ID_G: prestation.PARTENAIRE.PROPRIETAIRE.ID_G,
                                                        GROUPE: prestation.PARTENAIRE.PROPRIETAIRE.GROUPE,
                                                        NOM: prestation.PARTENAIRE.PROPRIETAIRE.NOM
                                                    };

                                                    // Groupe prestation
                                                    //$scope.elfin.CARACTERISTIQUE.CAR1.UNITE = prestation.GROUPE;
                                                    // Year prestation
                                                    //$scope.elfin.IDENTIFIANT.PAR = prestation.IDENTIFIANT.DE;
                                                } else if (prestations.length > 1) {
                                                    message = "Le numéro d'objectif: " + $scope.helper.constatSelectionSai + " fourni correspond à plus d'une PRESTATION, cette information n'est pas prise en compte.";
                                                    hbAlertMessages.addAlert(
                                                        "warning", message);
                                                    $scope.searchOwner = {Id: "", ID_G: "", GROUPE: "", NOM: ""};
                                                } else if (prestations.length < 1) {
                                                    message = "Le numéro d'objectif: " + $scope.helper.constatSelectionSai + " fourni ne correspond à aucune PRESTATION, cette information n'est pas prise en compte.";
                                                    hbAlertMessages.addAlert(
                                                        "warning", message);
                                                    $scope.searchOwner = {Id: "", ID_G: "", GROUPE: "", NOM: ""};
                                                }
                                            },
                                            function (response) {
                                                var message = "L'obtention d'une PRESTATION pour le numéro d'objectif: " + $scope.helper.constatSelectionSai + " a échoué. (statut: "
                                                    + response.status
                                                    + ")";
                                                hbAlertMessages.addAlert(
                                                    "danger", message);
                                                $scope.searchOwner = {Id: "", ID_G: "", GROUPE: "", NOM: ""};
                                            });
                                    } else {
                                        // Fix #9 reallocation owner selection not effective when elfin.IDENTIFIANT has no OBJECTIF field.
                                        $scope.searchOwner = {Id: "", ID_G: "", GROUPE: "", NOM: ""};
                                    }
                                } else {
                                    $log.debug("elfin should be available once $watch('elfin.Id') has been triggered.");
                                }
                            } else {
                                $scope.loadSourceElfin($scope.elfin.SOURCE);
                                // Manage editing initialisation. Warning: $scope.elfin.PARTENAIRE.PROPRIETAIRE is not equal to the owner for TRANSACTION entities.
                                $scope.searchOwner = undefined;
                            }
                        }
                    }, true);

                    // Asychronous TRANSACTION template preloading
                    GeoxmlService.getNewElfin("TRANSACTION").get().then(
                        function (transaction) {
                            // Get transaction types
                            // from catalogue
                            $scope.transactionTypes = hbUtil.buildArrayFromCatalogueDefault(transaction.GROUPE);
                            $scope.repartitions = hbUtil.buildArrayFromCatalogueDefault(transaction.CARACTERISTIQUE["CAR3"]["VALEUR"]);
                        },
                        function (response) {
                            var message = "Les valeurs par défaut pour la CLASSE TRANSACTION n'ont pas pu être chargées. (statut de retour: "
                                + response.status
                                + ")";
                            hbAlertMessages.addAlert(
                                "danger", message);
                        });

                    // Asychronous PRESTATION template preloading
                    GeoxmlService.getNewElfin("PRESTATION").get().then(
                        function (prestation) {
                            //Get prestation types from catalogue
                            $scope.prestationTypes = hbUtil.buildArrayFromCatalogueDefault(prestation.GROUPE);
                        },
                        function (response) {
                            var message = "Les valeurs par défaut pour la CLASSE PRESTATION n'ont pas pu être chargées. (statut de retour: "
                                + response.status
                                + ")";
                            hbAlertMessages.addAlert(
                                "danger", message);
                        });

                    var focusOnField = function () {
                        $('#objectifSearchHelper').focus();
                    };

                    $scope.immeubleChooseOneColumnsDefinition = [
                        {
                            field: "PARTENAIRE.PROPRIETAIRE.VALUE",
                            displayName: "Propriétaire"
                        },
                        {
                            field: "IDENTIFIANT.OBJECTIF",
                            displayName: "Numéro de gérance"
                        },
                        {
                            field: "CARACTERISTIQUE.CARSET.CAR[0].VALEUR",
                            displayName: "Lieu-dit"
                        }];
                    $scope.immeubleChooseOneTemplate = '/assets/views/chooseOneImmeuble.html';

                    // TODO: FocusTimeout issue. Find a better
                    // solution ?
                    $timeout(focusOnField, 500, true);


                    // Load ACTEUR `Entreprise` list
                    $scope.entrepriseActors = null;
                    var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
                    hbQueryService.getActors(xpathForEntreprises).then(
                        function (entrepriseActors) {
                            $scope.entrepriseActors = entrepriseActors;
                        },
                        function (response) {
                            var message = "Le chargement des ACTEURS Entreprise a échoué (statut de retour: "
                                + response.status
                                + ")";
                            hbAlertMessages.addAlert(
                                "danger", message);
                        });

                    // Load ACTEUR `Collaborateur` list
                    $scope.collaboratorActors = null;
                    var xpathForCollaborators = "//ELFIN[IDENTIFIANT/QUALITE='Collaborateur']";
                    hbQueryService.getActors(xpathForCollaborators).then(
                        function (collaboratorActors) {
                            $scope.collaboratorActors = collaboratorActors;
                        },
                        function (response) {
                            var message = "Le chargement des ACTEURS Collaborateur a échoué (statut de retour: "
                                + response.status
                                + ")";
                            hbAlertMessages.addAlert(
                                "danger", message);
                        });


                    // Parameters to hbChooseOne service function for ACTOR selection
                    $scope.actorChooseOneColumnsDefinition = [
                        {field: "GROUPE", displayName: "Groupe"}
                    ];

                    $scope.collaboratorActorChooseOneColumnsDefinition = [
                        {field: "IDENTIFIANT.NOM", displayName: "Nom"},
                        {field: "IDENTIFIANT.ALIAS", displayName: "Prénom"},
                        {field: "GROUPE", displayName: "Groupe"}
                    ];

                    $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor.html';


                    // Allow direct call to new TRANSACTION creation without going through menus items.
                    $scope.createNewTransaction = function () {
                        var redirUrl = '/elfin/create/TRANSACTION';
                        $location.path(redirUrl);
                    };



                    // Allow going back from special reallocate mode to standard edit mode
                    $scope.editTransaction = function () {
                        $location.search('reallocate', null);
                    };

                }]);

})();
