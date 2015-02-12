var myApp = angular.module('myApp', []);

myApp.controller('MainCtrl', ['$scope', function($scope) {
  $scope.status = false;
  $scope.adapter = null;
  $scope.showDeviceList = false;
  $scope.deviceScan = false;
  $scope.deviceList = [];
  $scope.timeout = 20;
  $scope.deviceTypes = [
    "Computer", "Phone", "Modem", "Audio", "Car audio", "Video", "Peripheral",
    "Joystick", "Gamepad", "Keyboard", "Mouse", "Tablet", "Keyboard Mouse Combo"
  ];

  
  $scope.setAdapter = function(adapter) {
    $scope.$apply(function() {
      $scope.adapter = adapter;
    });
  };

  $scope.startDiscovery = function(timeout) {
    $scope.deviceList = [];
    $scope.showDeviceList = true;
    $scope.deviceScan = true;
    $scope.percentDone = 0;
    chrome.bluetooth.startDiscovery();
    chrome.bluetooth.getDevices(function(devices) {
      for(var i=0, len=devices.length; i<len; i++) {
        devices[i].old = "Yes";
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
  
  $scope.stopDiscovery= function() {
    chrome.bluetooth.stopDiscovery();
    $scope.deviceScan = false;
    if( $scope.progressInterval ) {
      window.clearInterval($scope.progressInterval);
    }
  }
  
  $scope.addDevice = function(device) {
    console.log(device);
    
    if( !device.old ) device.old = "No";
    
    $scope.$apply(function() {
      $scope.deviceList.push(device);
    });
  };
  
  chrome.bluetooth.getDevices(function(devices) {
    for(var i=0, len=devices.length; i<len; i++) {
      devices[i].old = "Yes";
      $scope.addDevice(devices[i]);
    }
  });
  
  chrome.bluetooth.getAdapterState(function(adapter) {
    console.log("Adapter " + adapter.address + ": " + adapter.name);
    $scope.setAdapter(adapter);
  });
  
  chrome.bluetooth.onAdapterStateChanged.addListener(function(adapter) {
    $scope.setAdapter(adapter);
  });
  
  chrome.bluetooth.onDeviceAdded.addListener($scope.addDevice);
}]);