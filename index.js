'use strict';

var availableComponents = {
  bassline: require('./components/bassline.js'),
  lumberjack: require('./components/lumberjack.js'),
  feedbackdelay: require('./components/feedbackdelay.js'),
};

var audioCtx;

function initialize() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  var componentListElem = document.getElementById('component-list');

  for (var k in availableComponents) {
    var li = document.createElement('LI');
    li.appendChild(document.createTextNode(k));
    componentListElem.appendChild(li);
  }
  // console.log(componentListElem);
}

function randomElement(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

document.addEventListener('DOMContentLoaded', function() {
  initialize();

  var bl = new availableComponents.bassline.BassLine(audioCtx);
  // var c = new availableComponents.synth2.Synth2(audioCtx);
  var c = new availableComponents.lumberjack.Lumberjack(audioCtx);
  var fbd = new availableComponents.feedbackdelay.FeedbackDelay(audioCtx);

  bl.outputs.midi.connect(c.inputs.midi);
  // c.outputs.audio.node.connect(audioCtx.destination);
  c.outputs.audio.node.connect(fbd.inputs.audio.node);
  fbd.outputs.audio.node.connect(audioCtx.destination);

  bl.start(120);

  document.addEventListener('mousedown', function(e) {
    e.preventDefault();  
    bl.stop();
    c.inputs.midi.noteOnOff({
      pitch: 31 + randomElement([0, 3, 5, 7, 10, 12]),
      duration: 2,
    });
  });
});
