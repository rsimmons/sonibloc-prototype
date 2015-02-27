'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var clock = require('./blocs/beatclock.js').create(audioContext);  // starts automatically
var bassline = require('./blocs/bassline.js');
var bl1 = bassline.create(audioContext);
var bl2 = bassline.create(audioContext);
var lumber = require('./blocs/lumberjack.js').create(audioContext);

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
