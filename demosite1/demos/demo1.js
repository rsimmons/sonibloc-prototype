'use strict';

module.exports = {
  initialize: function(audioContext, container) {

container.innerHTML = '<div id="clickme" style="padding:20px;border:1px solid black;text-align:center;">Click Me</div>';

//SHOWBEGIN
// require blocs
var lumb = require('sonibloc-lumberjack').create(audioContext);

// connect up blocs
lumb.outputs.audio.connect(audioContext.destination);

// helper function to choose random array elem
function randomElement(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

// every click on div, play a random note in scale
document.getElementById('clickme').addEventListener('mousedown', function(e) {
  e.preventDefault();  
  lumb.inputs.midi.noteOnOff({
    pitch: 31 + randomElement([0, 3, 5, 7, 10, 12]),
    duration: 1,
  });
});
//SHOWEND

    return function terminate() {
      lumb.outputs.audio.disconnect();
    };
  },
}
