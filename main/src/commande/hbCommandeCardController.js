(function () {

    angular
        .module('hb5')
        .controller(
            'HbCommandeCardController',
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
                'HB_ORDER_TYPE',
                'HB_ORDER_REPORT_TYPE',
                'HB_ROLE_FONCTION',
                'userDetails',
                'hbQueryService',
                'hbPrintService',
                '$window',
                function ($attrs, $scope, $rootScope, GeoxmlService,
                          $modal, $routeParams, $location, $log,
                          $timeout, hbAlertMessages, hbUtil,
                          HB_EVENTS, HB_ORDER_TYPE, HB_ORDER_REPORT_TYPE, HB_ROLE_FONCTION, userDetails, hbQueryService, hbPrintService, $window) {

                    $scope.transactionTabActive = ($location.hash() === "transactions");

                    $scope.OBJECTS_SELECTION_TYPE_IMMEUBLE = "IMMEUBLE";
                    $scope.OBJECTS_SELECTION_TYPE_SURFACE = "OBJET";
                    $scope.READ_ONLY_STATUS_KEYWORD = "status::readonly";

                    // Modifying an order after its validation requires admin role in addition to
                    // orders-statistics function. This action should not be performed after an
                    // order has been sent, printed.
                    $scope.canUnlockValidatedOrders = (
                        _.contains(userDetails.getRoles(), HB_ROLE_FONCTION.ORDERS_STATISTICS) &&
                        _.contains(userDetails.getRoles(), HB_ROLE_FONCTION.ADMIN)
                    );

                    // Expose order type constants to scope
                    $scope.HB_ORDER_TYPE = HB_ORDER_TYPE;

                    $scope.transactions = [];
                    $scope.transactionsInvoicedSum = 0;
                    $scope.transactionsPaidSum = 0;

                    $scope.loadTransactions = function () {
                        var xpath = "//ELFIN[FILIATION/PARENT/@Id='" + $scope.elfin.Id + "'and FILIATION/PARENT/@ID_G='" + $scope.elfin.ID_G + "' and FILIATION/PARENT/@CLASSE='" + $scope.elfin.CLASSE + "']";

                        hbQueryService.getTransactions(xpath).then(
                            function (transactions) {
                                $scope.transactions = transactions;
                                var invoicedSum = 0;
                                var paidSum = 0;
                                _.forEach(transactions, function (transaction) {
                                    invoicedSum += transaction.IDENTIFIANT.VALEUR_A_NEUF;
                                    paidSum += transaction.IDENTIFIANT.VALEUR;
                                });
                                $scope.transactionsInvoicedSum = invoicedSum;
                                $scope.transactionsPaidSum = paidSum;
                                $scope.remainingToBeInvoiced = parseFloat($scope.elfin.CARACTERISTIQUE.FRACTION.L[6].C[4].VALUE) - $scope.transactionsInvoicedSum;

                            },
                            function (response) {
                                var message = "L'obtention des TRANSCTIONS pour la source: " + commandeSourceXpath + " a échoué. (statut: "
                                    + response.status
                                    + ")";
                                hbAlertMessages.addAlert("danger", message);
                            }
                        );
                    };




                    GeoxmlService.getNewElfin("COMMANDE").get()
                        .then(function (order) {
                                // Get typeChoices from catalog default
                                $scope.typeChoices = hbUtil.buildArrayFromCatalogueDefault(order.IDENTIFIANT.QUALITE);
                            },
                            function (response) {
                                var message = "Les valeurs par défaut pour la CLASSE COMMANDE n'ont pas pu être chargées. (statut de retour: " + response.status + ")";
                                hbAlertMessages.addAlert("danger", message);
                            });

                    $scope.objectsSelectionTypeChoices = hbUtil.buildArrayFromCatalogueDefault($scope.OBJECTS_SELECTION_TYPE_IMMEUBLE + "|" + $scope.OBJECTS_SELECTION_TYPE_SURFACE);

                    $scope.selected = {
                        "building": null,
                        "code": null,
                        "objectsSelectionType": null,
                        "provider": null,
                        "surface": null,
                        "initialised": false
                    };

                    /**
                     * Set respActorModel.Id to undefined to prevent validation activation if unused.
                     */
                    $scope.respActorModel = {Id: undefined, ID_G: "", GROUPE: "", NOM: ""}; //
                    $scope.signataireActorModel = {Id: undefined, ID_G: "", GROUPE: "", NOM: ""}; //
                    $scope.executiveActorModel = {Id: undefined, ID_G: "", GROUPE: "", NOM: ""}; //


                    /**
                     * Proceed with CARACTERISTIQUE.FRACTION.L update depending on order type selection.
                     *
                     */
                    $scope.processOrderTypeChange = function (selectedType) {
                        if (selectedType === HB_ORDER_TYPE.PURCHASE) {
                            $scope.elfin.CARACTERISTIQUE.FRACTION.L = hbUtil.getOrderPurchaseLines();
                            // Reset field information meaningless to purchase order context.
                            $scope.elfin.IDENTIFIANT.RES = "";
                            $scope.elfin.CARACTERISTIQUE["CARSET"]["CAR"][0]["VALEUR"] = hbUtil.getOrderPurchaseIntroduction();
                            // Object / building type and location - Unused
                            $scope.elfin.CARACTERISTIQUE["CARSET"]["CAR"][1]["VALEUR"] = "";
                        } else if (selectedType === HB_ORDER_TYPE.CONFIRMATION) {
                            $scope.elfin.CARACTERISTIQUE.FRACTION.L = hbUtil.getOrderConfirmationLines();
                            $scope.elfin.CARACTERISTIQUE["CARSET"]["CAR"][0]["VALEUR"] = hbUtil.getOrderConfirmationIntroduction();
                            // Object / building type and location - Unused
                            $scope.elfin.CARACTERISTIQUE["CARSET"]["CAR"][1]["VALEUR"] = "";
                        } else if (selectedType === HB_ORDER_TYPE.CONTRACT) {
                            $scope.elfin.CARACTERISTIQUE.FRACTION.L = hbUtil.getOrderContractLines();
                            $scope.elfin.CARACTERISTIQUE["CARSET"]["CAR"][0]["VALEUR"] = hbUtil.getOrderContractIntroduction();
                            // Object / building type and location - Used: free text.
                            $scope.elfin.CARACTERISTIQUE["CARSET"]["CAR"][1]["VALEUR"] = "";
                        } else {
                            var message = "Le type de COMMANDE " + selectedType + " n'est pas encore pris en compte veuillez s.v.p. contacter l'administrateur du système.";
                            hbAlertMessages.addAlert("danger", message);
                        }
                    };

                    /**
                     * Update current COMMANDE SOURCE information detecting whether
                     * creation context is linked to IMMEUBLE or SURFACE.
                     */
                    var updateSource = function () {
                        if ($scope.selected.surface !== null && $scope.selected.surface.Id) {
                            $scope.elfin.SOURCE = $scope.selected.surface.ID_G + "/" + $scope.selected.surface.CLASSE + "/" + $scope.selected.surface.Id;
                            // Set order (COMMANDE) ALIAS to SURFACE OBJECTIF (no SAI - no object)
                            $scope.elfin.IDENTIFIANT.ALIAS = $scope.selected.surface.IDENTIFIANT.OBJECTIF;
                            $scope.elfin.IDENTIFIANT.OBJECTIF = (hbUtil.getCARByPos($scope.selected.surface, 2) || {VALEUR:""}).VALEUR;
                        } else if ($scope.selected.building !== null && $scope.selected.building.Id) {
                            $log.debug("/!\ updateSource NO selected.surface.Id /!\ ");
                            $scope.elfin.SOURCE = $scope.selected.building.ID_G + "/" + $scope.selected.building.CLASSE + "/" + $scope.selected.building.Id;
                            $scope.elfin.IDENTIFIANT.OBJECTIF = (hbUtil.getCARByPos($scope.selected.building, 2) || {VALEUR:""}).VALEUR;

                            // TODO: review if it is the best place to reset ALIAS ?
                        } else {
                            $log.debug("No relevant information to perform SOURCE update. Reset it to blank.");
                            $scope.elfin.SOURCE = "";
                        }
                    };


                    var setSelectedSurface = function (ID_G, Id, createPrestation) {
                        GeoxmlService.getElfin(ID_G, Id).get()
                            .then(function (surfaceElfin) {
                                // Force CAR array sorting by POS attribute
                                // TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
                                // DONE: Safe array ordering is mandatory to prevent null accessor related exception
                                //       Need review of other similar operations
                                if (!!surfaceElfin['CARACTERISTIQUE'] &&
                                    !!surfaceElfin['CARACTERISTIQUE']['CARSET'] &&
                                    !!surfaceElfin['CARACTERISTIQUE']['CARSET']['CAR']) {
                                    hbUtil.reorderArrayByPOS(surfaceElfin['CARACTERISTIQUE']['CARSET']['CAR']);
                                }
                                $scope.selected.surface = surfaceElfin;
                                $scope.selected.surface.CARSET_CAR_POS_2 = hbUtil.getCARByPos($scope.selected.surface, 2);
                                var selectedParentIds = hbUtil.getIdentifiersFromStandardSourceURI(surfaceElfin.SOURCE);
                                // Also manages $scope.selected.initialised state
                                setSelectedBuilding(selectedParentIds.ID_G, selectedParentIds.Id, createPrestation);
                            }, function (response) {
                                var message = "Aucun object IMMEUBLE disponible pour la collection: " + ID_G + " et l'identifiant: " + Id + ".";
                                $log.warn("HbCommandeCardController - statut de retour: " + response.status + ". Message utilisateur: " + message);
                            });
                    };


                    /**
                     * Set selected.building scope variable given building ID_G, Id identifiers.
                     */
                    var setSelectedBuilding = function (ID_G, Id, createPrestation) {
                        GeoxmlService.getElfin(ID_G, Id).get()
                            .then(function (buildingElfin) {
                                // Force array sorting by POS attribute.
                                if (!!buildingElfin['CARACTERISTIQUE'] &&
                                    !!buildingElfin['CARACTERISTIQUE']['CARSET'] &&
                                    !!buildingElfin['CARACTERISTIQUE']['CARSET']['CAR']) {
                                    hbUtil.reorderArrayByPOS(buildingElfin['CARACTERISTIQUE']['CARSET']['CAR']);
                                }
                                $scope.selected.building = buildingElfin;
                                $scope.selected.building.CARSET_CAR_POS_2 = hbUtil.getCARByPos($scope.selected.building, 2);
                                // Stop waiting for building initialisation once obtained.
                                $scope.selected.initialised = true;

                                if (createPrestation) {
                                    // Define linked prestation
                                    $scope.choosePrestation(buildingElfin);
                                }

                            }, function (response) {
                                var message = "Aucun object IMMEUBLE disponible pour la collection: " + ID_G + " et l'identifiant: " + Id + ".";
                                $log.warn("HbCommandeCardController - statut de retour: " + response.status + ". Message utilisateur: " + message);
                            });
                    };

                    /**
                     * Modal panel to select a prestation when more than one is available.
                     */
                    $scope.selectOnePrestationTemplate = '/assets/views-compiled/_directives/chooseOnePrestation.html';
                    // Parameters to selectOnePrestation function for PRESTATION selection
                    $scope.selectOnePrestationColumnsDefinition = [
                        {field: "IDENTIFIANT.OBJECTIF", displayName: "No Prestation"},
                        {field: "GROUPE", displayName: "Groupe"},
                        {field: "IDENTIFIANT.COMPTE", displayName: "Compte / Nature"},
                        {field: "IDENTIFIANT.DE", displayName: "Année"}
                    ];

                    $scope.selectOnePrestationTemplate = '/assets/views-compiled/_directives/chooseOnePrestation.html';

                    var loadPrestation = function (scope, elfin) {
                        if (elfin.FILIATION && elfin.FILIATION.PARENT) {
                            var prestationFiliation = _.findWhere(elfin.FILIATION.PARENT, {CLASSE: "PRESTATION"});
                            GeoxmlService.getElfin(prestationFiliation.ID_G, prestationFiliation.Id).get()
                                .then(
                                    function (prestationElfin) {
                                        scope.prestation = prestationElfin;
                                    },
                                    function (response) {
                                        var message = "Aucun object PRESTATION disponible pour la collection: " + ID_G + " et l'identifiant: " + Id + ".";
                                        $log.warn("HbCommandeCardController - statut de retour: " + response.status + ". Message utilisateur: " + message);
                                    }
                                );
                        }
                    };

                    $scope.choosePrestation = function (buildingElfin) {
                        var prestationSourceXpath = "//ELFIN[@SOURCE='" + hbUtil.getStandardSourceURI(buildingElfin) + "' and @CLASSE='PRESTATION']";

                        hbQueryService.getPrestations(prestationSourceXpath).then(
                            function (prestations) {
                                $scope.selectOnePrestation(
                                    prestations,
                                    "IDENTIFIANT.OBJECTIF",
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

                    $scope.selectOnePrestation = function (elfins, sourcePath, columnsDefinition, template) {

                        $log.debug(">>>> selectPrestation = " + elfins.length);

                        var thisYear = moment().year();
                        var strThisYear = String(thisYear);
                        var strNextYear = String(thisYear + 1);
                        var strPreviousYear = String(thisYear - 1);


                        var currentYearElfins = _.filter(elfins, function (elfin) {
                            return elfin.IDENTIFIANT.DE === strThisYear;
                        });

                        var nextYearElfins = _.filter(elfins, function (elfin) {
                            return elfin.IDENTIFIANT.DE === strNextYear ||
                                (elfin.IDENTIFIANT.DE === strPreviousYear && elfin.GROUPE === "Construction");
                        });

                        var modalInstance = $modal.open({
                            templateUrl: $scope.selectOnePrestationTemplate,
                            scope: $scope,
                            controller: 'HbExtendedChooseOneModalController',
                            size:"lg",
                            resolve: {
                                elfins: function () {
                                    return currentYearElfins;
                                },

                                secondElfinList: function () {
                                    return nextYearElfins;
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

                                // Groupe prestation
                                if (!$scope.elfin.FILIATION) {
                                    $scope.elfin.FILIATION = {PARENT: []};
                                }

                                var existingPrestation = _.findWhere($scope.elfin.FILIATION.PARENT, {CLASSE: "PRESTATION"});
                                if (!!existingPrestation) {
                                    existingPrestation.ID_G = selectedElfins[0].ID_G;
                                    existingPrestation.Id = selectedElfins[0].Id;
                                    existingPrestation.CLASSE = selectedElfins[0].CLASSE;
                                    existingPrestation.REMARQUE = "";
                                    existingPrestation.PROPRIETE = [];
                                } else {
                                    $scope.elfin.FILIATION.PARENT.push({
                                        ID_G: selectedElfins[0].ID_G,
                                        Id: selectedElfins[0].Id,
                                        CLASSE: selectedElfins[0].CLASSE,
                                        REMARQUE: "",
                                        PROPRIETE: []
                                    });
                                }

                                $scope.prestation = selectedElfins[0];

                                $scope.elfinForm.$setDirty();
                            } else {
                                $log.debug("No selection returned!!!");
                            }

                        }, function () {
                            $log.debug('Choose params modal dismissed at: ' + new Date());
                        });
                    };

                    var getCARX = function (elfin, nbX) {
                        var carX = "CAR" + nbX;
                        if (elfin && elfin.CARACTERISTIQUE && elfin.CARACTERISTIQUE[carX]) {
                            var emailLength = elfin.CARACTERISTIQUE[carX].VALEUR.trim().length;
                            if (emailLength > 0) {
                                return elfin.CARACTERISTIQUE[carX].VALEUR;
                            } else {
                                return "Non spécifié";
                            }
                        } else {
                            return "Non spécifié";
                        }
                    };

                    $scope.getPhone = function (elfin) {
                        return getCARX(elfin, "4");
                    };

                    $scope.getEmail = function (elfin) {
                        return getCARX(elfin, "5");
                    };

                    $scope.getRole = function (elfin) {
                        return getCARX(elfin, "6");
                    };

                    $scope.isReadOnly = false;

                    var hasReadOnlyStatus = function () {
                        if (!!$scope.elfin.IDENTIFIANT["MOTCLE"] && $scope.elfin.IDENTIFIANT["MOTCLE"].length > 0) {
                            var keywordIdx = hbUtil.getKeywordIndex($scope.elfin.IDENTIFIANT["MOTCLE"], $scope.READ_ONLY_STATUS_KEYWORD);
                            return keywordIdx > -1;
                        }
                        return false;
                    };

                    var updateIsReadOnlyStatus = function () {
                        $scope.isReadOnly = hasReadOnlyStatus();
                    };

                    $scope.validateEntry = function () {
                        // If not yet set to read only status
                        // 1.) Check submission is valid by activating form validation
                        $scope.validate = true;

                        // 2.) setIsReadOnlyStatus will add the necessary keyword and update status only if submission valid

                        // Timeout with 3rd param true forces setIsReadOnlyStatus execution within
                        // $apply block, which lets form validation following $scope.validate value change
                        // to be effective.
                        $timeout($scope.setIsReadOnlyStatus, 0, true);
                    };

                    $scope.setIsReadOnlyStatus = function () {
                        // Make sure the keyword does not already exist
                        updateIsReadOnlyStatus();
                        if (!$scope.isReadOnly && $scope.elfinForm.$valid) {
                            $scope.elfin.IDENTIFIANT["MOTCLE"].push({"VALUE": $scope.READ_ONLY_STATUS_KEYWORD});
                            $scope.elfinForm.$setDirty();
                        }
                        updateIsReadOnlyStatus();
                    };

                    // TODO: should only be available with specific "admin" role...
                    $scope.unsetIsReadOnlyStatus = function () {
                        // Make sure the keyword does already exist
                        updateIsReadOnlyStatus();
                        // If set to read only status remove the keyword and update status otherwise do nothing
                        if ($scope.isReadOnly) {
                            var keywordIdx = hbUtil.getKeywordIndex($scope.elfin.IDENTIFIANT["MOTCLE"], $scope.READ_ONLY_STATUS_KEYWORD);
                            if (keywordIdx > -1) {
                                $scope.elfin.IDENTIFIANT["MOTCLE"].splice(keywordIdx, 1);
                                $scope.elfinForm.$setDirty();
                            }
                        }
                        updateIsReadOnlyStatus();
                    };

                    // Manage contract / confirmation manager
                    $scope.$watch('respActorModel', function (newResp) {
                        if (newResp.Id !== undefined) {
                            $scope.elfin.IDENTIFIANT.RES = newResp.ID_G + "/ACTEUR/" + newResp.Id;
                        }
                    }, true);

                    $scope.$watch("signataireActorModel", function (newSignataire) {
                        if (newSignataire.Id !== undefined) {
                            $scope.CARSET_CAR_POS_5.VALEUR = newSignataire.ID_G + "/ACTEUR/" + newSignataire.Id;
                        }
                    }, true);

                    $scope.$watch("executiveActorModel", function (newExecutive) {
                        if (newExecutive.Id !== undefined) {
                            $scope.CARSET_CAR_POS_4.VALEUR = newExecutive.ID_G + "/ACTEUR/" + newExecutive.Id;
                        }
                    }, true);


                    $scope.$watch('selected.objectsSelectionType', function (toType, fromType) {

                        if ($scope.selected.initialised === true) {

                            if (fromType === $scope.OBJECTS_SELECTION_TYPE_IMMEUBLE && toType === $scope.OBJECTS_SELECTION_TYPE_SURFACE) {
                                // Reset any SURFACE info
                                $scope.selected.surface = null;
                                // Reset any IMMEUBLE info
                                $scope.selected.building = null;
                                // COMMANDE SOURCE info update
                                updateSource();
                            } else if (fromType === $scope.OBJECTS_SELECTION_TYPE_SURFACE && toType === $scope.OBJECTS_SELECTION_TYPE_IMMEUBLE) {
                                // Reset any SURFACE INFO
                                $scope.selected.surface = null;
                                // COMMANDE SOURCE info update
                                updateSource();
                            }
                        }
                    }, true);


                    /**
                     * Listen to selected.building change and perform corresponding $scope.elfin updates
                     */
                    $scope.$watch('selected.building', function (newBuilding) {
                        //$log.debug(">>>> selected.building listener: newBuilding = " + angular.toJson(newBuilding) + ", oldBuilding = " + angular.toJson(oldBuilding));
                        if ($scope.selected.initialised === true) {
                            if ($scope.selected.building) {
                                $log.debug(">>>> selected.building listener: newBuilding = " + newBuilding.IDENTIFIANT.OBJECTIF);

                                // If the building is really a new one not defined in the current elfin then choose a new Prestation accordingly
                                /*
                                if ($scope.elfin.SOURCE !== hbUtil.getStandardSourceURI(newBuilding)) {
                                    $scope.choosePrestation($scope.selected.building);
                                }
                                */

                                // COMMANDE SOURCE info update
                                updateSource();

                                // Set order (COMMANDE) OBJECTIF to building (IMMEUBLE) OBJECTIF (no SAI)
                                // $scope.elfin.IDENTIFIANT.OBJECTIF = $scope.selected.building.IDENTIFIANT.OBJECTIF;
                                // $scope.elfin.IDENTIFIANT.OBJECTIF = hbUtil.getCARByPos($scope.selected.building, "2");


                                // Set order ORIGINE to building (IMMEUBLE) NOM (No construction)
                                $scope.elfin.IDENTIFIANT.ORIGINE = $scope.selected.building.IDENTIFIANT.NOM;

                                $scope.elfin.PARTENAIRE.PROPRIETAIRE = {
                                    "Id": $scope.selected.building.PARTENAIRE.PROPRIETAIRE.Id,
                                    "ID_G": $scope.selected.building.PARTENAIRE.PROPRIETAIRE.ID_G,
                                    "NOM": $scope.selected.building.PARTENAIRE.PROPRIETAIRE.NOM,
                                    "GROUPE": $scope.selected.building.PARTENAIRE.PROPRIETAIRE.GROUPE,
                                    "VALUE": ""
                                };


                            } else {
                                $log.debug("building has been reset... ");
                                $scope.elfin.SOURCE = "";
                                $scope.elfin.IDENTIFIANT.OBJECTIF = "";
                                $scope.elfin.IDENTIFIANT.ALIAS = "";
                                $scope.elfin.IDENTIFIANT.ORIGINE = "";
                                $scope.elfin.PARTENAIRE.PROPRIETAIRE = {
                                    "Id": "",
                                    "ID_G": "",
                                    "NOM": "",
                                    "GROUPE": "",
                                    "VALUE": ""
                                };
                            }

                            // Update contract number on building change.
                            if ($scope.elfin.IDENTIFIANT.QUALITE === HB_ORDER_TYPE.CONTRACT) {
                                setContractNumber($scope.elfin);
                            } else {
                                resetContractNumber($scope.elfin);
                            }
                        } else {
                            $log.debug("building : " + angular.toJson($scope.selected.building) + " ... WAITING for initialisation...");
                        }
                    }, true);


                    $scope.$watch('selected.surface', function () {
                        if ($scope.selected.initialised === true && $scope.selected.surface && $scope.selected.surface.Id) {
                            $log.debug("selected.surface : \n" + angular.toJson($scope.selected.surface.IDENTIFIANT.OBJECTIF));
                            // will dead loop, should be renamed init selected surface.
                            //setSelectedSurface($scope.selected.surface.ID_G,$scope.selected.surface.Id)
                            if ($scope.selected.surface) {
                                var selectedParentIds = hbUtil.getIdentifiersFromStandardSourceURI($scope.selected.surface.SOURCE);
                                // Also manages $scope.selected.initialised state
                                setSelectedBuilding(selectedParentIds.ID_G, selectedParentIds.Id);
                            } else {
                                $log.debug("no $scope.selected.surface available yet...");
                                // Reset
                                $scope.elfin.IDENTIFIANT.ALIAS = "";
                            }
                        } else {
                            //$log.debug("selected.code : " + angular.toJson($scope.selected.code) + " ... WAITING for initialisation...");
                        }
                    }, true);

                    $scope.$watch('selected.code', function () {
                        if ($scope.selected.initialised === true) {
                            // TODO: Review hb-typeahead-code implementation to expose only valid code object
                            // the kind of verifications performed hereafter should be encapsulated within the
                            // directives (typehead or choose).
                            if ($scope.selected.code !== null && $scope.selected.code !== undefined) {
                                //$log.debug("selected.code : " + angular.toJson($scope.selected.code));
                                $scope.elfin.GROUPE = $scope.selected.code.IDENTIFIANT.NOM;
                            } else {
                                //$log.debug("selected.code has been reset... ");
                                $scope.elfin.GROUPE = "";
                            }
                        } else {
                            //$log.debug("selected.code : " + angular.toJson($scope.selected.code) + " ... WAITING for initialisation...");
                        }
                    }, true);

                    $scope.$watch('selected.provider', function () {
                        if ($scope.selected.initialised === true) {
                            if ($scope.selected.provider) {
                                //$log.debug("provider : " + angular.toJson($scope.selected.provider));
                                $scope.elfin.PARTENAIRE.FOURNISSEUR = {
                                    "Id": $scope.selected.provider.Id,
                                    "ID_G": $scope.selected.provider.ID_G,
                                    "NOM": "",
                                    "GROUPE": $scope.selected.provider.GROUPE,
                                    "VALUE": ""
                                };

                                // Updating $scope.selected.provider model from hbChooseOne controller is not
                                // visible to the view model thus requires manual update.
                                // This is necessary when the validity state has been set to invalid using
                                // typeahead manual typing, then solving selection through hbChooseOne selection.
                                // The latter selection will not be noticed by the view model and thus not reset
                                // the field validity state correctly.
                                // Note: above behaviour not currently implemented as hbChooseOne is not used.
                                //$scope.elfinForm.fournisseur.$setValidity('editable', true);

                                if ($scope.validate) {
                                    if ($scope.selected.provider.Id !== "") {
                                        $scope.elfinForm.fournisseur.$setValidity('required', true);
                                        //$scope.elfinForm.fournisseur.$setValidity('editable', true);
                                    } else {
                                        $scope.elfinForm.fournisseur.$setValidity('required', false);
                                        //$scope.elfinForm.fournisseur.$setValidity('editable', false);
                                    }
                                }
                            } else {
                                $log.debug("provider has been reset... ");
                                $scope.elfin.PARTENAIRE.FOURNISSEUR = {
                                    "Id": "",
                                    "ID_G": "",
                                    "NOM": "",
                                    "GROUPE": "",
                                    "VALUE": ""
                                };

                                if ($scope.validate) {
                                    $scope.elfinForm.fournisseur.$setValidity('required', false);
                                }
                            }
                        } else {
                            $log.debug("provider : " + angular.toJson($scope.selected.provider) + " ... WAITING for initialisation...");
                        }
                    }, true);


                    // Select all IMMEUBLE
                    var xpathForImmeubles = "//ELFIN[@CLASSE='IMMEUBLE']";
                    // Asychronous buildings preloading
                    hbQueryService.getImmeubles(xpathForImmeubles)
                        .then(
                            function (immeubles) {
                                $scope.immeubles = immeubles;
                                $log.debug(">>> IMMEUBLES: " + immeubles.length);
                            },
                            function (response) {
                                var message = "Le chargement de la liste IMMEUBLE a échoué (statut de retour: "
                                    + response.status
                                    + ")";
                                hbAlertMessages.addAlert("danger", message);
                            }
                        );


                    // Select all CODE where GROUPE = 'CFC'
                    var xpathForCfcCodes = "//ELFIN[@CLASSE='CODE' and @GROUPE='CFC']";
                    // Asychronous buildings preloading
                    hbQueryService.getCodes(xpathForCfcCodes)
                        .then(
                            function (cfcCodes) {
                                $scope.cfcCodes = _.sortBy(cfcCodes, function (cfcCode) {
                                    return cfcCode.CARACTERISTIQUE["CAR1"]["VALEUR"]
                                });
                                $log.debug(">>> CODES.CFC: " + cfcCodes.length);
                            },
                            function (response) {
                                var message = "Le chargement de la liste de CODE CFC a échoué (statut de retour: "
                                    + response.status
                                    + ")";
                                hbAlertMessages.addAlert("danger", message);
                            }
                        );


                    /**
                     * Updates elfin parameter `CARACTERISTIQUE.CAR5.VALEUR` with computed contract number.
                     * It requires elfin.IDENTIFIANT.OBJECTIF, elfin.IDENTIFIANT.DE.slice(4), elfin.Id to be set.
                     */
                    var setContractNumber = function (elfin) {
                        // Avoid to set a new contract number when the contract is in read-only mode
                        if (hasReadOnlyStatus()) {
                            return;
                        }

                        var saiNb = elfin.IDENTIFIANT.OBJECTIF;
                        var year = elfin.IDENTIFIANT.DE.slice(0, 4);
                        var orderId = elfin.Id;
                        hbQueryService.getJsonNbOfContracts(saiNb, year, orderId).then(function (currentContractNb) {
                            // Increment current nb of contracts
                            var nextContractNb = parseInt(currentContractNb) + 1;
                            // Pad next contract number on two digits with leading zero.
                            var nextContractNbPaddedString = ("00" + nextContractNb).slice(-2);
                            // Build full contract number
                            elfin.CARACTERISTIQUE["CAR5"]["VALEUR"] = saiNb + "_" + year + "_" + nextContractNbPaddedString;
                        }, function (response) {
                            var errorMessage = "Error with status code " + response.status + " while getting JSON NbOfContracts.";
                            $log.error(errorMessage);
                            hbAlertMessages.addAlert("danger", "Le nombre de contrats existant n'a pas pu être déterminé.");
                        });
                    };

                    var resetContractNumber = function (elfin) {
                        // Reset contract number to ""
                        elfin.CARACTERISTIQUE["CAR5"]["VALEUR"] = "";
                    };


                    $scope.$watch('elfin.IDENTIFIANT.QUALITE', function (newQualite) {
                        if (newQualite !== null && newQualite !== undefined && newQualite.length > 0) {
                            $log.debug("newQualite : change to: " + newQualite);
                            if (newQualite === HB_ORDER_TYPE.CONTRACT) {
                                setContractNumber($scope.elfin);
                            } else {
                                resetContractNumber($scope.elfin);
                            }
                        } else {
                            $log.debug("newQualite : NULL or length === 0");
                        }
                    }, true);

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
                            $scope.elfin.CARACTERISTIQUE.CARSET.CAR.splice(pos - 1, 0, {"VALEUR": "", "POS": pos});
                            // Link newly created CAR by pos to currentCAR variable
                            currentCAR = hbUtil.getCARByPos($scope.elfin, pos);
                        }
                        return currentCAR;
                    };


                    /**
                     * Perform operations once we are guaranteed to have access to $scope.elfin instance.
                     */
                    $scope.$watch('elfin.Id', function () {

                        if ($scope.elfin !== null) {

                            // Valeur Executive
                            $scope.CARSET_CAR_POS_4 = linkCARByPos(4);
                            // Valeur Signataire
                            $scope.CARSET_CAR_POS_5 = linkCARByPos(5);

                            $scope.loadTransactions();
                            if ($attrs["hbMode"] !== "create") {
                                loadPrestation($scope, $scope.elfin);
                            }

                            updateIsReadOnlyStatus();


                            /**
                             * Delegate CARACTERISTIQUE.CAR data structure
                             * check and extension to hbUtil.checkUpdateOrderCar
                             */
                            hbUtil.checkUpdateOrderCar($scope.elfin);

                            $scope.selected.provider = {
                                "Id": $scope.elfin.PARTENAIRE.FOURNISSEUR.Id,
                                "ID_G": $scope.elfin.PARTENAIRE.FOURNISSEUR.ID_G,
                                "NOM": "",
                                "GROUPE": $scope.elfin.PARTENAIRE.FOURNISSEUR.GROUPE,
                                "VALUE": ""
                            };

                            // Initialise contract/confirmation manager
                            var respActorModelRef = hbUtil.getIdentifiersFromStandardSourceURI($scope.elfin.IDENTIFIANT.RES);
                            if (respActorModelRef === undefined) {
                                $log.debug(">>>> respActorModelRef undefined ! = " + angular.toJson(respActorModelRef));
                                $scope.respActorModel = {Id: undefined, ID_G: "", GROUPE: "", NOM: ""};
                            } else {
                                $log.debug(">>>> respActorModelRef defined !   = " + angular.toJson(respActorModelRef));
                                $scope.respActorModel = {
                                    Id: respActorModelRef.Id,
                                    ID_G: respActorModelRef.ID_G,
                                    GROUPE: "",
                                    NOM: ""
                                };
                            }

                            var signataireActorModelRef = hbUtil.getIdentifiersFromStandardSourceURI($scope.CARSET_CAR_POS_5.VALEUR);
                            if (signataireActorModelRef === undefined) {
                                $log.debug(">>>> signataireActorModelRef undefined ! = " + angular.toJson(signataireActorModelRef));
                                $scope.signataireActorModel = {Id: undefined, ID_G: "", GROUPE: "", NOM: ""};
                            } else {
                                $log.debug(">>>> signataireActorModelRef defined !   = " + angular.toJson(signataireActorModelRef));
                                $scope.signataireActorModel = {
                                    Id: signataireActorModelRef.Id,
                                    ID_G: signataireActorModelRef.ID_G,
                                    GROUPE: "",
                                    NOM: ""
                                };
                            }

                            var executiveActorModelRef = hbUtil.getIdentifiersFromStandardSourceURI($scope.CARSET_CAR_POS_4.VALEUR);
                            if (executiveActorModelRef === undefined) {
                                $log.debug(">>>> executiveActorModelRef undefined ! = " + angular.toJson(executiveActorModelRef));
                                $scope.executiveActorModel = {Id: undefined, ID_G: "", GROUPE: "", NOM: ""};
                            } else {
                                $log.debug(">>>> executiveActorModelRef defined !   = " + angular.toJson(executiveActorModelRef));
                                $scope.executiveActorModel = {
                                    Id: executiveActorModelRef.Id,
                                    ID_G: executiveActorModelRef.ID_G,
                                    GROUPE: "",
                                    NOM: ""
                                };
                            }

                            // Supports create mode and avoids repeating selected.initialised setting
                            var selectedParentIds = hbUtil.getIdentifiersFromStandardSourceURI($scope.elfin.SOURCE);
                            if (selectedParentIds) {
                                if (selectedParentIds.CLASSE === 'IMMEUBLE') {
                                    setSelectedBuilding(selectedParentIds.ID_G, selectedParentIds.Id);
                                } else if (selectedParentIds.CLASSE === 'SURFACE') {
                                    setSelectedSurface(selectedParentIds.ID_G, selectedParentIds.Id);
                                }
                            } else {
                                // If no reference to building exists confirm initialisation is complete.
                                $scope.selected.initialised = true;
                            }
                            // ====================================================================

                            // Update elfin properties from catalog while in create mode
                            if ($attrs["hbMode"] === "create") {

                                if ($scope.elfin) {

                                    // ===================================================
                                    //   Reset catalog default values
                                    // ===================================================

                                    // SAI nb.
                                    $scope.elfin.IDENTIFIANT.OBJECTIF = "";

                                    // Order type
                                    $scope.elfin.IDENTIFIANT.QUALITE = "";

                                    // No construction of source IMMEUBLE
                                    $scope.elfin.IDENTIFIANT.ORIGINE = "";

                                    // CFC code
                                    $scope.elfin.GROUPE = "";

                                    // Default value from catalogue contains repartition list: Reset it.
                                    $scope.elfin.IDENTIFIANT.VALEUR = "";

                                    GeoxmlService.getNewOrderNumber().get().then(function (number) {
                                            // End-user order number.
                                            $scope.elfin.IDENTIFIANT.NOM = number;
                                        },
                                        function (response) {
                                            var message = "Le numéro de commande n'a pas pu être obtenu. (statut de retour: " + response.status + ")";
                                            hbAlertMessages.addAlert("danger", message);
                                        });

                                    // Reset entreprise service provider
                                    $scope.elfin.PARTENAIRE.FOURNISSEUR.Id = "";
                                    $scope.elfin.PARTENAIRE.FOURNISSEUR.ID_G = "";
                                    $scope.elfin.PARTENAIRE.FOURNISSEUR.NOM = "";
                                    $scope.elfin.PARTENAIRE.FOURNISSEUR.GROUPE = "";
                                    $scope.elfin.PARTENAIRE.FOURNISSEUR.VALUE = "";

                                    // Reset building provider
                                    $scope.elfin.PARTENAIRE.PROPRIETAIRE.Id = "";
                                    $scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G = "";
                                    $scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM = "";
                                    $scope.elfin.PARTENAIRE.PROPRIETAIRE.GROUPE = "";
                                    $scope.elfin.PARTENAIRE.PROPRIETAIRE.VALUE = "";

                                    $scope.elfin["DIVERS"]["REMARQUE"] = "";

                                    // ===================================================
                                    //   Initialises default values using parameters
                                    //   if provided
                                    // ===================================================
                                    var currentDate = new Date();
                                    $scope.elfin.IDENTIFIANT.DE = hbUtil.getDateInHbTextFormat(currentDate);
                                    // Current date is not a relevant deadline but helps end-user with data entry
                                    $scope.elfin.IDENTIFIANT.A = hbUtil.getDateInHbTextFormat(currentDate);

                                    // Get user abbreviation from userDetails service
                                    $scope.elfin.IDENTIFIANT.AUT = userDetails.getAbbreviation();

                                    // Initialise selected building using provided IMMEUBLE parameters
                                    if ($routeParams.idg && $routeParams.id) {
                                        if ($routeParams.classe === 'IMMEUBLE') {
                                            $scope.selected.objectsSelectionType = $scope.OBJECTS_SELECTION_TYPE_IMMEUBLE;
                                            setSelectedBuilding($routeParams.idg, $routeParams.id, true);
                                        } else if ($routeParams.classe === 'SURFACE') {
                                            $scope.selected.objectsSelectionType = $scope.OBJECTS_SELECTION_TYPE_SURFACE;
                                            setSelectedSurface($routeParams.idg, $routeParams.id, true);
                                        }
                                    } else {
                                        $scope.selected.objectsSelectionType = $scope.OBJECTS_SELECTION_TYPE_SURFACE;
                                    }

                                } else {
                                    $log.debug("elfin should be available once $watch('elfin.Id') has been triggered.");
                                }
                            } else { // Not in create mode
                                // Check whether the COMMANDE.SOURCE points to a SURFACE or IMMEUBLE
                                if (_.contains($scope.elfin.SOURCE, 'IMMEUBLE')) {
                                    $scope.selected.objectsSelectionType = $scope.OBJECTS_SELECTION_TYPE_IMMEUBLE;
                                } else {
                                    $scope.selected.objectsSelectionType = $scope.OBJECTS_SELECTION_TYPE_SURFACE;
                                }
                            }
                            // end of "Not in create mode" operations

                            // Initialises selected.code from elfin.GROUPE value
                            // Can be useful in create mode if a default group is defined
                            // but requires to be performed after creation initialisation procedure
                            if ($scope.elfin.GROUPE && $scope.elfin.GROUPE.trim().length > 0) {

                                // Select the CODE where GROUPE = 'CFC' and number matches IDENTIFIANT.NOM
                                var xpathForCfcCode = "//ELFIN[@CLASSE='CODE' and @GROUPE='CFC' and IDENTIFIANT/NOM='" + $scope.elfin.GROUPE + "']";
                                // Asychronous buildings preloading
                                hbQueryService.getCodes(xpathForCfcCode)
                                    .then(
                                        function (cfcCodes) {
                                            $log.debug(">>> cfcCodes.length MUST equal 1 : " + cfcCodes.length);
                                            if (cfcCodes.length === 1) {
                                                $scope.selected.code = cfcCodes[0];
                                            } else {
                                                var message = "Le code CFC " + $scope.elfin.GROUPE + " n'est pas valide, veuillez s.v.p. effectuer une sélection parmi les codes existants.";
                                                hbAlertMessages.addAlert("danger", message);
                                            }
                                        },
                                        function (response) {
                                            var message = "La recherche du code CFC " + $scope.elfin.GROUPE + " a échoué (statut de retour: " + response.status + ")";
                                            hbAlertMessages.addAlert("danger", message);
                                        }
                                    );
                            }// end of selected.code init

                        }
                    }, true);

                    // TODO: check if used
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
                    $scope.immeubleChooseOneTemplate = "/assets/views-compiled/_directives/chooseOneImmeuble.html";

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


                    // Parameters to hbChooseOne service function for ACTOR selection
                    //{ field:"CARACTERISTIQUE.CAR1.VALEUR", displayName: "Ordre de tri"},
//					            $scope.codeChooseOneColumnsDefinition = [
//						                        		   		            { field:"IDENTIFIANT.NOM", displayName: "Code CFC"},
//						                        		   		            { field:"DIVERS.REMARQUE", displayName: "Description"}
//						                        		   	 		   		];								
//					            $scope.codeChooseOneTemplate = '/assets/views/chooseOneCode.html';


                    // Parameters to hbChooseOne service function for ACTOR selection
                    $scope.actorChooseOneColumnsDefinition = [
                        {field: "GROUPE", displayName: "Groupe"}
                    ];

                    $scope.collaboratorActorChooseOneColumnsDefinition = [
                        {field: "IDENTIFIANT.NOM", displayName: "Nom"},
                        {field: "IDENTIFIANT.ALIAS", displayName: "Prénom"},
                        {field: "GROUPE", displayName: "Groupe"}
                    ];

                    $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor2.html';


                    // Allow direct call to new TRANSACTION creation without going through menus items.
                    $scope.createNewCommande = function () {
                        var redirUrl = '/elfin/create/COMMANDE';
                        $location.path(redirUrl);
                    };

                    /**
                     * Prints provider purchase order.
                     */
                    $scope.printProviderPurchaseOrderReport = function (elfin) {
                        hbPrintService.getReportOrProvideFeedbackForMissingConfig(
                            elfin,
                            HB_ORDER_REPORT_TYPE.PURCHASE_ORDER_PROVIDER,
                            elfin.PARTENAIRE.PROPRIETAIRE.NOM,
                            undefined,
                            undefined,
                            $scope.isReadOnly ? undefined : "a_valider");
                    };

                    /**
                     * Prints tenant purchase order.
                     */
                    $scope.printTenantPurchaseOrderReport = function (elfin) {
                        hbPrintService.getReportOrProvideFeedbackForMissingConfig(
                            elfin,
                            HB_ORDER_REPORT_TYPE.PURCHASE_ORDER_TENANT,
                            elfin.PARTENAIRE.PROPRIETAIRE.NOM,
                            undefined,
                            undefined,
                            $scope.isReadOnly ? undefined : "a_valider");
                    };

                    /**
                     * Prints entreprise contract with General Conditions.
                     */
                    $scope.printEntrepriseContractAnnexesReport = function (elfin) {
                        hbPrintService.getReportAnnexesOnlyOrProvideFeedbackForMissingConfig(
                            elfin,
                            HB_ORDER_REPORT_TYPE.CONTRACT,
                            elfin.PARTENAIRE.PROPRIETAIRE.NOM,
                            elfin.CARACTERISTIQUE["CAR5"]["VALEUR"],
                            undefined,
                            $scope.isReadOnly ? undefined : "a_valider", "file");
                    };



                    /**
                     * Prints entreprise contract without General Conditions.
                     */
                    $scope.printEntrepriseContractReport = function (elfin) {
                        hbPrintService.getReportAnnexesOnlyOrProvideFeedbackForMissingConfig(
                            elfin,
                            HB_ORDER_REPORT_TYPE.CONTRACT_WO_GC,
                            elfin.PARTENAIRE.PROPRIETAIRE.NOM,
                            elfin.CARACTERISTIQUE["CAR5"]["VALEUR"],
                            undefined,
                            $scope.isReadOnly ? undefined : "a_valider", "command");
                    };

                    /**
                     * TEst PYS impression vers Excel.
                     */
                    $scope.printContractReportExcel = function (elfin) {
                        var reportModel = elfin.IDENTIFIANT.QUALITE === HB_ORDER_TYPE.CONTRACT ?
                            "Commande-Modele-contrat.xls" : "Commande-Modele-confirmation.xls";

                        var reportUrl = "/api/melfin/spreadsheet/" + reportModel + "?Id=" + elfin.Id;
                        $window.open(reportUrl);
                    };

                    /**
                     * Prints enterprise contract accompanying letter
                     */
                    $scope.printEntrepriseContractLetter = function (letterType, elfin) {
                        var reportUrl = "/api/melfin/document/" + letterType + "_Contrat.docx" + "?Id=" + elfin.Id;
                        $window.open(reportUrl);
                    };

                    /**
                     * Prints order confirmation.
                     */
                    $scope.printOrderConfirmationReport = function (elfin) {
                        hbPrintService.getReportAnnexesOnlyOrProvideFeedbackForMissingConfig(
                            elfin,
                            HB_ORDER_REPORT_TYPE.ORDER_CONFIRMATION,
                            elfin.PARTENAIRE.PROPRIETAIRE.NOM,
                            undefined,
                            undefined,
                            $scope.isReadOnly ? undefined : "a_valider", "command");
                    };


                    // Set focus to building (orderNb is automatically set and should not be changed)
                    var focusOnField = function () {
                        $('#building').focus();
                    };

                    // Call set focus to orderNb with a 500 ms delay.
                    $timeout(focusOnField, 500, false);


                }]);

})();
