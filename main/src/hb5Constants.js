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
	ELFIN_CREATED : "hb5:elfin:createdEvent",
	ELFIN_UPDATED : "hb5:elfin:updatedEvent",
	ELFIN_DELETED : "hb5:elfin:deletedEvent",
    ELFIN_FORM_DRAW_EVENT : 'hb5:elfin:FormDrawEvent'
});



/**
 * Define API related collection ids, URL fragment,... as constants.
 * Some of these values might be refactored to server side configurations
 * in the future. Having them all already centralised will make 
 * this refactoring easier.
 */
angular.module('hb5').constant('HB_API', {
	ANNEXE_URL : "/api/melfin/annex/"
});