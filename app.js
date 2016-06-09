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
    var spring_log_regex = /^((\d{1,4}\-\d{1,2}\-\d{1,2})\s+(\d{1,2}\:\d{1,2}\:\d{1,2}\.\d{1,4})\s+(ERROR|WARN|INFO|DEBUG|TRACE|FATAL)\s+(\d+)\s+(---)\s+(\[[\w\-]*\])\s+([\w\.\[\]\/\\]*)\s+\:\s+(.*))/;

    for(var hit in hits){
        //$log.debug(hit);
        alert("Antes de if");
        if(hit['_source']['log']){
            alert("Despues de if");
            if(spring_log_regex.exec(hit._source.log)){
                var new_source = [];
                new_source.time=hit._source.log.match(/^((\d{1,4}\-\d{1,2}\-\d{1,2})\s+(\d{1,2}\:\d{1,2}\:\d{1,2}\.\d{1,4}))/); //match timestamp
                new_source.container_name=hit._source.container_name; //take the container name
                new_source.log_level=hit._source.log.match(/(ERROR|WARN|INFO|DEBUG|TRACE|FATAL)/); //match the log level
                new_source.process_id=hit._source.log.match(/\s+(\d+)\s+/); //match the process id
                new_source.thread_name=hit._source.log.match(/\s+(\[[\w\-]*\])\s+/);
                new_source.class=hit._source.log.match(/\s+([\w\.\[\]\/\\]*)\s+\:/);
                new_source.message=hit._source.log.match(/\:\s+(.*)$/);
                new_hits.push(new_source);
            }
        }
    }
    return new_hits;

};