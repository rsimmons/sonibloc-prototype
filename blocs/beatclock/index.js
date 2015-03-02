'use strict';

var sonibloc = require('sonibloc');

module.exports = sonibloc.createBloc(function() {
  var triggerOuts = {
    '16': this.addTriggerOutput('trigger16'),
    '8': this.addTriggerOutput('trigger8'),
    '4': this.addTriggerOutput('trigger4'),
  };

  var tempo = 120; // TODO: setting

  var TICKS_PER_BEAT = 4;
  var EMITTED_DIVISIONS = {
    '16': TICKS_PER_BEAT/4,
    '8': TICKS_PER_BEAT/2,
    '4': TICKS_PER_BEAT,
  }

  var ticksPerSec = tempo*TICKS_PER_BEAT/60.0;
  var secsPerTick = 60.0/(tempo*TICKS_PER_BEAT);

  var nextTick = 0; // next tick number we should emit

  this.scheduler.start(function(e) {
    var endTick = Math.floor(ticksPerSec * (e.end - e.start));

    var tick;
    for (tick = nextTick; tick <= endTick; tick++) {
      // console.log('handling tick', tick);
      for (var div in EMITTED_DIVISIONS) {
        if (EMITTED_DIVISIONS.hasOwnProperty(div)) {
          var ticksPerDiv = EMITTED_DIVISIONS[div];
          var tickTime = e.start + tick*secsPerTick;

          if ((tick % ticksPerDiv) == 0) {
            triggerOuts[div].trigger({
              time: tickTime,
            });

            // TODO: duration is ticksPerDiv*secsPerTick if we want to do gate or note or something. or could just straight export the duration value
            // TODO: "number"/count is Math.round(tick/ticksPerDiv) if we want to export that
          }
        }
      }
    }
    nextTick = tick;
  });
});
