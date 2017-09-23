(function() {
    /**
     * Directive checking the ng-model value does not match an existing ROLE value. (ELFIN[@CLASSE='ROLE'].IDENTIFIANT.NOM)
     */
    angular.module('hb5').directive('hbUniqueRole', ['hbQueryService', 'hbAlertMessages', '$log', function(hbQueryService, hbAlertMessages, $log) {

    	   return {
    		      require: 'ngModel',
    		      link: function(scope, elem, attr, ngModel) {
    		    	    		          
    		    	  /**
    		    	   * Function to check the current value for ROLE is not already used except if 
    		    	   * the existing value corresponds to the current edited ROLE.
    		    	   */
    		    	  var checkValid = function(rolesList, value) {
    		             var matchingRoleDistinctFromCurrent = _.find(rolesList, function(role){ return ( role.IDENTIFIANT.NOM === value && role.Id !== scope.elfin.Id); });
    		             var valid = (matchingRoleDistinctFromCurrent === undefined);
    		             return valid;
    		    	  };
    		    	  
			          // Asychronous existing ROLEs preloading
			          var xpathForRoles = "//ELFIN[@CLASSE='ROLE']";
			          hbQueryService.getRoleList(xpathForRoles).then(
		        		  function(rolesList) {

		        			  // DOM to model validation
		    		          ngModel.$parsers.unshift(function(value) {
		    		        	  var valid = checkValid(rolesList, value);
		    		        	  ngModel.$setValidity('hbUniqueRole', valid);
		    		        	  return valid ? value : undefined;
		    		          });
	
		    		          // Model to DOM validation
		    		          ngModel.$formatters.unshift(function(value) {
		    		             ngModel.$setValidity('hbUniqueRole', checkValid(rolesList, value));
		    		             return value;
		    		          });								
		        		  },
		        		  function(response) {
							var message = "Le chargement des ROLEs existants a échoué (statut de retour: "+ response.status+ ")";
				            hbAlertMessages.addAlert("danger",message);
		        		  }
			          );
    		      }
    		   };
	
    }]);

})();
