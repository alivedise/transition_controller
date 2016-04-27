TransitionController is a helper class to animate the desired UI component object.

## Notice ##
* You need to have an open/close function in your object; then assign the open/close animation.
* Best practice: use baseClass to extend your React component.
* It works for non-React component, too.

## Design thinking ##
* Assume there're 4 states for any simple animation: 'closed', 'opening', 'opened', 'closing'.
* Using a state machine to transmit the transition state according to current conditions.

## Usage ##
### With React ###
```js
import React from 'react';
import ReactDOM from 'react-dom';
import TransitionController from 'dist/transition_controller';
export default class MyUI extends React.Component {
  openAnimation: 'immediate',

  closeAnimation: 'immediate',

  componentDidMount() {
    this.element = ReactDOM.findDOMNode(this);
    this.transitionController = new TransitionController(this);
  };

  open(animation) {
    this.transitionController && this.transitionController.requireOpen(animation);
  };

  close(animation) {
    this.transitionController && this.transitionController.requireClose(animation);
  };

}

// myUI is reference to MyUI instance:
myUI.open();
myUI.close();

```
