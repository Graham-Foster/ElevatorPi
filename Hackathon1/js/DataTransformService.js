angular.module('elevatorModule').service('DataTransformService', function(){
    return {
        transformToFloors:function(altitude) {
            return (altitude + 5.5)/3.5;
        },
        normalizeData: function(data) {
            for (i=0; i < data.length; i++) {
                if (new Date(data[i].Timestamp) > new Date('2016-01-16T16:00:00')) {
                    data[i].Altitude = data[i].Altitude - 15
                }
                
                // sensor reset values
                if (data[i].AccZ == 0) {
                    data[i].AccZ = 1
                }
                
                if (data[i].Altitude == 0) {
                    data[i].Altitude = 23
                }

                data[i].Floor = this.transformToFloors(data[i].Altitude);
            }
            return data;
        }

    };

    var transformToFloors = function(altitude){
          return (altitude + 5.5)/3.5;
    }
});