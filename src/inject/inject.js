var readyStateCheckInterval;

chrome.extension.sendMessage({}, function(response) {
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
		}
	}
});
