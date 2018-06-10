// for optimizations and debugging
'use strict';

// local search data, flag variable
var recentSearch, gameMenu = false;

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
  }, 500);
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
});

// if refresh is pressed
$(document).on('click', '#refreshButton', function(event) {
  let fadeTimer = {start: 1000, end: 2000};
  // play sound (and forward start time)
  let buttonPress = $('#buttonSound')[0];
  buttonPress.play();
  // if the game menu is disabled (bug fix)
  if(gameMenu === false) {
    // set name
    setTimeout(function() {
      $('#playerName').val(recentSearch.IGN);
    }, fadeTimer.start);
    // refresh animation
    $('#tableDiv').fadeTo(fadeTimer.start, 0).fadeTo(fadeTimer.end, 1.0);
    $('#playerName').fadeTo(fadeTimer.start, 0).fadeTo(fadeTimer.end, 1.0);
    // request data (using last search)
    requestData(recentSearch.IGN, recentSearch.gameData);
  }
});
