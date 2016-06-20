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
      if (controls.attributes.smartPanel){
        controls.oneNext();
        return;
      }
      var pages = model.attributes.pages;
      var bookLength = pages.length;
      var last = model.loc.pageIdx;
      var a = Math.min(last + 1, bookLength - 1);
      var b = Math.min(last + 2, bookLength - 1);
      if (twoPage && a != b && !pages[a].splashPage && !pages[b].splashPage){
        model.once('updateBookLoc', function(event){
          resetView();
          displayTwoPages(a, b);
        });
        model.goToLocation(b, 0);
      }else{
        model.once('updateBookLoc', function(event){
          hidePanels();
          //_.delay(resetView, 600);
        })
        hidePanels();
        controls.oneNext();
      }
    },
    goToPrevious: function(){
      if (controls.attributes.smartPanel){
        controls.onePrevious();
        return;
      }
      var pages = model.attributes.pages;
      var bookLength = pages.length;
      var last = model.loc.pageIdx;
      if (j3('svg.leftPage').length > 0){
        last -= 1;
      }
      var a = Math.max(last - 2, 0);
      var b = Math.max(last - 1, 0);
      if (twoPage && a > 0 && a != b && !pages[a].splashPage && !pages[b].splashPage){
        model.once('updateBookLoc', function(event){
          resetView();
          displayTwoPages(a, b);
        });
        model.goToLocation(b, 0);
      }else{
        resetView();
        model.goToLocation(b, 0);
      }
    }
  });
}

function resetView(){
  j3('svg').each(function(index, value){
    j3(value).removeClass('leftPage');
    j3(value).removeClass('rightPage');
    j3(value).removeClass('hidePage');
    j3(value).removeAttr('preserveAspectRatio');
  });
}

function hidePanels(){
  j3('svg.leftPage, svg.rightPage').addClass('hidePage');
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

var loadedCallback = function(){
  pages = model.attributes.pages;
  processPages(pages);
  if (disablePanel){
    disableSmartPanel(controls);
  }
  overwriteControls(model, controls);
};

/* Allow extension use of jQuery 3 without interfering with native jQuery */
j3 = jQuery.noConflict(true);
var body = j3('body');

/* Retrieve options for extension */
var disablePanel = body.data('disablepanel');
var twoPage = body.data('twopage');

/* Core variables for manipulating and analyzing pages */
var rocket = window.rocket;
var model = rocket.models.model;
var controls = rocket.models.controlsModel;
var pages = model.attributes.pages;

/* Pages might or might not be loaded at this point */
if (pages.length == 0){
  model.on('loaded', loadedCallback);
}else{
  loadedCallback();
}
