chrome.app.runtime.onLaunched.addListener(function() {
  // chrome.storage.local.get = function();

  chrome.app.window.create('pageWrapper.html', {
    'bounds': {
      'width': 320,
      'height': 480
    }
  });
});
