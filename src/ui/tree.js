/**
 * @namespace ajs.ui.tree
 * @memberof ajs.ui
 */
ajs.extend({ tree: {} }, ajs.ui);

// look at initialize method for class description
ajs.ui.tree.mootree = (function()  {

	// private members
	var _private = {};

	var _mootreelist = new Class({

		initialize: function(element, level, options) {

			this.list = element;
			this.elements = [];
			this.list.getChildren('li').each(function(el) { 
				el.setProperty('data-level', level); 
				this.elements.push(new _mootreelistelement(el, level, options)); 
			}.bind(this));

		},
		collapse: function() {
			this.list.setStyle('display', 'none');
			this.status = 'collapsed';
		},
		expand: function() {
			this.list.setStyle('display', 'block');
			this.status = 'expanded';
		}
	
	});

	var _mootreelistelement = new Class({
		Implements: [Options],
		options: {
			collapsed:  true,
			expand_level: null	
		},
		initialize: function(element, level, options) {

			this.setOptions(options);

			this.level = level;
			this.element = element;

			if(typeof this.element.getChildren('ul')[0] != 'undefined') {
				this.children = new _mootreelist(this.element.getChildren('ul')[0], level+1, options);
				if(this.collapseChildren()) this.children.collapse();
				this.addController();
			}
			else this.children = null;
	
		},
		addController: function() {
		
			this.controller = new Element('div');
			this.controller.addClass('mootree_ctrl');
			this.setController();
			this.controller.inject(this.element, 'top');
			this.controller.addEvent('click', this.toggle.bind(this));
		},
		toggle: function() {
			if(this.children.status === 'collapsed') this.children.expand();	
			else this.children.collapse();
			this.setController();
		},
		setController: function() {

			if(this.children.status === 'collapsed') {
				if(this.controller.hasClass('mootree_less')) this.controller.removeClass('mootree_less');
				this.controller.addClass('mootree_more');
			}		
			else {
				if(this.controller.hasClass('mootree_more')) this.controller.removeClass('mootree_more');
				this.controller.addClass('mootree_less');
			}
		},
		collapseChildren: function() {

			if(!this.options.collapsed) return false;
	
			if(this.element.getProperty('data-expanded')) return false;
		
			if(this.options.expand_level != null && this.level<this.options.expand_level) return false;

			var expanded = this.children.list.getElements('li[data-expanded=1]');
			if(typeof expanded != 'undefined' && expanded.length > 0) return false;
		
			var selected = this.children.list.getElements('li[class~=selected]');
			if(typeof selected != 'undefined' && selected.length > 0) return false;

			return true;
		}
	
	})

	return new Class({
		
		Implements: [Options],
		options: {
			load_css: true,
			expand_top: false,
			collapsed: true,
			expand_level: null
		},
		/**
		 * @summary Navigation tree user interface.
		 * @classdesc <p>The class creates a navigable tree starting from an unordered html list (ul tag). It inserts the right controllers in order 
		 *            to collapse/expand trees. Every graphical aspect may be controlled by simple css stylesheet.</p>
		 *            <p>Available functionality:
		 *            <ul>
		 *            <li><b>Expand top</b>: initially expand all the first tree (a classical blog archive behavior)</li>
		 *            <li><b>Collapse all</b>: initially collapse or expand all trees</li>
		 *            <li><b>Expand level</b>: initially expand the tree at a given level (beginning from level 0 which is always expanded)</li>
		 *            <li><b>Attribute data-expanded</b>: if a li element has the attribute data-expanded set to 1, then the tree is expanded in order to show it initially</li>
		 *            <li><b>Selected item</b>: the selected item (must have a css class named selected) is always shown initially</li>
		 * @constructs ajs.ui.tree.mootree
		 * @param {String|Element} element the unordered list dom element or its id attribute
		 * @param {Object} options The class options object
		 * @param {Boolean} [options.load_css=true] Whther to load or not the default css, you may provide your own one
		 * @param {Boolean} [options.expand_top=false] Whether or not to expand completely the first branch
		 * @param {Boolean} [options.collapsed=true] Whther or not to initially collapse the tree
		 * @param {Number} [options.expand_level=null] The tree level to expand. Level 0 are all the first voices (always shown)
		 * @example
		 * 	var mt = new ajs.ui.tree.mootree('myelement', {expand_top: true});
		 */
		initialize: function(element, options) {

			this.id = String.uniqueID();

			if(options) this.setOptions(options);

			if(this.options.load_css) {
				// load the css stylesheet
				ajs.css('mootree.css');
			}

			var main_list;

			if(typeOf(element )=== 'string') main_list = $(element);
			else if(typeOf(element) === 'element') main_list = element;
			else console.log('invalid list element passed'); 

			main_list.addClass('mootree');
			if(this.options.expand_top) {
				var fli = main_list.getChildren('li')[0];
				while(typeof fli != 'undefined') {
					if(typeof fli.getChildren('ul')[0] != 'undefined') {
						fli = fli.getChildren('ul')[0].getChildren('li')[0];
					}
					else {
						fli.getParents('li')[0].setProperty('data-expanded', 1);
						fli = undefined;
					}
				}
			}
		
			this.main_tree_list = new _mootreelist(main_list, 0, options);
		}

	});
}());
