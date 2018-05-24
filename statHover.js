  $(document).on('mouseenter', '#statTable tr:odd', function() {
    $(this).prev().css("background-color", "red !important");
  });

  $(document).on('mouseleave', '#statTable tr:odd', function() {
    $(this).prev().css("background-color", "black !important");
  });
