// for optimizations and debugging
'use strict';

// elements on options page
const sliderNames = ['iconSlider', 'searchSlider', 'buttonSlider'];

// load user options
window.onload = loadOptions();

function loadOptions() {
  let options;
  // retrieve stored data
  chrome.storage.sync.get({ign: '', game: '', system: '', mute: false, iconSlider: 50, searchSlider: 50, buttonSlider: 50}, function(items) {
    options = items;
    // apply property to HTML
    for(let property in items)
      typeof items[property] === 'boolean' ? $('#' + property).attr('checked', items[property]) : $('#' + property).val(items[property]);
  });
  // after data is retrieved
  setTimeout(function() {
    // set user name
    $('#searchBar').val(options['ign']);
    // activate game
    $('[name = "gameButton"][id = "' + options.game + '"]').addClass('active');
    // activate system (if possible)
    let multiSystem = ['fortnite', 'overwatch'];
    // find whether the API supports multi-system
    let disableSystem = Object.values(multiSystem).find(function (obj) {
      return obj === options.game;
    }) ? false : true;
    $('#system').prop('disabled', disableSystem);
    // enable the system
    if(!disableSystem)
      $('[name = "systemButton"][id = "' + options.system + '"]').addClass('active');
    // mute sound
    $('#soundClips').children().each(function() {
      $(this).prop('muted', options.mute);
    });
    // set sliders
    $('#soundLevels').children('[class = "option setting"]').each(function() {
      // get slider
      let slider = $(this).find('[class = "option slider bar"]');
      let sliderText = $(this).find('[class = "option slider-text"]');
      // set value
      let value = options[sliderNames[$(this).index()]];
      slider.val(value);
      sliderText[0].innerHTML = value + '%';
    });
    // set volume
    $('#soundClips').children().each(function() {
      $(this).prop('volume', options[sliderNames[$(this).index()]] * 0.01);
    });
  }, 100);
}

// if a game button element is clicked
$('#tab-list').on('click', '[class = "tab"]', function() {
  // get tabs to display and to hide
  let displayTab = $('[class = "tab-content"][name = "' + $(this).attr('name') + '"]');
  let hideTab = $('[class = "tab-content"]:visible');
  // display hidden tab
  displayTab.removeAttr('hidden');
  // hide the rest
  hideTab.each(function() {
    $(this).attr('hidden', true);
  });
  // toggle all tabs besides activated one
  $(this).toggleClass('active').siblings().not(this).removeClass('active');
});

// save default IGN
$('#ign').on('change', function() {
  let ign = $(this).val() !== undefined ? $(this).val() : undefined;
  chrome.storage.sync.set({ign: ign});
  loadOptions();
});

// save default game
$('#game').on('change', function() {
  let game = $(this).val()
  chrome.storage.sync.set({game: game});
  loadOptions();
});

// save default system
$('#system').on('change', function() {
  let system = $(this).val();
  chrome.storage.sync.set({system: system});
  loadOptions();
});

// mute sound
$('#mute').on('change', function() {
  let mute = $(this).prop('checked');
  chrome.storage.sync.set({mute: mute});
  loadOptions();
});

// if a game button element is clicked
$('#soundLevels').on('mouseup', '[class = "option setting"]', function() {
  // get all sliders
  let slider = $(this).find('[class = "option slider bar"]');
  // determine which slider
  let property = sliderNames[$(this).index()];
  // save value
  let object = {};
  object[property] = slider.val();
  chrome.storage.sync.set(object);
  loadOptions();
});
