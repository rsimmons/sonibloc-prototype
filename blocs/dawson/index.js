'use strict';

var sonibloc = require('sonibloc');
var uid = require('uid');
// var newId = uid(12);

var availableBlocs = [
  {name: 'beatclock', _class: require('sonibloc-beatclock')},
  {name: 'bassline', _class: require('sonibloc-bassline')},
  {name: 'lumberjack', _class: require('sonibloc-lumberjack')},
  {name: 'feedbackdelay', _class: require('sonibloc-feedbackdelay')},
  {name: 'qwerty-hancock', _class: require('sonibloc-qwerty-hancock')},
];

module.exports = sonibloc.createBloc(
  function() {
    var _thisBloc = this;
    // var midiOut = this.addMidiOutput('midi');

    var document = this.container.ownerDocument;

    var blocListElem = document.createElement('div');
    this.container.appendChild(blocListElem);

    var selectElem = document.createElement('select');
    // add initial empty option
    selectElem.appendChild(document.createElement('option'));

    for (var i = 0; i < availableBlocs.length; i++) {
      var optionElem = document.createElement('option');
      optionElem.textContent = availableBlocs[i].name;
      selectElem.appendChild(optionElem);
    }

    var labelElem = document.createElement('label');
    labelElem.textContent = 'Add ';
    labelElem.appendChild(selectElem);

    var formElem = document.createElement('form');
    formElem.appendChild(labelElem);
    this.container.appendChild(formElem);

    selectElem.addEventListener('change', function() {
      if (selectElem.selectedIndex > 0) {
        var selBloc = availableBlocs[selectElem.selectedIndex-1];
        console.log('adding bloc:', selBloc.name);

        var blocOuterElem = document.createElement('div');
        blocOuterElem.className = 'bloc-outer';

        var blocInfoElem = document.createElement('div');
        blocInfoElem.className = 'bloc-info';
        blocInfoElem.textContent = selBloc.name;
        blocOuterElem.appendChild(blocInfoElem);

        var blocRemoveElem = document.createElement('button');
        blocRemoveElem.className = 'bloc-remove';
        blocRemoveElem.textContent = 'X';
        blocOuterElem.appendChild(blocRemoveElem);

        var blocContainerElem = document.createElement('div');
        blocContainerElem.className += 'bloc-container';
        blocOuterElem.appendChild(blocContainerElem);

        blocListElem.appendChild(blocOuterElem);

        // strangely, one bloc needed this to happen last, because it searched for an element by id page-wide. should probably fix that
        var newBloc = selBloc._class.create(_thisBloc.audioContext, blocContainerElem);

        if (!blocContainerElem.hasChildNodes()) {
          blocContainerElem.className += ' bloc-container-empty';
          blocContainerElem.textContent = '(no interface)';
        }
      }
      selectElem.selectedIndex = 0; // reset to blank option
    }, false);
  }
);
