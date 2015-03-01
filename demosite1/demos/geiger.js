'use strict';

module.exports = {
  initialize: function(audioContext) {

//SHOWBEGIN
var sonibloc = require('sonibloc');

// define a bloc that emits triggers notes at exponentially distributed random intervals
var expoTrigClass = sonibloc.createBloc(function() {
  var RATE = 4; // avg clicks per second. this could be a parameter of the bloc

  var triggerOut = this.addTriggerOutput('trigger');

  // do "raw" scheduling of upcoming events since they don't happen on any sort of beat.
  // start immediately when bloc is created, and always be running
  this.scheduler.start(function(e) {
    var cursor = e.begin;

    while (true) {
      // generate a random variable from exponential distribution
      var expo = -Math.log(Math.random())/RATE;

      cursor += expo;

      if (cursor >= e.end) {
        break;
      }

      // emit trigger
      triggerOut.trigger({
        time: cursor,
      });
    }
  });
});

var trigNoteClass = sonibloc.createBloc(function() {
  var triggerIn = this.addTriggerInput('trigger');
  var midiOut = this.addMidiOutput('midi');

  triggerIn.on('trigger', function(e) {
      midiOut.noteOnOff({
        time: e.time,
        pitch: 80,
        duration: 0.05,
      });
  });
});

// create blocs
var expoTrig = expoTrigClass.create(audioContext);
var trigNote = trigNoteClass.create(audioContext);
var lumber = require('./blocs/lumberjack.js').create(audioContext);

// connect up blocs
expoTrig.outputs.trigger.connect(trigNote.inputs.trigger);
trigNote.outputs.midi.connect(lumber.inputs.midi);
lumber.outputs.audio.connect(audioContext.destination);

//SHOWEND

    return function terminate() {
      expoTrig.shutdown(); // need to do this so it doesn't keep triggering and leak timer
      lumber.outputs.audio.disconnect();
    };
  },
}
