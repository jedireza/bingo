#!/usr/bin/env node

var socketClient = require('socket.io-client');
var client = socketClient.connect('ws://yahoobingo.herokuapp.com');
var myCard = {};
var scores = {
  B: [], I: [], N: [], G: [], O: [],
  D1: [], D2: []
};
var colMap = {B: 0, I: 1, N: 2, G: 3, O: 4};
var numRec = [];
var checkForBingo = function() {
  if (numRec.length >= 5) {
    for (var col in scores) {
      if(scores.hasOwnProperty(col)){
        if(scores[col].length === 5) {
          return true;
        }
      }
    }
  }
  return false;
};

client.on('connect', function() {
  console.log('we have connected');
});

client.on('card', function(payload) {
  myCard = payload;
  console.log(myCard);
});

client.on('number', function(number) {
  console.log('the number is', number);
  if (numRec.indexOf(number) !== -1) {
    //duplicate
    console.log('duplicate call', number);
    return;
  }
  numRec.push(number);
  var numParts = {
    col: number[0],
    val: parseInt(number.slice(1), null)
  };
  var colIdx = myCard.slots[numParts.col].indexOf(numParts.val);
  if (colIdx !== -1) {
    scores[numParts.col].push(true);
    console.log('stamp!', number);
    if (numParts.col === 'B' && colIdx === 0) { scores['D1'].push(true); }
    if (numParts.col === 'B' && colIdx === 4) { scores['D2'].push(true); }
    if (numParts.col === 'I' && colIdx === 1) { scores['D1'].push(true); }
    if (numParts.col === 'I' && colIdx === 3) { scores['D2'].push(true); }
    if (numParts.col === 'N' && colIdx === 2) { scores['D1'].push(true); scores['D2'].push(true); }
    if (numParts.col === 'G' && colIdx === 3) { scores['D1'].push(true); }
    if (numParts.col === 'G' && colIdx === 1) { scores['D2'].push(true); }
    if (numParts.col === 'O' && colIdx === 4) { scores['D1'].push(true); }
    if (numParts.col === 'O' && colIdx === 0) { scores['D2'].push(true); }
  }
  if (checkForBingo()) {
    client.emit('bingo');
  }
});

client.on('win', function(message) {
  console.log('WIN', message);
});

client.on('lose', function(message) {
  console.log('LOSE', message);
});

client.on('disconnect', function() {
  console.log('we have disconnected');
  process.exit(0);
});

client.emit('register', {
  name: 'Reza Akhavan',
  email: 'jedireza@gmail.com',
  url: 'https://github.com/jedireza/bingo'
});
