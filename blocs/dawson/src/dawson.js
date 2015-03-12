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
    var thisComponent = this;
    return (
      <div className="bloc-outer">
        <div className="bloc-pins-column">
          <div className="bloc-pins bloc-pins-input">
            {this.props.pins.inputs.map(function(i) {
              return <div key={i} onClick={function(e) { e.preventDefault(); thisComponent.props.pinClickFunc('in', i); }}>&#x25b9; {i}</div>;
            })}
          </div>
          <div className="bloc-pins bloc-pins-output">
            {this.props.pins.outputs.map(function(i) {
              return <div key={i} onClick={function(e) { e.preventDefault(); thisComponent.props.pinClickFunc('out', i); }}>{i} &#x25b8;</div>;
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

var CxnListItem = React.createClass({
  submitRemove: function(e) {
    e.preventDefault();
    this.props.removeFunc();
  },

  render: function() {
    var thisComponent = this;
    return (
      <div>
        <span>{ this.props.desc } </span>
        <form className="inlined" onSubmit={this.submitRemove}>
          <button className="cxn-remove">Remove</button>
        </form>
      </div>
    );
  },
});

var DawsonApp = React.createClass({
  getInitialState: function() {
    return {
      blocs: [],
      cxns: [],
      firstPin: null,
    };
  },

  addBloc: function(blocClass, nameHint) {
    var newId = 'bloc-' + uid(12);

    // create a raw-DOM container element to contain bloc view/UI
    var document = this.getDOMNode().ownerDocument; // is this safe? seems OK..
    var containerElem = document.createElement('div');

    // instantiate the actual bloc
    var blocObj = blocClass.create(this.props.audioContext, containerElem);

    var newBlocs = this.state.blocs.concat({
      id: newId,
      blocObj: blocObj,
      containerElem: containerElem,
      pins: {
        inputs: Object.getOwnPropertyNames(blocObj.inputs).sort(),
        outputs: Object.getOwnPropertyNames(blocObj.outputs).sort(),
      },
      name: nameHint + ' (' + newId.substring(0, 12) + ')'
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

  blocFromId: function(blocId) {
    for (var i = 0; i < this.state.blocs.length; i++) {
      if (this.state.blocs[i].id === blocId) {
        return this.state.blocs[i];
      }
    }
    throw new Error('bloc id not found');
  },

  pinClicked: function(blocId, inOut, name) {
    console.log('bloc', blocId, 'got click on', inOut, name);
    var secondPin = {blocId: blocId, inOut: inOut, name: name};

    if (this.state.firstPin) {
      // this is second click, so check if we can make connection

      var valid = false;
      var outputPin;
      var inputPin;
      // TODO: disallow cycles? self-connections?
      if ((this.state.firstPin.inOut === 'out') && (secondPin.inOut === 'in')) {
        valid = true;
        outputPin = this.state.firstPin;
        inputPin = secondPin;
      } else if ((this.state.firstPin.inOut === 'in') && (secondPin.inOut === 'out')) {
        valid = true;
        outputPin = secondPin;
        inputPin = this.state.firstPin;
      }

      if (valid) {
        // make underlying connection
        var fromBlocObj = this.blocFromId(outputPin.blocId).blocObj;
        var toBlocObj = this.blocFromId(inputPin.blocId).blocObj;
        fromBlocObj.outputs[outputPin.name].connect(toBlocObj.inputs[inputPin.name]);

        // reflect connection in UI
        var newId = 'cxn-' + uid(12);
        var newCxns = this.state.cxns.concat({
          id: newId,
          desc: 'FROM ' + outputPin.blocId + ' ' + outputPin.name + ' TO ' + inputPin.blocId + ' ' + inputPin.name,
        });

        this.setState({cxns: newCxns});
      } else {
        console.log('invalid connection');
      }

      this.setState({firstPin: null});
    } else {
      // this is first click, so remember it
      this.setState({firstPin: {blocId: blocId, inOut: inOut, name: name}});
    }
  },

  removeBlocId: function(blocId) {
    var newBlocs = this.state.blocs.slice(); // shallow copy

    var removeIdx;
    for (var i = 0; i < this.state.blocs.length; i++) {
      if (this.state.blocs[i].id === blocId) {
        removeIdx = i;
        this.state.blocs[i].blocObj.shutdown(); // give bloc a chance to to cleanup (stop timers, etc.)
        break;
      }
    }
    if (removeIdx == undefined) {
      throw new Error('bloc id not found');
    }

    newBlocs.splice(removeIdx, 1);

    this.setState({blocs: newBlocs});
  },

  removeCxnId: function(cxnId) {
    // TODO: implement
  },

  render: function() {
    var thisComponent = this;
    return (
      <div>
        <div>
          {this.state.blocs.map(function(i) {
            return <BlocListItem
              key={i.id}
              name={i.name}
              containerElem={i.containerElem}
              pins={i.pins}
              removeFunc={function() { thisComponent.removeBlocId(i.id); }}
              pinClickFunc={function(inOut, name) { thisComponent.pinClicked(i.id, inOut, name); }}
            />;
          })}
        </div>
        <div className="bottom-stuff">
          <form className="add-bloc-form">
            <label>Add Bloc <select ref="addBlocSelect" onChange={this.handleAddBlocSelectChange}>
              <option />
              {availableBlocs.map(function(i) {
                return <option key={i.name}>{i.name}</option>;
              })}
            </select></label>
          </form>
          <div>
            {this.state.cxns.map(function(i) {
              return <CxnListItem
                key={i.id}
                desc={i.desc}
                removeFunc={function() { thisComponent.removeCxnId(i.id); }}
              />;
            })}
          </div>
          <div>{ this.state.firstPin ? ('Connecting from bloc ' + this.state.firstPin.blocId + ' ' + this.state.firstPin.inOut + ' ' + this.state.firstPin.name + ' to ...' ) : '' }</div>
        </div>
      </div>
    );
  },
});

module.exports = {
  renderApp: function(audioContext, container) {
    React.render(<DawsonApp audioContext={audioContext} />, container);
  },
}
