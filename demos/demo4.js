'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var bassline = require('./blocs/bassline.js');
var bl1 = bassline.createProcessor(audioContext);
var bl2 = bassline.createProcessor(audioContext);

var lumberProc = require('./blocs/lumberjack.js').createProcessor(audioContext);

bl1.outputs.midi.connect(lumberProc.inputs.midi);
bl2.outputs.midi.connect(lumberProc.inputs.midi);
bl1.syncBeats(bl2);

lumberProc.outputs.audio.connect(audioContext.destination);

bl1.startBeat(60);
//SHOWEND

    return function terminate() {
      lumberProc.outputs.audio.disconnect();
      bl1.stopBeat();
    };
  },
}
