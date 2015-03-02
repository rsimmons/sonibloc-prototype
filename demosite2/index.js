'use strict';

var dawsonClass = require('sonibloc-dawson');

var audioContext = new (window.AudioContext || window.webkitAudioContext)();

var dawson = dawsonClass.create(audioContext, document.getElementById('main'));
