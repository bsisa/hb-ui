/**
 * 
 * Caches activeJob and provide it as a service.
 * 
 * @author Patrick Refondini
 * 
 */

(function() {
	angular.module('hb5').service('hbPrintService',
			[ '$log', 'GeoxmlService', 'hbUtil', function($log, GeoxmlService, hbUtil) {

				var activeJob = null;
				var reportDefinitions = [];

				var hasReportDefinition = function(elfin) {
	        		$log.debug("Report definitions available.");
	        		for (var i = 0; i < reportDefinitions.length ;i++) {
	        			var reportDefinition = reportDefinitions[i];
	        			$log.debug("Report reportDefinition CLASSE: " + reportDefinition.CLASSE);
	        			if (reportDefinition.CLASSE === elfin.CLASSE) {
	        				$log.debug("Report reportDefinition MATCH FOUND FOR " + reportDefinition.CLASSE);
	        				return true;
	        			} else {
	        				// continue searching
	        			}
	        		}
	        		return false; // no match found
				};
				
				//TODO: Implement
				var buildReportUrl = function(elfin) {
					return "todo";
				}
				
				
				
				return {
					setActiveJob : function(activeJob_p) {
						
						$log.debug(">>>> activeJob_p:  " + angular.toJson(activeJob_p));
						var tempReportDefinitions = []; // set temporary new configuration
						
						// Search for IMPRESSION reference within the METIER elfin
						var printElfinId = null;
						var printElfinID_G = null;
						// TODO: protect against non existing CARA...FRAC..L..
						hbUtil.reorderArrayByPOS(activeJob_p['CARACTERISTIQUE']['FRACTION']['L']);
						for ( var i=0; i < activeJob_p.CARACTERISTIQUE.FRACTION.L.length; i++) {
							var currL = activeJob_p.CARACTERISTIQUE.FRACTION.L[i];
							// TODO: protect against non existing C...
							hbUtil.reorderArrayByPOS(currL.C);
							var currLPOS1Value = currL.C[0].VALUE;
							if (currLPOS1Value === "IMPRESSION") {
								printElfinId = currL.C[1].VALUE;
								printElfinID_G = currL.C[2].VALUE;
								break;
							}
						}
						
						// Only call for printElfin if identifiers found
						if (printElfinId != null && printElfinID_G != null) {
							GeoxmlService.getElfin(printElfinID_G, printElfinId).get().then(function(printElfin) {
					        	// Force CAR array sorting by POS attribute
					        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
					        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
					        	//       Need review of other similar operations
	//				        	if ( elfin['CARACTERISTIQUE'] != null && elfin['CARACTERISTIQUE']['CARSET'] != null && elfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
	//				        		hbUtil.reorderArrayByPOS(elfin['CARACTERISTIQUE']['CARSET']['CAR']);
	//				        	}
															
								$log.debug(">>>> PRINT ELFIN:  " + angular.toJson(printElfin));
								hbUtil.reorderArrayByPOS(printElfin['CARACTERISTIQUE']['FRACTION']['L']);
								if (printElfin) {
									for ( var i=0; i < printElfin.CARACTERISTIQUE.FRACTION.L.length; i++) {
										if ( i > 0 ) { // Skip report description line
											var currPrintElfinLine = printElfin.CARACTERISTIQUE.FRACTION.L[i]; 
											hbUtil.reorderArrayByPOS(currPrintElfinLine.C);
											/*
												<C POS="1">Nom du rapport </C>
												<C POS="2">CLASSE (classe à laquelle s'applique le rapport)</C>
												<C POS="3">GROUPE (groupe à laquelle s'applique le rapport - si vide s'applique à tous les groupes)</C>
												<C POS="4">IDG</C>
												<C POS="5">RAPPORTId</C>
											*/
											var reportTitle = currPrintElfinLine.C[0].VALUE;
											var reportClasse = currPrintElfinLine.C[1].VALUE;
											var reportGroupe = currPrintElfinLine.C[2].VALUE;
											var reportID_G = currPrintElfinLine.C[3].VALUE;
											var reportId = currPrintElfinLine.C[4].VALUE;
											
											var currReportDefinition = {
												"title" : reportTitle,
												"CLASSE" : reportClasse, 
												"GROUPE" : reportGroupe,
												"ID_G" : reportID_G,
												"Id" : reportId
											};
											
											tempReportDefinitions.push(currReportDefinition);
										}
									}
								} else {
									$log.warn("No print elfin defined");
								}
					        	}, function(response) {
					        		var message = "Le chargement des informations pour ELFIN IMPRESSION a échoué (statut de retour: " + response.status + ")";
					        		$log.error(message);
					        	}
					        );
							activeJob = activeJob_p; // update active job
							reportDefinitions = tempReportDefinitions; // Set or reset reportDefinitions 
						} else {
							$log.info("No print elfin configuration found.");
						}
						
					},
					getActiveJob : function() {
						return activeJob;
					},
					getReportDefinitions : function() {
						return reportDefinitions;
					},
					hasReportDefinition : function(elfin) {
						return hasReportDefinition(elfin);
					},
					getReportUrl : function(elfin) {
						return buildReportUrl(elfin);
					}
				};
			} ]);

})();