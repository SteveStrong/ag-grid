agGrid.initialiseAgGridWithAngular1(angular);

var module = angular.module("app", ["agGrid"]);

module.controller("gridCtrl", function ($http) {

    //docker run -d -p 3000:3000 -p 8080:8080 datalift/starbucks.datalift

    var skip = 0;
    var take = 300;

    var gridOptions = {
        columnDefs: [],
        rowData: [],

        rowSelection: 'multiple',
        enableColResize: true,
        enableSorting: true,
        enableFilter: true,
        groupHeaders: true,
        rowHeight: 22,
        logging: true,
        suppressRowClickSelection: true
    };

    //http://localhost:3000/ 

    function serviceUrl() {
        var url = "/API/query";
        url += "?skip=" + skip;
        url += "&take=" + take;
        return url;
    }

    function metadataToColumnDef(meta) {
        var columnDefs = [];

        for (var key in meta) {
            var item = meta[key];

            var columnDef = {
                field: key,
                type: item && item.dataType,
                title: item && item.label || key,
                headerName: item && item.label || key,
                data: item
            }

            columnDefs.push(columnDef);

            var filter = [];
            var facet = item && item.facet;
            if (facet && !facet.isUnique) {
                var stats = facet.stats;
                filter[stats.field] = stats.mostFrequentValue;
            }
        }

        return columnDefs;

    }


    function getMetaData(onComplete) {
        //var url = 'http://localhost:3000/api/metadata'
        var url = '/api/metadata'
        $http({
            method: "GET",
            url: url,
            processData: false,
            contentType: 'application/json'
        }).then(function (result) {
            var data = metadataToColumnDef(result.data);
            onComplete && onComplete(data)
        }, function (error) {
            console.log(error);
        });
    }

    function getData(onComplete) {
        //var url = 'http://localhost:3000/api/data';
        var url = '/api/data';
        $http({
            method: "GET",
            url: url,
            processData: false,
            contentType: 'application/json'
        }).then(function (result) {
            var data = result.data;
            onComplete && onComplete(data)
        }, function (error) {
            console.log(error);
        });
    }

    this.title = 'Datalift is awesome';
    this.metadata = [];
    this.gridOptions = gridOptions;

    this.doRefresh = function () {
        var api = this.gridOptions.api;
        var self = this;
        getMetaData(function (columns) {
            //alert(JSON.stringify(data, undefined, 3));
            self.metadata = columns;

            api.setColumnDefs(columns);
            api.refreshView();
        })

        getData(function (data) {
            //alert(JSON.stringify(data, undefined, 3));

            api.setRowData(data);
            api.refreshView();
        })
    }
});