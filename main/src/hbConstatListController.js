(function() {

    angular.module('hb5').controller('HbConstatListController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbConstatListController called... " );

    	// Default order is by "Groupe" 
    	$scope.predicate = 'GROUPE';
    	$scope.reverse = false;
        
    	$scope.getPhaseAbbreviation = function (phase) {
//    		$log.debug(">>> getPhaseAbbreviation for phase = " + phase);
    		var abbrev = null;
	    	if (phase == 'Analyse') { abbrev = 'A'; } 
	    	else if (phase == 'Avant-Projet') { abbrev = 'AP'; }
	    	else if (phase == 'Appel d offre et Adjudication') { abbrev = 'ADJ'; }
	    	else if (phase == 'Exécution') { abbrev = 'EXE'; }
	    	else if (phase == 'Réception') { abbrev = 'REC'; }
	    	else { abbrev = 'ND'; }
	    	return abbrev;
    	};
    	
    	var addDays = function addDays(date, days) {
    	    var result = new Date(date);
    	    result.setDate(date.getDate() + days);
    	    return result;
    	};    	
    	
    	$scope.getEcheanceStatus = function(date) {
    		
    		var echeanceDate = hbUtil.getDateFromHbTextDateFormat(date);
    		var currentDate = new Date();
    		var currentDatePlus7Days = addDays(new Date(), 7);
    		var currentDatePlus14Days = addDays(new Date(), 14);
    		var currentDatePlus21Days = addDays(new Date(), 21);
    		var currentDatePlus30Days = addDays(new Date(), 30);
    		var currentDatePlus365Days = addDays(new Date(), 365);
    		
//    		$log.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
//    		$log.debug("getEcheanceStatus : echeanceDate = " + echeanceDate + " - currentDate = " + currentDate);
//    		$log.debug("getEcheanceStatus : echeanceDate = " + echeanceDate + " - currentDatePlus7Days = " + currentDatePlus7Days);
//    		$log.debug("getEcheanceStatus : echeanceDate = " + echeanceDate + " - currentDatePlus14Days = " + currentDatePlus14Days);
//    		$log.debug("getEcheanceStatus : echeanceDate = " + echeanceDate + " - currentDatePlus21Days = " + currentDatePlus21Days);
//    		$log.debug("getEcheanceStatus : echeanceDate = " + echeanceDate + " - currentDatePlus30Days = " + currentDatePlus30Days);
//    		$log.debug("getEcheanceStatus : echeanceDate = " + echeanceDate + " - currentDatePlus365Days = " + currentDatePlus365Days);
//    		$log.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");    		

    		var status = null;
    		
    		if (echeanceDate < currentDate) {
				status = 'Retard';
			} else if (echeanceDate >= currentDate
					&& echeanceDate < currentDatePlus7Days) {
				status = '+7';
			} else if (echeanceDate >= currentDatePlus7Days
					&& echeanceDate < currentDatePlus14Days) {
				status = '+14';
			} else if (echeanceDate >= currentDatePlus14Days
					&& echeanceDate < currentDatePlus21Days) {
				status = '+21';
			} else if (echeanceDate >= currentDatePlus21Days
					&& echeanceDate < currentDatePlus30Days) {
				status = '+30';
			} else if (echeanceDate >= currentDatePlus30Days
					&& echeanceDate < currentDatePlus365Days) {
				status = '+365';
			} else {
				status = '>365';
			}
	    	return status;
    	};
    	
    	
    }]);


})();

