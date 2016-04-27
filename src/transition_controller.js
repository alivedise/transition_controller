import './base_ui.css';

export default class TransitionController {
  constructor(app) {
    if (!app) {
      return;
    }

    this.element = app.element;
    if (!this.element) {
      return;
    }

    this.TransitionEvents =
      ['open', 'close', 'complete', 'timeout',
        'immediate-open', 'immediate-close'];

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
  };

  destroy() {
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
  };

  _transitionState = 'closed';
  _waitingForLoad = false;
  openAnimation = 'enlarge';
  closeAnimation = 'reduce';
  OPENING_TRANSITION_TIMEOUT = 200;
  CLOSING_TRANSITION_TIMEOUT = 200;
  SLOW_TRANSITION_TIMEOUT = 3500;
  _firstTransition = true;
  changeTransitionState(evt) {
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
  };

  _do_closing() {
    this._closingTimeout = window.setTimeout(() => {
      if (!this.app) {
        return;
      }
      this.app.broadcast('closingtimeout');
    },
    Service.query('slowTransition') ? this.SLOW_TRANSITION_TIMEOUT :
                            this.CLOSING_TRANSITION_TIMEOUT);

    if (!this.app || !this.element) {
      return;
    }
    this.element.classList.add('transition-closing');
    this.element.classList.add(this.getAnimationName('close'));
  };

  _do_closed() {}

  getAnimationName(type) {
    return this.currentAnimation || this[type + 'Animation'] || type;
  };

  _do_opening() {
    // this.app.debug('timer to ensure opened does occur.');
    this._openingTimeout = window.setTimeout(function() {
      this.app && this.app.broadcast('openingtimeout');
    }.bind(this),
    Service.query('slowTransition') ? this.SLOW_TRANSITION_TIMEOUT :
                            this.OPENING_TRANSITION_TIMEOUT);
    this._waitingForLoad = false;
    this.element.classList.add('transition-opening');
    this.element.classList.add(this.getAnimationName('open'));
    // this.app.debug(this.element.classList);
  };

  _do_opened() {}

  switchTransitionState(state) {
    this._transitionState = state;
    if (!this.app) {
      return;
    }
    this.app._changeState('transition', this._transitionState);
  };

  // TODO: move general transition handlers into another object.
  handle_closing() {
    if (!this.app || !this.element) {
      return;
    }
    /* The AttentionToaster will take care of that for AttentionWindows */
    /* InputWindow & InputWindowManager will take care of visibility of IM */
    if (!this.app.isAttentionWindow && !this.app.isCallscreenWindow &&
        !this.app.isInputMethod) {
      this.app.setVisible && this.app.setVisible(false);
    }
    this.switchTransitionState('closing');
  };

  handle_closed() {
    if (!this.app || !this.element) {
      return;
    }

    this.resetTransition();
    this.element.classList.remove('active');
  };

  handle_opening() {
    if (!this.app || !this.element) {
      return;
    }
  };

  handle_opened() {
    console.log('handling opened');
    if (!this.app || !this.element) {
      return;
    }

    this.resetTransition();
    this.element.removeAttribute('aria-hidden');
    this.app.show && this.app.show();
    this.element.classList.add('active');
    this.focusApp();
  };

  focusApp() {
    if (!this.app) {
      return;
    }

    Service.request('focus');
  };

  requireOpen(animation) {
    this.currentAnimation = animation || this.openAnimation;
    if (this.currentAnimation == 'immediate' || Service.query('ignoreTransition')) {
      this.changeTransitionState('immediate-open');
    } else {
      this.changeTransitionState('open');
    }
  };

  requireClose(animation) {
    this.currentAnimation = animation || this.closeAnimation;
    if (this.currentAnimation == 'immediate' || Service.query('ignoreTransition')) {
      this.changeTransitionState('immediate-close');
    } else {
      this.changeTransitionState('close');
    }
  };

  resetTransition() {
    if (this._openingTimeout) {
      window.clearTimeout(this._openingTimeout);
      this._openingTimeout = null;
    }

    if (this._closingTimeout) {
      window.clearTimeout(this._closingTimeout);
      this._closingTimeout = null;
    }
    this.clearTransitionClasses();
  };

  clearTransitionClasses() {
    if (!this.app || !this.element) {
      return;
    }

    var classes = ['enlarge', 'reduce', 'to-cardview', 'from-cardview',
      'invoking', 'invoked', 'zoom-in', 'zoom-out', 'fade-in', 'fade-out',
      'transition-opening', 'transition-closing', 'immediate', 'fadeout',
      'slideleft', 'slideright', 'in-from-left', 'out-to-right',
      'will-become-active', 'will-become-inactive',
      'slide-to-top', 'slide-from-top',
      'slide-to-bottom', 'slide-from-bottom',
      'home-from-cardview', 'home-to-cardview'];

    classes.forEach(function iterator(cls) {
      this.element.classList.remove(cls);
    }, this);
  };

  handleEvent(evt) {
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
};
