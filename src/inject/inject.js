var readyStateCheckInterval, loadedThumbInterval;
var images = [];
var twopageButton;
buttonWrapper = document.createElement('li');
twopageButton = document.createElement('iframe');
twopageButton.id='twoPage';
twopageButton.src = chrome.extension.getURL('twoPageBtn.html');
twopageButton.frameBorder = 0;
twopageButton.height = '40px';
buttonWrapper.className = 'icon';
buttonWrapper.appendChild(twopageButton);

chrome.extension.sendMessage({}, function(response) {
	var pages = [];
	var imgSrcList = [];
	var processed = [];
	var current = [];
	var currentPlace = [0];
	var twoPage = true;
	var locked = false;
	readyStateCheckInterval = setInterval(readyCallback, 10);


	function readyCallback(){
		if (document.readyState === 'complete') {
			clearInterval(readyStateCheckInterval);
			// ----------------------------------------------------------
			// This part of the script triggers when page is done loading
			console.log('Hello. This message was sent from scripts/inject.js');
			// ----------------------------------------------------------
			// $('#footer>footer>nav>ul').append(buttonWrapper);
			/* We'll embed a script for any functionality that requires access to
			window objects */
			embedExtensionScript('js/jquery/jquery.min.js', function() {
				embedExtensionScript('src/embedded/embedded.js');
			});
			var pageImages = $('#page>svg');
			pageImages.each(function(index, value){
				var observer = new MutationObserver(function(mutations){
					mutations.forEach(function(mutation){
						if (mutation.addedNodes.length == 0){
							return;
						}
						var node = mutation.addedNodes[0];
						if (node.nodeName == 'image'){
							processPage(node);
							currentPlace = filterSplashPages(currentPlace);
							//console.log(currentPlace);
							showPages(currentPlace);
							locked = false;
						}
					});
				});

				var config = {
					childList: true
				};

				observer.observe(value, config);
			});
			//loadedThumbInterval = setInterval(loadedCallback, 1000);
		}
	}

	function loadedCallback(){
		/* We'll use the thumbnails of all the comic pages to determine
		the order of the pages in the comic */
		var pageThumbs = $('#allPages>.thumbs-wrap>.thumbs.readable');
		if (pageThumbs.length > 0 && !pageThumbs.hasClass('loading')){
			clearInterval(loadedThumbInterval);
			pageThumbs.each(function(index){
				var pageIndex = $(this).data('index');
				var imgDiv = $(this).find('.img-div');
				var thumbSrc = imgDiv.css('background-image');
				var imgName =  extractSrc(thumbSrc);
				imgSrcList[pageIndex] = imgName;
			});
			var index = Math.min(currentPages());
			$('span.icon.help').click(function(){
				console.log(pages);
			});
			$('#left_arrow').click(function(){
				if (!locked){
					currentPlace = changePage(false);
				}
			});
			$('#right_arrow').click(function(){
				if (!locked){
					currentPlace = changePage(true);
				}
			});


			// $('#left_arrow, #right_arrow').click(function(){
			// 	var index = Math.min(currentPages());
			// 	if (!twoPage || pages[index+1] == undefined){
			// 		return;
			// 	}
			// 	if (!(pages[index].splashPage || pages[index+1].splashPage)){
			// 		pages[index].svg.addClass('leftPage');
			// 		pages[index+1].svg.addClass('rightPage');
			// 	}
			// });
		}
	}
	function processPage(node){
		var page = {};
		page.svgRaw = node.parentElement;
		page.svg = $(page.svgRaw);
		if (page.svg.has('image[href]')){
			var img = page.svg.find('image');
			page.href = img.attr('href');
			if (page.href == undefined){
				return;
			}
			var index = processed.indexOf(page.href);
			if (index == -1){
				page.imgName = extractSrc(page.href);
				page.index = imgSrcList.indexOf(page.imgName);
				processed[page.index] = page.href;
				pages[page.index] = page;
				if(page.svg.css('display') != 'none'){
					current.push(page.index);
				}else if (pages[index].svg.css('display') != 'none'){
					current.push(index);
				}
			}
		}
	}
	/* Processes data for loaded pages and returns the current page index */
	function currentPages(){
		var current = [];
		var loaded = $('#page>svg');
		loaded.each(function(index, value) {
			var page = {};
			page.svg = $(value);
			page.svg.removeClass('leftPage');
			page.svg.removeClass('rightPage');
			page.svgRaw = value;
			if (page.svg.has('image[href]')){
				var img = page.svg.find('image');
				page.href = img.attr('href');
				if (page.href == undefined){
					return;
				}
				var index = processed.indexOf(page.href);
				if (index == -1){
					page.imgName = extractSrc(page.href);
					page.width = Number(img.attr('width'));
					page.height = Number(img.attr('height'));
					page.splashPage = (page.width > page.height);
					page.index = imgSrcList.indexOf(page.imgName);
					processed[page.index] = page.href;
					if(page.svg.css('display') != 'none'){
						current.push(page.index);
					}
					pages[page.index] = page;
				}else if (pages[index].svg.css('display') != 'none'){
					current.push(index);
				}
			}
		});
		return current;
	}
	function filterSplashPages(indices){
		if (indices.length > 1){
			var hrefA = pages[indices[0]].href;
			var hrefB = pages[indices[1]].href;
			if (splashPage(hrefA) || splashPage(hrefB)){
				return [indices[0]];
			}
		}
		return indices;
	}

	function splashPage(href){
		console.log(href);
		if(href != undefined){
			var image = new Image();
			image.src = href;
			var w = image.width;
			var h = image.height;
			return w > h;
		}
		return true;
	}
	function changePage(next){
		locked = true;
		var index;
		$('#page>svg').each(function(index, value){
			$(value).removeClass('leftPage');
			$(value).removeClass('rightPage');
		})
		if (!twoPage){
			index = currentPlace[0];
			if (next){
				return [Math.min(imgSrcList.length - 1, index + 1)];
			}else{
				return [Math.max(0, index - 1)];
			}
		}
		var a, b;
		if (next){
			index = currentPlace[0];
			a = Math.min(imgSrcList.length - 1, index + 1);
			b = Math.min(imgSrcList.length - 1, index + 2);
		}else{
			index = currentPlace[0];
			a = Math.max(0, index - 1)
			b = Math.max(0, index);
		}
		if (a == b){
			return [a];
		}
		return [a, b];
		// if (b >= imgSrcList.length || a < 0 || b >= pages.length){
		// 	return;
		// }
		//
		// var pageA = pages[a];
		// var pageB = pages[b];
		// if (pageA.splashPage || pageB.splashPage){
		// 	return;
		// }
		// pageA.svg.css('display', 'block');
		// pageB.svg.css('display', 'block');
	}

	function showPages(indices){
		if (indices.length > 1){
			var a = indices[0];
			var b = indices[1];
			var pageA = pages[a];
			var pageB = pages[b];


			// pageA.svg.css('display', 'block');
			// pageA.svg.css('left', '-12.5%');
			pageA.svg.addClass('leftPage');
			// pageB.svg.css('display', 'block');
			// pageB.svg.css('left', '12.5%');
			pageB.svg.addClass('rightPage');
		}
	}
	function extractSrc(str){
		var imgName = str.match('\(.*/([^/]*/[^/]*jpg).*\)')[2];
		if (imgName.indexOf('standard.jpg') != -1){
			var id = imgName.match('([^/]*)')[1];
			imgName = 'jpg_75/' + id + '.jpg';
		}
		return imgName;
	}

});
