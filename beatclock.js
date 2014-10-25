var EventEmitter2 = require('eventemitter2').EventEmitter2;

/*********************************
 * BEAT CLOCK (MASTER)
 *********************************/

function BeatClock(audioContext) {
  this.audioContext = audioContext;
  this.timeoutID = null;
  this.slaves = [];
}

BeatClock.prototype.start = function(tempo) {
  var TIMEOUT_DELAY = 0.05; // in seconds
  var BUFFER_DEPTH = 0.10; // in seconds

  var TEMPO_DIVISION = 4;
  var ticksPerSec = tempo*TEMPO_DIVISION/60.0;
  var secsPerTick = 60.0/(tempo*TEMPO_DIVISION);

  var _this = this;

  var startTime = null;
  var bufferedUntil = null;
  var nextTick = 0; // next tick number we should emit

  function emitOnSlaves(event, data) {
    for (var i = 0; i < _this.slaves.length; i++) {
      _this.slaves[i].emit(event, data);
    }
  }

  var timeoutFunc = function() {
    var t = _this.audioContext.currentTime;

    if (startTime === null) {
      startTime = t;
      bufferedUntil = t;
    }

    if (bufferedUntil < t) {
      console.log('FELL BEHIND BY', t - bufferedUntil);
    }

    var bufferUntil = t + BUFFER_DEPTH;

    // handle time range from bufferedUntil to bufferUntil
    // console.log(bufferedUntil, bufferUntil);
    var TEMPO_DIVISION = 4;
    var endTick = Math.floor(ticksPerSec * (bufferUntil - startTime));

    var tick;
    for (tick = nextTick; tick <= endTick; tick++) {
      // console.log('handling tick', tick);
      emitOnSlaves('16th', {time: startTime + (tick * secsPerTick), duration: secsPerTick});
    }
    nextTick = tick;

    bufferedUntil = bufferUntil;

    _this.timeoutID = setTimeout(timeoutFunc, 1000*TIMEOUT_DELAY);
  }

  timeoutFunc();
}

BeatClock.prototype.stop = function() {
  if (this.timeoutID) {
    clearTimeout(this.timeoutID);

    this.timeoutID = null;
  }
}

BeatClock.prototype.addSlave = function(slave) {
  this.slaves.push(slave);
}

BeatClock.prototype.merge = function(otherClock) {
  // TODO: implement
  // if both clocks are playing, merge should fail
  // if one clock is playing, that becomes new master, and point other slaves at it
  // if neither clock is playing, pick whichever
}

/*********************************
 * BEAT CLOCK SLAVE
 *********************************/

function BeatClockSlave(master) {
  this.master = master;
  this.emitter = new EventEmitter2();
}

BeatClockSlave.prototype.mergeMasters = function(otherSlave) {
  this.master.merge(otherSlave.master);
}

BeatClockSlave.prototype.emit = function(event, data) {
  this.emitter.emit(event, data);
}

BeatClockSlave.prototype.on = function(event, func) {
  this.emitter.on(event, func);
  return this;
}

BeatClockSlave.prototype.start = function(tempo) {
  this.master.start(tempo);
}

BeatClockSlave.prototype.stop = function() {
  this.master.stop();
}

module.exports = {
  BeatClock: BeatClock,
  BeatClockSlave: BeatClockSlave,
};
