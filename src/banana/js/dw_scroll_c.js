/*
 Scrolling Divs code from Dynamic Web Coding at dyn-web.com
 Copyright 2001-2012 by Sharon Paine
 See Terms of Use at www.dyn-web.com/business/terms.php
 This notice must be retained in the code as is!

 For demos, documentation and updates, visit http://www.dyn-web.com/code/scroll/
 version date: Feb 2012
 */

/*
 Resources:
 detecting if touch device: http://modernizr.github.com/Modernizr/touch.html
 mousewheel code: http://adomas.org/javascript-mouse-wheel/
 switchKeyEvents (keypress/keydown): http://www.quirksmode.org/js/dragdrop.html
 addEvent for custom scroll events: Mark Wubben (see http://simonwillison.net/2004/May/26/addLoadEvent/)
 dw_Util.getCurrentStyle: jquery and dean edwards (http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291)
 */

// arguments: id of scroll area div, id of content div
// don't need horizId. (keeping for updaters)
function dw_scrollObj(wnId, lyrId, horizId) {
    this.id = wnId;
    dw_scrollObj.col[this.id] = this;
    dw_scrollObj.ids[dw_scrollObj.ids.length] = this.id;
    this.load(lyrId, horizId);
    dw_scrollObj.setupMouseWheel(wnId);
    dw_scrollObj.setupDrag(wnId, lyrId);
    dw_scrollObj.setupKeyboardScroll(wnId);

    // for tabbing among elements inside scroll area (div onscroll event)
    // 3rd arg to .handleOnScroll is duration (200 when user tabs, 0 onload)
    dw_Event.add(document.getElementById(wnId), 'scroll', function(e) {
        dw_scrollObj.handleOnScroll(e, wnId, 200);
    });
    // invoke here in case onscroll triggered before page loaded (e.g., link clicked with target in scroll area)
    dw_scrollObj.handleOnScroll(null, wnId, 0);
};

dw_scrollObj.scrollOnMousewheel = true;
dw_scrollObj.enableKeyboardScroll = true;
// if want to support drag only for touch devices set false here
dw_scrollObj.scrollOnDrag = false; // default is false - flag applies only if not touch device

dw_scrollObj.defaultSpeed = dw_scrollObj.prototype.speed = 100; // default for mouseover or mousedown scrolling
dw_scrollObj.defaultSlideDur = dw_scrollObj.prototype.slideDur = 500; // default duration of glide onclick

// different speeds for vertical and horizontal
dw_scrollObj.mousewheelSpeed = 20;
dw_scrollObj.mousewheelHorizSpeed = 60;

