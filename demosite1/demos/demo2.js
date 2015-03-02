'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var clock = require('sonibloc-beatclock').create(audioContext);  // starts automatically
var bl = require('sonibloc-bassline').create(audioContext);
var lumb = require('sonibloc-lumberjack').create(audioContext);
var fbd = require('sonibloc-feedbackdelay').create(audioContext);

clock.outputs.trigger16.connect(bl.inputs.trigger);
bl.outputs.midi.connect(lumb.inputs.midi);
lumb.outputs.audio.connect(fbd.inputs.audio);
fbd.outputs.audio.connect(audioContext.destination);
//SHOWEND

    return function terminate() {
      clock.shutdown();
      fbd.outputs.audio.disconnect();
    };
  },
}
