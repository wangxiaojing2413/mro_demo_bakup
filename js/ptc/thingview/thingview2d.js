"use strict";

var ThingView2D = (function () {
    var _currentCanvasId = "";
    //SVG VARS
    var _calloutColors = [];
    var _calloutsSelected = [];
    var _partColors = [];
    var _partsSelected = [];
    var _svgCalloutCB;
    var _zoomWindow = false;
    var _zoomButton = false;
    var _zoomButtonScale;
    //PDF VARS
    var __PDF_DOC = null;
    var __CANVAS = null;
    var __CANVAS_CTX = null;
    var __CURRENT_PAGE = 0;
    var __TOTAL_PAGES = 0;
    var __ZOOMSCALE = 1;
    var _load2DViewCB;
    var _pageMode = "Original";
    var _cursorMode = "pan";
    var _ignoreScrollEvent = false;
    var _marginSize = 26;
    
    //Public Functions
    var returnObj = {
        //SHARED
        LoadDocument: function (viewable, parentCanvasId, model, callback){
          _LoadDocument(viewable, parentCanvasId, model, callback);  
        },
        Destroy2DCanvas: function() {
            _destroy2DCanvas();
        },
        ResetTransform: function(elem){
          _resetTransform(elem);  
        },
        SetZoomOnButton: function(scale){
            if (_zoomWindow) {
                _setZoomWindow();
            }
            _setZoomOnButton(scale);
        },
        //SVG
        IsSVGSession: function() {
            return _IsSVGSession();
        },
        ResetTransformSVG: function(){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _resetTransform(document.getElementById(_currentCanvasId).childNodes[0]);
        },
        SetZoomWindow: function(){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _setZoomWindow();
        },
        GetCallouts: function(){
            return _getCallouts();
        },
        SelectCallout: function(callout){
            if(!(_calloutsSelected.indexOf(callout.id) != -1)){
                _selectCallout(callout);
            }
        },
        DeselectCallout: function(callout){
            if(_calloutsSelected.indexOf(callout.id) != -1){
                _deselectCallout(callout);
                var index = _calloutsSelected.indexOf(callout.id);
                if (index !=-1){
                    _calloutsSelected.splice(index,1);
                }
            }
        },
        GetSVGParts: function(partNo){
            return _getSVGParts(partNo);
        },
        SetSVGCalloutCallback: function(callback){
            if(typeof callback === "function"){
                _svgCalloutCB = callback;
            }
        },
        //PDF
        CreatePDFSession: function(parentCanvasId, callback) {
            _createPDFSession(parentCanvasId, callback);
        },
        IsPDFSession: function() {
            return _IsPDFSession();
        },
        LoadPrevPage: function (callback) {
            _LoadPrevPage(callback);
        },
        LoadNextPage: function (callback) {
            _LoadNextPage(callback);
        },
        LoadPage: function (callback, pageNo) {
            _LoadPage(callback, pageNo);
        },
        GetCurrentPDFPage: function () {
            if (_IsPDFSession()){
                return __CURRENT_PAGE;
            }
        },
        GetTotalPDFPages: function () {
            if (_IsPDFSession()){
                return __TOTAL_PAGES;
            }
        },
        ResetTransformPDF: function(){
            if(_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _resetTransformPDF();
        },
        SetPageModePDF: function(pageMode){
            if(_IsPDFSession()){
                _pageMode = pageMode;
                __CURRENT_PAGE = 1;
                _setPageModePDF(__CURRENT_PAGE);
            }
        },
        SetPanModePDF: function(){
            if(_IsPDFSession()){
                if (_zoomButton) {
                    _setZoomOnButton(_zoomButtonScale);
                }
                _cursorMode = "pan";
            }
        }
    };
    
    extendObject(ThingView, returnObj);

    //Private Functions
    
    //SHARED
    function extendObject (obj1, obj2) {
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }
        return obj1;
    }
    
    function _LoadDocument(viewable, parentCanvasId, model, callback){
        if(viewable && model){
            if(viewable.type==Module.ViewableType.DOCUMENT && viewable.fileSource.indexOf(".pdf", viewable.fileSource.length - 4) != -1){
                if (!_IsPDFSession()){
                    _createPDFSession(parentCanvasId, function(){
                        _load2DViewCB = callback;
                        _cursorMode = "pan";
                        _pageMode = "Original";
                        model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                            _LoadPDF(val, callback)
                        });
                    });
                } else {
                    _load2DViewCB = callback;
                    model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                        _LoadPDF(val, callback)
                    });
                }
            }
            else if (viewable.type==Module.ViewableType.ILLUSTRATION && viewable.fileSource.indexOf(".svg", viewable.fileSource.length - 4) != -1){
                if(!_IsSVGSession()){
                    _createSVGSession(parentCanvasId);
                }
                model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                    _LoadSVG(val, callback);
                });
            } else callback(false);
        } else {
            callback(false);
        }
    }
    
    function _resetTransform(elem){
        _setTransformMatrix(elem, 1, 0, 0, 1, 0, 0);
    }
    
    function _destroy2DCanvas(){
        _removeWindowEventListenersSVG();
        _removeWindowEventListenersPDF();
        var currentCanvas =  document.getElementById(_currentCanvasId);
        var parent = currentCanvas.parentNode;
        parent.removeChild(currentCanvas);
        _currentCanvasId = "";
    }
    
    //SVG
    function _createSVGSession(parentCanvasId){
        if(_IsPDFSession()){
            _destroy2DCanvas();
        }
        else if (!_IsSVGSession()){
            ThingView.Hide3DCanvas();
        }
        _currentCanvasId = "";
        var svgWrapper = document.createElement("div");
        var parent = document.getElementById(parentCanvasId);
        svgWrapper.id = parentCanvasId + "_CreoViewSVGDiv" + ThingView.GetNextCanvasID();
        var width = parent.clientWidth;
        var height = parent.clientHeight;
        svgWrapper.setAttribute('style',"position: relative; height: 100%; width: 100%; overflow: hidden");
        parent.style.overflow = "hidden";
        var svgHolder = document.createElement("div");
        svgHolder.setAttribute("type", "image/svg+xml");
        
        var deselect = {
            x:0,
            y:0
        };
        var drag = {
            x: 0,
            y: 0,
            state: false,
        };
        var rightClickDrag = {
            x: 0,
            y: 0,
            lastY: 0,
            state: false
        };
        var zoomDrag = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            state: false
        };
        var zoomPinch = {
            xCenter: 0,
            yCenter: 0,
            oldXs : new Object(),
            oldYs : new Object(),
            newXs : new Object(),
            newYs : new Object(),
            state: false
        };
        var twoPointDrag = {
            x: 0,
            y: 0,
            state: false,
        };
        
        var rectCanvas = document.createElement("canvas");
        rectCanvas.setAttribute('style',"position: absolute; top: 0%; left: 0%");
        rectCanvas.setAttribute('width',width);
        rectCanvas.setAttribute('height',height);
        
        svgWrapper.addEventListener("wheel", _zoomOnWheelSVG);
        svgWrapper.addEventListener("dblclick", function(){
            if(!_zoomButton){
                _resetTransform(svgHolder);
            }
        },{passive: false});
        
        svgWrapper.addEventListener("mousedown", function(e){
            e.preventDefault();
            if (_zoomWindow) {
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            } else if (_zoomButton) {
                _zoomOnButton(e);
            } else if (!drag.state && e.button==0) {
                _handlePanEvent(e, drag)
            } else if (!rightClickDrag.state && e.button==2) {
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
            }
            deselect.x = e.pageX;
            deselect.y = e.pageY;
        },{passive: false});
        
        svgWrapper.addEventListener("mouseup", function(e){
            e.preventDefault();
            if(_zoomWindow && zoomDrag.state){
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            } else if(drag.state){
                _handlePanEvent(e, drag);
            } else if(rightClickDrag.state){
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
            }
            var target = String(e.target.className.baseVal);
            target = target != "" ? target : String(e.target.parentNode.className.baseVal);
            if(e.pageX == deselect.x && e.pageY == deselect.y && !(e.ctrlKey || e.metaKey) && !(target.indexOf("hotspot") != -1) && !(target.indexOf("callout") != -1)){
                _deselectAllCallouts();
            }
        }, {passive: false});
        
        svgWrapper.addEventListener("mousemove", function(e){
            e.preventDefault();
            if (!_zoomWindow) {
                if(drag.state){
                    _handlePanEvent(e, drag);
                } else if(rightClickDrag.state){
                    _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper);
                }
            } else if (_zoomWindow && zoomDrag.state) {
               _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            }
        }, {passive: false});
        
        svgWrapper.addEventListener("mouseleave", function(){
            if (_zoomWindow && zoomDrag.state){
                window.addEventListener("mouseup", function(e){
                    if(_zoomWindow && zoomDrag.state){
                        _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                    }
                });
                window.addEventListener("mousemove", function(e){
                    if (_zoomWindow && zoomDrag.state) {
                        _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                    }
                });
            } else if(drag.state){
                window.addEventListener("mouseup", function(e){
                    if(drag.state){
                        _handlePanEvent(e, drag);
                    }
                });
                window.addEventListener("mousemove", function(e){
                    e.stopPropagation();
                    if(drag.state){
                        _handlePanEvent(e, drag);
                    }
                });
            } else if (rightClickDrag.state){
                window.addEventListener("mouseup", function(e){
                    if(rightClickDrag.state){
                        _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
                    }
                });
                window.addEventListener("mousemove", function(e){
                    e.stopPropagation();
                    if(rightClickDrag.state){
                        _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
                    }
                });
            }
        },{passive: false});
        svgWrapper.addEventListener("mouseenter", function(){
            _removeWindowEventListenersSVG(drag, rightClickDrag, svgWrapper, zoomDrag);
        },{passive: false});
        
        var touchMoved = false;        
        svgWrapper.addEventListener("touchstart", function(e){
            touchMoved = false;
            if (e.touches.length <= 1) {
                if (_zoomWindow) {
                    _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                } else if (_zoomButton) {
                    _zoomOnButton(e);
                } else {
                    _handlePanEvent(e, drag);
                }
            } else {
                _handleZoomOnPinchEvent(e, zoomPinch);
                _handleTwoPointPanEvent(e, twoPointDrag);
            }
        },{passive: false});
        
        var lastTap = 0;
        svgWrapper.addEventListener("touchend", function(e){
            e.preventDefault();
            if (!zoomPinch.state) {
                var currTime = new Date().getTime();
                var tapLength = currTime - lastTap;
                if (tapLength < 200 && tapLength > 0){
                    if(!_zoomButton){
                        _resetTransform(svgHolder);
                        drag.state = false;
                    }
                } else if(_zoomWindow && zoomDrag.state){
                    _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                } else if(drag.state){
                    _handlePanEvent(e, drag);
                } else if(twoPointDrag.state) {
                    _handleTwoPointPanEvent(e, twoPointDrag);
                }
                lastTap = currTime;
                e.stopPropagation();
                if(!touchMoved && !(e.ctrlKey || e.metaKey)){
                    _deselectAllCallouts();
                }
            } else {
                _handleZoomOnPinchEvent(e, zoomPinch)
                if(drag.state){
                    _handlePanEvent(e, drag);
                } 
            }
            touchMoved = false;
        }, {passive: false});
        
        svgWrapper.addEventListener("touchmove", function(e){
            e.preventDefault();
            if (!zoomPinch.state) {
                if (!_zoomWindow) {
                    if (drag.state){
                        _handlePanEvent(e, drag);
                    }
                } else if (_zoomWindow && zoomDrag.state) {
                   _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                }
            } else  if (zoomPinch.state && e.touches.length == 2){
                _handleZoomOnPinchEvent(e, zoomPinch);
            }
            if (twoPointDrag.state) {
                _handleTwoPointPanEvent(e, twoPointDrag);
            }
            touchMoved = true;
        }, {passive: false});
        
        svgWrapper.insertBefore(svgHolder, svgWrapper.childNodes[0]);
        svgHolder.setAttribute('style',"position: relative; height: inherit; width: inherit");
        parent.insertBefore(svgWrapper, parent.childNodes[0]);
        _currentCanvasId = svgWrapper.id;
        return;
    }
        
    function _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper){
        if (e.type == "mousedown" || e.type == "touchstart") {
            zoomDrag.x1 = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
            zoomDrag.y1 = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
            zoomDrag.state = true;
            rectCanvas.getContext('2d').clearRect(0,0,rectCanvas.width,rectCanvas.height);
            svgWrapper.insertBefore(rectCanvas, svgWrapper.childNodes[1]);
        } else if (e.type == "mouseup" || e.type == "touchend") {
            _zoomOnWindowSVG(e, zoomDrag);
            svgWrapper.removeChild(rectCanvas);
            zoomDrag.state = false;
            _setZoomWindow();
        } else if (e.type == "mousemove" || e.type == "touchmove") {
            _drawZoomWindow(rectCanvas, zoomDrag, e);
            zoomDrag.x2 = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
            zoomDrag.y2 = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
        }
    }
    
    function _handlePanEvent(e, drag){
        if (e.type == "mousedown" || e.type == "touchstart") {
            drag.x = e.type.indexOf("touch") != -1 ? Math.floor(e.touches[0].pageX) : e.pageX;
            drag.y = e.type.indexOf("touch") != -1 ? Math.floor(e.touches[0].pageY) : e.pageY;
            drag.state = true;
        } else if (e.type == "mouseup" || e.type == "touchend") {
            document.body.style.cursor = "auto";
            drag.state = false;
        } else if (e.type == "mousemove" || e.type == "touchmove") {
            document.body.style.cursor = "url(" + ThingView.resourcePath + "/cursors/pan.cur),auto";
            _panSVG(e, drag);
        }
    }
    
    function _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper){
        if (e.type == "mousedown") {
            rightClickDrag.x = e.pageX;
            rightClickDrag.y = e.pageY;
            rightClickDrag.lastY = e.pageY;
            rightClickDrag.state = true;
            svgWrapper.oncontextmenu = function(){return true;}
        } else if (e.type == "mouseup") {
            document.body.style.cursor = "auto";
            rightClickDrag.state = false;
        } else if (e.type == "mousemove") {
            svgWrapper.oncontextmenu = function(){return false;}
            document.body.style.cursor = "url(" + ThingView.resourcePath + "/cursors/zoom.cur),auto";
            _zoomOnRightClickSVG(e, rightClickDrag);
        }        
    }
    
    function _handleZoomOnPinchEvent(e, zoomPinch){
        var lastTouch = 0;
        if (e.type == "touchstart") {
            var touchCenter = _getTouchCenter(e);
            zoomPinch.xCenter = touchCenter.x;
            zoomPinch.yCenter = touchCenter.y;
            zoomPinch.oldXs = {x0: e.touches[0].pageX, x1: e.touches[1].pageX};
            zoomPinch.oldYs = {y0: e.touches[0].pageY, y1: e.touches[1].pageY};
            zoomPinch.state = true;
        } else if (e.type == "touchend") {
            zoomPinch.state = false;
        } else if (e.type == "touchmove") {
            zoomPinch.newXs = {x0: e.touches[0].pageX, x1: e.touches[1].pageX};
            zoomPinch.newYs = {y0: e.touches[0].pageY, y1: e.touches[1].pageY};
            _zoomOnPinch(e, zoomPinch);
        }
    }
    
    function _handleTwoPointPanEvent(e, twoPointDrag){
        if (e.type == "touchstart") {
            var touchCenter = _getTouchCenter(e);
            twoPointDrag.x = touchCenter.x;
            twoPointDrag.y = touchCenter.y;
            twoPointDrag.state = true;
        } else if (e.type == "touchend") {
            twoPointDrag.state = false;
        } else if (e.type == "touchmove") {
            _panSVG(e, twoPointDrag);
        }
    }
        
    function _removeWindowEventListenersSVG(drag, rightClickDrag, svgWrapper, zoomDrag) {
        window.removeEventListener("mouseup", function(e){
            if(_zoomWindow && zoomDrag.state){
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            }
        });
        window.removeEventListener("mousemove", function(e){
            if (_zoomWindow && zoomDrag.state) {
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            }
        });
        window.removeEventListener("mouseup",function(){
            if(drag.state){
                _handlePanEvent(e, drag);
            }
        });
        window.removeEventListener("mousemove", function(e){
            e.stopPropagation();
            if(drag.state){
                _handlePanEvent(e, drag);
            }
        });
        window.removeEventListener("mouseup", function(){
            if(rightClickDrag.state){
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
            }
        });
        window.removeEventListener("mousemove", function(e){
            e.stopPropagation();
            if(rightClickDrag.state){
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
            }
        });
    }
        
    function _getTransformMatrix(svgHolder){
        var svgTransform = getComputedStyle(svgHolder).getPropertyValue('transform');
        if(svgTransform=="none"){
            svgTransform = "matrix(1, 0, 0, 1, 0, 0)";
        }
        var matrix = svgTransform.replace(/[^\d.,-]/g, '').split(',').map(Number);
        return matrix;
    }
    
    function _setTransformMatrix(elem, scaleX, skewX, skewY, scaleY, transX, transY){
        var newTransform = "transform: matrix(" + scaleX + "," + skewX + "," + skewY + "," + scaleY + "," + transX + "," + transY + ")";
        var currentStyle = elem.style.cssText;
        var newStyle = "";
        if(currentStyle.indexOf("transform") != -1) {
            var i = currentStyle.indexOf("transform");
            var j = currentStyle.indexOf(";", i)+1;
            newStyle = currentStyle.substr(0, i) + currentStyle.substr(j);
        } else {
            newStyle = currentStyle;
        }
        newStyle = newStyle + newTransform;
        elem.setAttribute('style',newStyle);
    }
    
    function _getTouchCenter (e){
        var sumX = 0;
        var sumY = 0;
        for (var i=0; i < e.touches.length; i++){
            sumX += e.touches[i].pageX;
            sumY += e.touches[i].pageY;
        }        
        return {x: Math.floor(sumX / i), y: Math.floor(sumY / i)};
    }
    
    function _panSVG(e, drag){
        e.preventDefault();
        var pageX = e.type.indexOf("touch") == -1 ? e.pageX : _getTouchCenter(e).x;
        var pageY = e.type.indexOf("touch") == -1 ? e.pageY : _getTouchCenter(e).y;
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var deltaX = pageX - drag.x;
        var deltaY = pageY - drag.y;
        var matrix = _getTransformMatrix(svgHolder);
        _setTransformMatrix(svgHolder, matrix[0], matrix[1], matrix[2], matrix[3], (matrix[4] + deltaX), (matrix[5] + deltaY));
        drag.x = pageX;
        drag.y = pageY;
    }
    
    function _getElementCenter(elem) {
        var boundingRect = elem.getBoundingClientRect();
        var centerX = (boundingRect.left + boundingRect.right)/2;
        var centerY = (boundingRect.top + boundingRect.bottom)/2;
        return {x: centerX, y: centerY}
    }
    
    function _zoomOnWheelSVG(e){
        var ZOOMMODIFIER = 0.15
        var MAXZOOM = 10.0
        var MINZOOM = 0.15
        
        var svgHolder = e.currentTarget.childNodes[0];
        var center = _getElementCenter(svgHolder);
        var mouseDeltaX = (center.x - e.pageX) * ZOOMMODIFIER;
        var mouseDeltaY = (center.y - e.pageY) * ZOOMMODIFIER;

        var matrix = _getTransformMatrix(svgHolder);
        
        var delta = e.deltaY > 0 ? 1 : -1;
        
        var newScale = matrix[0] * (1 + (delta * ZOOMMODIFIER));
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (mouseDeltaX * delta)), (matrix[5] + (mouseDeltaY * delta)));
        }
    }
    
    function _setZoomOnButton(scale){
        if(!_zoomButtonScale || !(_zoomButton && _zoomButtonScale != scale)) {
            _zoomButton = !_zoomButton;
        }
        if(_zoomButton) {
            _zoomButtonScale = scale;
            document.body.style.cursor = "url(" + ThingView.resourcePath + "/cursors/zoom.cur),auto";
            document.addEventListener('keydown', function(e){
                if (e.key == "Escape" && _zoomButton) {
                    _setZoomOnButton(scale);
                }
            });
        } else {
            document.body.style.cursor = "auto";
            document.removeEventListener('keydown', function(e){
                if (e.key == "Escape" && _zoomButton) {
                    _setZoomOnButton(scale);
                }
            });
        }
    }
    
    function _zoomOnButton(e) {
        var MAXZOOM = 10.0
        var MINZOOM = 0.15
        
        var svgHolder = e.currentTarget.childNodes[0];
        var center = _getElementCenter(svgHolder);
        
        var pageX = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
        var pageY = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
        
        var mouseDeltaX = _zoomButtonScale < 1 ? (center.x - pageX) * (1 - _zoomButtonScale) : (center.x - pageX) * (_zoomButtonScale - 1);
        var mouseDeltaY = _zoomButtonScale < 1 ? (center.y - pageY) * (1 - _zoomButtonScale) : (center.y - pageY) * (_zoomButtonScale - 1);

        var matrix = _getTransformMatrix(svgHolder);
        
        var delta = _zoomButtonScale >= 1 ? 1 : -1;
        
        var newScale = matrix[0] * _zoomButtonScale; 
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (mouseDeltaX * delta)), (matrix[5] + (mouseDeltaY * delta)));
        }
    }

    function _zoomOnRightClickSVG(e, drag){
        e.preventDefault();
        var ZOOMMODIFIER = 0.05
        var MAXZOOM = 10.0
        var MINZOOM = 0.15
        
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var matrix = _getTransformMatrix(svgHolder);
        var center = _getElementCenter(svgHolder);
        var mouseDeltaX = (center.x - drag.x) * ZOOMMODIFIER;
        var mouseDeltaY = (center.y - drag.y) * ZOOMMODIFIER;
        
        var delta = (drag.lastY - e.pageY) > 0 ? 1 : (drag.lastY - e.pageY) < 0 ? -1 : 0;
        
        var newScale = matrix[0] * (1 + (delta * ZOOMMODIFIER));
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (delta * mouseDeltaX)), (matrix[5] + (delta * mouseDeltaY)));
        }
        drag.lastY = e.pageY;
    }
    
    function _setZoomWindow(){
        _zoomWindow = !_zoomWindow;
        if (_zoomWindow) {
            document.body.style.cursor = "url(" + ThingView.resourcePath + "/cursors/fly_rectangle.cur),auto";
            document.addEventListener('keydown', function(e){
                _zoomWindowEscapeListener(e);
            });
        } else {
            document.body.style.cursor = "auto";
            document.removeEventListener('keydown', function(e){
                _zoomWindowEscapeListener(e);
            });
        }
    }
    
    function _drawZoomWindow(rectCanvas, zoomDrag, e){
        var boundingClientRect = rectCanvas.getBoundingClientRect();
        var pageX = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
        var pageY = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
        var rectW = (pageX-boundingClientRect.left) - (zoomDrag.x1-boundingClientRect.left);
        var rectH = (pageY-boundingClientRect.top) - (zoomDrag.y1-boundingClientRect.top);
        var context = rectCanvas.getContext('2d');
        context.clearRect(0,0,rectCanvas.width,rectCanvas.height);
        context.strokeStyle = "#96ed14";
        context.fillStyle = "rgba(204,204,204,0.5)";
        context.lineWidth = 1;
        context.strokeRect((zoomDrag.x1-boundingClientRect.left), (zoomDrag.y1-boundingClientRect.top), rectW, rectH);
        context.fillRect((zoomDrag.x1-boundingClientRect.left), (zoomDrag.y1-boundingClientRect.top), rectW, rectH);
    }
    
    function _zoomWindowEscapeListener(e){
        if (e.key == "Escape" && _zoomWindow) {
            document.body.style.cursor = "auto";
            if(_IsSVGSession()){
                var svgWrapper = document.getElementById(_currentCanvasId);
                if(svgWrapper.childNodes.length > 1){
                    svgWrapper.removeChild(svgWrapper.childNodes[1]);
                }
            }
            _setZoomWindow();
        }
    }
    
    function _zoomOnWindowSVG(e, zoomDrag){
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        
        if(zoomDrag.x1 > zoomDrag.x2){
            zoomDrag.x1 = [zoomDrag.x2, zoomDrag.x2=zoomDrag.x1][0];
        }
        if(zoomDrag.y1 > zoomDrag.y2){
            zoomDrag.y1 = [zoomDrag.y2, zoomDrag.y2=zoomDrag.y1][0];
        }
        
        var width = zoomDrag.x2 - zoomDrag.x1;
        var height = zoomDrag.y2 - zoomDrag.y1;
        var holderAspectRatio = svgHolder.clientWidth / svgHolder.clientHeight;
        var zoomAspectRatio = width / height;
        var zoomModifier = (width > height && holderAspectRatio < zoomAspectRatio) ? (svgHolder.clientWidth / width) - 1 : (svgHolder.clientHeight / height) - 1;

        var center = _getElementCenter(svgHolder);
        var newCenterX = zoomDrag.x1 + width/2;
        var newCenterY = zoomDrag.y1 + height/2;
        var deltaX = (center.x - newCenterX) * (1 + zoomModifier);
        var deltaY = (center.y - newCenterY) * (1 + zoomModifier);
        
        var matrix = _getTransformMatrix(svgHolder);
        _setTransformMatrix(svgHolder, (matrix[0] * (1 + zoomModifier)), matrix[1], matrix[2], (matrix[0] * (1 + zoomModifier)), (matrix[4] + deltaX), (matrix[5] + deltaY)); 
        
    }
    
    function _zoomOnPinch(e, zoomPinch) {
        var oldHypth = Math.sqrt(Math.pow(zoomPinch.oldXs.x0 - zoomPinch.oldXs.x1,2) + Math.pow(zoomPinch.oldYs.y0 - zoomPinch.oldYs.y1,2));
        var newHypth = Math.sqrt(Math.pow(zoomPinch.newXs.x0 - zoomPinch.newXs.x1,2) + Math.pow(zoomPinch.newYs.y0 - zoomPinch.newYs.y1,2));
        var delta = (newHypth - oldHypth);
        
        if (delta!=0) {
            var ZOOMMODIFIER = 0.015 * delta;
            var MAXZOOM = 10.0;
            var MINZOOM = 0.15;
            
            var svgHolder = e.currentTarget.childNodes[0];
            var center = _getElementCenter(svgHolder);
            var mouseDeltaX = (center.x - zoomPinch.xCenter) * ZOOMMODIFIER;
            var mouseDeltaY = (center.y - zoomPinch.yCenter) * ZOOMMODIFIER;
            
            var matrix = _getTransformMatrix(svgHolder);
            var newScale = matrix[0] * (1 + ZOOMMODIFIER);
            if(newScale <= MAXZOOM && newScale >= MINZOOM){
                _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + mouseDeltaX), (matrix[5] + mouseDeltaY));                
            }
            
            zoomPinch.oldXs.x0 = zoomPinch.newXs.x0;
            zoomPinch.oldXs.x1 = zoomPinch.newXs.x1;
            zoomPinch.oldYs.y0 = zoomPinch.newYs.y0;
            zoomPinch.oldYs.y1 = zoomPinch.newYs.y1;
        }
    }
    
    function _IsSVGSession()
    {
        var retVal = false;
        if (!_currentCanvasId=="") {
            retVal = _currentCanvasId.indexOf("_CreoViewSVGDiv") != -1 ? true : false;
        }
        return retVal;
    }
    
    function _LoadSVG(val, callback){
    
        if(_IsSVGSession())
        {
            var canvasId = _currentCanvasId;
            var svgHolder = document.getElementById(canvasId).childNodes[0];
            _resetTransform(svgHolder);
            svgHolder.innerHTML = val;
            _setCalloutListeners(svgHolder);
            var svg = svgHolder.getElementsByTagName("svg")[0];
            svg.setAttribute('height',"100%");
            svg.setAttribute('width',"100%");
            _calloutsSelected = [];
            _partsSelected = [];
            _calloutColors = [];
            callback(true);
        }
    }
    
    function _getCallouts(){
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var callouts = svgHolder.querySelectorAll('[class^="callout"]');
        return callouts;
    }
    
    function _getSVGElementColors(elem, colorsList){
        var colors = [];
        colors[0] = elem.id;
        for (var i = 1; i < elem.childNodes.length; i++){
            colors = _addNodeColor(elem.childNodes[i], colors);
        }
        colorsList.push(colors);
    }
    
    function _addNodeColor(node, colors){
        var obj = new Object();
        if(node.nodeName == "path" || node.nodeName == "line" || node.nodeName == "text" || node.nodeName == "polyline"){
            obj['fill'] = node.getAttribute("fill") ? node.getAttribute("fill") : null;
            obj['stroke'] = node.getAttribute("stroke") ? node.getAttribute("stroke") : null;
            colors.push(obj);
        } else if(node.nodeName == "g") {
            for (var i = 0; i < node.childNodes.length; i++){
                colors = _addNodeColor(node.childNodes[i], colors);
            }
        }
        return colors;
    }
    
    function _setCalloutListeners(svgHolder){
        var hotspots = svgHolder.querySelectorAll('[class^="hotspot"]');
        if(hotspots.length==0){
            hotspots = svgHolder.querySelectorAll('[class^="callout"]');            
        }
        var startX = 0;
        var startY = 0;
        var touchMoved = false;
        for (var i=0; i < hotspots.length; i++){
            hotspots[i].addEventListener("mousedown", function(e){
                startX = e.pageX;
                startY = e.pageY;
            }, false);
            hotspots[i].addEventListener("mouseup", function(e){
                if(startX == e.pageX && startY == e.pageY){
                    if (!(e.ctrlKey || e.metaKey)) {
                        _deselectAllCallouts();
                    }
                    _toggleCalloutSelection(e);
                }
            }, false);
            hotspots[i].addEventListener("touchstart", function(e){
                touchMoved = false;
            });
            hotspots[i].addEventListener("touchmove", function(e){
                touchMoved = true;
            });
            hotspots[i].addEventListener("touchend", function(e){
                if(!touchMoved){
                    e.stopPropagation();
                    e.preventDefault();
                    if (!(e.ctrlKey || e.metaKey)) {
                        _deselectAllCallouts();
                    }
                    _toggleCalloutSelection(e);
                    touchMoved = false;
                }
            }, {passive: false});
        }
    }  
    
    function _getCalloutForToggle(e){
        var targetClass = e.currentTarget.getAttribute("class");
        if (targetClass.indexOf("callout") != -1){
            return e.currentTarget;
        } else if(targetClass.indexOf("hotspot") != -1){
            var noIndex = targetClass.indexOf("_");
            var calloutNo = targetClass.substr(noIndex);
            var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
            var callouts = svgHolder.querySelectorAll('[class^="callout"]');
            var callout;
            for (var i=0; i<callouts.length; i++){
                if(callouts[i].getAttribute('class').indexOf(calloutNo, callouts[i].getAttribute('class').length - calloutNo.length) != -1){
                    callout = callouts[i];
                }
            }
            return callout;
        } else {
            return;
        }
    }
    
    function _toggleCalloutSelection(e){
        var callout = _getCalloutForToggle(e);
        if(callout){
            if (_calloutsSelected.indexOf(callout.id) != -1){
                _deselectCallout(callout);
                var index = _calloutsSelected.indexOf(callout.id);
                if (index !=-1){
                    _calloutsSelected.splice(index,1);
                }
            } else {
                _selectCallout(callout);
            }
            if(_svgCalloutCB){
                _svgCalloutCB(callout.id);
            }
        }
    }
    
    function _setSVGElementColors(callout, mainColor, textColor){
        _setNodeColor(callout.childNodes[0], mainColor, textColor, false);
    }
    
    function _setNodeColor(node, mainColor, textColor, background){
        if(node){
            if (node.nodeName == "path") {
                if (node.getAttribute("fill")) {
                    node.setAttribute("fill", mainColor);
                    background = true;
                }
            }
            if (node.nodeName == "path" || node.nodeName == "line" || node.nodeName == "polyline") {
                node.setAttribute("stroke", mainColor);
            } else if (node.nodeName == "text") {
                if (background) {
                    node.setAttribute("fill", textColor);
                } else {
                    node.setAttribute("fill", mainColor);
                }
            } else if (node.nodeName == "g"){
                _setNodeColor(node.childNodes[0], mainColor, textColor, background);
                for (var i = 0; i < node.childNodes.length; i++) {
                    if (node.childNodes[i].nodeName == "path" && node.childNodes[i].getAttribute("fill")) {
                        background = true;
                    }
                }
            }
            _setNodeColor(node.nextSibling, mainColor, textColor, background)
        }
    }
    
    function _resetSVGElementColors (elem, colorsList){
        var colors = [];
        for (var i = 0; i < colorsList.length; i++){
            if (colorsList[i][0] == elem.id) {
                colors = colorsList[i];
                break;
            }
        }
        colors.shift();
        _resetNodeColor(elem.childNodes[0], colors);
        colorsList.splice(colorsList.indexOf(colors), 1);
    }
    
    function _resetNodeColor (node, colors){
        if (node) {
            if (node.nodeName == "line" || node.nodeName == "path" || node.nodeName == "text" || node.nodeName == "polyline") {
                var obj = colors.shift();
                if(obj['fill'] != null){
                    node.setAttribute('fill', obj['fill']);
                } else {
                    node.removeAttribute('fill');
                }
                if (obj['stroke'] != null){
                    node.setAttribute('stroke', obj['stroke']);
                } else {
                    node.removeAttribute('stroke');
                }
            } else if (node.nodeName == "g") {
                _resetNodeColor(node.childNodes[0], colors);
            }
            _resetNodeColor(node.nextSibling, colors);
        }
    }
    
    function _selectCallout(callout){
        _getSVGElementColors(callout, _calloutColors);
        _setSVGElementColors(callout, "rgb(102,153,255)", "rgb(255,255,255)");
        _calloutsSelected.push(callout.id);
        var parts = _getSVGParts(callout.getElementsByTagName("desc")[0].textContent);
        if(parts.length > 0){
        _selectSVGPart(parts);
        }
    }
    
    function _deselectAllCallouts(){
        for (var j=0; j<_calloutsSelected.length; j++){
            var callout = document.getElementById(_calloutsSelected[j]);
            _deselectCallout(callout);
            if(_svgCalloutCB) {
                _svgCalloutCB(callout.id);
            }
        }
        _calloutsSelected = [];
    }
    
    function _deselectCallout(callout){
        _resetSVGElementColors(callout, _calloutColors);
        var parts = _getSVGParts(callout.getElementsByTagName("desc")[0].textContent);
        if(parts.length > 0){
        _deselectSVGPart(parts);
        }
    }
    
    function _getSVGParts(partNo){
        return document.getElementsByClassName("part part_" + partNo);
    }
  
    function _selectSVGPart(parts){
        for (var i = 0; i < parts.length; i++){
            var part = parts.item(i);
            if(part){
                _getSVGElementColors(part, _partColors);
                _setSVGElementColors(part, "rgb(102,153,255)", "rgb(0,0,0)");
                _partsSelected.push(part.id);
            }
        }
    }
    
    function _deselectSVGPart(parts){
        for (var i = 0; i < parts.length; i++){
            var part = parts.item(i);
            if(part){
                _resetSVGElementColors(part, _partColors);
                var index = _partsSelected.indexOf(part.id);
                if (index !=-1){
                    _partsSelected.splice(index,1);
                }
            }
        }
    }
    
    //PDF
    function _createPDFSession(parentCanvasId, callback) {
        
        if(_IsSVGSession()){
            _destroy2DCanvas();
        }
        else if (!_IsPDFSession()){
            ThingView.Hide3DCanvas();
        }
        var head = document.getElementsByTagName('head').item(0);
        if (!document.getElementById("pdfjs")) {
            var script_pdf = document.createElement("SCRIPT");
            script_pdf.src = ThingView.modulePath + "pdfjs/pdf.js";
            script_pdf.id = "pdfjs";
            script_pdf.async = false;
            head.appendChild(script_pdf);

            script_pdf.onload = function() {
                _buildPDFSession(parentCanvasId, callback);
            }
        } else {
            _buildPDFSession(parentCanvasId, callback);
        }
        return;
    }
    
    function _buildPDFSession(parentCanvasId, callback){
        _currentCanvasId = "";
        var canvasWrapper = document.createElement("div");
        var parent = document.getElementById(parentCanvasId);
        canvasWrapper.id = parentCanvasId + "_CreoViewDocumentCanvas" + ThingView.GetNextCanvasID();
        canvasWrapper.style.minHeight = "100%";
        canvasWrapper.style.backgroundColor = "#999999";
        canvasWrapper.style.position = "absolute";
        parent.style.overflow = "auto";
        parent.style.position = "relative";
        parent.insertBefore(canvasWrapper, parent.childNodes[0]);
        _currentCanvasId = canvasWrapper.id;
        //Event Listeners:
        
        var drag = {
            x: 0,
            y: 0,
            state: false,
        };
        
        window.addEventListener("keydown", _changePageOnKey);
        
        parent.addEventListener("scroll", _changePageOnScroll);
        
        canvasWrapper.addEventListener("wheel", _changePageOnScroll);
        
        canvasWrapper.addEventListener("mousedown", function(e){
            if (_zoomButton) {
                _zoomButtonPDF(e);
            } else if (_cursorMode == "pan" && e.button == 0) {
                _handlePanEventPDF(e, drag);
            }
        });
        
        canvasWrapper.addEventListener("mouseup", function(e){
            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });
        
        canvasWrapper.addEventListener("mousemove", function(e){
            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });
        
        canvasWrapper.addEventListener("dblclick", function(){
            if(!_zoomButton) {
                _resetTransformPDF();
            }
        });
        
        canvasWrapper.addEventListener("mouseleave", function(e){
            if (drag.state){
                window.addEventListener("mousemove", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
                window.addEventListener("mouseup", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
            }
        });
        
        canvasWrapper.addEventListener("mouseenter", function(e){
            window.removeEventListener("mousemove", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
            window.removeEventListener("mouseup", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
        });
        
        var lastTap = 0;
        canvasWrapper.addEventListener("touchend", function(e){
            e.preventDefault();
            if (!_zoomButton) {
                var currTime = new Date().getTime();
                var tapLength = currTime - lastTap;
                if (tapLength < 200 && tapLength > 0){
                        _resetTransformPDF();
                        drag.state = false;
                    }
                lastTap = currTime;
            } else {
                _zoomButtonPDF(e);
            }
        });
        
        callback();
    }
    
    function _getPDFCanvas() {
        var sessionCanvas = document.createElement("canvas");
        var context = sessionCanvas.getContext('2d');
        sessionCanvas.style.margin = (_marginSize / 2) + "px";
        sessionCanvas.style.display = "inline-block";
        sessionCanvas.oncontextmenu = function (e) {
            e.preventDefault();
            return false;
        };
        return sessionCanvas;
    }
    
    function _removeWindowEventListenersPDF() {
        window.removeEventListener("keydown", _changePageOnKey);
        window.removeEventListener("mousemove", function(e){
            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });
        window.removeEventListener("mouseup", function(e){
            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });
        document.getElementById(_currentCanvasId).parentNode.removeEventListener("scroll", _changePageOnScroll);
    }
    
    function _handlePanEventPDF(e, drag) {
        if (e.type == "mousedown") {
            drag.x = e.pageX;
            drag.y = e.pageY;
            drag.state = true;
        } else if (e.type == "mousemove") {
            document.body.style.cursor = "url(" + ThingView.resourcePath + "/cursors/pan.cur),auto";
            _panPDF(e, drag);
        } else if (e.type == "mouseup") {
            document.body.style.cursor = "auto";
            drag.state = false;
        }
    }
    
    function _panPDF(e, drag) {
        e.preventDefault();
        var deltaX = 0 - (e.pageX - drag.x);
        var deltaY = 0 - (e.pageY - drag.y);
        var parent = document.getElementById(_currentCanvasId).parentNode;
        var scrollTop = parent.scrollTop;
        var scrollLeft = parent.scrollLeft;
        parent.scrollTop = scrollTop + deltaY;
        parent.scrollLeft = scrollLeft + deltaX;
        drag.x = e.pageX;
        drag.y = e.pageY;
    }
    
    function _changePageOnScroll() {
        var ignore = _ignoreScrollEvent;
        _ignoreScrollEvent = false;
        if (!ignore) {
            var canvasWrapper = document.getElementById(_currentCanvasId);
            var scrollTop = canvasWrapper.parentNode.scrollTop;
            var traversedHeight = 0;
            var lineHeight = 0;
            var lineWidth = 0;
            var i = 1;
            for (i; i <= __TOTAL_PAGES; i++){
                var child = canvasWrapper.childNodes[i-1];
                if (child.style.display == "block"){
                    lineWidth = 0;
                    traversedHeight += child.height + _marginSize;
                    lineHeight = 0;
                } else {
                    lineWidth += child.width + _marginSize;
                    lineHeight = lineHeight < child.height + _marginSize ? child.height + _marginSize : lineHeight;
                    if (i < __TOTAL_PAGES) {
                        if ((lineWidth + canvasWrapper.childNodes[i].width) > canvasWrapper.clientWidth) {
                            lineWidth = 0;
                            traversedHeight += lineHeight;
                            lineHeight = 0;
                        }
                    }
                }
                if(traversedHeight >= scrollTop) {
                    break;
                }
            }
            __CURRENT_PAGE = i;
            if (__CURRENT_PAGE > __TOTAL_PAGES) {
                __CURRENT_PAGE = __TOTAL_PAGES;
            }
            _load2DViewCB(true);
        }
    }
    
    function _changePageOnKey(e) {
        var keyPressed = e.key;
        if (keyPressed == "ArrowRight" || keyPressed == "6") {
            _LoadNextPage(_load2DViewCB);
        } else if (keyPressed == "ArrowLeft" || keyPressed == "4") {
            _LoadPrevPage(_load2DViewCB);
        } else if (keyPressed == "Home") {
            _LoadPage(_load2DViewCB, 1);
        } else if (keyPressed == "End") {
            _LoadPage(_load2DViewCB, __TOTAL_PAGES);
        }
    }

    function _zoomButtonPDF(e) {
        var pageNo = __CURRENT_PAGE;
        __CURRENT_PAGE = 1;
        var canvasWrapper = document.getElementById(_currentCanvasId);
        __ZOOMSCALE *= _zoomButtonScale;
        if(canvasWrapper.childNodes[0].style.display == "block"){
            _refreshPDF(pageNo, function(){
                for (var i=0; i < canvasWrapper.childNodes.length; i++){
                    canvasWrapper.childNodes[i].style.display = "block";
                    canvasWrapper.childNodes[i].style.margin = _marginSize + "px auto " + _marginSize + "px auto";
                }
                _load2DViewCB(true);
            });
        } else {
            _refreshPDF(pageNo, _load2DViewCB);
        }
    }
    
    function _resetTransformPDF () {
        _setPageModePDF(1)
    }
    
    function _refreshPDF(pageNo, callback) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        while(canvasWrapper.firstChild){
            canvasWrapper.removeChild(canvasWrapper.firstChild);
        }
        __PDF_DOC.getPage(1).then(function(pages){
            handlePages(pages, function(){
                showPage(pageNo, callback);
            });
        });
    }
    
    function _setPageModePDF(pageNo) {
        __CURRENT_PAGE = 1;
        var canvasWrapper = document.getElementById(_currentCanvasId);
        switch (_pageMode) {
            case "Original":
                __ZOOMSCALE = 1;
                _refreshPDF(pageNo, _load2DViewCB);
                break;
            case "FitPage":
                var wrapperHeight = canvasWrapper.parentNode.clientHeight;
                var wrapperWidth = canvasWrapper.parentNode.clientWidth;
                if (wrapperHeight <= wrapperWidth) {
                    var pageHeight = _getLargestPageHeight();
                    var heightRatio = wrapperHeight / pageHeight;
                    __ZOOMSCALE *= heightRatio;
                } else {
                    var pageWidth = _getLargestPageWidth();
                    var widthRatio = wrapperWidth / pageWidth;
                    __ZOOMSCALE *= widthRatio;
                }
                _refreshPDF(pageNo, function(val){
                    if (val) {
                        for (var i=0; i < canvasWrapper.childNodes.length; i++){
                            canvasWrapper.childNodes[i].style.display = "block";
                            canvasWrapper.childNodes[i].style.margin = _marginSize + "px auto " + _marginSize + "px auto";
                        }
                        canvasWrapper.parentNode.scrollTop = _marginSize;
                        _load2DViewCB(val);
                    }
                });
                break;
            case "FitWidth":
                var pageWidth = _getLargestPageWidth();
                var wrapperWidth = canvasWrapper.parentNode.clientWidth;
                var widthRatio = wrapperWidth / pageWidth;
                __ZOOMSCALE *= widthRatio;
                _refreshPDF(pageNo, function(val){
                    if (val) {
                        for (var i=0; i < canvasWrapper.childNodes.length; i++){
                            canvasWrapper.childNodes[i].style.display = "block";
                            canvasWrapper.childNodes[i].style.margin = _marginSize + "px auto " + _marginSize + "px auto";
                        }
                        canvasWrapper.parentNode.scrollTop = _marginSize;
                        _load2DViewCB(val);
                    }
                });
                break;
            case "500percent":
                __ZOOMSCALE = 5;
                _refreshPDF(pageNo, _load2DViewCB);
                break;
            case "250percent":
                __ZOOMSCALE = 2.5;
                _refreshPDF(pageNo, _load2DViewCB);
                break;
            case "200percent":
                __ZOOMSCALE = 2;
                _refreshPDF(pageNo, _load2DViewCB);
                break;
            case "100percent":
                __ZOOMSCALE = 1;
                _refreshPDF(pageNo, _load2DViewCB);
                break;
            case "75percent":
                __ZOOMSCALE = 0.75;
                _refreshPDF(pageNo, _load2DViewCB);
                break;
            case "50percent":
                __ZOOMSCALE = 0.5;
                _refreshPDF(pageNo, _load2DViewCB);
                break;
            case "25percent":
                __ZOOMSCALE = 0.25;
                _refreshPDF(pageNo, _load2DViewCB);
                break;
            default:
                console.log("Requested Page Mode is not supported");
        }
    }
    
    function _getLargestPageWidth() {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var width = 0;
        for (var i = 0; i < canvasWrapper.childNodes.length; i++){
            if (canvasWrapper.childNodes[i].width > width) {
                width = canvasWrapper.childNodes[i].width;
            }
        }
        return width;
    }
    
    function _getLargestPageHeight() {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var height = 0;
        for (var i = 0; i < canvasWrapper.childNodes.length; i++){
            if (canvasWrapper.childNodes[i].height > height) {
                height = canvasWrapper.childNodes[i].height;
            }
        }
        return height;
    }
    
    function _IsPDFSession() {
        var retVal = false;
        if (!_currentCanvasId=="") {
            retVal = _currentCanvasId.indexOf("_CreoViewDocumentCanvas") != -1 ? true : false ;
        }
        return retVal;
    }
    
    function _LoadPDF(val, callback) {
        if(_IsPDFSession() && val) {
            __ZOOMSCALE = 1;
            __CURRENT_PAGE = 1;
            var canvasWrapper = document.getElementById(_currentCanvasId);
            while(canvasWrapper.firstChild){
                canvasWrapper.removeChild(canvasWrapper.firstChild);
            }
            PDFJS.getDocument({ data: val }).then(function(pdf_doc) {
                __PDF_DOC = pdf_doc;
                __TOTAL_PAGES = __PDF_DOC.numPages;
                __PDF_DOC.getPage(1).then(function(pages){
                    handlePages(pages, function(val){
                        _setPageModePDF(1);
                        callback(val);
                    });
                });
            }).catch(function(error) {
                console.log("Javascript caught exception in showPDF : " + error.message);
                if (typeof callback === "function") callback(false);
            });
        }
    }
    
    function handlePages(page, callback) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var viewport = page.getViewport(__ZOOMSCALE);
        var canvas = _getPDFCanvas();
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render({canvasContext: canvas.getContext('2d'), viewport: viewport});
        canvasWrapper.appendChild(canvas);
        if (__PDF_DOC !== null && __CURRENT_PAGE < __TOTAL_PAGES){
            __CURRENT_PAGE += 1;
            __PDF_DOC.getPage(__CURRENT_PAGE).then(function(newPage){
                handlePages(newPage, callback);
            });
        } else if(__CURRENT_PAGE == __TOTAL_PAGES) {
            __CURRENT_PAGE = 1;
            canvasWrapper.style.minWidth = "100%"
            callback(true);
        }
    }
        
    function showPDF(val, callback) {
        PDFJS.getDocument({ data: val }).then(function (pdf_doc) {
            __PDF_DOC = pdf_doc;
            __TOTAL_PAGES = __PDF_DOC.numPages;
            showPage(1, callback);
        }).catch(function (error) {
            console.log("Javascript caught exception in showPDF : " + error.message);
            if (typeof callback === "function") callback(false);
        });
    }
    
    function showPage(page_no, callback) {
        __CURRENT_PAGE = page_no;
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var scrollToVal = 0;
        var temp = 0;
        for (var i = 0; i < page_no-1; i++) {
            var pagesPerLine = _getNoPagesPerLine(i+1);
            var pageHeight = canvasWrapper.childNodes[i].height + _marginSize;
            if (pageHeight > temp) {
                temp = pageHeight;
            }
            if (((i+1) % pagesPerLine) == 0){
                scrollToVal += temp;
                temp = 0;
            }
        }
        _ignoreScrollEvent = true;
        if(canvasWrapper.childNodes[0].style.display == "block"){
            scrollToVal += _marginSize;
        }
        canvasWrapper.parentNode.scrollTop = scrollToVal;
        callback(true);
    }
    
    function _getNoPagesPerLine(page_no) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        if (canvasWrapper.childNodes[0].style.display == "block") {
            return 1;
        }
        var wrapperWidth = canvasWrapper.clientWidth;
        var sum = 0;
        var count = 0;
        for (var i = 0; i < page_no; i++) {
            var page = canvasWrapper.childNodes[i];
            sum += page.width;
            count += 1;
            if (sum > wrapperWidth) {
                sum = page.width;
                count = 1;
            }
        }
        for (var j = page_no; j < canvasWrapper.childNodes.length; j++) {
            var page = canvasWrapper.childNodes[j];
            sum += page.width;
            if (sum > wrapperWidth) {
                break;
            }
            count += 1;
        }
        return count;
    }
    
    function _LoadPrevPage(callback) {
        if (__CURRENT_PAGE != 1)
            showPage(--__CURRENT_PAGE, callback);
    }
    
    function _LoadNextPage(callback) {
        if (__CURRENT_PAGE != __TOTAL_PAGES)
            showPage(++__CURRENT_PAGE, callback);
    }
    
    function _LoadPage(callback, pageNo) {
        if ((pageNo > 0) && (pageNo <=__TOTAL_PAGES))
            showPage(pageNo, callback);
    }
    
})();