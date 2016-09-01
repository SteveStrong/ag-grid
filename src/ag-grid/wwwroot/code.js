agGrid.initialiseAgGridWithAngular1(angular);



var module = angular.module("example", ["agGrid"]);



module.controller("exampleCtrl", function ($scope, $http) {







    $scope.title = 'Datalift is awesome';

    $scope.gridOptions = {

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





    function serviceUrl() {

        var url = "/API/data";

        url += "?skip=" + skip;

        url += "&take=" + take;

        return url;

    }



    function renderGrid(data, fields) {



        var columnDefs = [

            { headerName: "Show", field: "show_date" },

            { headerName: "Year", field: "year" },

            { headerName: "Guest", field: "guest_name" },

            { headerName: "Occupation", field: "google_occupation" },

            { headerName: "Category", field: "category" }

        ];





        function onModelUpdated() {

            var model = $scope.gridOptions.api.getModel();

            var totalRows = $scope.gridOptions.rowData.length;

            var processedRows = model.getRowCount();

            $scope.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();

        }





        $scope.gridOptions.columnDefs = columnDefs;

        $scope.gridOptions.rowData = data || [];



        // get the grid to refresh

        $scope.gridOptions.columnApi.sizeColumnsToFit();

        $scope.gridOptions.api.refreshView();

    }



    function toMetaData(data) {

        var json = data;

        var filter = {};



        for (var key in json) {

            var item = data[key];

            var meta = {

                name: key,

                type: item && item.dataType,

                title: item && item.label || key,

                data: item

            }



            metaData.push(meta);

            var facet = item && item.facet;

            if (facet && !facet.isUnique) {

                var stats = facet.stats;

                filter[stats.field] = stats.mostFrequentValue;

            }

        }

        return metaData;

    }





    function getMetaData(onComplete) {

        $http({

            method: "GET",

            url: "/API/metadata",

            processData: false,

            contentType: 'application/json'

        }).then(function (result) {

            var data = result.data;

            toMetaData(data);

            //renderGrid([], metaData);

            onComplete && onComplete()

        }, function (error) {

            console.log(error);

        });

    }



    function getData(onComplete) {

        $http({

            method: "GET",

            url: serviceUrl(),

            processData: false,

            contentType: 'application/json'

        }).then(function (result) {

            var data = result.data;

            renderGrid(data, metaData);

            onComplete && onComplete()

        }, function (error) {

            console.log(error);

        });

    }



    //getMetaData();

    //getMetaData(getData)



    $scope.safeApply = function (fn) {

        var phase = this.$root.$$phase;

        if (phase == '$apply' || phase == '$digest') {

            if (fn && (typeof (fn) === 'function')) {

                fn();

            }

        } else {

            this.$apply(fn);

        }

    };



    $scope.getMetaData = function () {

        setTimeout(function () {

            getMetaData(getData(function () {

                $scope.safeApply();

            }))

        }, 100);

    };





});
