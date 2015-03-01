'use strict';

var sonibloc = require('../sonibloc.js');

module.exports = sonibloc.createBloc(
  // set up processor
  function() {
    var midiOut = this.addMidiOutput('midi');

    // fill interface into container
    this.container.innerHTML = '<div id="note-button" style="height:100px;border:1px solid green;line-height:100px;text-align:center">Note</div>';

    // handle presses
    sonibloc.addPressListener(this.container.querySelector('#note-button'), function(e) {
      e.preventDefault();
      midiOut.noteOnOff({pitch: 69, duration: 1});
    });
  }
);
