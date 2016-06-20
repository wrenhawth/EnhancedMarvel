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
      model.loc.leftIdx = a;

      if (controls.attributes.smartPanel){
        controls.oneNext();
        return;
      }

      if (twoPage && areSinglePages(a, b)){
        model.once('updateBookLoc', function(event){
          resetView();
          displayTwoPages(a, b);
        });
        model.goToLocation(b, 0);
      }else{
        model.once('updateBookLoc', function(event){
          hidePages();
        })
        hidePages();
        controls.oneNext();
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
      model.loc.leftIdx = a;

      if (controls.attributes.smartPanel){
        controls.onePrevious();
        return;
      }
      if (twoPage && areSinglePages(a, b)){
        model.loc.twoPage = true;
        model.loc.aIdx = a;
        model.loc.bIdx = b;
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

  /* Monitor if panel view is activated */
  controls.on('change:smartPanel', function(c){
    if (c.attributes.smartPanel){
      /* Entering panel view */
      model.goToLocation(model.loc.leftIdx, 0);
      resetView();
    }else{
      /* Exiting panel view */
      var a = model.loc.pageIdx;
      var b = Math.min(a + 1, pages.length - 1);
      if (twoPage && areSinglePages(a, b)){
        model.once('updateBookLoc', function(event){
          resetView();
          hidePanels();
          displayTwoPages(a, b);
        });
        model.goToLocation(b, 0);
      }
    }
  });

  controls.on('goDirectlyToPage', function(c){
    var a = model.loc.pageIdx;
    var b = Math.min(a + 1, pages.length - 1);
    if (twoPage && areSinglePages(a, b)){
      model.once('updateBookLoc', function(event){
        resetView();
        hidePanels();
        displayTwoPages(a, b);
      });
      model.goToLocation(b, 0);
    }else{
      resetView();
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

function hidePages(){
  j3('svg.leftPage, svg.rightPage').addClass('hidePage');
}

function hidePanels(){
  j3('svg').each(function(index, value){
    var height = value.viewBox.baseVal.height;
    var width = value.viewBox.baseVal.width;

    var img = j3(value).find('image')[0];
    if (img != undefined){
      var imgH = img.height.baseVal.value;
      var imgW = img.width.baseVal.value;
      if (imgH == 0 || imgW == 0){
        return;
      }else if (imgH != height || imgW != width){
        j3(value).addClass('hidePage');
      }
    }
  })
}
function areSinglePages(a, b){
  /* Check if pages at a and b are distinct and not splash pages or covers*/
  if (a==0 || a == b){
    return false;
  }
  return (!pages[a].splashPage && !pages[b].splashPage);
}

function displayTwoPages(a, b){
  //resetView();
  /* Very occasionally, an image can be loaded in more than one svg */
  var firstPage = j3(null);
  var secondPage = j3(null);
  j3('svg image').each(function(index, value){
    if (j3(value).attr('href') == pages[a].url){
      firstPage = firstPage.add(j3(value).parent());
    }else if (j3(value).attr('href') == pages[b].url){
      secondPage = secondPage.add(j3(value).parent());
    }
  });
  j3('div.thumbs[data-index="' + a + '"]').addClass('activePage');
  if (firstPage && secondPage){
    firstPage.attr('width', '50%');
    firstPage.attr('preserveAspectRatio', 'xMaxYMin meet');
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
