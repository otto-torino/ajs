/**
 * Abidibo Javascript Library namespace
 * @namespace
 */
var ajs;
if (!ajs) ajs = {};
else if( typeof ajs != 'object') {
	throw new Error('ajs already exists and is not an object');
}

/**
 * Meta information about the library 
 * @property {String} version The library version number
 */
ajs.meta = {
	version: 'dev'
}

/**
 * @summary Namespace extension
 * @memberof ajs
 * @description Extends the parent namespace with the deep object given
 * @param {Object} obj The deep object
 * @param {Object} [parent=ajs] The namespace to be extended
 * @return {Object} the extended namespace
 * @example
 * 	// creates ajs.utilities.widgets and ajs.utilities.ui namespaces
 * 	ajs.extend({utilities: { widgets: {}, ui: {} }}); 	
 */
ajs.extend = function(obj, parent) {

	if (typeof parent === 'undefined') {
		parent = ajs;
	}
	var toString = Object.prototype.toString,
	    objTest = toString.call({});

	for (var property in obj) {
		if (obj[property] && objTest == toString.call(obj[property])) {
			parent[property] = parent[property] || {};
			ajs.extend(obj[property], parent[property]);
		} 
		else {
			parent[property] = obj[property];
		}
	}

	return parent;
}

/**
 * @summary Library loader
 * @memberof ajs
 * @description Loads dinamically the requested ajs module and executes the given callback when loading is complete
 * @param {Mixed} mdls The module name or an array of module's names
 * @param {Function} callback The function to execute when all modules are loaded and ready
 * @example 
 * 	ajs.use(['ajs.ui.tree'], function() {
 *		// the library is ready
 *		var mt = new ajs.ui.tree.mootree('myelement');
 * 	})
 */
ajs.use = function(mdls, callback) {

	// get ajs.js path
	var root = $$('script[src$=ajs.js]')[0].get('src').replace(/ajs\.js/, '');

	if(typeOf(mdls) === 'string') {
		mdls = [mdls];
	}
	
	// callback called every time a module is loaded, when all are loaded the callback is executed
	var loaded = function(mdl) {
		mdls.erase(mdl);
		if(mdls.length === 0) {
			callback();
		}	
	}

	for(var i = 0; i < mdls.length; i++) {
		
		var mdl = mdls[i];
		var src = root + 'src' + mdl.replace(/^ajs/, '').replace(/\./g, '/') + '.js';

		var script = new Element('script', {type: 'text/javascript'});

		if (script.readyState) {  //IE
			script.onreadystatechange = function(){
            
				if (script.readyState == "loaded" || script.readyState == "complete") {
					script.onreadystatechange = null;
					loaded(mdl);
				}
			};
		} 
		else {  //Others
			script.onload = function(){
				loaded(mdl);
			};
		}

		script.src = src;
    
		document.head.appendChild(script);
	}
	
};

/**
 * @summary Css loader 
 * @memberof ajs
 * @param {String} path The css file path relative to the <b>res/css</b> directory
 * @example
 *     ajs.css('example.css');
 *     ajs.css('asubdir/example.css');
 */
ajs.css = function(path) {

	// get ajs.js path
	var root = $$('script[src$=ajs.js]')[0].get('src').replace(/ajs\.js/, '');
	var link = new Element('link', {rel: 'stylesheet', type: 'text/css', href: root + 'res/css/' + path});

	document.head.appendChild(link);

}

/* shared */

/**
 * @summary Set of shared functions
 * @namespace ajs.shared 
 * @description <p>Set of functions of general interest</p>
 */
ajs.extend({ shared: {} });

/**
 * @summary Gets the viewport coordinates of the current window (width, height, left offest, top offset, coordinates of the center point).
 * @memberof ajs.shared 
 * @method
 * @return {Object} Viewport coordinates
 * @example
 *      // returned object
 *	{'width':width, 'height':height, 'left':left, 'top':top, 'cX':cX, 'cY':cY}
 */
ajs.shared.getViewport = function() {
	
	var width, height, left, top, cX, cY;

	// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
	if (typeof window.innerWidth != 'undefined') {
		width = window.innerWidth,
		      height = window.innerHeight
	}
	// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
	else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth !='undefined' && document.documentElement.clientWidth != 0) {
		width = document.documentElement.clientWidth,
		      height = document.documentElement.clientHeight
	}

	top = typeof self.pageYOffset != 'undefined' 
		? self.pageYOffset 
		: (document.documentElement && document.documentElement.scrollTop)
		? document.documentElement.scrollTop
		: document.body.clientHeight;

	left = typeof self.pageXOffset != 'undefined' 
		? self.pageXOffset 
		: (document.documentElement && document.documentElement.scrollTop)
		? document.documentElement.scrollLeft
		: document.body.clientWidth;

	cX = left + width/2;
	cY = top + height/2;

	return {'width':width, 'height':height, 'left':left, 'top':top, 'cX':cX, 'cY':cY};

}

/**
 * @summary Gets the maximum z-index in the document.
 * @memberof ajs.shared 
 * @method
 * @return {Number} The maximum z-index
 */
ajs.shared.getMaxZindex = function() {
	var max_z = 0;
	$$('body *').each(function(el) {
		if(el.getStyle('z-index').toInt()) max_z = Math.max(max_z, el.getStyle('z-index').toInt());
	});

	return max_z;
}

// define grouping namespaces

/**
 * @summary Set of interactive maps modules
 * @namespace ajs.maps 
 * @description <p>Set of modules (namespaces) which contains class used to perform interactive map operations.</p>
 */
ajs.extend({ maps: {} });

/**
 * @summary Set of tool modules
 * @namespace ajs.tools 
 * @description <p>Set of modules (namespaces) which contains tools to use in different situations.</p>
 */
ajs.extend({ tools: {} });

/**
 * @summary Set of user interface modules
 * @namespace ajs.ui 
 * @description <p>Set of modules (namespaces) which contains user interface resources.</p>
 */
ajs.extend({ ui: {} });
