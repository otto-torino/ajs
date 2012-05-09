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
	version: '0.1'
}

/**
 * @summary Namespace extension
 * @memberof ajs
 * @description Extends the parent namespace with the deep object given
 * @param obj The deep object
 * @param [parent=ajs] The namespace to be extended
 * @return {Object} the extended namespace
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
 * @param mdls {Mixed} The module name or an array of module's names
 * @param callback The function to execute when all modules are loaded and ready
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
 *     ajs.resource('example.css');
 *     ajs.resource('asubdir/example.css');
 */
ajs.css = function(path) {

	// get ajs.js path
	var root = $$('script[src$=ajs.js]')[0].get('src').replace(/ajs\.js/, '');
	var link = new Element('link', {rel: 'stylesheet', type: 'text/css', href: root + 'res/css/' + path});

	document.head.appendChild(link);

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
