/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	__webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var TransitionController = function () {
	  function TransitionController(app) {
	    _classCallCheck(this, TransitionController);

	    this._transitionState = 'closed';
	    this._waitingForLoad = false;
	    this.openAnimation = 'enlarge';
	    this.closeAnimation = 'reduce';
	    this.OPENING_TRANSITION_TIMEOUT = 200;
	    this.CLOSING_TRANSITION_TIMEOUT = 200;
	    this.SLOW_TRANSITION_TIMEOUT = 3500;
	    this._firstTransition = true;

	    if (!app) {
	      return;
	    }

	    this.element = app.element;
	    if (!this.element) {
	      return;
	    }

	    this.TransitionEvents = ['open', 'close', 'complete', 'timeout', 'immediate-open', 'immediate-close'];

	    this.TransitionStateTable = {
	      'closed': ['opening', null, null, null, 'opened', null],
	      'opened': [null, 'closing', null, null, null, 'closed'],
	      'opening': [null, 'closing', 'opened', 'opened', 'opened', 'closed'],
	      'closing': ['opened', null, 'closed', 'closed', 'opened', 'closed']
	    };

	    this.app = app;
	    if (this.app.openAnimation) {
	      this.openAnimation = this.app.openAnimation;
	    }

	    if (this.app.closeAnimation) {
	      this.closeAnimation = this.app.closeAnimation;
	    }

	    if (this.app.CLASS_NAME == 'AppWindow') {
	      this.OPENING_TRANSITION_TIMEOUT = 2500;
	    }

	    this.element.addEventListener('_opening', this);
	    this.element.addEventListener('_closing', this);
	    this.element.addEventListener('_opened', this);
	    this.element.addEventListener('_closed', this);
	    this.element.addEventListener('_opentransitionstart', this);
	    this.element.addEventListener('_closetransitionstart', this);
	    this.element.addEventListener('_loaded', this);
	    this.element.addEventListener('_openingtimeout', this);
	    this.element.addEventListener('_closingtimeout', this);
	    this.element.addEventListener('animationend', this);

	    this.element.classList.add('base_ui');
	    this.switchTransitionState('closed');
	  }

	  _createClass(TransitionController, [{
	    key: 'destroy',
	    value: function destroy() {
	      if (!this.app || !this.element) {
	        return;
	      }

	      this.element.removeEventListener('_opening', this);
	      this.element.removeEventListener('_closing', this);
	      this.element.removeEventListener('_opened', this);
	      this.element.removeEventListener('_closed', this);
	      this.element.removeEventListener('_opentransitionstart', this);
	      this.element.removeEventListener('_closetransitionstart', this);
	      this.element.removeEventListener('_loaded', this);
	      this.element.removeEventListener('_openingtimeout', this);
	      this.element.removeEventListener('_closingtimeout', this);
	      this.element.removeEventListener('animationend', this);
	      this.app = null;
	    }
	  }, {
	    key: 'changeTransitionState',
	    value: function changeTransitionState(evt) {
	      var currentState = this._transitionState;
	      var evtIndex = this.TransitionEvents.indexOf(evt);
	      var state = this.TransitionStateTable[currentState][evtIndex];
	      if (!state) {
	        return;
	      }

	      this.switchTransitionState(state);
	      this.resetTransition();
	      this['_do_' + state]();
	      this.app.publish(state);

	      //backward compatibility
	      if (!this.app) {
	        return;
	      }
	      if (state == 'opening') {
	        /**
	         * Fired when the app is doing opening animation.
	         * @event AppWindow#appopening
	         */
	        this.app.publish('willopen');
	      } else if (state == 'closing') {
	        /**
	         * Fired when the app is doing closing animation.
	         * @event AppWindow#appclosing
	         */
	        this.app.publish('willclose');
	      } else if (state == 'opened') {
	        /**
	         * Fired when the app's opening animation is ended.
	         * @event AppWindow#appopen
	         */
	        this.app.publish('open');
	        this.app.publish('-activated'); // For hierarchy manager
	      } else if (state == 'closed') {
	          /**
	           * Fired when the app's closing animation is ended.
	           * @event AppWindow#appclose
	           */
	          this.app.publish('close');
	          this.app.publish('-deactivated'); // For hierarchy manager
	        }
	    }
	  }, {
	    key: '_do_closing',
	    value: function _do_closing() {
	      var _this = this;

	      this._closingTimeout = window.setTimeout(function () {
	        if (!_this.app) {
	          return;
	        }
	        _this.app.broadcast('closingtimeout');
	      }, Service.query('slowTransition') ? this.SLOW_TRANSITION_TIMEOUT : this.CLOSING_TRANSITION_TIMEOUT);

	      if (!this.app || !this.element) {
	        return;
	      }
	      this.element.classList.add('transition-closing');
	      this.element.classList.add(this.getAnimationName('close'));
	    }
	  }, {
	    key: '_do_closed',
	    value: function _do_closed() {}
	  }, {
	    key: 'getAnimationName',
	    value: function getAnimationName(type) {
	      return this.currentAnimation || this[type + 'Animation'] || type;
	    }
	  }, {
	    key: '_do_opening',
	    value: function _do_opening() {
	      // this.app.debug('timer to ensure opened does occur.');
	      this._openingTimeout = window.setTimeout(function () {
	        this.app && this.app.broadcast('openingtimeout');
	      }.bind(this), Service.query('slowTransition') ? this.SLOW_TRANSITION_TIMEOUT : this.OPENING_TRANSITION_TIMEOUT);
	      this._waitingForLoad = false;
	      this.element.classList.add('transition-opening');
	      this.element.classList.add(this.getAnimationName('open'));
	      // this.app.debug(this.element.classList);
	    }
	  }, {
	    key: '_do_opened',
	    value: function _do_opened() {}
	  }, {
	    key: 'switchTransitionState',
	    value: function switchTransitionState(state) {
	      this._transitionState = state;
	      if (!this.app) {
	        return;
	      }
	      this.app._changeState('transition', this._transitionState);
	    }
	  }, {
	    key: 'handle_closing',


	    // TODO: move general transition handlers into another object.
	    value: function handle_closing() {
	      if (!this.app || !this.element) {
	        return;
	      }
	      /* The AttentionToaster will take care of that for AttentionWindows */
	      /* InputWindow & InputWindowManager will take care of visibility of IM */
	      if (!this.app.isAttentionWindow && !this.app.isCallscreenWindow && !this.app.isInputMethod) {
	        this.app.setVisible && this.app.setVisible(false);
	      }
	      this.switchTransitionState('closing');
	    }
	  }, {
	    key: 'handle_closed',
	    value: function handle_closed() {
	      if (!this.app || !this.element) {
	        return;
	      }

	      this.resetTransition();
	      this.element.classList.remove('active');
	    }
	  }, {
	    key: 'handle_opening',
	    value: function handle_opening() {
	      if (!this.app || !this.element) {
	        return;
	      }
	    }
	  }, {
	    key: 'handle_opened',
	    value: function handle_opened() {
	      console.log('handling opened');
	      if (!this.app || !this.element) {
	        return;
	      }

	      this.resetTransition();
	      this.element.removeAttribute('aria-hidden');
	      this.app.show && this.app.show();
	      this.element.classList.add('active');
	      this.focusApp();
	    }
	  }, {
	    key: 'focusApp',
	    value: function focusApp() {
	      if (!this.app) {
	        return;
	      }

	      Service.request('focus');
	    }
	  }, {
	    key: 'requireOpen',
	    value: function requireOpen(animation) {
	      this.currentAnimation = animation || this.openAnimation;
	      if (this.currentAnimation == 'immediate' || Service.query('ignoreTransition')) {
	        this.changeTransitionState('immediate-open');
	      } else {
	        this.changeTransitionState('open');
	      }
	    }
	  }, {
	    key: 'requireClose',
	    value: function requireClose(animation) {
	      this.currentAnimation = animation || this.closeAnimation;
	      if (this.currentAnimation == 'immediate' || Service.query('ignoreTransition')) {
	        this.changeTransitionState('immediate-close');
	      } else {
	        this.changeTransitionState('close');
	      }
	    }
	  }, {
	    key: 'resetTransition',
	    value: function resetTransition() {
	      if (this._openingTimeout) {
	        window.clearTimeout(this._openingTimeout);
	        this._openingTimeout = null;
	      }

	      if (this._closingTimeout) {
	        window.clearTimeout(this._closingTimeout);
	        this._closingTimeout = null;
	      }
	      this.clearTransitionClasses();
	    }
	  }, {
	    key: 'clearTransitionClasses',
	    value: function clearTransitionClasses() {
	      if (!this.app || !this.element) {
	        return;
	      }

	      var classes = ['enlarge', 'reduce', 'to-cardview', 'from-cardview', 'invoking', 'invoked', 'zoom-in', 'zoom-out', 'fade-in', 'fade-out', 'transition-opening', 'transition-closing', 'immediate', 'fadeout', 'slideleft', 'slideright', 'in-from-left', 'out-to-right', 'will-become-active', 'will-become-inactive', 'slide-to-top', 'slide-from-top', 'slide-to-bottom', 'slide-from-bottom', 'home-from-cardview', 'home-to-cardview'];

	      classes.forEach(function iterator(cls) {
	        this.element.classList.remove(cls);
	      }, this);
	    }
	  }, {
	    key: 'handleEvent',
	    value: function handleEvent(evt) {
	      switch (evt.type) {
	        case '_opening':
	          this.handle_opening();
	          break;
	        case '_opened':
	          this.handle_opened();
	          break;
	        case '_closed':
	          this.handle_closed();
	          break;
	        case '_closing':
	          this.handle_closing();
	          break;
	        case '_closingtimeout':
	        case '_openingtimeout':
	          this.changeTransitionState('timeout', evt.type);
	          break;
	        case '_loaded':
	          if (this._waitingForLoad) {
	            this._waitingForLoad = false;
	            this.changeTransitionState('complete');
	          }
	          break;
	        case 'animationend':
	          evt.stopPropagation();
	          // Hide touch-blocker when launching animation is ended.
	          this.element.classList.remove('transition-opening');
	          this.changeTransitionState('complete', evt.type);
	          break;
	      }
	    }
	  }]);

	  return TransitionController;
	}();

	exports.default = TransitionController;
	;

/***/ },
/* 1 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
/******/ ]);