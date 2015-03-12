'use strict';

var React = require('react');
var uid = require('uid');

var availableBlocs = [
  {name: 'beatclock', _class: require('sonibloc-beatclock')},
  {name: 'bassline', _class: require('sonibloc-bassline')},
  {name: 'lumberjack', _class: require('sonibloc-lumberjack')},
  {name: 'feedbackdelay', _class: require('sonibloc-feedbackdelay')},
  {name: 'qwerty-hancock', _class: require('sonibloc-qwerty-hancock')},
];

var BlocListItem = React.createClass({
  componentDidMount: function() {
    this.refs.outerContainer.getDOMNode().appendChild(this.props.containerElem);
  },

  submitRemove: function(e) {
    e.preventDefault();
    this.props.removeFunc();
  },

  render: function() {
    return (
      <div className="bloc-outer">
        <div className="bloc-pins-column">
          <div className="bloc-pins bloc-pins-input">
            {this.props.pins.inputs.map(function(i) {
              return <div key="{i}">&#x25b9; {i}</div>;
            })}
          </div>
          <div className="bloc-pins bloc-pins-output">
            {this.props.pins.outputs.map(function(i) {
              return <div key="{i}">&#x25b8; {i}</div>;
            })}
          </div>
        </div>
        <div className="bloc-main-column">
          <div>
            <div className="bloc-info">{this.props.name}</div>
            <form className="inlined" onSubmit={this.submitRemove}>
              <button className="bloc-remove">X</button>
            </form>
          </div>
          <div ref="outerContainer" className="bloc-container" />
        </div>
      </div>
    );
  },
});

var DawsonApp = React.createClass({
  getInitialState: function() {
    return {blocs: []};
  },

  addBloc: function(blocClass, nameHint) {
    var newId = uid(12);

    // create a raw-DOM container element to contain bloc view/UI
    var document = this.getDOMNode().ownerDocument; // is this safe? seems OK..
    var containerElem = document.createElement('div');

    // instantiate the actual bloc
    var blocObj = blocClass.create(this.props.audioContext, containerElem);

    // if bloc didn't create any view/UI, then put placeholder stuff
    if (!containerElem.hasChildNodes()) {
      containerElem.className += ' bloc-container-empty';
      containerElem.textContent = '(no interface)';
    }

    var newBlocs = this.state.blocs.concat({
      id: newId,
      containerElem: containerElem,
      pins: {
        inputs: Object.getOwnPropertyNames(blocObj.inputs).sort(),
        outputs: Object.getOwnPropertyNames(blocObj.outputs).sort(),
      },
      name: nameHint + ' (' + newId.substring(0, 7) + ')'
    });

    this.setState({blocs: newBlocs});
  },

  handleAddBlocSelectChange: function(e) {
    var selectElem = this.refs.addBlocSelect.getDOMNode();

    if (selectElem.selectedIndex > 0) {
      var selBloc = availableBlocs[selectElem.selectedIndex-1];
      this.addBloc(selBloc._class, selBloc.name);
    }

    selectElem.selectedIndex = 0; // reset to blank option
  },

  removeBlocId: function(blocId) {
    var newBlocs = this.state.blocs.slice(); // shallow copy

    var removeIdx;
    for (var i = 0; i < this.state.blocs.length; i++) {
      if (this.state.blocs[i].id === blocId) {
        removeIdx = i;
        break;
      }
    }
    if (removeIdx == undefined) {
      throw new Error('bloc id not found');
    }

    newBlocs.splice(removeIdx, 1);

    this.setState({blocs: newBlocs});
  },

  render: function() {
    var thisApp = this;
    return (
      <div>
        <div>
          {this.state.blocs.map(function(i) {
            return <BlocListItem
              key={i.id}
              name={i.name}
              containerElem={i.containerElem}
              pins={i.pins}
              removeFunc={function() { thisApp.removeBlocId(i.id); }}
            />;
          })}
        </div>
        <form className="add-bloc-form">
          <label>Add Bloc <select ref="addBlocSelect" onChange={this.handleAddBlocSelectChange}>
            <option />
            {availableBlocs.map(function(i) {
              return <option key={i.name}>{i.name}</option>;
            })}
          </select></label>
        </form>
      </div>
    );
  },
});

module.exports = {
  renderApp: function(audioContext, container) {
    React.render(<DawsonApp audioContext={audioContext} />, container);
  },
}
