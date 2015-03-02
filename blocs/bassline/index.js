'use strict';

var sonibloc = require('sonibloc');

function randomElement(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

module.exports = sonibloc.createBloc(function() {
  var triggerIn = this.addTriggerInput('trigger');
  var midiOut = this.addMidiOutput('midi');

  triggerIn.on('trigger', function(e) {
    var pitch = 31 + randomElement([0, 3, 5, 7, 10, 12]); // random pitch from G minor pentatonic a few octaves down from middle
    midiOut.noteOnOff({
      time: e.time, // this time should always be in the future
      pitch: pitch,
      duration: 0.125,
    });
  });
});
