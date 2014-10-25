'use strict';

var sonibloc = require('../../sonibloc.js');

function randomElement(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

module.exports = sonibloc.createBloc(function() {
  var midiOut = this.addMidiOutput('midi');

  this.beat.on('16th', function(e) {
    var pitch = 31 + randomElement([0, 3, 5, 7, 10, 12]); // random pitch from G minor pentatonic a few octaves down from middle
    midiOut.noteOnOff({
      time: e.time, // this time should always be in the future
      pitch: pitch,
      duration: e.duration,
    });
  });
});
