(function() {
    /**
     * Directive checking the ng-model value does match an existing CODE value. (ELFIN[@CLASSE='CODE'].IDENTIFIANT.NOM)
     */
    angular.module('hb5').directive('hbValidCode', ['hbQueryService', 'hbAlertMessages', '$log', function(hbQueryService, hbAlertMessages, $log) {

    	   return {
    		      require: 'ngModel',
    		      link: function(scope, elem, attr, ngModel) {
    		    	    		          
    		    	  // TODO: should come from an optional hb-valid-code-for-group  attribute
    		    	  var codeGroupe = "CFC";
    		    	  
    		    	  /**
    		    	   * Function to check the current value for CODE does exist.
    		    	   */
    		    	  var checkValid = function(codesList, value) {
						// We expect value as: code.IDENTIFIANT.NOM + " - " + code.DIVERS.REMARQUE 
						// We want to test the NOM corresponding to the CODE numeric value.
						var valueToCheck = value.split(" ", 1)[0];
						var matchingValidCode = _.find(codesList, function(code){ return ( code.IDENTIFIANT.NOM === valueToCheck ); });
						$log.debug("hbValidCode: matchingValidCode = " + angular.toJson(matchingValidCode) + " for valueToCheck " + valueToCheck);
						var valid = (matchingValidCode !== undefined);
						return valid;
    		    	  };
    		    	  
			          // Asychronous existing CODEs preloading
			          var xpathForCodes = "//ELFIN[@CLASSE='CODE' and @GROUPE='"+codeGroupe+"']";
			          hbQueryService.getCodes(xpathForCodes).then(
		        		  function(codesList) {

		        			  $log.debug("hbValidCode: found " + codesList.length + " codes.");
		        			  
		        			  // Add DOM to model validation function to $parsers functions array, 
		        			  // leaving value unchanged
		    		          ngModel.$parsers.unshift(function(value) {
		    		        	  var valid = checkValid(codesList, value);
		    		        	  ngModel.$setValidity('hbValidCode', valid);
		    		        	  //return valid ? value : undefined;
		    		        	  return value;
		    		          });
	
		    		          // Add model to DOM validation function to $formatters functions array, 
		        			  // leaving value unchanged
		    		          ngModel.$formatters.unshift(function(value) {
		    		             ngModel.$setValidity('hbValidCode', checkValid(codesList, value));
		    		             return value;
		    		          });								
		        		  },
		        		  function(response) {
							var message = "Le chargement des CODEs existants a échoué (statut de retour: "+ response.status+ ")";
				            hbAlertMessages.addAlert("danger",message);
		        		  }
			          );
    		      }
    		   };
	
    }]);

})();
