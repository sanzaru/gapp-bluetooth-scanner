chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    'bounds': {
      'width': 900,
      'height': 650
    },
    'minWidth': 900,
    'minHeight': 600
  });
});