angular.module('elevatorModule').service('DataTransformService', function(){
    return {

        transformToFloors: function(data){
            //data looks like:
            //
            // {


            return data;
        },
        
        normalizeData: function(data) {
            for (i=0; i < data.length; i++) {
                if (new Date(data[i].Timestamp) > new Date('2016-01-16T16:00:00')) {
                    data[i].Altitude = data[i].Altitude - 15
                }
            }
            return data;
        }

    }
});