var dw_Event = {
    add: function(obj, etype, fp, cap) {
        cap = cap || false;
        if (obj.addEventListener) obj.addEventListener(etype, fp, cap);
        else if (obj.attachEvent) obj.attachEvent("on" + etype, fp);
    },
    remove: function(obj, etype, fp, cap) {
        cap = cap || false;
        if (obj.removeEventListener) obj.removeEventListener(etype, fp, cap);
        else if (obj.detachEvent) obj.detachEvent("on" + etype, fp);
    },
    DOMit: function(e) {
        e = e ? e : window.event;
        if (!e.target) e.target = e.srcElement;
        if (!e.preventDefault) e.preventDefault = function() {
            e.returnValue = false;
            return false;
        };
        if (!e.stopPropagation) e.stopPropagation = function() {
            e.cancelBubble = true;
        };
        return e;
    },
    getTarget: function(e) {
        e = dw_Event.DOMit(e);
        var tgt = e.target;
        if (tgt.nodeType != 1) tgt = tgt.parentNode;
        return tgt;
    }
};
var dw_Util;
if (!dw_Util) dw_Util = {};
dw_Util.inArray = function(val, ar) {
    for (var i = 0; ar[i]; i++) {
        if (ar[i] == val) {
            return true;
        }
    }
    return false;
};
dw_Util.addElement = function(tag, id, cls, atts) {
    var el = document.createElement(tag);
    if (id) {
        el.id = id;
    }
    if (cls) {
        el.className = cls;
    }
    for (var i in atts) {
        el.setAttribute(i, atts[i]);
    }
    return el;
};
dw_Util.isTouchDevice = function() {
    return 'ontouchend' in document;
};
dw_Util.getMouseWheelDelta = function(e) {
    var delta = 0;
    if (!e) e = window.event;
    if (e.wheelDelta) {
        delta = e.wheelDelta / 120;
    } else if (e.detail) {
        delta = -e.detail / 3;
    }
    return delta;
};
dw_Util.getOptBool = function(val) {
    val = (val === undefined) ? true : (typeof val == 'boolean') ? val : true;
    return val;
};
dw_Util.writeStyleSheet = function(file, bScreenOnly) {
    var css = '<link rel="stylesheet" type="text/css" href="' + file;
    var media = (dw_Util.getOptBool(bScreenOnly)) ? '" media="screen"' : '"';
    document.write(css + media + ' />');
};
dw_writeStyleSheet = dw_Util.writeStyleSheet;
dw_Util.addLinkCSS = function(file, bScreenOnly) {
    if (!document.createElement) return;
    var el = document.createElement("link");
    el.setAttribute("rel", "stylesheet");
    el.setAttribute("type", "text/css");
    if (dw_Util.getOptBool(bScreenOnly)) {
        el.setAttribute("media", "screen");
    }
    el.setAttribute("href", file);
    document.getElementsByTagName('head')[0].appendChild(el);
};
dw_Util.contained = function(oNode, oCont) {
    if (!oNode) return null;
    while ((oNode = oNode.parentNode))
        if (oNode == oCont) return true;
    return false;
};
dw_Util.getLayerOffsets = function(el, oCont) {
    var left = 0,
        top = 0;
    if (dw_Util.contained(el, oCont)) {
        do {
            left += el.offsetLeft;
            top += el.offsetTop;
        } while (((el = el.offsetParent) != oCont));
    }
    return {
        x: left,
        y: top
    };
};
dw_Util.get_DelimitedClassList = function(cls) {
    var ar = [],
        ctr = 0;
    if (cls.indexOf('_') != -1) {
        var whitespace = /\s+/;
        if (!whitespace.test(cls)) {
            ar[0] = cls;
        } else {
            var classes = cls.split(whitespace);
            for (var i = 0; classes[i]; i++) {
                if (classes[i].indexOf('_') != -1) {
                    ar[ctr++] = classes[i];
                }
            }
        }
    }
    return ar;
};
dw_Util.getValueFromQueryString = function(name, obj) {
    obj = obj ? obj : window.location;
    if (obj.search && obj.search.indexOf(name != -1)) {
        var pairs = obj.search.slice(1).split("&");
        var set;
        for (var i = 0; pairs[i]; i++) {
            set = pairs[i].split("=");
            if (set[0] == name && set[1]) {
                return set[1];
            }
        }
    }
    return '';
};
dw_Util.getCurrentStyle = function(el, prop) {
    var val = '';
    if (document.defaultView && document.defaultView.getComputedStyle) {
        val = document.defaultView.getComputedStyle(el, null)[prop];
    } else if (el.currentStyle) {
        val = el.currentStyle[prop];
        if (!/^\d+(px)?$/i.test(val) && /^\d/.test(val)) {
            var style = el.style.left;
            var runtimeStyle = el.runtimeStyle.left;
            el.runtimeStyle.left = el.currentStyle.left;
            el.style.left = val || 0;
            val = el.style.pixelLeft + "px";
            el.style.left = style;
            el.runtimeStyle.left = runtimeStyle;
        }
    }
    return val;
};
dw_scrollObj.isSupported = function() {
    return !!(document.getElementById && document.getElementsByTagName && document.createElement && document.createDocumentFragment && (document.addEventListener || document.attachEvent));
};
dw_scrollObj.col = {};
dw_scrollObj.ids = [];
dw_scrollObj.prototype.on_load = function() {};
dw_scrollObj.prototype.on_scroll = function() {};
dw_scrollObj.prototype.on_scroll_start = function() {};
dw_scrollObj.prototype.on_scroll_stop = function() {};
dw_scrollObj.prototype.on_scroll_end = function() {};
dw_scrollObj.prototype.on_update = function() {};
dw_scrollObj.prototype.load = function(lyrId, horizId) {
    var wndo, lyr;
    if (this.lyrId) {
        dw_scrollObj.unsetDrag(this.id, this.lyrId);
        lyr = document.getElementById(this.lyrId);
        lyr.style.visibility = "hidden";
    }
    this.lyr = lyr = document.getElementById(lyrId);
    this.lyr.style.position = 'absolute';
    this.lyrId = lyrId;
    this.horizId = horizId || null;
    wndo = document.getElementById(this.id);
    this.y = 0;
    this.x = 0;
    this.shiftTo(0, 0);
    this.getDims();
    dw_scrollObj.setupDrag(this.id, lyrId);
    lyr.style.visibility = "visible";
    this.ready = true;
    this.on_load();
};
dw_scrollObj.prototype.shiftTo = function(x, y) {
    if (this.lyr && !isNaN(x) && !isNaN(y)) {
        this.x = x;
        this.y = y;
        this.lyr.style.left = Math.round(x) + "px";
        this.lyr.style.top = Math.round(y) + "px";
    }
};
dw_scrollObj.prototype.getX = function() {
    return this.x;
};
dw_scrollObj.prototype.getY = function() {
    return this.y;
};
dw_scrollObj.prototype.getDims = function() {
    var wndo = document.getElementById(this.id);
    var lyr = document.getElementById(this.lyrId);
    this.lyrWd = this.horizId ? document.getElementById(this.horizId).offsetWidth : lyr.offsetWidth;
    this.lyrHt = lyr.offsetHeight;
    this.wnWd = wndo.offsetWidth;
    this.wnHt = wndo.offsetHeight;
    var w = this.lyrWd - this.wnWd;
    var h = this.lyrHt - this.wnHt;
    this.maxX = (w > 0) ? w : 0;
    this.maxY = (h > 0) ? h : 0;
};
dw_scrollObj.prototype.updateDims = function() {
    this.getDims();
    this.on_update();
};
dw_scrollObj.refreshAll = function() {
    var wndo;
    for (var i = dw_scrollObj.ids.length; i--;) {
        wndo = dw_scrollObj.col[dw_scrollObj.ids[i]];
        wndo.updateDims();
    }
};
dw_scrollObj.prototype.clearTimer = function() {
    clearInterval(this.timerId);
    this.timerId = 0;
};
dw_scrollObj.prototype.initScrollVals = function(deg, speed) {
    if (!this.ready) return;
    this.clearTimer();
    this.speed = speed || dw_scrollObj.defaultSpeed;
    this.fx = (deg == 0) ? -1 : (deg == 180) ? 1 : 0;
    this.fy = (deg == 90) ? 1 : (deg == 270) ? -1 : 0;
    this.endX = (deg == 90 || deg == 270) ? this.x : (deg == 0) ? -this.maxX : 0;
    this.endY = (deg == 0 || deg == 180) ? this.y : (deg == 90) ? 0 : -this.maxY;
    this.lyr = document.getElementById(this.lyrId);
    this.lastTime = new Date().getTime();
    this.on_scroll_start(this.x, this.y);
    var self = this;
    self.timerId = setInterval(function() {
        self.scroll();
    }, 10);
};
dw_scrollObj.prototype.scroll = function() {
    var now = new Date().getTime();
    var d = (now - this.lastTime) / 1000 * this.speed;
    if (d > 0) {
        var x = this.x + (this.fx * d);
        var y = this.y + (this.fy * d);
        if ((this.fx == -1 && x > -this.maxX) || (this.fx == 1 && x < 0) || (this.fy == -1 && y > -this.maxY) || (this.fy == 1 && y < 0)) {
            this.lastTime = now;
            this.shiftTo(x, y);
            this.on_scroll(x, y);
        } else {
            this.clearTimer();
            this.shiftTo(this.endX, this.endY);
            this.on_scroll(this.endX, this.endY);
            this.on_scroll_end(this.endX, this.endY);
        }
    }
};
dw_scrollObj.prototype.ceaseScroll = function() {
    if (!this.ready) return;
    this.clearTimer();
    this.on_scroll_stop(this.x, this.y);
};
dw_scrollObj.prototype.initScrollByVals = function(dx, dy, dur) {
    if (!this.ready || this.sliding) return;
    this.startX = this.x;
    this.startY = this.y;
    this.destX = this.destY = this.distX = this.distY = 0;
    if (dy < 0) {
        this.distY = (this.startY + dy >= -this.maxY) ? dy : -(this.startY + this.maxY);
    } else if (dy > 0) {
        this.distY = (this.startY + dy <= 0) ? dy : -this.startY;
    }
    if (dx < 0) {
        this.distX = (this.startX + dx >= -this.maxX) ? dx : -(this.startX + this.maxX);
    } else if (dx > 0) {
        this.distX = (this.startX + dx <= 0) ? dx : -this.startX;
    }
    this.destX = this.startX + this.distX;
    this.destY = this.startY + this.distY;
    this.glideScrollPrep(this.destX, this.destY, dur);
};
dw_scrollObj.prototype.initScrollToVals = function(destX, destY, dur) {
    if (!this.ready || this.sliding) return;
    this.startX = this.x;
    this.startY = this.y;
    this.destX = -Math.max(Math.min(destX, this.maxX), 0);
    this.destY = -Math.max(Math.min(destY, this.maxY), 0);
    this.distY = this.destY - this.startY;
    this.distX = this.destX - this.startX;
    if (dur == 0) {
        this.on_scroll_start(this.startX, this.startY);
        this._jumpTo(this.destX, this.destY);
    } else {
        this.glideScrollPrep(this.destX, this.destY, dur);
    }
};
dw_scrollObj.prototype._jumpTo = function(x, y) {
    this.shiftTo(x, y);
    this.on_scroll(x, y);
};
dw_scrollObj.prototype.glideScrollPrep = function(destX, destY, dur) {
    this.slideDur = (typeof dur == 'number') ? dur : dw_scrollObj.defaultSlideDur;
    this.per = Math.PI / (2 * this.slideDur);
    this.sliding = true;
    this.lyr = document.getElementById(this.lyrId);
    this.startTime = new Date().getTime();
    var self = this;
    self.timerId = setInterval(function() {
        self.doGlideScroll();
    }, 10);
    this.on_scroll_start(this.startX, this.startY);
};
dw_scrollObj.prototype.doGlideScroll = function() {
    var elapsed = new Date().getTime() - this.startTime;
    if (elapsed < this.slideDur) {
        var x = this.startX + (this.distX * Math.sin(this.per * elapsed));
        var y = this.startY + (this.distY * Math.sin(this.per * elapsed));
        this.shiftTo(x, y);
        this.on_scroll(x, y);
    } else {
        this.clearTimer();
        this.sliding = false;
        this.shiftTo(this.destX, this.destY);
        this.on_scroll(this.destX, this.destY);
        this.on_scroll_stop(this.destX, this.destY);
        if (this.distX && (this.destX == 0 || this.destX == -this.maxX) || this.distY && (this.destY == 0 || this.destY == -this.maxY)) {
            this.on_scroll_end(this.destX, this.destY);
        }
    }
};
dw_scrollObj.doOnMouseWheel = function(e) {
    if (!e) e = window.event;
    var delta = dw_Util.getMouseWheelDelta(e);
    if (dw_Util.isTouchDevice()) {
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;
        return false;
    }
    if (!delta) {
        return;
    };
    var wndo = dw_scrollObj.col[this.id];
    if (wndo.maxY > 0 || wndo.maxX > 0) {
        var x = wndo.x,
            y = wndo.y,
            nx, ny, nd;
        if (wndo.maxY > 0) {
            nd = dw_scrollObj.mousewheelSpeed * delta;
            ny = nd + y;
            nx = x;
            ny = Math.min(Math.max(-wndo.maxY, ny), 0);
        } else {
            nd = dw_scrollObj.mousewheelHorizSpeed * delta;
            nx = nd + x;
            ny = y;
            nx = Math.min(Math.max(-wndo.maxX, nx), 0);
        }
        wndo.on_scroll_start(x, y);
        wndo.shiftTo(nx, ny);
        wndo.on_scroll(nx, ny);
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;
    }
};
dw_scrollObj.setupMouseWheel = function(wnId) {
    if (!dw_scrollObj.scrollOnMousewheel) {
        return;
    };
    var wn = document.getElementById(wnId);
    if (wn.addEventListener) {
        wn.addEventListener('DOMMouseScroll', dw_scrollObj.doOnMouseWheel, false);
    }
    wn.onmousewheel = dw_scrollObj.doOnMouseWheel;
};
dw_scrollObj.setupDrag = function(wnId, lyrId) {
    var wn = document.getElementById(wnId);
    var lyr = document.getElementById(lyrId);
    if (dw_Util.isTouchDevice()) {
        dw_Event.add(lyr, 'touchstart', function(e) {
            dw_scrollObj.prepDrag(e, wnId);
        });
        dw_Event.add(lyr, 'gesturestart', function(e) {
            dw_scrollObj.gestureFlag = true;
        });
        dw_Event.add(lyr, 'gestureend', function(e) {
            dw_scrollObj.gestureFlag = false;
        });
    } else if (dw_scrollObj.scrollOnDrag) {
        dw_Event.add(lyr, 'mousedown', function(e) {
            dw_scrollObj.prepDrag(e, wnId);
        });
    }
};
dw_scrollObj.unsetDrag = function(wnId, lyrId) {
    var wn = document.getElementById(wnId);
    var lyr = document.getElementById(lyrId);
    if (dw_Util.isTouchDevice()) {
        dw_Event.remove(lyr, 'touchstart', function(e) {
            dw_scrollObj.prepDrag(e, wnId);
        });
        dw_Event.remove(lyr, 'gesturestart', function(e) {
            dw_scrollObj.gestureFlag = true;
        });
        dw_Event.remove(lyr, 'gestureend', function(e) {
            dw_scrollObj.gestureFlag = false;
        });
    } else if (dw_scrollObj.scrollOnDrag) {
        dw_Event.remove(lyr, 'mousedown', function(e) {
            dw_scrollObj.prepDrag(e, wnId);
        });
    }
};
dw_scrollObj.prepDrag = function(e, wnId) {
    var _this = dw_scrollObj.col[wnId];
    dw_scrollObj.current = _this;
    var lyr = _this.lyr;
    e = dw_Event.DOMit(e);
    var isTouchDevice = dw_Util.isTouchDevice();
    var o = e.changedTouches ? e.changedTouches[0] : e;
    _this.downX = o.clientX;
    _this.downY = o.clientY;
    _this.startX = _this.x;
    _this.startY = _this.y;
    _this.maxdLeft = (_this.maxX == 0) ? true : (_this.startX == 0) ? true : (_this.startX == -_this.maxX) ? false : false;
    _this.maxdRight = (_this.maxX == 0) ? true : (_this.startX == 0) ? false : (_this.startX == -_this.maxX) ? true : false;
    _this.maxdUp = (_this.maxY == 0) ? true : (_this.startY == 0) ? true : (_this.startY == -_this.maxY) ? false : false;
    _this.maxdDown = (_this.maxY == 0) ? true : (_this.startY == 0) ? false : (_this.startY == -_this.maxY) ? true : false;
    dw_scrollObj.dragMaxChecked = false;
    _this.on_scroll_start(_this.startX, _this.startY);
    if (!isTouchDevice) {
        dw_Event.add(lyr, "mousemove", dw_scrollObj.doDrag, true);
        dw_Event.add(document, "mouseup", dw_scrollObj.endDrag, true);
        e.preventDefault();
        e.stopPropagation();
    } else if (e.touches.length == 1) {
        dw_Event.add(lyr, "touchmove", dw_scrollObj.doDrag, true);
        dw_Event.add(lyr, "touchend", dw_scrollObj.endDrag, true);
    }
};
dw_scrollObj.checkDragMaxd = function(x, y) {
    var _this = dw_scrollObj.current;
    var v = (y < 0) ? 'down' : (y > 0) ? 'up' : '';
    var h = (x < 0) ? 'right' : (x > 0) ? 'left' : '';
    if ((Math.abs(y) < 8) || (Math.abs(x) < 8)) {
        if (Math.abs(y) < Math.abs(x)) {
            v = '';
        } else {
            h = '';
        }
    }
    if ((!v || (v == 'down' && _this.maxdDown) || (v == 'up' && _this.maxdUp)) && (!h || (h == 'right' && _this.maxdRight) || (h == 'left' && _this.maxdLeft))) {
        var lyr = _this.lyr;
        dw_Event.remove(lyr, "touchmove", dw_scrollObj.doDrag, true);
        dw_Event.remove(lyr, "touchend", dw_scrollObj.endDrag, true);
        dw_Event.remove(lyr, "mousemove", dw_scrollObj.doDrag, true);
        dw_Event.remove(document, "mouseup", dw_scrollObj.endDrag, true);
        return true;
    }
    dw_scrollObj.dragMaxChecked = true;
    return false;
};
dw_scrollObj.doDrag = function(e) {
    if (!dw_scrollObj.current) return;
    if (dw_scrollObj.gestureFlag) {
        return true;
    }
    var _this = dw_scrollObj.current;
    e = dw_Event.DOMit(e);
    var o = e.changedTouches ? e.changedTouches[0] : e;
    var nx = _this.startX + o.clientX - _this.downX;
    var ny = _this.startY + o.clientY - _this.downY;
    if (!dw_scrollObj.dragMaxChecked && dw_scrollObj.checkDragMaxd(o.clientX - _this.downX, o.clientY - _this.downY)) {
        return;
    }
    nx = Math.min(Math.max(nx, -_this.maxX), 0);
    ny = Math.min(Math.max(ny, -_this.maxY), 0);
    _this.shiftTo(nx, ny);
    _this.on_scroll(nx, ny);
    e.preventDefault();
    e.stopPropagation();
};
dw_scrollObj.endDrag = function() {
    if (!dw_scrollObj.current) return;
    if (dw_scrollObj.gestureFlag) {
        return true;
    }
    var _this = dw_scrollObj.current;
    var lyr = _this.lyr;
    var isTouchDevice = dw_Util.isTouchDevice();
    if (!isTouchDevice) {
        dw_Event.remove(lyr, "mousemove", dw_scrollObj.doDrag, true);
        dw_Event.remove(document, "mouseup", dw_scrollObj.endDrag, true);
    } else {
        dw_Event.remove(lyr, "touchmove", dw_scrollObj.doDrag, true);
        dw_Event.remove(lyr, "touchend", dw_scrollObj.endDrag, true);
    }
    _this.on_scroll_stop(_this.x, _this.y);
    dw_scrollObj.current = null;
};
dw_scrollObj.setupKeyboardScroll = function(wnId) {
    if (!dw_scrollObj.enableKeyboardScroll || dw_Util.isTouchDevice()) {
        return;
    };
    var wn = document.getElementById(wnId);
    wn.tabIndex = 0;
    dw_Event.add(wn, 'keydown', dw_scrollObj.handleKeyboardScroll);
    dw_Event.add(wn, 'keypress', dw_scrollObj.switchKeyEvents);
    dw_Event.add(wn, 'keyup', dw_scrollObj.handleScrollKeyup);
};
dw_scrollObj.handleScrollKeyup = function(e) {
    var wndo;
    if (!(wndo = dw_scrollObj.findTargetScrollArea(e))) {
        return;
    };
    switch (e.keyCode) {
        case 37:
        case 38:
        case 39:
        case 40:
            wndo.ceaseScroll();
            e.preventDefault();
            break;
    }
};
dw_scrollObj.handleKeyboardScroll = function(e) {
    var wndo, fn, arg1, arg2;
    if (e.ctrlKey || e.altKey || !(wndo = dw_scrollObj.findTargetScrollArea(e))) {
        return;
    };
    switch (e.keyCode) {
        case 33:
            arg1 = (wndo.maxY) ? -wndo.getX() : -wndo.getX() - wndo.wnWd;
            arg2 = -wndo.getY() - wndo.wnHt;
            fn = 'initScrollToVals';
            break;
        case 34:
            arg1 = (wndo.maxY) ? -wndo.getX() : -wndo.getX() + wndo.wnWd;
            arg2 = -wndo.getY() + wndo.wnHt;
            fn = 'initScrollToVals';
            break;
        case 35:
            arg1 = wndo.maxX;
            arg2 = wndo.maxY;
            fn = 'initScrollToVals';
            break;
        case 36:
            arg1 = 0;
            arg2 = 0;
            fn = 'initScrollToVals';
            break;
        case 37:
            arg1 = 180;
            fn = 'initScrollVals';
            break;
        case 38:
            arg1 = 90;
            fn = 'initScrollVals';
            break;
        case 39:
            arg1 = 0;
            fn = 'initScrollVals';
            break;
        case 40:
            arg1 = 270;
            fn = 'initScrollVals';
            break;
    }
    if (fn) {
        wndo[fn](arg1, arg2);
        e.preventDefault();
    }
};
dw_scrollObj.switchKeyEvents = function() {
    var wn;
    for (var i = dw_scrollObj.ids.length; i--;) {
        wn = document.getElementById(dw_scrollObj.ids[i]);
        dw_Event.remove(wn, 'keydown', dw_scrollObj.handleKeyboardScroll);
        dw_Event.remove(wn, 'keypress', dw_scrollObj.switchKeyEvents);
        dw_Event.add(wn, 'keypress', dw_scrollObj.handleKeyboardScroll);
    }
};
dw_scrollObj.findTargetScrollArea = function(e) {
    var tgt = dw_Event.getTarget(e),
        wndo;
    var skipList = ['input', 'textarea', 'select'];
    if (dw_Util.inArray(tgt.tagName.toLowerCase(), skipList)) {
        return null;
    }
    do {
        if (tgt.id && (wndo = dw_scrollObj.col[tgt.id]) || (wndo = dw_scrollObj.getBarScrollArea(tgt.id))) {
            break;
        }
    } while ((tgt = tgt.parentNode));
    return wndo;
};
dw_scrollObj.getBarScrollArea = function(id) {
    var barId, barObj, trackId, wndo;
    for (var i = dw_Slidebar.ids.length; i--;) {
        barId = dw_Slidebar.ids[i];
        barObj = dw_Slidebar.col[barId];
        if (id == barId || id == barObj.trackId) {
            wndo = dw_scrollObj.col[barObj.wnId];
            break;
        }
    }
    return wndo;
};
dw_scrollObj.handleOnScroll = function(e, wnId, dur) {
    var x, y;
    var wn = document.getElementById(wnId);
    var wndo = dw_scrollObj.col[wnId];
    var scrollY = wn.scrollTop;
    var scrollX = wn.scrollLeft;
    if (scrollY == 0 && scrollX == 0 && wndo.onScrollFlag) {
        wndo.onScrollFlag = false;
        return;
    } else {
        x = -wndo.getX() + scrollX;
        y = -wndo.getY() + scrollY;
        wn.scrollTop = wn.scrollLeft = 0;
        wndo.initScrollToVals(x, y, dur);
        wndo.onScrollFlag = true;
    }
};
dw_scrollObj.checkForTarget = function(e) {
    var tgt, cur_href, cur, pg, tgt_href, pt, hash, el, wnId, ctr = 0,
        maxCnt = 3;
    tgt = dw_Event.getTarget(e);
    if (!tgt) return;
    cur_href = location.href;
    pt = cur_href.indexOf('#');
    cur = (pt != -1) ? cur_href.slice(0, pt) : cur_href;
    do {
        if (tgt.nodeName.toLowerCase() == 'a') {
            tgt_href = tgt.href;
            pt = tgt_href.indexOf('#');
            pg = (pt != -1) ? tgt_href.slice(0, pt) : tgt_href;
            if (tgt.hash && (cur == pg)) {
                hash = tgt.hash.slice(1);
                el = document.getElementById(hash);
                if (el && (wnId = dw_scrollObj.insideScrollArea(el))) {
                    dw_scrollObj.scrollToAnchor(wnId, hash);
                    e.preventDefault();
                    tgt.blur();
                }
            }
            break;
        }
        ctr++;
    } while (ctr < maxCnt && (tgt = tgt.parentNode));
};
dw_scrollObj.insideScrollArea = function(el) {
    var wnId, wn;
    for (var i = dw_scrollObj.ids.length; i--;) {
        wnId = dw_scrollObj.ids[i];
        wn = document.getElementById(wnId);
        if (dw_Util.contained(el, wn)) {
            return wnId;
        }
    }
    return null;
};
dw_scrollObj.scrollToAnchor = function(wnId, id, dur) {
    var wndo = dw_scrollObj.col[wnId];
    var el = document.getElementById(id);
    var lyr = document.getElementById(wndo.lyrId);
    if (dw_Util.contained(el, lyr)) {
        var pos = dw_Util.getLayerOffsets(el, lyr);
        wndo.initScrollToVals(pos.x, pos.y, dur);
    }
};
dw_scrollObj.scrollToId = function(wnId, id, lyrId, dur) {
    dw_scrollObj.scrollToAnchor(wnId, id, dur);
};
dw_Event.add(document, 'click', dw_scrollObj.checkForTarget);

