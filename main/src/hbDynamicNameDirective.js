(function() {
    /**
     * Directive to allow use of dynamically evaluated HTML input name attribute.
     */
    angular.module('hb5').directive('hbDynamicName', ['$compile', '$parse', function ($compile, $parse) {
        return {
            restrict: 'A',
            priority: 9999999, // We would like it processed first in case another directive relies on HTML input name attribute.
            link: function(scope, element) {
                var nameValue = $parse(element.attr('hb-dynamic-name'))(scope);
                element.removeAttr('hb-dynamic-name');
                element.attr('name', nameValue);
                $compile(element)(scope);
            }
        };
    }]);
    	                 

})();