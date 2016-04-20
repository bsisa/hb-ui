/**
 * 
 * Provides report definition for elfin CLASSE/GROUPE or generic classifiers LEVEL1/LEVEL2
 *  
 * Caches activeJob and provides it as a service.
 *  
 * @author Patrick Refondini
 * 
 */

(function() {
	angular.module('hb5').service('hbPrintService',
			[ '$window' ,'$log', 'GeoxmlService', 'hbUtil', 'hbAlertMessages', function($window, $log, GeoxmlService, hbUtil, hbAlertMessages) {

				var activeJob = null;
				var reportDefinitions = [];

				/**
				 * Returns report definition matching generic LEVEL1, LEVEL2 classifiers strings. 
				 * IMPRESSION CLASSE configuration contains: 
				 * 
			    <L POS="x">
                    <C POS="1">Report name</C>
                    <C POS="2">CLASSE or LEVEL1 classifier</C>
                    <C POS="3">GROUPE or LEVEL2 classifier (applies to any LEVEL1 if empty)</C>
                    <C POS="4">IDG</C>
                    <C POS="5">RAPPORTId</C>
                </L>
                 *
				 */
				var getReportMatchingReportDefinitionForClassifiers = function (level1,level2) {
	        		var reportDefinitionsForLevel1 = [];
	        		for (var i = 0; i < reportDefinitions.length ;i++) {
	        			var reportDefinition = reportDefinitions[i];
	        			if (reportDefinition.CLASSE === level1) {
	        				// Add reportDefinition matching this level1 value. There can be several if defined for level1/level2.
	        				reportDefinitionsForLevel1.push(reportDefinition);
	        			} else {
	        				// continue searching
	        			}
	        		}
	        		
	        		// No definition found matching level1 value
	        		if (reportDefinitionsForLevel1.length === 0) {
	        			return undefined;
	        		} else if (reportDefinitionsForLevel1.length === 1) {
	        			// GROUPE must be empty or match the current elfin.GROUPE
	        			if (reportDefinitionsForLevel1[0].GROUPE === level2 || reportDefinitionsForLevel1[0].GROUPE === "") {
	        				return reportDefinitionsForLevel1[0];
	        			} else {
	        				return undefined;
	        			}
	        		} else if (reportDefinitionsForLevel1.length > 1) {
	        			var reportDefinitionForClasseWithoutGroupe = null;
	        			for (var i = 0; i < reportDefinitionsForLevel1.length; i++) {
	        				var reportDefinitionForClasse = reportDefinitionsForLevel1[i];
		        			if (reportDefinitionForClasse.GROUPE === level2) {
		        				return reportDefinitionForClasse;
		        			} else if (reportDefinitionForClasse.GROUPE === "") {
		        				reportDefinitionForClasseWithoutGroupe = reportDefinitionForClasse;
		        			}
	        			}
	        			if (reportDefinitionForClasseWithoutGroupe == null) {
	        				return undefined;
	        			} else {
	        				return reportDefinitionForClasseWithoutGroupe;
	        			}
	        		}
				};
				

				/**
				 * Test whether a report definition exists for level1, level2 classifiers.
				 */
				var hasReportDefinition = function(level1,level2) {
	        		var mrd = getReportMatchingReportDefinitionForClassifiers(level1,level2);
	        		if (mrd == undefined) {
	        			return false;
	        		} else {
	        			return true;
	        		}
				};				
				
				
				//TODO: Test and change REST API to deal with parameter in a generic way: 
				// requires original elfin ID_G,Id to be part of REST URL not URL parameters.
				var buildReportUrl = function(elfin) {
	        		var mrd = getReportMatchingReportDefinitionForClassifiers(elfin.CLASSE, elfin.GROUPE);
	        		if (mrd == undefined) {
	        			return "";
	        		} else {
	        			return "/api/melfin/report/"+mrd.ID_G+"/"+mrd.Id+"?col="+elfin.ID_G+"&id="+elfin.Id;
	        		}
				};
				
				/**
				 * Obtains report definition, builds corresponding URL to obtain report and returns it.
				 * If no report definition is found returns an empty string.
				 */
				var buildReportUrlForClassifiers = function(elfin, level1, level2, headerParam1, headerParam2) {
	        		var mrd = getReportMatchingReportDefinitionForClassifiers(level1,level2);
	        		if (mrd == undefined) {
	        			return "";
	        		} else {
	        			return "/api/melfin/report/"+mrd.ID_G+"/"+mrd.Id+"?col="+elfin.ID_G+"&id="+elfin.Id + (headerParam1 ? "&reportHeaderParam1="+headerParam1:"") + (headerParam2 ? "&reportHeaderParam2="+headerParam2:"") ;
	        		}
				};				
				
				
		        /**
		         * Provides feedback to end-user if no report definition is available for provided parameters.
		         */
		        var getReportOrProvideFeedbackForMissingConfig = function (elfin, classifierLevel1, classifierLevel2) {
		        	getReportOrProvideFeedbackForMissingConfig(elfin, classifierLevel1, classifierLevel2, undefined, undefined);
		        };				
				
		        
		        /**
		         * Provides feedback to end-user if no report definition is available for provided parameters.
		         * Passes header parameters on to report building system. 
		         */		        
		        var getReportOrProvideFeedbackForMissingConfig = function (elfin, classifierLevel1, classifierLevel2, headerParam1, headerParam2) {
		        	var reportUrl = buildReportUrlForClassifiers(elfin, classifierLevel1 , classifierLevel2, headerParam1, headerParam2);
		        	if (reportUrl.length > 0) {
		        		$window.open(reportUrl);	
		        	} else {
		        		hbAlertMessages.addAlert(
								"danger", "Pas de rapport configuré pour (`"+classifierLevel1+"`,`"+classifierLevel2+"`) . Contactez s.v.p. l'administrateur du système.");
		        	}		        	
		        };
				
				return {
					setActiveJob : function(activeJob_p) {
						// Update activeJob referenced by getActiveJob used for instance 
						// by $routeProvider to load job corresponding dashboard    
						activeJob = activeJob_p; // update active job	
						
						//$log.debug(">>>> activeJob_p:  " + angular.toJson(activeJob_p));
						var tempReportDefinitions = []; // set temporary new configuration
						
						// Search for IMPRESSION reference within the METIER elfin
						var printElfinId = null;
						var printElfinID_G = null;

						if ( activeJob_p['CARACTERISTIQUE'] && activeJob_p['CARACTERISTIQUE']['FRACTION'] && activeJob_p['CARACTERISTIQUE']['FRACTION']['L']) {
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
						}
						
						// Only call for printElfin if identifiers found
						if (printElfinId != null && printElfinID_G != null) {
							GeoxmlService.getElfin(printElfinID_G, printElfinId).get().then(
								function(printElfin) {
									hbUtil.reorderArrayByPOS(printElfin['CARACTERISTIQUE']['FRACTION']['L']);
									if (printElfin) {
										for ( var i=0; i < printElfin.CARACTERISTIQUE.FRACTION.L.length; i++) {
											if ( i > 0 ) { // Skip report description line
												var currPrintElfinLine = printElfin.CARACTERISTIQUE.FRACTION.L[i]; 
												hbUtil.reorderArrayByPOS(currPrintElfinLine.C);
												/*
												    <L POS="x">
									                    <C POS="1">Report name</C>
									                    <C POS="2">CLASSE or LEVEL1 classifier</C>
									                    <C POS="3">GROUPE or LEVEL2 classifier (applies to any LEVEL1 if empty)</C>
									                    <C POS="4">IDG</C>
									                    <C POS="5">RAPPORTId</C>
									                </L>
												*/
												var reportTitle = currPrintElfinLine.C[0].VALUE;
												var reportClasse = currPrintElfinLine.C[1].VALUE;
												var reportGroupe = currPrintElfinLine.C[2].VALUE;
												var reportID_G = currPrintElfinLine.C[3].VALUE;
												var reportId = currPrintElfinLine.C[4].VALUE;
												
												/**
												 * CLASSE and GROUPE semantic also applies to LEVEL1 and LEVEL2 generic reports classification.
												 */
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
						        });
							reportDefinitions = tempReportDefinitions; // Set reportDefinitions 
						} else {
							$log.info("No print elfin configuration found.");
							reportDefinitions = []; // Reset reportDefinitions 
						}
						
					},
					getActiveJob : function() {
//						$log.debug(">>>>>>>>>>> GET ACTIVE JOB RETURNS: " + angular.toJson(activeJob));
						return activeJob;
					},
					getReportDefinitions : function() {
						return reportDefinitions;
					},
					hasReportDefinition : function(level1, level2) {
						return hasReportDefinition(level1, level2);
					},
					getReportUrl : function(elfin) {
						return buildReportUrl(elfin);
					},
					getReportUrlForClassifiers : function(elfin, level1, level2) {
						return buildReportUrlForClassifiers(elfin, level1, level2);
					},
					getReportOrProvideFeedbackForMissingConfig : function(elfin, level1, level2) {
						return getReportOrProvideFeedbackForMissingConfig(elfin, level1, level2);
					},
					getReportOrProvideFeedbackForMissingConfig : function(elfin, level1, level2, headerParam1, headerParam2) {
						return getReportOrProvideFeedbackForMissingConfig(elfin, level1, level2, headerParam1, headerParam2);
					}					
				};
			} ]);

})();