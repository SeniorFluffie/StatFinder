// local search data, flag variable
var recentSearch, gameMenu = false;

// if back is pressed
$(document).on('click', '[name = "backButton"]', function(event) {
  // play sound (and forward start time)
  let buttonPress = $('#buttonSound')[0];
  buttonPress.play();
  setTimeout(fadeout, 500);
  // set flag
  gameMenu = true;
  // go through each game button
  $('[name = "gameButton"]').each(function() {
    // if they are active
    if($(this).hasClass('active'))
      // deactivate
      $(this).removeClass('active');
  });
  // disable console select
  enableConsoles(false);
});

function fadeout() {
  // show stats
  $('#statDisplay').fadeOut(500, function() {
    // display game window after animation
    $('#gameSelect').css('display', 'inline-block');
  });
}

// if refresh is pressed
$(document).on('click', '[name = "refreshButton"]', function(event) {
  // play sound (and forward start time)
  let buttonPress = $('#buttonSound')[0];
  buttonPress.play();
  // if the game menu is disabled (bug fix)
  if(gameMenu === false)
    // request data (using last search)
    requestData(recentSearch.IGN, recentSearch.gameData);
});
