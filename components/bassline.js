'use strict';

var sonibloc = require('../sonibloc.js');

function randomElement(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

exports.BassLine = sonibloc.createBlocClass(function() {
  var noteOut = this.addNoteOutput('notes');

  this.beats.on('16th', function(e) {
    noteOut.emit('noteOn', {
      time: e.time, // this time should always be in the future
      pitch: 31 + randomElement([0, 3, 5, 7, 10, 12]), // random pitch from G minor pentatonic a few octaves down from middle
    });
  });
});
