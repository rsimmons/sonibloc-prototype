'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var bassline = require('./blocs/bassline.js');
var bl1 = bassline.create(audioContext);
var bl2 = bassline.create(audioContext);

var lumber = require('./blocs/lumberjack.js').create(audioContext);

bl1.outputs.midi.connect(lumber.inputs.midi);
bl2.outputs.midi.connect(lumber.inputs.midi);
bl1.syncBeats(bl2);

lumber.outputs.audio.connect(audioContext.destination);

bl1.startBeat(60);
//SHOWEND

    return function terminate() {
      lumber.outputs.audio.disconnect();
      bl1.stopBeat();
    };
  },
}
