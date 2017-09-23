(function() {
    /**
     * Directive checking the ng-model value does not match an existing USER value. (ELFIN[@CLASSE='USER'].IDENTIFIANT.NOM)
     */
    angular.module('hb5').directive('hbUniqueUser', ['hbQueryService', 'hbAlertMessages', '$log', function(hbQueryService, hbAlertMessages, $log) {

    	   return {
    		      require: 'ngModel',
    		      link: function(scope, elem, attr, ngModel) {
    		    	    		          
    		    	  /**
    		    	   * Function to check the current value for USER is not already used except if 
    		    	   * the existing value corresponds to the current edited USER.
    		    	   */
    		    	  var checkValid = function(userList, value) {
    		             var matchingUserDistinctFromCurrent = _.find(userList, function(user){ return ( user.IDENTIFIANT.NOM === value && user.Id !== scope.elfin.Id); });
    		             var valid = (matchingUserDistinctFromCurrent === undefined);
    		             return valid;
    		    	  };
    		    	  
			          // Asychronous existing USERs preloading
			          var xpathForUsers = "//ELFIN[@CLASSE='USER']";
			          hbQueryService.getUserList(xpathForUsers).then(
		        		  function(userList) {

		        			  // DOM to model validation
		    		          ngModel.$parsers.unshift(function(value) {
		    		        	  var valid = checkValid(userList, value);
		    		        	  ngModel.$setValidity('hbUniqueUser', valid);
		    		        	  return valid ? value : undefined;
		    		          });
	
		    		          // Model to DOM validation
		    		          ngModel.$formatters.unshift(function(value) {
		    		             ngModel.$setValidity('hbUniqueUser', checkValid(userList, value));
		    		             return value;
		    		          });								
		        		  },
		        		  function(response) {
							var message = "Le chargement des USERs existants a échoué (statut de retour: "+ response.status+ ")";
				            hbAlertMessages.addAlert("danger",message);
		        		  }
			          );
    		      }
    		   };
	
    }]);

})();
