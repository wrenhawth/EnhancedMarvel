// Saves options to chrome.storage
function save_options() {

  var disablePanel = document.getElementById('disableSmartPanel').checked;
  var twoPage = document.getElementById('twoPage').checked;
  chrome.storage.sync.set({
    disablePanel: disablePanel,
    twoPage: twoPage
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    disablePanel: true,
    twoPage: true
  }, function(items) {
    document.getElementById('disableSmartPanel').checked = items.disablePanel;
    document.getElementById('twoPage').checked = items.twoPage;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
save_options);

function main(){
  restore_options();
  document.getElementById('save').addEventListener('click',
  save_options);
}

main();
