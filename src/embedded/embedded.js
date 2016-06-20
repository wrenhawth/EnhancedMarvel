function disableSmartPanel(controls){
  if (controls.attributes.smartPanel){
    controls.panelToggle();
  }
}

function overwriteControls(model, controls){
  /* Save original methods so we can move forward or back one page at a time */
  _.extend(controls, {
    oneNext: controls.goToNext,
    onePrevious: controls.goToPrevious,
    goToNext: function(){
      var pages = model.attributes.pages;
      var bookLength = pages.length;
      var last = model.loc.pageIdx;
      var a = Math.min(last + 1, bookLength - 1);
      var b = Math.min(last + 2, bookLength - 1);
      resetView();
      if (twoPage && a != b && !pages[a].splashPage && !pages[b].splashPage){
        model.once('updateBookLoc', function(event){
          displayTwoPages(a, b);
          _.delay(displayTwoPages, 600, a, b);
        });
        model.goToLocation(b, 0);
      }else{
        controls.oneNext();
        _.delay(resetView, 400);
      }
    },
    goToPrevious: function(){
      var pages = model.attributes.pages;
      var bookLength = pages.length;
      var last = model.loc.pageIdx;
      if (j3('svg.leftPage').length > 0){
        last -= 1;
      }
      var a = Math.max(last - 2, 0);
      var b = Math.max(last - 1, 0);
      console.log(a, b);
      resetView();
      if (twoPage && a > 0 && a != b && !pages[a].splashPage && !pages[b].splashPage){
        model.once('updateBookLoc', function(event){
          _.delay(displayTwoPages, 600, a, b);
          displayTwoPages(a, b);
        });
        model.goToLocation(b, 0);
      }else{
        model.goToLocation(b, 0);
        _.delay(resetView, 250);
      }
    }
  });
}

function resetView(){
  j3('svg').each(function(index, value){
    j3(value).removeClass('leftPage');
    j3(value).removeClass('rightPage');
    j3(value).removeAttr('preserveAspectRatio');
  });
}
function displayTwoPages(a, b){
  resetView();
  var firstPage, secondPage;
  /*
  var firstPage = j3('svg[style*="left: -100%"]');
  var secondPage = j3('svg[style*="display: block"]');
  */
  j3('svg image').each(function(index, value){
    if (j3(value).attr('href') == pages[a].url){
      firstPage = j3(value).parent();
    }else if (j3(value).attr('href') == pages[b].url){
      secondPage = j3(value).parent();
    }
  });

  if (firstPage && secondPage){
    firstPage.attr('width', '50%');
    firstPage.attr('preserveAspectRatio', 'xMaxYMin meet');
    //firstPage.find('rect').attr('x', '50%');
    secondPage.attr('width', '50%');
    secondPage.attr('preserveAspectRatio', 'xMinYMin meet');
    firstPage.addClass('leftPage');
    secondPage.addClass('rightPage');
  }
}
function processPages(pages){
  _.each(pages, function(page){
    var w = page.width;
    var h = page.height;
    page.splashPage = w > h;
  });

}

/* Allow extension use of jQuery 3 without interfering with native jQuery */
j3 = jQuery.noConflict(true);
var body = j3('body');
/* Core variables for manipulating and analyzing pages */
var rocket = window.rocket;
var model = rocket.models.model;
var controls = window.rocket.models.controlsModel;
var disablePanel = body.data('disablepanel');
var twoPage = body.data('twopage');

var pages = model.attributes.pages;

/* Pages might or might not be loaded at this point */
if (pages.length == 0){
  model.on('loaded', function(){
    pages = rocket.models.model.attributes.pages;
    processPages(pages);
    if (disablePanel){
      disableSmartPanel(controls);
    }
    overwriteControls(model, controls);
  });
}else{
  processPages(pages);
  if (disablePanel){
    disableSmartPanel(controls);
  }
  overwriteControls(model, controls);
}
