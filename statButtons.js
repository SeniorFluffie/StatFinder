// for optimizations and debugging
'use strict';

// local search data, flag variable
var recentSearch, gameMenu = false;

// upon image load error
$(document).ready(function() {
  // set image
    $("#playerIcon").on("error", function() {
        $(this).attr('src', 'images/error.jpg');
    });
});

// if back is pressed
$(document).on('click', '#backButton', function(event) {
  // play sound (and forward start time)
  let buttonPress = $('#buttonSound')[0];
  buttonPress.play();
  // create delay on fade out
  setTimeout(function () {
    // hide stats
    $('#statDisplay').fadeOut(500, function() {
      // display game window after animation
      $('#gameSelect').css('display', 'inline-block');
    });
  }, timeout.short);
  // set flag
  gameMenu = true;
  // go through each game button
  $('[name = "gameButton"]').each(function() {
    // if they are active
    if($(this).hasClass('active'))
      // deactivate
      $(this).removeClass('active');
  });
  // disable system select
  enableConsoles(false);
  // clear data
  recentSearch = undefined;
});

// if refresh is pressed
$(document).on('click', '#refreshButton', function(event) {
  // if the game menu is disabled (bug fix)
  if(gameMenu === false && refreshTimer.value >= refreshTimer.delay) {
    // play sound (and forward start time)
    let buttonPress = $('#buttonSound')[0];
    buttonPress.play();
    // intialize fade properties
    let fadeTimer = {start: 1000, end: 2000};
    // refresh animation
    $('#tableDiv').fadeTo(fadeTimer.start, 0, function() {
      // set name
      $('#playerName').val(recentSearch.IGN);
    }).fadeTo(fadeTimer.end, 1.0);
    $('#playerName').fadeTo(fadeTimer.start, 0).fadeTo(fadeTimer.end, 1.0);
    // reset timer
    refreshTimer.value = 0;
    // request data (using last search)
    requestData(recentSearch.IGN, recentSearch.gameData);
  }
  else
    alert('Please wait ' + (refreshTimer.delay - refreshTimer.value) + ' seconds to refresh again!');
});

const refreshTimer = {value: 0, delay: 8, timeout: 1000};

function incrementTimer() {
  // increment if below timer
  if(refreshTimer.value < refreshTimer.delay)
    refreshTimer.value += 1;
  // else disable timer
  else
    clearInterval(refreshTimer.timer)
}

// if switch view is pressed
$(document).on('click', '#viewSwitch', function(event) {
  // play sound (and forward start time)
  let buttonPress = $('#buttonSound')[0];
  buttonPress.play();
  // if the game menu is disabled (bug fix)
  if(gameMenu === false) {
    let fadeTimer = {start: 1000, end: 2000};
    // hide table
    $('#tableDiv').fadeTo(fadeTimer.start, 0, function() {
      // clear table
      $('#tableDiv').empty();
      // set name
      loadView(true);
      // fade table in
      $('#tableDiv').fadeTo(fadeTimer.start, 1.0);
    });
  }
});
