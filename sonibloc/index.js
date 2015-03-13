'use strict';

var EventEmitter2 = require('eventemitter2').EventEmitter2;

var scheduler = require('./scheduler.js');

/*********************************
 * BLOC INPUT/OUTPUT CLASSES
 *********************************/

function AudioInput(node) {
  this.node = node;
}

AudioInput.prototype.type = 'audio';

// hacky; used in AudioOutput.connect() to detect what's being connected to
AudioInput.prototype.soniblocInput = true;

function AudioOutput(node, parent) {
  this.node = node;
  this.parent = parent;

  // these targets could be either AudioInput instances or raw AudioNode-ish objects.
  // each item is object with 'target' and 'dummyNode' properties
  this.connectedTargets = [];

  // pool of reusable dummy gain nodes
  this.dummyPool = [];
}

AudioOutput.prototype.type = 'audio';

AudioOutput.prototype.connect = function(target) {
  for (var i = 0; i < this.connectedTargets.length; i++) {
    if (this.connectedTargets[i].target === target) {
      // don't connect again to same thing if already connected
      return;
    }
  }

  // this dummyNode workaround is required because Web Audio API currently doesn't let us
  //  disconnect a node from a single other node, and we need that. so for each target
  //  we connect via a different dummy node. we save old ones since we can't destroy them.
  var dummyNode;

  // draw from pool if we can, otherwise create new one
  if (this.dummyPool.length > 0) {
    dummyNode = this.dummyPool.pop();
  } else {
    dummyNode = this.parent.audioContext.createGain();
    this.node.connect(dummyNode);
  }

  // make real connection via dummy
  if (target.soniblocInput) {
    dummyNode.connect(target.node);
  } else {
    // assume it's a raw AudioNode/AudioParam/AudioOutputNode
    dummyNode.connect(target);
  }

  this.connectedTargets.push({target: target, dummyNode: dummyNode});
}

AudioOutput.prototype.disconnect = function(target) {
  if (target === undefined) {
    for (var i = 0; i < this.connectedTargets.length; i++) {
      var ct = this.connectedTargets[i];
      ct.dummyNode.disconnect();
      this.dummyPool.push(ct.dummyNode);
    }
    this.connectedTargets = [];
  } else {
    var matched = false;
    for (var i = 0; i < this.connectedTargets.length; i++) {
      var ct = this.connectedTargets[i];
      if (ct.target === target) {
        ct.dummyNode.disconnect();
        this.dummyPool.push(ct.dummyNode);
        this.connectedTargets.splice(i, 1);
        matched = true;
        break;
      }
    }
    if (!matched) {
      throw new Error('Can\'t disconnect because not connected');
    }
  }
}

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

MidiOutput.prototype.disconnect = function(midiInput) {
  if (midiInput === undefined) {
    this.connectedInputs = [];
  } else {
    var idx = this.connectedInputs.indexOf(midiInput);
    if (idx < 0) {
      throw new Error('Can\'t disconnect because not connected');
    } else {
      this.connectedInputs.splice(idx, 1);
    }
  }
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

// TRIGGERS

function TriggerInput(parent) {
  this.parent = parent;
  this.emitter = new EventEmitter2();
}

function TriggerOutput(parent) {
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

TriggerOutput.prototype.connect = function(triggerInput) {
  if (this.connectedInputs.indexOf(triggerInput) < 0) {
    this.connectedInputs.push(triggerInput);
  }
}

TriggerOutput.prototype.disconnect = function(triggerInput) {
  if (triggerInput === undefined) {
    this.connectedInputs = [];
  } else {
    var idx = this.connectedInputs.indexOf(triggerInput);
    if (idx < 0) {
      throw new Error('Can\'t disconnect because not connected');
    } else {
      this.connectedInputs.splice(idx, 1);
    }
  }
}

TriggerInput.prototype.type = TriggerOutput.prototype.type = 'trigger';

TriggerInput.prototype.emit = TriggerOutput.prototype.emit = function(event, data) {
  this.emitter.emit(event, data);
}

TriggerInput.prototype.on = TriggerOutput.prototype.on = function(event, func) {
  this.emitter.on(event, func);
  return this;
}

TriggerInput.prototype.trigger = TriggerOutput.prototype.trigger = function(data) {
  this.emitter.emit('trigger', data);
}

/*********************************
 * BLOC BASE
 *********************************/

function BlocBase(audioContext, container) {
  this.audioContext = audioContext;
  this.container = container;

  this.inputs = {};
  this.outputs = {};

  this.scheduler = new scheduler.Scheduler(audioContext);
}

/*********************************
 * BLOC EXTERNAL API
 *********************************/

BlocBase.prototype.shutdown = function() {
  this.scheduler.stop();
}

/*********************************
 * BLOC INTERNAL API
 *********************************/

BlocBase.prototype.addAudioInput = function(name, node) {
  name = name || 'audio'; // default the name of the input to 'audio'

  if (this.inputs.hasOwnProperty(name)) {
    throw new Error('Already have input named ' + name + ', cannot add another');
  }

  this.inputs[name] = new AudioInput(node);
}

BlocBase.prototype.addAudioOutput = function(name, node) {
  name = name || 'audio'; // default the name of the input to 'audio'

  if (this.outputs.hasOwnProperty(name)) {
    throw new Error('Already have output named ' + name + ', cannot add another');
  }
  
  this.outputs[name] = new AudioOutput(node, this);
}

BlocBase.prototype.addMidiInput = function(name) {
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

BlocBase.prototype.addMidiOutput = function(name) {
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

BlocBase.prototype.addTriggerInput = function(name) {
  name = name || 'trigger'; // default the name of the input to 'trigger'

  if (this.inputs.hasOwnProperty(name)) {
    throw new Error('Already have input named ' + name + ', cannot add another');
  }

  // create input object
  var inp = new TriggerInput(this);
  this.inputs[name] = inp;

  // return for easy chaining, especially adding listeners
  return inp;
}

BlocBase.prototype.addTriggerOutput = function(name) {
  name = name || 'trigger'; // default the name of the output to 'trigger'

  if (this.outputs.hasOwnProperty(name)) {
    throw new Error('Already have output named ' + name + ', cannot add another');
  }

  // create output object
  var outp = new TriggerOutput(this);
  this.outputs[name] = outp;

  // return reference to be later used to emit output events
  return outp;
}


/*********************************
 * EXPORTED MAIN FUNCTIONS
 *********************************/

exports.createBloc = function(setupFunc) {
  var bloc = {
    sonibloc: '0.0', // this indicates the version of the external API that this bloc adheres to
  }

  bloc.create = function(audioContext, container) {
    // create "bare"/base bloc
    var b = new BlocBase(audioContext, container);

    // set it up to be a specific bloc instance using provided method
    setupFunc.call(b);

    return b;
  }

  return bloc;
};

/*********************************
 * EXPORTED UTILITY FUNCTIONS
 *********************************/

exports.addPressListener = function(elem, fn) {
  elem.addEventListener('mousedown', fn, false);
  elem.addEventListener('touchstart', fn, false);
}
