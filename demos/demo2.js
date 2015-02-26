'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var bl = require('./blocs/bassline.js').create(audioContext);
var lumb = require('./blocs/lumberjack.js').create(audioContext);
var fbd = require('./blocs/feedbackdelay.js').create(audioContext);

bl.outputs.midi.connect(lumb.inputs.midi);
lumb.outputs.audio.connect(fbd.inputs.audio);
fbd.outputs.audio.connect(audioContext.destination);

bl.startBeat(120);
//SHOWEND

    return function terminate() {
      fbd.outputs.audio.disconnect();
      bl.stopBeat();
    };
  },
}
