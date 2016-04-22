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
	ABRIBUS_ID: "G20060721160300001",
	ACTOR_ID : "G20060401225530100",
	AMENAGEMENT_SPORTIF_ID : "G20150521080000006", 
	CITERNE_ID : "G20070424112639535",
	CODE_ID : "G20150910130000002",
	COMMANDE_ID : "G20150910110000001",
	CONSTAT_ID : "G20060920171100001",
	CONTRAT_ID : "G20081113902512301",
	EQUIPEMENT_ID : "G20070424112639535",
	EQUIPEMENT_SPORTIF_ID : "G20150602080000008",
	FONTAINE_ID: "G20040930101030004",
	HORLOGE_ID: "G20120112160353499",
	IMMEUBLE_ID : "G20040930101030005",
	INSTALLATION_SPORTIVE_ID : "G20150602080000007",
	INTRODUCTION_ELECTRICITE_ID : "G20070424161256578",
	LOCATION_UNIT_ID: "G20040930101030013",
	PRESTATION_ID : "G20081113902512302",
	PRODUCTION_CHALEUR_ID : "G20070424112639535",
	PRODUCTION_FROID_ID : "G20070424112639535",
	ROLE_ID : "G10000101010101000",
	TRANSACTION_ID : "G20040930101030011",
	USER_ID : "G10000101010101000",
	VENTILATION : "G20070424112639535",	
	WC_ID: "G20040930101030007"

});


/**
 * Define accounting groups used as `hardcoded` references within application.
 * There are many more defined within the database but not required as constant.
 * The goal of these constants are to ease source code update that might be 
 * required by database value change which are seldom expected to happen.
 */
angular.module('hb5').constant('HB_ACCOUNTING_GROUPS', {
	DOM_TERRAIN_DDP : "Terrain – D.D.P.",
	DOM_BATIMENT_AGRICOLE : "Bâtiment agricole",
	DOM_BATIMENT_LOCATIF : "Bâtiment locatif",
	DOM_HANGAR_DEPOT : "Hangar et dépôt"

});


/**
 * Define events names as constants
 */
angular.module('hb5').constant('HB_EVENTS', {
	ACL_UPDATE : "ACL_UPDATE",
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
	DEV : "dev",	
	VALIDATION : "validation",
	BUILDING_EDIT : "immeuble-edit",
	BUILDING_EDIT_OTHER_PARTNERS : "immeuble-edit-autres-partenaires",
	AMENAGEMENT_SPORTIF_EDIT : "amenagement_sportif-edit",
	AMENAGEMENT_SPORTIF_EDIT_OTHER_PARTNERS : "amenagement_sportif-edit-autres-partenaires",	
	AMENAGEMENT_SPORTIF_EDIT_BUILDINGS_LIST : "amenagement_sportif-edit-immeubles-list",
	ORDERS_STATISTICS : "stat-commandes"
});


/**
 * Standard regexp patterns used throughout code.
 */
angular.module('hb5').constant('HB_REGEXP', {
	NUMERIC_POS_ONLY : /^\d*\.?\d*$/,
	NUMERIC_POS_AND_NEG_ONLY : /^[-]?\d*\.?\d*$/
});

/**
 * There is not 1-1 relationship from order type to order report type.
 * Check hbCommandeCardController for up to date relationship as well 
 * as ELFIN @CLASSE='IMPRESSION' level1 classifiers for available report types.
 */
angular.module('hb5').constant('HB_ORDER_REPORT_TYPE', {
	PURCHASE_ORDER_PROVIDER : "ORDER_PURCHASE_PROVIDER",
	PURCHASE_ORDER_TENANT : "ORDER_PURCHASE_TENANT",
	ORDER_CONFIRMATION : "ORDER_CONFIRMATION" ,
	CONTRACT : "ORDER_CONTRACT"
});


/**
 * Define order types required as `hardcoded` references within application.
 * There may be more defined within the database but not required as constant.
 */
angular.module('hb5').constant('HB_ORDER_TYPE', {
	PURCHASE : "Bon de commande",
	CONFIRMATION : "Confirmation de commande" ,
	CONTRACT : "Contrat d\'entreprise"
});


/**
 * Define order line types required as `hardcoded` references within application.
 * 
  val APPLIED_RATE = "APPLIED_RATE"  
  val GROSS_AMOUNT_TOTAL = "TOTAL_GROSS"
  val MANUAL_AMOUNT = "MANUAL_AMOUNT"
  val NET_AMOUNT_TOTAL = "TOTAL_NET"
  val NET_AMOUNT_TOTAL_INCL_TAX = "TOTAL_NET_INCL_TAX"
  val TAX_RATE = "TAX_RATE"
 */
angular.module('hb5').constant('HB_ORDER_LINE_TYPE', {
	APPLIED_RATE : "APPLIED_RATE",
	APPLIED_AMOUNT : "APPLIED_AMOUNT",
	GROSS_AMOUNT_TOTAL : "TOTAL_GROSS",
	MANUAL_AMOUNT : "MANUAL_AMOUNT" ,
	NET_AMOUNT_TOTAL : "TOTAL_NET",
	NET_AMOUNT_TOTAL_INCL_TAX : "TOTAL_NET_INCL_TAX",
	TAX_RATE : "TAX_RATE",
	EMPTY : "EMPTY"
});


/**
 * Define constants related to report service.
 */
angular.module('hb5').constant('HB_REPORT', {
	CLASSIFIER_LEVEL2_LABELS : "labels"
});

