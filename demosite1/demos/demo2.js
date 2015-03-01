'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var clock = require('./blocs/beatclock.js').create(audioContext);  // starts automatically
var bl = require('./blocs/bassline.js').create(audioContext);
var lumb = require('./blocs/lumberjack.js').create(audioContext);
var fbd = require('./blocs/feedbackdelay.js').create(audioContext);

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
