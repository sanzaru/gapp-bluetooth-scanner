/*
 * Main controller for the bluetooth scanner app
 *
 * @author Martin Albrecht <martin.albrecht@javacoffee.de>
 * @version 0.0.1
 */

angular.module('btScanner', [])
.filter('ucfirst', function() {
  return function(input) {
    console.log("Here!", input);
    if( input !== null ) {
      return input.charAt(0).toUpperCase() + input.slice(1);
    }
  }
})
.controller('MainCtrl', ['$scope', function($scope) {
  $scope.status = false;
  $scope.adapter = null;
  $scope.showDeviceList = false;
  $scope.deviceScan = false;
  $scope.deviceList = [];
  $scope.timeout = 20;
  
  
  /**
   * Initialize tooltips
   */
  $scope.initTooltips = function() {
    $('[data-toggle="tooltip"]').tooltip();
  }
  
  
  /**
   * Set the current bluetooth adapter
   *
   * @param {Object}
   * @return {undefined}
   */
  $scope.setAdapter = function(adapter) {
    $scope.$apply(function() {
      $scope.adapter = adapter;
    });
  };


  /**
   * Start device discovery for a optional specified amount of time
   *
   * @param {int}
   * @return {undefined}
   */
  $scope.startDiscovery = function(timeout) {
    $scope.deviceList = [];
    $scope.showDeviceList = true;
    $scope.deviceScan = true;
    $scope.percentDone = 0;
    chrome.bluetooth.startDiscovery();
    chrome.bluetooth.getDevices(function(devices) {
      for(var i=0, len=devices.length; i<len; i++) {
        devices[i].old = true;
        $scope.addDevice(devices[i]);
      }
    });
    
    var tm = parseInt(timeout)*1000 || 0;
    
    if( tm > 0 ) {
      $scope.scanProgress = 0;
      window.setTimeout($scope.stopDiscovery, tm);
      
      $scope.progressInterval = window.setInterval(function() {
        var progressBar = document.getElementById('scanProgress');
        $scope.$apply(function() {
          $scope.scanProgress++;
        });
        
        $scope.percentDone = parseInt(($scope.scanProgress / timeout) * 100);
        
        progressBar.setAttribute('aria-valuenow', $scope.scanProgress);
        progressBar.style.width = $scope.percentDone + '%'
      }, 1000);
    }
  };
  

  /**
   * Stop device discovery
   *
   * @return {undefined}
   */
  $scope.stopDiscovery= function() {
    chrome.bluetooth.stopDiscovery();
    $scope.deviceScan = false;
    if( $scope.progressInterval ) {
      window.clearInterval($scope.progressInterval);
    }
  }
  

  /**
   * Add a device to the device list (newly discovered and old ones)
   *
   * @param {Object}
   * @return {undefined}
   */
  $scope.addDevice = function(device) {
    console.log(device);
    
    if( !device.old ) device.old = false;
    
    $scope.$apply(function() {
      $scope.deviceList.push(device);
    });
  };
  

  /**
   * Fetch all already known devices
   *
   * @param {function}
   * @return {undefined}
   */
  chrome.bluetooth.getDevices(function(devices) {
    for(var i=0, len=devices.length; i<len; i++) {
      devices[i].old = true;
      $scope.addDevice(devices[i]);
    }
  });
  

  /**
   * Get the adapter state
   *
   * @param {function}
   * @return {undefined}
   */
  chrome.bluetooth.getAdapterState(function(adapter) {
    console.log("Adapter " + adapter.address + ": " + adapter.name);
    $scope.setAdapter(adapter);
  });
  

  /**
   * Callback if adapter state changed
   *
   * @param {function}
   * @return {undefined}
   */
  chrome.bluetooth.onAdapterStateChanged.addListener(function(adapter) {
    $scope.setAdapter(adapter);
  });
  

  /**
   * Callback if a device is added
   *
   * @param {function}
   * @return {undefined}
   */
  chrome.bluetooth.onDeviceAdded.addListener($scope.addDevice);
}]);