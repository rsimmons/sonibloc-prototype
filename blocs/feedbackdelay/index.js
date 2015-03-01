'use strict';

var sonibloc = require('../../sonibloc.js');

module.exports = sonibloc.createBloc(function() {
  var ctx = this.audioContext;

  var dryNode = ctx.createGain();
  dryNode.gain.value = 1;

  var delayNode = ctx.createDelay();
  delayNode.delayTime.value = 0.005;

  var feedbackGainNode = ctx.createGain();
  feedbackGainNode.gain.value = 0.7;

  var finalGainNode = ctx.createGain();
  finalGainNode.gain.value = 0.7;

  dryNode.connect(delayNode);
  delayNode.connect(feedbackGainNode);
  feedbackGainNode.connect(delayNode);
  dryNode.connect(finalGainNode);
  feedbackGainNode.connect(finalGainNode);

  this.addAudioInput('audio', dryNode);
  this.addAudioOutput('audio', finalGainNode);
});
