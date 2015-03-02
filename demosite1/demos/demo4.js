'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var clock = require('sonibloc-beatclock').create(audioContext);  // starts automatically
var bassline = require('sonibloc-bassline');
var bl1 = bassline.create(audioContext);
var bl2 = bassline.create(audioContext);
var lumber = require('sonibloc-lumberjack').create(audioContext);

clock.outputs.trigger16.connect(bl1.inputs.trigger);
clock.outputs.trigger16.connect(bl2.inputs.trigger);
bl1.outputs.midi.connect(lumber.inputs.midi);
bl2.outputs.midi.connect(lumber.inputs.midi);
lumber.outputs.audio.connect(audioContext.destination);
//SHOWEND

    return function terminate() {
      clock.shutdown();
      lumber.outputs.audio.disconnect();
    };
  },
}
