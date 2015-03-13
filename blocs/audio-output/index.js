'use strict';

var sonibloc = require('sonibloc');

module.exports = sonibloc.createBloc(function() {
  var ctx = this.audioContext;

  var gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);

  this.addAudioInput('audio', gainNode);
});
