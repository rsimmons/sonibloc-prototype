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
    var containerElem = this.refs.blocContainer.getDOMNode();

    // instantiate the actual bloc
    var newBloc = this.props.blocClass.create(this.props.audioContext, containerElem);

    // if bloc didn't create a view/UI, then put placeholder stuff
    if (!containerElem.hasChildNodes()) {
      containerElem.className += ' bloc-container-empty';
      containerElem.textContent = '(no interface)';
    }
  },

  submitRemove: function(e) {
    e.preventDefault();
    this.props.removeFunc();
  },

  render: function() {
    return (
      <div className="bloc-outer">
        <div className="bloc-info">{this.props.name}</div>
        <form className="inlined" onSubmit={this.submitRemove}>
          <button className="bloc-remove">X</button>
        </form>
        <div ref="blocContainer" className="bloc-container" />
      </div>
    );
  },
});

var DawsonApp = React.createClass({
  getInitialState: function() {
    return {blocs: []};
  },

  onAddBlocSelectChange: function(e) {
    var selectElem = this.refs.addBlocSelect.getDOMNode();

    if (selectElem.selectedIndex > 0) {
      var selBloc = availableBlocs[selectElem.selectedIndex-1];
      var newId = uid(12);
      var newBlocs = this.state.blocs.concat({id: newId, blocClass: selBloc._class, name: selBloc.name + '-' + newId.substring(0, 5)});

      console.log('adding bloc', selBloc.name, 'id', newId);

      this.setState({blocs: newBlocs});
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
              blocClass={i.blocClass}
              audioContext={thisApp.props.audioContext}
              removeFunc={function() { thisApp.removeBlocId(i.id); }}
            />;
          })}
        </div>
        <form>
          <label>Add <select ref="addBlocSelect" onChange={this.onAddBlocSelectChange}>
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
