(function () {

    angular.module('hb5').controller('AnnexeFileTypeSelectionController', ['$scope', '$modalInstance', 'items', function ($scope, $modalInstance, items) {

        $scope.items = items;
        $scope.selected = {
            item: $scope.items[0]
        };


        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }]);

    angular
        .module('hb5')
        .controller(
            'HbAnnexesUploadController',
            [
                '$attrs',
                '$scope',
                'GeoxmlService',
                '$log',
                'hbAlertMessages',
                'hbUtil',
                '$modal',
                'HB_ANNEXE_TYPE',
                function ($attrs, $scope, GeoxmlService, $log, hbAlertMessages,
                          hbUtil, $modal, HB_ANNEXE_TYPE) {

                    //$log.debug("    >>>> Using HbAnnexesUploadController");

                    var canSelectAnnexTypeBool = false;

                    $scope.canSelectAnnexType = function () {
                        return canSelectAnnexTypeBool;
                    };

                    // Annex types are annexes meta informations tagging annexes.
                    // They define business context, meaning. Not file media types.

                    // Available annexes types.
                    $scope.uploadFileTypes = [HB_ANNEXE_TYPE.FILE, HB_ANNEXE_TYPE.PHOTO, HB_ANNEXE_TYPE.COMMAND];

                    // Note: update by reference. See doc: https://docs.angularjs.org/api/ng/directive/select
                    $scope.selectedUploadFileType = HB_ANNEXE_TYPE.FILE;

                    $scope.selectUploadFileType = function (uploadFileType) {
                        $scope.selectedUploadFileType = uploadFileType;
                    };

                    $attrs.$observe('hbAnnexAutoTag', function(value) {
                        $scope.hbAnnexAutoTag = $attrs.hbAnnexAutoTag;
                    });

                    $scope.config = {};



                    /**
                     * Proceed to initialisation tasks
                     */
                    function init() {
                        // Check for optional annex-type attribute
                        if ($attrs['hbAnnexesUploadAnnexType']) {
                            if ($attrs.hbAnnexesUploadAnnexType === HB_ANNEXE_TYPE.FILE.value) {
                                // Configure parametrised annex type
                                $scope.selectUploadFileType(HB_ANNEXE_TYPE.FILE);
                                // Do not let end-user choose annex type
                                canSelectAnnexTypeBool = false;
                            } else if ($attrs['hbAnnexesUploadAnnexType'] === HB_ANNEXE_TYPE.PHOTO.value) {
                                // Configure parametrised annex type
                                $scope.selectUploadFileType(HB_ANNEXE_TYPE.PHOTO);
                                // Do not let end-user choose annex type
                                canSelectAnnexTypeBool = false;
                            } else if ($attrs['hbAnnexesUploadAnnexType'] === HB_ANNEXE_TYPE.COMMAND.value) {
                                // Configure parametrised annex type
                                $scope.selectUploadFileType(HB_ANNEXE_TYPE.COMMAND);
                                // Do not let end-user choose annex type
                                canSelectAnnexTypeBool = false;
                            } else {
                                // unknown annex type, let user select it
                                $log.warn("Unknown annex type configured for hb-annexes-upload: " + $attrs['hbAnnexesUploadAnnexType'] + ". Falling back to end user manual selection.");
                                canSelectAnnexTypeBool = true;
                            }
                        } else {
                            // No annex type attribute defintion. Let end user choose it.
                            canSelectAnnexTypeBool = true;
                        }

                        document.onpaste = function(event){
                            if (!!$scope.config.ngflow) {
                                var items = (event.clipboardData || event.originalEvent.clipboardData).items;
                                for (index in items) {
                                    var item = items[index];
                                    if (item.kind === 'file') {
                                        pasteFile(item.getAsFile(), $scope.config.ngflow);
                                    }
                                }
                            }
                        }
                    }

                    // Proceed with initialisation tasks
                    init();

                    var pasteFile = function(file, flow) {
                        var filename = "";
                        while (filename === "") {
                            filename = prompt("Merci de bien vouloir donner le nom du fichier collé : ", "nom_de_fichier.ext");
                        }

                        var modalInstance = $modal.open({
                            templateUrl: 'hbUploadFileTypeModal.html',
                            controller: 'AnnexeFileTypeSelectionController',
                            scope: $scope,
                            backdrop: 'static',
                            resolve: {
                                items: function () {
                                    return $scope.uploadFileTypes;
                                }
                            }
                        });

                        modalInstance.result.then(function (selectedItem) {
                            $scope.selectedUploadFileType = selectedItem;

                            GeoxmlService.getAnnex($scope.elfin.ID_G, $scope.elfin.Id, filename).head()
                                .then(function () { // HTTP 200: warning file already exists
                                        var message = "L'annexe " + filename + " existe déjà. Si vous ne désirez pas l'écraser par votre sélection courante, changer le nom de votre fichier et sélectionnez le à nouveau.";
                                        hbAlertMessages.addAlert("danger", message);
                                    },
                                    // HTTP 701: custom file not found code. Expected situation
                                    // every time a file to upload does not yet exist on the upload target: Ok.
                                    function (response) {
                                        // Do nothing
                                        $log.debug("Ok, checked annex " + filename + " does not exist yet, custom HTTP status code = " + response.status);
                                        flow.addFile(new File([file], filename));
                                        $scope.flowUpload(flow);
                                        // Reset file name to upload label CSS.
                                        $scope.hbUploadStatusLabelCss = "label-info";
                                    });

                        }, function () {
                            $scope.flowCancel(flow);
                            return false;
                        });
                    };


                    // Triggers file upload after having set extra POST query parameters.
                    // Note: Using controller function for upload elegantly solves headaches
                    // to reliably set flow.opts.query.
                    $scope.flowUpload = function (flow) {
                        // Add elfin ID_G and Id properties values to upload information using query parameter:
                        // see https://github.com/flowjs/flow.js#flow
                        flow.opts.query = {elfinID_G: $scope.elfin.ID_G, elfinId: $scope.elfin.Id};
                        flow.upload();
                    };

                    /**
                     * Used to enable/disable flowUpload button.
                     * Message to end-user related to the inability to upload together with its reasons
                     * are managed in flowFileAdded.
                     */
                    $scope.canUpload = function () {
                        // Only valid state is acceptable for upload as it triggers automatic ELFIN save.
                        // Let attribute hb-annexes-upload-no-validation='true' disable this behaviour
                        // for special validation case such as mandatory annex validation in TRANSACTION form.
                        // Indeed in that situation only annex uploading can let the user solve the validation
                        // error linked to the missing annex.

                        // Fix upload creating invalid objects by checking only THE "annexlength" validation
                        // error is present when activating "canUpload" with "hbAnnexesUploadNoValidation" set
                        // to true

                        // Special behaviour to allow upload of invalid state for `annexlength` only error.
                        if ($attrs.hbAnnexesUploadNoValidation === 'true') {
                            // Further processing needed only if form is invalid
                            if ($scope.elfinForm.$invalid) {
                                var IS_EXPECTED_INVALID_PROPERTY_NAME = "annexlength";
                                var IS_INVALID_PROPERTY_NAME = "$invalid";
                                // Loop on form properties
                                for (var property in $scope.elfinForm) {
                                    // Skip built in properties AND special IS_EXPECTED_INVALID_PROPERTY_NAME property
                                    if (property.lastIndexOf("$", 0) !== 0 && property !== IS_EXPECTED_INVALID_PROPERTY_NAME) {
                                        // As soon as a non-expected invalid property is found forbid upload
                                        if ($scope.elfinForm[property][IS_INVALID_PROPERTY_NAME]) {
                                            $log.debug(">>>> CANNOT UPLOAD: property " + property + " is not valid");
                                            return false;
                                        }
                                    }
                                }
                                return true;
                            } else { // Valid form: Ok
                                return true;
                            }
                        } else { // Proceed with regular situation
                            return $scope.canSave() || ($scope.elfinForm.$pristine && $scope.elfinForm.$valid);
                        }
                    };

                    $scope.flowFileAdded = function (file, event, flow) {
                        if (!!event) {
                            event.preventDefault(); //prevent file from uploading !?
                        }

                        if (!!event && event.type === "drop") {
                            if (!fileValidationRule.test(file.name)) {
                                hbAlertMessages.addAlert("warning", "Le nom de votre fichier contient des caractères non permis (accents, espaces, caractères spéciaux autre que point) : " + file.name);
                                // Reset file name to upload label CSS.
                                $scope.hbUploadStatusLabelCss = "label-info";
                                return false;
                            }
                            $scope.flowFileDropped(file, event, flow);
                        } else {
                            $scope.flowFileAddedAndTypeSelected(file, event);
                        }
                        return true;
                    };

                    var fileValidationRule = new RegExp(/^[a-zA-Z0-9_\-\.]+$/g);

                    $scope.flowFileDropped = function (file, event, flow) {

                        var modalInstance = $modal.open({
                            templateUrl: 'hbUploadFileTypeModal.html',
                            controller: 'AnnexeFileTypeSelectionController',
                            scope: $scope,
                            backdrop: 'static',
                            resolve: {
                                items: function () {
                                    return $scope.uploadFileTypes;
                                }
                            }
                        });


                        modalInstance.result.then(function (selectedItem) {
                            $scope.selectedUploadFileType = selectedItem;

                            GeoxmlService.getAnnex($scope.elfin.ID_G, $scope.elfin.Id, file.name).head()
                                .then(function () { // HTTP 200: warning file already exists
                                        var message = "L'annexe " + file.name + " existe déjà. Si vous ne désirez pas l'écraser par votre sélection courante, changer le nom de votre fichier et sélectionnez le à nouveau.";
                                        hbAlertMessages.addAlert("danger", message);
                                    },
                                    // HTTP 701: custom file not found code. Expected situation
                                    // every time a file to upload does not yet exist on the upload target: Ok.
                                    function (response) {
                                        // Do nothing
                                        $log.debug("Ok, checked annex " + file.name + " does not exist yet, custom HTTP status code = " + response.status);
                                        $scope.flowUpload(flow);
                                        // Reset file name to upload label CSS.
                                        $scope.hbUploadStatusLabelCss = "label-info";
                                    });

                        }, function () {
                            $scope.flowCancel(flow);
                            return false;
                        });
                    };


                    $scope.flowFileAddedAndTypeSelected = function (file) {

                        if ($scope.canUpload()) {
                            if ($scope.canSave()) {
                                hbAlertMessages.addAlert("info", "Le téléversement de votre fichier entrainera la sauvegarde automatique de vos modifications en cours.");
                            } else {
                                // Nothing to tell the user, the current elfin if pristine and valid and will stay so after the upload completed.
                            }
                        } else {
                            hbAlertMessages.addAlert("danger", "Le téléversement de votre fichier ne sera possible que lorsque les règles de validation de votre formulaire seront satisfaites. En effet, Le téléversement de votre fichier entrainera la sauvegarde automatique de vos modifications en cours.");
                        }


                        // Perform name substitution
                        var oldFileName = file.name;
                        var newFileName = file.name.replace(/[^a-zA-Z0-9_\-.]/g, '_');

                        if (!(oldFileName === newFileName)) {
                            file.name = newFileName;
                            hbAlertMessages.addAlert("warning", "Le nom de votre fichier a été modifié de: " + oldFileName + " à " + newFileName);
                        }

                        // Already exist check, using HTTP HEAD.
                        // Receiving HTTP 200 Ok means the user must be warn of already existing file
                        // while receiving HTTP 701 custom code means Ok: file was not found.
                        GeoxmlService.getAnnex($scope.elfin.ID_G, $scope.elfin.Id, file.name).head()
                            .then(function () { // HTTP 200: warning file already exists
                                    var message = "L'annexe " + file.name + " existe déjà. Si vous ne désirez pas l'écraser par votre sélection courante, changer le nom de votre fichier et sélectionnez le à nouveau.";
                                    hbAlertMessages.addAlert("danger", message);
                                },
                                // HTTP 701: custom file not found code. Expected situation
                                // every time a file to upload does not yet exist on the upload target: Ok.
                                function (response) {
                                    // Do nothing
                                    $log.debug("Ok, checked annex " + file.name + " does not exist yet, custome HTTP status code = " + response.status);
                                });

                        // Reset file name to upload label CSS.
                        $scope.hbUploadStatusLabelCss = "label-info";
                    };

                    $scope.flowUploadStarted = function () {
                        $scope.hbUploadStatusLabelCss = "label-success";
                    };

                    $scope.flowCancel = function (flow) {
                        // We are in single file mode
                        // check we have a single file
                        if (flow.files.length === 1) {
                            var file = flow.files[0];
                            flow.cancel();
                            // TODO: send API clean up instruction ?
                            hbAlertMessages.addAlert("info", "Le téléversement du fichier " + file.name + " a été annulé.");
                        } else if (flow.files.length > 1) {
                            flow.cancel();
                            hbAlertMessages.addAlert("warning", "Plusieurs fichiers sont sélectionnés pour le téléversement, c'est inattendu! Tous les téléversements ont été annulés.");
                        } else {
                            flow.cancel();
                            hbAlertMessages.addAlert("warning", "Aucun fichier sélectionné pour le téléversement!");
                        }
                        $scope.hbUploadStatusLabelCss = "label-info";
                    };

                    $scope.flowFileSuccess = function (file, message, flow) {

                        $log.debug("flowFileSuccess: About to add newRenvoi for file (before remove) = " + file.name);
                        flow.removeFile(file);
                        $log.debug("flowFileSuccess: About to add newRenvoi for file (after remove) = " + file.name);

                        var additionalTag = !!$scope.hbAnnexAutoTag ? $scope.hbAnnexAutoTag : $scope.$parent.hbAnnexAutoTag || "" ;
                        additionalTag = !!additionalTag ? "," + additionalTag : "";

                        if ($scope.elfin.ANNEXE) {
                            if ($scope.elfin.ANNEXE.RENVOI) {

                                var newRenvoi = {
                                    "POS": $scope.elfin.ANNEXE.RENVOI.length + 1,
                                    "LIEN": file.name,
                                    "VALUE": $scope.selectedUploadFileType.value + additionalTag
                                };
                                $scope.elfin.ANNEXE.RENVOI.push(newRenvoi);

                                $log.debug("flowFileSuccess: Added newRenvoi (POS, LIEN, VALUE): (" + newRenvoi.POS + ", " + newRenvoi.LIEN + ", " + newRenvoi.VALUE + ")");
                                for (var i = 0; i < $scope.elfin.ANNEXE.RENVOI.length; i++) {
                                    var currRENVOI = $scope.elfin.ANNEXE.RENVOI[i];
                                    $log.debug("RENVOI (POS, LIEN, VALUE): (" + currRENVOI.POS + ", " + currRENVOI.LIEN + ", " + currRENVOI.VALUE + ")");
                                }

                            } else {
                                //TODO: test this scenario
                                var newAnnexeRenvoiArrayWithSingleRENVOI = [{
                                    POS: 1,
                                    LIEN: file.name,
                                    VALUE: $scope.selectedUploadFileType.value + additionalTag
                                }];
                                $scope.elfin.ANNEXE.RENVOI = newAnnexeRenvoiArrayWithSingleRENVOI;
                                $log.debug("flowFileSuccess: Added newAnnexe: " + newAnnexeRenvoiArrayWithSingleRENVOI);
                            }
                        } else {
                            //TODO: test this scenario
                            var newAnnexeWithRenvoiArrayWithSingleRENVOI = {
                                RENVOI: [{
                                    POS: 1,
                                    LIEN: file.name,
                                    VALUE: $scope.selectedUploadFileType.value + additionalTag
                                }]
                            };
                            $scope.elfin.ANNEXE = newAnnexeWithRenvoiArrayWithSingleRENVOI;
                            $log.debug("flowFileSuccess: Added newAnnexe: " + newAnnexeWithRenvoiArrayWithSingleRENVOI);
                        }

                        // Automatically save elfin to server
                        $scope.saveElfin($scope.elfin);

                        // Update photo link
                        if ($scope.selectedUploadFileType.value === 'photo') {
                            $scope.updatePhotoSrc();
                        }

                        hbAlertMessages.addAlert("info", "Le fichier " + file.name + " a été téléversé avec succès.");
                        $scope.hbUploadStatusLabelCss = "label-info";
                    };

                    $scope.flowFileError = function (file, message) {
                        $log.debug("flowFileError(file = " + file.name + ", message = " + message + ")");
                        $scope.hbUploadStatusLabelCss = "label-danger";
                        hbAlertMessages.addAlert("danger", "Le téléversement du fichier " + file.name + " a échoué!");
                    };

                    $scope.hbUploadStatusLabelCss = "label-info";


                }]);

})();
