'use strict';

var fs = require('fs');

// this is ugly but need to repeat crap here so brfs can statically evaluate at browserify-time
// TODO: write small script to generate this and require it
var demos = {
  demo1: {code: fs.readFileSync(__dirname + '/demos/demo1.js', 'utf8'), module: require('./demos/demo1.js')},
  demo2: {code: fs.readFileSync(__dirname + '/demos/demo2.js', 'utf8'), module: require('./demos/demo2.js')},
  demo3: {code: fs.readFileSync(__dirname + '/demos/demo3.js', 'utf8'), module: require('./demos/demo3.js')},
  demo4: {code: fs.readFileSync(__dirname + '/demos/demo4.js', 'utf8'), module: require('./demos/demo4.js')},
}
var defaultDemo = 'demo1';

var audioCtx;
var codeColumnElem = document.getElementById('code-column');
var uiColumnElem = document.getElementById('ui-column');
var currentDemo;

function selectDemo(name) {
  if (currentDemo) {
    // terminate
    if (currentDemo.terminator) {
      currentDemo.terminator();
    }
    delete currentDemo.terminator;

    // clear out old UI
    uiColumnElem.innerHTML = '';

    // hide old code
    currentDemo.preElem.style.display = 'none';
  }

  currentDemo = demos[name];

  // initialize
  currentDemo.terminator = currentDemo.module.initialize(audioCtx, uiColumnElem);

  // show new code
  currentDemo.preElem.style.display = 'block';
}

function initialize() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  var demosListElem = document.getElementById('demos-list');

  for (var k in demos) {
    var li = document.createElement('LI');
    li.setAttribute('class', 'demo-choice');
    li.appendChild(document.createTextNode(k));
    demosListElem.appendChild(li);

    var ce = document.createElement('CODE');
    ce.className = 'language-javascript';
    var extractedCode = /\/\/SHOWBEGIN([^]*)\/\/SHOWEND/gm.exec(demos[k].code)[1].trim();
    ce.appendChild(document.createTextNode(extractedCode));

    var pe = document.createElement('PRE');
    pe.className = 'code-wrapper';
    pe.style.display = 'none';
    pe.appendChild(ce);

    codeColumnElem.appendChild(pe);

    demos[k].preElem = pe;
  }

  document.addEventListener('click', function(e) {
    if (e.target.className === 'demo-choice') {
      selectDemo(e.target.textContent);
    }
  });

  selectDemo(defaultDemo);
}

document.addEventListener('DOMContentLoaded', function() {
  initialize();
});
