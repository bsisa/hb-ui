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
	DISPLAY_MAP_CONTENT : "hb5:display:MapContentEvent",
	DISPLAY_MAP_VIEW : "hb5:display:MapViewEvent",
	ELFIN_LOADED : "hb5:elfin:loadedEvent",
	ELFIN_UNLOADED : "hb5:elfin:unloadedEvent",
	ELFIN_UPDATED : "hb5:elfin:updatedEvent",
	ELFIN_DELETED : "hb5:elfin:deletedEvent",
    ELFIN_FORM_DRAW_EVENT : 'hb5:elfin:FormDrawEvent'
});