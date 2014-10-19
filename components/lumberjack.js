'use strict';

var sonibloc = require('../sonibloc.js');

exports.Lumberjack = sonibloc.createBlocClass(function() {
  var SAWCOUNT = 10;
  var ctx = this.audioContext;

  var gainNode = ctx.createGain();
  gainNode.gain.value = 1/SAWCOUNT;

  var filterNode = ctx.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.value = 2000;
  filterNode.Q.value = 10;
  filterNode.connect(gainNode);

  this.addNoteInput('notes')
    .on('noteOn', function(n) {
      console.log(ctx.currentTime, 'noteOn', n.time, n.pitch);
      var freq = 440*Math.pow(2, (n.pitch - 69)/12);
      var t = n.time || ctx.currentTime;

      for (var i = 0; i < SAWCOUNT; i++) {
        var osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        osc.detune.value = 2*i;
        osc.connect(filterNode);
        osc.start(t);
        osc.stop(t + 0.125);
      }
    });

  this.addAudioOutput('audio', gainNode);
});
