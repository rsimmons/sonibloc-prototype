'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var sonibloc = require('../sonibloc.js');

// define a "geiger counter" bloc that emits midi notes
//  at exponentially distributed random intervals
var geiger = sonibloc.createBloc(function() {
  var RATE = 4; // avg clicks per second. this could be a parameter of the bloc

  var midiOut = this.addMidiOutput('midi');

  // interval events let us use the beat clock to help us do "raw" scheduling,
  //  for events that don't happen on the beat
  this.beat.on('interval', function(e) {
    var cursor = e.begin;

    while (true) {
      // generate a random variable from exponential distribution
      var expo = -Math.log(Math.random())/RATE;

      cursor += expo;

      if (cursor >= e.end) {
        break;
      }

      // emit a short note at a fixed pitch
      midiOut.noteOnOff({
        time: cursor,
        pitch: 80,
        duration: 0.05,
      });
    }
  });
});

// create processors
var geigerProc = geiger.createProcessor(audioContext);
var lumberProc = require('./blocs/lumberjack.js').createProcessor(audioContext);

// connect up processors
geigerProc.outputs.midi.connect(lumberProc.inputs.midi);
lumberProc.outputs.audio.node.connect(audioContext.destination);

// start beat clock. tempo doesn't matter since we don't actually follow the beat
geigerProc.startBeat(120);

//SHOWEND

    return function terminate() {
      geigerProc.stopBeat();
      lumberProc.outputs.audio.disconnect();
    };
  },
}
