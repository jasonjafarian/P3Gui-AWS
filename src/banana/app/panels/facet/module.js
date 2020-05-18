/*

 ## Facet Panel

 ### Parameters
 * style :: hash of css properties
 * fields :: fields to be faceted on
 * facet limit :: number of values that will be show per field

 */
define([
        'angular',
        'app',
        'underscore',
        'kbn',
        'bootstrap',
    ],
    function(angular, app, _, kbn) {
        'use strict';

        var DEBUG = true;

        var module = angular.module('kibana.panels.facet',[]);
        app.useModule(module);

        module.controller('facet', function($rootScope, $scope, fields, querySrv, dashboard, filterSrv,$location) {
            $scope.panelMeta = {
                modals: [{
                    description: "Inspect",
                    icon: "icon-info-sign",
                    partial: "app/partials/inspector.html",
                    show: $scope.panel.spyable
                }],
                editorTabs: [{
                    title: 'Queries',
                    src: 'app/partials/querySelect.html'
                }],
                exportfile: false,
                status: "Experimental",
                description: "This panel provide facet functionality for any field in the data"
            };


            // Set and populate defaults
            var _d = {
                status: "Stable",
                queries: {
                    mode: 'all',
                    ids: [],
                    query: '*:*',
                    basic_query: '',
                    custom: ''
                },
                group: "default",
                style: {
                    'font-size': '9pt'
                },
                overflow: 'min-height',
                fields: [],
                field_list: true,
                spyable: true,
                facet_limit: 10,
                foundResults: true,
                header_title: "Limit Your Search",
                toggle_element: null,
                show_queries:true
            };
            _.defaults($scope.panel, _d);


            $scope.init = function() {
                $scope.Math = Math;
                // Solr
                $scope.sjs = $scope.sjs || sjsResource(dashboard.current.solr.server + dashboard.current.solr.core_name); // jshint ignore:line

                $scope.$on('refresh', function() {
                    $scope.get_data();
                });

                $scope.panel.exportSize = $scope.panel.size * $scope.panel.pages;

                $scope.fields = fields;
                var locUrl=$location.absUrl();
                var dsName=  $scope.getDataSource(locUrl);
                if(dsName!=null ){
                    console.log('DS Name'+dsName);
                    if(dsName=='army_chess'){
                        $scope.set_facet_filter('AWARD_VEHICLE','ARMY_CHESS');
                    }else if(dsName=='nitcp'){
                        $scope.set_facet_filter('AWARD_VEHICLE','NITCP');
                    }else if(dsName=='advantage'){
                        $scope.set_facet_filter('AWARD_VEHICLE','ADVANTAGE');
                    }else if(dsName=='os2'){
                        $scope.set_facet_filter('AWARD_VEHICLE','OS2');
                    }else if(dsName=='reverse_auction'){
                        $scope.set_facet_filter('AWARD_VEHICLE','ITS_RA');
                    }else if(dsName=='fssi_os3'){
                        $scope.set_facet_filter('AWARD_VEHICLE','FSSI OS3');
                    }else if(dsName=='fssi_mro'){
                        $scope.set_facet_filter('AWARD_VEHICLE','FSSI MRO');
                    }else if(dsName=='govt_acq_contracts'){
                        $scope.set_facet_filter('AWARD_VEHICLE','GovernmentWide Acquisition Contracts');
                    }else if(dsName=='fssi_jansan'){
                        $scope.set_facet_filter('AWARD_VEHICLE','FSSI JanSan');
                    }else if(dsName=='fssi_wireless'){
                        $scope.set_facet_filter('AWARD_VEHICLE','FSSI Wireless');
                    }else if(dsName=='print_management'){
                        $scope.set_facet_filter('AWARD_VEHICLE','Print Management');
                    }else if(dsName=='oasis'){
                        $scope.set_facet_filter('AWARD_VEHICLE','OASIS');
                    }else if(dsName=='transcom'){
                        $scope.set_facet_filter('AWARD_VEHICLE','TRANSCOM');
                    }else if(dsName=='fssi_dds3'){
                        $scope.set_facet_filter('AWARD_VEHICLE','FSSI_DDS3');
                    }else if(dsName=='dod_esi'){
                        $scope.set_facet_filter('AWARD_VEHICLE','DOD ESI');
                    }else if (dsName=='gss' ) {
                    	$scope.set_facet_filter('AWARD_VEHICLE','GSS');
                    }else if (dsName=='va' ) {
                    	$scope.set_facet_filter('AWARD_VEHICLE','Commodities Enterprise Contract');
                    }
                }
                // Data should not be fetched until after faceting conditionals
                $scope.get_data();
            };

            $scope.show_done_clicking = {'AWARD_VEHICLE':false};
            $scope.multi_select_fields={'AWARD_VEHICLE':true};
            $scope.multi_select = {'AWARD_VEHICLE':{}};
            $scope.multi_filter_ids={'AWARD_VEHICLE':{}};

            $scope.trueFlag_buttonClick = false;

            $scope.applyFilterButton = function(){
                $scope.trueFlag_buttonClick = true;
            }

            $scope.show_done_clicking_per_field = function(field) {
                var now_true = -2;
                for (var x in $scope.multi_select[field]) {
                    if ($scope.multi_select[field][x]=== true){
                        now_true +=1;
                        return true;
                    }
                }

                if($scope.trueFlag_buttonClick === true){
                    return true;
                }else if ($scope.last_time != now_true) {
                    return false;
                }
            };


            $scope.reset_show_done_button = function() {
                for (var f in $scope.multi_select_fields) {
                    $scope.show_done_clicking[f] = false;
                }
            };

            $scope.multi_select_check = function(field,value) {
                console.debug("Check value is currently: " + $scope.multi_filter_ids[field][value]);
                console.debug("Multi Select Check for FIELD:" + field +" VAL: " +value);
                $scope.show_done_clicking[field] = $scope.show_done_clicking_per_field(field);
                // Unchecking is implemented here
                if ($scope.multi_filter_ids[field][value] >= 0 &&
                    $scope.multi_filter_ids[field][value] !== -1) {
                    console.debug("Removing Filter ID " + $scope.multi_filter_ids[field][value]);
                    filterSrv.remove($scope.multi_filter_ids[field][value]);
                    $scope.multi_filter_ids[field][value] = -1;
                    return;
                }

                console.debug("Check value set to:" + $scope.multi_filter_ids[field][value]);
                $scope.multi_filter_ids[field][value] = filterSrv.set({
                    type: 'field',
                    field: field,
                    query: '"'+value+'"',
                    mandate: 'either'
                });
                console.debug("FilterID: "+  $scope.multi_filter_ids[field][value]);
                // force reset to preven check/uncheck mismatch
                /*if (filterSrv.ids.indexOf(filterid) !== undefined &&
                 filterSrv.ids.indexOf(filterid) !== -1) {
                 $scope.multi_filter_ids[field][value] = -1
                 }*/
            }

            $scope.compare_with_filterSrv = function(){
                for (var field in $scope.multi_filter_ids) {
                    for (var val in $scope.multi_filter_ids[field]) {
                        var filterid = $scope.multi_filter_ids[field][val];
                        console.debug("FilterID is now:" + filterSrv.ids.indexOf(filterid));
                        if (filterSrv.ids.indexOf(filterid) < 0) {
                            $scope.multi_filter_ids[field][val] = -1;
                            $scope.multi_select[field][val] = false;
                        }
                    }
                }
                if (window.location.href.indexOf('query=JnE9JnEub3A9QU5EJnEuYWx0PSomZGVmVHlwZT1lZGlzbWF4') > -1) {
                    $scope.trueFlag_buttonClick = false;
                }
            }

            $scope.percent = kbn.to_percent;

            $scope.getDataSource = function(locUrl) {
                if(locUrl==null) return;
                var idx=locUrl.indexOf('?');
                if(idx>0){
                    var queryParams = locUrl.substring(idx+ 1,locUrl.indexOf('#'));
                    console.log("Query Params"+queryParams);
                    if(queryParams!=null){
                        var datasourcevalue = queryParams.substring(queryParams.indexOf('=') + 1 );
                        console.log("Data Source"+datasourcevalue);
                        return datasourcevalue;
                    }
                }
            };


            $scope.add_facet_field = function(field) {
                if (_.contains(fields.list, field) && _.indexOf($scope.panel.fields, field) === -1) {
                    $scope.panel.fields.push(field);
                    $scope.get_data();
                }
            };

            $scope.remove_facet_field = function(field) {
                if (_.contains(fields.list, field) && _.indexOf($scope.panel.fields, field) > -1) {
                    $scope.panel.fields = _.without($scope.panel.fields, field);
                }
            };

            $scope.get_data = function(segment, query_id) {

                $scope.compare_with_filterSrv();

                $scope.panel.error = false;
                delete $scope.panel.error;
                // Make sure we have everything for the request to complete
                if (dashboard.indices.length === 0) {
                    return;
                }
                $scope.panelMeta.loading = true;
                $scope.panel.queries.ids = querySrv.idsByMode($scope.panel.queries);

                // What this segment is for? => to select which indices to query.
                var _segment = _.isUndefined(segment) ? 0 : segment;
                $scope.segment = _segment;

                $scope.sjs.client.server(dashboard.current.solr.server + dashboard.current.solr.core_name);

                var request = $scope.sjs.Request().indices(dashboard.indices[_segment]);
                var boolQuery = $scope.sjs.BoolQuery();
                _.each($scope.panel.queries.ids, function(id) {
                    boolQuery = boolQuery.should(querySrv.getEjsObj(id));
                });

                request = request.query(
                    $scope.sjs.FilteredQuery(
                        boolQuery,
                        filterSrv.getBoolFilter(filterSrv.ids) // search time range is provided here.
                    )).size($scope.panel.size * $scope.panel.pages); // Set the size of query result

                $scope.panel_request = request;

                var fq = '';
                if (filterSrv.getSolrFq() && filterSrv.getSolrFq() != '') {
                    fq = '&' + filterSrv.getSolrFq();
                }
                var wt_json = '&wt=json';
                var facet = '&facet=true';
                var facet_fields = '';
                for (var i = 0; i < $scope.panel.fields.length; i++) {
                    facet_fields += '&facet.field=' + $scope.panel.fields[i];
                }

                // Set the panel's query
                $scope.panel.queries.basic_query = querySrv.getORquery() + fq + facet + facet_fields;
                $scope.panel.queries.query = $scope.panel.queries.basic_query + wt_json;

                // Set the additional custom query
                if ($scope.panel.queries.custom != null) {
                    request = request.setQuery($scope.panel.queries.query + $scope.panel.queries.custom);
                } else {
                    request = request.setQuery($scope.panel.queries.query);
                }

                var results = request.doSearch();

                // Populate scope when we have results
                results.then(function(results) {
                    $scope.panelMeta.loading = false;
                    $scope.panel.offset = 0;
                    $scope.reset_show_done_button();
                    if (_segment === 0) {
                        $scope.hits = 0;
                        $scope.data = [];
                        query_id = $scope.query_id = new Date().getTime();
                    } else {
                        // Fix BUG with wrong total event count.
                        $scope.data = [];
                    }

                    // Check for error and abort if found
                    if (!(_.isUndefined(results.error))) {
                        $scope.panel.error = $scope.parse_error(results.error.msg); // There's also results.error.code
                        return;
                    }

                    // Check that we're still on the same query, if not stop
                    if ($scope.query_id === query_id) {
                        $scope.data = $scope.data.concat(_.map(results.response.docs, function(hit) {
                            var _h = _.clone(hit);
                            _h.kibana = {
                                _source: kbn.flatten_json(hit),
                                highlight: kbn.flatten_json(hit.highlighting || {})
                            };

                            return _h;
                        }));

                        // Solr does not need to accumulate hits count because it can get total count
                        // from a single faceted query.
                        $scope.hits = results.response.numFound;
                        $scope.panel.foundResults = $scope.hits === 0 ? false : true;
                        if (results.highlighting) {
                            $scope.highlighting = results.highlighting;
                            $scope.highlightingKeys = Object.keys(results.highlighting);
                            if ($.isEmptyObject($scope.highlighting[$scope.highlightingKeys[0]])) { // jshint ignore:line
                                $scope.highlight_flag = false;
                            } else {
                                $scope.highlight_flag = true;
                            }
                        }
                        var facet_results = results.facet_counts.facet_fields;
                        var facet_data = {};
                        _.each($scope.panel.fields, function(field) {
                            facet_data[field] = [];
                            for (var i = 0; i < facet_results[field].length; i += 2) {
                                // the below print statement is only needed in test and develop environments
                                //disabling vendor names
                                /* if(window.location.host !== 'p3.cap.gsa.gov') {
                                 console.log("Vendor names: " + facet_results[field][i]);
                                 }*/
                                facet_data[field].push({
                                    value: facet_results[field][i],
                                    count: facet_results[field][i + 1]
                                });
                            }
                        });
                        $scope.facet_data = facet_data;
                    } else {
                        return;
                    }

                    // If we're not sorting in reverse chrono order, query every index for
                    // size*pages results
                    // Otherwise, only get size*pages results then stop querying
                    if ($scope.panel.sortable && ($scope.data.length < $scope.panel.size * $scope.panel.pages || !((_.contains(filterSrv.timeField(), $scope.panel.sort[0])) && $scope.panel.sort[1] === 'desc')) &&
                        _segment + 1 < dashboard.indices.length) {
                        $scope.get_data(_segment + 1, $scope.query_id);
                    }
                });
            };

            $scope.populate_modal = function(request) {
                $scope.inspector = angular.toJson(JSON.parse(request.toString()), true);
            };

            $scope.without_kibana = function(row) {
                var _c = _.clone(row);
                delete _c.kibana;
                return _c;
            };

            $scope.set_refresh = function(state) {
                $scope.refresh = state;
            };

            $scope.close_edit = function() {
                if ($scope.refresh) {
                    $scope.get_data();
                }
                $scope.refresh = false;
            };

            // Set term filter when click on the one of facet values
            $scope.set_facet_filter = function(field, value) {
                filterSrv.set({
                    type: 'terms',
                    field: field,
                    value: value
                });
                dashboard.refresh();
               	try {
			$scope.page.currentPage=1;
		} catch(err) { }
            };

            // return the length of the filters with specific field
            // that will be used to detect if the filter is present or not to show close icon beside the facet
            $scope.filter_close = function(field) {
                return filterSrv.idsByTypeAndField('terms', field).length > 0;
		try {
                	$scope.page.currentPage=1;
		} catch(err) { }
            };

            // call close filter when click in close icon
            $scope.delete_filter = function(type, field) {
                filterSrv.removeByTypeAndField(type, field);
                dashboard.refresh();

            };

            // TODO Refactor this jquery code
            // jquery code used to toggle the arrow from up to down when facet is opened
            // also it is used to highlight the header field in faceting
            $('.accordion').on('show hide', function(n) { // jshint ignore:line
                var field = $(n.target).siblings('.accordion-heading').find('.accordion-toggle').text().trim(); // jshint ignore:line
                console.log("Field name is: " + field);
//        if (field.indexOf("_") > -1) {
//           field = field.replace("_","").trim();
//        }
                if (n.type === 'show') {
                    $scope.panel.toggle_element = field;
                } else {
                    if ($scope.panel.toggle_element === field) {
                        $scope.panel.toggle_element = null;
                    }
                }
                $(n.target).siblings('.accordion-heading').find('.accordion-toggle i').toggleClass('icon-chevron-up icon-chevron-down');// jshint ignore:line
                $(n.target).siblings('.accordion-heading').toggleClass('bold');// jshint ignore:line
            });
        });
    });
