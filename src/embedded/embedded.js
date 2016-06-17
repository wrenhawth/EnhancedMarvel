function disableSmartPanel(){
  var rocket = window.rocket;
  if (rocket.pagesview.controlsModel.attributes.smartPanel){
    rocket.pagesview.controlsModel.panelToggle();
  }
}

$(function(){
  disableSmartPanel();
});
