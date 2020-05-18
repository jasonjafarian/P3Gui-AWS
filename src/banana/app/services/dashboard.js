define([
  'angular',
  'jquery',
  'kbn',
  'underscore',
  'config',
  'moment',
  'modernizr',
  'filesaver'
],
function (angular, $, kbn, _, config, moment, Modernizr) {
  'use strict';

  var DEBUG = false; // DEBUG mode

  var module = angular.module('kibana.services');

  module.service('dashboard', function($routeParams, $http, $rootScope, $injector, $location,
    sjsResource, timer, kbnIndex, alertSrv
  ) {
    // A hash of defaults to use when loading a dashboard
    var _dash = {
      title: "",
      style: "dark",
      editable: true,
      failover: false,
      panel_hints: true,
      rows: [],
      services: {},
      loader: {
        dropdown_collections: false,
        save_gist: true,
        save_elasticsearch: true,
        save_local: true,
        save_default: true,
        save_temp: true,
        save_temp_ttl_enable: true,
        save_temp_ttl: '30d',
        load_gist: true,
        load_elasticsearch: true,
        load_elasticsearch_size: 10,
        load_local: true,
        hide: false
      },
      index: {
        interval: 'none', // this will always be none because we disable 'Index Settings' tab in dasheditor.html
        pattern: '_all',  // TODO: Remove it
        default: 'INDEX_MISSING'
      },
      solr: {
        server: config.solr,
        core_name: config.solr_core,
        core_list: [],
        global_params: ''
      }
    };

    var sjs = sjsResource(config.solr + config.solr_core);

    var gist_pattern = /(^\d{5,}$)|(^[a-z0-9]{10,}$)|(gist.github.com(\/*.*)\/[a-z0-9]{5,}\/*$)/;

    // Store a reference to this
    var self = this;
    var filterSrv,querySrv;

    this.current = _.clone(_dash);
    this.last = {};

    $rootScope.$on('$routeChangeSuccess',function(){
      // Clear the current dashboard to prevent reloading
      self.current = {};
      self.indices = [];
      route();
    });

    var route = function() {
      // Is there a dashboard type and id in the URL?
      if(!(_.isUndefined($routeParams.kbnType)) && !(_.isUndefined($routeParams.kbnId))) {
        var _type = $routeParams.kbnType;
        var _id = $routeParams.kbnId;

        switch(_type) {
        case ('elasticsearch'):
          self.elasticsearch_load('dashboard',_id);
          break;
        case ('solr'):
          self.elasticsearch_load('dashboard',_id);
          break;
        case ('temp'):
          self.elasticsearch_load('temp',_id);
          break;
        case ('file'):
          self.file_load(_id);
          break;
        case('script'):
          self.script_load(_id);
          break;
        default:
          self.file_load('default.json');
        }

      // No dashboard in the URL
      } else {
        // Check if browser supports localstorage, and if there's a dashboard
        if (Modernizr.localstorage &&
          !(_.isUndefined(window.localStorage['dashboard'])) &&
          window.localStorage['dashboard'] !== ''
        ) {
          var dashboard = JSON.parse(window.localStorage['dashboard']);
          self.dash_load(dashboard);
        // No? Ok, grab default.json, its all we have now
        } else {
          self.file_load('default.json');
        }
      }
    };

    // Since the dashboard is responsible for index computation, we can compute and assign the indices
    // here before telling the panels to refresh
    this.refresh = function() {
      // Retrieve Solr collections for the dashboard
      kbnIndex.collections(config.apollo_coll).then(function (p) {
        if (DEBUG) { console.debug('dashboard: kbnIndex.collections p = ',p); }
        if (p.length > 0) {
          self.current.solr.core_list = p;
        } else {
          // No collections returned from Solr
          // Display alert only if USE_ADMIN_CORES flag in config.js is true.
        // console.log("dashboard.js = " + config.USE_ADMIN_CORES)
          if (config.USE_ADMIN_CORES) {
            alertSrv.set('No collections','There were no collections returned from Solr.','info',5000);
          }
        }
      });

      if(self.current.index.interval !== 'none') {
        if(filterSrv.idsByType('time').length > 0) {
          var _range = filterSrv.timeRange('min');
          kbnIndex.indices(_range.from,_range.to,
            self.current.index.pattern,self.current.index.interval
          ).then(function (p) {
            if (DEBUG) { console.debug('dashboard: p = ',p); }

            if(p.length > 0) {
              self.indices = p;
            } else {
              // Option to not failover
              if(self.current.failover) {
                self.indices = [self.current.index.default];
              } else {
                // Do not issue refresh if no indices match. This should be removed when panels
                // properly understand when no indices are present
                alertSrv.set('No results','There were no results because no indices were found that match your'+
                  ' selected time span','info',5000);
                return false;
              }
            }

            $rootScope.$broadcast('refresh');
          });
        } else {
          if(self.current.failover) {
            self.indices = [self.current.index.default];
            $rootScope.$broadcast('refresh');
          } else {
            alertSrv.set("No time filter",
              'Timestamped indices are configured without a failover. Waiting for time filter.',
              'info',5000);
          }
        }
      } else {
        self.indices = [self.current.index.default];
        $rootScope.$broadcast('refresh');
      }

      if (DEBUG) { console.debug('dashboard: after refresh',self); }
    };

    var dash_defaults = function(dashboard) {
      _.defaults(dashboard,_dash);
      _.defaults(dashboard.index,_dash.index);
      _.defaults(dashboard.loader,_dash.loader);
      // Solr
      _.defaults(dashboard.collection,_dash.collection);
      return dashboard;
    };

    this.dash_load = function(dashboard) {
      // Cancel all timers
      timer.cancel_all();
      self.locationSearch = $location.search();
      // Make sure the dashboard being loaded has everything required
      dashboard = dash_defaults(dashboard);

      // If not using time based indices, use the default index
      if(dashboard.index.interval === 'none') {
        self.indices = [dashboard.index.default];
      }

      self.current = _.clone(dashboard);

      // Ok, now that we've setup the current dashboard, we can inject our services
      querySrv = $injector.get('querySrv');
      filterSrv = $injector.get('filterSrv');

      // Make sure these re-init
      querySrv.init();
      filterSrv.init();

      // If there's an index interval set and no existing time filter, send a refresh to set one
      if(dashboard.index.interval !== 'none' && filterSrv.idsByType('time').length === 0) {
        self.refresh();
      }

      if ( self.locationSearch.query) {
			var query = atob(decodeURIComponent(self.locationSearch.query));
			console.log(query);
			angular.forEach(query.split('&'), function (value) {
			  if (value) {
				  console.log(value);
				  if (value.startsWith('fq=')) {
					  value = decodeURIComponent(value);
					  var temp = value.replace('fq=','');
				          if (temp[0] === '(' && temp[temp.length-1] === ')') {
				          	  var temp = temp.slice(1, -1);
						  if (temp.indexOf(' OR ') > 0) {
						      var criterias = temp.split(' OR ');
						      console.log(criterias);
						  } else {
						    var criterias = [temp];
						  }
						  console.log(criterias);
						  criterias.forEach(function (x) {
						    var data = x.split(':');
						    console.log("Setting Either Filter for field: " + data[0]+ " value: " + data[1] );
						    filterSrv.set({
								  editing   : false,
								  type      : 'terms',
								  field     : data[0],
								  value     : data[1].replace(/\"/g,''),
								  mandate   : "either"
								}, undefined, true)
						  })
						} else {
						  var field = temp.split(':')[0];
						  var value = temp.split(':').slice(1).join(':');

						  console.log(field + "    :" + value);
						  if (value[0] === '[' && value.indexOf('TO') > 1) {
							//$timeout(function(){}, 500);
							//Range Match
							var temp = RegExp(/\[(.+) TO (.+)\]/).exec(value);
							if (isNaN(temp[1]) && isNaN(temp[2])) {
								//Date Range, type should be time
								var current_time_filter = filterSrv.getTimeField();
								filterSrv.removeByTypeAndField('time', current_time_filter);
								  var res = filterSrv.set({
								  editing   : false,
								  type      : "time",
								  field		: field,
								  from      : temp[1],
								  to        : temp[2],
								}, undefined, true);
							} else {
								//Int Range, type should if range
								  var res = filterSrv.set({
								  editing   : false,
								  type      : "range",
								  field		: field,
								  from      : temp[1],
								  to        : temp[2],
								}, undefined, true);
							}
						  } else {
							//Regular FQ
							var res = filterSrv.set({
								  editing   : false,
								  type      : 'terms',
								  field		: field,
								  value     : value.replace(/\"/g,''),
								}, undefined, true);
							console.log(res);
						  }
					  }
				  } else if (value.startsWith('q=')) {
					  //Query Serv
					  console.log("Parsing Q String");
					  console.log(value);
					  value = value.replace('q=','');
					  var qs = value.split(/\sOR\s/g);

					  angular.forEach(querySrv.list, function(item) {
						console.log(item);
						item.query = decodeURIComponent(qs.pop());
					  });

					  if (qs.length>0) {
						   angular.forEach(qs, function(q) {
							 var id = querySrv.set({});
							 querySrv.list[id].query =  decodeURIComponent(q);
						  });
						 console.log(querySrv.list);
					  }
				  }
			  }
        });
	  }



      return true;
    };

    this.gist_id = function(string) {
      if(self.is_gist(string)) {
        return string.match(gist_pattern)[0].replace(/.*\//, '');
      }
    };

    this.is_gist = function(string) {
      if(!_.isUndefined(string) && string !== '' && !_.isNull(string.match(gist_pattern))) {
        return string.match(gist_pattern).length > 0 ? true : false;
      } else {
        return false;
      }
    };

    this.to_file = function() {
      var blob = new Blob([angular.toJson(self.current,true)], {type: "text/json;charset=utf-8"});
      // from filesaver.js
      window.saveAs(blob, self.current.title+"-"+new Date().getTime());
      return true;
    };

    this.set_default = function(dashboard) {
      if (Modernizr.localstorage) {
        window.localStorage['dashboard'] = angular.toJson(dashboard || self.current);
        $location.path('/dashboard');
        return true;
      } else {
        return false;
      }
    };

    this.purge_default = function() {
      if (Modernizr.localstorage) {
        window.localStorage['dashboard'] = '';
        return true;
      } else {
        return false;
      }
    };

    // TOFIX: Pretty sure this breaks when you're on a saved dashboard already
    this.share_link = function(title,type,id) {
      return {
        location  : window.location.href.replace(window.location.hash,""),
        type      : type,
        id        : id,
        link      : window.location.href.replace(window.location.hash,"")+"#dashboard/"+type+"/"+id,
        title     : title
      };
    };

    var renderTemplate = function(json,params) {
      var _r;
      _.templateSettings = {interpolate : /\{\{(.+?)\}\}/g};
      var template = _.template(json);
      var rendered = template({ARGS:params});
      try {
        _r = angular.fromJson(rendered);
      } catch(e) {
        _r = false;
      }
      return _r;
    };

    this.file_load = function(file) {
      return $http({
        url: "app/dashboards/"+file+'?' + new Date().getTime(),
        method: "GET",
        transformResponse: function(response) {
          return renderTemplate(response,$routeParams);
        }
      }).then(function(result) {
        if(!result) {
          return false;
        }
        self.dash_load(dash_defaults(result.data));
        return true;
      },function() {
        alertSrv.set('Error',"Could not load <i>dashboards/"+file+"</i>. Please make sure it exists" ,'error');
        return false;
      });
    };

    this.create_system_collection = function(){
        //console.log("Creating system collection: " + config.banana_index);
        $http({
          url: "/" + config.banana_index,
          method: "PUT",
          data:{

          }
          //TODO: handle params
      }).error(function(data, status){
            console.log("Error creating system collection");
            console.log(status); //check to see if the collection exists or some other error
            console.log(data);
          //if it exists, that is fine
      }).success(function(data){
            //console.log("Success creating collection");
          //console.log(data);
      });
    };

    this.elasticsearch_load = function(type,id) {
      return $http({
        url: config.solr + config.banana_index + '/select?wt=json&q=banana_title_s:"' + id + '"',
        method: "GET",
        transformResponse: function(response) {
          response = angular.fromJson(response);
          var source_json = angular.fromJson(response.response.docs[0]['banana_dashboard_s']);

          if (DEBUG) { console.debug('dashboard: type=',type,' id=',id,' response=',response,' source_json=',source_json); }

          // return renderTemplate(angular.fromJson(response)._source.dashboard, $routeParams);
          // return renderTemplate(JSON.stringify(source_json.dashboard), $routeParams);
          return renderTemplate(JSON.stringify(source_json), $routeParams);
        }
      }).error(function(data, status) {
        if(status === 0) {
          alertSrv.set('Error',"Could not contact Solr at "+config.solr+
            ". Please ensure that Solr is reachable from your system." ,'error');
        } else {
          alertSrv.set('Error','Could not find dashboard named "'+id+'". Please ensure that the dashboard name is correct or exists in the system.','error');
        }
        return false;
      }).success(function(data) {
        self.dash_load(data);
      });
    };

    this.script_load = function(file) {
      return $http({
        url: "app/dashboards/"+file,
        method: "GET",
        transformResponse: function(response) {
          /*jshint -W054 */
          var _f = new Function('ARGS','kbn','_','moment','window','document','angular','require','define','$','jQuery',response);
          return _f($routeParams,kbn,_,moment);
        }
      }).then(function(result) {
        if(!result) {
          return false;
        }
        self.dash_load(dash_defaults(result.data));
        return true;
      },function() {
        alertSrv.set('Error',
          "Could not load <i>scripts/"+file+"</i>. Please make sure it exists and returns a valid dashboard" ,
          'error');
        return false;
      });
    };

    this.elasticsearch_save = function(type,title,ttl) {
      // Clone object so we can modify it without influencing the existing obejct
      var save = _.clone(self.current);
      var id;

      // Change title on object clone
      if (type === 'dashboard') {
        id = save.title = _.isUndefined(title) ? self.current.title : title;
      }

      // Create request with id as title. Rethink this.
      // Use id instead of _id, because it is the default field of Solr schema-less.
      var request = sjs.Document(config.banana_index,type,id).source({
        // _id: id,
        id: id,
        banana_user_s: 'guest',
        banana_group_s: 'guest',
        banana_title_s: save.title,
        banana_dashboard_s: angular.toJson(save)
      });

      request = type === 'temp' && ttl ? request.ttl(ttl) : request;

      // Solr: set sjs.client.server to use 'banana-int' for saving dashboard
      sjs.client.server(config.solr + config.banana_index);

      return request.doIndex(
        // Success
        function(result) {
          if(type === 'dashboard') {
            // TODO
            $location.path('/dashboard/solr/'+title);
          }
          return result;
        },
        // Failure
        function() {
          return false;
        }
      );
    };

    this.elasticsearch_delete = function(id) {
      // Set sjs.client.server to use 'banana-int' for deleting dashboard
      sjs.client.server(config.solr + config.banana_index);

      return sjs.Document(config.banana_index,'dashboard',id).doDelete(
        // Success
        function(result) {
          return result;
        },
        // Failure
        function() {
          return false;
        }
      );
    };

    this.elasticsearch_list = function(query,count) {
      // set indices and type
      var solrserver = self.current.solr.server + config.banana_index || config.solr + config.banana_index;
      sjs.client.server(solrserver);

      var request = sjs.Request().indices(config.banana_index).types('dashboard');

      // Need to set sjs.client.server back to use 'logstash_logs' collection
      // But cannot do it here, it will interrupt other modules.
      // sjs.client.server(config.solr);

      return request.query(
        sjs.QueryStringQuery(query || '*:*')
        ).size(count).doSearch(
          // Success
          function(result) {
            return result;
          },
          // Failure
          function() {
            return false;
          }
        );

    };

    this.save_gist = function(title,dashboard) {
      var save = _.clone(dashboard || self.current);
      save.title = title || self.current.title;
      return $http({
        url: "https://api.github.com/gists",
        method: "POST",
        data: {
          "description": save.title,
          "public": false,
          "files": {
            "kibana-dashboard.json": {
              "content": angular.toJson(save,true)
            }
          }
        }
      }).then(function(data) {
        return data.data.html_url;
      }, function() {
        return false;
      });
    };

    this.gist_list = function(id) {
      return $http.jsonp("https://api.github.com/gists/"+id+"?callback=JSON_CALLBACK"
      ).then(function(response) {
        var files = [];
        _.each(response.data.data.files,function(v) {
          try {
            var file = JSON.parse(v.content);
            files.push(file);
          } catch(e) {
            return false;
          }
        });
        return files;
      }, function() {
        return false;
      });
    };

    this.numberWithCommas = function(x) {
      if (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      } else {
        return x;
      }
    };

    this.ceilValue = function(x) {
          return Math.ceil(x);
     };

  });

});