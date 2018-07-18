// for optimizations and debugging
'use strict';

// local search data, flag variable
var recentSearch, gameMenu = true;

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
      // clear data
      recentSearch = undefined;
    });
  }, timeout.short);
  // set flag
  gameMenu = true;
  canSearch = true;
  // go through each game button
  $('[name = "gameButton"]').each(function() {
    // if they are active
    if($(this).hasClass('active'))
      // deactivate
      $(this).removeClass('active');
  });
  // disable system select
  enableConsoles(false);
});

const refreshTimer = {value: 0, delay: 15, increment: 1, timeout: 1000, active: false, switching: false};

// if refresh is pressed
$(document).on('click', '#refreshButton', function(event) {
  // if the game menu is disabled, no cooldown, and not mid view-switch (bug fixes)
  if(gameMenu === false && refreshTimer.value === 0 && !refreshTimer.switching) {
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
    // request data (using last search)
    requestData(recentSearch.data, recentSearch.options.IGN);
  }
  // otherwise if timer counting
  else if(gameMenu === false && !refreshTimer.switching)
    alert('Please wait ' + refreshTimer.value + ' seconds to refresh!');
});

function incrementTimer(timer) {
  // base case
  if(timer.active)
    return;
  // activate timer
  timer.active = true;
  timer.value = timer.delay;
  // intialize timer
  let interval = setInterval(function() {
    // increment if below timer
    if(timer.value > 0)
      timer.value -= timer.increment;
    // else disable timer
    else {
      timer.active = false;
      clearInterval(interval);
    }
  }, timer.timeout);
}

// if switch view is pressed
$(document).on('click', '#viewSwitch', function(event) {
  // play sound (and forward start time)
  let buttonPress = $('#buttonSound')[0];
  buttonPress.play();
  // if the game menu is disabled (bug fix)
  if(gameMenu === false) {
    let fadeTimer = {start: 1000, end: 2000};
    // update flag
    refreshTimer.switching = true;
    // hide table
    $('#tableDiv').fadeTo(fadeTimer.start, 0, function() {
      // clear table
      $('#tableDiv').empty();
      // set name
      loadView(true);
      // fade table in
      $('#tableDiv').fadeTo(fadeTimer.start, 1.0, function() { refreshTimer.switching = false; });
    });
  }
});
