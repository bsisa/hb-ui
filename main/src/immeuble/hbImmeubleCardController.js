(function () {

    angular
        .module('hb5')

        .controller(
            'HbImmeubleCardController',
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
                '$filter',
                '$locale',
                'hbAlertMessages',
                'hbUtil',
                'hbQueryService',
                'userDetails',
                'HB_EVENTS',
                'HB_ORDER_TYPE',
                'HB_API',
                'HB_ROLE_FONCTION',
                'hbTabCacheService',
                function ($attrs, $scope, $rootScope, GeoxmlService, $modal,
                          $routeParams, $location, $log, $timeout, $filter, $locale, hbAlertMessages,
                          hbUtil, hbQueryService, userDetails, HB_EVENTS, HB_ORDER_TYPE, HB_API, HB_ROLE_FONCTION, hbTabCacheService) {

                    //$log.debug("    >>>> Using HbImmeubleCardController with $locale.id = " + $locale.id);

                    // ================= Tab state management - start =============
                    /**
                     * Check parent controller and hbTabStateService for complete overview.
                     */
                    var cachedTab = hbTabCacheService.getTabState($location.absUrl());

                    // Expose order type constants to scope
                    $scope.HB_ORDER_TYPE = HB_ORDER_TYPE;

                    /** Create tabState object if not already available in cache,
                     */
                    if (cachedTab === undefined) {
                        $scope.tabState = {
                            "immeuble": {"active": true},
                            "unite_locative": {"active": false},
                            "unite_locative_subtab_current.active": {"active": false},
                            "unite_locative_subtab_archived.active": {"active": false},
                            "prestation": {"active": false},
                            "prestation_subtab_annee_moins1": {"active": true},
                            "prestation_subtab_annee_plus1": {"active": false},
                            "prestation_subtab_toutes": {"active": false},
                            "commande": {"active": false},
                            "commande_subtab_ouvertes": {"active": false},
                            "commande_subtab_closes": {"active": false},
                            "commande_subtab_toutes": {"active": false},
                            "contrat": {"active": false},
                            "contrat_subtab_actifs": {"active": true},
                            "contrat_subtab_denonces": {"active": false},
                            "contrat_subtab_tous": {"active": false},
                            "caracteristique": {"active": false},
                            "valeur": {"active": false},
                            "equipements_tech": {"active": false},
                            "equipements_tech_subtab_prod_chaleur": {"active": true},
                            "equipements_tech_subtab_prod_froid": {"active": false},
                            "equipements_tech_subtab_ventilation": {"active": false},
                            "equipements_tech_subtab_citerne": {"active": false},
                            "equipements_tech_subtab_intro_elec": {"active": false},
                            "equipements_tech_subtab_equipement": {"active": false},
                            "forme": {"active": false},
                            "annexe": {"active": false}
                        };
                    } else {
                        $scope.tabState = cachedTab;
                    }
                    /**
                     * Link to $parent scope tabState reference.
                     */
                    $scope.$parent.tabState = $scope.tabState;
                    // ================= Tab state management - end ===============

                    // Expression used by ng-pattern for numeric only validation.
                    $scope.numericOnlyRegexp = /^\d*\.?\d*$/;

                    $scope.annexeFileSystemUri = "";

                    // Expose current hbMode in scope for use by ng-show in HTML view.
                    $scope.createMode = ($attrs["hbMode"] === "create");
                    // Manage FONCTION level access rights
                    $scope.canEdit = ($scope.createMode || _.contains(userDetails.getRoles(), HB_ROLE_FONCTION.BUILDING_EDIT));
                    $scope.canEditParteners = ($scope.createMode || $scope.canEdit || _.contains(userDetails.getRoles(), HB_ROLE_FONCTION.BUILDING_EDIT_OTHER_PARTNERS));
                    $scope.canManageOrders = _.contains(userDetails.getRoles(), HB_ROLE_FONCTION.ORDERS_STATISTICS);

                    $scope.commandes = null;
                    $scope.constatsEncours = null;
                    $scope.constatsEncours_2ans = null;
                    $scope.constatsClos = null;
                    $scope.prestations = null;

                    // Arrays containing lists of technical equipment related CLASSE.
                    $scope.productionChaleurList = [];
                    $scope.productionFroidList = [];
                    $scope.ventilationList = [];
                    $scope.citerneList = [];
                    $scope.introductionElectriciteList = null;
                    $scope.equipementList = null;

                    var computeEquipementsCount = function () {
                        $scope.equipementsCount = ($scope.productionChaleurList.length + $scope.productionFroidList.length + $scope.ventilationList.length + $scope.citerneList.length);
                    };

                    // Current time in text format
                    var currentHbTextDate = function () {
                        return hbUtil.getDateInHbTextFormat(new Date())
                    };

                    computeEquipementsCount();

                    var currentYear = moment().year();
                    var lastYear = currentYear - 1;
                    var nextYear = currentYear + 1;
                    $scope.currentYearAndFormerPrestationSearch = {
                        "group": "",
                        "origin": "",
                        "account": "",
                        "goal": "",
                        "from": lastYear + "|" + currentYear,
                        "replacementValue": "",
                        "manager": "",
                        "owner": "",
                        "remark": ""
                    };
                    $scope.nextYearPrestationSearch = {
                        "group": "",
                        "origin": "",
                        "account": "",
                        "goal": "",
                        "from": nextYear.toString(),
                        "replacementValue": "",
                        "manager": "",
                        "owner": "",
                        "remark": ""
                    };

                    $scope.locationUnits = null;

                    $scope.locUnitPredicate = 'IDENTIFIANT.DE';
                    $scope.locUnitReverse = true;

                    $scope.locationUnitsArchived = null;

                    $scope.locUnitArchivedPredicate = 'IDENTIFIANT.DE';
                    $scope.locUnitArchivedReverse = true;


                    //$scope.prestaPredicate = 'IDENTIFIANT.DE';
                    $scope.prestaPredicate = ['-IDENTIFIANT.DE', 'GROUPE', 'DIVERS.REMARQUE'];
                    //$scope.prestaReverse = true;

                    $scope.contractPredicate = 'PARTENAIRE.FOURNISSEUR.VALUE';
                    $scope.contractReverse = false;

                    $scope.commandPredicate = 'IDENTIFIANT.DE';
                    $scope.commandReverse = true;


                    $scope.createNewCommande = function () {
                        if ($attrs["hbMode"] !== "create") {
                            // Added id,classe,idg for generic link to creation source/parent prototype.
                            var searchObj = {
                                nocons: $scope.elfin.IDENTIFIANT.NOM,
                                sai: $scope.elfin.IDENTIFIANT.OBJECTIF,
                                id: $scope.elfin.Id,
                                classe: $scope.elfin.CLASSE,
                                idg: $scope.elfin.ID_G
                            };
                            $location.search(searchObj).path("/elfin/create/COMMANDE");
                        }
                    };

                    /**
                     * Triggers a redirection to the CONSTAT creation URL with current
                     * IMMEUBLE building number and SAI number passed as parameters.
                     * Must not be effective while in create mode (no association is
                     * relevant while the IMMEUBLE creation is ongoing/pending.)
                     */
                    $scope.createNewConstat = function () {
                        if ($attrs["hbMode"] !== "create") {
                            // Added id,classe,idg for generic link to creation source/parent prototype - done for SDS.
                            var searchObj = {
                                nocons: $scope.elfin.IDENTIFIANT.NOM,
                                sai: $scope.elfin.IDENTIFIANT.OBJECTIF,
                                id: $scope.elfin.Id,
                                classe: $scope.elfin.CLASSE,
                                idg: $scope.elfin.ID_G
                            };
                            $location.search(searchObj).path("/elfin/create/CONSTAT");
                        }
                    };

                    /**
                     * Triggers a redirection to the PRODUCTION_CHALEUR creation URL with current
                     * IMMEUBLE building number and SAI number passed as parameters.
                     * Must not be effective while in create mode (no association is
                     * relevant while the IMMEUBLE creation is ongoing/pending.)
                     */
                    $scope.createNewProductionChaleur = function () {
                        if ($attrs["hbMode"] !== "create") {
                            var searchObj = {idg: $scope.elfin.ID_G, id: $scope.elfin.Id};
                            $location.search(searchObj).path("/elfin/create/PRODUCTION_CHALEUR");
                        }
                    };

                    $scope.createNewProductionFroid = function () {
                        if ($attrs["hbMode"] !== "create") {
                            var searchObj = {idg: $scope.elfin.ID_G, id: $scope.elfin.Id};
                            $location.search(searchObj).path("/elfin/create/PRODUCTION_FROID");
                        }
                    };

                    $scope.createNewVentilation = function () {
                        if ($attrs["hbMode"] !== "create") {
                            var searchObj = {idg: $scope.elfin.ID_G, id: $scope.elfin.Id};
                            $location.search(searchObj).path("/elfin/create/VENTILATION");
                        }
                    };

                    $scope.createNewCiterne = function () {
                        if ($attrs["hbMode"] !== "create") {
                            var searchObj = {idg: $scope.elfin.ID_G, id: $scope.elfin.Id};
                            $location.search(searchObj).path("/elfin/create/CITERNE");
                        }
                    };

                    /**
                     * Triggers a redirection to the PRESTATION creation URL with current
                     * IMMEUBLE Id and ID_G passed as parameters.
                     * Must not be effective while in create mode (no association is
                     * relevant while the IMMEUBLE creation is ongoing/pending.)
                     */
                    $scope.createNewPrestation = function () {
                        if ($attrs["hbMode"] !== "create") {
                            var searchObj = {Id: $scope.elfin.Id, classe: $scope.elfin.CLASSE, ID_G: $scope.elfin.ID_G};
                            $location.search(searchObj).path("/elfin/create/PRESTATION");
                        }
                    };


                    /**
                     * Triggers a redirection to the CONTRAT creation URL with current
                     * IMMEUBLE SAI number passed as parameter.
                     * Must not be effective while in create mode (no association is
                     * relevant while the IMMEUBLE creation is ongoing/pending.)
                     */
                    $scope.createNewContract = function () {
                        if ($attrs["hbMode"] !== "create") {
                            //var searchObj = {sai: $scope.elfin.IDENTIFIANT.OBJECTIF}
                            var searchObj = {
                                nocons: $scope.elfin.IDENTIFIANT.NOM,
                                sai: $scope.elfin.IDENTIFIANT.OBJECTIF,
                                id: $scope.elfin.Id,
                                classe: $scope.elfin.CLASSE,
                                idg: $scope.elfin.ID_G
                            };
                            $location.search(searchObj).path("/elfin/create/CONTRAT");
                        }
                    };


                    /**
                     * Triggers a redirection to the SURFACE (=> UNITA_LOCATIVE) creation URL with current
                     * IMMEUBLE SAI number and NAME passed as parameters.
                     * Must not be effective while in create mode (no association is
                     * relevant while the IMMEUBLE creation is ongoing/pending.)
                     *
                     * /elfin/create/SURFACE?nocons={{elfin.IDENTIFIANT.NOM}}&sai={{elfin.IDENTIFIANT.OBJECTIF}}
                     */
                    $scope.createNewUniteLocative = function () {
                        if ($attrs["hbMode"] !== "create") {
                            var searchObj = {ORIGINE: $scope.elfin.Id};
                            $location.search(searchObj).path("/elfin/create/SURFACE");
                        }
                    };


                    $scope.loadConstats = function (xpath, scopeTarget) {
                        hbQueryService.getConstats(xpath)
                            .then(function (elfins) {
                                    $scope[scopeTarget] = elfins;
                                },
                                function (response) {
                                    var message = "Le chargement des CONSTATs '" + scopeTarget + "' a échoué (statut de retour: " + response.status + ")";
                                    hbAlertMessages.addAlert("danger", message);
                                });
                    };

                    var constats2YearsLimit = function (constat, after) {
                        if (constat.ACTIVITE && constat.ACTIVITE.EVENEMENT && constat.ACTIVITE.EVENEMENT.ECHEANCE.length) {
                            var date = moment(constat.ACTIVITE.EVENEMENT.ECHEANCE[constat.ACTIVITE.EVENEMENT.ECHEANCE.length - 1].E_DATE);
                            var in2Years = moment();
                            return after === date.isAfter(in2Years);
                        }
                        return !after;
                    };

                    $scope.constatsWithin2Years = function (constat) {
                        return constats2YearsLimit(constat, false);
                    };

                    $scope.constatsAfter2Years = function (constat) {
                        return constats2YearsLimit(constat, true);
                    };

                    var getXpathForConstatsEnCours = function (elfin) {
                        return "//ELFIN[IDENTIFIANT/COMPTE='" + elfin.IDENTIFIANT.NOM + "'][not(IDENTIFIANT/A) or IDENTIFIANT/A='']";
                    };

                    var getXpathForConstatsClos = function (elfin) {
                        return "//ELFIN[IDENTIFIANT/COMPTE='" + elfin.IDENTIFIANT.NOM + "'][(IDENTIFIANT/A) and not(IDENTIFIANT/A='')]";
                    };

                    /**
                     * Listener used to load CONSTAT list related to this IMMEUBLE
                     * Only relevant while not in create mode.
                     */
                    $scope.$watch('elfin.IDENTIFIANT.NOM', function () {

                        if (!!$scope.elfin && $attrs["hbMode"] !== "create") {
                            var xpathForConstatsEncours = getXpathForConstatsEnCours($scope.elfin);
                            $scope.loadConstats(xpathForConstatsEncours, "constatsEncours");

                            var xpathForConstatsClos = getXpathForConstatsClos($scope.elfin);
                            $scope.loadConstats(xpathForConstatsClos, "constatsClos");
                        }
                    }, true);


                    /**
                     * Calculates automatically the price/m3 when the vlaue or the volume changes
                     */
                    $scope.$watchCollection('[elfin.CARACTERISTIQUE.CAR5.VALEUR, CARSET_CAR_POS_5.VALEUR]', function (newValues, oldValues, scope) {
                        if (!!scope.elfin
                            && !!scope.CARSET_CAR_POS_5
                            && !!scope.CARSET_CAR_POS_12
                            && (scope.$parent.elfinForm['ecapVolume'].$dirty || scope.$parent.elfinForm['ecapValue'].$dirty)
                        ) {
                            var volume = parseFloat(scope.elfin.CARACTERISTIQUE.CAR5.VALEUR || "1");
                            var price = parseFloat(scope.CARSET_CAR_POS_5.VALEUR || "0");
                            scope.CARSET_CAR_POS_12.VALEUR = "" + (Math.round(100 * price / volume) / 100);
                            scope.$parent.elfinForm['ecapVolumePrice'].$dirty = true;
                        }
                    });

                    $scope.loadPrestations = function (xpathForPrestations, xpathForTransactionFn, target) {
                        target = target || "prestations";
                        hbQueryService.getPrestations(xpathForPrestations)
                            .then(function (elfins) {
                                    $scope[target] = elfins;

                                    var prestationsBySource = {};
                                    _.each(elfins, function (elfin) {
                                        var source = elfin.ID_G + "/" + elfin.CLASSE + "/" + elfin.Id;
                                        prestationsBySource[source] = elfin;
                                    });


                                    var filteredPrestations = $filter('prestationListFilter')($scope.prestations, $scope.currentYearAndFormerPrestationSearch, true);

                                    if (!!xpathForTransactionFn) {
                                        // Store transactions for current year and previous year prestations.
                                        $scope.transactions = [];
                                        for (var i = 0; i < filteredPrestations.length; i++) {
                                            var currPrestation = filteredPrestations[i];
                                            var xpathForTransactions = xpathForTransactionFn(currPrestation);
                                            hbQueryService.getTransactions(xpathForTransactions)
                                                .then(function (transactionElfins) {
                                                        // Kept following filter use as reminder for controller side usage.
                                                        // var transactionElfinsMap = $filter('map')(transactionElfins,'IDENTIFIANT.VALEUR');
                                                        // var transactionElfinsSum = $filter('sum')(transactionElfinsMap);
                                                        // Currently the exact same computation is performed in hbImmeubleCard.html view as:
                                                        // {{transactions | filter:{ IDENTIFIANT_OBJECTIF : prestation.IDENTIFIANT.OBJECTIF }:true | map: 'IDENTIFIANT.VALEUR' | sum  | currency:'CHF' }}

                                                        // Manually flatten $scope.transactions
                                                        for (var j = 0; j < transactionElfins.length; j++) {
                                                            var currTrans = transactionElfins[j];
                                                            // Add single depth property copy of OBJECTIF to allow $filter usage (see: hbImmeubleCard.html)
                                                            if (!$scope.useSource.value) {
                                                                currTrans.IDENTIFIANT_OBJECTIF = currTrans.IDENTIFIANT.OBJECTIF;
                                                            } else {
                                                                currTrans.PRESTATION_ID = prestationsBySource[currTrans.SOURCE].Id;
                                                            }
                                                            $scope.transactions.push(currTrans);
                                                        }
                                                    },
                                                    function (response) {
                                                        var message = "Le chargement des TRANSACTIONs a échoué (statut de retour: " + response.status + ")";
                                                        hbAlertMessages.addAlert("danger", message);
                                                    });
                                        }
                                    }
                                },
                                function (response) {
                                    var message = "Le chargement des PRESTATIONs a échoué (statut de retour: " + response.status + ")";
                                    hbAlertMessages.addAlert("danger", message);
                                });
                    };

                    var getXpathForPrestations = function (elfin) {
                        return "//ELFIN[substring-before(IDENTIFIANT/OBJECTIF,'.')='" +
                            elfin.IDENTIFIANT.OBJECTIF + "' and PARTENAIRE/PROPRIETAIRE/@NOM='" +
                            elfin.PARTENAIRE.PROPRIETAIRE.NOM + "' and @CLASSE='PRESTATION']";
                    };

                    var getXpathForPrestationsHistoriques = function (elfin) {
                        return "//ELFIN[@CLASSE='PRESTATION'][substring-before(IDENTIFIANT/OBJECTIF,'.')='" +
                            elfin.IDENTIFIANT.OBJECTIF + "'][PARTENAIRE/PROPRIETAIRE/@NOM='" +
                            elfin.PARTENAIRE.PROPRIETAIRE.NOM + "'][IDENTIFIANT/DE != ''][max((number(substring(IDENTIFIANT/DE, 1, 4)), 2016))=2016]";
                    };


                    var getXpathForTransactions = function (elfin) {
                        return "//ELFIN[IDENTIFIANT/OBJECTIF='" + elfin.IDENTIFIANT.OBJECTIF + "']";
                    };

                    $scope.loadLinkedData = function (newUseSourceValue) {
                        if ($scope.elfin && $attrs["hbMode"] !== "create") {
                            var xpathForPrestations = getXpathForPrestations($scope.elfin);
                            var xpathForTransactionFn = getXpathForTransactions;
                            var xpathForContrats = getXpathForContrats($scope.elfin);

                            var xpathForConstatsEnCours = getXpathForConstatsEnCours($scope.elfin);
                            var xpathForConstatsClos = getXpathForConstatsClos($scope.elfin);

                            if (newUseSourceValue) {
                                var source = $scope.elfin.ID_G + "/" + $scope.elfin.CLASSE + "/" + $scope.elfin.Id;
                                xpathForPrestations = "//ELFIN[@CLASSE='PRESTATION'][@SOURCE='" + source + "']";
                                xpathForTransactionFn = function (elfin) {
                                    var source = elfin.ID_G + "/" + elfin.CLASSE + "/" + elfin.Id;
                                    return "//ELFIN[@CLASSE='TRANSACTION'][@SOURCE='" + source + "']";
                                };

                                xpathForContrats = "//ELFIN[@CLASSE='CONTRAT'][@SOURCE='" + source + "']";

                                xpathForConstatsEnCours = "//ELFIN[@CLASSE='CONSTAT'][@SOURCE='" + source + "' ][not(IDENTIFIANT/A) or IDENTIFIANT/A='']";
                                xpathForConstatsClos = "//ELFIN[@CLASSE='CONSTAT'][@SOURCE='" + source + "' ][(IDENTIFIANT/A) and not(IDENTIFIANT/A='')]";
                            }

                            $scope.loadPrestations(xpathForPrestations, xpathForTransactionFn);
                            // Charger les prestations historiques via No SAI
                            $scope.loadPrestations(getXpathForPrestationsHistoriques($scope.elfin), null, "prestationsHistoriques");

                            $scope.loadContrats(xpathForContrats);
                            $scope.loadConstats(xpathForConstatsEnCours, "constatsEncours");
                            $scope.loadConstats(xpathForConstatsClos, "constatsClos");

                        }
                    };

                    $scope.$watch("useSource.value", function (newValue) {
                        $scope.loadLinkedData(newValue);
                    });

                    var getXpathForContrats = function (elfin) {
                        return "//ELFIN[IDENTIFIANT/OBJECTIF='" + elfin.IDENTIFIANT.OBJECTIF + "']";
                    };

                    $scope.loadContrats = function (xpathForContrats) {
                        hbQueryService.getContrats(xpathForContrats)
                            .then(function (elfins) {
                                    $scope.contrats = elfins;
                                },
                                function (response) {
                                    var message = "Le chargement des CONTRATs a échoué (statut de retour: " + response.status + ")";
                                    hbAlertMessages.addAlert("danger", message);
                                });
                    };

                    /**
                     * Listener used to load PRESTATION, CONTRAT lists related to this IMMEUBLE
                     * Only relevant while not in create mode.
                     */
                    $scope.$watchCollection('[elfin.IDENTIFIANT.OBJECTIF,elfin.PARTENAIRE.PROPRIETAIRE.NOM]', function (newValues, oldValues) {

                        //$log.debug("$watchCollection for OBJECTIF, PROPRIETAIRE.NOM : " + oldValues[0] + ", " + oldValues[1] + " => " + newValues[0] + ", " + newValues[1]);

                        if ($scope.elfin && $attrs["hbMode"] !== "create") {
                            // Restriction on PROPRIETAIRE, CLASSE is mandatory. Restriction on OBJECTIF starts-with only is not sufficient in all cases.
                            // TODO: evaluate replacing the above by the following.
                            //var xpathForPrestations = "//ELFIN[substring-before(IDENTIFIANT/OBJECTIF,'.')='"+$scope.elfin.IDENTIFIANT.OBJECTIF+"' and PARTENAIRE/PROPRIETAIRE/@Id='"+$scope.elfin.PARTENAIRE.PROPRIETAIRE.Id+"' and PARTENAIRE/PROPRIETAIRE/@ID_G='"+$scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G+"' and @CLASSE='PRESTATION']";
                            $scope.loadLinkedData($scope.useSource.value);
                            // $scope.loadPrestations(getXpathForPrestations($scope.elfin), getXpathForTransactions);
                            // $scope.loadContrats(getXpathForContrats($scope.elfin));

                        }

                    }, true);


                    /**
                     * Listener used to load PRODUCTION CHALEUR, PRODUCTION FROID, VENTILATION, CITERNE,
                     * INTRODUCTION ELECTRIQUE, EQUIPEMENT related to this IMMEUBLE.
                     * We link all the above CLASSE by their IDENTIFIANT.OBJECTIF/IDENTIFIANT.NOM (No SAI/No de constr.)
                     *
                     * Only relevant while not in create mode.
                     */
                    $scope.$watchCollection('[elfin.IDENTIFIANT.OBJECTIF,elfin.IDENTIFIANT.NOM]', function (newValues, oldValues) {

                        //$log.debug("$watchCollection for OBJECTIF, NOM : " + oldValues[0] + ", " + oldValues[1] + " => " + newValues[0] + ", " + newValues[1]);


                        if (!!$scope.elfin && $attrs["hbMode"] !== "create") {
                            var xpathForProductionChaleurTODO = "//ELFIN[@SOURCE='" + hbUtil.getStandardSourceURI($scope.elfin) + "' and @CLASSE='PRODUCTION_CHALEUR']";
                            $log.debug(">>>> xpathForProductionChaleurTODO = " + xpathForProductionChaleurTODO + "<<<<");
                            var xpathForProductionChaleur = "//ELFIN[IDENTIFIANT/OBJECTIF='" + $scope.elfin.IDENTIFIANT.OBJECTIF + "' and IDENTIFIANT/ORIGINE='" + $scope.elfin.IDENTIFIANT.NOM + "' and @CLASSE='PRODUCTION_CHALEUR']";
                            hbQueryService.getProductionChaleurList(xpathForProductionChaleur)
                                .then(function (elfins) {
                                        $scope.productionChaleurList = elfins;
                                        computeEquipementsCount();
//														if ($scope.productionChaleurList) {
//															$log.debug(">>>> $scope.productionChaleurList.length = " + $scope.productionChaleurList.length);
//														} else {
//															$log.debug(">>>> $scope.productionChaleurList.length SEEMS EMPTY...");
//														}
                                    },
                                    function (response) {
                                        var message = "Le chargement des PRODUCTION_CHALEURs a échoué (statut de retour: " + response.status + ")";
                                        hbAlertMessages.addAlert("danger", message);
                                    });

                            var xpathForProductionFroid = "//ELFIN[IDENTIFIANT/OBJECTIF='" + $scope.elfin.IDENTIFIANT.OBJECTIF + "' and @CLASSE='PRODUCTION_FROID']";
                            // TODO: REMOVE SAI Link (requires batch data migration)
                            // var xpathForProductionFroid = "//ELFIN[@SOURCE='"+hbUtil.getStandardSourceURI($scope.elfin)+"']";
                            hbQueryService.getProductionFroidList(xpathForProductionFroid)
                                .then(function (elfins) {
                                        $scope.productionFroidList = elfins;
                                        computeEquipementsCount();
//														if ($scope.productionFroidList) {
//															$log.debug(">>>> $scope.productionFroidList.length = " + $scope.productionFroidList.length);
//														} else {
//															$log.debug(">>>> $scope.productionFroidList.length SEEMS EMPTY...");
//														}
                                    },
                                    function (response) {
                                        var message = "Le chargement des PRODUCTION_FROIDs a échoué (statut de retour: " + response.status + ")";
                                        hbAlertMessages.addAlert("danger", message);
                                    });

                            var xpathForVentilation = "//ELFIN[IDENTIFIANT/OBJECTIF='" + $scope.elfin.IDENTIFIANT.OBJECTIF + "' and @CLASSE='VENTILATION']";
                            hbQueryService.getProductionFroidList(xpathForVentilation)
                                .then(function (elfins) {
                                        $scope.ventilationList = elfins;
                                        computeEquipementsCount();
//														if ($scope.ventilationList) {
//															$log.debug(">>>> $scope.ventilationList.length = " + $scope.ventilationList.length);
//														} else {
//															$log.debug(">>>> $scope.ventilationList.length SEEMS EMPTY...");
//														}
                                    },
                                    function (response) {
                                        var message = "Le chargement des VENTILATIONs a échoué (statut de retour: " + response.status + ")";
                                        hbAlertMessages.addAlert("danger", message);
                                    });

                            var xpathForCiterne = "//ELFIN[IDENTIFIANT/OBJECTIF='" + $scope.elfin.IDENTIFIANT.OBJECTIF + "' and @CLASSE='CITERNE']";
                            hbQueryService.getCiterneList(xpathForCiterne)
                                .then(function (elfins) {
                                        $scope.citerneList = elfins;
                                        computeEquipementsCount();
//														if ($scope.citerneList) {
//															$log.debug(">>>> $scope.citerneList.length = " + $scope.citerneList.length);
//														} else {
//															$log.debug(">>>> $scope.citerneList.length SEEMS EMPTY...");
//														}
                                    },
                                    function (response) {
                                        var message = "Le chargement des CITERNEs a échoué (statut de retour: " + response.status + ")";
                                        hbAlertMessages.addAlert("danger", message);
                                    });

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

                    // Check when elfin instance becomes available
                    $scope.$watch('elfin.Id', function () {

                        if (!!$scope.elfin) {

                            // ===========================================================
                            // Safe access to elfin.CARACTERISTIQUE.CARSET.CAR by POS
                            // Relying on Js array position is not a safe option when
                            // POS indexes are discontinuous. (i.e. POS="4" missing)
                            // JS misses XPath like:
                            // 		ELFIN/CARACTERISTIQUE/CARSET/CAR[@POS='6']
                            // Hereafter using underscore.js to perform reference mapping
                            // ===========================================================

                            // Lieu-dit
                            $scope.CARSET_CAR_POS_1 = linkCARByPos(1);
                            // Unused (empty)
                            $scope.CARSET_CAR_POS_2 = linkCARByPos(2);
                            // No ECAP
                            $scope.CARSET_CAR_POS_3 = linkCARByPos(3);
                            // Unused (empty)
                            $scope.CARSET_CAR_POS_4 = linkCARByPos(4);
                            // Valeur ECAP
                            $scope.CARSET_CAR_POS_5 = linkCARByPos(5);
                            // Année estimation ECAP
                            $scope.CARSET_CAR_POS_6 = linkCARByPos(6);
                            // Valeur cadastrale
                            $scope.CARSET_CAR_POS_7 = linkCARByPos(7);
                            // Année estimation cadastrale
                            $scope.CARSET_CAR_POS_8 = linkCARByPos(8);
                            // Nombre de classe
                            $scope.CARSET_CAR_POS_9 = linkCARByPos(9);
                            // Nombre de place de travail
                            $scope.CARSET_CAR_POS_10 = linkCARByPos(10);

                            // Prime ECAP TTC
                            $scope.CARSET_CAR_POS_11 = linkCARByPos(11);
                            // Prix au m³
                            $scope.CARSET_CAR_POS_12 = linkCARByPos(12);
                            // Fond auto assurance
                            $scope.CARSET_CAR_POS_13 = linkCARByPos(13);
                            // Bâtiment assuré no
                            $scope.CARSET_CAR_POS_14 = linkCARByPos(14);
                            // Objet assuré
                            $scope.CARSET_CAR_POS_15 = linkCARByPos(15);
                            // Classe risque construction
                            $scope.CARSET_CAR_POS_16 = linkCARByPos(16);
                            // Classe risque usage
                            $scope.CARSET_CAR_POS_17 = linkCARByPos(17);
                            // Paratonnerre
                            $scope.CARSET_CAR_POS_18 = linkCARByPos(18);
                            // Détection incendie
                            $scope.CARSET_CAR_POS_19 = linkCARByPos(19);
                            // Particularités
                            $scope.CARSET_CAR_POS_20 = linkCARByPos(20);
                            // ===========================================================

                            /**
                             * Perform template clean up tasks while in create mode.
                             */
                            if ($attrs.hbMode === "create") {
                                $scope.elfin.IDENTIFIANT.NOM = '';
                                $scope.elfin.IDENTIFIANT.OBJECTIF = '';
                                $scope.elfin.IDENTIFIANT.QUALITE = '';
                                $scope.elfin.IDENTIFIANT.COMPTE = '';
                                $scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM = '';
                                $scope.elfin.PARTENAIRE.PROPRIETAIRE.VALUE = '';
                                $scope.elfin.CARACTERISTIQUE.CAR2.VALEUR = '';
                            } else {
                                // Need loading related data only when not in create mode

                                // Only load orders if user as rights to see them
                                if ($scope.canManageOrders) {

                                    hbQueryService.getCommandesForSource($scope.elfin.ID_G + "/" + $scope.elfin.CLASSE + "/" + $scope.elfin.Id).then(function (elfins) {
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
                                                        commande.totalTransactions = total;
                                                        commande.nbTransactions = nbTransactions;
                                                    },
                                                    function (response) {
                                                        var message = "L'obtention des TRANSACTIONS pour la source: " + xpath + " a échoué. (statut: " + response.status + ")";
                                                        hbAlertMessages.addAlert("danger", message);
                                                    }
                                                )
                                            });
                                        },
                                        function (response) {
                                            var message = "Le chargement des COMMANDES a échoué (statut de retour: " + response.status + ")";
                                            hbAlertMessages.addAlert("danger", message);
                                        });
                                }

                                // Get UNITE_LOCATIVE corresponding to current ELFIN.Id
                                //var xpathForSurfaces = "//ELFIN[IDENTIFIANT/ORIGINE='"+$scope.elfin.Id+"']";
                                var xpathForSurfaces = "//ELFIN[IDENTIFIANT/ORIGINE='" + $scope.elfin.Id + "' and not(string-length(IDENTIFIANT/A/string()) = 10 and IDENTIFIANT/A/string() " + hbUtil.encodeUriParameter(" <= ") + "'" + currentHbTextDate() + "')]";

                                hbQueryService.getLocationUnits(xpathForSurfaces)
                                    .then(function (elfins) {
                                            elfins.forEach(function (elfin) {
                                                elfin.CARSET_CAR_POS_2 = hbUtil.getCARByPos(elfin, 2);
                                            });
                                            $scope.locationUnits = elfins;
                                        },
                                        function (response) {
                                            var message = "Le chargement des SURFACEs a échoué (statut de retour: " + response.status + ")";
                                            hbAlertMessages.addAlert("danger", message);
                                        });


                                // Get archived UNITE_LOCATIVE corresponding to current ELFIN.Id

                                // Note we exclude date string not equal to 10 characters to avoid having '' empty string
                                // considered as a date smaller than any other regular 10 char dates.
                                var xpathForArchivedSurfaces = "//ELFIN[IDENTIFIANT/ORIGINE='" + $scope.elfin.Id + "' and string-length(IDENTIFIANT/A/string()) = 10 and IDENTIFIANT/A/string() " + hbUtil.encodeUriParameter(" <= ") + "'" + currentHbTextDate() + "']";
                                hbQueryService.getLocationUnits(xpathForArchivedSurfaces)
                                    .then(function (elfins) {
                                            $scope.locationUnitsArchived = elfins;
                                        },
                                        function (response) {
                                            var message = "Le chargement des SURFACEs archivées a échoué (statut de retour: " + response.status + ")";
                                            hbAlertMessages.addAlert("danger", message);
                                        });

                            }
                            // Data correction - if no elfin.PARTENAIRE.FOURNISSEUR.VALUE datastructure exist creates it
                            // TODO: evaluate batch data update.
                            if (!$scope.elfin.PARTENAIRE.FOURNISSEUR) {
                                $log.debug("No elfin.PARTENAIRE.FOURNISSEUR data structure found, create it.");
                                $scope.elfin.PARTENAIRE.FOURNISSEUR = {
                                    "Id": "null",
                                    "ID_G": "null",
                                    "NOM": "null",
                                    "GROUPE": "null",
                                    "VALUE": "-"
                                };
                                $scope.elfinForm.$setDirty();
                            }


                            // Make IMMEUBLE photo available
                            $scope.updatePhotoSrc();

                            // Update path to local file system
                            //$log.debug(">>>> fsURI = " + fsURI);
                            $scope.annexeFileSystemUri = hbUtil.buildAnnexeFileSystemUri($scope.elfin);

                        }

                    }, true);


                    /**
                     * Add other partner as: CARACTERISTIQUE.FRACTION.L.{
									 * [
									 *  C = Actor CLASSE = 'ACTEUR' , (Information used by fractionElfinRefFilter in SDS ctxt.)
									 *  C = Actor.ID_G,
									 *  C = Actor.Id,
									 *  C = Actor.GROUPE,
									 *  C = Actor.NOM
									 *  ]
									 * }
                     */
                    $scope.addOtherPartner = function () {

                        var emptyFractionTemplate = {"L": []};
                        var actorCellTemplate = {
                            "C": [
                                {"POS": 1, "VALUE": "ACTEUR"},
                                {"POS": 2, "VALUE": ""},
                                {"POS": 3, "VALUE": ""},
                                {"POS": 4, "VALUE": ""},
                                {"POS": 5, "VALUE": ""}
                            ]
                            ,
                            "POS": 1
                        };

                        if ($scope.elfin.CARACTERISTIQUE) {
                            if ($scope.elfin.CARACTERISTIQUE.FRACTION) {
                                if ($scope.elfin.CARACTERISTIQUE.FRACTION.L) {
                                    actorCellTemplate.POS = $scope.elfin.CARACTERISTIQUE.FRACTION.L.length + 1;
                                    $scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', actorCellTemplate);
                                } else {
                                    // FRACTION with no lines
                                    $scope.elfin.CARACTERISTIQUE.FRACTION = emptyFractionTemplate;
                                    $scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', actorCellTemplate);
                                }
                            } else {
                                // Missing properties are created automatically in JS, thus same code as for empty FRACTION.
                                $scope.elfin.CARACTERISTIQUE.FRACTION = emptyFractionTemplate;
                                $scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', actorCellTemplate);
                            }
                        } else {
                            // always available in catalogue
                        }
                    };


                    /**
                     * Remove an existing `other partner`
                     */
                    $scope.removeOtherPartner = function (index) {

                        if ($scope.elfin.CARACTERISTIQUE) {
                            if ($scope.elfin.CARACTERISTIQUE.FRACTION) {
                                if ($scope.elfin.CARACTERISTIQUE.FRACTION.L) {
                                    // Remove one element at index
                                    $scope.elfin.CARACTERISTIQUE.FRACTION.L.splice(index, 1);
                                    // Allow user saving the new data structure following above element deletion
                                    $scope.elfinForm.$setDirty();
                                    // Deal with POS numbering.
                                    GeoxmlService.renumberPos($scope.elfin.CARACTERISTIQUE.FRACTION.L);
                                }
                            }
                        }
                    };


                }]);

})();
