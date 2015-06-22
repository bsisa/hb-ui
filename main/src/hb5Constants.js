/**
 * hb5 module constants definition file aims at managing constants in a centralised location.
 * Angular constants can be used in the config as well as run phases unlike `value` which is 
 * not available in the config phase. 
 *  
 * @author Patrick Refondini 
 */

/**
 * Define collections ids
 */
angular.module('hb5').constant('HB_COLLECTIONS', {
	ACTOR_ID : "G20060401225530100",
	AMENAGEMENT_SPORTIF_ID : "G20150521080000006", 
	CITERNE_ID : "G20070424112639535",
	CONTRAT_ID : "G20081113902512301",
	EQUIPEMENT_ID : "G20070424112639535",
	EQUIPEMENT_SPORTIF_ID : "G20150602080000008",
	IMMEUBLE_ID : "G20040930101030005",
	INSTALLATION_SPORTIVE_ID : "G20150602080000007",
	INTRODUCTION_ELECTRICITE_ID : "G20070424161256578",
	LOCATION_UNIT_ID: "G20040930101030013",
	PRESTATION_ID : "G20081113902512302",
	PRODUCTION_CHALEUR_ID : "G20070424112639535",
	PRODUCTION_FROID_ID : "G20070424112639535",
	VENTILATION : "G20070424112639535",
	TRANSACTION_ID : "G20040930101030011",
	WC_ID: "G20040930101030007",
	FONTAINE_ID: "G20040930101030004",
	HORLOGE_ID: "G20120112160353499",
	ABRIBUS_ID: "G20060721160300001"
});


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
	ANNEXE_URL : "/api/melfin/annex/",
	ANNEXE_URL_PREFIX : "annex",
	ANNEXE_UPLOAD_URL : "/api/melfin/annex/upload",
	HTTP_HEADER_DATA_MANAGER_ACCESS_RIGHTS_CREATE_UPDATE : "HyperBird-Data-Manager-Access-Rights-Create-Update",
	HTTP_HEADER_DATA_MANAGER_ACCESS_RIGHTS_READ : "HyperBird-Data-Manager-Access-Rights-Read"
});



/**
 * Access rights roles are categorized in three groups: 
 * CLASSE (class), METIER (business), FONCTIONNALITE (functionality) 
 * The latter defines very specific access rights sometimes changing
 * GUI aspect or behaviour like making a specific field editable or 
 * not, a button enabled or disabled. 
 * The current constant centralises the strings related to the 
 * FONCTIONNALITE roles. 
 */
angular.module('hb5').constant('HB_ROLE_FONCTION', {
	ADMIN : "admin",
	DELETE : "delete",
	VALIDATION : "validation",
	BUILDING_EDIT : "immeuble-edit",
	BUILDING_EDIT_OTHER_PARTNERS : "immeuble-edit-autres-partenaires"
});