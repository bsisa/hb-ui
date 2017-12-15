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

                    $scope.prestationSelection = false;


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

                    $scope.commandesContrats = [];
                    $scope.commandeReverse = false;
                    $scope.commandePredicate = "IDENTIFIANT.NOM";

                    var loadCommandesContrats = function ($scope) {
                        if (!!$scope.elfin.FILIATION && !!$scope.elfin.FILIATION.PARENT) {
                            $scope.commandesContrats.length = 0;

                            _.forEach($scope.elfin.FILIATION.PARENT, function (parent) {
                                if (parent.CLASSE === "COMMANDE") {
                                    GeoxmlService.getElfin(parent.ID_G, parent.Id).get().then(
                                        function (parent) {
                                            $scope.commandesContrats.push(parent);
                                        },
                                        function (response) {
                                            var message = "Le chargement de la COMMANDE correspondant aux informations: ID_G / Id = " + ID_G + " / " + Id + " a échoué (statut de retour: " + response.status + ")";
                                            hbAlertMessages.addAlert("danger", message);
                                        });
                                }
                            });
                        }
                    };


                    $scope.allocateCommand = function () {
                        var source = $scope.selectedImmeuble.ID_G + "/" + $scope.selectedImmeuble.CLASSE + "/" + $scope.selectedImmeuble.Id;
                        var commandeSourceXpath = "//ELFIN[@SOURCE='" + source + "' and @CLASSE='COMMANDE']";

                        hbQueryService.getCommandes(commandeSourceXpath).then(
                            function (commandes) {
                                $scope.selectOneCommande(
                                    commandes,
                                    "IDENTIFIANT.NOM",
                                    $scope.selectOneCommandeColumnsDefinition,
                                    $scope.selectOneCommandeTemplate
                                );
                            },
                            function (response) {
                                var message = "L'obtention des COMMANDES pour la source: " + commandeSourceXpath + " a échoué. (statut: "
                                    + response.status
                                    + ")";
                                hbAlertMessages.addAlert("danger", message);
                            }
                        );
                    };

                    // Parameters to selectOnePrestation function for PRESTATION selection
                    $scope.selectOneCommandeColumnsDefinition = [
                        {field: "IDENTIFIANT.NOM", displayName: "No"},
                        {field: "IDENTIFIANT.QUALITE", displayName: "Type"},
                        {field: "PARTENAIRE.FOURNISSEUR.GROUPE", displayName: "Fournisseur"},
                        {field: "IDENTIFIANT.DE", displayName: "Date"},
                        {field: "IDENTIFIANT.A", displayName: "Délai"}
                    ];

                    $scope.selectOneCommandeTemplate = '/assets/views-compiled/_directives/chooseOneCommande.html';

                    $scope.selectOneCommande = function (elfins, sourcePath, columnsDefinition, template) {

                        $log.debug(">>>> selectOneCommande = " + elfins.length);

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

                                if (!$scope.elfin.FILIATION) {
                                    $scope.elfin.FILIATION = {PARENT: []};
                                }
                                _.forEach(selectedElfins, function (elfin) {
                                    $scope.elfin.FILIATION.PARENT.push({
                                        ID_G: elfin.ID_G,
                                        Id: elfin.Id,
                                        CLASSE: elfin.CLASSE,
                                        REMARQUE: "",
                                        PROPRIETE: []
                                    });
                                    $scope.commandesContrats.push(elfin);
                                });
                                $scope.elfinForm.$setDirty();
                            } else {
                                $log.debug("No selection returned!!!");
                            }

                        }, function () {
                            $log.debug('Choose params modal dismissed at: ' + new Date());
                        });
                    };

                    var findFirstIndexCommandeInFiliation = function (commande, parentArray) {
                        if (parentArray.length === 0) {
                            return -1;
                        }
                        for (var i = 0; i < parentArray.length; i++) {
                            if (parentArray[i].Id === commande.Id &&
                                parentArray[i].ID_G === commande.ID_G &&
                                parentArray[i].CLASSE === commande.CLASSE) {
                                return i;
                            }
                        }
                        return -1;
                    };

                    $scope.removeCommande = function (commande) {
                        var index = $scope.commandesContrats.indexOf(commande);
                        while (index !== -1) {
                            $scope.commandesContrats.splice(index, 1);
                            index = $scope.commandesContrats.indexOf(commande);
                        }
                        index = findFirstIndexCommandeInFiliation(commande, $scope.elfin.FILIATION.PARENT);
                        while (index !== -1) {
                            $scope.elfin.FILIATION.PARENT.splice(index, 1);
                            index = findFirstIndexCommandeInFiliation(commande, $scope.elfin.FILIATION.PARENT);
                        }
                        $scope.elfinForm.$setDirty();
                    };


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
                    $scope.reallocateTransaction = function (prestationXpath) {

                        var xpathForPrestationBySOURCE = prestationXpath ||
                            // "//ELFIN[@SOURCE='" + $scope.sourcePrestation.SOURCE + "' and @ID_G='" + $scope.sourcePrestation.ID_G + "' and @CLASSE='" + $scope.sourcePrestation.CLASSE + "']";
                            "//ELFIN[@ID_G='" + $scope.sourcePrestation.ID_G + "' and @CLASSE='" + $scope.sourcePrestation.CLASSE + "']";

                        hbQueryService.getPrestations(xpathForPrestationBySOURCE).then(
                            function (prestations) {
                                $scope.selectOnePrestation(
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
                    $scope.selectOnePrestation = function (elfins, sourcePath, columnsDefinition, template) {

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

                                // Update helper fields
                                $scope.searchOwner = {
                                    Id: $scope.sourcePrestation.PARTENAIRE.PROPRIETAIRE.Id,
                                    ID_G: $scope.sourcePrestation.PARTENAIRE.PROPRIETAIRE.ID_G,
                                    GROUPE: $scope.sourcePrestation.PARTENAIRE.PROPRIETAIRE.GROUPE,
                                    NOM: $scope.sourcePrestation.PARTENAIRE.PROPRIETAIRE.NOM
                                };
                                $scope.helper.constatSelectionSai = $scope.sourcePrestation.IDENTIFIANT.OBJECTIF.split('.')[0];
                                // Groupe prestation
                                $scope.elfin.CARACTERISTIQUE.CAR1.UNITE = $scope.sourcePrestation.GROUPE;
                                // Year prestation
                                $scope.elfin.IDENTIFIANT.PAR = $scope.sourcePrestation.IDENTIFIANT.DE;

                                $scope.elfinForm.$setDirty();
                            } else {
                                $log.debug("No selection returned!!!");
                            }

                        }, function () {
                            $log.debug('Choose params modal dismissed at: ' + new Date());
                        });
                    };


                    // Benefit from server side cache...
                    var xpathForImmeubles = "//ELFIN[@CLASSE='IMMEUBLE']";

                    // Parameters to selectOnePrestation function for PRESTATION selection
                    $scope.selectOneImmeubleColumnsDefinition = [
                        {field: "IDENTIFIANT.NOM", displayName: "No Construction"},
                        {field: "IDENTIFIANT.ALIAS", displayName: "Adresse"},
                        {field: "CARSET_CAR_POS_2.VALEUR", displayName: "No AbaImmo"}
                    ];

                    $scope.selectOneImmeubleTemplate = '/assets/views/chooseOneImmeuble.html';


                    // Allow triggering reallocate mode to allow editing of sensitive fields.
                    $scope.allocateImmeuble = function () {

                        hbQueryService.getImmeubles(xpathForImmeubles).then(
                            function (immeubles) {
                                _.forEach(immeubles, function (immeuble) {
                                    immeuble.CARSET_CAR_POS_2 = hbUtil.getCARByPos(immeuble, 2);
                                });

                                $scope.selectImmeubleAndPrestation(
                                    immeubles,
                                    "IDENTIFIANT.ALIAS",
                                    $scope.selectOneImmeubleColumnsDefinition,
                                    $scope.selectOneImmeubleTemplate
                                );
                            },
                            function (response) {
                                var message = "L'obtention des IMMEUBLES pour la source: " + xpathForImmeubles + " a échoué. (statut: "
                                    + response.status
                                    + ")";
                                hbAlertMessages.addAlert("danger", message);
                                $scope.searchOwner = {Id: "", ID_G: "", GROUPE: "", NOM: ""};
                            }
                        );

                    };

                    $scope.selectImmeubleAndPrestation = function (elfins, sourcePath, columnsDefinition, template) {


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
                                $scope.selectedImmeuble = selectedElfins[0];
                                var source = $scope.selectedImmeuble.ID_G + "/" + $scope.selectedImmeuble.CLASSE + "/" + $scope.selectedImmeuble.Id;
                                var prestationSourceXpath = "//ELFIN[@SOURCE='" + source + "' and @CLASSE='PRESTATION']";
                                $scope.sourceAbaImmo = $scope.selectedImmeuble.CARSET_CAR_POS_2.VALEUR;
                                $scope.reallocateTransaction(prestationSourceXpath);

                            } else {
                                $log.debug("No selection returned!!!");
                                $scope.allocateImmeuble();
                            }

                        }, function () {
                            $log.debug('Choose params modal dismissed at: ' + new Date());
                            $scope.allocateImmeuble();
                        });
                    };


                    $scope.$watch("elfin.CARACTERISTIQUE.CAR1.UNITE", function(newValue) {
                        if (!$scope.elfin) {
                            return;
                        }
                        if (newValue === "Fonctionnement") {
                            $scope.transactionTypes = [
                                { name: "Petite réparation", value: "Petite réparation" },
                                { name: "Frais fixe", value: "Frais fixe" }
                                ];
                        } else if (!!$scope.transactionTemplate) {
                            $scope.transactionTypes = [{name: newValue, value: newValue}];
                            $scope.elfin.GROUPE = newValue;
                        }
                    });


                    $scope.sourceAbaImmo = "";
                    $scope.sourcePrestation = null;

                    $scope.loadSourceElfin = function (sourceAttr) {
                        if (angular.isString(sourceAttr)) {
                            var prestationAttrComponents = sourceAttr.split("/");
                            var prestationSourceIDG = prestationAttrComponents[0];
                            var prestationSourceId = prestationAttrComponents[2];
                            if (prestationSourceIDG && prestationSourceId) {
                                GeoxmlService.getElfin(prestationSourceIDG, prestationSourceId).get()
                                    .then(
                                        function (prestationElfin) {
                                            $scope.sourcePrestation = prestationElfin;
                                            $scope.loadSourceImmeuble(prestationElfin);
                                        },
                                        function (response) {
                                            $scope.sourceAbaImmo = "";
                                            $scope.sourcePrestation = null;
                                            var message = "Le chargement de la Prestation source a échoué (statut de retour: " + response.status + ")";
                                            hbAlertMessages.addAlert("danger", message);
                                        });
                            }
                        }
                    };

                    $scope.loadSourceImmeuble = function (prestationElfin) {

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
                                $scope.elfin.IDENTIFIANT.DE = hbUtil.getDateInHbTextFormat(currentDate);
                                $scope.elfin.IDENTIFIANT.PAR = currentDate.getFullYear().toString();

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
                                            hbAlertMessages.addAlert("danger", message);
                                            $scope.searchOwner = {Id: "", ID_G: "", GROUPE: "", NOM: ""};
                                        });
                                } else {
                                    $scope.searchOwner = {Id: "", ID_G: "", GROUPE: "", NOM: ""};
                                    $scope.allocateImmeuble();
                                }
                            } else {
                                loadCommandesContrats($scope);
                                $scope.loadSourceElfin($scope.elfin.SOURCE);
                                // Manage editing initialisation. Warning: $scope.elfin.PARTENAIRE.PROPRIETAIRE is not equal to the owner for TRANSACTION entities.
                                $scope.searchOwner = undefined;
                            }
                        }
                    }, true);

                    $scope.transactionTemplate = null;
                    // Asychronous TRANSACTION template preloading
                    GeoxmlService.getNewElfin("TRANSACTION").get().then(
                        function (transaction) {
                            $scope.transactionTemplate = transaction;
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
                    // $timeout(focusOnField, 500, true);


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


                }]);

})();
