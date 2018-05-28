// for optimizations and debugging
'use strict';

// if the mouse enters a table row
$(document).on('mouseenter', '#statTable tr', function() {
  // swap default styling and hover
  $(this).prev().find('th').removeClass('tableHeader').addClass('tableHover');
});

// if the mouse leaves a table row
$(document).on('mouseleave', '#statTable tr', function() {
  // swap default styling and hover
  $(this).prev().find('th').removeClass('tableHover').addClass('tableHeader');
});
