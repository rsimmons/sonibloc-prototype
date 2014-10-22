'use strict';

var sonibloc = require('../sonibloc.js');

module.exports = sonibloc.createBloc(function() {
  var SAWCOUNT = 10;
  var ctx = this.audioContext;

  var gainNode = ctx.createGain();
  gainNode.gain.value = 1/SAWCOUNT;

  var filterNode = ctx.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.value = 2000;
  filterNode.Q.value = 10;
  filterNode.connect(gainNode);

  var voices = {}; // maps pitch (integer) to object of stuff we need to track for it

  this.addMidiInput('midi')
    .on('noteOn', function(n) {
      // console.log('noteOn', n);
      // if this note is already one, ignore
      if (voices.hasOwnProperty(n.pitch)) {
        return;
      }

      var freq = 440*Math.pow(2, (n.pitch - 69)/12);
      var t = n.time || ctx.currentTime;

      var newVoice = {oscs: []};
      for (var i = 0; i < SAWCOUNT; i++) {
        var osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        osc.detune.value = 2*i;
        osc.connect(filterNode);
        osc.start(t);
        // osc.stop(t + 0.125);
        newVoice.oscs.push(osc);
      }

      voices[n.pitch] = newVoice;
    })
    .on('noteOff', function(n) {
      // console.log('noteOff', n);
      // if this note isn't on, ignore
      if (!voices.hasOwnProperty(n.pitch)) {
        return;
      }

      var t = n.time || ctx.currentTime;

      var v = voices[n.pitch];
      for (var i = 0; i < v.oscs.length; i++) {
        v.oscs[i].stop(t);
      }

      delete voices[n.pitch];
    });

  this.addAudioOutput('audio', gainNode);
});
