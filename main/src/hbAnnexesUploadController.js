(function() {

	    angular
			.module('hb5')
			.controller(
					'HbAnnexesUploadController',
					[
						'$scope',
						'GeoxmlService',
						'$log',
						'hbAlertMessages',
						'hbUtil',
						function($scope, GeoxmlService, $log, hbAlertMessages,
								hbUtil) {
    
									$log.debug("    >>>> Using HbAnnexesUploadController");
									
							    	// ============================================================================
							    	// === Manage file upload
							    	// ============================================================================
						            
									// Empty object to be populated by ngflow as config.ngflow
									//$scope.config = { ngflow : { opts : { query : { elfinID_G : "", elfinId : ""} }}};
									$scope.config = { ngflow : { opts : {}}};		

									// Available annexes types.
						            $scope.uploadFileTypes = [
						                                      { name: "Fichier" , value: "file"},
						                                      { name: "Photo" , value: "photo"}
						                                      ];									
									
									// Note: update by reference. See doc: https://docs.angularjs.org/api/ng/directive/select
						            $scope.selectedUploadFileType = $scope.uploadFileTypes[0];
						            
						            $scope.selectUploadFileType = function(uploadFileType) {
						            	$scope.selectedUploadFileType = uploadFileType;
						            };
						            
						            $scope.flowFileAdded = function(file,event) {
						            	event.preventDefault();//prevent file from uploading !?
						            	// TODO: name validation
						            	// TODO: already exist check
						            	$log.debug("flowFileAdded event: file = " + file.name + ", event = " + event);
						            	$scope.hbUploadStatusLabelCss = "label-info";
						            };
						            
						            $scope.flowUploadStarted = function(flow) {
						            	$log.debug("flowUploadStarted.");
						            	$scope.hbUploadStatusLabelCss = "label-success";
						            };			
						            
						            $scope.flowCancel = function(flow) {
						            	// We are in single file mode
						            	// check we have a single file
						            	if (flow.files.length == 1) {
							            	var file = flow.files[0];
							            	flow.cancel();
							            	// TODO: send API clean up instruction ? 
							            	hbAlertMessages.addAlert("info","Le téléversement du fichier " + file.name + " a été annulé.");						            		
						            	} else if (flow.files.length > 1) {
							            	flow.cancel();
						            		hbAlertMessages.addAlert("warn","Plusieurs fichiers sont sélectionnés pour le téléversement, c'est imprévu! Tous les téléversements ont été annulés.");
						            	} else {
						            		flow.cancel();
						            		hbAlertMessages.addAlert("warn","Aucun fichier sélectionnés pour le téléversement!");
						            	}
						            	$scope.hbUploadStatusLabelCss = "label-info";
						            };
						            
						            $scope.flowFileSuccess = function(file, message, flow) {
						            	$log.debug("flowFileSuccess(file = "+file.name+", message = "+message+", flow )");
						            	flow.removeFile(file);
						            	$log.debug("flowFileSuccess: removed file from flow.files");

//						            	<RENVOI POS="1" LIEN="../../HB4-Objets/G20040930101030005/annexes/G20040203114894000/J_de_Hochberg13_ContratEcap.pdf">J_de_Hochberg13_ContratEcap.pdf</RENVOI>
						            	
							            if ($scope.elfin.ANNEXE) {
							            	if ($scope.elfin.ANNEXE.RENVOI) {
							            	var newRenvoi = { POS : $scope.elfin.ANNEXE.RENVOI.length+1, LIEN : file.name, VALUE : $scope.selectedUploadFileType.value };
							            	$scope.elfin.ANNEXE.RENVOI.push(newRenvoi);
							            	$log.debug("flowFileSuccess: Added newRenvoi: " + newRenvoi);
							            	}
							            } else {
							            	var newAnnexe = {RENVOI : [ { POS : 1, LIEN : file.name, VALUE : $scope.selectedUploadFileType.value} ] };
							            	$scope.elfin.ANNEXE = newAnnexe;
							            	$log.debug("flowFileSuccess: Added newAnnexe: " + newAnnexe);
							            }
							            // TODO: Evaluate whether we should automatically save elfin to server ?!
						            	$scope.elfinForm.$setDirty();
						            	hbAlertMessages.addAlert("info","Le fichier " + file.name + " a été téléversé avec succès.");
						            	$scope.hbUploadStatusLabelCss = "label-info";
						            };						            
						            
								    $scope.flowFileError = function(file, message) {
						            	$log.debug("flowFileError(file = "+file.name+", message = "+message+")");
						            	$scope.hbUploadStatusLabelCss = "label-danger";
						            	hbAlertMessages.addAlert("danger","Le téléversement du fichier " + file.name + " a échoué!");
						            };
						            
						            $scope.hbUploadStatusLabelCss = "label-info";
						            
							    	// Check when ngflow instance becomes available from flow-name directive initialisation  
						            $scope.$watch('config.ngflow.opts', function(newFlow, oldFlow) { 
						            	// Add elfin ID_G and Id properties values to upload information using query parameter:
						            	// see https://github.com/flowjs/flow.js#flow
						    			if ($scope.elfin) {
						    				$scope.config.ngflow.opts.query = { elfinID_G : $scope.elfin.ID_G , elfinId : $scope.elfin.Id };
						    			}											
							    	}, true);
						            
							    	// Check when elfin instance becomes available 
							    	$scope.$watch('elfin.Id', function() { 
							    		if ($scope.elfin!=null) {
							            	// Add elfin ID_G and Id properties values to upload information using query parameter:
							            	// see https://github.com/flowjs/flow.js#flow
							    			if ($scope.config.ngflow.opts.query) {
							    				$scope.config.ngflow.opts.query = { elfinID_G : $scope.elfin.ID_G , elfinId : $scope.elfin.Id };
							    			}
							    		};
							    	}, true);						            
						            
							    	// ============================================================================
									
									
									        
							    } ]);

})();
