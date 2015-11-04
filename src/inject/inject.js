var readyStateCheckInterval, loadedThumbInterval;
chrome.extension.sendMessage({}, function(response) {
	var imgSrcList = [];
	readyStateCheckInterval = setInterval(readyCallback, 10);


	function readyCallback(){
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);
			// ----------------------------------------------------------
			// This part of the script triggers when page is done loading
			console.log("Hello. This message was sent from scripts/inject.js");
			// ----------------------------------------------------------
			var pages = $("#allPages>.thumbs-wrap>.thumbs.readable");
			loadedThumbInterval = setInterval(loadedCallback, 10, pages);
		}
	}

	function loadedCallback(pages){
		if (!pages.hasClass("loading")){
			clearInterval(loadedThumbInterval);
			pages.each(function(index){
				var pageIndex = $(this).data("index");
				var imgDiv = $(this).find(".img-div");
				var thumbSrc = imgDiv.css("background-image");
				console.log(thumbSrc);
				/* Will be either jpg_75/cov.jpg or n/standard.jpg (01/standard.jpg) */
				var imgName = thumbSrc.match("url\(.*/([^/]*/[^/]*jpg).*\)")[2];
				console.log(imgName);
				if (imgName.indexOf("standard.jpg") != -1){
					var id = imgName.match("([^/]*)")[1];
					imgName = "jpg_75/" + id + ".jpg";
				}
				imgSrcList[pageIndex] = imgName;
			});
			console.log(imgSrcList);
		}
	}

});
