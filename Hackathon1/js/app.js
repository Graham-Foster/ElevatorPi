console.log("LOADED");
var module = angular.module('elevatorModule', ['nvd3']);

module.controller('MainController', ['$scope', '$timeout', 'ElevatorDataService', 'DataTransformService', function($scope, $timeout, ElevatorDataService, DataTransformService){

    $scope.columnHeaders = ['Time', 'ACC-X', 'ACC-Y', 'ACC-Z', 'ALT', 'PRESSURE', 'MOTION', 'BUTTON'];
    $scope.elevatorData = [];
    $scope.pollFrequency = 5000;
    $scope.showAccGraph = true;
    $scope.showAltitudeGraph = true;
    $scope.showRawData = false;
    $scope.showAlternateGraph = false;

    $scope.buttonLabel = "Restart polling";
    $scope.polling = false;

    $scope.accelerationGraphFilter = {
        startTime:{hours:0, minutes:0, seconds:0},
        endTime:{hours:0, minutes:0, seconds:0}
    };

    $scope.init = function() {
         //$scope.pollServer();
        $scope.loadAllData();
    };

    $scope.loadAllData = function() {
        ElevatorDataService.getElevatorData(0, new Date().valueOf()).then(function(response){

            // normalize data
            response.data = DataTransformService.normalizeData(response.data);

            $scope.elevatorData = response.data;
        }, function(){
            console.log("ERROR")
        });
    };

    $scope.toggleData = function() {
        if ($scope.polling) {
            $scope.buttonLabel = "Restart polling";
            $scope.loadAllData();
            $scope.polling = false;
        } else {
            $scope.buttonLabel = "Show All Data";
            $scope.pollServer();
            $scope.polling = true;
        }
    };

    $scope.clear = function() {
        $scope.elevatorData = [];
    };

    $scope.$watch('elevatorData', function(newValue, oldvValue){
        if (!$scope.polling) {
            angular.forEach(newValue, function(value, key){
                $scope.accelerationGraphData[0].values.push({x:new Date(value.Timestamp).valueOf(), y:value.AccZ});
                $scope.altitudeGraphData[0].values.push({x:new Date(value.Timestamp).valueOf(), y:value.Altitude});
            });
        }
    });

    $scope.updateGraph = function(value) {
        if ($scope.polling) {
            $scope.accelerationGraphData[0].values.push({x:new Date(value.Timestamp).valueOf(), y:value.AccZ});
            if ($scope.accelerationGraphData[0].values.length > 20) $scope.accelerationGraphData[0].values.shift();

        }
    };

    $scope.showRawDataToggle = function() {
        $scope.showRawData = true;
        $scope.showAccGraph = false;
    };
    $scope.showAccGraphToggle = function() {
        $scope.showRawData = false;
        $scope.showAccGraph = true;
    };

    $scope.pollServer = function() {
        console.log("POLLING");
        if (!$scope.polling) {
            ElevatorDataService.getElevatorData().then(function(response){
                if (response.data && response.data.length > 0) {
                    angular.forEach(response.data, function(value, key){
                        $scope.elevatorData.push(value);
                        $scope.updateGraph(value);
                    });
                }
                $timeout(function(){$scope.timeoutHandler()}, $scope.pollFrequency);
            }, function(){
                console.log("ERROR")
            });
        }
    };

    $scope.timeoutHandler = function() {
        $scope.pollServer();
    };

    $scope.accelerationGraphOptions = {
        chart: {
            type: 'lineChart',
            height: 800,
            width:1000,
            margin : {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            x: function(d){ return d.x; },
            y: function(d){ return d.y; },
            useInteractiveGuideline: true,
            transitionDuration:500,
            yAxis: {
                tickFormat: function(d){
                    return d3.format('.01f')(d);
                }
            }
        }
    };
    $scope.accelerationGraphData = [{
        values:[],
        key:'Acceleration'
    }];
    
    $scope.altitudeGraphOptions = {
        chart: {
            type: 'lineChart',
            height: 800,
            width:1000,
            margin : {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            x: function(d){ return d.x; },
            y: function(d){ return d.y; },
            useInteractiveGuideline: true,
            transitionDuration:500,
            yAxis: {
                tickFormat: function(d){
                    return d3.format('.01f')(d);
                }
            }
        }
    };
    $scope.altitudeGraphData = [{
        values:[],
        key:'Altitude'
    }];

    $scope.filterAccGraph = function() {
        var startTimeStr = "Jan 16 2015 " + pad($scope.accelerationGraphFilter.startTime.hours, 2) + ":"
            + pad($scope.accelerationGraphFilter.startTime.minutes, 2) + ":"
            + pad($scope.accelerationGraphFilter.startTime.seconds, 2)
        var startTime = new Date(startTimeStr);

        var endTimeStr = "Jan 16 2015 " + pad($scope.accelerationGraphFilter.endTime.hours, 2) + ":"
            + pad($scope.accelerationGraphFilter.endTime.minutes, 2) + ":"
            + pad($scope.accelerationGraphFilter.endTime.seconds, 2)
        var endTime = new Date(endTimeStr);

        ElevatorDataService.getElevatorData(startTime.valueOf(), endTime.valueOf()).then(
            function(response) {
                console.log(response.data);
                $scope.elevatorData = response.data;
                setTimeout(function() {
                    $scope.accelerationGraphData[0].values = [{x:null, y:null}];
                    angular.forEach(response.data, function(value, key){
                        $scope.accelerationGraphData[0].values.push({x:new Date(value.Timestamp).valueOf(), y:value.AccZ});
                    });
                    $scope.$apply();
                }, 10);
            }, function() {
                console.log("ERROR");
            }
        )


    }

    $scope.showOtherGraph = function() {
        if($scope.showAlternateGraph) {
            $scope.showAccGraph = true;
            $scope.showRawData = false;
            $scope.showAlternateGraph = false;
        } else {
            $scope.showAccGraph = false;
            $scope.showRawData = false;
            $scope.showAlternateGraph = true;
        }
    }


}]);

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

module.factory('ElevatorDataService', ['$http', '$q', function($http, $q){
    return {
        getElevatorData : function(startTime, endTime) {
            return $http({
                method:'GET',
                url:'http://elevator:8000/query',
                params:{start:startTime, end:endTime}
            });
        }
    };
}]);