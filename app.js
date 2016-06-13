/**
 * Created by scatt on 9/06/16.
 */

var app = angular.module("app",[]);



app.controller("QueryController", ["$log", "$http", function($log, $http){
    var vm = this;
    vm.hits = [];
    $http({
        method: 'GET',
        url: './src.json'
    }).then(function successCallback(response) {
        $log.info("Petición realizada con éxito");
        vm.hits = parseLogs(response.data.hits.hits);
        $log.info("Copiado el array de hits en el modelo de objetos");
    }, function errorCallback(response) {
        $log.error("La petición no se ha realizado con éxito"+" "+response.status);
    });
}]);


var parseLogs = function(hits){

    var new_hits = [];
    var spring_log_regex = /^(\d{1,4}\-\d{1,2}\-\d{1,2}\s+\d{1,2}\:\d{1,2}\:\d{1,2}\.\d{1,4})\s+(ERROR|WARN|INFO|DEBUG|TRACE|FATAL)\s+(\d+)\s+---\s+(\[[\s\w\-]*\])\s+([\w\.\[\]\/\\]*)\s+\:\s+(.*)/;
    var db_regex = /^(\d{1,4}-\d{1,2}\-\d{1,2}T\d{1,2}\:\d{1,2}\:\d{1,2}\.\d{1,8}Z)\s(\d+)\s(\[\w*\])\s(.*)/;
    
    for(var index in hits){

        var current_log = hits[index]._source.log;

        if(hits[index]['_source']['container_name'] === "/db"){
            
            var new_db_source = {};
            
            var match = db_regex.exec(current_log);

            if(match !== null){
                new_db_source['timestamp'] =  match[1];
                new_db_source['container_name'] =  "db";
                new_db_source['log_level']="";
                new_db_source['process_id'] =  match[2];
                new_db_source['thread_name']="";
                new_db_source['class'] =  match[3];
                new_db_source['message'] =  match[4];

                new_hits.push(new_db_source);
            }
        }

        if(hits[index]['_source']['container_name'] === "/app"){

            var new_app_source = {};
            
            var match = spring_log_regex.exec(current_log);

            if(match !== null){
                new_app_source['@timestamp'] =  match[1];
                new_app_source['container_name'] =  "app";
                new_app_source['log_level']= match[2];
                new_app_source['process_id'] =  match[3];
                new_app_source['thread_name']=match[4];
                new_app_source['class'] =  match[5];
                new_app_source['message'] =  match[6];

                new_hits.push(new_app_source);
            }
        }
    }
    return new_hits;

};