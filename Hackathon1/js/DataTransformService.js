angular.module('elevatorModule').service('DataTransformService', function(){
    return {

        normalizeData: function(data) {
            for (i=0; i < data.length; i++) {
                if (new Date(data[i].Timestamp) > new Date('2016-01-16T16:00:00')) {
                    data[i].Altitude = data[i].Altitude - 15
                }
                data[i].Floor = transformToFloors(data[i].Altitude);
            }
            return data;
        }

    },

    var transformToFloors = function(altitude){
          return (altitude + 5.5)/3.5;
    },
        

});