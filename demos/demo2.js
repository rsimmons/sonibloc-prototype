'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var bl = require('./blocs/bassline.js').createProcessor(audioContext);
var lumb = require('./blocs/lumberjack.js').createProcessor(audioContext);
var fbd = require('./blocs/feedbackdelay.js').createProcessor(audioContext);

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
