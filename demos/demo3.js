'use strict';

module.exports = {
  initialize: function(audioContext, container) {

//SHOWBEGIN
// require and create qwerty hancock bloc (with view)
var qwerty = require('./blocs/qwerty-hancock.js');
var qwertyProc = qwerty.createProcessor(audioContext);
var qwertyView = qwerty.createView(qwertyProc, container);

// require and create lumberjack bloc
var lumber = require('./blocs/lumberjack.js');
var lumberProc = lumber.createProcessor(audioContext);

// connect up blocs
qwertyProc.outputs.midi.connect(lumberProc.inputs.midi);
lumberProc.outputs.audio.connect(audioContext.destination);
//SHOWEND

    return function terminate() {
      lumberProc.outputs.audio.disconnect();
    };
  },
}
