// load the css stylesheet
ajs.css('moopopup.css');

// look at initialize method for class description
ajs.ui.moopopup = new Class({

  Implements: [Options, Chain, Events],
  options: {
    // window identifier
    id: 'moopopup',
    // window title
    title: null,
    // window width (px)
    width: 400,
    // window height (autofill the content if null)
    height: null,
    // x coordinate of the top left corner (if not given the window will be centered)
    top_left_x: null,
    // y coordinate of the top left corner (if not given the window will be centered)
    top_left_y: null,
    // minimum width (when resizing)
    min_width: 300,
    // minimum height (when resizing)
    min_height: 100,
    // maximum height of popoup contents
    max_body_height: null,
    // make window draggable
    draggable: true,
    // make window resizable
    resizable: true,
    // show over an overlay
    overlay: true,
    // close window when clicking out of it if overlay is true
    overlay_click_close_window: true,
    // url for ajax request contents
    url: null,
    // test content
    text: null,
    // html node to get content from
    html_node: null,
    // disable all active objects in the page when sowing the popoup
    disable_objects: true,
    // function called when the window is displayed
    onComplete: function() {},
    // function called when the window is closed
    onClose: function() {},
  },
  /**
   * @summary Layer window user interface.
   * @classdesc <p>moopopup is a plugin designed to display html content in a draggable, resizable popup window 
   *            (really a layer over the document). The content shown may be passed as an option, 
   *            taken from an existing html node or through an ajax request</p>
   * @constructs ajs.ui.moopopup
   * @param {Object} options The class options object.
   * @param {String} [options.id='moopopup'] The identifier (id attribute) of the window.
   * @param {String} [options.title=null] The window title.
   * @param {Number} [options.width=400] The window width in px.
   * @param {Number} [options.height=null] The window height in px. If null the height depends on the window's content.
   * @param {Number} [options.top_left_x=null] The x coordinate of the top left corner (if not given the window will be centered).
   * @param {Number} [options.top_left_y=null] The y coordinate of the top left corner (if not given the window will be centered).
   * @param {Number} [options.min_width=300] The minimum width in px when resizing.
   * @param {Number} [options.min_height=100] The minimum height in px when resizing.
   * @param {Number} [options.max_body_height=null] The maximum height of popoup contents.
   * @param {Boolean} [options.draggable=true] Whether or not the window should be draggable.
   * @param {Boolean} [options.resizable=true] Whether or not the window should be resizable.
   * @param {Boolean} [options.overlay=true] Whether or not to show the window over an overlay which covers the whole viewport.
   * @param {Boolean} [options.overlay_click_close_window=true] Whether or not to close the window when clicking over the overlay.
   * @param {String} [options.url=null] Url used to retrieve window contents through an ajax request.
   * @param {String} [options.text=null] The window content.
   * @param {String} [options.html_node=null] Html node to get the content from.
   * @param {Boolean} [options.disable_objects=true] Whether or not to disable all active objects in the page when sowing the popoup.
   * @param {Function} [options.onComplete=function(){}] Function called when the window is displayed
   * @param {Function} [options.onClose=function(){}] Function called when the window is closed
   * @example
   *  var popup = new ajs.ui.moopopup({
   *    width: 800,
   *    max_body_height: 600,
   *    text: 'My popup content'
   *  }):
   *
   */
  initialize: function(options) {

    this.showing = false;	

    if(typeOf(options) != null) {
      this.setOptions(options);
      this.checkOptions();
    }

    this.max_z_index = ajs.shared.getMaxZindex();

  },
  /**
   * @summary Checks and validates the passed options
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return void
   */
  checkOptions: function() {

    var rexp = /[0-9]+/;
    if(!rexp.test(this.options.width) || this.options.width < this.options.minWidth) {
      this.options.width = this.options.min_width;
    }
    if(typeOf(this.options.height) != 'null' && (!rexp.test(this.options.height) || this.options.height < this.options.min_height)) {
      this.options.height = this.options.min_height;
    }

  }.protect(),
  /**
   * @summary Sets an options
   * @param {String} [option] The option name
   * @param {Mixed} [value] The option value
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return void
   */
  setOption: function(option, value) {

    if(typeof this.options[option] != 'undefined') {
      this.options[option] = value;
      this.checkOptions();
    }

  },
  /**
   * @summary Displays the window
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @return void
   */
  display: function() {

    if(this.options.disable_objects) {
      this.disableObjects();
    }

    // if the overlay is shown then the popup is shown after the overlay animation
    if(this.options.overlay) {
      this.renderOverlay();
    }
    else {
      this.renderPopup();
    }

    this.showing = true;

  },
  /**
   * @summary Disables all objects in the document
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return void
   */
  disableObjects: function() {

    for(var i=0; i<window.frames.length; i++) {
      var myFrame = window.frames[i];
      // iframe are in the same domain? if not can't disable objects inside
      if(this.sameDomain(myFrame)) {
        var obs = myFrame.document.getElementsByTagName('object');
        for(var ii=0; ii<obs.length; ii++) {
          obs[ii].style.visibility='hidden';
        }
      }
    }

    $$('object').each(function(item) {
      item.style.visibility='hidden';
    });

  }.protect(),
  /**
   * @summary Enables all objects in the document
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return void
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
    });

  }.protect(),
  /**
   * @summary Checks if a window object is in the same domain of current window
   * @param {Object} [win] the window object
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return true if the given window is in the same domain, false otherwise
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
   * @summary Renders an overlay over the whole viewport
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return void
   */
  renderOverlay: function() {

    // get overlay dimensions
    var doc_dimensions = document.getScrollSize();

    this.overlay = new Element('div', {'class': 'moopopup-overlay'});
    this.overlay.setStyles({
      'width': doc_dimensions.x,
      'height': doc_dimensions.y
    });

    this.overlay.setStyle('z-index', ++this.max_z_index);

    this.overlay.inject(document.body);

    // overlay animation
    this.overlay_anim = new Fx.Tween(this.overlay, {property: 'opacity'});
    this.overlay_anim.start(0, 0.7).chain(function() { this.renderPopup(); }.bind(this));

    if(this.options.overlay_click_close_window) {
      this.overlay.addEvent('click', function(e) {
        var event = new DOMEvent(e);
        if(event.target != this.container) {
          this.close();
        }
      }.bind(this));
    }

  }.protect(),
  /**
   * @summary Renders the window
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @return void
   */
  renderPopup: function() {

    this.renderContainer();

    // always show it over all other elements
    this.setFocus();

    // insert text
    if(this.options.url) {

      this.loading = new Element('div', {'class': 'moopopup-loading'});
      this.loading.setStyle('visibility', 'hidden'); // ie can't get element dimensions if not in dom
      this.loading.inject(document.body, 'top');
      var viewport = ajs.shared.getViewport();
      this.loading.setStyles({
        'position':'absolute',
        'top': (viewport.cY-this.loading.getCoordinates().height/2)+'px',		
        'left': (viewport.cX-this.loading.getCoordinates().width/2)+'px',		
        'z-index': ++this.max_z_index
      });
      this.loading.setStyle('visibility', 'visible');
      this.request();
    }
    else {
      if(this.options.html_node) {
        var html_node = typeOf(this.options.html_node) == 'element'
          ? this.options.html_node 
          : $(this.options.html_node);

        if(typeOf(html_node) == 'element') {
          this.body.set('html', html_node.clone(true, true).get('html'));
        }
      }
      else {
        this.body.set('html', this.options.text);
      }

      // now let's position the popup
      this.position();
      // ...and make it visible
      this.container.setStyle('visibility', 'visible');
      this.fireEvent('complete');
    }

    // the popup is draggable?
    if(this.options.draggable) {
      this.makeDraggable();
    }
    // the popup is resizable?
    if(this.options.resizable) {
      this.makeResizable();
    }

  },
  /**
   * @summary Performs the ajax request and inserts the content in thw window body
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return void
   */
  request: function() {

    var request = new Request.HTML({
      evalScripts: false,
      url: this.options.url,
      method:	'get',
      onComplete: function(responseTree, responseElements, responseHTML, responseJavaScript) {
        $(this.options.id).getChildren('.moopopup-body')[0].set('html', responseHTML);
        // eval script when html is ready inside the target element, not before
        eval(responseJavaScript);
        // wait a moment to let the browser charge images before reposition the container
        var self = this;
        (function() {
          self.loading.dispose();
          // now let's position the popup
          self.position();
          // ... and make it visible
          self.container.setStyle('visibility', 'visible')
          self.fireEvent('complete');
        }).delay(1000);
      }.bind(this)
    }).send();

  }.protect(),
  /**
   * @summary Renders the window container
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return void
   */
  renderContainer: function() {

    this.container = new Element('div', {'id': this.options.id, 'class': 'moopopup-container'});	

    // why visibility hidden?
    // because the popoup is positionated only at the end, when all its content is rendered, and its dimensions known
    this.container.setStyles({
      'visibility': 'hidden',
      'width': this.options.width+'px'
    });

    this.container.addEvent('mousedown', function() {
      this.setFocus();
    }.bind(this));

    if(typeOf(this.options.height) == 'number') {
      this.container.setStyle('height', this.options.height+'px');
    }

    this.renderHeader();
    this.renderBody();

    this.container.inject(document.body, 'top');

  }.protect(),
  /**
   * @summary Makes the window draggable
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return void
   */
  makeDraggable: function() {

    var doc_dimensions = document.getCoordinates();

    var drag_instance = new Drag(this.container, {
      'handle': this.header, 
      'limit':{'x':[0, (doc_dimensions.width-this.container.getCoordinates().width)], 'y':[0, ]}
    });

    this.header.setStyle('cursor', 'move');

  }.protect(),
  /**
   * @summary Makes the window resizable
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return void
   */
  makeResizable: function() {

    var ico_resize = new Element('div', {'class': 'moopopup-resize'});

    ico_resize.inject(this.container, 'bottom');

    var ylimit = $(document.body).getSize().y-20;
    var xlimit = $(document.body).getSize().x-20;

    this.container.makeResizable({
      'handle': ico_resize,
      'limit': {'x':[this.options.min_width, xlimit], 'y':[this.options.min_height, ylimit]}
    });

  }.protect(),
  /**
   * @summary Renders the window's header
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return void
   */
  renderHeader: function() {

    this.header = new Element('header', {'class': 'moopopup-header'});

    // is there a title?
    if(this.options.title) {
      var h1 = new Element('h1', {'class': 'moopopup-title'});
      h1.set('html', this.options.title);
      h1.inject(this.header, 'top');
    }

    // close button, always visible
    this.close_button = new Element('div', {'class': 'moopopup-closebutton'});
    this.close_button.set('text', '×');
    this.close_button.inject(this.header, 'bottom');	
    this.close_button.addEvent('click', this.close.bind(this));

    this.header.inject(this.container, 'top');

  }.protect(),
  /**
   * @summary Renders the window's body
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @protected
   * @return void
   */
  renderBody: function() {

    var viewport = ajs.shared.getViewport();

    this.body = new Element('div', {'class': 'moopopup-body'});	

    if(typeOf(this.options.max_body_height) == 'number') {
      this.body.setStyle('max-height', this.options.max_body_height+'px');
    }
    else {
      this.body.setStyle('max-height', (viewport.height - 120) + 'px');
    }

    this.body.inject(this.container, 'bottom');

  }.protect(),
  /**
   * @summary Window repositioning
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @return void
   */
  position: function() {

    var x, y;
    var viewport = ajs.shared.getViewport();

    // set the position to the center of viewport
    x = viewport.cX - this.container.getCoordinates().width / 2;
    y = viewport.cY - this.container.getCoordinates().height / 2;

    // want it in another position?
    if(this.options.top_left_x) {
      x = this.options.top_left_x;
    }

    if(this.options.top_left_y) {
      y = this.options.top_left_y;
    }

    this.container.setStyles({
      'top': y+'px',
      'left': x+'px'
    });

  },
  /**
   * @summary Moves the window to the front
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @return void
   */
  setFocus: function() {
    if(!this.container.style.zIndex || (this.container.getStyle('z-index').toInt() <= this.max_z_index)) {
      this.container.setStyle('z-index', ++this.max_z_index);
    }
  },
  /**
   * @summary Closes the window
   * @method
   * @memberof ajs.ui.moopopup.prototype
   * @return void
   */
  close: function() {

    if(this.showing) {
      if(this.options.disable_objects) {
        this.chain(this.container.dispose(), this.enableObjects());
      }
      else {
        this.container.dispose();
      }
      // animate the overlay before disposing it
      if(this.options.overlay) {
        this.overlay_anim.start(0.7, 0).chain(function() { this.overlay.dispose(); }.bind(this));
      }
      this.showing = false;
      this.fireEvent('close');
    }

  }

});
