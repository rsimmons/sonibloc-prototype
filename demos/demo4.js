'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var bassline = require('./blocs/bassline.js');
var bl1 = bassline.createProcessor(audioContext);
var bl2 = bassline.createProcessor(audioContext);

var lumb = require('./blocs/lumberjack.js').createProcessor(audioContext);
var fbd = require('./blocs/feedbackdelay.js').createProcessor(audioContext);

bl1.outputs.midi.connect(lumb.inputs.midi);
bl2.outputs.midi.connect(lumb.inputs.midi);
bl1.syncBeats(bl2);

lumb.outputs.audio.node.connect(fbd.inputs.audio.node);
fbd.outputs.audio.node.connect(audioContext.destination);

bl1.startBeat(60);
//SHOWEND

    return function terminate() {
      fbd.outputs.audio.disconnect();
      bl1.stopBeat();
    };
  },
}
