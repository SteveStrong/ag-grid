agGrid.initialiseAgGridWithAngular1(angular);

var module = angular.module("app", ["agGrid"]);

module.directive('stopEvent', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if(attr && attr.stopEvent)
                element.bind(attr.stopEvent, function (e) {
                    e.stopPropagation();
                });
        }
    };
});

module.controller("gridCtrl", function ($http) {

    //docker run -d -p 3000:3000 -p 8080:8080 datalift/starbucks.datalift

    var skip = 0;
    var take = 300;

    var gridOptions = {
        columnDefs: [],
        rowData: [],

        rowSelection: 'multiple',
        //rowModelType: 'pagination',
        enableColResize: true,
        enableSorting: true,
        enableFilter: true,
        groupHeaders: true,
        //paginationPageSize: 50,
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
                parent: columnDefs,
                field: key,
                type: item && item.dataType,
                title: item && item.label || key,
                headerName: item && item.label || key,
                showDetails: false,
                toggleDetails: function () {
                    var currentValue = this.showDetails;
                    this.parent.forEach(function (item) {
                        item.showDetails = false;
                    });
                    this.showDetails = !currentValue;
                },
                data: item,
                frequentItemsList: [],
                filterDescription: function() {
                    var found = this.selectedValue();
                    if (!found) return;

                    var filter = {};
                    filter[this.field] = found;
                    return filter;
                },
                selectedValue: function () {
                    var found = this.frequentItemsList.filter(function (item) {
                        return item.isSelected;
                    });
                    var value = found && found[0];
                    return value ? value.name : undefined;
                },
                hasSelectedItem: function () {
                    var found = this.selectedValue();
                    return found;
                },
                clearFilter: function () {
                    this.frequentItemsList.forEach(function (item) {
                        item.isSelected = false;
                    });
                }
            }
            for (var freqKey in item.facet.frequentValues) {
                var freqItem = {
                    parent: columnDef.frequentItemsList,
                    name: freqKey,
                    value: item.facet.frequentValues[freqKey],
                    isSelected: false,
                    toggleIsSelected: function () {
                        var currentValue = this.isSelected;
                        this.parent.forEach(function (item) {
                            item.isSelected = false;
                        });
                        this.isSelected = !currentValue;
                    }
                }
                columnDef.frequentItemsList.push(freqItem);
            }

            columnDef.frequentItemsList = columnDef.frequentItemsList.sort(function (a, b) {
                var x = a.name.toLowerCase(), y = b.name.toLowerCase();
                return x < y ? -1 : x > y ? 1 : 0;
            })
       
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
    this.totalRecords = 0;
    this.foundRecords = 0;
    this.gridOptions = gridOptions;

    this.computeFilter = function () {
        var filter = {};
        this.metadata.forEach(function (item) {
            var description = item.filterDescription(item);
            if (description) {
                for (var key in description) {
                    filter[key] = description[key];
                }
            }
        })
        return filter;
    }
    this.currentFilter = function () {
        var result = this.computeFilter();
        return JSON.stringify(result);
    }

    this.doToggleShowDetails = function (item) {
        item && item.toggleDetails();
    }

    this.doRemoveItem = function (item) {
        item && item.clearFilter();
    }

    this.doToggleIsSelected = function (item) {
        item && item.toggleIsSelected();
    }

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
            self.totalRecords = data.length;
            self.foundRecords = self.totalRecords;
            api.setRowData(data);
            api.refreshView();
        })
    }


});