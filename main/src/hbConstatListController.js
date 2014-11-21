(function() {

    angular.module('hb5').controller('HbConstatListController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbConstatListController called... " );

    	// Default order is by "Groupe" 
    	$scope.predicate = 'IDENTIFIANT.DE';
    	$scope.reverse = true;
   	
    	$scope.search = {
    			"last_resp" : "",
    			"description" : "",
    			"constat_date" : "",
    			"partenaire_usager" : "",
    			"constat_group" : "",
    			"constat_noSAI" : ""
    	}; 
        
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
    	

    	/**
    	 * Compute duration difference between echeance date and now to produce meaningful user status. 
    	 */
    	$scope.getEcheanceStatus = function(echeanceTextDate) {

    		// Get moment date from text date 
    		var echeanceDate = moment(hbUtil.getDateFromHbTextDateFormat(echeanceTextDate));
    		// Define current date to compare from
    		var currentDate = moment();
    		// Compute number of days difference between echeance and current date.
    		var daysDiff = echeanceDate.diff(currentDate, 'days');
    		
    		var status = null;
    		// Negative difference means overdue schedule
    		if (daysDiff < 0) {
				status = 'Retard';
    		} else if (daysDiff >= 0 && daysDiff <= 365) {
    			status = '+' + daysDiff;
    		} else {
    			status = '>365';
    		}
	    	return status;
    	};
    	
    	
    }]);


})();

