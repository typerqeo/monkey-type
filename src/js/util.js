function showBackgroundLoader() {
  $("#backgroundLoader").stop(true, true).fadeIn(125);
}

function hideBackgroundLoader() {
  $("#backgroundLoader").stop(true, true).fadeOut(125);
}

function accountIconLoading(truefalse) {
  if (truefalse) {
    $("#top #menu .account .icon").html(
      '<i class="fas fa-fw fa-spin fa-circle-notch"></i>'
    );
    $("#top #menu .account").css("opacity", 1);
  } else {
    $("#top #menu .account .icon").html('<i class="fas fa-fw fa-user"></i>');
    $("#top #menu .account").css("opacity", 1);
  }
}