function dw_Slidebar(barId, trackId, axis, x, y) {
    var bar = document.getElementById(barId);
    var track = document.getElementById(trackId);
    var isTouchDevice = dw_Util.isTouchDevice();
    this.barId = barId;
    this.trackId = trackId;
    this.axis = axis;
    dw_Slidebar.col[this.barId] = this;
    dw_Slidebar.ids[dw_Slidebar.ids.length] = this.barId;
    this.bar = bar;
    var lft = parseInt(dw_Util.getCurrentStyle(bar, 'left'));
    lft = !isNaN(lft) ? lft : 0;
    var tp = parseInt(dw_Util.getCurrentStyle(bar, 'top'));
    tp = !isNaN(tp) ? tp : 0;
    this.x = lft;
    this.y = tp;
    this.shiftTo(this.x, this.y);
    this.barWd = bar.offsetWidth;
    this.barHt = bar.offsetHeight;
    if (axis == 'v') {
        this.maxY = track.offsetHeight - this.barHt - this.y;
        this.minY = this.y;
        this.maxX = this.x;
        this.minX = this.x;
    } else {
        this.maxX = track.offsetWidth - this.barWd - this.x;
        this.minX = this.x;
        this.maxY = this.y;
        this.minY = this.y;
    }
    this.on_drag_start = this.on_drag = this.on_drag_end = this.on_slide_start = this.on_slide = this.on_slide_end = function() {};
    if (!isTouchDevice) {
        dw_Event.add(bar, 'mousedown', function(e) {
            dw_Slidebar.prepDrag(e, barId);
        });
    } else {
        dw_Event.add(bar, 'touchstart', function(e) {
            dw_Slidebar.prepDrag(e, barId);
        });
        dw_Event.add(bar, 'gesturestart', function(e) {
            dw_Slidebar.gestureFlag = true;
        });
        dw_Event.add(bar, 'gesturechange', function(e) {
            dw_Slidebar.gestureFlag = true;
        });
        dw_Event.add(track, 'gesturestart', function(e) {
            dw_Slidebar.gestureFlag = true;
        });
        dw_Event.add(bar, 'gestureend', function(e) {
            dw_Slidebar.gestureFlag = false;
        });
        dw_Event.add(track, 'gestureend', function(e) {
            dw_Slidebar.gestureFlag = false;
        });
    }
    dw_Event.add(track, 'mousedown', function(e) {
        dw_Slidebar.prepSlide(e, barId);
    });
    if (dw_Slidebar.scrollOnMousewheel) {
        if (bar.addEventListener) {
            bar.addEventListener('DOMMouseScroll', function(e) {
                dw_Slidebar.doOnMouseWheel(e, barId);
            }, false);
            track.addEventListener('DOMMouseScroll', function(e) {
                dw_Slidebar.doOnMouseWheel(e, barId);
            }, false);
        }
        bar.onmousewheel = track.onmousewheel = function(e) {
            dw_Slidebar.doOnMouseWheel(e, barId);
        };
    }
    this.bar = bar = null;
    track = null;
};
dw_Slidebar.prototype.slideDur = 500;
dw_Slidebar.scrollOnMousewheel = true;
dw_Slidebar.mousewheelSpeed = 5;
dw_Slidebar.mousewheelHorizSpeed = 10;
dw_Slidebar.col = {};
dw_Slidebar.ids = [];
dw_Slidebar.current = null;
dw_Slidebar.prepSlide = function(e, barId) {
    var _this = dw_Slidebar.col[barId];
    dw_Slidebar.current = _this;
    var bar = _this.bar = document.getElementById(barId);
    _this.clearTimer();
    e = e ? e : window.event;
    e.offX = (typeof e.offsetX == "number") ? e.offsetX : e.layerX;
    e.offY = (typeof e.offsetY == "number") ? e.offsetY : e.layerY;
    _this.startX = parseInt(bar.style.left);
    _this.startY = parseInt(bar.style.top);
    if (_this.axis == "v") {
        _this.destX = _this.startX;
        _this.destY = (e.offY < _this.startY) ? e.offY : e.offY - _this.barHt;
        _this.destY = Math.min(Math.max(_this.destY, _this.minY), _this.maxY);
    } else {
        _this.destX = (e.offX < _this.startX) ? e.offX : e.offX - _this.barWd;
        _this.destX = Math.min(Math.max(_this.destX, _this.minX), _this.maxX);
        _this.destY = _this.startY;
    }
    _this.distX = _this.destX - _this.startX;
    _this.distY = _this.destY - _this.startY;
    _this.per = Math.PI / (2 * _this.slideDur);
    _this.slideStartTime = new Date().getTime();
    _this.on_slide_start(_this.startX, _this.startY);
    _this.timer = setInterval(dw_Slidebar.doSlide, 10);
};
dw_Slidebar.doSlide = function() {
    var _this = dw_Slidebar.current;
    var elapsed = new Date().getTime() - _this.slideStartTime;
    if (elapsed < _this.slideDur) {
        var x = _this.startX + _this.distX * Math.sin(_this.per * elapsed);
        var y = _this.startY + _this.distY * Math.sin(_this.per * elapsed);
        _this.shiftTo(x, y);
        _this.on_slide(x, y);
    } else {
        _this.clearTimer();
        _this.shiftTo(_this.destX, _this.destY);
        _this.on_slide(_this.destX, _this.destY);
        _this.on_slide_end(_this.destX, _this.destY);
        dw_Slidebar.current = null;
    }
};
dw_Slidebar.prepDrag = function(e, barId) {
    var bar = document.getElementById(barId);
    var _this = dw_Slidebar.col[barId];
    var isTouchDevice = dw_Util.isTouchDevice();
    dw_Slidebar.current = _this;
    _this.bar = bar;
    _this.clearTimer();
    e = dw_Event.DOMit(e);
    var o = e.changedTouches ? e.changedTouches[0] : e;
    _this.downX = o.clientX;
    _this.downY = o.clientY;
    _this.startX = parseInt(bar.style.left);
    _this.startY = parseInt(bar.style.top);
    if (_this.axis == 'v') {
        _this.maxdLeft = true;
        _this.maxdRight = true;
        _this.maxdUp = (_this.startY == _this.minY) ? true : (_this.startY == _this.maxY) ? false : false;
        _this.maxdDown = (_this.startY == _this.minY) ? false : (_this.startY == _this.maxY) ? true : false;
    } else {
        _this.maxdLeft = (_this.startX == _this.minX) ? true : (_this.startX == _this.maxX) ? false : false;
        _this.maxdRight = (_this.startX == _this.minX) ? false : (_this.startX == _this.maxX) ? true : false;
        _this.maxdUp = true;
        _this.maxdDown = true;
    }
    dw_Slidebar.dragMaxChecked = false;
    _this.on_drag_start(_this.startX, _this.startY);
    if (!isTouchDevice) {
        dw_Event.add(document, "mousemove", dw_Slidebar.doDrag, true);
        dw_Event.add(document, "mouseup", dw_Slidebar.endDrag, true);
    } else if (e.touches.length == 1) {
        dw_Event.add(bar, "touchmove", dw_Slidebar.doDrag, true);
        dw_Event.add(bar, "touchend", dw_Slidebar.endDrag, true);
    }
    e.preventDefault();
    e.stopPropagation();
};
dw_Slidebar.checkDragMaxd = function(x, y) {
    var _this = dw_Slidebar.current;
    var v = (y < 0) ? 'up' : (y > 0) ? 'down' : '';
    var h = (x < 0) ? 'left' : (x > 0) ? 'right' : '';
    if ((Math.abs(y) < 8) || (Math.abs(x) < 8)) {
        if (Math.abs(y) < Math.abs(x)) {
            v = '';
        } else {
            h = '';
        }
    }
    if ((!v || (v == 'down' && _this.maxdDown) || (v == 'up' && _this.maxdUp)) && (!h || (h == 'right' && _this.maxdRight) || (h == 'left' && _this.maxdLeft))) {
        var bar = _this.bar;
        dw_Event.remove(bar, "touchmove", dw_Slidebar.doDrag, true);
        dw_Event.remove(bar, "touchend", dw_Slidebar.endDrag, true);
        dw_Event.remove(document, "mousemove", dw_Slidebar.doDrag, true);
        dw_Event.remove(document, "mouseup", dw_Slidebar.endDrag, true);
        return true;
    }
    dw_Slidebar.dragMaxChecked = true;
    return false;
};
dw_Slidebar.doDrag = function(e) {
    if (!dw_Slidebar.current) return;
    if (dw_Slidebar.gestureFlag) {
        return true;
    }
    var _this = dw_Slidebar.current;
    var bar = _this.bar;
    e = dw_Event.DOMit(e);
    var isTouchDevice = dw_Util.isTouchDevice();
    var o = e.changedTouches ? e.changedTouches[0] : e;
    var nx = _this.startX + o.clientX - _this.downX;
    var ny = _this.startY + o.clientY - _this.downY;
    if (!dw_Slidebar.dragMaxChecked && dw_Slidebar.checkDragMaxd(o.clientX - _this.downX, o.clientY - _this.downY)) {
        return;
    }
    nx = Math.min(Math.max(_this.minX, nx), _this.maxX);
    ny = Math.min(Math.max(_this.minY, ny), _this.maxY);
    _this.shiftTo(nx, ny);
    _this.on_drag(nx, ny);
    e.preventDefault();
    e.stopPropagation();
};
dw_Slidebar.endDrag = function() {
    if (!dw_Slidebar.current) return;
    if (dw_Slidebar.gestureFlag) {
        return;
    }
    var _this = dw_Slidebar.current;
    var bar = _this.bar;
    var isTouchDevice = dw_Util.isTouchDevice();
    if (!isTouchDevice) {
        dw_Event.remove(document, "mousemove", dw_Slidebar.doDrag, true);
        dw_Event.remove(document, "mouseup", dw_Slidebar.endDrag, true);
    } else {
        dw_Event.remove(bar, "touchmove", dw_Slidebar.doDrag, true);
        dw_Event.remove(bar, "touchend", dw_Slidebar.endDrag, true);
    }
    _this.on_drag_end(parseInt(bar.style.left), parseInt(bar.style.top));
    dw_Slidebar.current = null;
};
dw_Slidebar.doOnMouseWheel = function(e, barId) {
    if (!e) e = window.event;
    var delta = dw_Util.getMouseWheelDelta(e);
    if (!delta) {
        return;
    };
    if (dw_Util.isTouchDevice()) {
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;
        return;
    }
    var _this = dw_Slidebar.col[barId];
    dw_Slidebar.current = _this;
    var bar = _this.bar = document.getElementById(barId);
    if (_this.axis == 'v' && _this.maxY != _this.minY || _this.axis == 'h' && _this.maxX != _this.minX) {
        var x = parseInt(bar.style.left),
            y = parseInt(bar.style.top),
            nx, ny, nd;
        if (_this.maxY != _this.minY) {
            nd = -dw_Slidebar.mousewheelSpeed * delta;
            ny = nd + y;
            nx = x;
            ny = Math.min(Math.max(_this.minY, ny), _this.maxY);
        } else {
            nd = -dw_Slidebar.mousewheelHorizSpeed * delta;
            nx = nd + x;
            ny = y;
            nx = Math.min(Math.max(_this.minX, nx), _this.maxX);
        }
        _this.on_drag_start(x, y);
        _this.shiftTo(nx, ny);
        _this.on_drag(nx, ny);
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;
    }
};
dw_Slidebar.prototype.shiftTo = function(x, y) {
    if (this.bar && !isNaN(x) && !isNaN(y)) {
        this.bar.style.left = Math.round(x) + "px";
        this.bar.style.top = Math.round(y) + "px";
    }
};
dw_Slidebar.prototype.clearTimer = function() {
    clearInterval(this.timer);
    this.timer = 0;
};
dw_Slidebar.scrollOnMousewheel = dw_scrollObj.scrollOnMousewheel;
dw_scrollObj.prototype.setUpScrollbar = function(barId, trkId, axis, offx, offy, bSize) {
    var scrollbar = new dw_Slidebar(barId, trkId, axis, offx, offy);
    if (axis == "v") {
        this.vBarId = barId;
    } else {
        this.hBarId = barId;
    }
    scrollbar.wnId = this.id;
    scrollbar.bSizeDragBar = (dw_Util.getOptBool(bSize)) ? true : false;
    if (scrollbar.bSizeDragBar) {
        dw_Scrollbar_Co.setBarDims(this, scrollbar);
    }
    dw_Scrollbar_Co.setEvents(this, scrollbar);
    var x = this.getX();
    var y = this.getY();
    dw_Scrollbar_Co.getBarRefs(this);
    dw_Scrollbar_Co.updateScrollbar(this, x, y);
};
dw_Scrollbar_Co = {
    setBarDims: function(scrollObj, barObj) {
        var bar;
        var track = document.getElementById(barObj.trackId);
        if (barObj.axis == 'v') {
            bar = document.getElementById(scrollObj.vBarId);
            var trkHt = track.offsetHeight;
            if (barObj.bSizeDragBar) {
                var ht = (scrollObj.lyrHt > scrollObj.wnHt) ? trkHt / (scrollObj.lyrHt / scrollObj.wnHt) : trkHt - (2 * barObj.minY);
                ht = (!isNaN(ht) && ht > 0) ? Math.round(ht) : 0;
                bar.style.height = ht + "px";
                barObj.barHt = bar.offsetHeight;
            }
            barObj.maxY = trkHt - barObj.barHt - barObj.minY;
        } else if (barObj.axis == 'h') {
            bar = document.getElementById(scrollObj.hBarId);
            var trkWd = track.offsetWidth;
            if (barObj.bSizeDragBar) {
                var wd = (scrollObj.lyrWd > scrollObj.wnWd) ? trkWd / (scrollObj.lyrWd / scrollObj.wnWd) : trkWd - (2 * barObj.minX);
                wd = (!isNaN(wd) && wd > 0) ? Math.round(wd) : 0;
                bar.style.width = wd + "px";
                barObj.barWd = bar.offsetWidth;
            }
            barObj.maxX = trkWd - barObj.barWd - barObj.minX;
        }
    },
    resetBars: function(scrollObj) {
        var barObj, bar;
        if (scrollObj.vBarId) {
            barObj = dw_Slidebar.col[scrollObj.vBarId];
            bar = document.getElementById(scrollObj.vBarId);
            bar.style.left = barObj.minX + "px";
            bar.style.top = barObj.minY + "px";
            dw_Scrollbar_Co.setBarDims(scrollObj, barObj);
        }
        if (scrollObj.hBarId) {
            barObj = dw_Slidebar.col[scrollObj.hBarId];
            bar = document.getElementById(scrollObj.hBarId);
            bar.style.left = barObj.minX + "px";
            bar.style.top = barObj.minY + "px";
            dw_Scrollbar_Co.setBarDims(scrollObj, barObj);
        }
    },
    setEvents: function(scrollObj, barObj) {
        this.addEvent(scrollObj, 'on_load', function() {
            dw_Scrollbar_Co.resetBars(scrollObj);
        });
        this.addEvent(scrollObj, 'on_scroll_start', function() {
            dw_Scrollbar_Co.getBarRefs(scrollObj)
        });
        this.addEvent(scrollObj, 'on_scroll', function(x, y) {
            dw_Scrollbar_Co.updateScrollbar(scrollObj, x, y)
        });
        this.addEvent(scrollObj, 'on_scroll_stop', function(x, y) {
            dw_Scrollbar_Co.updateScrollbar(scrollObj, x, y);
        });
        this.addEvent(scrollObj, 'on_scroll_end', function(x, y) {
            dw_Scrollbar_Co.updateScrollbar(scrollObj, x, y);
        });
        this.addEvent(scrollObj, 'on_update', function() {
            dw_Scrollbar_Co.getBarRefs(scrollObj);
            dw_Scrollbar_Co.updateScrollValues(scrollObj);
        });
        this.addEvent(barObj, 'on_slide_start', function() {
            dw_Scrollbar_Co.stopTouchScroll(barObj);
            dw_Scrollbar_Co.getWndoLyrRef(barObj);
        });
        this.addEvent(barObj, 'on_drag_start', function() {
            dw_Scrollbar_Co.stopTouchScroll(barObj);
            dw_Scrollbar_Co.getWndoLyrRef(barObj);
        });
        this.addEvent(barObj, 'on_slide', function(x, y) {
            dw_Scrollbar_Co.updateScrollPosition(barObj, x, y)
        });
        this.addEvent(barObj, 'on_drag', function(x, y) {
            dw_Scrollbar_Co.updateScrollPosition(barObj, x, y)
        });
        this.addEvent(barObj, 'on_slide_end', function(x, y) {
            dw_Scrollbar_Co.updateScrollPosition(barObj, x, y);
        });
        this.addEvent(barObj, 'on_drag_end', function(x, y) {
            dw_Scrollbar_Co.updateScrollPosition(barObj, x, y);
        });
        if (dw_scrollObj.enableKeyboardScroll && !dw_Util.isTouchDevice()) {
            var bar = document.getElementById(barObj.barId),
                track = document.getElementById(barObj.trackId);
            bar.tabIndex = 0;
            track.tabIndex = 0;
            dw_Event.add(bar, 'keydown', dw_scrollObj.handleKeyboardScroll);
            dw_Event.add(bar, 'keypress', dw_Scrollbar_Co.switchKeyEvents);
            dw_Event.add(bar, 'keyup', dw_scrollObj.handleScrollKeyup);
            dw_Event.add(track, 'keydown', dw_scrollObj.handleKeyboardScroll);
            dw_Event.add(track, 'keypress', dw_Scrollbar_Co.switchKeyEvents);
            dw_Event.add(track, 'keyup', dw_scrollObj.handleScrollKeyup);
        }
    },
    switchKeyEvents: function() {
        var barId, barObj, bar, track;
        for (barId in dw_Slidebar.col) {
            barObj = dw_Slidebar.col[barId];
            bar = document.getElementById(barObj.barId);
            track = document.getElementById(barObj.trackId);
            dw_Event.remove(bar, 'keydown', dw_scrollObj.handleKeyboardScroll);
            dw_Event.remove(bar, 'keypress', dw_Scrollbar_Co.switchKeyEvents);
            dw_Event.add(bar, 'keypress', dw_scrollObj.handleKeyboardScroll);
            dw_Event.remove(track, 'keydown', dw_scrollObj.handleKeyboardScroll);
            dw_Event.remove(track, 'keypress', dw_Scrollbar_Co.switchKeyEvents);
            dw_Event.add(track, 'keypress', dw_scrollObj.handleKeyboardScroll);
        }
    },
    addEvent: function(o, ev, fp) {
        var oldEv = o[ev];
        if (typeof oldEv != 'function') {
            o[ev] = function(x, y) {
                fp(x, y);
            };
        } else {
            o[ev] = function(x, y) {
                oldEv(x, y);
                fp(x, y);
            };
        }
    },
    updateScrollbar: function(scrollObj, x, y) {
        var nx, ny;
        if (scrollObj.vBar && scrollObj.maxY) {
            var vBar = scrollObj.vBar;
            ny = -(y * ((vBar.maxY - vBar.minY) / scrollObj.maxY) - vBar.minY);
            ny = Math.min(Math.max(ny, vBar.minY), vBar.maxY);
            if (vBar.bar) {
                nx = parseInt(vBar.bar.style.left);
                vBar.shiftTo(nx, ny);
            }
        }
        if (scrollObj.hBar && scrollObj.maxX) {
            var hBar = scrollObj.hBar;
            nx = -(x * ((hBar.maxX - hBar.minX) / scrollObj.maxX) - hBar.minX);
            nx = Math.min(Math.max(nx, hBar.minX), hBar.maxX);
            if (hBar.bar) {
                ny = parseInt(hBar.bar.style.top);
                hBar.shiftTo(nx, ny);
            }
        }
    },
    updateScrollPosition: function(barObj, x, y) {
        var nx, ny, wndo = barObj.wndo;
        if (barObj.axis == "v") {
            nx = wndo.x;
            ny = -(y - barObj.minY) * (wndo.maxY / (barObj.maxY - barObj.minY));
        } else {
            ny = wndo.y;
            nx = -(x - barObj.minX) * (wndo.maxX / (barObj.maxX - barObj.minX));
        }
        wndo.shiftTo(nx, ny);
    },
    updateScrollValues: function(scrollObj) {
        var x = scrollObj.getX();
        var y = scrollObj.getY();
        x = Math.max(x, -scrollObj.maxX);
        y = Math.max(y, -scrollObj.maxY);
        scrollObj.shiftTo(x, y);
        this.resetBars(scrollObj);
        this.updateScrollbar(scrollObj, x, y);
    },
    getBarRefs: function(scrollObj) {
        if (scrollObj.vBarId && !scrollObj.vBar) {
            scrollObj.vBar = dw_Slidebar.col[scrollObj.vBarId];
            scrollObj.vBar.bar = document.getElementById(scrollObj.vBarId);
        }
        if (scrollObj.hBarId && !scrollObj.hBar) {
            scrollObj.hBar = dw_Slidebar.col[scrollObj.hBarId];
            scrollObj.hBar.bar = document.getElementById(scrollObj.hBarId);
        }
    },
    getWndoLyrRef: function(barObj) {
        if (!barObj.wndo) {
            var wndo = barObj.wndo = dw_scrollObj.col[barObj.wnId];
            if (wndo && !wndo.lyr) {
                wndo.lyr = document.getElementById(wndo.lyrId);
            }
        }
    },
    stopTouchScroll: function(barObj) {
        var isTouchDevice = dw_Util.isTouchDevice();
        var wndo = dw_scrollObj.col[barObj.wnId];
        if (isTouchDevice && wndo.isScrolling) {
            wndo.ceaseScroll();
            wndo.isScrolling = false;
        }
    }
};
dw_scrollObj.prototype.buildScrollControls = function(id, axis, eType, bScrollbar, bAtt) {
    var wnId = this.id;
    var scrollbar = document.getElementById(id);
    var start_cls, end_cls, pr, start_deg, end_deg, tip, atts, barStart, barEnd, track, dragBar, x, y;
    var f = document.createDocumentFragment();
    pr = (axis == 'v') ? wnId + '_' : wnId + '_h_';
    if (axis == 'v') {
        start_cls = 'up';
        start_deg = 90;
        end_cls = 'down';
        end_deg = 270;
    } else {
        start_cls = 'left';
        start_deg = 180;
        end_cls = 'right';
        end_deg = 0;
    } if (dw_Util.getOptBool(bAtt)) {
        tip = (eType == 'mousedown') ? 'Press mouse button to scroll' : '';
        atts = tip ? {
            'title': tip
        } : {};
    }
    barStart = dw_Util.addElement('div', pr + start_cls, start_cls, atts);
    barEnd = dw_Util.addElement('div', pr + end_cls, end_cls, atts);
    if (bScrollbar) {
        track = dw_Util.addElement('div', pr + 'track', 'track');
        dragBar = dw_Util.addElement('div', pr + 'dragBar', 'dragBar');
        track.appendChild(dragBar);
    }
    f.appendChild(barStart);
    if (track) {
        f.appendChild(track);
    }
    f.appendChild(barEnd);
    scrollbar.appendChild(f);
    if (!eType) {
        eType = 'mouseover';
    }
    dw_scrollObj.setupMouseEvents(barStart, wnId, eType, start_deg);
    dw_scrollObj.setupMouseEvents(barEnd, wnId, eType, end_deg);
    if (bScrollbar) {
        this.setUpScrollbar(pr + 'dragBar', pr + 'track', axis);
    }
    dw_scrollObj.handleControlVis(id, wnId, axis);
    dw_Scrollbar_Co.addEvent(this, 'on_load', function() {
        dw_scrollObj.handleControlVis(id, wnId, axis);
    });
    dw_Scrollbar_Co.addEvent(this, 'on_update', function() {
        dw_scrollObj.handleControlVis(id, wnId, axis);
    });
};
dw_scrollObj.setupMouseEvents = function(el, wnId, eType, deg, speed) {
    var isTouchDevice = dw_Util.isTouchDevice();
    if (!isTouchDevice) {
        if (eType == 'mouseover') {
            dw_Event.add(el, 'mouseover', function(e) {
                dw_scrollObj.col[wnId].initScrollVals(deg, speed);
            });
            dw_Event.add(el, 'mouseout', function(e) {
                dw_scrollObj.col[wnId].ceaseScroll();
            });
            dw_Event.add(el, 'mousedown', function(e) {
                dw_scrollObj.col[wnId].speed *= 3;
            });
            dw_Event.add(el, 'mouseup', function(e) {
                dw_scrollObj.col[wnId].speed = dw_scrollObj.prototype.speed;
            });
        } else {
            dw_Event.add(el, 'mousedown', function(e) {
                dw_scrollObj.col[wnId].initScrollVals(deg, speed);
                e = dw_Event.DOMit(e);
                e.preventDefault();
            });
            dw_Event.add(el, 'dragstart', function(e) {
                e = dw_Event.DOMit(e);
                e.preventDefault();
            });
            dw_Event.add(el, 'mouseup', function(e) {
                dw_scrollObj.col[wnId].ceaseScroll();
            });
            dw_Event.add(el, 'mouseout', function(e) {
                dw_scrollObj.col[wnId].ceaseScroll();
            });
        }
    } else {
        dw_Event.add(el, 'mousedown', function(e) {
            var wndo = dw_scrollObj.col[wnId];
            if (!wndo.isScrolling) {
                wndo.initScrollVals(deg, speed);
                wndo.isScrolling = true;
            } else {
                wndo.ceaseScroll();
                wndo.isScrolling = false;
            }
        });
    }
    dw_Event.add(el, 'click', function(e) {
        if (e && e.preventDefault) e.preventDefault();
        return false;
    });
};
dw_scrollObj.handleControlVis = function(controlsId, wnId, axis) {
    var wndo = dw_scrollObj.col[wnId];
    var el = document.getElementById(controlsId);
    if ((axis == 'v' && wndo.maxY > 0) || (axis == 'h' && wndo.maxX > 0)) {
        el.style.visibility = 'visible';
    } else {
        el.style.visibility = 'hidden';
    }
};
dw_scrollObj.prototype.setUpLoadLinks = function(controlsId) {
    var el = document.getElementById(controlsId);
    if (!el) {
        return;
    }
    var wnId = this.id;
    var links = el.getElementsByTagName('a');
    var list, cls, clsStart, clsEnd, parts, lyrId;
    clsStart = 'load_' + wnId + '_';
    for (var i = 0; links[i]; i++) {
        list = dw_Util.get_DelimitedClassList(links[i].className);
        lyrId = '';
        for (var j = 0; cls = list[j]; j++) {
            if (cls.indexOf(clsStart) != -1) {
                clsEnd = cls.slice(clsStart.length);
                if (document.getElementById(clsEnd)) {
                    lyrId = clsEnd;
                    dw_Event.add(links[i], 'click', function(wnId, lyrId) {
                        return function(e) {
                            dw_scrollObj.col[wnId].load(lyrId);
                            if (e && e.preventDefault) e.preventDefault();
                            return false;
                        }
                    }(wnId, lyrId));
                }
            }
        }
    }
};