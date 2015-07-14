(function() {
    /**
     * Directive checking the ng-model value does not match an existing ROLE value. (ELFIN[@CLASSE='ROLE'].IDENTIFIANT.NOM)
     */
    angular.module('hb5').directive('hbUniqueRole', ['hbQueryService', 'hbAlertMessages', '$log', function(hbQueryService, hbAlertMessages, $log) {

    	   return {
    		      require: 'ngModel',
    		      link: function(scope, elem, attr, ngModel) {
    		    	    		          
			          // Asychronous existing ROLEs preloading
			          var xpathForRoles = "//ELFIN[@CLASSE='ROLE']";
			          hbQueryService.getRoleList(xpathForRoles).then(
		        		  function(roles) {
							var rolesList = _.map(roles, function(role){ return role.IDENTIFIANT.NOM; });
							$log.debug(">>>> hbUniqueRole: rolesList = " + angular.toJson(rolesList));
							
		    		          // DOM to model validation
		    		          ngModel.$parsers.unshift(function(value) {
		    		             var valid = rolesList.indexOf(value) === -1;
		    		             ngModel.$setValidity('hbUniqueRole', valid);
		    		             return valid ? value : undefined;
		    		          });
	
		    		          // Model to DOM validation
		    		          ngModel.$formatters.unshift(function(value) {
		    		             ngModel.$setValidity('hbUniqueRole', rolesList.indexOf(value) === -1);
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
