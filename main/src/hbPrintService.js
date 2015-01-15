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

				return {
					setActiveJob : function(activeJob_p) {
						
						$log.debug(">>>> activeJob_p:  " + angular.toJson(activeJob_p));
						
						// Search for IMPRESSION reference within the METIER elfin
						var printElfinId = null;
						var printElfinID_G = null;
						// TODO: protect against non existing CARA...FRAC..L..
						hbUtil.reorderArrayByPOS(activeJob_p['CARACTERISTIQUE']['FRACTION']['L']);
						for ( var i=0; i < activeJob_p.CARACTERISTIQUE.FRACTION.L.length; i++) {
							var currL = activeJob_p.CARACTERISTIQUE.FRACTION.L[i];
							// TODO: protect against non existing C...
							//hbUtil.reorderArrayByPOS(currL.C);
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
								
//								if (printElfin) {
//									for ( var i=0; i < printElfin.CARACTERISTIQUE.FRACTION.L.length; i++) {
//										
//									}
//								} else {
//									$log.warn("No print elfin defined");
//								}
					            
					            
					        	}, function(response) {
					        		var message = "Le chargement des informations pour ELFIN IMPRESSION a échoué (statut de retour: " + response.status + ")";
					        		$log.error(message);
					        	}
					        );
						} else {
							$log.info("No print elfin configuration found.");
						}
						activeJob = activeJob_p;
					},
					getActiveJob : function() {
						return activeJob;
					}
				};
			} ]);

})();