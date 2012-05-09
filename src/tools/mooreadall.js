// load the css stylesheet
ajs.css('mooreadall.css');

// look at initialize method for class description
ajs.tools.mooreadall = (function()  {

	// private members
	var _private = {};

	return new Class({

		Implements: [Options],
		// options: global options
		options: {
			words: 60,
			remove_tags: [], // 'all' | array with tag elements
			display_style: 'block', // block | inline | <all display allowed properties> | visible (visibility instead of display) | none
			truncate_characters: '...',
			action_label: 'read all',
			action: 'layer', // inplace' | 'layer' | 'link' | 'callback'
			return_label: 'back', // inplace type
			layer_id: '', // need to customize every layer?
			layer_width: 800,
			layer_draggable: false,
			layer_resizable: false,
			layer_text_resizable: false,
			link_href: '',
			link_target: '_blank',
			callback: null,
			callback_param: null
		},
		/**
		 * @summary Tool designed to cut html string preserving the html structure, without breaking tags.
		 * @classdesc <p>Provides a "read all" link which may call other pages, callback functions, open a layer or show the whole content in the same element</p>
		 *
		 * @constructs ajs.tools.mooreadall
		 * @param {Object} [options] A class options object
		 * @param {Number} [options.words=60] The number of words after which the text is cut off.
		 * @param {String|Array} [options.remove_tags=new Array()] Tag elements to be removed. Possible values are:
		 *                                                 <ul>
		 *                                                 <li>"all": all tags are removed</li>
		 *                                                 <li>["tag1", "tag2"]: only the listed tags are removed</li>
		 *                                                 </ul>
		 * @param {String} [options.display_style='block'] I don't like at all to see a whole content reduce itself after a while, I prefer to see a cut content growing up from an empty element.<br /> 
		 *                                                 So mooReadAll hide the element whose content is cut and show it again when computation finishes. The best would be to hide directly the 
		 *                                                 element and have mooReadAll to show it. With this option is possible to decide which style property to use: 
		 *                                                 the display or the visibility one. Possible values are:
		 *                                                 <ul>
		 *                                                 <li>"none": the hide/show actions are skipped</li>
		 *                                                 <li>"visible": the visibility style is used ('hidden' and 'visible')</li>
		 *                                                 <li>"every display style": the element is hidden setting "display: none" and the shown setting display to the value 
		 *                                                     passed ('block', 'inline', 'table', 'list-item', ...)</li>
		 * @param {String} [options.truncate_characters='...'] Characters displayed after text truncation			
		 * @param {String} [options.action_label='read all'] Text of the link which displays the whole content			
		 * @param {String} [options.action='layer'] The action to perform when clicking the action_label link. Possible values are:
		 *                                          <ul>
		 *                                          <li>"inplace": the whole content is rendered inside the same element, a back button appears so that the content may be expanded/compressed 
		 *                                              infinite times</li>
		 *                                          <li>"link": the action_label links to another page (an anchor tag)</li>
		 *                                          <li>"callback": a callback function to call when clicking the action_label link. The first parameter passed to callback is the element, 
		 *                                              then a custom parameter and finally the context of the mooreadall object is passed also</li>
		 *                                          <li>"layer": the whole content is displayed in a layer over the document (lightbox style). It's possible to activate some controls: 
		 *                                              drag, resize, text-resize</li>
		 *                                          </ul>
		 * @param {String} [options.return_label='back'] Used by the action "inplace" type. Is the link label which appears after expanding the whole content in order to compress it again	
		 * @param {String} [options.layer_id=''] Used by the action "layer" type. if you need to customize every layer, this id is assigned to the id attribute of the layer.  			
		 * @param {Number} [options.layer_width=800] Used by the action "layer" type: The width of the layer. Its height may be set by css. 			
		 * @param {Number} [options.layer_draggable=fase] Used by the action "layer" type. Whether to make the layer draggable or not. 			
		 * @param {Number} [options.layer_resizable=fase] Used by the action "layer" type. Whether to make the layer resizable or not. 			
		 * @param {Number} [options.layer_text_resizable=fase] Used by the action "layer" type. Whether to make the layer text resizable or not. 			
		 * @param {String} [options.link_href=fase] Used by the action "link" type. The url to link the action_label to.  			
		 * @param {String} [options.link_target='_blank'] Used by the action "link" type. The target attribute of the anchor tag. 			
		 * @param {Function} [options.callback=null] Used by the action "callback" type. The callback function to call when clicking the action_label link. 			
		 * @param {Mixed} [options.callback_param=null] Used by the action "callback" type. A custom parameter to pass to the callback function. 			
		 * @example
		 * 	var mr = new ajs.tools.mooreadall({
		 *		action: 'inplace'
		 *	});
		 *	mr.add('.expand');
		 *
		 */
		initialize: function(options) {

			this.id = String.uniqueID();

			_private[this.id] = {
				max_z_index: this.getMaxZindex(),
				max_text_size: 22,
				min_text_size: 8
			};

			if(options) this.setOptions(options);
	
		},
		/**
		 * @summary Creates the object used to apply the tool, merging global options and local options (passed to the add or apply methods)
		 * @memberof ajs.tools.mooreadall.prototype
		 * @method
		 * @protected
		 * @return {Object} The final options object
		 */		 
		setProperties: function(opts) {

			var prop = {
				words: typeof opts.words != 'undefined'
	     				? opts.words.toInt()
	    				: this.options.words.toInt(),
				remove_tags: typeOf(opts.remove_tags) === 'array' || (typeOf(opts.remove_tags) === 'string' && opts.remove_tags === 'all')
		   			? opts.remove_tags 
					: this.options.remove_tags,
				truncate_characters: typeOf(opts.truncate_characters) === 'string' 
			    		? opts.truncate_characters
					: this.options.truncate_characters,

				display_style: typeOf(opts.display_style) === 'string' 
			    		? opts.display_style
					: this.options.display_style,
				action: typeOf(opts.action) === 'string' 
		    			? opts.action
					: this.options.action,
				action_label: typeOf(opts.action_label) === 'string' 
		    			? opts.action_label
					: this.options.action_label,	
				return_label: typeOf(opts.return_label) === 'string'
			    		? opts.return_label
					: this.options.return_label,
				link_href: typeOf(opts.link_href) === 'string'
					? opts.link_href
					: this.options.link_href,
				link_target: typeOf(opts.link_target) === 'string'
			    		? opts.link_target
					: this.options.link_target,
				callback: typeOf(opts.callback) === 'function'
			    		? opts.callback
					: this.options.callback,
				callback_param: typeof opts.callback_param != 'undefined'
			    		? opts.callback_param
					: this.options.callback_param,
				layer_id: typeOf(opts.layer_id) === 'string'
		     			? opts.layer_id
		    			: this.options.layer_id,
				layer_width: typeof opts.layer_width != 'undefined'
	     				? opts.layer_width.toInt()
	    				: this.options.layer_width.toInt(),
				layer_draggable: typeOf(opts.layer_draggable) === 'boolean'
	     				? opts.layer_draggable
	    				: this.options.layer_draggable,
				layer_resizable: typeOf(opts.layer_resizable) === 'boolean'
	     				? opts.layer_resizable
	    				: this.options.layer_resizable,
				layer_text_resizable: typeOf(opts.layer_text_resizable) === 'boolean'
		     			? opts.layer_text_resizable
		    			: this.options.layer_text_resizable
			}

			return prop;

		}.protect(),
		/**
		 * @summary Applies the text truncation to the given elements with the given options 
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param {Mixed} elements The elements whose content has to be truncated. Possible values are:
		 *                         <ul>
		 *                         <li>A css selector</li>
		 *                         <li>An array of dom elements</li>
		 *                         <li>A dom element</li>
		 *                         </ul>
		 * @param {Object} opts The options to use when performing the cut action, see the constructor for the available options 
		 * @return void
		 * 	
		 */
		add: function(elements, opts) {

			if(typeOf(elements)==='string') _private[this.id].elements = $$(elements);
			else if(typeOf(elements)==='elements') _private[this.id].elements = elements;
			else if(typeOf(elements)==='element') _private[this.id].elements = [elements];
			else _private[this.id].elements = [];

			for(var i = 0; i < _private[this.id].elements.length; i++) {
				this.apply(_private[this.id].elements[i], opts);
			}
		},
		/**
		 * @summary Applies the text truncation to the given element with the given options 
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param {Element} element The dom element
		 * @param {Object} opts The options to use when performing the cut action 
		 * @return void
		 * 	
		 */
		apply: function(element, opts) {

			// local options may override global ones
			if(typeOf(opts) !== 'object') opts = {};
			var prop = this.setProperties(opts);

			// store the full html text
			var html = element.get('html');

			// hide elementing while computing (better if element is already hidden)
			this.hideElement(element, prop);

			// new cut text and "read all" action link
			var cut_html = this.cut(html, prop);
			var action_link = this.actionLink(element, html, cut_html, prop);

			element.set('html', cut_html);
			action_link.inject(element, 'bottom');

			// now that computing finishes show the element
			this.showElement(element, prop);
		},
		/**
		 * @summary Hides the element which contains the text to truncate basing upon the display_style option 
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param {Element} element The dom element
		 * @param {Object} prop The definitive option object 
		 * @method
		 * @protected
		 * @return void
		 * 	
		 */
		hideElement: function(element, prop) {
			if(prop.display_style=='none') return 0;	     
			else if(prop.display_style=='visible') element.style.visibility = 'hidden';
   			else element.style.display = 'none';		
		}.protect(),
		/**
		 * @summary Shows the element which contains the text to truncate basing upon the display_style option 
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param {Element} element The dom element
		 * @param {Object} prop The definitive option object 
		 * @method
		 * @protected
		 * @return void
		 * 	
		 */
		showElement: function(element, prop) {
			if(prop.display_style=='none') return 0;	     
			if(prop.display_style=='visible') element.style.visibility = prop.display_style;	     
   			else element.style.display = prop.display_style;		
		}.protect(),
		/**
		 * @summary Performs the cut of the html content preserving the html structure and good formatting  
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param {String} html The whole html content to cut. Global or local options are used (number of words, remove_tags)
		 * @param {Object} prop The definitive option object 
		 * @return {String} The truncated html text
		 * 	
		 */
		cut: function(html, prop) {
			// open close tags like <br /> are changed by javascript innerHTML function to <br>
			var rexp_open_tag = "<([a-zA-Z]+)\s?[^>]*?>";	       
			var rexp_close_tag = "<\/([a-zA-Z]+)>";
			var rexp_tag = "<\/?[a-zA-Z]+\s?[^>]*?\/?>";	       
			var ot_regexp = new RegExp(rexp_open_tag);
			var ct_regexp = new RegExp(rexp_close_tag);

			// if text words are less than prop.words return html
			var replace_regexp = new RegExp(rexp_open_tag+"|"+rexp_close_tag, "g");
			var text = html.replace(replace_regexp, "");

			var text_array = text.split(" ");
			if(text_array.length <= prop.words) return html;

			// else cut!
			// get all <opentag|closetag|openclosetag>text till other < divided in matches
			var parse_regexp = new RegExp("("+rexp_tag+")?[^<]*", "g");
			var matches = html.match(parse_regexp);
			var cut_html = '';
			var opened_tag = [];
			var counter = 0;
			for(var i=0; i<matches.length; i++) {
		    		if(matches[i].trim()) {
					var part = matches[i];
					// separate the tag part and the text part
					var part_regexp = new RegExp("("+rexp_tag+")?([^<]*)", "g");
					part_matches = part_regexp.exec(part);
					if(typeof part_matches[1] != 'undefined') {
						var tag = part_matches[1];
						// is an open tag?
						if(tag_match = tag.match(ot_regexp)) {
							tag_name = tag_match[1];
							// if tag is to be removed
							if(prop.remove_tags.contains(tag_name) || prop.remove_tags==='all') {
								// do nothing
							}
							// img and br are open close tag, but detected as open tags
							else if(tag_name == "img" || tag_name == "br") {
								// close tag and add it to the partial text	    
								cut_html += tag.substr(0, tag.length-1)+" />"; 
							}
							else {
								opened_tag.push(tag_name);	
								// add tag to the partial text	    
								cut_html += tag;
							}
						}
						else if(tag_match = tag.match(ct_regexp)) {
							tag_name = tag_match[1];
							if(prop.remove_tags.contains(tag_name) || prop.remove_tags === 'all') {
								// do nothing
						     	}
						      	else {
						    		// last opened tag is closed, remove it from list
								opened_tag.pop();
				    				// add tag to the partial text	    
				    				cut_html += tag;
						       	}
				    		}
					}
					// if there is some text
					if(typeof part_matches[2] != 'undefined') {
						var text_array = part_matches[2].split(" ");
						// if the first element is empty that's because the text begins with a space, so 
						// we have to add it manually if the text overcomes words length
						var add_space = /^\s*$/.test(text_array[0]) ? true : false;
						text_array.erase("");
						// sometimes at the beginning of the content there are tabs or multiple spaces due to indentation
						// if not sufficient may be necessary to erase all text_array elements 
						// which doesn't contain no-space characters, clearly only for the words count
						if(/^\s*$/.test(text_array[0])) text_array.splice(0,1);
						var text_add_array = [];
						// if text does not overcome words length
						if(counter + text_array.length < prop.words) {
							cut_html += part_matches[2];
							counter += text_array.length;
						}
						// else add only some words
						else {
							var diff = prop.words - counter;
							for(var i=0; i<diff; i++) {
								text_add_array.push(text_array[i]);
						       	}
							if(add_space) cut_html += " ";
							cut_html += text_add_array.join(" ");
							// max length reached then break
							break;
						}
					}
				}
			}

			// add truncate characters
			cut_html += prop.truncate_characters;
			// close opened tags
			for(var i=opened_tag.length-1; i>=0; i--) {
				cut_html += "</"+opened_tag[i]+">";
			}
					
			// if all tags have been removed add a space to separate the action_label link
			if(prop.remove_tags==='all') cut_html += " ";

			return cut_html;
		},
		/**
		 * @summary Returns the anchor/span "read all" link, depending on the action option.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param {Element} element The dom element which contains the text to truncate
		 * @param {String} html The whole content 
		 * @param {String} cut_html The truncated content 
		 * @param {Object} prop The definitive option object 
		 * @return {String} The action controller
		 * 	
		 */
		actionLink: function(element, html, cut_html, prop) {
		
			var tag = prop.action === 'link' ? 'a' : 'span';
		
			// store label
			var action_label = prop.action_label;

			var action_link = new Element(tag, {
				'class': 'link',
				'html': action_label
			});

			if(prop.action === 'inplace') {
				// store return_label in a variable which doesn't change with the object
				var return_label = prop.return_label;
				action_link.addEvent('click', function() {
					element.set('html', html); 
				       	if(return_label) { 
						var return_link = new Element('span', {'class': 'link', 'html': return_label});
						return_link.addEvent('click', function() {
							element.set('html', cut_html);
							action_link.set('html', action_label);
							action_link.inject(element, 'bottom'); 
						}.bind(this));
						return_link.inject(element, 'bottom');
					}
				}.bind(this))
			}
			else if(prop.action === 'link') {
				action_link.setProperty('href', prop.link_href);	
				action_link.setProperty('target', prop.link_target);	
			}
			else if(prop.action === 'callback') {
				action_link.addEvent('click', prop.callback.bind(this, [element, prop.callback_param]));	
			}
			else if(prop.action === 'layer') {
				action_link.addEvent('click', this.showInLayer.bind(this, [element, html, prop]));	
			}
	
			return action_link;

		},
		/**
		 * @summary Shows the entire html text in a layer (lightbox style).   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param {Element} element The dom element which contains the text to truncate
		 * @param {String} html The whole content 
		 * @param {Object} prop The definitive option object 
		 * @return void
		 * 	
		 */
		showInLayer: function(element, html, prop) {

			// overlay doesn't like active objects
			this.disableObjects();
			// render overlay and after (chain) the layer
			this.renderOverlay(element, html, prop); 

		},
		/**
		 * @summary Renders the layer.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param {Element} element The dom element which contains the text to truncate
		 * @param {String} html The whole content 
		 * @param {Object} prop The definitive option object 
		 * @return void
		 */
		renderLayer: function(element, html, prop) {
			// init layer
			_private[this.id].layer = new Element('div', {'class': 'mra_layer', id: prop.layer_id});
			_private[this.id].layer.setStyles({
				position: 'absolute',
				width: prop.layer_width,
				visibility: 'hidden',
				'z-index': ++_private[this.id].max_z_index	
			});

			// layer title and body
			this.layerTitle(element);
			this.layerBody(html);
		
			// layer rendering
			_private[this.id].layer.inject(document.body);
			var coord = _private[this.id].layer.getCoordinates();
			_private[this.id].layer.setStyles({
				top: ajs.shared.getViewport().cY-coord.height/2,
				left: ajs.shared.getViewport().cX-coord.width/2,
				visibility: 'visible'
			});

			// extra options
			if(prop.layer_resizable) this.makeResizable();
			if(prop.layer_text_resizable) this.makeTextResizable();
			if(prop.layer_draggable) this.makeDraggable();

			// close button always present
			var ico_close = new Element('div', {'class': 'mra_close'});
			ico_close.inject(_private[this.id].layer, 'top');
			ico_close.addEvent('click', function() { this.closeLayer(); }.bind(this));

		},
		/**
		 * @summary Creates the layer title taking the data-title element attribute.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param {Element} element The dom element which contains the text to truncate
		 * @return void
		 * @method
		 * @protected
		 */
		layerTitle: function(element) {
			// I love html5 ;)
			if(typeof element.getProperty('data-title') != 'undefined') {
				var title = new Element('div', {'class': 'mra_title'});
				title.set('html', element.getProperty('data-title'));
				title.inject(_private[this.id].layer, 'top');
			}	    
		}.protect(),
		/**
		 * @summary Sets the layer content.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param {String} html The html content
		 * @return void
		 * @method
		 * @protected
		 */
		layerBody: function(html) {
			var layer_body = new Element('div', {'class': 'mra_layer_body'});
			layer_body.set('html', html);
			layer_body.inject(_private[this.id].layer);
		}.protect(),
		/**
		 * @summary Closes the layer.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @return void
		 */
		closeLayer: function() {
			_private[this.id].layer.destroy();
    			_private[this.id].overlay_anim.start(0.7, 0).chain(function() { _private[this.id].overlay.dispose(); }.bind(this));		
			this.enableObjects();
		},
		/**
		 * @summary Makes the layer draggable.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @return void
		 * @method
		 * @protected
		 */
		makeDraggable: function() {

			var ico_drag = new Element('div', {'class': 'mra_drag'});
			ico_drag.inject(_private[this.id].layer, 'top');

			var docDim = document.getCoordinates();
			var dragInstance = new Drag(_private[this.id].layer, {
				'handle':ico_drag, 
				'limit':{'x':[0, (docDim.width-_private[this.id].layer.getCoordinates().width)], 'y':[0, ]}
			});
    
		}.protect(),
		/**
		 * @summary Makes the layer resizable.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @return void
		 * @method
		 * @protected
		 */
		makeResizable: function() {

			var ico_resize = new Element('div', {'class': 'mra_resize'});
			ico_resize.inject(_private[this.id].layer, 'bottom');

			var ylimit = $$('body')[0].getSize().y-20;
			var xlimit = $$('body')[0].getSize().x-20;
			this.layer.makeResizable({
				'handle': ico_resize, 
				'limit': {'x':[200, xlimit], 'y':[60, ylimit]}
			});
		}.protect(),
		/**
		 * @summary Makes the layer text resizable.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @return void
		 * @method
		 * @protected
		 */
		makeTextResizable: function() {
		
			var ico_text_smaller = new Element('div', {'class': 'mra_text_smaller'});
			ico_text_smaller.addEvent('click', function() {
				new_size = _private[this.id].layer.getStyle('font-size').toInt() < (_private[this.id].min_text_size+1)
					? _private[this.id].min_text_size
					: _private[this.id].layer.getStyle('font-size').toInt() - 1;
				_private[this.id].layer.setStyle('font-size', new_size+'px');
			}.bind(this));
			ico_text_smaller.inject(_private[this.id].layer, 'top');

			var ico_text_bigger = new Element('div', {'class': 'mra_text_bigger'});
			ico_text_bigger.addEvent('click', function() {
				new_size = _private[this.id].layer.getStyle('font-size').toInt() > (_private[this.id].max_text_size-1)
					? _private[this.id].max_text_size
					: _private[this.id].layer.getStyle('font-size').toInt() + 1;
				_private[this.id].layer.setStyle('font-size', new_size+'px');
			}.bind(this));
			ico_text_bigger.inject(_private[this.id].layer, 'top');

		}.protect(),
		/**
		 * @summary Checks if a window object is of the same domain as the main one.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param win {Element} The window object
		 * @return {Boolean} Whether or not the given window has the same domain
		 * @method
		 * @protected
		 */
		sameDomain: function(win) {
			var H = location.href;
    			local = H.substring(0, H.indexOf(location.pathname));
			try {
				win = win.document;
				return win && win.URL && win.URL.indexOf(local) == 0;
			}		
			catch(e) {
				return false;
			}
		}.protect(),
		/**
		 * @summary Disables document objects.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @return void
		 * @method
		 * @protected
		 */
		disableObjects: function() {
			for(var i=0;i<window.frames.length;i++) {
				var myFrame = window.frames[i];
				if(this.sameDomain(myFrame)) {
					var obs = myFrame.document.getElementsByTagName('object');
					for(var ii=0; ii<obs.length; ii++) {
						obs[ii].style.visibility='hidden';
					}
				}
			}
			$$('object').each(function(item) {
				item.style.visibility='hidden';
			})
		}.protect(),
		/**
		 * @summary Enables document objects.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @return void
		 * @method
		 * @protected
		 */
		enableObjects: function() {
			for(var i=0;i<window.frames.length;i++) {
				var myFrame = window.frames[i];
				if(this.sameDomain(myFrame)) {
					var obs = myFrame.document.getElementsByTagName('object');
					for(var ii=0; ii<obs.length; ii++) {
						obs[ii].style.visibility='visible';
					}
				}
			}
			$$('object').each(function(item) {
				item.style.visibility='visible';
			})
		}.protect(),
		/**
		 * @summary Renders an overlay (lightbox style).   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @param {Element} element The dom element which contains the text to truncate
		 * @param {String} html The whole content 
		 * @param {Object} prop The definitive option object 
		 * @return void
		 * @method
		 * @protected
		 */
		renderOverlay: function(element, html, prop) {
			var docDim = document.getScrollSize();
			_private[this.id].overlay = new Element('div', {'class': 'mra_overlay'});
			_private[this.id].overlay.setStyles({
				position: 'absolute',
				top: '0px',
				left: '0px',
				width: docDim.x,
				height: docDim.y,
				'z-index': ++_private[this.id].max_z_index,
				opacity: 0
			});
			_private[this.id].overlay.inject(document.body);

			_private[this.id].overlay_anim = new Fx.Tween(_private[this.id].overlay, {property: 'opacity'});
			_private[this.id].overlay_anim.start(0, 0.7).chain(function() { this.renderLayer(element, html, prop); }.bind(this));

		}.protect(),
		/**
		 * @summary Gets the maximum z-index in the document.   
		 * @memberof ajs.tools.mooreadall.prototype
		 * @return {Number} The maximum z-index
		 * @method
		 * @protected
		 */
		getMaxZindex: function() {
			var maxZ = 0;
			$$('body *').each(function(el) {
				if(el.getStyle('z-index').toInt()) maxZ = Math.max(maxZ, el.getStyle('z-index').toInt());
			});

			return maxZ;
		}.protect()
	});

}());
