define(['angular', 'jquery', 'underscore','showdown'], function(angular, $, _,Showdown) {
    'use strict';

    var module = angular.module('kibana.filters');

    module.filter('stringSort', function() {
        return function(input) {
            return input.sort();
        };
    });

    // resolves DE2854
    module.filter('removeEncoding', function() {
        return function(text) {
            return _.isString(text)
                ? text
                .replace(/(%20|%C2%A0|%22)/g, ' ')
                .replace(/%EF%BF%BD/g, '�')
                .replace(/%EF%BF%BD%EF%BF%BD/g, '��')
                .replace(/%3F/g, '?')
                .replace(/%2C/g, ',')
                .replace(/%2E/g, '.')
                .replace(/%2F/g, '/')
                .replace(/%2F%2F/g, '//')
                .replace(/%26/g, '&')
                : text;
        };
    });

    // resolves US9586
    module.filter('expandAcronym', function() {
        return function(text) {
            return _.isString(text) ?
                text.replace(/GSS/g, "Government-wide Strategic Solutions")
                : text;
        };
    });

    module.filter('nanFilter', function() {
        return function(number) {
            return isNaN(number) ?
                number.toString().replace(/NaN/, '')
                : number;
        };
    });

    // Convert scientific notation for integer manufacturer numbers
    module.filter('mfrNumber', function() {
        return function(mfr) {
            if (typeof(mfr) == "undefined") {
                return String('');
            } else if (typeof(mfr) !== "number") {
                return String(mfr);
            } else if (typeof(mfr) == "number") {
                function toFixed(mfr) {
                    if (Math.abs(mfr) < 1.0) {
                        var e = parseInt(mfr.toString().split('e-')[1]);
                        if (e) {
                            x *= Math.pow(10,e-1);
                            x = '0.' + (new Array(e)).join('0') + mfr.toString().substring(2);
                        }
                    } else {
                        var e = parseInt(mfr.toString().split('+')[1]);
                        if (e > 20) {
                            e -= 20;
                            x /= Math.pow(10,e);
                            x += (new Array(e+1)).join('0');
                        }
                    }
                    return mfr;
                }
            }
        };
    });


    module.filter('removeCommas', function() {
        return function(value) {
            return parseInt(value.replace(/,/g, ''));
        };
    });

    module.filter('pinnedQuery', function(querySrv) {
        return function(items, pinned) {
            var ret = _.filter(querySrv.ids,function(id){
                var v = querySrv.list[id];
                if(!_.isUndefined(v.pin) && v.pin === true && pinned === true) {
                    return true;
                }
                if((_.isUndefined(v.pin) || v.pin === false) && pinned === false) {
                    return true;
                }
            });
            return ret;
        };
    });

    module.filter('slice', function() {
        return function(arr, start, end) {
            if(!_.isUndefined(arr)) {
                return arr.slice(start, end);
            }
        };
    });

    module.filter('stringify', function() {
        return function(arr) {
            if(_.isObject(arr) && !_.isArray(arr)) {
                return angular.toJson(arr);
            } else {
                return arr.toString();
            }
        };
    });

    module.filter('noXml', function() {
        var noXml = function(text) {
            return _.isString(text)
                ? text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/'/g, '&#39;')
                .replace(/"/g, '&quot;')
                : text;
        };
        return function(text) {
            return _.isArray(text)
                ? _.map(text, noXml)
                : noXml(text);
        };
    });

    module.filter('urlLink', function() {
        var  //URLs starting with http://, https://, or ftp://
            r1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|*])/gim,
        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
            r2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim,
        //Change email addresses to mailto:: links.
            r3 = /([a-zA-Z_0-9\.]+?@[a-zA-Z_0-9\.]+)/gim;

        var urlLink = function(text) {
            var t1,t2,t3;
            if(!_.isString(text)) {
                return text;
            } else {
                _.each(text.match(r1), function() {
                    t1 = text.replace(r1, "<a href=\"$1\" target=\"_blank\">$1</a>");
                });
                text = t1 || text;
                _.each(text.match(r2), function() {
                    t2 = text.replace(r2, "$1<a href=\"http://$2\" target=\"_blank\">$2</a>");
                });
                text = t2 || text;
                _.each(text.match(r3), function() {
                    t3 = text.replace(r3, "<a href=\"mailto:$1\">$1</a>");
                });
                text = t3 || text;
                return text;
            }
        };

        return function(text) {
            return _.isArray(text)
                ? _.map(text, urlLink)
                : urlLink(text);
        };
    });

    module.filter('urlLinkAsIcon', function() {
        var  //URLs starting with http://, https://, or ftp://
            r1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|*])/gim,
        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
            r2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim,
        //Change email addresses to mailto:: links.
            r3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;

        var urlLink = function(text) {
            var t1,t2,t3;
            if(!_.isString(text)) {
                return text;
            } else {
                _.each(text.match(r1), function() {
                    t1 = text.replace(r1, '<a class="icon-search pointer" href="$1" target="_blank"></a>');
                });
                text = t1 || text;
                _.each(text.match(r2), function() {
                    t2 = text.replace(r2, '<a class="icon-search pointer" href="http://$2" target="_blank"></a>');
                });
                text = t2 || text;
                _.each(text.match(r3), function() {
                    t3 = text.replace(r3, '<a class="icon-search pointer" href="mailto:$1"></a>');
                });
                text = t3 || text;
                return text;
            }
        };

        return function(text) {
            return _.isArray(text)
                ? _.map(text, urlLink)
                : urlLink(text);
        };
    });

    module.filter('gistid', function() {
        var gist_pattern = /(\d{5,})|([a-z0-9]{10,})|(gist.github.com(\/*.*)\/[a-z0-9]{5,}\/*$)/;
        return function(input) {
            if(!(_.isUndefined(input))) {
                var output = input.match(gist_pattern);
                if(!_.isNull(output) && !_.isUndefined(output)) {
                    return output[0].replace(/.*\//, '');
                }
            }
        };
    });

    module.filter('capitalize', function() {
        return function(input) {
            if (input != null) {
                return input.substring(0,1).toUpperCase()+input.substring(1);
            }
        };
    });

    module.filter('newlines', function() {
        return function(input) {
            if (input) {
                return input.replace(/\n/g, '<br/>');
            }
        };
    });

    module.filter('striphtml', function() {
        return function(text) {
            if (text) {
                return text
                    .replace(/&/g, '&amp;')
                    .replace(/>/g, '&gt;')
                    .replace(/</g, '&lt;');
            }
        };
    });

    module.filter('markdown', function() {
        return function(text) {
            if (text) {
                var converter = new Showdown.converter();
                var textConverted = text.replace(/&/g, '&amp;')
                    .replace(/>/g, '&gt;')
                    .replace(/</g, '&lt;');
                return converter.makeHtml(textConverted);
            }
        };
    });

});