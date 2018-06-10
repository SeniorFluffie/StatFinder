// for optimizations and debugging
'use strict';

// declare multi-platform games (using id)
const multiPlatform = ['fortniteButton', 'overwatchButton'];

// if a game button element is clicked
$(document).on('click', '[name = "gameButton"]', function(event) {
  // stop default behavior
  event.stopPropagation();
  // play sound (and forward start time)
  let buttonPress = $('#iconSound')[0];
  buttonPress.currentTime = 0.125;
  buttonPress.play();
  // if the game is multi-platform
  for(let i = 0 ; i < multiPlatform.length; i++) {
    // check id, if true turn on system buttons
    if($(this).attr('id') == multiPlatform[i] && !$(this).hasClass('active')) {
      enableConsoles(true);
      break;
    }
    // otherwise, disable buttons
    else
      enableConsoles(false);
  }
  // remove focus from button
  $(this).blur();
  // toggle (activate) current button and un-toggle (deactivate) all other siblings
  $(this).toggleClass('active').siblings().not(this).removeClass('active');
});

// if a game button element is clicked
$(document).on('click', '[name = "systemButton"]', function(event) {
  // stop default behavior
  event.stopPropagation();
  // play sound (and forward start time)
  let buttonPress = $('#iconSound')[0];
  buttonPress.currentTime = 0.125;
  buttonPress.play();
  // remove focus from button
  $(this).blur();
  // toggle (activate) current button and un-toggle (deactivate) all other siblings
  $(this).toggleClass('active').siblings().not(this).removeClass('active');
});

function enableConsoles(multiPlatform) {
  // get the platform buttons
  let systemButtons = $('.systemButton');
  // iterate through them
  for(let i = 0; i < systemButtons.length; i++) {
    // enable the system buttons
    if(multiPlatform) {
      $(systemButtons[i]).removeClass('disabled');
      $(systemButtons[i]).prop('disabled', false);
    }
    // else disable and deactivate them
    else {
      $(systemButtons[i]).removeClass('active');
      $(systemButtons[i]).prop('disabled', true);
    }
  }
}
