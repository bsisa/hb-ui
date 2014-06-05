/**
 * hb5 module constants definition file aims at managing constants in a centralised location.
 * Angular constants can be used in the config as well as run phases unlike `value` which is 
 * not available in the config phase. 
 *  
 * @author Patrick Refondini 
 */

/**
 * Define events names as constants
 */
angular.module('hb5').constant('HB_EVENTS', {
	DISPLAY_MAP_CONTENT : "displayMapContentEvent",
	DISPLAY_MAP_VIEW : "displayMapViewEvent",
	ELFIN_UPDATED : "elfinUpdatedEvent"
});