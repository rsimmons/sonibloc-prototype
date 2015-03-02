'use strict';

var React = require('react');
var uid = require('uid');

var BlocContainer = React.createClass({
  componentDidMount: function() {
    this.refs.foo.getDOMNode().textContent = Math.random().toString();
  },

  submitRemove: function(e) {
    e.preventDefault();
    this.props.removeFunc();
  },

  render: function() {
    return (
      <div>
        <span>{this.props.name}</span> &nbsp;
        <span ref="foo">foo</span> &nbsp;
        <form className="inlined" onSubmit={this.submitRemove}>
          <button>Remove</button>
        </form>
      </div>
    );
  },
});

var DawsonApp = React.createClass({
  getInitialState: function() {
    return {blocs: []};
  },

  submitAddBloc: function(e) {
    e.preventDefault();
    var newId = uid(12);
    var newBlocs = this.state.blocs.concat({id: newId, name: 'name-' + newId});
    this.setState({blocs: newBlocs});
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
        <h1>Dawson</h1>
        <div ref="bloc-list">
          {this.state.blocs.map(function(i) {
            return <BlocContainer
              key={i.id}
              name={i.name}
              removeFunc={function() { thisApp.removeBlocId(i.id); }}
            />;
          })}
        </div>
        <form onSubmit={this.submitAddBloc}>
          <button>Add Bloc</button>
        </form>
      </div>
    );
  },
});

module.exports = {
  renderApp: function(container) {
    React.render(<DawsonApp />, container);
  },
}
