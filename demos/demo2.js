'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var bl = require('../components/bassline.js').createProcessor(audioContext);
var lumb = require('../components/lumberjack.js').createProcessor(audioContext);
var fbd = require('../components/feedbackdelay.js').createProcessor(audioContext);

bl.outputs.midi.connect(lumb.inputs.midi);
lumb.outputs.audio.node.connect(fbd.inputs.audio.node);
fbd.outputs.audio.node.connect(audioContext.destination);

bl.start(120);
//SHOWEND

    return function terminate() {
      fbd.outputs.audio.disconnect();
      bl.stop();
    };
  },
}
