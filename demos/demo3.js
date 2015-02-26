'use strict';

module.exports = {
  initialize: function(audioContext, container) {

//SHOWBEGIN
// require and create qwerty hancock bloc (with view)
var qwerty = require('./blocs/qwerty-hancock.js').create(audioContext, container);

// require and create lumberjack bloc
var lumber = require('./blocs/lumberjack.js').create(audioContext);

// connect up blocs
qwerty.outputs.midi.connect(lumber.inputs.midi);
lumber.outputs.audio.connect(audioContext.destination);
//SHOWEND

    return function terminate() {
      lumber.outputs.audio.disconnect();
    };
  },
}
