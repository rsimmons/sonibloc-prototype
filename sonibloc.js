'use strict';

var EventEmitter2 = require('eventemitter2').EventEmitter2;

function AudioInput(node) {
  this.node = node;
}

AudioInput.prototype.type = 'audio';

function AudioOutput(node) {
  this.node = node;
}

AudioOutput.prototype.type = 'audio';

function MidiInput(parent) {
  this.parent = parent;
  this.emitter = new EventEmitter2();
}

function MidiOutput(parent) {
  this.parent = parent;
  this.emitter = new EventEmitter2();
  this.connectedInputs = [];

  var _this = this;
  this.emitter.onAny(function(data) {
    // on any event, relay to all connected inputs
    for (var i = 0; i < _this.connectedInputs.length; i++) {
      _this.connectedInputs[i].emit(this.event, data);
    }
  });
}

MidiOutput.prototype.connect = function(midiInput) {
  if (this.connectedInputs.indexOf(midiInput) < 0) {
    this.connectedInputs.push(midiInput);
  }
}

MidiOutput.prototype.disconnect = function() {
  this.connectedInputs = [];
}

MidiInput.prototype.type = MidiOutput.prototype.type = 'midi';

MidiInput.prototype.emit = MidiOutput.prototype.emit = function(event, data) {
  this.emitter.emit(event, data);
}

MidiInput.prototype.on = MidiOutput.prototype.on = function(event, func) {
  this.emitter.on(event, func);
  return this;
}

// data must include pitch, and optionally can include time and velocity
MidiInput.prototype.noteOn = MidiOutput.prototype.noteOn = function(data) {
  this.emitter.emit('noteOn', data);
}

// data must include pitch, and optionally can include time and (strangely) velocity
MidiInput.prototype.noteOff = MidiOutput.prototype.noteOff = function(data) {
  this.emitter.emit('noteOff', data);
}

// data must include pitch and duration, and optionally can include time and velocity
MidiInput.prototype.noteOnOff = MidiOutput.prototype.noteOnOff = function(data) {
  this.emitter.emit('noteOn', data);

  // NOTE: this is a bit tricky. if pitch is missing, we need to find the current AudioContext time to set the noteOff time.
  var offData = {pitch: data.pitch, velocity: 0};
  if (data.time) {
    offData.time = data.time + data.duration;
  } else {
    offData.time = this.parent.audioContext.currentTime + data.duration;
  }
  this.emitter.emit('noteOff', offData);
}

function ProcessorBase(audioContext) {
  this.audioContext = audioContext;

  this.inputs = {};
  this.outputs = {};

  this.timeoutID = null;

  this.beats = new EventEmitter2();
  this.beat = null;
}

/*********************************
 * EXTERNAL API
 *********************************/

ProcessorBase.prototype.start = function(tempo) {
  var TIMEOUT_DELAY = 0.05; // in seconds
  var BUFFER_DEPTH = 0.1; // in seconds

  var TEMPO_DIVISION = 4;
  var ticksPerSec = tempo*TEMPO_DIVISION/60.0;
  var secsPerTick = 60.0/(tempo*TEMPO_DIVISION);

  var _this = this;

  var startTime = null;
  var bufferedUntil = null;
  var nextTick = 0; // next tick number we should emit

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
    var endTick = Math.floor(ticksPerSec * bufferUntil);

    var tick;
    for (tick = nextTick; tick <= endTick; tick++) {
      // console.log('handling tick', tick);
      _this.beats.emit('16th', {time: startTime + (tick * secsPerTick), duration: secsPerTick});
    }
    nextTick = tick;

    bufferedUntil = bufferUntil;

    _this.timeoutID = setTimeout(timeoutFunc, 1000*TIMEOUT_DELAY);
  }

  timeoutFunc();
}

ProcessorBase.prototype.stop = function() {
  if (this.timeoutID) {
    clearTimeout(this.timeoutID);

    this.timeoutID = null;
  }
}

/*********************************
 * INTERNAL API
 *********************************/

ProcessorBase.prototype.addAudioInput = function(name, node) {
  name = name || 'audio'; // default the name of the input to 'audio'

  if (this.inputs.hasOwnProperty(name)) {
    throw new Error('Already have input named ' + name + ', cannot add another');
  }

  this.inputs[name] = new AudioInput(node);
}

ProcessorBase.prototype.addAudioOutput = function(name, node) {
  name = name || 'audio'; // default the name of the input to 'audio'

  if (this.outputs.hasOwnProperty(name)) {
    throw new Error('Already have output named ' + name + ', cannot add another');
  }
  
  this.outputs[name] = new AudioOutput(node);
}

ProcessorBase.prototype.addMidiInput = function(name) {
  name = name || 'midi'; // default the name of the input to 'midi'

  if (this.inputs.hasOwnProperty(name)) {
    throw new Error('Already have input named ' + name + ', cannot add another');
  }

  // create input object
  var inp = new MidiInput(this);
  this.inputs[name] = inp;

  // return for easy chaining, especially adding listeners
  return inp;
}

ProcessorBase.prototype.addMidiOutput = function(name) {
  name = name || 'midi'; // default the name of the output to 'midi'

  if (this.outputs.hasOwnProperty(name)) {
    throw new Error('Already have output named ' + name + ', cannot add another');
  }

  // create output object
  var outp = new MidiOutput(this);
  this.outputs[name] = outp;

  // return reference to be later used to emit output events
  return outp;
}

exports.createBloc = function(setupFunc) {
  return {
    sonibloc: '0.0', // this indicates the version of the external API that this bloc adheres to

    createProcessor: function(audioContext) {
      // create "bare"/base processor
      var proc = new ProcessorBase(audioContext);

      // set it up to be a specific processor using provided setupFunc method
      setupFunc.call(proc);

      return proc;
    },
  }
};
