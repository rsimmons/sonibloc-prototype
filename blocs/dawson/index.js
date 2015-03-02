'use strict';

var sonibloc = require('sonibloc');
var dawson = require('./build/dawson');

module.exports = sonibloc.createBloc(
  function() {
    dawson.renderApp(this.container);
  }
);
