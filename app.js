(function ($) {
    $.extend({
        urlGet: function () {
            var aQuery = window.location.href.split("?");  //取得Get参数
            var aGET = new Array();
            if (aQuery.length > 1) {
                var aBuf = aQuery[1].split("&");
                for (var i = 0, iLoop = aBuf.length; i < iLoop; i++) {
                    var aTmp = aBuf[i].split("=");  //分离key与Value
                    aGET[aTmp[0]] = aTmp[1];
                }
            }
            return aGET;
        }
    })
})(jQuery);

var tvModule = angular.module("ThingView", ['tree'])
    .constant('MODULE_VERSION', '0.0.1')
    .factory("factory", function () { });

tvModule.value('appName', 'ThingViewApp');

tvModule.controller("ThingViewController", function ($scope, $timeout, $interval, $rootScope) {
    //zhanghua
    $scope.hasTransitionButton = false;
    $scope.progress = 0;
    $scope.timer = null;
    $scope.delayApply = null;
    $scope.session = "";
    $scope.viewType;
    $scope.viewExtension = "";
    $scope.view3D = true;
    $scope.currentArrayBuffer = null;
    $scope.currentDocument = null;
    $scope.currentPageNo = 1;
    $scope.totalPageNo = 1;
    $scope.sessionId = "";
    $scope.model = { "url": "", "baseUrl": "", "templateUrl": "", "mapUrl": "", "getmarkupUrl": "" }
    $scope.viewLocation = { "position": { "x": 0.0, "y": 0.0, "z": 0.0 }, "orientation": { "x": 0.0, "y": 0.0, "z": 0.0 } };
    $scope.viewLocationSet = 'NO';
    $scope.viewStates = [];
    $scope.viewOrients = [];
    $scope.orthoProjection = false;
    $scope.viewablesModelDisplay = false;
    $scope.viewablesFiguresDisplay = false;
    $scope.viewablesDocumentsDisplay = false;
    $scope.modelLocation;
    $scope.annotationSets = [];
    $scope.annotationSetSelector = "";
    $scope.viewablesData = [];
    $scope.documentSelector = "";
    $scope.illustrations = [];
    $scope.loadedIllustration = "-";
    $scope.playall = false;
    $scope.itemslist = [];
    $scope.contextMenuType = "";
    $scope.showFeatureMarkups = true;
    $scope.showFeatureFaces = false;

    $scope.hasAnimation = false;
    $scope.hasSequence = false;

    $scope.isPDF = false;

    $scope.activePrimaryPane = "structure";
    $scope.activeSecondaryPane = "modelAnnotations";
    $scope.activeBottomPane = "properties";
    $scope.availableDataSets = [];
    $scope.availablePVSUrls = [];
    $scope.availableModels = [];
    $scope.pvsBaseUrl = "";
    $scope.pvsUrl = "";

    $scope.showPrimaryPane = 'YES';
    $scope.showSecondaryPane = 'NO';
    $scope.showBottomPane = 'NO';
    $scope.showBoundBoxInfo = 'NO';
    $scope.showOnlyGraphics = 'NO';

    $scope.defaultBoundDragOptUnsel = 0x000000F + 0x03F0000;    // TRANSLATE_ALL | RESIZE_FACE_ALL
    $scope.defaultBoundDragOptSel = 0x000000F + 0x0000070 + 0x0003F00; // TRANSLATE_ALL | ROTATE_ALL | RESIZE_ARROW_ALL

    $scope.selected;

    $scope.nextModelWidgetId = 1;
    $scope.modelWidgets = {};
    $scope.currentModelWidget = null;

    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    $scope.webglSettings = {
        'showGnomon': 'YES',
        'showSpinCenter': 'YES',
        'partSelection': 'YES',
        'modelSelection': 'YES',
        'structureEdit': 'NO',
        'dragMode': 'YES',
        'dragSnap': 'NO',
        'showFloor': 'NO',
        'showDropShadow': 'NO',
        'transparentFloor': 'NO',
        'doNotRoll': 'NO',
        'antiAliasing': iOS ? 'NO' : 'YES',
        'showProgress': 'YES',
        'enableCrossSiteAccess': 'NO',
        'removeModelsOnLoad': 'YES',
        'autoload': 'YES',
        'expandAncestors': 'NO',
        'decayrate': 0.0,
        'partselfillHexColor': '#0000FFBF',
        'partseloutlineHexColor': '#80FF00BF',
        'partpreselfillHexColor': '#800000BF',
        'partpreseloutlineHexColor': '#00FF00BF',
        'backgroundColorNum': 'TWO',
        'backgroundHexColor': '#FFFFFFFF',
        'backgroundTopHexColor': '#000000FF',
        // 'backgroundBottomHexColor':'#FFFFFFFF',
        'backgroundBottomHexColor': '#000000FF',
        'shapeFilters': 0x00300007,
        'selectionLogging': 'NO',
        'navMode': 'CreoView',
        'selectHighlightStyle': 'COLOR',
        'selectHighlightWidth': 5.0,
        'preSelectHighlightStyle': 'COLOR',
        'preSelectHighlightWidth': 5.0
    };
    $scope.webglSettingsLoaded = false;

    $scope.loadState = "";
    $scope.loadTime = 0;
    $scope.startTime = 0;
    $scope.nodeSelection = [];
    $scope.selection = [];
    $scope.featureSelection = {};
    $scope.lastSelIdpath = "";
    $scope.activeMenu = "home";
    $scope.ModelsMenuVisible = false;
    $scope.SettingsMenuVisible = false;
    $scope.markedComps;
    $scope.ibName = "";
    $scope.ibUrl = "";
    $scope.recentUrlDataSets = [];
    $scope.ccName = "";
    $scope.ccUrl = "";
    $scope.ccId = "";
    $scope.recentShapeSourceDataSets = [];

    $scope.partColorSelector = 0;
    $scope.backgroundColorNum = 'TWO';
    $scope.partSelectionFillColor = "#0000FFBF";//'RGBA(0,0,255,0.75)';    // 1
    $scope.partSelectionOutlineColor = "#80FF00BF";//'RGBA(128,255,0,0.75)';  // 2
    $scope.partPreselectionFillColor = "#800000BF";//'RGBA(128,0,0,0.75)';    // 3
    $scope.partPreselectionOutlineColor = "#00FF00BF";//'RGBA(0,255,0,0.75)';    // 4
    $scope.backgroundTopColor = "#000000FF";//'RGBA(0,0,0,1.0)';       // 5
    $scope.backgroundBottomColor = "#FFFFFFFF";//'RGBA(255,255,255,1.0)'; // 6
    $scope.backgroundColor = "#FFFFFFFF";//'RGBA(255,255,255,1.0)'; // 7

    $scope.selectHighlightStyle = "COLOR";
    $scope.preselectHighlightStyle = "COLOR";
    $scope.highlightSelectWidths = [
        {
            id: 1,
            label: '1px'
        },
        {
            id: 2,
            label: '2px'
        },
        {
            id: 3,
            label: '3px'
        },
        {
            id: 4,
            label: '4px'
        },
        {
            id: 5,
            label: '5px'
        },
        {
            id: 6,
            label: '6px'
        },
        {
            id: 7,
            label: '7px'
        },
        {
            id: 8,
            label: '8px'
        },
        {
            id: 9,
            label: '9px'
        },
        {
            id: 10,
            label: '10px'
        },
        {
            id: 11,
            label: '11px'
        },
        {
            id: 12,
            label: '12px'
        },
        {
            id: 13,
            label: '13px'
        },
        {
            id: 14,
            label: '14px'
        },
        {
            id: 15,
            label: '15px'
        },
        {
            id: 16,
            label: '16px'
        },
        {
            id: 17,
            label: '17px'
        },
        {
            id: 18,
            label: '18px'
        },
        {
            id: 19,
            label: '19px'
        },
        {
            id: 20,
            label: '20px'
        },
        {
            id: 21,
            label: '21px'
        },
        {
            id: 22,
            label: '22px'
        },
        {
            id: 23,
            label: '23px'
        },
        {
            id: 24,
            label: '24px'
        },
        {
            id: 25,
            label: '25px'
        },
    ];
    $scope.highlightSelectWidth = $scope.highlightSelectWidths[0];

    $scope.highlightPreSelectWidths = [
        {
            id: 1,
            label: '1px'
        },
        {
            id: 2,
            label: '2px'
        },
        {
            id: 3,
            label: '3px'
        },
        {
            id: 4,
            label: '4px'
        },
        {
            id: 5,
            label: '5px'
        },
        {
            id: 6,
            label: '6px'
        },
        {
            id: 7,
            label: '7px'
        },
        {
            id: 8,
            label: '8px'
        },
        {
            id: 9,
            label: '9px'
        },
        {
            id: 10,
            label: '10px'
        },
        {
            id: 11,
            label: '11px'
        },
        {
            id: 12,
            label: '12px'
        },
        {
            id: 13,
            label: '13px'
        },
        {
            id: 14,
            label: '14px'
        },
        {
            id: 15,
            label: '15px'
        },
        {
            id: 16,
            label: '16px'
        },
        {
            id: 17,
            label: '17px'
        },
        {
            id: 18,
            label: '18px'
        },
        {
            id: 19,
            label: '19px'
        },
        {
            id: 20,
            label: '20px'
        },
        {
            id: 21,
            label: '21px'
        },
        {
            id: 22,
            label: '22px'
        },
        {
            id: 23,
            label: '23px'
        },
        {
            id: 24,
            label: '24px'
        },
        {
            id: 25,
            label: '25px'
        },
    ];
    $scope.highlightPreSelectWidth = $scope.highlightPreSelectWidths[0];

    $scope.layers = [];
    $scope.selectedLayer = undefined;
    $scope.layerTarget = undefined;
    $scope.layerTargetText = "";

    $scope.boundWidgets = [];
    $scope.currentBoundWidget = null;

    $scope.boxCalculation = "";
    $scope.sphereCalculation = "";

    $scope.inputbbox = 'NO';
    $scope.inputbboxminx = "0";
    $scope.inputbboxminy = "0";
    $scope.inputbboxminz = "0";
    $scope.inputbboxmaxx = "1";
    $scope.inputbboxmaxy = "1";
    $scope.inputbboxmaxz = "1";
    $scope.bboxcheck = 'NO';
    $scope.bbox00 = "Min";
    $scope.bbox01 = "X";
    $scope.bbox02 = "Y";
    $scope.bbox03 = "Z";
    $scope.bbox10 = "Max";
    $scope.bbox11 = "X";
    $scope.bbox12 = "Y";
    $scope.bbox13 = "Z";

    $scope.inputbsphere = 'NO';
    $scope.inputbsphereminx = "0";
    $scope.inputbsphereminy = "0";
    $scope.inputbsphereminz = "0";
    $scope.inputbspheremaxx = "1";
    $scope.inputbspheremaxy = "1";
    $scope.inputbspheremaxz = "1";
    $scope.bsphere00 = "Min";
    $scope.bsphere01 = "X";
    $scope.bsphere02 = "Y";
    $scope.bsphere03 = "Z";
    $scope.bsphere10 = "Max";
    $scope.bsphere11 = "X";
    $scope.bsphere12 = "Y";
    $scope.bsphere13 = "Z";

    $scope.groupName = "TestGroup";
    $scope.propName = "TestProperty";
    $scope.setPropertyResult = ""
    $scope.getPropertyResult = ""
    $scope.findPropertyResult = "";
    $scope.foundIds = [];
    $scope.instList = [];
    $scope.instanceProperties = [];
    $scope.propertyNames = [];
    $scope.instanceSelector = "";
    $scope.instanceName = "";

    $scope.partLocation = {};
    $scope.locationOverride = "NO";

    $scope.viewOrientationStatus = "-";
    $scope.viewOrienX = "-30";
    $scope.viewOrienY = "45";
    $scope.viewOrienZ = "0";

    $scope.visibilityCheck = "YES";
    $scope.visibilityOverride = "NO";

    $scope.jsonMessage = [];
    $scope.uidMap = {};
    $scope.idpathMap = {};
    $scope.treeObserver = null;

    $scope.dialogId = "";
    $scope.dialogTitleId = "";
    $scope.firstStep = false;
    $scope.lastStep = false;
    $scope.curSequenceStep = null;
    $scope.curSequenceStepPosition = null;
    $scope.curSequenceStepState = null;
    $scope.sequenceStep = 1;

    $scope.animationSpeed = 1.0;

    $scope.zoomScale = "0.2";

    $scope.navigation = ["CreoView", "Creo", "CATIA V5-Compatible", "Explore"];

    $scope.orientPreset = { name: '', orient: undefined };
    $scope.orientPresets = [{
        name: 'ISO1'
    }, {
        name: 'ISO2'
    }, {
        name: 'Top'
    }, {
        name: 'Bottom'
    }, {
        name: 'Left'
    }, {
        name: 'Right'
    }, {
        name: 'Front'
    }, {
        name: 'Back'
    }];
    $scope.orientations = $scope.orientPresets.concat($scope.viewOrients);

    $scope.modelOrientPreset = '';
    $scope.modelOrientations = ['X', '-X', 'Y', '-Y', 'Z', '-Z'];

    $scope.pageModePreset = '';
    $scope.pageModes = ['Original', 'Fit Page', 'Fit Width', '500%', '250%', '200%', '100%', '75%', '50%', '25%'];

    $scope.showSpinner = false;
    $scope.webglVersion = "";

    // Leader Line
    $scope.leaderlines = [];
    $scope.nextLeaderlineId = 1;
    $scope.creatingLeaderLine = false;
    $scope.leaderlineBbox = {};
    $scope.leaderlineMouseDownX;
    $scope.leaderlineMouseDownY;
    $scope.leaderlineTouchValid = false;
    $scope.leaderlineMouseDownTime;
    $scope.leaderlineJitterLimit = 3;
    $scope.leaderlineTimeLimit = 200;
    $scope.shadowLeaderLine = null;
    $scope.currentLeaderLinePoints = [];
    $scope.currentLeaderLine = null;
    $scope.currentLeaderLineSegment = null;
    $scope.currentLeaderLineColor = "#FF0000";//'RGB(255,0,0)';
    $scope.leaderLineWidths = [{
        id: 1,
        label: '1px'
    }, {
        id: 2,
        label: '2px'
    }, {
        id: 3,
        label: '3px'
    }, {
        id: 4,
        label: '4px'
    }, {
        id: 5,
        label: '5px'
    }, {
        id: 6,
        label: '6px'
    }];
    $scope.leaderLineWidth = $scope.leaderLineWidths[0];
    $scope.leaderLineStyles = [{
        id: 1,
        label: 'Solid'
    }, {
        id: 2,
        label: 'Hidden Line'
    }, {
        id: 3,
        label: 'Long Dash Dot'
    }, {
        id: 4,
        label: 'Center Line'
    }, {
        id: 5,
        label: 'Four Dot Break'
    }, {
        id: 6,
        label: 'Dashed'
    }, {
        id: 7,
        label: 'Dash Dash Dash'
    }, {
        id: 8,
        label: 'Dotted'
    }, {
        id: 9,
        label: 'Dot Dot Dot'
    }, {
        id: 10,
        label: 'Dash Dot Dash'
    }, {
        id: 11,
        label: 'Dot Dash'
    }, {
        id: 12,
        label: 'Dot Dot Dash'
    }];
    $scope.leaderLineStyle = $scope.leaderLineStyles[0];
    $scope.leaderLineEndCaps = [{
        id: 1,
        label: 'None'
    }, {
        id: 2,
        label: 'Point'
    }, {
        id: 3,
        label: 'Round'
    }];
    $scope.leaderLineHead = $scope.leaderLineEndCaps[0];
    $scope.leaderLineTail = $scope.leaderLineEndCaps[0];

    $scope.spatialFilterItemsIncluded = "YES";
    $scope.spatialFilterLocalTo = "Box";
    $scope.spatialFilterSearchMode = "Quick";
    $scope.spatialFilterResult = {};
    $scope.spatialFilterResult.query = {};
    $scope.spatialFilterResult.filteredItemsNum = 0;
    $scope.spatialFilterResult.filteredItems = [];

    $scope.radialButtonStatus = {
        level: "NONE",  // "PARENT" , "CHILD"
        group: 0        // 1, 2 ...
    };
    $scope.radialLTMenu = [ // Left-Top radial buttons
        // Zoom
        { pid: '1', imgSrc: './icons/page_zoom_large.png', title: 'Zoom' },
        { pid: '1', cid: '1', imgSrc: './icons/zoom_all.png', title: 'Zoom All' },
        { pid: '1', cid: '2', imgSrc: './icons/zoom_selected.png', title: 'Zoom Selected' },
        { pid: '1', cid: '3', imgSrc: './icons/zoom_window.png', title: 'Zoom Window' },
        { pid: '1', cid: '4', imgSrc: './icons/cancel_large.png', title: 'Cancel' },

        // Visibility
        { pid: '2', imgSrc: './icons/show_large.png', title: 'Visibility' },
        { pid: '2', cid: '1', imgSrc: './icons/unhide_all_large.png', title: 'Show All' },
        { pid: '2', cid: '2', imgSrc: './icons/isolate_selected_large.png', title: 'Isolate Selected' },
        { pid: '2', cid: '3', imgSrc: './icons/hide_selected_large.png', title: 'Hide Selected' },
        { pid: '2', cid: '4', imgSrc: './icons/cancel_large.png', title: 'Cancel' },

        // Orientation
        { pid: '3', imgSrc: './icons/name_view_list_large.png', title: 'Orientation' },
        { pid: '3', cid: '1', imgSrc: './icons/iso1.png', desc: 'ISO 1' },
        { pid: '3', cid: '2', imgSrc: './icons/iso2.png', desc: 'ISO 2' },
        { pid: '3', cid: '3', imgSrc: './icons/top_view.png', desc: 'Top' },
        { pid: '3', cid: '4', imgSrc: './icons/bottom_view.png', desc: 'Bottom' },
        { pid: '3', cid: '5', imgSrc: './icons/left_view.png', desc: 'Left' },
        { pid: '3', cid: '6', imgSrc: './icons/right_view.png', desc: 'Right' },
        { pid: '3', cid: '7', imgSrc: './icons/front_view.png', desc: 'Front' },
        { pid: '3', cid: '8', imgSrc: './icons/back_view.png', desc: 'Back' },
        { pid: '3', cid: '9', imgSrc: './icons/cancel_large.png', title: 'Cancel' }
    ];
    $scope.radialLTButtonsNum = 3; // Max 4
    $scope.radialLTGroupButtonsNum = [4, 4, 9];

    $scope.$watch('currentLeaderLineColor', function () {
        if ($scope.creatingLeaderLine)
            $scope.ResetShadowLeaderLine();
    });

    $scope.$watch('orientPreset', function () {
        if (Module.OrientPreset === undefined)
            return;

        if ($scope.orientPreset.orient != undefined) {
            $scope.session.ApplyOrientation($scope.orientPreset.orient, 1000.0);
            $scope.GetViewLocation();
            $scope.orientPreset = { name: '', orient: undefined };
        } else {
            if ($scope.orientPreset.name != "") {
                var preset = "";
                if ($scope.orientPreset.name == 'ISO1')
                    preset = Module.OrientPreset.ORIENT_ISO1;
                else if ($scope.orientPreset.name == 'ISO2')
                    preset = Module.OrientPreset.ORIENT_ISO2;
                else if ($scope.orientPreset.name == 'Top')
                    preset = Module.OrientPreset.ORIENT_TOP;
                else if ($scope.orientPreset.name == 'Bottom')
                    preset = Module.OrientPreset.ORIENT_BOTTOM;
                else if ($scope.orientPreset.name == 'Left')
                    preset = Module.OrientPreset.ORIENT_LEFT;
                else if ($scope.orientPreset.name == 'Right')
                    preset = Module.OrientPreset.ORIENT_RIGHT;
                else if ($scope.orientPreset.name == 'Front')
                    preset = Module.OrientPreset.ORIENT_FRONT;
                else if ($scope.orientPreset.name == 'Back')
                    preset = Module.OrientPreset.ORIENT_BACK;

                if (preset !== "") {
                    $scope.session.ApplyOrientPreset(preset, 1000.0);
                    $scope.GetViewLocation();
                    $scope.orientPreset = { name: '', orient: undefined };
                }
            }
        }
    });

    $scope.SetModelUpDirection = function () {
        if ($scope.currentModelWidget) {
            $scope.currentModelWidget.SetUpDirection($scope.modelOrientPreset, 0.0);
            $scope.ResizeFloor();
        }
    };

    $scope.$watch('webglSettings.dragSnap', function () {
        if ($scope.session) {
            $scope.session.SetDragSnap($scope.webglSettings.dragSnap == 'YES');
            $scope.SaveWebglSettings('dragSnap');
        }
    });

    $scope.$watch('webglSettings.dragMode', function () {
        if ($scope.session) {
            if ($scope.webglSettings.dragMode == "YES")
                $scope.session.SetDragMode(Module.DragMode.DRAG);
            else
                $scope.session.SetDragMode(Module.DragMode.NONE);
            $scope.SaveWebglSettings('dragMode');
        }
    });

    $scope.$watch('webglSettings.partSelection', function () {
        if ($scope.session) {
            $scope.session.AllowPartSelection($scope.webglSettings.partSelection == 'YES');
            $scope.HideModelLocationRibbon();
            $scope.SaveWebglSettings('partSelection');
        }
    });

    $scope.$watch('webglSettings.modelSelection', function () {
        if ($scope.session) {
            $scope.session.AllowModelSelection($scope.webglSettings.modelSelection == 'YES');
            $scope.HideModelLocationRibbon();
            $scope.SaveWebglSettings('modelSelection');
        }
    });

    $scope.$watch('webglSettings.structureEdit', function () {
        if ($scope.session) {
            $scope.SaveWebglSettings('structureEdit');
        }
    });


    $scope.$watch('webglSettings.showGnomon', function () {
        if ($scope.session) {
            $scope.session.ShowGnomon($scope.webglSettings.showGnomon == 'YES');
            $scope.SaveWebglSettings('showGnomon');
        }
    });

    $scope.$watch('webglSettings.showSpinCenter', function () {
        if ($scope.session) {
            $scope.session.ShowSpinCenter($scope.webglSettings.showSpinCenter == 'YES');
            $scope.SaveWebglSettings('showSpinCenter');
        }
    });

    $scope.$watch('webglSettings.enableCrossSiteAccess', function () {
        if ($scope.session) {
            $scope.session.EnableCrossSiteAccess($scope.webglSettings.enableCrossSiteAccess == 'YES');
            $scope.SaveWebglSettings('enableCrossSiteAccess');
        }
    });

    $scope.$watch('webglSettings.removeModelsOnLoad', function () {
        if ($scope.session) {
            $scope.SaveWebglSettings('removeModelsOnLoad');
        }
    });

    $scope.$watch('webglSettings.autoload', function () {
        if ($scope.session) {
            $scope.SaveWebglSettings('autoload');
        }
    });

    $scope.$watch('webglSettings.expandAncestors', function () {
        if ($scope.session) {
            $scope.SaveWebglSettings('expandAncestors');
        }
    });

    $scope.$watch('webglSettings.decayrate', function () {
        if ($scope.session) {
            $scope.SaveWebglSettings('decayrate');
        }
    });

    $scope.$watch('webglSettings.backgroundColorNum', function () {
        if ($scope.session) {
            $scope.SaveWebglSettings('backgroundColorNum');
        }
    });

    $scope.$watch('webglSettings.selectionLogging', function () {
        if ($scope.session) {
            $scope.SaveWebglSettings('selectionLogging');
        }
    });

    $scope.$watch('webglSettings.showFloor', function () {
        if ($scope.session) {
            $scope.ResizeFloor();
            $scope.SaveWebglSettings('showFloor');
        }
    });

    $scope.$watch('webglSettings.transparentFloor', function () {
        if ($scope.session) {
            $scope.ResizeFloor();
            $scope.SaveWebglSettings('transparentFloor');
        }
    });

    $scope.$watch('webglSettings.showDropShadow', function () {
        if ($scope.session) {
            var shadow_itensity = 0.5;
            if ($scope.webglSettings.showDropShadow == 'YES')
                $scope.session.SetShadowMode(Module.ShadowMode.SOFT_DROP_SHADOW, shadow_itensity);
            else
                $scope.session.SetShadowMode(Module.ShadowMode.OFF, shadow_itensity);
            $scope.ResizeFloor();
            $scope.SaveWebglSettings('showDropShadow');
        }
    });

    $scope.$watch('webglSettings.doNotRoll', function () {
        if ($scope.session) {
            $scope.session.SetDoNotRoll($scope.webglSettings.doNotRoll == 'YES');
            if ($scope.webglSettings.doNotRoll == 'YES')
                $scope.SetViewOrientation();
            $scope.SaveWebglSettings('doNotRoll');
        }
    });

    $scope.$watch('webglSettings.antiAliasing', function () {
        if ($scope.session) {
            if ($scope.webglSettings.antiAliasing == "YES")
                $scope.session.SetAntialiasingMode(Module.AntialiasingMode.SS4X);
            else
                $scope.session.SetAntialiasingMode(Module.AntialiasingMode.NONE);
            $scope.SaveWebglSettings('antiAliasing');
        }
    });

    $scope.$watch('webglSettings.showProgress', function () {
        if ($scope.session) {
            if ($scope.webglSettings.showProgress == "YES")
                $scope.session.ShowProgress(true);
            else
                $scope.session.ShowProgress(false);
            $scope.SaveWebglSettings('showProgress');
        }
    });

    $scope.$watch('webglSettings.navMode', function () {
        if ($scope.session) {
            $scope.SetNavigationMode($scope.webglSettings.navMode);
            $scope.SaveWebglSettings('navMode');
        }
    });

    $scope.$watch('bboxcheck', function () {
        if ($scope.bboxcheck == 'YES') {
            $scope.bbox00 = "Center";
            $scope.bbox01 = "X";
            $scope.bbox02 = "Y";
            $scope.bbox03 = "Z";
            $scope.bbox10 = "Length";
            $scope.bbox11 = "X";
            $scope.bbox12 = "Y";
            $scope.bbox13 = "Z";

            $scope.bsphere00 = "Center";
            $scope.bsphere01 = "X";
            $scope.bsphere02 = "Y";
            $scope.bsphere03 = "Z";
            $scope.bsphere10 = "Radius";
            $scope.bsphere11 = "";
            $scope.bsphere12 = "";
            $scope.bsphere13 = "";

            document.getElementById("inputbsphere12").disabled = true;
            document.getElementById("inputbsphere13").disabled = true;
        } else { // 'NO'
            $scope.bbox00 = "Min";
            $scope.bbox01 = "X";
            $scope.bbox02 = "Y";
            $scope.bbox03 = "Z";
            $scope.bbox10 = "Max";
            $scope.bbox11 = "X";
            $scope.bbox12 = "Y";
            $scope.bbox13 = "Z";

            $scope.bsphere00 = "Min";
            $scope.bsphere01 = "X";
            $scope.bsphere02 = "Y";
            $scope.bsphere03 = "Z";
            $scope.bsphere10 = "Max";
            $scope.bsphere11 = "X";
            $scope.bsphere12 = "Y";
            $scope.bsphere13 = "Z";

            document.getElementById("inputbsphere12").disabled = false;
            document.getElementById("inputbsphere13").disabled = false;
        }
    });

    $scope.SetWebglSettings = function (setting) {
        $scope.webglSettingsLoaded = true;
        $scope.webglSettings[setting.key] = setting.value;

        if (setting.key.indexOf('Color') == -1) return;

        if (setting.key == 'partselfillHexColor') {
            $scope.partSelectionFillColor = setting.value;
        } else if (setting.key == 'partseloutlineHexColor') {
            $scope.partSelectionOutlineColor = setting.value;
        } else if (setting.key == 'partpreselfillHexColor') {
            $scope.partPreselectionFillColor = setting.value;
        } else if (setting.key == 'partpreseloutlineHexColor') {
            $scope.partPreselectionOutlineColor = setting.value;
        } else if (setting.key == 'backgroundHexColor') {
            $scope.backgroundColor = setting.value;
        } else if (setting.key == 'backgroundTopHexColor') {
            $scope.backgroundTopColor = setting.value;
        } else if (setting.key == 'backgroundBottomHexColor') {
            $scope.backgroundBottomColor = setting.value;
        } else if (setting.key == 'backgroundColorNum') {
            $scope.backgroundColorNum = setting.value;
        }
    }

    $scope.SaveWebglSettings = function (key) {
        if (dbWebglSettings == undefined) return;

        var value = $scope.webglSettings[key];
        if (value) {
            var store = dbWebglSettings.transaction("WebglSettingsObjectStore", "readwrite").objectStore("WebglSettingsObjectStore");
            store.put({ key: key, value: value });

            $scope.webglSettingsLoaded = true;
        }
    }

    $scope.ResetIndexedDBSettings = function () {
        var request = window.indexedDB.open("WebglSettingsDatabase", 1);
        request.onsuccess = function (event) {
            var tx = dbWebglSettings.transaction(["WebglSettingsObjectStore"], "readwrite");
            var store = tx.objectStore("WebglSettingsObjectStore");
            var req = store.clear();
            req.onerror = function (event) {
                console.log('Error deleting database - WebglSettingsDatabase.');
            };
            req.onsuccess = function (event) {
                alert('All settings in indexed DB are deleted.\nReload the page now.');
            };
        }
    }

    $scope.ResizeFloor = function () {
        if ($scope.session) {
            var floorsize = { w: 0, l: 0, pos: { x: 0.0, y: 0.0, z: 0.0 } };
            var bounds = $scope.session.GetWorldBoundingBox();
            if (bounds.valid) {
                var x = bounds.max.x - bounds.min.x;
                var y = bounds.max.y - bounds.min.y;
                var z = bounds.max.z - bounds.min.z;
                floorsize.w = x;
                floorsize.l = z;

                floorsize.pos.x = bounds.min.x + (x / 2);
                floorsize.pos.z = bounds.min.z + (z / 2);
                floorsize.pos.y = 0; // bounds.min.y + (y / 2);
                var floor_grid_color = 0x505050E0;
                var floor_plane_color = 0xE0E0E0E0;
                if ($scope.webglSettings.transparentFloor == 'YES') {
                    // set alpha value to 0 for transparency effect
                    floor_grid_color = 0x50505000;
                    floor_plane_color = 0xE0E0E000;
                }
                // increase floor size to cover shadow effect (mainly on the outline of the model)
                if ($scope.webglSettings.showDropShadow == 'YES') {
                    floorsize.w = floorsize.w * 1.03;
                    floorsize.l = floorsize.l * 1.03;
                }
                $scope.session.ShowFloorWithSize($scope.webglSettings.showFloor == 'YES', floorsize.w, floorsize.l, floorsize.pos, floor_grid_color, floor_plane_color);
            }
        }
    }

    $scope.UpdateModelsList = function () {
        $scope.availableModels = [];

        $scope.availableDataSets.forEach(function (data) {
            $scope.availableModels.push(data);
        });
        $scope.availablePVSUrls.forEach(function (data) {
            $scope.availableModels.push(data);
        });
    }

    $scope.LoadAvailableModel = function (model) {
        if (model.id) {
            $scope.LoadFromIndexDb(model.id);
        } else if (model.name) {
            $scope.LoadPVS(model.name);
        }

        $scope.UpdateModelsList();
    }

    $scope.DeleteAvailableModel = function (event, model) {
        if (model.id) {
            $scope.DeleteFromIndexDb(event, model.id);
        } else if (model.name) {
            $scope.DeleteUrlFromIndexDb(event, model.name);
        }
    }

    $scope.LoadFromIndexDb = function (key) {
        $scope.ModelsMenuVisible = false;
        if (dbFileCache == undefined) return;
        dbFileCache.transaction("FileCacheObjectStore", "readwrite").objectStore("FileCacheObjectStore").openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                if (cursor.value.id == key) {
                    var updateData = cursor.value;
                    updateData.timestamp = Math.floor(Date.now() / 1000);

                    for (let i = 0; i < $scope.availableDataSets.length; i++) {
                        if ($scope.availableDataSets[i].id == key) {
                            $scope.availableDataSets[i].timestamp = updateData.timestamp;
                            break;
                        }
                    }

                    $scope.LoadModel(key, updateData.name);
                    cursor.update(updateData);
                    return;
                }

                cursor.continue();
            }
        };
    }

    $scope.DeleteFromIndexDb = function (event, key) {
        if (dbFileCache == undefined) return;
        var dataSet = dbFileCache.transaction("FileCacheObjectStore", "readwrite").objectStore("FileCacheObjectStore").delete(key);
        dataSet.onsuccess = function (event) {
            $scope.SafeApply(function () {
                for (let i = 0; i < $scope.availableDataSets.length; i++) {
                    if ($scope.availableDataSets[i].id == key) {
                        $scope.availableDataSets.splice(i, 1);
                        $scope.UpdateModelsList();
                        break;
                    }
                }
            });
        }

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    $scope.DeleteAllIndexDb = function () {
        var req = window.indexedDB.deleteDatabase("FileCacheDatabase");
        req.onsuccess = function () {
            console.log("Deleted database successfully");
        };
        req.onerror = function () {
            console.log("Couldn't delete database");
        };
        req.onblocked = function () {
            console.log("Couldn't delete database due to the operation being blocked");
        };
        $scope.availableDataSets = [];
    }

    $scope.DeleteUrlFromIndexDb = function (event, key) {
        if (dbRecentPVSURL == undefined) return;
        var dataSet = dbRecentPVSURL.transaction("RecentPVSURLObjectStore", "readwrite").objectStore("RecentPVSURLObjectStore").delete(key);
        dataSet.onsuccess = function (event) {
            $scope.SafeApply(function () {
                for (let i = 0; i < $scope.availablePVSUrls.length; i++) {
                    if ($scope.availablePVSUrls[i].name == key) {
                        $scope.availablePVSUrls.splice(i, 1);
                        $scope.UpdateModelsList();
                        break;
                    }
                }
            });
        }

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    $scope.ZoomView = function () {
        if (ThingView.IsSVGSession()) {
            ThingView.ResetTransformSVG();
        } else if (ThingView.IsPDFSession()) {
            ThingView.ResetTransformPDF();
        } else {
            $scope.session.ZoomView(Module.ZoomMode.ZOOM_ALL, 1000.0);
        }
    }
    $scope.ZoomSelected = function () {
        $scope.session.ZoomView(Module.ZoomMode.ZOOM_SELECTED, 1000.0);
    }
    $scope.ZoomWindow = function () {
        if (ThingView.IsSVGSession()) {
            ThingView.SetZoomWindow();
        } else {
            $scope.session.ZoomView(Module.ZoomMode.ZOOM_WINDOW, 1000.0);
        }
    }
    $scope.ZoomIn = function () {
        if (ThingView.IsSVGSession()) {
            ThingView.SetZoomOnButton(1 + Number($scope.zoomScale));
        } else if (ThingView.IsPDFSession()) {
            ThingView.SetZoomOnButton(1.2)
        } else {
            $scope.session.ApplyZoomScale(1.0 - Number($scope.zoomScale), 1000.0);
        }
    }
    $scope.ZoomOut = function () {
        if (ThingView.IsSVGSession()) {
            ThingView.SetZoomOnButton(1 - Number($scope.zoomScale));
        } else if (ThingView.IsPDFSession()) {
            ThingView.SetZoomOnButton(0.8)
        } else {
            $scope.session.ApplyZoomScale(1.0 + Number($scope.zoomScale), 1000.0);
        }
    }

    $scope.SetNavigationMode = function (navMode) {
        if (navMode == "CreoView")
            $scope.session.SetNavigationMode(Module.NavMode.CREO_VIEW);
        else if (navMode == "Creo")
            $scope.session.SetNavigationMode(Module.NavMode.CREO);
        else if (navMode == "CATIA V5-Compatible")
            $scope.session.SetNavigationMode(Module.NavMode.CATIA);
        else if (navMode == "Explore")
            $scope.session.SetNavigationMode(Module.NavMode.EXPLORE);
    }

    $scope.SetOrthographicView = function () {
        $scope.orthoProjection = true;
        if (!$scope.session.IsOrthographic())
            $scope.session.SetOrthographicProjection(1.0);
    }
    $scope.SetPerspectiveView = function () {
        $scope.orthoProjection = false;
        if (!$scope.session.IsPerspective())
            $scope.session.SetPerspectiveProjection(60.0);
    }

    $scope.GetProjectionMode = function () {
        $scope.SafeApply(function () {
            $scope.orthoProjection = $scope.session.IsOrthographic();
        });
    }

    $scope.HighlightPart = function (idpath) {
        if ($scope.currentModelWidget) {
            $scope.DeselectAll(Module.SelectType.PRESELECT);
            $scope.currentModelWidget.SelectPart(idpath, true, Module.SelectType.PRESELECT);
        }
    }
    $scope.DehighlightPart = function (idpath) {
        if ($scope.currentModelWidget) {
            $scope.currentModelWidget.SelectPart(idpath, false, Module.SelectType.PRESELECT);
        }
    }

    $scope.SelectAllParts = function () {
        if ($scope.currentModelWidget) {
            $scope.currentModelWidget.SelectAllParts();
        }
    }
    $scope.DeselectAll = function (selectType) {
        var keys = Object.keys($scope.modelWidgets);
        for (var i = 0; i < keys.length; i++) {
            var widget = $scope.modelWidgets[keys[i]];
            if (widget) {
                widget.DeselectAll(selectType);
            }
        }
    }

    $scope.ViewLocationKeyPressed = function (event) {
        if (event.keyCode == 13) { // Return key
            $scope.SetViewLocation();
        }
    }

    $scope.SetViewLocation = function () {
        var loc = new Object();
        loc.position = [];
        loc.position.x = parseFloat($scope.viewLocation.position.x);
        loc.position.y = parseFloat($scope.viewLocation.position.y);
        loc.position.z = parseFloat($scope.viewLocation.position.z);
        loc.orientation = [];
        loc.orientation.x = parseFloat($scope.viewLocation.orientation.x);
        loc.orientation.y = parseFloat($scope.viewLocation.orientation.y);
        loc.orientation.z = parseFloat($scope.viewLocation.orientation.z);
        loc.scale = [];
        loc.scale.x = 1.0;
        loc.scale.y = 1.0;
        loc.scale.z = 1.0;
        loc.size = [];
        loc.size.x = 1.0;
        loc.size.y = 1.0;
        loc.size.z = 1.0;
        loc.valid = true;
        $scope.session.SetViewLocation(loc);
        $scope.viewLocation = loc;
        $scope.viewLocationSet = "YES";
    }

    $scope.SetViewOrientation = function () {
        var orient = new Object();
        orient.x = parseFloat($scope.viewOrienX);
        orient.y = parseFloat($scope.viewOrienY);
        orient.z = parseFloat($scope.viewOrienZ);
        $scope.session.ApplyOrientation(orient, 1000.0);
        $scope.GetViewLocation();
    }

    $scope.SetViewState = function (viewStateName, viewStatePath) {
        $scope.currentDocument = null;
        $scope.currentModelWidget.LoadViewState(viewStateName, viewStatePath);
    }

    $scope.LoadSVGCB = function () {
        if ($scope.activeMenu != "home")
            $scope.activeMenu = "home";
        $scope.ApplyLoadSVGResult();
        ThingView.SetSVGCalloutCallback($scope.SVGCalloutCB);
    }

    $scope.SVGCalloutCB = function (calloutID) {
        if ($scope.itemslist.length > 0) {
            var calloutObj;
            var index;
            for (var i = 0; i < $scope.itemslist.length; i++) {
                if ($scope.itemslist[i].calloutId == calloutID) {
                    calloutObj = $scope.itemslist[i];
                    index = i;
                    break;
                }
            }
            if (calloutObj) {
                calloutObj['selected'] = !calloutObj['selected'];
                $scope.ToggleTableSelection(index);
            }
        }
    }

    $scope.ApplyLoadSVGResult = function () {
        var callouts = ThingView.GetCallouts();
        $scope.itemslist = [];
        if (callouts.length > 0) {
            for (var i = 0; i < callouts.length; i++) {
                var innerHTML = callouts[i].innerHTML;
                var obj = new Object();
                obj["calloutId"] = callouts[i].getAttribute("id");
                var label = callouts[i].getElementsByTagName("desc")[0].textContent;
                obj["label"] = label;
                var parts = ThingView.GetSVGParts(label);
                if (parts.length > 0) {
                    obj["nameTag"] = parts[0].getElementsByTagName("desc")[0].textContent;
                } else {
                    obj["nameTag"] = "";
                }
                obj["quantity"] = $scope.GetCalloutQuantity(callouts[i]);
                obj["selected"] = false;
                $scope.itemslist.push(obj);
            }
        }
    }

    $scope.GetCalloutQuantity = function (callout) {
        var i;
        var qty = 0;
        var paths = callout.getElementsByTagName("path");
        for (i = 0; i < paths.length; i++) {
            if (paths[i].getAttribute("stroke-dasharray")) {
                var x = paths[i].getAttribute("d").trim().split(/\s+|[A-Z]+|[a-z]+/);
                x = x.filter(function (value) {
                    return value != "";
                });
                qty += (x.length) / 4;
            }
        }
        if (qty < 1) {
            if (callout.innerHTML) {
                qty = (callout.innerHTML.match(/stroke-dasharray/g) || []).length;
            } else {
                var serialized = new XMLSerializer().serializeToString(callout);
                qty = (serialized.match(/stroke-dasharray/g) || []).length;
            }
        }
        if (qty < 1) {
            qty = 0;
            var polylines = callout.getElementsByTagName("polyline");
            for (i = 0; i < polylines.length; i++) {
                var points = polylines[i].getAttribute("points");
                qty += (points.trim().split(/\s+/).length) / 4;
            }
        }
        qty = qty < 1 ? 1 : qty;
        return qty;
    }

    $scope.LoadDocumentCB = function (loadStatus) {
        $scope.currentPageNo = ThingView.GetCurrentPDFPage();
        $scope.totalPageNo = ThingView.GetTotalPDFPages();
    }

    $scope.LoadPage = function (pageNo) {
        if (ThingView) {
            $scope.SafeApply(function () {
                ThingView.LoadPage($scope.LoadDocumentCB, Number(pageNo));
            });
        }
    }
    $scope.LoadPrevPage = function () {
        if (ThingView) {
            $scope.SafeApply(function () {
                ThingView.LoadPrevPage($scope.LoadDocumentCB);
            });
        }
    }

    $scope.LoadNextPage = function () {
        if (ThingView) {
            $scope.SafeApply(function () {
                ThingView.LoadNextPage($scope.LoadDocumentCB);
            });
        }
    }

    $scope.setPageModePDF = function (pageMode) {
        var pageModeStripped = "";
        switch (pageMode) {
            case "Original":
                pageModeStripped = "Original";
                break;
            case "Fit Page":
                pageModeStripped = "FitPage";
                break;
            case "Fit Width":
                pageModeStripped = "FitWidth";
                break;
            case "500%":
                pageModeStripped = "500percent";
                break;
            case "250%":
                pageModeStripped = "250percent";
                break;
            case "200%":
                pageModeStripped = "200percent";
                break;
            case "100%":
                pageModeStripped = "100percent";
                break;
            case "75%":
                pageModeStripped = "75percent";
                break;
            case "50%":
                pageModeStripped = "50percent";
                break;
            case "25%":
                pageModeStripped = "25percent";
                break;
        }
        if (pageModeStripped != "") {
            ThingView.SetPageModePDF(pageModeStripped);
        }
    }

    $scope.SetPanModePDF = function () {
        if (ThingView) {
            if (ThingView.IsPDFSession()) {
                ThingView.SetPanModePDF();
            }
        }
    }

    $scope.LoadDocument = function (viewable) {
        $scope.ResetSequenceStepInfo();
        $scope.currentDocument = viewable.humanReadableDisplayName;
        ThingView.LoadDocument(viewable, $scope.sessionId, $scope.currentModelWidget, function (loadStatus) {
            $scope.viewType = viewable.type;
            $scope.viewExtension = viewable.fileSource.substring(viewable.fileSource.lastIndexOf(".") + 1);
            $scope.view3D = false;
            if ($scope.viewType == Module.ViewableType.DOCUMENT) {
                if ($scope.viewExtension == "pdf") {
                    $scope.LoadDocumentCB(loadStatus);
                } else {
                    console.log("Document type not supported");
                }
            } else if ($scope.viewType == Module.ViewableType.ILLUSTRATION && loadStatus) {
                if ($scope.viewExtension == "svg") {
                    $scope.LoadSVGCB();
                } else {
                    console.log("Illustration type not supported");
                }
            } else {
                if (!loadStatus) {
                    console.log("LoadDocument failed.");
                }
            }
        });
        $scope.DelayedApply(10, function () {
            resizeBody();
        });
    }

    $scope.ShowDocumentTooltip = function (viewable) {
        //Currently do nothing
    }

    $scope.HideDocumentTooltip = function (viewable) {
        //Currently do nothing
    }

    $scope.SetDefaultView = function () {
        if ($scope.currentModelWidget) {
            $scope.currentDocument = null;
            $scope.RemoveAllBoundingMarker();
            $scope.RemoveLeaderlines();
            $scope.LoadIllustration();
            $scope.session.ShowFloor(false, 0x505050E0, 0xE0E0E0E0);
            $scope.session.RemoveAllCVMarkups(Module.CV_MARKUP_TYPES.CVMARKUPTYPE_ALL);
            $scope.session.RemoveSectionCut();
            $scope.currentModelWidget.ResetToPvkDefault();
            var idPathArr = new Module.VectorString();
            idPathArr.push_back('/');
            $scope.currentModelWidget.LoadParts(idPathArr, true, function (result) {
                if (result == true) {
                    $scope.session.ZoomView(Module.ZoomMode.ZOOM_ALL, 0);
                }
            });
        }
    }

    $scope.SetEmptyView = function () {
        if ($scope.currentModelWidget) {
            $scope.currentDocument = null;
            $scope.RemoveAllBoundingMarker();
            $scope.RemoveLeaderlines();
            $scope.LoadIllustration();
            $scope.session.ShowFloor(false, 0x505050E0, 0xE0E0E0E0);
            $scope.session.RemoveAllCVMarkups(Module.CV_MARKUP_TYPES.CVMARKUPTYPE_ALL);
            $scope.session.RemoveSectionCut();
            $scope.currentModelWidget.ResetToPvkDefault();
            $scope.currentModelWidget.RemoveAllShapeInstances();

            $scope.ClearNodeSelection();
        }
    }

    $scope.UnsetLocation = function (includeChildren) {
        if ($scope.currentModelWidget) {
            $scope.currentModelWidget.UnsetLocation(includeChildren);
        }
    }

    $scope.UnsetSelectedLocation = function (includeChildren) {
        if ($scope.currentModelWidget) {
            $scope.currentModelWidget.UnsetSelectedLocation();
        }
    }

    $scope.GetViewLocation = function () {
        var loc = $scope.session.GetViewLocation();
        $scope.viewLocation = loc;
        $scope.viewLocation.position.x = $scope.viewLocation.position.x.toFixed(6);
        $scope.viewLocation.position.y = $scope.viewLocation.position.y.toFixed(6);
        $scope.viewLocation.position.z = $scope.viewLocation.position.z.toFixed(6);

        $scope.viewLocation.orientation.x = $scope.viewLocation.orientation.x.toFixed(3);
        $scope.viewLocation.orientation.y = $scope.viewLocation.orientation.y.toFixed(3);
        $scope.viewLocation.orientation.z = $scope.viewLocation.orientation.z.toFixed(3);
    }

    $scope.GetPartLocation = function () {
        $scope.partLocation = {};
        if ($scope.instanceSelector.length != 1) return;

        var idPathArr = new Module.VectorString();
        var strippedIdpath = $scope.StripModelIdFromIdPath($scope.instanceSelector);
        idPathArr.push_back(strippedIdpath);
        if ($scope.currentModelWidget) {
            var locs = $scope.currentModelWidget.GetPartLocation(idPathArr);
            if (locs.size() == 1) {
                $scope.partLocation = locs.get(0);

                $scope.partLocation.position.x = $scope.partLocation.position.x.toFixed(6);
                $scope.partLocation.position.y = $scope.partLocation.position.y.toFixed(6);
                $scope.partLocation.position.z = $scope.partLocation.position.z.toFixed(6);

                $scope.partLocation.orientation.x = $scope.partLocation.orientation.x.toFixed(1);
                $scope.partLocation.orientation.y = $scope.partLocation.orientation.y.toFixed(1);
                $scope.partLocation.orientation.z = $scope.partLocation.orientation.z.toFixed(1);
            }
        }
    }

    $scope.UnsetPartLocation = function () {
        var idPathArr = new Module.VectorString();
        var strippedIdpath = $scope.StripModelIdFromIdPath($scope.instanceSelector);
        idPathArr.push_back(strippedIdpath);

        if ($scope.currentModelWidget) {
            $scope.currentModelWidget.UnsetPartLocation(idPathArr, $scope.locationOverride == 'YES');
            $scope.GetPartLocation();
        }
    }

    $scope.SetPartLocation = function () {
        if ($scope.currentModelWidget) {
            var locationArr = new Module.PartLocationVec();
            var location = new Object();

            location.idPath = $scope.partLocation.idPath;

            location.position = [];
            location.position.x = Number($scope.partLocation.position.x);
            location.position.y = Number($scope.partLocation.position.y);
            location.position.z = Number($scope.partLocation.position.z);

            location.orientation = [];
            location.orientation.x = Number($scope.partLocation.orientation.x);
            location.orientation.y = Number($scope.partLocation.orientation.y);
            location.orientation.z = Number($scope.partLocation.orientation.z);

            location.removeOverride = ($scope.visibilityOverride == 'YES');

            locationArr.push_back(location);

            $scope.currentModelWidget.SetPartLocation(locationArr);
            $scope.GetPartLocation();
        }
    }

    $scope.CalculateBoundingBox = function () {
        if ($scope.currentModelWidget) {
            var idPathArr = new Module.VectorString();
            var box = $scope.currentModelWidget.CalculateBoundingBox(idPathArr);
            if (box.valid) {
                $scope.boxCalculation = "Min:("
                    + box.min.x.toFixed(6).toString() + ", "
                    + box.min.y.toFixed(6).toString() + ", "
                    + box.min.z.toFixed(6).toString()
                    + ") Max:("
                    + box.max.x.toFixed(6).toString() + ", "
                    + box.max.y.toFixed(6).toString() + ", "
                    + box.max.z.toFixed(6).toString() + ")";
                $scope.inputbboxminx = box.min.x;
                $scope.inputbboxminy = box.min.y;
                $scope.inputbboxminz = box.min.z;
                $scope.inputbboxmaxx = box.max.x;
                $scope.inputbboxmaxy = box.max.y;
                $scope.inputbboxmaxz = box.max.z;
            } else {
                $scope.boxCalculation = "Error: Invalid result";

                $scope.inputbboxminx = "0";
                $scope.inputbboxminy = "0";
                $scope.inputbboxminz = "0";
                $scope.inputbboxmaxx = "1";
                $scope.inputbboxmaxy = "1";
                $scope.inputbboxmaxz = "1";
            }
        }
    }
    $scope.CalculateBoundingSphere = function () {
        if ($scope.currentModelWidget) {
            var idPathArr = new Module.VectorString();
            var sphere = $scope.currentModelWidget.CalculateBoundingSphere(idPathArr);
            if (sphere.valid) {
                $scope.sphereCalculation = "Center:("
                    + sphere.center.x.toFixed(6).toString() + ", "
                    + sphere.center.y.toFixed(6).toString() + ", "
                    + sphere.center.z.toFixed(6).toString()
                    + ") Radius:"
                    + sphere.radius.toFixed(6).toString();
                $scope.inputbsphereminx = sphere.center.x;
                $scope.inputbsphereminy = sphere.center.y;
                $scope.inputbsphereminz = sphere.center.z;
                $scope.inputbspheremaxx = sphere.radius;
                $scope.inputbspheremaxy = 1;
                $scope.inputbspheremaxz = 1;
            } else {
                $scope.sphereCalculation = "Error: Invalid result";

                $scope.inputbsphereminx = "0";
                $scope.inputbsphereminy = "0";
                $scope.inputbsphereminz = "0";
                $scope.inputbspheremaxx = "1";
                $scope.inputbspheremaxy = "1";
                $scope.inputbspheremaxz = "1";
            }
        }
    }

    $scope.SetDOUnselTranslate = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if (option == 'All') {
                if ($scope.currentBoundWidget.unselOptTranslate == 'YES') {
                    $scope.currentBoundWidget.unselOptTranslate = 'NO';
                    $scope.currentBoundWidget.unselOptTranslateX = 'NO';
                    $scope.currentBoundWidget.unselOptTranslateY = 'NO';
                    $scope.currentBoundWidget.unselOptTranslateZ = 'NO';
                    $scope.currentBoundWidget.unselOptTranslateP = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptTranslate = 'YES';
                    $scope.currentBoundWidget.unselOptTranslateX = 'YES';
                    $scope.currentBoundWidget.unselOptTranslateY = 'YES';
                    $scope.currentBoundWidget.unselOptTranslateZ = 'YES';
                    $scope.currentBoundWidget.unselOptTranslateP = 'YES';
                }
            } else if (option == 'X') {
                if ($scope.currentBoundWidget.unselOptTranslateX == 'YES') {
                    $scope.currentBoundWidget.unselOptTranslateX = 'NO';
                    $scope.currentBoundWidget.unselOptTranslate = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptTranslateX = 'YES';
                    if ($scope.currentBoundWidget.unselOptTranslateX == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateY == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateZ == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateP == 'YES')
                        $scope.currentBoundWidget.unselOptTranslate = 'YES';
                }
            } else if (option == 'Y') {
                if ($scope.currentBoundWidget.unselOptTranslateY == 'YES') {
                    $scope.currentBoundWidget.unselOptTranslateY = 'NO';
                    $scope.currentBoundWidget.unselOptTranslate = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptTranslateY = 'YES';
                    if ($scope.currentBoundWidget.unselOptTranslateX == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateY == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateZ == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateP == 'YES')
                        $scope.currentBoundWidget.unselOptTranslate = 'YES';
                }
            } else if (option == 'Z') {
                if ($scope.currentBoundWidget.unselOptTranslateZ == 'YES') {
                    $scope.currentBoundWidget.unselOptTranslateZ = 'NO';
                    $scope.currentBoundWidget.unselOptTranslate = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptTranslateZ = 'YES';
                    if ($scope.currentBoundWidget.unselOptTranslateX == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateY == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateZ == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateP == 'YES')
                        $scope.currentBoundWidget.unselOptTranslate = 'YES';
                }
            } else if (option == 'P') {
                if ($scope.currentBoundWidget.unselOptTranslateP == 'YES') {
                    $scope.currentBoundWidget.unselOptTranslateP = 'NO';
                    $scope.currentBoundWidget.unselOptTranslate = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptTranslateP = 'YES';
                    if ($scope.currentBoundWidget.unselOptTranslateX == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateY == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateZ == 'YES' &&
                        $scope.currentBoundWidget.unselOptTranslateP == 'YES')
                        $scope.currentBoundWidget.unselOptTranslate = 'YES';
                }
            }

            $scope.SetDragOptions(name);
        }
    }

    $scope.SetDOUnselRotate = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if (option == 'All') {
                if ($scope.currentBoundWidget.unselOptRotate == 'YES') {
                    $scope.currentBoundWidget.unselOptRotate = 'NO';
                    $scope.currentBoundWidget.unselOptRotateX = 'NO';
                    $scope.currentBoundWidget.unselOptRotateY = 'NO';
                    $scope.currentBoundWidget.unselOptRotateZ = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptRotate = 'YES';
                    $scope.currentBoundWidget.unselOptRotateX = 'YES';
                    $scope.currentBoundWidget.unselOptRotateY = 'YES';
                    $scope.currentBoundWidget.unselOptRotateZ = 'YES';
                }
            } else if (option == 'X') {
                if ($scope.currentBoundWidget.unselOptRotateX == 'YES') {
                    $scope.currentBoundWidget.unselOptRotateX = 'NO';
                    $scope.currentBoundWidget.unselOptRotate = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptRotateX = 'YES';
                    if ($scope.currentBoundWidget.unselOptRotateX == 'YES' &&
                        $scope.currentBoundWidget.unselOptRotateY == 'YES' &&
                        $scope.currentBoundWidget.unselOptRotateZ == 'YES')
                        $scope.currentBoundWidget.unselOptRotate = 'YES';
                }
            } else if (option == 'Y') {
                if ($scope.currentBoundWidget.unselOptRotateY == 'YES') {
                    $scope.currentBoundWidget.unselOptRotateY = 'NO';
                    $scope.currentBoundWidget.unselOptRotate = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptRotateY = 'YES';
                    if ($scope.currentBoundWidget.unselOptRotateX == 'YES' &&
                        $scope.currentBoundWidget.unselOptRotateY == 'YES' &&
                        $scope.currentBoundWidget.unselOptRotateZ == 'YES')
                        $scope.currentBoundWidget.unselOptRotate = 'YES';
                }
            } else if (option == 'Z') {
                if ($scope.currentBoundWidget.unselOptRotateZ == 'YES') {
                    $scope.currentBoundWidget.unselOptRotateZ = 'NO';
                    $scope.currentBoundWidget.unselOptRotate = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptRotateZ = 'YES';
                    if ($scope.currentBoundWidget.unselOptRotateX == 'YES' &&
                        $scope.currentBoundWidget.unselOptRotateY == 'YES' &&
                        $scope.currentBoundWidget.unselOptRotateZ == 'YES')
                        $scope.currentBoundWidget.unselOptRotate = 'YES';
                }
            }

            $scope.SetDragOptions(name);
        }
    }

    $scope.SetDOUnselArrow = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if (option == 'All') {
                if ($scope.currentBoundWidget.unselOptArrow == 'YES') {
                    $scope.currentBoundWidget.unselOptArrow = 'NO';
                    $scope.currentBoundWidget.unselOptArrowXP = 'NO';
                    $scope.currentBoundWidget.unselOptArrowYP = 'NO';
                    $scope.currentBoundWidget.unselOptArrowZP = 'NO';
                    $scope.currentBoundWidget.unselOptArrowXM = 'NO';
                    $scope.currentBoundWidget.unselOptArrowYM = 'NO';
                    $scope.currentBoundWidget.unselOptArrowZM = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptArrow = 'YES';
                    $scope.currentBoundWidget.unselOptArrowXP = 'YES';
                    $scope.currentBoundWidget.unselOptArrowYP = 'YES';
                    $scope.currentBoundWidget.unselOptArrowZP = 'YES';
                    $scope.currentBoundWidget.unselOptArrowXM = 'YES';
                    $scope.currentBoundWidget.unselOptArrowYM = 'YES';
                    $scope.currentBoundWidget.unselOptArrowZM = 'YES';
                }
            } else if (option == 'XP') {
                if ($scope.currentBoundWidget.unselOptArrowXP == 'YES') {
                    $scope.currentBoundWidget.unselOptArrowXP = 'NO';
                    $scope.currentBoundWidget.unselOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptArrowXP = 'YES';
                    if ($scope.currentBoundWidget.unselOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZM == 'YES')
                        $scope.currentBoundWidget.unselOptArrow = 'YES';
                }
            } else if (option == 'XM') {
                if ($scope.currentBoundWidget.unselOptArrowXM == 'YES') {
                    $scope.currentBoundWidget.unselOptArrowXM = 'NO';
                    $scope.currentBoundWidget.unselOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptArrowXM = 'YES';
                    if ($scope.currentBoundWidget.unselOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZM == 'YES')
                        $scope.currentBoundWidget.unselOptArrow = 'YES';
                }
            } else if (option == 'YP') {
                if ($scope.currentBoundWidget.unselOptArrowYP == 'YES') {
                    $scope.currentBoundWidget.unselOptArrowYP = 'NO';
                    $scope.currentBoundWidget.unselOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptArrowYP = 'YES';
                    if ($scope.currentBoundWidget.unselOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZM == 'YES')
                        $scope.currentBoundWidget.unselOptArrow = 'YES';
                }
            } else if (option == 'YM') {
                if ($scope.currentBoundWidget.unselOptArrowYM == 'YES') {
                    $scope.currentBoundWidget.unselOptArrowYM = 'NO';
                    $scope.currentBoundWidget.unselOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptArrowYM = 'YES';
                    if ($scope.currentBoundWidget.unselOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZM == 'YES')
                        $scope.currentBoundWidget.unselOptArrow = 'YES';
                }
            } else if (option == 'ZP') {
                if ($scope.currentBoundWidget.unselOptArrowZP == 'YES') {
                    $scope.currentBoundWidget.unselOptArrowZP = 'NO';
                    $scope.currentBoundWidget.unselOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptArrowZP = 'YES';
                    if ($scope.currentBoundWidget.unselOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZM == 'YES')
                        $scope.currentBoundWidget.unselOptArrow = 'YES';
                }
            } else if (option == 'ZM') {
                if ($scope.currentBoundWidget.unselOptArrowZM == 'YES') {
                    $scope.currentBoundWidget.unselOptArrowZM = 'NO';
                    $scope.currentBoundWidget.unselOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptArrowZM = 'YES';
                    if ($scope.currentBoundWidget.unselOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptArrowZM == 'YES')
                        $scope.currentBoundWidget.unselOptArrow = 'YES';
                }
            }

            $scope.SetDragOptions(name);
        }
    }

    $scope.SetDOUnselFace = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if (option == 'All') {
                if ($scope.currentBoundWidget.unselOptFace == 'YES') {
                    $scope.currentBoundWidget.unselOptFace = 'NO';
                    $scope.currentBoundWidget.unselOptFaceXP = 'NO';
                    $scope.currentBoundWidget.unselOptFaceYP = 'NO';
                    $scope.currentBoundWidget.unselOptFaceZP = 'NO';
                    $scope.currentBoundWidget.unselOptFaceXM = 'NO';
                    $scope.currentBoundWidget.unselOptFaceYM = 'NO';
                    $scope.currentBoundWidget.unselOptFaceZM = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptFace = 'YES';
                    $scope.currentBoundWidget.unselOptFaceXP = 'YES';
                    $scope.currentBoundWidget.unselOptFaceYP = 'YES';
                    $scope.currentBoundWidget.unselOptFaceZP = 'YES';
                    $scope.currentBoundWidget.unselOptFaceXM = 'YES';
                    $scope.currentBoundWidget.unselOptFaceYM = 'YES';
                    $scope.currentBoundWidget.unselOptFaceZM = 'YES';
                }
            } else if (option == 'XP') {
                if ($scope.currentBoundWidget.unselOptFaceXP == 'YES') {
                    $scope.currentBoundWidget.unselOptFaceXP = 'NO';
                    $scope.currentBoundWidget.unselOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptFaceXP = 'YES';
                    if ($scope.currentBoundWidget.unselOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZM == 'YES')
                        $scope.currentBoundWidget.unselOptFace = 'YES';
                }
            } else if (option == 'XM') {
                if ($scope.currentBoundWidget.unselOptFaceXM == 'YES') {
                    $scope.currentBoundWidget.unselOptFaceXM = 'NO';
                    $scope.currentBoundWidget.unselOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptFaceXM = 'YES';
                    if ($scope.currentBoundWidget.unselOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZM == 'YES')
                        $scope.currentBoundWidget.unselOptFace = 'YES';
                }
            } else if (option == 'YP') {
                if ($scope.currentBoundWidget.unselOptFaceYP == 'YES') {
                    $scope.currentBoundWidget.unselOptFaceYP = 'NO';
                    $scope.currentBoundWidget.unselOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptFaceYP = 'YES';
                    if ($scope.currentBoundWidget.unselOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZM == 'YES')
                        $scope.currentBoundWidget.unselOptFace = 'YES';
                }
            } else if (option == 'YM') {
                if ($scope.currentBoundWidget.unselOptFaceYM == 'YES') {
                    $scope.currentBoundWidget.unselOptFaceYM = 'NO';
                    $scope.currentBoundWidget.unselOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptFaceYM = 'YES';
                    if ($scope.currentBoundWidget.unselOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZM == 'YES')
                        $scope.currentBoundWidget.unselOptFace = 'YES';
                }
            } else if (option == 'ZP') {
                if ($scope.currentBoundWidget.unselOptFaceZP == 'YES') {
                    $scope.currentBoundWidget.unselOptFaceZP = 'NO';
                    $scope.currentBoundWidget.unselOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptFaceZP = 'YES';
                    if ($scope.currentBoundWidget.unselOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZM == 'YES')
                        $scope.currentBoundWidget.unselOptFace = 'YES';
                }
            } else if (option == 'ZM') {
                if ($scope.currentBoundWidget.unselOptFaceZM == 'YES') {
                    $scope.currentBoundWidget.unselOptFaceZM = 'NO';
                    $scope.currentBoundWidget.unselOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptFaceZM = 'YES';
                    if ($scope.currentBoundWidget.unselOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.unselOptFaceZM == 'YES')
                        $scope.currentBoundWidget.unselOptFace = 'YES';
                }
            }

            $scope.SetDragOptions(name);
        }
    }

    $scope.SetDOUnselPlanar = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if (option == 'All') {
                if ($scope.currentBoundWidget.unselOptPlanar == 'YES') {
                    $scope.currentBoundWidget.unselOptPlanar = 'NO';
                } else {
                    $scope.currentBoundWidget.unselOptPlanar = 'YES';
                }
            }

            $scope.SetDragOptions(name);
        }
    }

    $scope.SetDOSelTranslate = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if (option == 'All') {
                if ($scope.currentBoundWidget.selOptTranslate == 'YES') {
                    $scope.currentBoundWidget.selOptTranslate = 'NO';
                    $scope.currentBoundWidget.selOptTranslateX = 'NO';
                    $scope.currentBoundWidget.selOptTranslateY = 'NO';
                    $scope.currentBoundWidget.selOptTranslateZ = 'NO';
                    $scope.currentBoundWidget.selOptTranslateP = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptTranslate = 'YES';
                    $scope.currentBoundWidget.selOptTranslateX = 'YES';
                    $scope.currentBoundWidget.selOptTranslateY = 'YES';
                    $scope.currentBoundWidget.selOptTranslateZ = 'YES';
                    $scope.currentBoundWidget.selOptTranslateP = 'YES';
                }
            } else if (option == 'X') {
                if ($scope.currentBoundWidget.selOptTranslateX == 'YES') {
                    $scope.currentBoundWidget.selOptTranslateX = 'NO';
                    $scope.currentBoundWidget.selOptTranslate = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptTranslateX = 'YES';
                    if ($scope.currentBoundWidget.selOptTranslateX == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateY == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateZ == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateP == 'YES')
                        $scope.currentBoundWidget.selOptTranslate = 'YES';
                }
            } else if (option == 'Y') {
                if ($scope.currentBoundWidget.selOptTranslateY == 'YES') {
                    $scope.currentBoundWidget.selOptTranslateY = 'NO';
                    $scope.currentBoundWidget.selOptTranslate = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptTranslateY = 'YES';
                    if ($scope.currentBoundWidget.selOptTranslateX == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateY == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateZ == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateP == 'YES')
                        $scope.currentBoundWidget.selOptTranslate = 'YES';
                }
            } else if (option == 'Z') {
                if ($scope.currentBoundWidget.selOptTranslateZ == 'YES') {
                    $scope.currentBoundWidget.selOptTranslateZ = 'NO';
                    $scope.currentBoundWidget.selOptTranslate = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptTranslateZ = 'YES';
                    if ($scope.currentBoundWidget.selOptTranslateX == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateY == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateZ == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateP == 'YES')
                        $scope.currentBoundWidget.selOptTranslate = 'YES';
                }
            } else if (option == 'P') {
                if ($scope.currentBoundWidget.selOptTranslateP == 'YES') {
                    $scope.currentBoundWidget.selOptTranslateP = 'NO';
                    $scope.currentBoundWidget.selOptTranslate = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptTranslateP = 'YES';
                    if ($scope.currentBoundWidget.selOptTranslateX == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateY == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateZ == 'YES' &&
                        $scope.currentBoundWidget.selOptTranslateP == 'YES')
                        $scope.currentBoundWidget.selOptTranslate = 'YES';
                }
            }

            $scope.SetDragOptions(name);
        }
    }

    $scope.SetDOSelRotate = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if (option == 'All') {
                if ($scope.currentBoundWidget.selOptRotate == 'YES') {
                    $scope.currentBoundWidget.selOptRotate = 'NO';
                    $scope.currentBoundWidget.selOptRotateX = 'NO';
                    $scope.currentBoundWidget.selOptRotateY = 'NO';
                    $scope.currentBoundWidget.selOptRotateZ = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptRotate = 'YES';
                    $scope.currentBoundWidget.selOptRotateX = 'YES';
                    $scope.currentBoundWidget.selOptRotateY = 'YES';
                    $scope.currentBoundWidget.selOptRotateZ = 'YES';
                }
            } else if (option == 'X') {
                if ($scope.currentBoundWidget.selOptRotateX == 'YES') {
                    $scope.currentBoundWidget.selOptRotateX = 'NO';
                    $scope.currentBoundWidget.selOptRotate = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptRotateX = 'YES';
                    if ($scope.currentBoundWidget.selOptRotateX == 'YES' &&
                        $scope.currentBoundWidget.selOptRotateY == 'YES' &&
                        $scope.currentBoundWidget.selOptRotateZ == 'YES')
                        $scope.currentBoundWidget.selOptRotate = 'YES';
                }
            } else if (option == 'Y') {
                if ($scope.currentBoundWidget.selOptRotateY == 'YES') {
                    $scope.currentBoundWidget.selOptRotateY = 'NO';
                    $scope.currentBoundWidget.selOptRotate = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptRotateY = 'YES';
                    if ($scope.currentBoundWidget.selOptRotateX == 'YES' &&
                        $scope.currentBoundWidget.selOptRotateY == 'YES' &&
                        $scope.currentBoundWidget.selOptRotateZ == 'YES')
                        $scope.currentBoundWidget.selOptRotate = 'YES';
                }
            } else if (option == 'Z') {
                if ($scope.currentBoundWidget.selOptRotateZ == 'YES') {
                    $scope.currentBoundWidget.selOptRotateZ = 'NO';
                    $scope.currentBoundWidget.selOptRotate = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptRotateZ = 'YES';
                    if ($scope.currentBoundWidget.selOptRotateX == 'YES' &&
                        $scope.currentBoundWidget.selOptRotateY == 'YES' &&
                        $scope.currentBoundWidget.selOptRotateZ == 'YES')
                        $scope.currentBoundWidget.selOptRotate = 'YES';
                }
            }

            $scope.SetDragOptions(name);
        }
    }

    $scope.SetDOSelArrow = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if (option == 'All') {
                if ($scope.currentBoundWidget.selOptArrow == 'YES') {
                    $scope.currentBoundWidget.selOptArrow = 'NO';
                    $scope.currentBoundWidget.selOptArrowXP = 'NO';
                    $scope.currentBoundWidget.selOptArrowYP = 'NO';
                    $scope.currentBoundWidget.selOptArrowZP = 'NO';
                    $scope.currentBoundWidget.selOptArrowXM = 'NO';
                    $scope.currentBoundWidget.selOptArrowYM = 'NO';
                    $scope.currentBoundWidget.selOptArrowZM = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptArrow = 'YES';
                    $scope.currentBoundWidget.selOptArrowXP = 'YES';
                    $scope.currentBoundWidget.selOptArrowYP = 'YES';
                    $scope.currentBoundWidget.selOptArrowZP = 'YES';
                    $scope.currentBoundWidget.selOptArrowXM = 'YES';
                    $scope.currentBoundWidget.selOptArrowYM = 'YES';
                    $scope.currentBoundWidget.selOptArrowZM = 'YES';
                }
            } else if (option == 'XP') {
                if ($scope.currentBoundWidget.selOptArrowXP == 'YES') {
                    $scope.currentBoundWidget.selOptArrowXP = 'NO';
                    $scope.currentBoundWidget.selOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptArrowXP = 'YES';
                    if ($scope.currentBoundWidget.selOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZM == 'YES')
                        $scope.currentBoundWidget.selOptArrow = 'YES';
                }
            } else if (option == 'XM') {
                if ($scope.currentBoundWidget.selOptArrowXM == 'YES') {
                    $scope.currentBoundWidget.selOptArrowXM = 'NO';
                    $scope.currentBoundWidget.selOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptArrowXM = 'YES';
                    if ($scope.currentBoundWidget.selOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZM == 'YES')
                        $scope.currentBoundWidget.selOptArrow = 'YES';
                }
            } else if (option == 'YP') {
                if ($scope.currentBoundWidget.selOptArrowYP == 'YES') {
                    $scope.currentBoundWidget.selOptArrowYP = 'NO';
                    $scope.currentBoundWidget.selOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptArrowYP = 'YES';
                    if ($scope.currentBoundWidget.selOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZM == 'YES')
                        $scope.currentBoundWidget.selOptArrow = 'YES';
                }
            } else if (option == 'YM') {
                if ($scope.currentBoundWidget.selOptArrowYM == 'YES') {
                    $scope.currentBoundWidget.selOptArrowYM = 'NO';
                    $scope.currentBoundWidget.selOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptArrowYM = 'YES';
                    if ($scope.currentBoundWidget.selOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZM == 'YES')
                        $scope.currentBoundWidget.selOptArrow = 'YES';
                }
            } else if (option == 'ZP') {
                if ($scope.currentBoundWidget.selOptArrowZP == 'YES') {
                    $scope.currentBoundWidget.selOptArrowZP = 'NO';
                    $scope.currentBoundWidget.selOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptArrowZP = 'YES';
                    if ($scope.currentBoundWidget.selOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZM == 'YES')
                        $scope.currentBoundWidget.selOptArrow = 'YES';
                }
            } else if (option == 'ZM') {
                if ($scope.currentBoundWidget.selOptArrowZM == 'YES') {
                    $scope.currentBoundWidget.selOptArrowZM = 'NO';
                    $scope.currentBoundWidget.selOptArrow = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptArrowZM = 'YES';
                    if ($scope.currentBoundWidget.selOptArrowXP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZP == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowXM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowYM == 'YES' &&
                        $scope.currentBoundWidget.selOptArrowZM == 'YES')
                        $scope.currentBoundWidget.selOptArrow = 'YES';
                }
            }

            $scope.SetDragOptions(name);
        }
    }

    $scope.SetDOSelFace = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if (option == 'All') {
                if ($scope.currentBoundWidget.selOptFace == 'YES') {
                    $scope.currentBoundWidget.selOptFace = 'NO';
                    $scope.currentBoundWidget.selOptFaceXP = 'NO';
                    $scope.currentBoundWidget.selOptFaceYP = 'NO';
                    $scope.currentBoundWidget.selOptFaceZP = 'NO';
                    $scope.currentBoundWidget.selOptFaceXM = 'NO';
                    $scope.currentBoundWidget.selOptFaceYM = 'NO';
                    $scope.currentBoundWidget.selOptFaceZM = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptFace = 'YES';
                    $scope.currentBoundWidget.selOptFaceXP = 'YES';
                    $scope.currentBoundWidget.selOptFaceYP = 'YES';
                    $scope.currentBoundWidget.selOptFaceZP = 'YES';
                    $scope.currentBoundWidget.selOptFaceXM = 'YES';
                    $scope.currentBoundWidget.selOptFaceYM = 'YES';
                    $scope.currentBoundWidget.selOptFaceZM = 'YES';
                }
            } else if (option == 'XP') {
                if ($scope.currentBoundWidget.selOptFaceXP == 'YES') {
                    $scope.currentBoundWidget.selOptFaceXP = 'NO';
                    $scope.currentBoundWidget.selOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptFaceXP = 'YES';
                    if ($scope.currentBoundWidget.selOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZM == 'YES')
                        $scope.currentBoundWidget.selOptFace = 'YES';
                }
            } else if (option == 'XM') {
                if ($scope.currentBoundWidget.selOptFaceXM == 'YES') {
                    $scope.currentBoundWidget.selOptFaceXM = 'NO';
                    $scope.currentBoundWidget.selOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptFaceXM = 'YES';
                    if ($scope.currentBoundWidget.selOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZM == 'YES')
                        $scope.currentBoundWidget.selOptFace = 'YES';
                }
            } else if (option == 'YP') {
                if ($scope.currentBoundWidget.selOptFaceYP == 'YES') {
                    $scope.currentBoundWidget.selOptFaceYP = 'NO';
                    $scope.currentBoundWidget.selOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptFaceYP = 'YES';
                    if ($scope.currentBoundWidget.selOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZM == 'YES')
                        $scope.currentBoundWidget.selOptFace = 'YES';
                }
            } else if (option == 'YM') {
                if ($scope.currentBoundWidget.selOptFaceYM == 'YES') {
                    $scope.currentBoundWidget.selOptFaceYM = 'NO';
                    $scope.currentBoundWidget.selOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptFaceYM = 'YES';
                    if ($scope.currentBoundWidget.selOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZM == 'YES')
                        $scope.currentBoundWidget.selOptFace = 'YES';
                }
            } else if (option == 'ZP') {
                if ($scope.currentBoundWidget.selOptFaceZP == 'YES') {
                    $scope.currentBoundWidget.selOptFaceZP = 'NO';
                    $scope.currentBoundWidget.selOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptFaceZP = 'YES';
                    if ($scope.currentBoundWidget.selOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZM == 'YES')
                        $scope.currentBoundWidget.selOptFace = 'YES';
                }
            } else if (option == 'ZM') {
                if ($scope.currentBoundWidget.selOptFaceZM == 'YES') {
                    $scope.currentBoundWidget.selOptFaceZM = 'NO';
                    $scope.currentBoundWidget.selOptFace = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptFaceZM = 'YES';
                    if ($scope.currentBoundWidget.selOptFaceXP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZP == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceXM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceYM == 'YES' &&
                        $scope.currentBoundWidget.selOptFaceZM == 'YES')
                        $scope.currentBoundWidget.selOptFace = 'YES';
                }
            }

            $scope.SetDragOptions(name);
        }
    }

    $scope.SetDOSelPlanar = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if (option == 'All') {
                if ($scope.currentBoundWidget.selOptPlanar == 'YES') {
                    $scope.currentBoundWidget.selOptPlanar = 'NO';
                } else {
                    $scope.currentBoundWidget.selOptPlanar = 'YES';
                }
            }

            $scope.SetDragOptions(name);
        }
    }

    $scope.SetDragOptions = function (name) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            var unselOptions = 0;
            if ($scope.currentBoundWidget.unselOptTranslateX == 'YES') unselOptions |= 0x0000001;
            if ($scope.currentBoundWidget.unselOptTranslateY == 'YES') unselOptions |= 0x0000002;
            if ($scope.currentBoundWidget.unselOptTranslateZ == 'YES') unselOptions |= 0x0000004;
            if ($scope.currentBoundWidget.unselOptTranslateP == 'YES') unselOptions |= 0x0000008;

            if ($scope.currentBoundWidget.unselOptRotateX == 'YES') unselOptions |= 0x0000010;
            if ($scope.currentBoundWidget.unselOptRotateY == 'YES') unselOptions |= 0x0000020;
            if ($scope.currentBoundWidget.unselOptRotateZ == 'YES') unselOptions |= 0x0000040;

            if ($scope.currentBoundWidget.unselOptArrowXP == 'YES') unselOptions |= 0x0000100;
            if ($scope.currentBoundWidget.unselOptArrowXM == 'YES') unselOptions |= 0x0000200;
            if ($scope.currentBoundWidget.unselOptArrowYP == 'YES') unselOptions |= 0x0000400;
            if ($scope.currentBoundWidget.unselOptArrowYM == 'YES') unselOptions |= 0x0000800;
            if ($scope.currentBoundWidget.unselOptArrowZP == 'YES') unselOptions |= 0x0001000;
            if ($scope.currentBoundWidget.unselOptArrowZM == 'YES') unselOptions |= 0x0002000;

            if ($scope.currentBoundWidget.unselOptFaceXP == 'YES') unselOptions |= 0x0010000;
            if ($scope.currentBoundWidget.unselOptFaceXM == 'YES') unselOptions |= 0x0020000;
            if ($scope.currentBoundWidget.unselOptFaceYP == 'YES') unselOptions |= 0x0040000;
            if ($scope.currentBoundWidget.unselOptFaceYM == 'YES') unselOptions |= 0x0080000;
            if ($scope.currentBoundWidget.unselOptFaceZP == 'YES') unselOptions |= 0x0100000;
            if ($scope.currentBoundWidget.unselOptFaceZM == 'YES') unselOptions |= 0x0200000;

            if ($scope.currentBoundWidget.unselOptPlanar == 'YES') unselOptions |= 0x1000000;

            var selOptions = 0;
            if ($scope.currentBoundWidget.selOptTranslateX == 'YES') selOptions |= 0x0000001;
            if ($scope.currentBoundWidget.selOptTranslateY == 'YES') selOptions |= 0x0000002;
            if ($scope.currentBoundWidget.selOptTranslateZ == 'YES') selOptions |= 0x0000004;
            if ($scope.currentBoundWidget.selOptTranslateP == 'YES') selOptions |= 0x0000008;

            if ($scope.currentBoundWidget.selOptRotateX == 'YES') selOptions |= 0x0000010;
            if ($scope.currentBoundWidget.selOptRotateY == 'YES') selOptions |= 0x0000020;
            if ($scope.currentBoundWidget.selOptRotateZ == 'YES') selOptions |= 0x0000040;

            if ($scope.currentBoundWidget.selOptArrowXP == 'YES') selOptions |= 0x0000100;
            if ($scope.currentBoundWidget.selOptArrowXM == 'YES') selOptions |= 0x0000200;
            if ($scope.currentBoundWidget.selOptArrowYP == 'YES') selOptions |= 0x0000400;
            if ($scope.currentBoundWidget.selOptArrowYM == 'YES') selOptions |= 0x0000800;
            if ($scope.currentBoundWidget.selOptArrowZP == 'YES') selOptions |= 0x0001000;
            if ($scope.currentBoundWidget.selOptArrowZM == 'YES') selOptions |= 0x0002000;

            if ($scope.currentBoundWidget.selOptFaceXP == 'YES') selOptions |= 0x0010000;
            if ($scope.currentBoundWidget.selOptFaceXM == 'YES') selOptions |= 0x0020000;
            if ($scope.currentBoundWidget.selOptFaceYP == 'YES') selOptions |= 0x0040000;
            if ($scope.currentBoundWidget.selOptFaceYM == 'YES') selOptions |= 0x0080000;
            if ($scope.currentBoundWidget.selOptFaceZP == 'YES') selOptions |= 0x0100000;
            if ($scope.currentBoundWidget.selOptFaceZM == 'YES') selOptions |= 0x0200000;

            if ($scope.currentBoundWidget.selOptPlanar == 'YES') selOptions |= 0x1000000;

            $scope.currentBoundWidget.SetDragOptions(unselOptions, selOptions);
        }
    }

    $scope.GetDOParentLabelStyle = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if ($scope.currentBoundWidget[option] == 'YES') {
                return { 'background': '#6bc7f4' }
            } else {
                return { 'background': '#f2f2f2' }
            }
        }
    }

    $scope.GetDOChildLabelStyle = function (name, option) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if ($scope.currentBoundWidget[option] == 'YES') {
                return { 'background': '#B0E4FE' }
            } else {
                return { 'background': '#FFFFFF' }
            }
        }
    }

    $scope.UpdateDragOptions = function (widget) {
        if ($scope.defaultBoundDragOptUnsel & 0x000000F) {
            widget.unselOptTranslate = 'YES';
            widget.unselOptTranslateX = 'YES';
            widget.unselOptTranslateY = 'YES';
            widget.unselOptTranslateZ = 'YES';
            widget.unselOptTranslateP = 'YES';

        } else
            widget.unselOptTranslate = 'NO';

        if ($scope.defaultBoundDragOptUnsel & 0x0000070) {
            widget.unselOptRotate = 'YES';
            widget.unselOptRotateX = 'YES';
            widget.unselOptRotateY = 'YES';
            widget.unselOptRotateZ = 'YES';
        } else
            widget.unselOptRotate = 'NO';

        if ($scope.defaultBoundDragOptUnsel & 0x0003F00) {
            widget.unselOptArrow = 'YES';
            widget.unselOptArrowXP = 'YES';
            widget.unselOptArrowXM = 'YES';
            widget.unselOptArrowYP = 'YES';
            widget.unselOptArrowYM = 'YES';
            widget.unselOptArrowZP = 'YES';
            widget.unselOptArrowZM = 'YES';
        } else
            widget.unselOptArrow = 'NO';

        if ($scope.defaultBoundDragOptUnsel & 0x03F0000) {
            widget.unselOptFace = 'YES';
            widget.unselOptFaceXP = 'YES';
            widget.unselOptFaceXM = 'YES';
            widget.unselOptFaceYP = 'YES';
            widget.unselOptFaceYM = 'YES';
            widget.unselOptFaceZP = 'YES';
            widget.unselOptFaceZM = 'YES';
        } else
            widget.unselOptFace = 'NO';

        if ($scope.defaultBoundDragOptUnsel & 0x1000000)
            widget.unselOptPlanar = 'YES';
        else
            widget.unselOptPlanar = 'NO';

        if ($scope.defaultBoundDragOptSel & 0x000000F) {
            widget.selOptTranslate = 'YES';
            widget.selOptTranslateX = 'YES';
            widget.selOptTranslateY = 'YES';
            widget.selOptTranslateZ = 'YES';
            widget.selOptTranslateP = 'YES';
        } else
            widget.selOptTranslate = 'NO';

        if ($scope.defaultBoundDragOptSel & 0x0000070) {
            widget.selOptRotate = 'YES';
            widget.selOptRotateX = 'YES';
            widget.selOptRotateY = 'YES';
            widget.selOptRotateZ = 'YES';
        } else
            widget.selOptRotate = 'NO';

        if ($scope.defaultBoundDragOptSel & 0x0003F00) {
            widget.selOptArrow = 'YES';
            widget.selOptArrowXP = 'YES';
            widget.selOptArrowXM = 'YES';
            widget.selOptArrowYP = 'YES';
            widget.selOptArrowYM = 'YES';
            widget.selOptArrowZP = 'YES';
            widget.selOptArrowZM = 'YES';
        } else
            widget.selOptArrow = 'NO';

        if ($scope.defaultBoundDragOptSel & 0x03F0000) {
            widget.selOptFace = 'YES';
            widget.selOptFaceXP = 'YES';
            widget.selOptFaceXM = 'YES';
            widget.selOptFaceYP = 'YES';
            widget.selOptFaceYM = 'YES';
            widget.selOptFaceZP = 'YES';
            widget.selOptFaceZM = 'YES';
        } else
            widget.selOptFace = 'NO';

        if ($scope.defaultBoundDragOptSel & 0x1000000)
            widget.selOptPlanar = 'YES';
        else
            widget.selOptPlanar = 'NO';
    }

    $scope.FindBoundMarker = function (name) {
        for (var i = 0; i < $scope.boundWidgets.length; i++) {
            if (name == $scope.boundWidgets[i].name)
                return $scope.boundWidgets[i];
        }

        return undefined;
    }

    $scope.AddBoundMarker = function (widget, type) {
        widget.type = type;
        widget.selected = 'NO';
        var uid = $scope.session.AddBoundMarker(widget);
        widget.id = uid;
        widget.name = widget.id + widget.type;
        widget.selectable = true;

        $scope.boundWidgets.push(widget);
        $scope.currentBoundWidget = widget;
    }

    $scope.AddBoundingBox = function () {
        if ($scope.MyBoundClass == undefined) {
            $scope.CreateWidgetClasses();
        }

        if ($scope.currentModelWidget) {
            var idPathArr = new Module.VectorString();
            var box = $scope.currentModelWidget.CalculateBoundingBox(idPathArr);

            if (box.valid) {
                var widget = new $scope.MyBoundClass(Module.BoundType.BOX);
                widget.SetBoundingBoxBounds(box.min.x,
                    box.min.y,
                    box.min.z,
                    box.max.x,
                    box.max.y,
                    box.max.z);
                // 0x9999B380 : (R 153, G 153, B 179, A 128)
                widget.SetBoundingBoxColors(0x9999B380, 0x9999B380,
                    0x9999B380, 0x9999B380,
                    0x9999B380, 0x9999B380);
                widget.SetDragOptions($scope.defaultBoundDragOptUnsel,
                    $scope.defaultBoundDragOptSel);

                $scope.UpdateDragOptions(widget);

                $scope.AddBoundMarker(widget, "Box");
            } else {
                document.getElementById("bbox").disabled = true;
                document.getElementById("bsphere").disabled = true;
                $scope.inputbbox = 'YES';
            }
        }
    }
    $scope.CreateBoundingBox = function (create) {
        if (create) {
            var widget = new $scope.MyBoundClass(Module.BoundType.BOX);
            if ($scope.bboxcheck == 'YES') {
                widget.SetBoundingBoxPosition(Number($scope.inputbboxminx),
                    Number($scope.inputbboxminy),
                    Number($scope.inputbboxminz),
                    Number($scope.inputbboxmaxx),
                    Number($scope.inputbboxmaxy),
                    Number($scope.inputbboxmaxz));
            } else {
                widget.SetBoundingBoxBounds(Number($scope.inputbboxminx),
                    Number($scope.inputbboxminy),
                    Number($scope.inputbboxminz),
                    Number($scope.inputbboxmaxx),
                    Number($scope.inputbboxmaxy),
                    Number($scope.inputbboxmaxz));
            }

            widget.SetDragOptions($scope.defaultBoundDragOptUnsel,
                $scope.defaultBoundDragOptSel);

            $scope.UpdateDragOptions(widget);

            $scope.AddBoundMarker(widget, "Box");
        }

        document.getElementById("bbox").disabled = false;
        document.getElementById("bsphere").disabled = false;
        $scope.inputbbox = 'NO';
    }

    $scope.AddBoundingSphere = function () {
        if ($scope.MyBoundClass == undefined) {
            $scope.CreateWidgetClasses();
        }

        if ($scope.currentModelWidget) {
            var idPathArr = new Module.VectorString();
            var sphere = $scope.currentModelWidget.CalculateBoundingSphere(idPathArr);

            if (sphere.valid) {
                var widget = new $scope.MyBoundClass(Module.BoundType.SPHERE);
                widget.SetBoundingSpherePosition(sphere.center.x,
                    sphere.center.y,
                    sphere.center.z,
                    sphere.radius);
                // 0x9999B380 : (R 153, G 153, B 179, A 128)
                widget.SetBoundingSphereColor(0x9999B380);

                $scope.AddBoundMarker(widget, "Sphere");
            } else {
                document.getElementById("bbox").disabled = true;
                document.getElementById("bsphere").disabled = true;
                $scope.inputbsphere = 'YES';
            }
        }
    }
    $scope.CreateBoundingSphere = function (create) {
        if (create) {
            var widget = new $scope.MyBoundClass(Module.BoundType.SPHERE);
            if ($scope.bboxcheck == 'YES') {
                widget.SetBoundingSpherePosition(Number($scope.inputbsphereminx),
                    Number($scope.inputbsphereminy),
                    Number($scope.inputbsphereminz),
                    Number($scope.inputbspheremaxx));
            } else {
                widget.SetBoundingSphereBounds(Number($scope.inputbsphereminx),
                    Number($scope.inputbsphereminy),
                    Number($scope.inputbsphereminz),
                    Number($scope.inputbspheremaxx),
                    Number($scope.inputbspheremaxy),
                    Number($scope.inputbspheremaxz));
            }

            $scope.AddBoundMarker(widget, "Sphere");
        }

        document.getElementById("bbox").disabled = false;
        document.getElementById("bsphere").disabled = false;
        $scope.inputbsphere = 'NO';
    }

    $scope.RemoveAllBoundingMarker = function () {
        $scope.session.RemoveAllBoundMarkers();
        while ($scope.boundWidgets.length) {
            var widget = $scope.boundWidgets.shift();
            if (widget) {
                widget.delete();
                widget = null;
            }
        }
    }

    $scope.RemoveBoundingMarker = function (name) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if ($scope.session.RemoveBoundMarker($scope.currentBoundWidget)) {
                var bmIndex = -1;
                for (var i = 0; i < $scope.boundWidgets.length; i++) {
                    if (name == $scope.boundWidgets[i].name) {
                        bmIndex = i;
                        break;
                    }
                }
                if (bmIndex > -1) $scope.boundWidgets.splice(bmIndex, 1);
                $scope.currentBoundWidget.delete();
                $scope.currentBoundWidget = null;
            }
        }
    }

    $scope.UpdateBoundingMarker = function (name) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            if ($scope.currentBoundWidget.type == "Box") {
                if ($scope.showBoundBoxInfo == 'YES') {
                    $scope.currentBoundWidget.SetBoundingBoxInfo(Number($scope.currentBoundWidget.posx),
                        Number($scope.currentBoundWidget.posy),
                        Number($scope.currentBoundWidget.posz),
                        Number($scope.currentBoundWidget.orix),
                        Number($scope.currentBoundWidget.oriy),
                        Number($scope.currentBoundWidget.oriz),
                        Number($scope.currentBoundWidget.sizex),
                        Number($scope.currentBoundWidget.sizey),
                        Number($scope.currentBoundWidget.sizez));
                } else {
                    $scope.currentBoundWidget.SetBoundingBoxBounds(Number($scope.currentBoundWidget.minx),
                        Number($scope.currentBoundWidget.miny),
                        Number($scope.currentBoundWidget.minz),
                        Number($scope.currentBoundWidget.maxx),
                        Number($scope.currentBoundWidget.maxy),
                        Number($scope.currentBoundWidget.maxz));
                }
            } else if ($scope.currentBoundWidget.type == "Sphere") {
                $scope.currentBoundWidget.SetBoundingSpherePosition(Number($scope.currentBoundWidget.cenx),
                    Number($scope.currentBoundWidget.ceny),
                    Number($scope.currentBoundWidget.cenz),
                    Number($scope.currentBoundWidget.radius));
            }
        }
    }
    $scope.SetBoundMarkerSelectable = function (name, sel) {
        $scope.currentBoundWidget = $scope.FindBoundMarker(name);
        if ($scope.currentBoundWidget) {
            $scope.currentBoundWidget.selectable = sel;
            $scope.currentBoundWidget.SetSelectable(sel);
        }
    }
    $scope.SelectBoundMarker = function (item) {
        if ($scope.currentModelWidget) {
            $scope.SafeApply(function () {
                $scope.currentModelWidget.SelectBoundMarker(item.id, item.selected == 'YES');
            });
        }
    }

    $scope.DisableBoundMarkerSelection = function () {
        for (let i = 0; i < $scope.boundWidgets.length; i++) {
            $scope.boundWidgets[i].SetSelectable(false);
        }
    }
    $scope.RestoreBoundMarkerSelection = function () {
        for (let i = 0; i < $scope.boundWidgets.length; i++) {
            $scope.boundWidgets[i].SetSelectable($scope.boundWidgets[i].selectable);
        }
    }

    $scope.UpdateBoundState = function () {
        var res = $scope.currentBoundWidget.GetBoundDimension();
        var strArr = res.split(" ");

        if ($scope.currentBoundWidget.type == "Box") {
            if (strArr.length == 6) {
                $scope.currentBoundWidget.minx = Number(strArr[0]).toFixed(6);
                $scope.currentBoundWidget.miny = Number(strArr[1]).toFixed(6);
                $scope.currentBoundWidget.minz = Number(strArr[2]).toFixed(6);

                $scope.currentBoundWidget.maxx = Number(strArr[3]).toFixed(6);
                $scope.currentBoundWidget.maxy = Number(strArr[4]).toFixed(6);
                $scope.currentBoundWidget.maxz = Number(strArr[5]).toFixed(6);
            }
        } else if ($scope.currentBoundWidget.type == "Sphere") {
            if (strArr.length == 4) {
                $scope.currentBoundWidget.cenx = Number(strArr[0]).toFixed(6);
                $scope.currentBoundWidget.ceny = Number(strArr[1]).toFixed(6);
                $scope.currentBoundWidget.cenz = Number(strArr[2]).toFixed(6);

                $scope.currentBoundWidget.radius = Number(strArr[3]).toFixed(6);
            }
        }

        var info = $scope.currentBoundWidget.GetBoundBoxInfo();
        if (info.valid) {
            $scope.currentBoundWidget.posx = info.position.x.toFixed(6);
            $scope.currentBoundWidget.posy = info.position.y.toFixed(6);
            $scope.currentBoundWidget.posz = info.position.z.toFixed(6);

            $scope.currentBoundWidget.orix = info.orientation.x.toFixed(6);
            $scope.currentBoundWidget.oriy = info.orientation.y.toFixed(6);
            $scope.currentBoundWidget.oriz = info.orientation.z.toFixed(6);

            $scope.currentBoundWidget.sizex = info.size.x.toFixed(6);
            $scope.currentBoundWidget.sizey = info.size.y.toFixed(6);
            $scope.currentBoundWidget.sizez = info.size.z.toFixed(6);
        }
    }

    $scope.UpdateSpatialFilter = function () {
        if ($scope.currentBoundWidget &&
            $scope.currentBoundWidget.mode == 'Spatial') {
            $scope.SpatialFilterDlgApply();
        }
    }

    $scope.ShowSpatialFilterDialog = function (query) {
        if ($scope.currentModelWidget) {
            if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
                $scope.dialogId = "spatialFilterDlgBox";
                $scope.dialogTitleId = "spatialFilterDlgBoxTitle";

                for (let i = 0; i < $scope.boundWidgets.length; i++) {
                    $scope.currentModelWidget.SelectBoundMarker($scope.boundWidgets[i].id, false);
                    $scope.boundWidgets[i].selected == 'NO';
                }

                $scope.DisableBoundMarkerSelection();
                document.getElementById("bbox").disabled = true;
                document.getElementById("bsphere").disabled = true;

                if (query) {
                    $scope.CreateSpatialFilterBoundMarker(query);
                } else {
                    $scope.spatialFilterResult.filteredItemsNum = 0;
                    $scope.spatialFilterResult.filteredItems = [];
                    $scope.spatialFilterResult.query = {};

                    $scope.CreateSpatialFilterBoundMarker();
                }

                $scope.CheckSpatialFilterPreview();
                $scope.showDialog();
            }
        }
    }

    $scope.CreateSpatialFilterBoundMarker = function (query) {
        if ($scope.MyBoundClass == undefined) {
            $scope.CreateWidgetClasses();
        }

        let type;
        if (query) {
            type = query.type;
        } else {
            type = $scope.spatialFilterLocalTo;
        }

        if (type == 'Box') {
            if (query) {
                $scope.CreateSpatialFilterBox(query.minx, query.miny, query.minz,
                    query.maxx, query.maxy, query.maxz);
            } else {
                var idPathArr = new Module.VectorString();
                var box = $scope.currentModelWidget.CalculateBoundingBox(idPathArr);

                if (box.valid) {
                    var widget = new $scope.MyBoundClass(Module.BoundType.BOX);
                    $scope.CreateSpatialFilterBox(box.min.x, box.min.y, box.min.z,
                        box.max.x, box.max.y, box.max.z);
                }
            }
        } else if (type == 'Sphere') {
            if (query) {
                $scope.CreateSpatialFilterSphere(query.cenx, query.ceny, query.cenz, query.radius);
            } else {
                var idPathArr = new Module.VectorString();
                var sphere = $scope.currentModelWidget.CalculateBoundingSphere(idPathArr);

                if (sphere.valid) {
                    $scope.CreateSpatialFilterSphere(sphere.center.x,
                        sphere.center.y,
                        sphere.center.z,
                        sphere.radius);
                }
            }
        }

        $scope.SpatialFilterDlgApply();
    }

    $scope.CreateSpatialFilterBox = function (x1, y1, z1, x2, y2, z2) {
        var widget = new $scope.MyBoundClass(Module.BoundType.BOX);
        widget.SetBoundingBoxBounds(x1, y1, z1, x2, y2, z2);
        widget.SetBoundingBoxColors(0xBBBBBB40, 0xBBBBBB40,
            0xBBBBBB40, 0xBBBBBB40,
            0xBBBBBB40, 0xBBBBBB40);
        widget.SetDragOptions(0x0003F07, 0x0003F07);

        $scope.UpdateDragOptions(widget);
        widget.type = 'Box';
        widget.mode = 'Spatial';

        var id = $scope.session.AddBoundMarker(widget);
        widget.id = id;
        $scope.currentBoundWidget = widget;
    }

    $scope.CreateSpatialFilterSphere = function (x, y, z, r) {
        var widget = new $scope.MyBoundClass(Module.BoundType.SPHERE);
        widget.SetBoundingSpherePosition(x, y, z, r);
        widget.SetBoundingSphereColor(0xBBBBBB40);

        widget.type = 'Sphere';
        widget.mode = 'Spatial';

        var id = $scope.session.AddBoundMarker(widget);
        widget.id = id;
        $scope.currentBoundWidget = widget;
    }

    $scope.SpatialFilterLocalToChanged = function () {
        $scope.RemoveSpatialFilterBoundMarker();
        $scope.CreateSpatialFilterBoundMarker();
        $scope.CheckSpatialFilterPreview();
    }

    $scope.CheckSpatialFilterPreview = function () {
        let check = document.getElementById("spatialFilterPreview").checked;
        if (check) {
            if ($scope.spatialFilterLocalTo == 'Box') {
                $scope.currentBoundWidget.SetBoundingBoxColors(0xBBBBBB40, 0xBBBBBB40,
                    0xBBBBBB40, 0xBBBBBB40,
                    0xBBBBBB40, 0xBBBBBB40);
                $scope.currentBoundWidget.SetDragOptions(0x0003F07, 0x0003F07);
            } else {
                $scope.currentBoundWidget.SetBoundingSphereColor(0xBBBBBB40);
            }
        } else {
            if ($scope.spatialFilterLocalTo == 'Box') {
                $scope.currentBoundWidget.SetBoundingBoxColors(0xFFFFFF00, 0xFFFFFF00,
                    0xFFFFFF00, 0xFFFFFF00,
                    0xFFFFFF00, 0xFFFFFF00);
                $scope.currentBoundWidget.SetDragOptions(0x0, 0x0);
            } else {
                $scope.currentBoundWidget.SetBoundingSphereColor(0xFFFFFF00);
            }
            $scope.currentModelWidget.SelectBoundMarker($scope.currentBoundWidget.id, false);
        }
    }

    $scope.ShowFilterResult = function () {
        $scope.showSecondaryPane = 'YES';
        $scope.activeSecondaryPane = "spatialfilter";

        $scope.DelayedApply(50, function () {
            resizeBody();
        });
    }

    $scope.GetSpatialFilterResultStyle = function (filteredItem) {
        if (filteredItem.selected) {
            return { 'background-color': '#B0E4FE' }
        } else if (filteredItem.preselected) {
            return { 'background-color': '#f1fbfe' }
        } else {
            return { 'background-color': '#FFFFFF' }
        }
    }

    $scope.SpatialFilterResultPreselect = function (filteredItem, preselect) {
        filteredItem.preselected = preselect;

        if (preselect)
            $scope.HighlightPart(filteredItem.id);
        else
            $scope.DehighlightPart(filteredItem.id);
    }

    $scope.SpatialFilterResultSelect = function ($event, filteredItem) {
        if (!filteredItem.selected) {
            for (var i = 0; i < $scope.spatialFilterResult.filteredItems.length; i++) {
                $scope.spatialFilterResult.filteredItems[i].selected = false;
            }
            filteredItem.selected = true;
            $scope.SpatialFilterSelectPart(filteredItem.id);
        }

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    $scope.SpatialFilterResultZoom = function ($event, filteredItem) {
        $scope.ZoomSelected();

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    $scope.SpatialFilterSelectPart = function (idpath) {
        $scope.ClearNodeSelection();
        if ($scope.currentModelWidget) {
            $scope.nodeSelection.push(idpath);
            $scope.currentModelWidget.SelectPart(idpath, true, Module.SelectType.SELECT);
        }
    }

    $scope.SpatialFilterResultClearSelection = function (event) {
        $scope.ClearNodeSelection();
        for (var i = 0; i < $scope.spatialFilterResult.filteredItems.length; i++) {
            $scope.spatialFilterResult.filteredItems[i].selected = false;
            $scope.spatialFilterResult.filteredItems[i].preselected = false;
        }

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    $scope.RemoveSpatialFilterBoundMarker = function () {
        if ($scope.session.RemoveBoundMarker($scope.currentBoundWidget)) {
            $scope.currentBoundWidget.delete();
            $scope.currentBoundWidget = null;
        }
    }

    $scope.SpatialFilterDlgApply = function () {
        if ($scope.spatialFilterLocalTo == 'Box') {
            $scope.session.SpatialFilterBoxWithCallback(
                Number($scope.currentBoundWidget.minx),
                Number($scope.currentBoundWidget.miny),
                Number($scope.currentBoundWidget.minz),
                Number($scope.currentBoundWidget.maxx),
                Number($scope.currentBoundWidget.maxy),
                Number($scope.currentBoundWidget.maxz),
                false,//$scope.spatialFilterSearchMode == "Accurate",
                $scope.spatialFilterItemsIncluded == "YES" /*Contained only*/,
                function (success, ids) {
                    if (success) {
                        $scope.SaveSpatialFilterQuery();
                        $scope.HighlightSpatialFiltered(ids);
                    } else {
                        console.log('Spatial Filter Failed!');
                    }
                }
            );
        } else {
            $scope.session.SpatialFilterSphereWithCallback(
                Number($scope.currentBoundWidget.cenx),
                Number($scope.currentBoundWidget.ceny),
                Number($scope.currentBoundWidget.cenz),
                Number($scope.currentBoundWidget.radius),
                false,//$scope.spatialFilterSearchMode == "Accurate",
                $scope.spatialFilterItemsIncluded == "YES" /*Contained only*/,
                function (success, ids) {
                    if (success) {
                        $scope.SaveSpatialFilterQuery();
                        $scope.HighlightSpatialFiltered(ids);
                    } else {
                        console.log('Spatial Filter Failed!');
                    }
                }
            );
        }
    }

    $scope.SaveSpatialFilterQuery = function () {
        let obj = { type: $scope.spatialFilterLocalTo };
        if ($scope.spatialFilterLocalTo == 'Box') {
            obj.minx = Number($scope.currentBoundWidget.minx);
            obj.miny = Number($scope.currentBoundWidget.miny);
            obj.minz = Number($scope.currentBoundWidget.minz);
            obj.maxx = Number($scope.currentBoundWidget.maxx);
            obj.maxy = Number($scope.currentBoundWidget.maxy);
            obj.maxz = Number($scope.currentBoundWidget.maxz);
        } else {
            obj.cenx = Number($scope.currentBoundWidget.cenx);
            obj.ceny = Number($scope.currentBoundWidget.ceny);
            obj.cenz = Number($scope.currentBoundWidget.cenz);
            obj.radius = Number($scope.currentBoundWidget.radius);
        }
        $scope.spatialFilterResult.query = obj;
    }

    $scope.HighlightSpatialFiltered = function (ids) {
        $scope.currentModelWidget.SetPartRenderMode("/", Module.PartRenderMode.PHANTOM, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
        $scope.currentModelWidget.UnsetPartColor("/", Module.ChildBehaviour.INCLUDE);

        $scope.spatialFilterResult.filteredItemsNum = ids.size();
        $scope.spatialFilterResult.filteredItems = [];
        for (let i = 0; i < $scope.spatialFilterResult.filteredItemsNum; i++) {
            let idpath = ids.get(i);
            $scope.currentModelWidget.SetPartRenderMode(idpath, Module.PartRenderMode.SHADED, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
            $scope.currentModelWidget.SetPartColor(idpath, 0.38, 1.0, 1.0, 1.0, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
            let instanceName = $scope.currentModelWidget.GetInstanceName(idpath);
            $scope.spatialFilterResult.filteredItems.push({ id: idpath, name: instanceName, selected: false, preselected: false });
        }
    }

    $scope.SpatialFilterDlgClose = function () {
        $scope.RemoveSpatialFilterBoundMarker();
        $scope.RestoreBoundMarkerSelection();
        $scope.currentModelWidget.SetPartRenderMode("/", Module.PartRenderMode.SHADED, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
        $scope.currentModelWidget.UnsetPartColor("/", Module.ChildBehaviour.INCLUDE);
        document.getElementById("bbox").disabled = false;
        document.getElementById("bsphere").disabled = false;
        $scope.hideDialog();
    }

    $scope.ResetPVSUrl = function (success) {
        if (success) {
            storeRecentPVSUrl($scope.pvsUrl);
        }

        $scope.pvsUrl = $scope.pvsBaseUrl;
    }

    $scope.LoadPVS = function (key) {
        $scope.ModelsMenuVisible = false;
        if (key != undefined) {
            if (dbRecentPVSURL == undefined) return;
            dbRecentPVSURL.transaction("RecentPVSURLObjectStore", "readwrite").objectStore("RecentPVSURLObjectStore").openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.name == key) {
                        var updateData = cursor.value;
                        updateData.timestamp = Math.floor(Date.now() / 1000);

                        for (let i = 0; i < $scope.availablePVSUrls.length; i++) {
                            if ($scope.availablePVSUrls[i].name == key) {
                                $scope.availablePVSUrls[i].timestamp = updateData.timestamp;
                                break;
                            }
                        }

                        $scope.LoadModel(updateData.url);
                        cursor.update(updateData);
                        return;
                    }

                    cursor.continue();
                }
            };
        } else {
            $scope.LoadModel($scope.pvsUrl);
        }
    }

    $scope.LoadPVSKeyPressed = function (event) {
        if (event.keyCode == 13) { // Return key
            $scope.LoadPVS();
        } else if (event.keyCode == 27) { // ESC key
            $scope.ModelsMenuVisible = false;
            $scope.pvsUrl = $scope.pvsBaseUrl;
        }
    }

    $scope.LoadModel = function (url, arrayBuffer) {
        if (ThingView.IsPDFSession() || ThingView.IsSVGSession()) {
            $scope.viewType = null;
            $scope.viewExtension = "";
            ThingView.Destroy2DCanvas();
            ThingView.Show3DCanvas($scope.session);
            ThingView._completeInit();
        }
        $scope.viewType = null;
        $scope.viewExtension = "";
        $scope.view3D = true;
        $scope.loadTime = 0;
        if (url || $scope.model.url) {
            if ($scope.MyModelClass == undefined) {
                $scope.CreateWidgetClasses();
            }

            $scope.currentDocument = null;
            $scope.currentArrayBuffer = arrayBuffer;

            if ($scope.webglSettings.removeModelsOnLoad === "YES")
                $scope.RemoveAllModels();

            $scope.loadState = "Loading";
            var widget = $scope.session.MakeModel();
            widget.type = "Model";
            widget.id = $scope.nextModelWidgetId;//++;
            widget.name = widget.type + widget.id;
            widget.$scope = $scope;
            $scope.modelWidgets[widget.name] = widget;
            $scope.currentModelWidget = widget;

            if (url)
                $scope.model.url = url;
            $scope.StopTimer();
            $scope.SetTimer();

            $scope.startTime = performance.now();
            if (arrayBuffer) {
                widget.LoadFromDataSourceWithCallback($scope.model.url, arrayBuffer, $scope.webglSettings.autoload == 'YES', $scope.webglSettings.autoload == 'YES', function (success, isStructure, errorStack) {
                    if (success === true) {
                        $scope.loadState = "Loaded";
                        $scope.StructuerLoadComplete();
                    } else {
                        $scope.StopTimer();
                        $scope.loadState = "Failed";
                        $scope.ResetPVSUrl(false);
                    }
                });
            }
            else {
                widget.LoadFromURLWithCallback($scope.model.url, $scope.webglSettings.autoload == 'YES', $scope.webglSettings.autoload == 'YES', false, function (success, isStructure, errorStack) {
                    if (success === true) {
                        if (isStructure === true) {
                            $scope.StructuerLoadComplete();
                        } else {
                            $scope.loadState = "Loaded";
                        }
                    } else {
                        $scope.StopTimer();
                        $scope.loadState = "Failed";
                        $scope.ResetPVSUrl(false);
                    }
                });
            }
            if ($scope.webglSettings.showProgress == "YES") {
                $scope.timer = $timeout(function () {
                    $scope.session.ShowProgress(true);
                }, 250);
            }
        } else {
            console.log("src url not set");
        }
    }

    $scope.GetInstanceProperties = function () {
        if ($scope.showBottomPane != 'YES') return;
        if ($scope.activeBottomPane != 'properties') return;

        $scope.instanceProperties = [];
        $scope.propertyNames = [];
        var names = new Set();

        if ($scope.currentModelWidget) {
            for (let i = 0; i < $scope.selection.length; i++) {
                let idPath = $scope.selection[i];
                if (idPath) {
                    let strippedIdpath = $scope.StripModelIdFromIdPath(idPath);
                    let propsJson = $scope.currentModelWidget.GetInstanceProperties(strippedIdpath);
                    if (propsJson) {
                        let instanceName = $scope.currentModelWidget.GetInstanceName(strippedIdpath);
                        let propsJsonObj = JSON.parse(propsJson);
                        let propsObj = propsJsonObj[strippedIdpath];
                        if (propsObj) {
                            let keys = Object.keys(propsObj);
                            if (keys.length) {
                                let properties = [];
                                if ($scope.selection.length > 1) {
                                    properties.push({ instanceName: instanceName });
                                    properties.push({ strippedIdpath: strippedIdpath });
                                }
                                for (let j = 0; j < keys.length; j++) {
                                    let groups = propsObj[keys[j]];
                                    Object.keys(groups).forEach(function (key) {
                                        let category = keys[j];

                                        if (category.length == 0)
                                            category = 'PVS File Properties';
                                        else if (category == '__PV_SystemProperties')
                                            category = 'System Properties';

                                        if ($scope.selection.length > 1) {
                                            names.add(key);
                                            let prop = {};
                                            prop[key] = groups[key];
                                            properties.push(prop);
                                        } else {
                                            let prop = { name: key, category: category, value: groups[key] }
                                            properties.push(prop);
                                        }
                                    });
                                }

                                $scope.instanceProperties.push(properties);
                            }
                        }
                    }
                }
            }

            if ($scope.selection.length > 1) {
                names.forEach(function (name) {
                    $scope.propertyNames.push(name);
                });

                $scope.propertyNames.sort(function (a, b) {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
            }
        }
    }

    $scope.FindInstancesWithProperty = function () {
        if ($scope.propertyFindValue) {
            if ($scope.currentModelWidget) {
                let propValueArr = new Module.VectorString();
                propValueArr.push_back($scope.propertyFindValue);
                $scope.instList = $scope.currentModelWidget.FindInstancesWithProperties(false, $scope.groupName, $scope.propName, propValueArr);
                $scope.foundIds = [];

                if ($scope.instList.size() > 0) {
                    $scope.findPropertyResult = "Found " + $scope.instList.size() + " instance(s).";

                    for (let i = 0; i < $scope.instList.size(); i++) {
                        let id = new Object();
                        id.origId = $scope.instList.get(i);
                        let res = id.origId.replace(/@@PV-AUTO-ID@@/gi, "");
                        id.simpId = res;

                        let strippedIdpath = $scope.StripModelIdFromIdPath(id.origId);
                        let instName = $scope.currentModelWidget.GetInstanceName(strippedIdpath);
                        id.instName = instName;

                        $scope.foundIds.push(id);
                    }

                    document.getElementById("findPropertyResultInput").style.background = 'lime';
                } else {
                    $scope.findPropertyResult = "Found 0 instances.";
                    document.getElementById("findPropertyResultInput").style.background = 'yellow';
                }
            }
        } else {
            $scope.findPropertyResult = "Put property value to find.";
            document.getElementById("findPropertyResultInput").style.background = 'yellow';
        }
    }

    $scope.ResetPropertiesResults = function (ready) {
        if (ready) {
            $scope.getPropertyResult = "Ready to get property.";
            document.getElementById("getPropertyResultInput").style.background = 'white';

            $scope.setPropertyResult = "Ready to set property.";
            document.getElementById("setPropertyResultInput").style.background = 'white';

            $scope.findPropertyResult = "Ready to find instances.";
            document.getElementById("findPropertyResultInput").style.background = 'white';
        } else {
            $scope.getPropertyResult = "Select an item first.";
            document.getElementById("getPropertyResultInput").style.background = 'yellow';

            $scope.setPropertyResult = "Select an item first.";
            document.getElementById("setPropertyResultInput").style.background = 'yellow';
        }

        $scope.propertyGetValue = "";
    }

    $scope.ClearFindResult = function () {
        $scope.DeselectAll(Module.SelectType.PRESELECT);
        $scope.foundIds = [];
        $scope.findPropertyResult = "";
        $scope.instList = [];
        $scope.propertyFindValue = "";
    }

    $scope.GetPropertybyName = function (props, name) {
        for (let i = 0; i < props.length; i++) {
            let prop = props[i];
            if (prop[name] != undefined) {
                return prop[name];
            }
        }

        return null;
    }

    $scope.EnableConsoleLog = function () {
        (function () {
            var old = console.log;
            var logger = document.getElementById('log');
            console.log = function (message) {
                if (typeof message == 'object') {
                    logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
                } else {
                    logger.innerHTML += message + '<br />';
                }
            }
        })();
    }

    $scope.CreateWidgetClasses = function () {
        $scope.MyLeaderlineMarkerClass = Module.LeaderlineMarkerPtr.extend("LeaderlineMarkerPtr", {
            OnLoadComplete: function () {
                console.log("OnLoadComplete");
            }
        });

        $scope.MyBoundClass = Module.BoundMarker.extend("BoundMarker", {
            OnLoadComplete: function () {
                $scope.currentBoundWidget = this;
                $scope.SafeApply(function () {
                    $scope.UpdateBoundState();
                });
            },
            OnLoadError: function () {
            },
            OnLocationChanged: function () {
                $scope.currentBoundWidget = this;
                $scope.SafeApply(function () {
                    $scope.UpdateBoundState();
                });
            },
            OnDragEnd: function () {
                $scope.currentBoundWidget = this;
                $scope.SafeApply(function () {
                    $scope.UpdateSpatialFilter();
                });
            }
        });

        $scope.MyTreeClass = Module.TreeEvents.extend("TreeEvents", {
            OnTreeAddBegin: function () {
                $scope.jsonMessage = [];
            },
            OnTreeAdd: function (message) {
                console.log(message)
                $scope.jsonMessage.push(message);
            },
            OnTreeAddEnd: function () {
                $scope.ParseTreeAddMessage($scope.jsonMessage);
                $scope.jsonMessage = [];
                $scope.$apply();
            },
            OnTreeRemoveBegin: function () {
                $scope.jsonMessage = [];
            },
            OnTreeRemove: function (message) {
                $scope.jsonMessage.push(message);
            },
            OnTreeRemoveEnd: function () {
                $scope.ParseTreeRemoveMessage($scope.jsonMessage);
                $scope.jsonMessage = [];
                $scope.$apply();
            },
            OnTreeUpdateBegin: function () {
                $scope.jsonMessage = [];
            },
            OnTreeUpdate: function (message) {
                $scope.jsonMessage.push(message);
            },
            OnTreeUpdateEnd: function () {
                $scope.ParseTreeUpdateMessage($scope.jsonMessage);
                $scope.jsonMessage = [];
                $scope.ApplyNodeSelectionList();
                $scope.$apply();
            }
        });

        $scope.MySelectionClass = Module.SelectionEvents.extend("SelectionEvents", {
            __construct: function () {
                this.__parent.__construct.call(this);
                this.SetEventsFilter(Module.EVENTS_PICKS | Module.EVENTS_SELECTION);
            },

            OnSelectionBegin: function () {
                if ($scope.webglSettings.selectionLogging === 'YES') {
                    console.log("OnSelectionBegin");
                }
            },
            OnPicksChanged: function (removed, added, changed) {
                if ($scope.webglSettings.selectionLogging === 'YES') {
                    console.log("OnPicks changed removed:" + removed.size() + " added:" + added.size() + " changed:" + changed.size());
                    for (var i = 0; i < added.size(); ++i) {
                        var pos = this.GetAddedPosition(i);
                        var normal = this.GetAddedNormal(i);
                        if (isNaN(pos.x)) {
                            console.log("OnPicksChanged - Added " + added.get(i) + " No position");
                        } else
                            console.log("OnPicksChanged - Added " + added.get(i) + " position " + pos.x + " - " + pos.y + " - " + pos.z + " normal " + normal.x + " - " + normal.y + " - " + normal.z);
                    }
                    for (var i = 0; i < changed.size(); ++i) {
                        var pos = this.GetChangedPosition(i);
                        var normal = this.GetChangedNormal(i);
                        if (isNaN(pos.x)) {
                            console.log("OnPicksChanged - Changed " + changed.get(i) + " No position ");
                        } else
                            console.log("OnPicksChanged - Changed " + changed.get(i) + " position " + pos.x + " - " + pos.y + " - " + pos.z + " normal " + normal.x + " - " + normal.y + " - " + normal.z);
                    }
                }
            },
            OnSelectionChanged: function (clear, removed, added) {
                if (!clear && !removed.size() && !added.size()) return;

                $scope.ShowContextMenu(false);
                if (clear) {
                    $scope.selection = [];
                    $scope.nodeSelection = [];
                }

                for (let i = 0; i < removed.size(); ++i) {
                    var idpath = removed.get(i);
                    var fullIdpath = PrependModelId(idpath);
                    let id = $scope.selection.indexOf(fullIdpath);
                    if (id != -1) {
                        $scope.selection.splice(id, 1);
                    }

                    id = $scope.nodeSelection.indexOf(fullIdpath);
                    if (id != -1) {
                        $scope.nodeSelection.splice(id, 1);

                    }
                }

                for (let i = 0; i < added.size(); ++i) {
                    var idpath = added.get(i);
                    var fullIdpath = PrependModelId(idpath);

                    let id = $scope.selection.indexOf(fullIdpath);
                    if (id == -1) {
                        $scope.selection.push(fullIdpath);
                    }

                    id = $scope.nodeSelection.indexOf(fullIdpath);
                    if (id == -1) {
                        $scope.nodeSelection.push(fullIdpath);
                    }
                }

                $scope.UpdateSelectionList();
                $scope.UpdateTreeSelection();
                $scope.SafeApply(function () {
                    $scope.PopulateModelAnnotations();
                    $scope.PopulateLayers();
                });

                if ($scope.webglSettings.selectionLogging === 'YES') {
                    for (var i = 0; i < added.size(); ++i) {
                        var pos = this.GetAddedPosition(i);
                        var normal = this.GetAddedNormal(i);
                        if (isNaN(pos.x)) {
                            console.log("OnSelectionChanged Clear: " + clear + " - Added " + added.get(i) + " No position ");
                        } else
                            console.log("OnSelectionChanged Clear: " + clear + " - Added " + added.get(i) + " position " + pos.x + " - " + pos.y + " - " + pos.z + " normal " + normal.x + " - " + normal.y + " - " + normal.z);
                    }
                }
            },
            OnSelectionEnd: function () {
                if ($scope.webglSettings.selectionLogging === 'YES') {
                    console.log("OnSelectionEnd");
                }
            },
            OnMarkupSelectionChanged: function (clear, removed, added) {
                if (clear) {
                    for (var i = 0; i < $scope.boundWidgets.length; i++) {
                        $scope.boundWidgets[i].selected = 'NO';
                    }
                }

                function FindKey(uid) {
                    for (var i = 0; i < $scope.boundWidgets.length; i++) {
                        if ($scope.boundWidgets[i].id == uid) {
                            return i;
                        }
                    }

                    return -1;
                }

                for (var i = 0; i < removed.size(); ++i) {
                    var key = FindKey(Number(removed.get(i)));
                    if (key > -1) {
                        $scope.boundWidgets[key].selected = 'NO';
                    }
                }
                for (var i = 0; i < added.size(); ++i) {
                    var key = FindKey(Number(added.get(i)));
                    if (key > -1) {
                        $scope.boundWidgets[key].selected = 'YES';
                        $scope.currentBoundWidget = $scope.boundWidgets[key];
                    }
                }
                $scope.$apply();
            }
        });

        $scope.StructuerLoadComplete = function () {
            $scope.loadTime = $scope.GetLoadTime();
            $scope.StopTimer();
            $scope.modelLocation = $scope.currentModelWidget.GetLocation();
            $scope.loadedIllustration = "-";
            $scope.viewablesModelDisplay = false;
            $scope.viewablesFiguresDisplay = false;
            $scope.viewablesDocumentsDisplay = false;
            $scope.ResizeFloor();
            $scope.ResetPVSUrl(true);
            $scope.GetViewLocation();
            $scope.PopulateIllustrationData();
            $scope.PopulateDocumentData();
            $scope.PopulateViewStates();
            $scope.PopulateViewOrientations();
            $scope.PopulateModelAnnotations();
            $scope.PopulateLayers();
            $scope.GetProjectionMode();
            $scope.RegisterTreeObserver();
            $scope.RegisterSelectionObserver();

            $scope.currentModelWidget.SetSequenceEventCallback(function (playstate, stepNum, playpos) {
                $scope.HandleSequenceStepResult(playstate, stepNum, playpos);
                $scope.$apply();
            });
            $scope.currentModelWidget.SetSelectCalloutCallback(function (calloutId, bSelected) {

                console.log("calloutId" + calloutId + "   bSelected" + bSelected);

                if ($scope.webglSettings.selectionLogging === 'YES') {
                    console.log("OnSelectCallout: " + calloutId + ", selected: " + bSelected);
                }
                var itemsList = $scope.currentModelWidget.GetItemsList();
                // 载入完成后可以获取到所有热点的零件编码
                console.log($scope.itemslist);
                if (itemsList) {
                    for (var i = 0; i < $scope.itemslist.length; ++i) {
                        if ($scope.itemslist[i].calloutId == calloutId) {
                            $scope.itemslist[i]["selected"] = bSelected;
                            console.log($scope.itemslist[i]);
                            $scope.$apply();
                            $scope.ToggleTableSelection(i);
                            break;
                        }
                    }
                }
                //zbh
                var scope = angular.element(document.getElementById('app')).scope();
                var arr = scope.itemslist;
                // console.log(arr);
                // console.log(scope);
                var index;
                //zhanghua
                var unselectedRows = [];

                //zhanghua
                for (var i = 0; i < arr.length; i++) {
                    var temp = arr[i];
                    if (calloutId == temp.calloutId) {
                        index = temp.label;
                    } else {
                        unselectedRows.push(temp.label);
                    }
                }
                // for(var j = 0 ; j< arr.length;j++){
                // var trNumsorign = document.getElementsByName('tr'+ arr[j].label);
                // for(var i=0;i<trNumsorign.length;i++){
                // 	 if (trNumsorign[i] != null&&trNumsorign[i]!="null") {
                //         // trNumsorign[i].style.backgroundColor = "#FFFFFF";
                //         //zhanghua
                //         trNumsorign[i].style.backgroundColor = "rgba(211,182,65)";
                // 	 }

                // }
                // console.log(trNumsorign);
                // }
                //zhanghua
                for (let index = 0; index < unselectedRows.length; index++) {
                    const element = unselectedRows[index];
                    const unSelectedTrElement = document.getElementsByName('tr' + element);
                    if (unSelectedTrElement != null && unSelectedTrElement != "null" && unSelectedTrElement.length !== 0) {
                        // console.log(unSelectedTrElement[0]);
                        unSelectedTrElement[0].style.backgroundColor = "#2c2a2b";
                        unSelectedTrElement[0].style.color = "#C0C0C0";
                    }


                }
                // trNumsorign[calloutId].style.backgroundColor = "rgba(211,182,65)";

                var lastTr = null;
                var trNums = document.getElementsByName('tr' + index);
                for (var i = 0; i < trNums.length; i++) {
                    if (trNums[i] != null && trNums[i] != "null") {
                        trNums[i].style.backgroundColor = "#e2bb35"; //rgba(211,182,65)
                        //zhanghua
                        trNums[i].style.color = "#FFFFFF";
                        lastTr = trNums[i];
                        // console.log(trNums[i]);
                    }
                }
                // scrollToLastTr(lastTr);
                if (lastTr) {
                    $('table.gridtable tbody').animate({ scrollTop: lastTr.offsetTop - 56 }, "slow"); //定位tr
                }

                //zhanghua
                if (!tableDisplay) {
                    $('#PLDiv').css('bottom', '40%');
                    $('#PListDiv').css('top', '60%');
                    $('.toggleButtonContainer').css('background-image', 'url("./images/arrow_down.png")');
                    setTimeout(() => {
                        $('table.gridtable tbody').css('height', (Number.parseFloat($('#PListDiv').css('height')) - 56).toString() + 'px');
                    }, 210);
                    window.parent.postMessage('tableDisplay', '*');
                    tableDisplay = true;
                    // console.log('bottom is ' + $('#PLDiv').css('bottom'));
                }
            });

            $scope.currentModelWidget.SetSelectFeatureCallback(function (si, id, selected) {
                if ($scope.webglSettings.selectionLogging === 'YES') {
                    console.log("OnSelectFeature: " + id + ", selected: " + selected);
                }
                $scope.SafeApply(function () {
                    $scope.ShowContextMenu(false);
                    $scope.OnFeatureSelection(si.GetInstanceIdPath(), id, selected);
                });
            })

            $scope.currentModelWidget.SetLocationChangeCallback(function () {
                $scope.modelLocation = $scope.currentModelWidget.GetLocation();
                $scope.$apply();
            })

            $scope.currentModelWidget.SetSelectionCallback(function (type, si, idPath, selected, selType) {
                $scope.selected = selected;
                $scope.$apply();
            });

            $scope.$apply();
        };
    }

    $scope.PopulateIllustrationData = function () {
        if ($scope.currentModelWidget) {
            var annoSets = $scope.currentModelWidget.GetAnnotationSets();
            $scope.annotationSets = [];
            $scope.annotationSetSelector = "";

            if (annoSets.size() > 0) {
                $scope.annotationSetSelector = annoSets.get(0);
                for (var i = 0; i < annoSets.size(); i++) {
                    $scope.annotationSets.push(annoSets.get(i));
                }
            }

            var illustrations = $scope.currentModelWidget.GetIllustrations();
            $scope.illustrations = [];
            if (illustrations.size() > 0) {
                for (var i = 0; i < illustrations.size(); i++) {
                    var illustration = {};
                    illustration.name = illustrations.get(i).name;
                    illustration.humanReadableName = decode_utf8(illustration.name);
                    $scope.illustrations.push(illustration);
                }
            }
            $scope.itemslist = [];

            $scope.ResetSequenceStepInfo();
        }
    }

    $scope.PopulateDocumentData = function () {
        if ($scope.currentModelWidget) {
            var docs = $scope.currentModelWidget.GetDocuments();
            $scope.viewablesData = [];

            if (docs.size() > 0) {
                for (var i = 0; i < docs.size(); i++) {
                    var viewable = docs.get(i);
                    viewable.humanReadableDisplayName = decode_utf8(viewable.displayName);
                    $scope.viewablesData.push(viewable);
                }
            }
        }
    }

    $scope.PopulateViewStates = function () {
        var viewStates = $scope.currentModelWidget.GetViewStates();
        $scope.viewStates = [];
        if (viewStates.size() > 0) {
            for (var i = 0; i < viewStates.size(); i++) {
                var vs = new Object();
                vs.viewStateName = viewStates.get(i).name;
                vs.viewStatePath = viewStates.get(i).path;
                vs.humanReadablePath = decode_utf8(viewStates.get(i).humanReadablePath);
                $scope.viewStates.push(vs);
            }
        }
    }

    $scope.PopulateViewOrientations = function () {
        var viewOrients = $scope.currentModelWidget.GetViewOrientations();
        $scope.viewOrients = [];
        if (viewOrients.size() > 0) {
            var cm = { name: 'CAD Model' };
            $scope.viewOrients.push(cm);
            for (var i = 0; i < viewOrients.size(); i++) {
                var vo = new Object();
                vo.name = viewOrients.get(i).name;
                vo.orient = viewOrients.get(i).orient;
                $scope.viewOrients.push(vo);
            }
            $scope.orientations = $scope.orientPresets.concat($scope.viewOrients);
        }
    }

    $scope.OnFeatureSelection = function (idpath, id, selected) {
        var features = $scope.featureSelection[idpath];
        if (features) {
            var i = features.indexOf(id);
            if (i == -1) {
                if (selected) features.push(id);
            } else {
                if (!selected) {
                    features.splice(i, 1);
                    if (features.length == 0) {
                        delete $scope.featureSelection[idpath];
                    }
                }
            }
        } else {
            if (selected) {
                var feature = [];
                feature.push(id);
                $scope.featureSelection[idpath] = feature;
            }
        }
    }

    $scope.GetInstanceName = function () {
        if ($scope.currentModelWidget) {
            if ($scope.selection.length == 1) {
                let strippedIdpath = $scope.StripModelIdFromIdPath($scope.instanceSelector);
                let instName = $scope.currentModelWidget.GetInstanceName(strippedIdpath);
                if (instName) {
                    $scope.instanceName = instName;
                    $scope.ResetPropertiesResults(true);
                    return;
                }
            }
        }

        $scope.instanceName = "";
        $scope.ResetPropertiesResults(false);
    }

    $scope.PopulateLayers = function () {
        if (!$scope.session || !$scope.currentModelWidget) return;

        $scope.layers = [];
        if ($scope.selection.length == 1) {
            var si = $scope.currentModelWidget.GetShapeInstanceFromIdPath($scope.instanceSelector);
            if (si) {
                $scope.layerTarget = si;
                if ($scope.instanceName) {
                    $scope.layerTargetText = $scope.instanceName;
                } else {
                    $scope.layerTargetText = "Part";
                }
            }
        } else {
            $scope.layerTarget = $scope.session;
            $scope.layerTargetText = "Scene";
        }

        if ($scope.layerTarget) {
            var layers = $scope.layerTarget.GetLayers();
            var overrides = $scope.layerTarget.GetLayerOverrides();

            function GetOverrides(name, overrides) {
                for (var i = 0; i < overrides.size(); i++) {
                    if (overrides.get(i).name == name) {
                        return overrides.get(i).overrides;
                    }
                }
                return undefined;
            }

            for (var i = 0; i < layers.size(); i++) {
                var layer = layers.get(i);
                if (overrides) {
                    var override = GetOverrides(layer.name, overrides);
                    if (override) layer.overrides = override;
                }

                layer.selected = false;
                layer.preselected = false;
                $scope.layers.push(layer);
            }
        }
    }

    $scope.GetLayerID = function (name) {
        return ('LID' + name);
    }

    $scope.GetLayerCheckState = function (layer) {
        var id = 'LID' + layer.name;
        var elem = document.getElementById(id);
        if (elem) {
            if (layer.overrides != undefined) {
                if (layer.overrides & 0x4 /*FORCE_SHOW*/ ||
                    layer.overrides & 0x8 /*FORCE_HIDE*/) {
                    elem.disabled = true;
                } else {
                    elem.disabled = false;
                }

                if (layer.overrides & 0x1 /*VIS_SHOW*/) {
                    elem.indeterminate = false;
                    elem.checked = true;
                    return;
                } else if (layer.overrides & 0x2 /*VIS_HIDE*/) {
                    elem.indeterminate = false;
                    elem.checked = false;
                    return;
                }
            } else {
                elem.disabled = false;
            }

            if (layer.visibility == 1) { // visible
                elem.indeterminate = false;
                elem.checked = true;
            } else if (layer.visibility == 2) { // mixed
                elem.indeterminate = true;
            } else { // 0 hidden
                elem.indeterminate = false;
                elem.checked = false;
            }
        }
    }

    $scope.SetLayerCheckState = function (event, layer) {
        if (layer.overrides != undefined) {
            if (layer.overrides & 0x4 /*FORCE_SHOW*/ ||
                layer.overrides & 0x8 /*FORCE_HIDE*/) {
                return;
            }

            if (layer.overrides & 0x1 /*VIS_SHOW*/) {
                layer.overrides &= ~0x3; //VIS_FLAGS
                layer.overrides |= 0x2 /*VIS_HIDE*/;
            } else if (layer.overrides & 0x2 /*VIS_HIDE*/) {
                layer.overrides &= ~0x3; //VIS_FLAGS
                layer.overrides |= 0x1 /*VIS_SHOW*/;
            }
        } else {
            layer.overrides = 0x0;
            if (layer.visibility != 0) {
                layer.overrides |= 0x2 /*VIS_HIDE*/;
            } else {
                layer.overrides |= 0x1 /*VIS_SHOW*/;
            }
        }

        $scope.ApplyLayersOverrides(false);

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    $scope.GetLayerIcon = function (layer) {
        if (layer.overrides & 0x4 /*FORCE_SHOW*/ ||
            layer.overrides & 0x8 /*FORCE_HIDE*/) {
            return ('./icons/layers_force.png');
        } else {
            return ('./icons/layers.png');
        }
    }

    $scope.GetLayerIconStyle = function (layer) {
        if (layer.overrides & 0x8 /*FORCE_HIDE*/) {
            return { 'opacity': '0.5' }
        } else {
            return { 'opacity': '1.0' }
        }
    }

    $scope.GetLayerStyle = function (layer) {
        if (layer.selected) {
            return { 'background-color': '#B0E4FE' }
        } else if (layer.preselected) {
            return { 'background-color': '#f1fbfe' }
        } else {
            return { 'background-color': '#FFFFFF' }
        }
    }

    $scope.GetLayerVisibilityContext = function () {
        if ($scope.selectedLayer != undefined) {
            if ($scope.selectedLayer.overrides & 0x4 /*FORCE_SHOW*/ ||
                $scope.selectedLayer.overrides & 0x8 /*FORCE_HIDE*/) {
                return false;
            }
            return true;
        }
        return false;
    }

    $scope.LayerClicked = function (event, layer) {
        if (layer.selected) {
            layer.selected = false;
            $scope.selectedLayer = undefined;
        } else {
            for (var i = 0; i < $scope.layers.length; i++) {
                $scope.layers[i].selected = false;
            }
            layer.selected = true;
            $scope.selectedLayer = layer;
        }

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    $scope.ClearLayerSelection = function () {
        for (var i = 0; i < $scope.layers.length; i++) {
            $scope.layers[i].selected = false;
        }
        $scope.selectedLayer = undefined;
    }

    $scope.LayerPreselect = function (layer, preselect) {
        layer.preselected = preselect;
    }

    $scope.SetLayerVisibility = function (visibility, force) {
        if ($scope.selectedLayer) {
            var flag = $scope.selectedLayer.overrides;
            if (force) {
                flag &= ~0xC; //FORCE_FLAGS
                flag |= visibility ? 0x4 /*FORCE_SHOW*/ : 0x8 /*FORCE_HIDE*/;
            } else {
                flag &= ~0x3; //VIS_FLAGS
                flag |= visibility ? 0x1 /*VIS_SHOW*/ : 0x2 /*VIS_HIDE*/;
            }
            $scope.selectedLayer.overrides = flag;
            $scope.ApplyLayersOverrides(false);
        }
    }

    $scope.ResetLayerVisibility = function (all) {
        if (all) {
            $scope.ApplyLayersOverrides(true);
        } else {
            if ($scope.selectedLayer) {
                $scope.selectedLayer.overrides = 0x0;
                $scope.ApplyLayersOverrides(false);
                $scope.selectedLayer.overrides = undefined;
            }
        }
    }

    $scope.ApplyLayersOverrides = function (clear) {
        if ($scope.layerTarget) {
            var ors = new Module.LayerOverridesVec();
            for (var i = 0; i < $scope.layers.length; i++) {
                if ($scope.layers[i].overrides != undefined) {
                    if (clear) {
                        ors.push_back({ name: $scope.layers[i].name, overrides: 0x0 });
                        $scope.layers[i].overrides = undefined;
                    } else {
                        ors.push_back({ name: $scope.layers[i].name, overrides: $scope.layers[i].overrides });
                    }
                }
            }
            if (ors.size()) {
                $scope.layerTarget.SetLayerOverrides(ors);
            }
        }
    }

    $scope.PopulateModelAnnotations = function () {
        if ($scope.currentModelWidget) {
            var idpaths = [];
            var keys = Object.keys($scope.featureSelection);
            if (keys.length) {
                for (var i = 0; i < keys.length; i++) {
                    idpaths.push(keys[i]);
                }
            }

            if ($scope.selection.length) {
                for (var i = 0; i < $scope.selection.length; i++) {
                    var strippedIdpath = $scope.StripModelIdFromIdPath($scope.selection[i]);
                    if (idpaths.indexOf(strippedIdpath) == -1) {
                        idpaths.push(strippedIdpath);
                    }
                }
            }

            var idPathArr = new Module.VectorString();
            for (var i = 0; i < idpaths.length; i++) {
                idPathArr.push_back(idpaths[i]);
            }

            $scope.currentModelWidget.GetFeatureInfoHierarchyWithCallback(idPathArr, Module.FeatureType.MARKUP.value | Module.FeatureType.FACE.value, function (featureInfoCallback, stream) {
                if (Module.FeatureInfoCallbackPhase.BEGIN) {
                    $scope.jsonMessage = [];
                } else if (Module.FeatureInfoCallbackPhase.INFO) {
                    $scope.jsonMessage.push(stream);
                } else if (Module.FeatureInfoCallbackPhase.END) {
                    $scope.OnPopulateModelAnnotationTree($scope.jsonMessage);
                    $scope.jsonMessage = [];
                    $scope.$apply();
                }
            })
        }
    }

    $scope.OnPopulateModelAnnotationTree = function (messageArr) {
        var res = [];
        for (var i = 0; i < messageArr.length; i++) {
            var message_obj = JSON.parse(messageArr[i]);

            if (message_obj.featureInfo) {
                message_obj.featureInfo.info.idpath = message_obj.featureInfo.idpath;
                res.push(message_obj.featureInfo.info);
            }
        }

        if (res.length)
            $rootScope.$emit('PopulateModelAnnotations', { class: 'modelannotationsTree', message: res });
    }

    $scope.LoadAnnotationSet = function (annoSet) {
        if ($scope.currentModelWidget) {
            $scope.ClearNodeSelection();
            $scope.currentModelWidget.LoadAnnotationSetWithCallback(annoSet, function (success, name) {
                if (success === true)
                    $scope.hasAnimation = $scope.currentModelWidget.HasAnimation();
            });
        }
    }

    $scope.ShowSelectedAnnotations = function (show) {
        if ($scope.currentModelWidget) {
            var keys = Object.keys($scope.featureSelection);
            if (keys.length) {
                for (var i = 0; i < keys.length; i++) {
                    var features = $scope.featureSelection[keys[i]];
                    if (features) {
                        var uidArr = new Module.VectorString();
                        for (var j = 0; j < features.length; j++) {
                            uidArr.push_back(features[j].toString());
                        }
                        if (show == 'show') {
                            $scope.currentModelWidget.ShowModelAnnotations(keys[i], uidArr);
                        } else if (show == 'hide') {
                            $scope.currentModelWidget.HideModelAnnotations(keys[i], uidArr);
                        }
                    }
                }
            }
        }
    }

    $scope.ShowAllModelAnnotations = function () {
        if ($scope.currentModelWidget) {
            $scope.currentModelWidget.ShowAllModelAnnotations();
        }
    }

    $scope.HideAllModelAnnotations = function () {
        if ($scope.currentModelWidget) {
            $scope.currentModelWidget.HideAllModelAnnotations();
        }
    }

    $scope.LoadIllustration = function (figure) {
        if (ThingView.IsPDFSession() || ThingView.IsSVGSession()) {
            ThingView.Destroy2DCanvas();
            $scope.viewType = null;
            $scope.viewExtension = "";
            ThingView.Show3DCanvas($scope.session);
            ThingView._completeInit();
            $scope.viewType = null;
            $scope.viewExtension = "";
            $scope.view3D = true;
        }
        if ($scope.currentModelWidget) {
            $scope.currentModelWidget.StopSequence();
            $scope.ResetSequenceStepInfo();
            if (figure) {
                console.log($scope.currentModelWidget);
                $scope.currentDocument = figure.humanReadableName;
                $scope.currentModelWidget.LoadIllustrationWithCallback(figure.name, function (success, pviFile, stepInfoVec) {
                    if (success === true) {
                        $scope.ApplyLoadIllustrationResult(name, true, stepInfoVec);
                        console.log($scope.itemslist);
                        $scope.GetProjectionMode();
                    } else {
                        $scope.ApplyLoadIllustrationResult(name, false, null);
                    }
                    $scope.$apply();
                });
            }
        }
    }

    $scope.ApplyLoadIllustrationResult = function (name, success, stepInfoVec) {
        if (success) {
            if ($scope.currentModelWidget) {
                $scope.itemslist = [];
                var itemsList = $scope.currentModelWidget.GetItemsList();
                console.log(itemsList);
                if (itemsList) {
                    for (let i = 0; i < itemsList.GetNumberOfItems(); ++i) {
                        var obj = new Object();
                        var calloutId = itemsList.GetItemCalloutId(i);
                        var label = itemsList.GetItemLabel(i);
                        var nameTag = itemsList.GetItemNameTag(i);
                        var qty = itemsList.GetNumInstancesQty(i);
                        obj["calloutId"] = calloutId;
                        obj["label"] = label;
                        obj["nameTag"] = nameTag;
                        obj["quantity"] = qty;
                        obj["selected"] = false;
                        $scope.itemslist.push(obj);
                    }
                }

                $scope.loadedIllustration = name + " is loaded";
                $scope.hasSequence = $scope.currentModelWidget.HasSequence();
                if ($scope.hasSequence) {
                    $scope.curSequenceStep = stepInfoVec.get(0);
                    $scope.curSequenceStep.humanReadableName = decode_utf8($scope.curSequenceStep.name);
                    $scope.curSequenceStep.humanReadableDesc = decode_utf8($scope.curSequenceStep.description);
                    $scope.curSequenceStepState = Module.SequencePlayState.STOPPED;
                    $scope.curSequenceStepPosition = Module.SequencePlayPosition.START;

                    var stepNames = new Module.VectorString();
                    var stepDescriptions = new Module.VectorString();
                    for (var j = 0; j < stepInfoVec.size(); ++j) {
                        stepNames.push_back(decode_utf8(stepInfoVec.get(j).name));
                        stepDescriptions.push_back(decode_utf8(stepInfoVec.get(j).description));
                    }

                    $scope.stepNames = stepNames;
                    $scope.stepDescriptions = stepDescriptions;
                }
                $scope.hasAnimation = $scope.currentModelWidget.HasAnimation();
            }
        } else {
            $scope.loadedIllustration = "Failed to load " + name;
            $scope.ResetSequenceStepInfo();
        }
        console.log($scope.itemslist);
    }

    $scope.HandleSequenceStepResult = function (playstate, stepInfo, playpos) {
        $scope.curSequenceStepState = playstate;  // Module.SequencePlayState.PLAYING / PAUSED / STOPPED
        $scope.curSequenceStep = stepInfo;

        if (playstate == Module.SequencePlayState.STOPPED && playpos == Module.SequencePlayPosition.START && 0 != stepInfo.number) {
            // don't change the step label to the next one until it actually get played, in order to be consistent with CV behavior
            $scope.curSequenceStep.humanReadableName = decode_utf8($scope.stepNames.get(stepInfo.number - 1));
            $scope.curSequenceStep.humanReadableDesc = decode_utf8($scope.stepDescriptions.get(stepInfo.number - 1));
        }
        else {
            $scope.curSequenceStep.humanReadableName = decode_utf8(stepInfo.name);
            $scope.curSequenceStep.humanReadableDesc = decode_utf8(stepInfo.description);
        }

        $scope.curSequenceStepPosition = playpos; // Module.SequencePlayPosition.START / MIDDLE / END

        if (playpos == Module.SequencePlayPosition.END) {
            if (stepInfo.acknowledge) {
                if (stepInfo.number == 0) {
                    // Continue | Stop
                    if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
                        $scope.dialogId = "seqAckDlgBoxTwoBtn";
                        $scope.dialogTitleId = "seqAckDlgBoxTwoBtnTitle";
                        $scope.firstStep = true;
                        $scope.showDialog();
                    }
                } else if (stepInfo.number == $scope.curSequenceStep.totalSteps - 1) {
                    // Replay | Complete | Stop
                    if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
                        $scope.dialogId = "seqAckDlgBoxThreeBtn";
                        $scope.dialogTitleId = "seqAckDlgBoxThreeBtnTitle";
                        $scope.lastStep = true;
                        $scope.showDialog();
                    }
                } else {
                    // Replay | Continue | Stop
                    if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
                        $scope.dialogId = "seqAckDlgBoxThreeBtn";
                        $scope.dialogTitleId = "seqAckDlgBoxThreeBtnTitle";
                        $scope.showDialog();
                    }
                }
            } else {
                if ($scope.playall) {
                    if (stepInfo.number == $scope.curSequenceStep.totalSteps - 1) {
                        $scope.playall = false;
                    } else {
                        if ($scope.currentModelWidget) {
                            $scope.currentModelWidget.GoToSequenceStep(stepInfo.number + 1, Module.SequencePlayPosition.START, true);
                            $scope.sequenceStep = stepInfo.number + 1;
                        }
                    }
                } else {
                    if (stepInfo.number != $scope.curSequenceStep.totalSteps - 1) {
                        $scope.currentModelWidget.GoToSequenceStep(stepInfo.number + 1, Module.SequencePlayPosition.START, false);
                        $scope.sequenceStep = stepInfo.number + 1;
                    }
                }
            }
        }
    }

    $scope.GetCurrentSequenceStepStatus = function () {
        if ($scope.curSequenceStep) {
            let res = "(";
            if ($scope.curSequenceStep.number == 0 &&
                $scope.curSequenceStep.duration == 0) {
                res += '1';
            } else {
                res += $scope.curSequenceStep.number;
            }

            res += ' / ';
            res += $scope.curSequenceStep.totalSteps - 1;
            res += ')';

            return res;
        } else {
            return '( / )';
        }
    }

    $scope.GoToSequenceStep = function () {
        if ($scope.sequenceStep < 1) {
            $scope.sequenceStep = 1;
        } else if ($scope.sequenceStep > $scope.curSequenceStep.totalSteps - 1) {
            $scope.sequenceStep = $scope.curSequenceStep.totalSteps - 1;
        }

        $scope.currentModelWidget.GoToSequenceStep(Number($scope.sequenceStep), Module.SequencePlayPosition.START, false);
    }

    $scope.GetSequenceRewindButtonStatus = function () {
        if (!$scope.hasSequence) return true;

        if ($scope.curSequenceStep.number == 0)
            return true;
        else if ($scope.curSequenceStepState != Module.SequencePlayState.STOPPED)
            return true;

        return false;
    }

    $scope.ShowSequencePlayButton = function () {
        if (!$scope.hasSequence) return false;

        if ($scope.curSequenceStepState == Module.SequencePlayState.PLAYING)
            return false;

        return true;
    }

    $scope.ShowSequencePauseButton = function () {
        if (!$scope.hasSequence) return false;

        if ($scope.curSequenceStepState == Module.SequencePlayState.PLAYING)
            return true;

        return false;
    }

    $scope.GetSequencePlayButtonStatus = function () {
        if (!$scope.hasSequence) return true;

        if ($scope.curSequenceStepState == Module.SequencePlayState.PLAYING)
            return true;
        else if ($scope.curSequenceStep.number == ($scope.curSequenceStep.totalSteps - 1) &&
            $scope.curSequenceStepPosition == Module.SequencePlayPosition.END)
            return true;

        return false;
    }

    $scope.GetSequencePlayAllButtonStatus = function () {
        if (!$scope.hasSequence) return true;

        if ($scope.curSequenceStepState == Module.SequencePlayState.PLAYING)
            return true;
        else if ($scope.curSequenceStep.number == ($scope.curSequenceStep.totalSteps - 1) &&
            $scope.curSequenceStepPosition == Module.SequencePlayPosition.END)
            return true;

        return false;
    }

    $scope.GetSequenceNextButtonStatus = function () {
        if (!$scope.hasSequence) return true;

        if ($scope.curSequenceStepState != Module.SequencePlayState.STOPPED)
            return true;
        else if ($scope.curSequenceStep.number == ($scope.curSequenceStep.totalSteps - 1) &&
            $scope.curSequenceStepPosition == Module.SequencePlayPosition.END)
            return true;

        return false;
    }

    $scope.GetSequencePauseButtonStatus = function () {
        if (!$scope.hasSequence) return true;

        return false;
    }

    $scope.ResetSequenceStepInfo = function () {
        $scope.hasSequence = false;
        $scope.hasAnimation = false;
        $scope.curSequenceStep = null;
        $scope.curSequenceStepPosition = null;
        $scope.curSequenceStepState = null;
        $scope.sequenceStep = 1;
        $scope.playall = false;
    }

    $scope.CheckShapeFilterChildOption = function (id, condition) {
        if (condition) {
            document.getElementById(id).checked = true;
            return 1;
        } else {
            document.getElementById(id).checked = false;
            return 0;
        }
    }

    $scope.CheckShapeFilterParentOption = function (id, count, max) {
        document.getElementById(id).checked = false;
        document.getElementById(id).indeterminate = false;
        if (count == max) {
            document.getElementById(id).checked = true;
            document.getElementById(id).indeterminate = false;
        } else if (count > 0) {
            document.getElementById(id).indeterminate = true;
        }
    }

    $scope.ShowShapeFiltersDialog = function () {
        if (!$scope.session) return;
        if ($scope.dialogId != "" || $scope.dialogTitleId != "") return;

        var filters = $scope.session.GetShapeFilters();

        // Model Geometry
        var count = 0;
        count += $scope.CheckShapeFilterChildOption('sfMGSolids', filters & 0x00000001);
        count += $scope.CheckShapeFilterChildOption('sfMGSurfaces', filters & 0x00000002);
        count += $scope.CheckShapeFilterChildOption('sfMGCosmetics', filters & 0x00000004);
        $scope.CheckShapeFilterParentOption('sfModelGeometry', count, 3);

        // Model Annotations
        count = 0;
        count += $scope.CheckShapeFilterChildOption('sfMAPlanarAnnotations', filters & 0x00100000);
        count += $scope.CheckShapeFilterChildOption('sfMAFloatingAnnotations', filters & 0x00200000);
        count += $scope.CheckShapeFilterChildOption('sfMAMiscAnnotations', filters & 0x00400000);
        count += $scope.CheckShapeFilterChildOption('sfMAScreenAnnotations', filters & 0x00800000);
        count += $scope.CheckShapeFilterChildOption('sfMAHiddenByDefault', filters & 0x01000000);
        $scope.CheckShapeFilterParentOption('sfModelAnnotations', count, 5);

        // Model Construction Geometry
        count = 0;
        count += $scope.CheckShapeFilterChildOption('sfMCGSurfaces', filters & 0x00000100);
        count += $scope.CheckShapeFilterChildOption('sfMCGCosmetics', filters & 0x00000200);
        count += $scope.CheckShapeFilterChildOption('sfMCGDatumPlanes', filters & 0x00000400);
        count += $scope.CheckShapeFilterChildOption('sfMCGDatumCurves', filters & 0x00000800);
        count += $scope.CheckShapeFilterChildOption('sfMCGDatumAxes', filters & 0x00001000);
        count += $scope.CheckShapeFilterChildOption('sfMCGDatumPoints', filters & 0x00002000);
        count += $scope.CheckShapeFilterChildOption('sfMCGCoordSystems', filters & 0x00004000);
        $scope.CheckShapeFilterParentOption('sfModelConstructionGeometry', count, 7);

        $scope.dialogId = "shapeFiltersDlgBox";
        $scope.dialogTitleId = "shapeFiltersDlgBoxTitle";
        $scope.showDialog();
    }
    $scope.ShapeFiltersDlgOK = function (hide) {
        if (hide) {
            $scope.hideDialog();
        }

        if (!$scope.session) return;

        var shapeFilters = 0;
        if (document.getElementById('sfMGSolids').checked) shapeFilters |= 0x00000001;
        if (document.getElementById('sfMGSurfaces').checked) shapeFilters |= 0x00000002;
        if (document.getElementById('sfMGCosmetics').checked) shapeFilters |= 0x00000004;

        if (document.getElementById('sfMAPlanarAnnotations').checked) shapeFilters |= 0x00100000;
        if (document.getElementById('sfMAFloatingAnnotations').checked) shapeFilters |= 0x00200000;
        if (document.getElementById('sfMAMiscAnnotations').checked) shapeFilters |= 0x00400000;
        if (document.getElementById('sfMAScreenAnnotations').checked) shapeFilters |= 0x00800000;
        if (document.getElementById('sfMAHiddenByDefault').checked) shapeFilters |= 0x01000000;

        if (document.getElementById('sfMCGSurfaces').checked) shapeFilters |= 0x00000100;
        if (document.getElementById('sfMCGCosmetics').checked) shapeFilters |= 0x00000200;
        if (document.getElementById('sfMCGDatumPlanes').checked) shapeFilters |= 0x00000400;
        if (document.getElementById('sfMCGDatumCurves').checked) shapeFilters |= 0x00000800;
        if (document.getElementById('sfMCGDatumAxes').checked) shapeFilters |= 0x00001000;
        if (document.getElementById('sfMCGDatumPoints').checked) shapeFilters |= 0x00002000;
        if (document.getElementById('sfMCGCoordSystems').checked) shapeFilters |= 0x00004000;

        if ($scope.webglSettings.shapeFilters != shapeFilters) {
            $scope.session.SetShapeFilters(shapeFilters);
            $scope.webglSettings.shapeFilters = shapeFilters;
            $scope.SaveWebglSettings('shapeFilters');
        }
    }

    $scope.CheckModelGeomParent = function () {
        var check = document.getElementById('sfModelGeometry').checked;
        document.getElementById('sfMGSolids').checked = check;
        document.getElementById('sfMGSurfaces').checked = check;
        document.getElementById('sfMGCosmetics').checked = check;
    }
    $scope.CheckModelGeomChildren = function () {
        var count = 0;
        if (document.getElementById('sfMGSolids').checked) count++;
        if (document.getElementById('sfMGSurfaces').checked) count++;
        if (document.getElementById('sfMGCosmetics').checked) count++;
        $scope.CheckShapeFilterParentOption('sfModelGeometry', count, 3);
    }
    $scope.CheckModelAnnoParent = function () {
        var check = document.getElementById('sfModelAnnotations').checked;
        document.getElementById('sfMAPlanarAnnotations').checked = check;
        document.getElementById('sfMAFloatingAnnotations').checked = check;
        document.getElementById('sfMAMiscAnnotations').checked = check;
        document.getElementById('sfMAScreenAnnotations').checked = check;
        document.getElementById('sfMAHiddenByDefault').checked = check;
    }
    $scope.CheckModelAnnoChildren = function () {
        var count = 0;
        if (document.getElementById('sfMAPlanarAnnotations').checked) count++;
        if (document.getElementById('sfMAFloatingAnnotations').checked) count++;
        if (document.getElementById('sfMAMiscAnnotations').checked) count++;
        if (document.getElementById('sfMAScreenAnnotations').checked) count++;
        if (document.getElementById('sfMAHiddenByDefault').checked) count++;
        $scope.CheckShapeFilterParentOption('sfModelAnnotations', count, 5);
    }
    $scope.CheckModelConstGeomParent = function () {
        var check = document.getElementById('sfModelConstructionGeometry').checked;
        document.getElementById('sfMCGSurfaces').checked = check;
        document.getElementById('sfMCGCosmetics').checked = check;
        document.getElementById('sfMCGDatumPlanes').checked = check;
        document.getElementById('sfMCGDatumCurves').checked = check;
        document.getElementById('sfMCGDatumAxes').checked = check;
        document.getElementById('sfMCGDatumPoints').checked = check;
        document.getElementById('sfMCGCoordSystems').checked = check;
    }
    $scope.CheckModelConstGeomChildren = function () {
        var count = 0;
        if (document.getElementById('sfMCGSurfaces').checked) count++;
        if (document.getElementById('sfMCGCosmetics').checked) count++;
        if (document.getElementById('sfMCGDatumPlanes').checked) count++;
        if (document.getElementById('sfMCGDatumCurves').checked) count++;
        if (document.getElementById('sfMCGDatumAxes').checked) count++;
        if (document.getElementById('sfMCGDatumPoints').checked) count++;
        if (document.getElementById('sfMCGCoordSystems').checked) count++;
        $scope.CheckShapeFilterParentOption('sfModelConstructionGeometry', count, 7);
    }

    $scope.showDialog = function () {
        document.getElementById($scope.dialogId).style.display = "block";
        document.getElementById($scope.dialogId).style.top = "10%";
        document.getElementById($scope.dialogId).style.left = "20%";
        document.getElementById($scope.dialogTitleId).onmousedown = function () {
            _dialog_drag_init(this.parentNode);
            return false;
        };

        document.onmousemove = _dialog_move_elem;
        document.onmouseup = _dialog_destroy;
    }
    $scope.hideDialog = function () {
        document.getElementById($scope.dialogId).style.display = "none";
        $scope.dialogId = "";
        $scope.dialogTitleId = "";
    }
    $scope.seqDlgReplay = function () {
        $scope.hideDialog();
        if ($scope.currentModelWidget) {
            $scope.currentModelWidget.GoToSequenceStep($scope.curSequenceStep.number, Module.SequencePlayPosition.START, true);
        }
    }
    $scope.seqDlgContinue = function () {
        $scope.hideDialog();
        if ($scope.firstStep) {
            $scope.firstStep = false;
            if ($scope.currentModelWidget) {
                $scope.currentModelWidget.GoToSequenceStep($scope.curSequenceStep.number + 1, Module.SequencePlayPosition.START, true);
            }
        } else if ($scope.playall) {
            if ($scope.currentModelWidget) {
                $scope.currentModelWidget.GoToSequenceStep($scope.curSequenceStep.number + 1, Module.SequencePlayPosition.START, true);
            }
        }
    }
    $scope.seqDlgComplete = function () {
        $scope.hideDialog();
        $scope.playall = false;
        $scope.lastStep = false;
    }
    $scope.seqDlgStop = function () {
        $scope.hideDialog();
        $scope.playall = false;
    }

    $scope.SetSequenceCmd = function (cmd) {
        if (!$scope.currentModelWidget) return;

        if (cmd == 'Rewind') {
            $scope.currentModelWidget.GoToSequenceStep(0, Module.SequencePlayPosition.START, false);
            $scope.sequenceStep = 1;
        }
        else if (cmd == 'Previous Step') {
            if ($scope.curSequenceStep.number == $scope.curSequenceStep.totalSteps - 1 &&
                $scope.curSequenceStepPosition == Module.SequencePlayPosition.END) {
                if ($scope.curSequenceStep.number == 1) {
                    $scope.currentModelWidget.GoToSequenceStep(0, Module.SequencePlayPosition.START, false);
                    $scope.sequenceStep = 1;
                } else {
                    $scope.currentModelWidget.GoToSequenceStep($scope.curSequenceStep.number, Module.SequencePlayPosition.START, false);
                }
            } else {
                if ($scope.curSequenceStep.number > 0) {
                    let numberToGo = $scope.curSequenceStep.number - 1;
                    if (numberToGo == 1) {
                        $scope.currentModelWidget.GoToSequenceStep(0, Module.SequencePlayPosition.START, false);
                    } else {
                        $scope.currentModelWidget.GoToSequenceStep(numberToGo, Module.SequencePlayPosition.START, false);
                    }

                    if (numberToGo == 0) {
                        $scope.sequenceStep = 1;
                    } else {
                        $scope.sequenceStep = numberToGo;
                    }
                }
            }
        }
        else if (cmd == 'Play') {
            $scope.playall = false;
            $scope.currentModelWidget.PlaySequenceStepWithCallback(function (step) {

            })
        }
        else if (cmd == 'Play All') {
            $scope.playall = true;
            $scope.currentModelWidget.PlaySequenceStepWithCallback(function (step) {
            })
        }
        else if (cmd == 'Next Step') {
            if ($scope.curSequenceStep.number == $scope.curSequenceStep.totalSteps - 1 &&
                $scope.curSequenceStepPosition == Module.SequencePlayPosition.START) {
                $scope.currentModelWidget.GoToSequenceStep($scope.curSequenceStep.number, Module.SequencePlayPosition.END, false);
            } else if ($scope.curSequenceStep.number == 0) {
                $scope.currentModelWidget.GoToSequenceStep(1, Module.SequencePlayPosition.END, false);
            } else {
                if ($scope.curSequenceStep.number < $scope.curSequenceStep.totalSteps - 1) {
                    $scope.currentModelWidget.GoToSequenceStep($scope.curSequenceStep.number + 1, Module.SequencePlayPosition.START, false);
                    $scope.sequenceStep = $scope.curSequenceStep.number + 1;
                }
            }
        }
        else if (cmd == 'Pause') {
            $scope.currentModelWidget.PauseSequence();
        }
        else if (cmd == 'Stop') {
            $scope.playall = false;
            $scope.sequenceStep = 1;
            $scope.currentModelWidget.StopSequence();
        }
        else if (cmd == 'GoTo') {
            $scope.GoToSequenceStep();
        }
    };
    $scope.SetAnimationCmd = function (cmd) {
        if (!$scope.currentModelWidget) return;

        if (cmd == 'PlayAnimation') {
            $scope.currentModelWidget.SetPlaybackSpeed(Number($scope.animationSpeed));
            $scope.currentModelWidget.PlayAnimation();
        }
        else if (cmd == 'PauseAnimation') {
            $scope.currentModelWidget.PauseAnimation();
        }
        else if (cmd == 'StopAnimation') {
            $scope.currentModelWidget.StopAnimation();
        }
    };

    $scope.SetAnimationSpeed = function () {
        if ($scope.currentModelWidget) {
            $scope.currentModelWidget.SetPlaybackSpeed(Number($scope.animationSpeed));
        }
    };

    $scope.ContextStructureMenu = function (cmd) {
        $scope.ShowContextMenu(false);
        if (cmd == 'Hide') {
            $scope.SetVisibility(false, false);
        } else if (cmd == 'Show') {
            $scope.SetVisibility(true, false);
        } else if (cmd == 'ShowAll') {
            $scope.SetVisibility(true, true);
        } else if (cmd == 'Isolate') {
            $scope.Isolate();
        } else if (cmd == 'Unload') {
            $scope.Unload();
        } else if (cmd == 'Expand') {
            $scope.ExpandChildren(true);
        } else if (cmd == 'Collapse') {
            $scope.ExpandChildren(false);
        } else if (cmd == 'ZoomAll') {
            $scope.ZoomView();
        } else if (cmd == 'ZoomSel') {
            $scope.ZoomSelected();
        } else if (cmd == 'Properties') {
            $scope.OpenPropertiesDlg();
        } else if (cmd == 'Remove') {
            $scope.RemoveComps();
        } else if (cmd == 'InsertBranch') {
            $scope.InsertBranch();
        } else if (cmd == 'CreateComp') {
            $scope.CreateComp();
        } else if (cmd == 'Phantom') {
            $scope.SetRenderMode(cmd);
        } else if(cmd == 'showPopup'){
            $scope.ShowPopup();
        } else if (cmd == 'Shaded') {
            $scope.SetRenderMode(cmd);
        } else if (cmd == 'UnSetRM') {
            $scope.UnsetRenderMode();
        } else if (cmd == 'Transparent1_0') {
            $scope.SetOpacity(0.0);
        } else if (cmd == 'Transparent0_5') {
            $scope.SetOpacity(0.5);
        } else if (cmd == 'UnSetT') {
            $scope.UnsetOpacity();
        } else if (cmd == 'LoadParts') {
            $scope.LoadParts();
        }
    }

    $scope.ContextAnnotationMenu = function (cmd) {
        $scope.ShowContextMenu(false);
    }

    $scope.ContextFeatureMenu = function (cmd) {
        $scope.ShowContextMenu(false);
        if (cmd == 'Show') {
            $scope.ShowSelectedAnnotations('show');
        } else if (cmd == 'Hide') {
            $scope.ShowSelectedAnnotations('hide');
        } else if (cmd == 'Isolate') {
            var keys = Object.keys($scope.featureSelection);
            if (keys.length) {
                $scope.HideAllModelAnnotations();
                $scope.ShowSelectedAnnotations('show');
            }
        } else if (cmd == 'Restore') {

        } else if (cmd == 'ShowAll') {
            $scope.ShowAllModelAnnotations();
        } else if (cmd == 'HideAll') {
            $scope.HideAllModelAnnotations();
        } else if (cmd == 'ShowMarkupId') {
            if (!$scope.currentModelWidget) return;

            var keys = Object.keys($scope.featureSelection);
            if (keys.length) {
                if (keys.length) {
                    for (var i = 0; i < keys.length; i++) {
                        var features = $scope.featureSelection[keys[i]];
                        if (features) {
                            var modelAnnoMsg = "";
                            for (var j = 0; j < features.length; j++) {
                                var props = $scope.currentModelWidget.GetMarkupFeatureProperties(keys[i], features[j]);
                                console.log("Model annnotation json object: \n" + props);
                                var markupId = $scope.currentModelWidget.GetMarkupFeatureId(keys[i], features[j]);
                                var uniqueId = $scope.currentModelWidget.GetMarkupFeatureUniqueId(keys[i], markupId);
                                modelAnnoMsg += "Selected UID: " + features[j].toString() + ", markup feature id: " + markupId + ", unique id from markup id: " + uniqueId + "\n";
                            }
                            if (modelAnnoMsg !== "")
                                alert(modelAnnoMsg);
                        }
                    }
                }
            }
        } else if (cmd == 'ShowMarkups') {
            $scope.showFeatureMarkups = true;
        } else if (cmd == 'HideMarkups') {
            $scope.showFeatureMarkups = false;
        } else if (cmd == 'ShowFaces') {
            $scope.showFeatureFaces = true;
        } else if (cmd == 'HideFaces') {
            $scope.showFeatureFaces = false;
        }
    }

    $scope.ContextMarkupMenu = function (cmd) {
        $scope.ShowContextMenu(false);
        if (cmd == 'RemoveLeaderlines') {
            $scope.RemoveLeaderlines();
        } else if (cmd == 'RemoveBoundingBoxes') {
            $scope.RemoveAllBoundingMarker();
        }
    }

    $scope.ContextSelInstancesMenu = function (cmd) {
        $scope.ShowContextMenu(false);
        if (cmd == 'ClearSelection') {
            $scope.ClearNodeSelection();
        }
    }

    $scope.ContextLayerMenu = function (cmd) {
        $scope.ShowContextMenu(false);
        if (cmd == 'SetVisible') {
            $scope.SetLayerVisibility(true);
        } else if (cmd == 'SetHidden') {
            $scope.SetLayerVisibility(false);
        } else if (cmd == 'ForceVisible') {
            $scope.SetLayerVisibility(true, true);
        } else if (cmd == 'ForceHidden') {
            $scope.SetLayerVisibility(false, true);
        } else if (cmd == 'Reset') {
            $scope.ResetLayerVisibility(false);
        } else if (cmd == 'ResetAll') {
            $scope.ResetLayerVisibility(true);
        }
    }

    $scope.ContextSpatialFilterResultsMenu = function (cmd) {
        $scope.ShowContextMenu(false);
        if (cmd == 'ZoomAll') {
            var idPathArr = new Module.VectorString();
            for (var i = 0; i < $scope.spatialFilterResult.filteredItemsNum; i++) {
                idPathArr.push_back($scope.spatialFilterResult.filteredItems[i].id);
            }

            $scope.session.ZoomToParts(idPathArr);

        } else if (cmd == 'ColorCodeAll') {
            $scope.currentModelWidget.SetPartRenderMode("/", Module.PartRenderMode.PHANTOM, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
            $scope.currentModelWidget.UnsetPartColor("/", Module.ChildBehaviour.INCLUDE);

            for (let i = 0; i < $scope.spatialFilterResult.filteredItemsNum; i++) {
                let idpath = $scope.spatialFilterResult.filteredItems[i].id;
                $scope.currentModelWidget.SetPartRenderMode(idpath, Module.PartRenderMode.SHADED, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
                $scope.currentModelWidget.SetPartColor(idpath, 0.38, 1.0, 1.0, 1.0, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
            }
        } else if (cmd == 'ClearColorCode') {
            $scope.currentModelWidget.SetPartRenderMode("/", Module.PartRenderMode.SHADED, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
            $scope.currentModelWidget.UnsetPartColor("/", Module.ChildBehaviour.INCLUDE);
        } else if (cmd == 'ShowQuery') {
            $scope.ShowSpatialFilterDialog($scope.spatialFilterResult.query);
        } else if (cmd == 'ClearResults') {
            $scope.spatialFilterResult.query = {};
            $scope.spatialFilterResult.filteredItemsNum = 0;
            $scope.spatialFilterResult.filteredItems = [];

            $scope.currentModelWidget.SetPartRenderMode("/", Module.PartRenderMode.SHADED, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
            $scope.currentModelWidget.UnsetPartColor("/", Module.ChildBehaviour.INCLUDE);
        }
    }

    $scope.ContextDocumentMenu = function (cmd) {
        $scope.ShowContextMenu(false);
        if (cmd == 'Previous') {
            $scope.LoadPrevPage();
        } else if (cmd == 'Next') {
            $scope.LoadNextPage();
        } else if (cmd == 'First') {
            $scope.LoadPage(1);
        } else if (cmd == 'Last') {
            $scope.LoadPage($scope.totalPageNo);
        }
    }

    $scope.ContextPropertyMenu = function (cmd) {
        $scope.ShowContextMenu(false);
        if (cmd == 'SetProperty') {
            $scope.ShowSetPropertyDialog();
        } else if (cmd == 'GetProperty') {
            $scope.ShowGetPropertyDialog();
        } else if (cmd == 'FindProperty') {
            $scope.ShowFindInstancesWithPropertyDialog();
        } else if (cmd == 'ClearFindResult') {
            $scope.ClearFindResult();
        }
    }

    $scope.ShowSetPropertyDialog = function () {
        if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
            $scope.GetInstanceName();
            $scope.dialogId = "setPropertyDlgBox";
            $scope.dialogTitleId = "setPropertyDlgBoxTitle";
            $scope.propertySetValue = "";
            $scope.showDialog();
        }
    }

    $scope.SetPropertyDlgApply = function () {
        let idPath = $scope.instanceSelector;
        if (idPath) {
            if ($scope.propertySetValue) {
                if ($scope.currentModelWidget) {
                    let strippedIdpath = $scope.StripModelIdFromIdPath(idPath);
                    let res = $scope.currentModelWidget.SetPropertyValue(strippedIdpath, $scope.groupName, $scope.propName, $scope.propertySetValue);
                    if (res) {
                        $scope.setPropertyResult = "Successfully set property.";
                        document.getElementById("setPropertyResultInput").style.background = 'lime';

                        $scope.GetInstanceProperties();
                    } else {
                        $scope.setPropertyResult = "Failed to set property.";
                        document.getElementById("setPropertyResultInput").style.background = 'red';
                    }
                }
            } else {
                $scope.setPropertyResult = "Put property value to set.";
                document.getElementById("setPropertyResultInput").style.background = 'yellow';
            }
        } else {
            $scope.setPropertyResult = "Select an item first.";
            document.getElementById("setPropertyResultInput").style.background = 'yellow';
        }
    }

    $scope.ShowGetPropertyDialog = function () {
        if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
            $scope.GetInstanceName();
            $scope.dialogId = "getPropertyDlgBox";
            $scope.dialogTitleId = "getPropertyDlgBoxTitle";
            $scope.propertyGetValue = "";
            $scope.showDialog();
        }
    }

    $scope.GetPropertyDlgApply = function () {
        let value = "";
        let idPath = $scope.instanceSelector;
        if (idPath) {
            if ($scope.currentModelWidget) {
                let strippedIdpath = $scope.StripModelIdFromIdPath(idPath);
                value = $scope.currentModelWidget.GetPropertyValue(strippedIdpath, $scope.groupName, $scope.propName);
                if (value.length == 0) {
                    $scope.getPropertyResult = "Got nothing.";
                    document.getElementById("getPropertyResultInput").style.background = 'yellow';
                } else {
                    $scope.getPropertyResult = "Successfully got property.";
                    document.getElementById("getPropertyResultInput").style.background = 'lime';
                }
            }
        } else {
            $scope.getPropertyResult = "Select an item first.";
            document.getElementById("getPropertyResultInput").style.background = 'yellow';
        }

        $scope.propertyGetValue = value;
    }

    $scope.ShowFindInstancesWithPropertyDialog = function () {
        if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
            $scope.dialogId = "findInstancesWithPropertyDlgBox";
            $scope.dialogTitleId = "findInstancesWithPropertyDlgBoxTitle";
            $scope.propertyFindValue = "";
            $scope.showDialog();
        }
    }

    $scope.ShowLeaderLinePropertiesDialog = function () {
        if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
            $scope.dialogId = "leaderLinePropertiesDlgBox";
            $scope.dialogTitleId = "leaderLinePropertiesDlgBoxTitle";
            $scope.showDialog();
        }
    }

    $scope.HideLeaderLinePropertiesDialog = function () {
        $scope.hideDialog();
        $scope.RestoreBoundMarkerSelection();
        $scope.session.AllowPartSelection($scope.webglSettings.partSelection == 'YES');
        $scope.session.AllowModelSelection($scope.webglSettings.modelSelection == 'YES');
        if ($scope.webglSettings.dragMode == 'YES')
            $scope.session.SetDragMode(Module.DragMode.DRAG);
        else
            $scope.session.SetDragMode(Module.DragMode.NONE);
        $scope.RemoveShadowLeaderLine();
        $scope.creatingLeaderLine = false;
        $scope.RemoveLeaderLineListener();
    }

    $scope.GetLeaderlineWidthIcon = function (width) {
        if (width.id == 1) {
            return ('./icons/line_width1.png');
        } else if (width.id == 2) {
            return ('./icons/line_width2.png');
        } else if (width.id == 3) {
            return ('./icons/line_width3.png');
        } else if (width.id == 4) {
            return ('./icons/line_width4.png');
        } else if (width.id == 5) {
            return ('./icons/line_width5.png');
        } else if (width.id == 6) {
            return ('./icons/line_width6.png');
        }
    }

    $scope.GetLeaderlineHeadCapIcon = function (cap) {
        if (cap.id == 1) {
            return ('./icons/leader_none.png');
        } else if (cap.id == 2) {
            return ('./icons/leader_head_point.png');
        } else if (cap.id == 3) {
            return ('./icons/leader_head_round.png');
        }
    }

    $scope.GetLeaderlineTailCapIcon = function (cap) {
        if (cap.id == 1) {
            return ('./icons/leader_none.png');
        } else if (cap.id == 2) {
            return ('./icons/leader_tail_point.png');
        } else if (cap.id == 3) {
            return ('./icons/leader_tail_round.png');
        }
    }

    $scope.GetLeaderLinePointType = function (point) {
        if (point.type == 'WORLD') {
            return 'World';
        } else if (point.type == 'SCREEN') {
            return 'Screen';
        }
    }

    $scope.GetLeaderLinePointPos = function (point) {
        if (point.type == 'WORLD') {
            let res = '(' + point.worldPos.x.toFixed(3) + ', ' + point.worldPos.y.toFixed(3) + ', ' + point.worldPos.z.toFixed(3) + ')';
            return res;
        } else if (point.type == 'SCREEN') {
            let res = '(' + point.screenPos.x + ', ' + point.screenPos.y + ')';
            return res;
        }
    }

    $scope.ShowFeatureMarkups = function () {
        return $scope.showFeatureMarkups;
    }

    $scope.ShowFeatureFaces = function () {
        return $scope.showFeatureFaces;
    }

    $scope.RemoveLeaderlines = function () {
        $scope.session.DeleteAllLeaderlineMarkers();
        $scope.leaderlines = [];
    }

    $scope.StructureEditOn = function () {
        if ($scope.webglSettings.structureEdit == 'YES') {
            return true;
        } else {
            return false;
        }
    }

    $scope.RemoveComps = function () {
        if (!$scope.currentModelWidget) return;

        var se = $scope.session.GetStructureEdit();
        if (se) {
            var stringSet = Module.StringSet.Create();
            for (var i = 0; i < $scope.nodeSelection.length; i++) {
                var node = $scope.idpathMap[$scope.nodeSelection[i]];
                if (node) {
                    $scope.SetCurrentModelWidget(node.data.modelId);
                    if ($scope.currentModelWidget) {
                        var strippedIdpath = $scope.StripModelIdFromIdPath(node.data.idpath);
                        stringSet.Insert(strippedIdpath);
                    }
                }
            }
            se.RemoveComps(stringSet, true, true, function (success) {
                if (success) {
                    console.log('Successfully removed comps');
                } else {
                    console.log('Failed to remove comps');
                }
            });
        }
    }

    $scope.MarkComps = function () {
        if (!$scope.currentModelWidget) return;

        var se = $scope.session.GetStructureEdit();
        if (se) {
            $scope.markedComps = Module.StringSet.Create();
            var count = 0;
            for (var i = 0; i < $scope.nodeSelection.length; i++) {
                var node = $scope.idpathMap[$scope.nodeSelection[i]];
                if (node) {
                    $scope.SetCurrentModelWidget(node.data.modelId);
                    if ($scope.currentModelWidget) {
                        var strippedIdpath = $scope.StripModelIdFromIdPath(node.data.idpath);
                        $scope.markedComps.Insert(strippedIdpath);
                        count++;
                    }
                }
            }
        }
    }

    $scope.InsertBranch = function () {
        if ($scope.nodeSelection.length == 1) {
            if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
                $scope.dialogId = "insertBranchesDlgBox";
                $scope.dialogTitleId = "insertBranchesDlgBoxTitle";
                $scope.ibName = "";
                $scope.ibUrl = "";
                $scope.showDialog();
            }
        } else {
            console.log('Select only one component to insert branch.');
        }
    }

    $scope.CreateComp = function () {
        if ($scope.nodeSelection.length == 1) {
            if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
                $scope.dialogId = "createCompDlgBox";
                $scope.dialogTitleId = "createCompDlgBoxTitle";
                $scope.ccName = "";
                $scope.ccUrl = "";
                $scope.ccId = "";
                $scope.showDialog();
            }
        } else {
            console.log('Select only one component to create component.');
        }
    }

    $scope.SetRecentUrl = function (url) {
        $scope.ibUrl = url;
    }
    $scope.ibDlgInsert = function () {
        $scope.hideDialog();

        var se = $scope.session.GetStructureEdit();
        if (se) {
            var node = $scope.idpathMap[$scope.nodeSelection[0]];
            if (node) {
                $scope.SetCurrentModelWidget(node.data.modelId);
                if ($scope.currentModelWidget) {
                    var strippedIdpath = $scope.StripModelIdFromIdPath(node.data.idpath);

                    if (strippedIdpath == ':') {
                        // root node
                        console.log('You cannot merge into root node.');
                    } else {
                        var infoVector = Module.IdFileVector.Create();
                        infoVector.InsertIdFile(strippedIdpath, $scope.ibUrl);

                        se.InsertBranchesChildren(infoVector, true, true, function (success) {
                            if (success) {
                                console.log('Successfully merged');
                            } else {
                                console.log('Failed to merge');
                            }
                        });
                        $scope.ClearNodeSelection();

                        if (dbRecentPVS == undefined) return;
                        var dataSet = dbRecentPVS.transaction("RecentPVSObjectStore", "readwrite").objectStore("RecentPVSObjectStore").get($scope.ibUrl);
                        dataSet.onsuccess = function (event) {
                            if (event.currentTarget.result === undefined) {
                                storeRecentUrl($scope.ibUrl);
                            }
                        }
                    }
                }
            }
        }
    }

    $scope.SetRecentShapeSource = function (url) {
        $scope.ccUrl = url;
    }
    $scope.ccDlgInsert = function () {
        $scope.hideDialog();

        var se = $scope.session.GetStructureEdit();
        if (se) {
            var node = $scope.idpathMap[$scope.nodeSelection[0]];
            if (node) {
                $scope.SetCurrentModelWidget(node.data.modelId);
                if ($scope.currentModelWidget) {
                    var strippedIdpath = $scope.StripModelIdFromIdPath(node.data.idpath);

                    if (strippedIdpath == ':') {
                        // root node
                        console.log('You cannot create component on root node.');
                    } else {
                        se.CreateComp($scope.ccName, strippedIdpath, $scope.ccUrl, $scope.ccId, function (success) {
                            if (success) {
                                console.log('Successfully created component');
                            } else {
                                console.log('Failed to create component');
                            }
                        });
                        $scope.ClearNodeSelection();

                        if (dbRecentShapeSource == undefined) return;
                        var dataSet = dbRecentShapeSource.transaction("RecentShapeSourceObjectStore", "readwrite").objectStore("RecentShapeSourceObjectStore").get($scope.ccUrl);
                        dataSet.onsuccess = function (event) {
                            if (event.currentTarget.result === undefined) {
                                storeRecentShapeSource($scope.ccUrl);
                            }
                        }
                    }
                }
            }
        }
    }

    $scope.SetBackgroundColor = function () {
        if ($scope.session) {
            if ($scope.webglSettings.backgroundColorNum == 'ONE') {
                let color = parseInt($scope.webglSettings.backgroundHexColor.substr(1), 16);
                // $scope.session.SetBackgroundColor(color);
                $scope.session.SetBackgroundColor('#000000');
            } else if ($scope.webglSettings.backgroundColorNum == 'TWO') {
                let topColor = parseInt($scope.webglSettings.backgroundTopHexColor.substr(1), 16);
                let bottomColor = parseInt($scope.webglSettings.backgroundBottomHexColor.substr(1), 16);
                $scope.session.SetTopBottomBackgroundColor(topColor, bottomColor);
            }
        }
    }

    $scope.SetSelectionColor = function (select) {
        if ($scope.session) {
            if (select) {
                let fillColor = "0x" + $scope.webglSettings.partselfillHexColor.substr(1);
                let outlineColor = "0x" + $scope.webglSettings.partseloutlineHexColor.substr(1);
                //$scope.session.SetSelectionColor(Module.SelectType.SELECT, parseInt(fillColor) , parseInt(outlineColor));
                // color
                $scope.session.SetSelectionFillColor(Module.SelectType.SELECT, parseInt(fillColor));
                $scope.session.SetSelectionOutlineColor(Module.SelectType.SELECT, parseInt(outlineColor));
                // style
                if ($scope.selectHighlightStyle == "COLOR")
                    $scope.session.SetSelectionHighlightStyle(Module.SelectType.SELECT, Module.HighlightStyle.COLOR)
                if ($scope.selectHighlightStyle == "SILHOUETTE")
                    $scope.session.SetSelectionHighlightStyle(Module.SelectType.SELECT, Module.HighlightStyle.SILHOUETTE)
                // width
                $scope.session.SetSelectionHighlightWidth(Module.SelectType.SELECT, Number($scope.highlightSelectWidth.id));
            } else { // preselect
                let fillColor = "0x" + $scope.webglSettings.partpreselfillHexColor.substr(1);
                let outlineColor = "0x" + $scope.webglSettings.partpreseloutlineHexColor.substr(1);
                //$scope.session.SetSelectionColor(Module.SelectType.PRESELECT, parseInt(fillColor) , parseInt(outlineColor));
                // color
                $scope.session.SetSelectionFillColor(Module.SelectType.PRESELECT, parseInt(fillColor));
                $scope.session.SetSelectionOutlineColor(Module.SelectType.PRESELECT, parseInt(outlineColor));
                // style
                if ($scope.preSelectHighlightStyle == "COLOR")
                    $scope.session.SetSelectionHighlightStyle(Module.SelectType.PRESELECT, Module.HighlightStyle.COLOR)
                if ($scope.preSelectHighlightStyle == "SILHOUETTE")
                    $scope.session.SetSelectionHighlightStyle(Module.SelectType.PRESELECT, Module.HighlightStyle.SILHOUETTE)
                // width
                $scope.session.SetSelectionHighlightWidth(Module.SelectType.PRESELECT, Number($scope.highlightPreSelectWidth.id));
            }
        }
    }

    $scope.GetBGColorDlgSize = function () {
        if ($scope.backgroundColorNum == 'ONE') {
            return {
                'width': '370px',
                'height': '410px'
            }
        } else if ($scope.backgroundColorNum == 'TWO') {
            return {
                'width': '370px',
                'height': '480px'
            }
        }
    }

    $scope.GetColorDisplayStyle = function (rgbaHex, selector) {
        let tokens;
        if (rgbaHex.length == 9) {
            tokens = /^#(..)(..)(..)(..)$/.exec(rgbaHex);
        } else if (rgbaHex.length == 7) {
            tokens = /^#(..)(..)(..)$/.exec(rgbaHex);
        }


        if (tokens) {
            let rgba = tokens.slice(1).map(function (hex) {
                return parseInt(hex, 16);
            });

            let alpha = rgba.length == 4 ? (rgba[3] / 255).toFixed(2) : 1.0;
            let color = rgbaHex.substr(0, 7);
            let border = $scope.partColorSelector == selector ? '1px solid black' : '1px solid LightGray';

            return {
                'background-color': color,
                'opacity': alpha,
                'border': border
            }
        }
    }

    $scope.GetColorHexTextStyle = function (selector) {
        if (selector == $scope.partColorSelector) {
            return {
                'border': '1px solid black',
                'color': 'black',
            }
        } else {
            return {
                'border': '1px solid LightGray',
                'color': 'LightGray',
            }
        }
    }

    $scope.GetColorRGBATextStyle = function (selector) {
        if (selector == $scope.partColorSelector) {
            return { 'color': 'gray' }
        } else {
            return { 'color': 'LightGray' }
        }
    }

    $scope.GetColorRGBAText = function (rgbaHex) {
        var tokens = /^#(..)(..)(..)(..)$/.exec(rgbaHex);

        if (tokens) {
            let rgba = tokens.slice(1).map(function (hex) {
                return parseInt(hex, 16); // Normalize to 1
            });

            let res = 'R: ' + rgba[0]
                + ' G: ' + rgba[1]
                + ' B: ' + rgba[2]
                + ' A: ' + (rgba[3] / 255).toFixed(2);

            return res;
        }
    }

    $scope.GetColorRGB = function (rgbHex) {
        var tokens = /^#(..)(..)(..)$/.exec(rgbHex);

        if (tokens) {
            let rgb = tokens.slice(1).map(function (hex) {
                return parseInt(hex, 16); // Normalize to 1
            });

            let res = {
                r: (rgb[0] / 255).toFixed(2),
                g: (rgb[1] / 255).toFixed(2),
                b: (rgb[2] / 255).toFixed(2)
            };

            return res;
        }
    }

    $scope.ShowPartSelectionColorDialog = function (selector) {
        if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
            $scope.dialogId = "partSelectionColorDlgBox";
            $scope.dialogTitleId = "partSelectionColorDlgBoxTitle";
            $scope.partColorSelector = selector;
            $scope.showDialog();
        }
    }

    $scope.ShowPartPreselectionColorDialog = function (selector) {
        if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
            $scope.dialogId = "partPreselectionColorDlgBox";
            $scope.dialogTitleId = "partPreselectionColorDlgBoxTitle";
            $scope.partColorSelector = selector;
            $scope.showDialog();
        }
    }

    $scope.PartSelectionColorDlgOK = function (hide) {
        if (hide) {
            $scope.partColorSelector = 0;
            $scope.hideDialog();
        }

        let updated = false;
        if ($scope.webglSettings.partselfillHexColor != $scope.partSelectionFillColor) {
            $scope.webglSettings.partselfillHexColor = $scope.partSelectionFillColor;
            $scope.SaveWebglSettings('partselfillHexColor');
            updated = true;
        }

        if ($scope.webglSettings.partseloutlineHexColor != $scope.partSelectionOutlineColor) {
            $scope.webglSettings.partseloutlineHexColor = $scope.partSelectionOutlineColor;
            $scope.SaveWebglSettings('partseloutlineHexColor');
            updated = true;
        }

        if ($scope.webglSettings.selectHighlightStyle != $scope.selectHighlightStyle) {
            $scope.webglSettings.selectHighlightStyle = $scope.selectHighlightStyle;
            $scope.SaveWebglSettings('selectHighlightStyle');
            updated = true;
        }

        $scope.selectHighlightWidth = Number($scope.highlightSelectWidth.id);
        if ($scope.webglSettings.selectHighlightWidth != $scope.selectHighlightWidth) {
            $scope.webglSettings.selectHighlightWidth = $scope.selectHighlightWidth;
            $scope.SaveWebglSettings('selectHighlightWidth');
            updated = true;
        }

        if (updated)
            $scope.SetSelectionColor(true);
    }

    $scope.PartSelectionColorDlgCancel = function () {
        $scope.partColorSelector = 0;
        $scope.hideDialog();

        $scope.partSelectionFillColor = $scope.webglSettings.partselfillHexColor;
        $scope.partSelectionOutlineColor = $scope.webglSettings.partseloutlineHexColor;
    }

    $scope.PartPreselectionColorDlgOK = function (hide) {
        if (hide) {
            $scope.partColorSelector = 0;
            $scope.hideDialog();
        }

        let updated = false;
        if ($scope.webglSettings.partpreselfillHexColor != $scope.partPreselectionFillColor) {
            $scope.webglSettings.partpreselfillHexColor = $scope.partPreselectionFillColor;
            $scope.SaveWebglSettings('partpreselfillHexColor');
            updated = true;
        }

        if ($scope.webglSettings.partpreseloutlineHexColor != $scope.partPreselectionOutlineColor) {
            $scope.webglSettings.partpreseloutlineHexColor = $scope.partPreselectionOutlineColor;
            $scope.SaveWebglSettings('partpreseloutlineHexColor');
            updated = true;
        }
        if ($scope.webglSettings.preSelectHighlightStyle != $scope.preSelectHighlightStyle) {
            $scope.webglSettings.preSelectHighlightStyle = $scope.preSelectHighlightStyle;
            $scope.SaveWebglSettings('preSelectHighlightStyle');
            updated = true;
        }

        $scope.preSelectHighlightWidth = Number($scope.highlightPreSelectWidth.id);
        if ($scope.webglSettings.preSelectHighlightWidth != $scope.preSelectHighlightWidth) {
            $scope.webglSettings.preSelectHighlightWidth = $scope.preSelectHighlightWidth;
            $scope.SaveWebglSettings('preSelectHighlightWidth');
            updated = true;
        }
        if (updated)
            $scope.SetSelectionColor(false);
    }

    $scope.PartPreselectionColorDlgCancel = function () {
        $scope.partColorSelector = 0;
        $scope.hideDialog();

        $scope.partPreselectionFillColor = $scope.webglSettings.partpreselfillHexColor;
        $scope.partPreselectionOutlineColor = $scope.webglSettings.partpreseloutlineHexColor;
    }

    $scope.ShowBackgroundColorDialog = function (selector) {
        if ($scope.dialogId == "" && $scope.dialogTitleId == "") {
            $scope.dialogId = "backgroundColorDlgBox";
            $scope.dialogTitleId = "backgroundColorDlgBoxTitle";
            $scope.partColorSelector = selector;
            $scope.showDialog();
        }
    }

    $scope.BackgroundColorDlgOK = function (hide) {
        if (hide) {
            $scope.partColorSelector = 0;
            $scope.hideDialog();
        }

        if ($scope.backgroundColorNum == 'ONE') {
            $scope.webglSettings.backgroundColorNum = 'ONE';

            $scope.webglSettings.backgroundHexColor = $scope.backgroundColor;
            $scope.SaveWebglSettings('backgroundHexColor');
        } else if ($scope.backgroundColorNum == 'TWO') {
            $scope.webglSettings.backgroundColorNum = 'TWO';

            $scope.webglSettings.backgroundTopHexColor = $scope.backgroundTopColor;
            $scope.SaveWebglSettings('backgroundTopHexColor');

            $scope.webglSettings.backgroundBottomHexColor = $scope.backgroundBottomColor;
            $scope.SaveWebglSettings('backgroundBottomHexColor');
        }

        $scope.SetBackgroundColor();
    }

    $scope.BackgroundColorDlgCancel = function () {
        $scope.partColorSelector = 0;
        $scope.hideDialog();

        $scope.backgroundColor = $scope.webglSettings.backgroundHexColor;
        $scope.backgroundTopColor = $scope.webglSettings.backgroundTopHexColor;
        $scope.backgroundBottomColor = $scope.webglSettings.backgroundBottomHexColor;
        $scope.backgroundColorNum = $scope.webglSettings.backgroundColorNum;
    }

    $scope.SetVisibility = function (vis, allNode) {
        console.log($scope.nodeSelection);
        if (allNode) {
            var rootNode = $scope.uidMap[0];
            if (rootNode) {
                for (var i = 0; i < rootNode.children.length; i++) {
                    var child = $scope.uidMap[rootNode.children[i]];
                    if (child) {
                        $scope.SetCurrentModelWidget(child.data.modelId);
                        if ($scope.currentModelWidget) {
                            var strippedIdpath = $scope.StripModelIdFromIdPath(child.data.idpath);
                            $scope.currentModelWidget.SetPartVisibility(strippedIdpath, vis,
                                Module.ChildBehaviour.INCLUDE,
                                Module.InheritBehaviour.USE_DEFAULT);

                        }
                    }
                }
            }
        } else {
            for (var i = 0; i < $scope.nodeSelection.length; i++) {
                var node = $scope.idpathMap[$scope.nodeSelection[i]];
                console.log(node);
                if (node) {
                    $scope.SetCurrentModelWidget(node.data.modelId);
                    if ($scope.currentModelWidget) {
                        var strippedIdpath = $scope.StripModelIdFromIdPath(node.data.idpath);
                        console.log(strippedIdpath, vis,
                            Module.ChildBehaviour.INCLUDE,
                            Module.InheritBehaviour.USE_DEFAULT);
                        $scope.currentModelWidget.SetPartVisibility(strippedIdpath, vis,
                            Module.ChildBehaviour.INCLUDE,
                            Module.InheritBehaviour.USE_DEFAULT);
                    }
                }
            }
        }
        $scope.nodeSelection.push(PrependModelId(1));
        for (var i = 0; i < $scope.nodeSelection.length; i++) {
            var node = $scope.idpathMap[$scope.nodeSelection[i]];
            console.log(node);
            if (node) {
                $scope.SetCurrentModelWidget(node.data.modelId);
                if ($scope.currentModelWidget) {
                    var strippedIdpath = $scope.StripModelIdFromIdPath(node.data.idpath);
                    console.log(strippedIdpath, vis,
                        Module.ChildBehaviour.INCLUDE,
                        Module.InheritBehaviour.USE_DEFAULT);
                    $scope.currentModelWidget.SetPartVisibility(strippedIdpath, vis,
                        Module.ChildBehaviour.INCLUDE,
                        Module.InheritBehaviour.USE_DEFAULT);
                }
            }
        }

    }

    $scope.SetRenderMode = function (cmd) {
        console.log($scope.idpathMap);
        for (var i = 0; i < $scope.nodeSelection.length; i++) {
            var node = $scope.idpathMap[$scope.nodeSelection[i]];
            console.log(node);
            console.log('aaa');
            if (node) {
                $scope.SetCurrentModelWidget(node.data.modelId);
                if ($scope.currentModelWidget) {
                    var strippedIdpath = $scope.StripModelIdFromIdPath(node.data.idpath);
                    if (cmd == "Phantom")
                        $scope.currentModelWidget.SetPartRenderMode(strippedIdpath, Module.PartRenderMode.PHANTOM, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
                    else if (cmd == "Shaded")
                        $scope.currentModelWidget.SetPartRenderMode(strippedIdpath, Module.PartRenderMode.SHADED, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
                }
            }
        }
    }

    $scope.UnsetRenderMode = function () {
        for (var i = 0; i < $scope.nodeSelection.length; i++) {
            var node = $scope.idpathMap[$scope.nodeSelection[i]];
            if (node) {
                $scope.SetCurrentModelWidget(node.data.modelId);
                if ($scope.currentModelWidget) {
                    var strippedIdpath = $scope.StripModelIdFromIdPath(node.data.idpath);
                    $scope.currentModelWidget.UnsetPartRenderMode(strippedIdpath, Module.ChildBehaviour.INCLUDE);
                }
            }
        }
    }
    $scope.ShowPopup = function(){
        console.log(JSON.stringify($scope.idpathMap));
        for (var i=0; i<$scope.nodeSelection.length; i++) {
            var node = $scope.idpathMap[$scope.nodeSelection[i]];
            console.log(node);
            if (node) {
                let idPath = node.data.idpath;
                /**获取零件路径唯一标识*/
                let strippedIdpath = $scope.StripModelIdFromIdPath(idPath);
                //模型加载时调用widget1.LoadFromURLWithCallback没有给$scope.structure赋值
                let propsJson = $scope.structure.GetInstanceProperties(strippedIdpath);
                let propsJsonObj = JSON.parse(propsJson);
                let propsObj = propsJsonObj[strippedIdpath];
                let __PV_SystemPropertiesJson = propsObj["__PV_SystemProperties"];
                /**获取零件序号*/
                let part_ID = __PV_SystemPropertiesJson["Part ID"];
                /**获取零件名称*/
                let part_Name = __PV_SystemPropertiesJson["Part Name"];
                //let oL_File_Name = __PV_SystemPropertiesJson["OL File Name"];
                /**设置本地缓存*/
                localStorage.setItem("strippedIdpath",strippedIdpath);
                localStorage.setItem("modelParamsUrl", $scope.modelParams.url);
                localStorage.setItem("part_Name",part_Name);
                localStorage.setItem("part_ID",part_ID);
                $scope.partName = part_Name;
                $scope.part_ID = part_ID;
                showPopup();
            }
        }
    }
    $scope.SetOpacity = function (t) {
        for (var i = 0; i < $scope.nodeSelection.length; i++) {
            var node = $scope.idpathMap[$scope.nodeSelection[i]];
            if (node) {
                $scope.SetCurrentModelWidget(node.data.modelId);
                if ($scope.currentModelWidget) {
                    var strippedIdpath = $scope.StripModelIdFromIdPath(node.data.idpath);
                    $scope.currentModelWidget.SetPartOpacity(strippedIdpath, t, Module.ChildBehaviour.INCLUDE, Module.InheritBehaviour.USE_DEFAULT);
                }
            }
        }
    }

    $scope.UnsetOpacity = function () {
        for (var i = 0; i < $scope.nodeSelection.length; i++) {
            var node = $scope.idpathMap[$scope.nodeSelection[i]];
            if (node) {
                $scope.SetCurrentModelWidget(node.data.modelId);
                if ($scope.currentModelWidget) {
                    var strippedIdpath = $scope.StripModelIdFromIdPath(node.data.idpath);
                    $scope.currentModelWidget.UnsetPartOpacity(strippedIdpath, Module.ChildBehaviour.INCLUDE);
                }
            }
        }
    }

    $scope.Isolate = function () {
        $scope.SetVisibility(false, true);
        $scope.SetVisibility(true, false);
    }

    $scope.ShowContextMenu = function (show, type) {
        $scope.SafeApply(function () {
            if (show == true) {
                $scope.contextMenuType = type;
                document.getElementById('context-menu').style.display = "block";
            } else {
                document.getElementById('context-menu').style.display = "none";
            }
        });
    }

    $scope.GetContextMenuType = function () {
        return $scope.contextMenuType;
    }

    $scope.SelectRibbonMenu = function (delta) {
        let menus = [];
        menus.push('home');
        menus.push('markup');
        menus.push('viewlocation');
        let plVis = document.getElementById("partLocationMenu").offsetParent !== null;
        if (plVis) menus.push('partlocation');
        let mlElm = document.getElementById("modelLocationMenu").offsetParent !== null;
        if (mlElm) menus.push('modellocation');
        let docElm = document.getElementById("documentMenu").offsetParent !== null;
        if (docElm) menus.push('docinfo');
        let curMenu = menus.indexOf($scope.activeMenu);
        if (delta > 0) {
            curMenu = curMenu + 1;
            if (curMenu == menus.length)
                curMenu = menus.length - 1;
        } else if (delta < 0) {
            curMenu = curMenu - 1;
            if (curMenu < 0)
                curMenu = 0;
        } else {
            return;
        }

        $scope.SafeApply(function () {
            $scope.activeMenu = menus[curMenu];
        });
    }

    $scope.UpdateSelectionList = function () {
        if ($scope.selection.length > 0) {
            $scope.instanceSelector = $scope.selection[0];
        } else {
            $scope.instanceSelector = "";

            $scope.DelayedApply(50, function () {
                if ($scope.activeMenu == 'partlocation' &&
                    $scope.selection.length != 1) {
                    $scope.activeMenu = 'home';
                }
            });
        }

        $scope.GetPartLocation();
        $scope.GetInstanceName();
        $scope.GetInstanceProperties();

    }

    $scope.UpdateTreeSelection = function () {
        if ($scope.webglSettings.expandAncestors == 'YES') {
            if ($scope.nodeSelection.length > 0) {
                $rootScope.$emit('UpdateTreeSelection', { class: 'structureTree' });
            }
        }
    }

    $scope.SetSpinCenter = function () {
        $scope.session.SetSpinCenter();
    }

    $scope.LoadSawModel = function () {
        $scope.LoadModel("../../demodata/Saw/saw.pvz", "");
    }

    $scope.RemoveAllModels = function () {
        $scope.ModelsMenuVisible = false;
        $scope.selection = [];

        $scope.currentModelWidget = null;
        $scope.session.RemoveAllModels(true);
        var keys = Object.keys($scope.modelWidgets);
        for (var i = keys.length - 1; i > -1; i--) {
            var widget = $scope.modelWidgets[keys[i]];
            if (widget) {
                delete $scope.modelWidgets[keys[i]];
                widget = null;
            }
        }

        $scope.viewStates = [];
        $scope.viewOrients = [];
        $scope.orientations = $scope.orientPresets.concat($scope.viewOrients);
        $scope.illustrations = [];
        $scope.loadedIllustration = "-";
        $scope.viewablesData = [];
        $scope.documentSelector = "";
        $scope.annotationSets = [];
        $scope.annotationSetSelector = "";
        $scope.layers = [];
        $scope.selectedLayer = undefined;
        $scope.layerTarget = undefined;
        $scope.layerTargetText = "";
        $scope.model = { "url": "", "baseUrl": "", "templateUrl": "", "mapUrl": "", "getmarkupUrl": "" }
        $scope.loadState = "";
        $scope.loadTime = 0;
        $scope.startTime = 0;
        $scope.currentDocument = null;

        $scope.ResetSequenceStepInfo();

        $scope.session.ShowFloor(false, 0x505050E0, 0xE0E0E0E0);
        $scope.session.RemoveAllCVMarkups(Module.CV_MARKUP_TYPES.CVMARKUPTYPE_ALL);
        $scope.session.RemoveSectionCut();
        $scope.RemoveAllBoundingMarker();
        $scope.RemoveLeaderlines();

        $rootScope.$emit('ClearTree', { class: 'structureTree' });
        $rootScope.$emit('ClearTree', { class: 'modelannotationsTree' });

        $scope.DelayedApply(50, function () {
            $scope.activeMenu = "home";
            //$scope.selection = [];
        });
    }

    $scope.GetLoadTime = function () {
        var elapsedTime = ((performance.now() - $scope.startTime) / 1000).toFixed(3);
        return (elapsedTime);
    }

    $scope.OpenModel = function (input) {
        if (input.files[0]) {
            var file = input.files[0];
            var reader = new FileReader();
            reader.filename = file.name;
            reader.onload = function () {
                var arrayBuffer = reader.result;
                angular.element(document.getElementById('app')).scope().LoadModel(reader.filename, arrayBuffer);
                storeDataSet(file.name, arrayBuffer);
            }
            reader.readAsArrayBuffer(file);
        }
    }

    $scope.LoadParts = function () {
        if ($scope.currentModelWidget) {
            if ($scope.nodeSelection.length) {
                var idPathArr = new Module.VectorString();
                for (var i = 0; i < $scope.nodeSelection.length; i++) {
                    var strippedIdpath = $scope.StripModelIdFromIdPath($scope.nodeSelection[i]);
                    idPathArr.push_back(strippedIdpath);
                }

                $scope.currentModelWidget.LoadParts(idPathArr, true, function (result) {
                    if (result == true) {
                        console.log('LoadParts successfully completed.');
                    }
                });
            }
        }
    }

    $scope.SetInertialSpinDecayRate = function () {
        if ($scope.session) {
            $scope.session.SetInertialSpinDecayRate($scope.webglSettings.decayrate);
        }
    }

    $scope.ToggleViewablesModel = function () {
        if ($scope.viewablesModelDisplay) {
            $scope.viewablesModelDisplay = false;
        } else {
            $scope.viewablesModelDisplay = true;
        }
    }

    $scope.ToggleViewablesFigures = function () {
        if ($scope.viewablesFiguresDisplay) {
            $scope.viewablesFiguresDisplay = false;
        } else {
            $scope.viewablesFiguresDisplay = true;
        }
    }

    $scope.ToggleViewablesDocuments = function () {
        if ($scope.viewablesDocumentsDisplay) {
            $scope.viewablesDocumentsDisplay = false;
        } else {
            $scope.viewablesDocumentsDisplay = true;
        }
    }

    $scope.Create3DSession = function () {
        if ($scope.session) {
            $scope.RemoveAllModels();
            $scope.MyModelClass = null;
            $scope.progress = 0;
            $scope.timer = null;
            $scope.webglSettings.autoload = 'YES';
            ThingView.DeleteSession($scope.session);
            ThingView._completeInit();
            $scope.session = ThingView.CreateSession($scope.sessionId);
            $scope.SetBackgroundColor();
            $scope.session.AllowPartSelection($scope.webglSettings.partSelection == 'YES');
            if ($scope.webglSettings.dragMode == 'YES')
                $scope.session.SetDragMode(Module.DragMode.DRAG);
            else
                $scope.session.SetDragMode(Module.DragMode.NONE);
            $scope.session.SetDragSnap($scope.webglSettings.dragSnap == 'YES');
            $scope.SetNavigationMode($scope.webglSettings.navMode);
            $scope.session.ShowSpinCenter($scope.webglSettings.showSpinCenter == 'YES');
            if ($scope.webglSettings.antiAliasing == "YES")
                $scope.session.SetAntialiasingMode(Module.AntialiasingMode.SS4X);
            else
                $scope.session.SetAntialiasingMode(Module.AntialiasingMode.NONE);
            $scope.session.EnableCrossSiteAccess($scope.webglSettings.enableCrossSiteAccess == 'YES');
            $scope.session.SetShapeFilters($scope.webglSettings.shapeFilters); // Turn on misc & planar annotations
            $scope.SetSelectionColor(true);
            $scope.SetSelectionColor(false);
            $scope.SetInertialSpinDecayRate();
        }
    }

    $scope.RegisterTreeObserver = function () {
        if ($scope.treeObserver == null) {
            $scope.treeObserver = new $scope.MyTreeClass();
            $scope.session.RegisterTreeObserver($scope.treeObserver);
        }
    }

    $scope.RegisterSelectionObserver = function () {
        if ($scope.selectionObserver == null) {
            $scope.selectionObserver = new $scope.MySelectionClass();
            $scope.session.RegisterSelectionObserver($scope.selectionObserver);
        }
    }

    $scope.ParseTreeAddMessage = function (messageArr) {
        $rootScope.$emit('ParseTreeAddMessage', { class: 'structureTree', message: messageArr });
    }

    $scope.ParseTreeRemoveMessage = function (messageArr) {
        $rootScope.$emit('ParseTreeRemoveMessage', { class: 'structureTree', message: messageArr });
    }

    $scope.ParseTreeUpdateMessage = function (messageArr) {
        $rootScope.$emit('ParseTreeUpdateMessage', { class: 'structureTree', message: messageArr });
    }

    $scope.ApplyNodeSelectionList = function () {
        $rootScope.$emit('ApplyNodeSelectionList', { class: 'structureTree' });
    }

    $scope.ExpandChildren = function (expand) {
        $rootScope.$emit('ExpandChildren', { class: 'structureTree', message: expand });
    }

    $scope.StripModelIdFromIdPath = function (idpath) {
        var out = idpath;
        if (out[0] == ':') {
            if (out.length == 1) {
                // Root
                return out;
            } else {
                var n = out.indexOf('/');
                if (n == -1) {
                    // Model Root
                    return '/';
                } else {
                    out = out.substr(n);
                }
            }
        }

        return out;
    }

    $scope.ClearNodeSelection = function () {
        if ($scope.session) {
            $scope.nodeSelection = [];
            $scope.DeselectAll(Module.SelectType.SELECT);
            $scope.DeselectAll(Module.SelectType.PRESELECT);
            $scope.ShowContextMenu(false);
            $rootScope.$emit('ClearTree', { class: 'modelannotationsTree' });

            $scope.DelayedApply(50, function () {
                if ($scope.activeMenu == 'partlocation' &&
                    $scope.selection.length != 1) {
                    $scope.activeMenu = 'home';
                }
            });
        }
    }

    $scope.ClearFeatureSelection = function () {
        $rootScope.$emit('ClearFeatureSelection', { class: 'modelannotationsTree' });
    }

    $scope.SetCurrentModelWidget = function (id) {
        var name = "Model" + id;
        $scope.currentModelWidget = $scope.modelWidgets[name];
    }
    //zbh
    $scope.ToggleTableSelection = function (divId) {
        var backgroundColor = "rgb(0, 255, 255)";
        var textColor = "rgb(0, 255, 255)";
        var toggleDiv = document.getElementById("itemList_" + divId);
        // if(toggleDiv.getAttribute('style') && toggleDiv.getAttribute('style').indexOf("background-color: " + backgroundColor) != -1){
        //     toggleDiv.setAttribute('style',"");
        // } else {
        //     toggleDiv.setAttribute('style',"background-color: " + backgroundColor + "; color: " + textColor);
        // }

    }

    $scope.itemListSelection = function (calloutId, divId) {
        if ($scope.view3D) {
            var itemsList = $scope.currentModelWidget.GetItemsList();
            if (itemsList) {
                var intsVec = new Module.VectorNumber();
                for (var i = 0; i < $scope.itemslist.length; ++i) {
                    if ($scope.itemslist[i]["calloutId"] == calloutId) {
                        $scope.itemslist[i]["selected"] = !$scope.itemslist[i]["selected"];
                    }
                    if ($scope.itemslist[i]["selected"]) {
                        var itemIndex = itemsList.GetItemIndexFromCalloutId($scope.itemslist[i].calloutId);
                        intsVec.push_back(itemIndex);
                    } else {
                    }
                }
                itemsList.SelectItemCallouts(intsVec);
            }
        } else if ($scope.viewType == Module.ViewableType.ILLUSTRATION && $scope.viewExtension == "svg") {
            var itemsList = ThingView.GetCallouts();
            if (itemsList.length > 0) {
                for (var i = 0; i < $scope.itemslist.length; i++) {
                    if ($scope.itemslist[i]["calloutId"] == calloutId) {
                        $scope.itemslist[i]["selected"] = !$scope.itemslist[i]["selected"];
                    }
                    if ($scope.itemslist[i]["selected"]) {
                        var calloutID = $scope.itemslist[i]["calloutId"];
                        var callout;
                        for (var j = 0; j < itemsList.length; j++) {
                            if (itemsList[j].getAttribute("id") == calloutID) {
                                callout = itemsList[j];
                            }
                        }
                        if (callout) {
                            ThingView.SelectCallout(callout);
                        }
                    } else {
                        var calloutID = $scope.itemslist[i]["calloutId"];
                        var callout;
                        for (var j = 0; j < itemsList.length; j++) {
                            if (itemsList[j].getAttribute("id") == calloutID) {
                                callout = itemsList[j];
                            }
                        }
                        if (callout) {
                            ThingView.DeselectCallout(callout);
                        }
                    }
                }
            }
        }
        $scope.ToggleTableSelection(divId);
    }

    $scope.GetLeaderLineButtonStyle = function () {
        var pressed = { 'background-color': '#DFE1E2', 'border-style': 'inset' };
        var released = { 'background-color': '#ffffff', 'border-style': 'outset' };

        if ($scope.creatingLeaderLine)
            return pressed;
        else
            return released;
    }

    function handleLeaderlineMouseDown(evt) {
        if (evt.button == 0) { // Left button
            $scope.leaderlineMouseDownX = evt.offsetX;
            $scope.leaderlineMouseDownY = evt.offsetY;
            $scope.leaderlineMouseDownTime = Date.now();
        }
    }

    function handleLeaderlineMouseClick(evt) {
        if (evt.button == 0) {
            $scope.PickLeaderLinePoint(evt.offsetX, evt.offsetY, evt.target.width, evt.target.height);
        }
    }

    function handleLeaderlineTouchStart(evt) {
        if (evt.touches.length == 1) {
            let x = evt.touches[0].pageX ? evt.touches[0].pageX : evt.touches[0].clientX;
            let y = evt.touches[0].pageY ? evt.touches[0].pageY : evt.touches[0].clientY;
            $scope.leaderlineMouseDownX = x - evt.target.offsetLeft;
            $scope.leaderlineMouseDownY = y - evt.target.offsetTop;
            $scope.leaderlineMouseDownTime = Date.now();
            $scope.leaderlineTouchValid = true;
        }
    }

    function handleLeaderlineTouchMove(evt) {
        if (evt.touches.length == 1) {
            let x = evt.touches[0].pageX ? evt.touches[0].pageX : evt.touches[0].clientX;
            let y = evt.touches[0].pageY ? evt.touches[0].pageY : evt.touches[0].clientY;
            x = x - evt.target.offsetLeft;
            y = y - evt.target.offsetTop;

            if (Math.abs(x - $scope.leaderlineMouseDownX) > $scope.leaderlineJitterLimit ||
                Math.abs(y - $scope.leaderlineMouseDownY) > $scope.leaderlineJitterLimit) {
                $scope.leaderlineTouchValid = false;
            }
        }
    }

    function handleLeaderlineTouchEnd(evt) {
        if ($scope.leaderlineTouchValid) {
            $scope.PickLeaderLinePoint($scope.leaderlineMouseDownX, $scope.leaderlineMouseDownY,
                evt.target.width, evt.target.height);
        }
    }

    $scope.PickLeaderLinePoint = function (posx, posy, width, height) {
        let now = Date.now();
        if (Math.abs(posx - $scope.leaderlineMouseDownX) > $scope.leaderlineJitterLimit ||
            Math.abs(posy - $scope.leaderlineMouseDownY) > $scope.leaderlineJitterLimit ||
            now - $scope.leaderlineMouseDownTime > $scope.leaderlineTimeLimit) {
            return;
        }

        $scope.session.DoPickWithCallback(posx, posy, true, false, function (result) {
            if (result.IsValid()) {
                let location = result.GetLocation();
                let position = location.position;
                let idpath = result.GetIdPath();
                let obj = { type: 'WORLD', mousePos: { x: posx, y: posy }, worldPos: position, idpath: idpath };
                $scope.currentLeaderLinePoints.push(obj);

                $scope.currentLeaderLineSegment.AddWorldPoint(position.x, position.y, position.z);
            } else {
                // Get bounding box
                let bbox = $scope.leaderlineBbox;
                if (bbox.valid) {
                    function getDistance(p1, p2) {
                        let x = (p1.x - p2.x) * (p1.x - p2.x),
                            y = (p1.y - p2.y) * (p1.y - p2.y),
                            z = (p1.z - p2.z) * (p1.z - p2.z);
                        let res = x + y + z;
                        return res;
                    }

                    function getMidPoint(p1, p2) {
                        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: (p1.z + p2.z) / 2 };
                    }

                    let pts = new Array(8);
                    pts[0] = { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z };
                    pts[1] = { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z };
                    let viewLoc = $scope.session.GetViewLocation();
                    let viewPos = {};
                    if ($scope.session.IsPerspective()) {
                        viewPos = viewLoc.position;
                    } else {
                        let DtoR = Math.PI / 180;
                        let sx = Math.sin(viewLoc.orientation.x * DtoR),
                            cx = Math.cos(viewLoc.orientation.x * DtoR),
                            sy = Math.sin(viewLoc.orientation.y * DtoR),
                            cy = Math.cos(viewLoc.orientation.y * DtoR),
                            sz = Math.sin(viewLoc.orientation.z * DtoR),
                            cz = Math.cos(viewLoc.orientation.z * DtoR);
                        let viewNormal = { x: cx * cz * sy + sx * sz, y: -cz * sx + cx * sy * sz, z: cx * cy };
                        let boxDiagonal = getDistance(pts[0], pts[1]) * 10;
                        viewPos = { x: viewNormal.x * boxDiagonal, y: viewNormal.y * boxDiagonal, z: viewNormal.z * boxDiagonal };
                    }

                    let bboxCenter = getMidPoint(pts[0], pts[1]);

                    pts[2] = { x: pts[1].x, y: pts[0].y, z: pts[0].z };
                    pts[3] = { x: pts[0].x, y: pts[1].y, z: pts[0].z };
                    pts[4] = { x: pts[0].x, y: pts[0].y, z: pts[1].z };

                    pts[5] = { x: pts[0].x, y: pts[1].y, z: pts[1].z };
                    pts[6] = { x: pts[1].x, y: pts[0].y, z: pts[1].z };
                    pts[7] = { x: pts[1].x, y: pts[1].y, z: pts[0].z };

                    let minId = -1,
                        minDist = 0;
                    for (let i = 0; i < 8; i++) {
                        let dist = getDistance(viewPos, pts[i]);
                        if (i == 0 || dist < minDist) {
                            minDist = dist;
                            minId = i;
                        }
                    }
                    let midPt = getMidPoint(pts[minId], bboxCenter);

                    let plane = new Object();
                    plane.position = midPt;
                    plane.orientation = viewLoc.orientation;
                    plane.scale = { x: 1.0, y: 1.0, z: 1.0 };
                    plane.size = { x: 1.0, y: 1.0, z: 1.0 };
                    plane.valid = true;

                    let spacePt = $scope.session.DoPickPlane(posx, posy, true, plane);
                    if (spacePt.valid) {
                        let position = spacePt.position;
                        let obj = { type: 'WORLD', mousePos: { x: posx, y: posy }, worldPos: position };
                        $scope.currentLeaderLinePoints.push(obj);
                        $scope.currentLeaderLineSegment.AddWorldPoint(position.x, position.y, position.z);
                    }
                } else {
                    let x = posx - width / 2,
                        y = height / 2 - posy;

                    let obj = { type: 'SCREEN', mousePos: { x: posx, y: posy }, screenPos: { x: x, y: y } };
                    $scope.currentLeaderLinePoints.push(obj);
                    $scope.currentLeaderLineSegment.AddScreenPixelPoint(x, y);
                }
            }

            $scope.ResetShadowLeaderLine();
        });
    }

    $scope.AddShadowLeaderLine = function () {
        $scope.shadowLeaderLine = $scope.session.CreateLeaderlineMarker(function () { return new $scope.MyLeaderlineMarkerClass() });
    }

    $scope.RemoveShadowLeaderLine = function () {
        if ($scope.shadowLeaderLine) {
            $scope.session.DeleteLeaderlineMarker($scope.shadowLeaderLine);
            $scope.shadowLeaderLine = null;
        }
    }

    $scope.ResetShadowLeaderLine = function () {
        $scope.RemoveShadowLeaderLine();
        $scope.AddShadowLeaderLine();
        $scope.ApplyLeaderLineProperties($scope.currentLeaderLineSegment);
        $scope.AddShadowLeaderLineSegment();
    }

    $scope.AddShadowLeaderLineSegment = function () {
        let pointsNum = $scope.currentLeaderLinePoints.length;
        if (pointsNum > 1) {
            function AddSegmentPoint(segment, pt) {
                if (pt.type == 'WORLD') {
                    segment.AddWorldPoint(pt.worldPos.x, pt.worldPos.y, pt.worldPos.z);
                } else if (pt.type == 'SCREEN') {
                    segment.AddScreenPixelPoint(pt.screenPos.x, pt.screenPos.y);
                }
            }

            var lineSegment = new Module.LeaderlineSegment();
            $scope.ApplyLeaderLineProperties(lineSegment);

            for (i = 0; i < pointsNum; i++) {
                AddSegmentPoint(lineSegment, $scope.currentLeaderLinePoints[i]);
            }

            $scope.shadowLeaderLine.AddLineSegment(lineSegment);
        }
    }

    $scope.AddLeaderLineListener = function () {
        alert(111);
        var elm = document.getElementById("parentVizDiv");
        if (elm != undefined) {
            elm.addEventListener("mousedown", handleLeaderlineMouseDown, false);
            elm.addEventListener("click", handleLeaderlineMouseClick, false);

            elm.addEventListener("touchstart", handleLeaderlineTouchStart, false);
            elm.addEventListener("touchmove", handleLeaderlineTouchMove, false);
            elm.addEventListener("touchend", handleLeaderlineTouchEnd, false);
        }
    }

    $scope.RemoveLeaderLineListener = function () {
        var elm = document.getElementById("parentVizDiv");
        if (elm != undefined) {
            elm.removeEventListener("mousedown", handleLeaderlineMouseDown, false);
            elm.removeEventListener("click", handleLeaderlineMouseClick, false);

            elm.removeEventListener("touchstart", handleLeaderlineTouchStart, false);
            elm.removeEventListener("touchmove", handleLeaderlineTouchMove, false);
            elm.removeEventListener("touchend", handleLeaderlineTouchEnd, false);
        }
    }

    $scope.RemoveLeaderLinePoint = function (index) {
        $scope.currentLeaderLinePoints.splice(index, 1);
        $scope.ResetShadowLeaderLine();
    }

    $scope.SaveLeaderLine = function () {
        $scope.ApplyLeaderLineProperties($scope.currentLeaderLineSegment);
        $scope.currentLeaderLine.type = "Leaderline";
        $scope.currentLeaderLine.id = $scope.nextLeaderlineId++;
        $scope.currentLeaderLine.AddLineSegment($scope.currentLeaderLineSegment);
        $scope.currentLeaderLine.SetSelectable(true);
        $scope.leaderlines.push($scope.currentLeaderLine);
        $scope.HideLeaderLinePropertiesDialog();
    }

    $scope.ApplyLeaderLineProperties = function (segment) {
        let lineColor = $scope.GetColorRGB($scope.currentLeaderLineColor);
        segment.SetColor(Number(lineColor.r), Number(lineColor.g), Number(lineColor.b));
        segment.SetWidth(Number($scope.leaderLineWidth.id), Module.UNIT_POINT);

        switch ($scope.leaderLineHead.id) {
            default:
            case 1: segment.SetHeadCap(Module.EndCap.ENDCAP_NONE); break;
            case 2: segment.SetHeadCap(Module.EndCap.ENDCAP_ARROW); break;
            case 3: segment.SetHeadCap(Module.EndCap.ENDCAP_SPHERE); break;
        }

        switch ($scope.leaderLineTail.id) {
            default:
            case 1: segment.SetTailCap(Module.EndCap.ENDCAP_NONE); break;
            case 2: segment.SetTailCap(Module.EndCap.ENDCAP_ARROW); break;
            case 3: segment.SetTailCap(Module.EndCap.ENDCAP_SPHERE); break;
        }

        switch ($scope.leaderLineStyle.id) {
            default:
            case 1: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_SOLID); break;
            case 2: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_HIDDENLINE); break;
            case 3: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_LONGDASHDOT); break;
            case 4: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_CENTERLINE); break;
            case 5: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_FOURDOTBREAK); break;
            case 6: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_DASHED); break;
            case 7: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_DASHDASHDASH); break;
            case 8: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_DOTTED); break;
            case 9: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_DOTDOTDOT); break;
            case 10: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_DASHDOTDASH); break;
            case 11: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_DOTDASH); break;
            case 12: segment.SetStipplePattern(Module.StipplePattern.STIPPLEPATTERN_DOTDOTDASH); break;
        }
    }

    $scope.CreateLeaderLine = function () {
        if ($scope.MyLeaderlineMarkerClass == undefined) {
            $scope.CreateWidgetClasses();
        }

        if ($scope.dialogId != "" || $scope.dialogTitleId != "") {
            return;
        }

        if ($scope.creatingLeaderLine) {
            $scope.HideLeaderLinePropertiesDialog();
            return;
        }

        $scope.leaderlineBbox = $scope.session.GetWorldBoundingBox();
        $scope.partColorSelector = 99;
        $scope.ShowLeaderLinePropertiesDialog();
        $scope.DisableBoundMarkerSelection();
        $scope.session.AllowPartSelection(false);
        $scope.session.AllowModelSelection(false);
        $scope.session.SetDragMode(Module.DragMode.NONE);
        $scope.AddShadowLeaderLine();
        $scope.creatingLeaderLine = true;
        $scope.AddLeaderLineListener();

        $scope.currentLeaderLinePoints = [];
        $scope.currentLeaderLine = $scope.session.CreateLeaderlineMarker(function () { return new $scope.MyLeaderlineMarkerClass() });

        $scope.currentLeaderLineSegment = new Module.LeaderlineSegment();

        $scope.ApplyLeaderLineProperties($scope.currentLeaderLineSegment);
    }

    $scope.GetTransformButtonStyle = function () {
        var pressed = { 'background-color': '#DFE1E2', 'border-style': 'inset' };
        var released = { 'background-color': '#ffffff', 'border-style': 'outset' };

        if ($scope.webglSettings.dragMode == "YES")
            return pressed;
        else
            return released;
    }

    $scope.ToggleTransformMode = function () {
        if ($scope.webglSettings.dragMode == 'YES') {
            $scope.webglSettings.dragMode = 'NO';
        } else {
            $scope.webglSettings.dragMode = 'YES';
        }
    }

    $scope.GetPaneButtonStyle = function (pane) {
        var pressed = { 'background-color': '#DFE1E2', 'border-style': 'inset' };
        var released = { 'background-color': '#ffffff', 'border-style': 'outset' };

        if (pane === 'primary') {
            if ($scope.showPrimaryPane == 'YES') {
                return pressed;
            } else {
                return released;
            }
        } else if (pane === 'secondary') {
            if ($scope.showSecondaryPane == 'YES') {
                return pressed;
            } else {
                return released;
            }
        } else if (pane === 'bottom') {
            if ($scope.showBottomPane == 'YES') {
                return pressed;
            } else {
                return released;
            }
        } else if (pane === 'onlyGraphics') {
            if ($scope.showOnlyGraphics == 'YES') {
                return pressed;
            } else {
                return released;
            }
        }
    }

    $scope.ShowPane = function (pane) {
        if (pane === 'primary') {
            if ($scope.showPrimaryPane == 'YES') {
                $scope.showPrimaryPane = 'NO';
            } else {
                $scope.showPrimaryPane = 'YES';
            }
        } else if (pane === 'secondary') {
            if ($scope.showSecondaryPane == 'YES') {
                $scope.showSecondaryPane = 'NO';
            } else {
                $scope.showSecondaryPane = 'YES';
            }
        } else if (pane === 'bottom') {
            if ($scope.showBottomPane == 'YES') {
                $scope.showBottomPane = 'NO';
            } else {
                $scope.showBottomPane = 'YES';
                $scope.EnableConsoleLog();
            }
        } else if (pane === 'onlyGraphics') {
            if ($scope.showOnlyGraphics == 'YES') {
                $scope.showOnlyGraphics = 'NO';
            } else {
                $scope.showOnlyGraphics = 'YES';
            }
        }
        $scope.DelayedApply(50, function () {
            resizeBody();
        });
    }

    $scope.GetRadialButtonId = function (menu, position) {
        let buttonId = 'radialButton' + position + menu.pid;

        if (menu.cid != undefined) {
            buttonId += '_'
            buttonId += menu.cid;
        }

        return buttonId;
    }

    $scope.HideRadialParentButtons = function (idBase, childNum) {
        for (let i = 0; i < childNum; i++) {
            let buttonId = idBase + (i + 1).toString();
            document.getElementById(buttonId).style = null;
        }
        $scope.radialButtonStatus.level = "NONE";
    }

    var tableDisplay = false;
    //zhanghua-零件表格隐藏
    $scope.toggleButtonClicked = function (event) {
        if (tableDisplay) {
            $('#PLDiv').css('bottom', '0');
            $('#PListDiv').css('top', '100%');
            $('.toggleButtonContainer').css('background-image', 'url("./images/arrow_up.png")');
            window.parent.postMessage('tableHidden', '*');
            tableDisplay = false;
        } else {
            $('#PLDiv').css('bottom', '40%');
            $('#PListDiv').css('top', '60%');
            $('.toggleButtonContainer').css('background-image', 'url("./images/arrow_down.png")');
            setTimeout(() => {
                $('table.gridtable tbody').css('height', (Number.parseFloat($('#PListDiv').css('height')) - 56).toString() + 'px');
            }, 210);
            window.parent.postMessage('tableDisplay', '*');
            tableDisplay = true;
        }

    }

    //zhanghua-爆炸图加载
    $scope.transitionButtonClicked = function (event) {
        window.parent.postMessage('transitionButtonClicked', '*');
        window.location.href = window.location.href + '&transitionFlag=true';
        window.location.reload;
    };

    $scope.RadialParentButtonClicked = function (event, position, childNum) {
        let buttonIdBase = 'radialButton' + position;
        console.log($scope.radialButtonStatus);
        if (!event) {
            $scope.HideRadialParentButtons(buttonIdBase, childNum);
            return;
        }

        if ($scope.radialButtonStatus.level == "NONE") {
            let radius = 100;
            let unitDegree = childNum > 1 ? 90 / (childNum - 1) * Math.PI / 180 : 0;

            for (let i = 0; i < childNum; i++) {
                let buttonId = buttonIdBase + (i + 1).toString();
                let degree = unitDegree * i;
                // let x = radius * Math.cos(degree);
                // let y = radius * Math.sin(degree);
                let x = -radius * Math.cos(degree);
                let y = radius * Math.sin(degree);
                let transform = 'translate(' + x.toString() + 'px,' + y.toString() + 'px)';
                console.log(buttonId);
                document.getElementById(buttonId).style.transform = transform;
                document.getElementById(buttonId).style.opacity = '1';
                document.getElementById(buttonId).style.visibility = 'visible';
            }

            $scope.radialButtonStatus.level = "PARENT";
        } else if ($scope.radialButtonStatus.level == "PARENT") {
            $scope.HideRadialParentButtons(buttonIdBase, childNum);
        } else if ($scope.radialButtonStatus.level == "CHILD") {
            // Hide current group buttons
            $scope.RadialGroupButtonClicked(false, position, $scope.radialButtonStatus.group, $scope.radialLTGroupButtonsNum[$scope.radialButtonStatus.group - 1]);
            $scope.radialButtonStatus.level = "NONE";

            $scope.RadialParentButtonClicked(event, position, childNum);
        }

        if (event) {
            event.stopPropagation();
        }
    }

    $scope.HideRadialChildButtons = function (idBase, childNum) {
        for (let i = 0; i < childNum; i++) {
            let buttonId = idBase + (i + 1).toString();
            document.getElementById(buttonId).style = null;
        }

        $scope.radialButtonStatus.level = "NONE";
    }

    $scope.RadialGroupButtonClicked = function (show, position, pid, childNum) {
        let buttonIdBase = 'radialButton' + position + pid.toString() + '_';

        if (show) {
            let distance = 55;

            for (let i = 0; i < childNum; i++) {
                let buttonId = buttonIdBase + (i + 1).toString();
                // let x = distance * (i+1);
                let x = -distance * (i + 1);
                let transform = 'translate(' + x.toString() + 'px,0px)';

                document.getElementById(buttonId).style.transform = transform;
                document.getElementById(buttonId).style.opacity = '1';
                document.getElementById(buttonId).style.visibility = 'visible';
            }

            $scope.radialButtonStatus.level = "CHILD";
        } else {
            $scope.HideRadialChildButtons(buttonIdBase, childNum);
        }
    }

    $scope.ShowRadialGroupButtons = function (event, position, pid) {
        // Hide Parent buttons
        $scope.RadialParentButtonClicked(event, position, $scope.radialLTButtonsNum);
        // Show Zoom group buttons
        $scope.RadialGroupButtonClicked(true, position, pid, $scope.radialLTGroupButtonsNum[pid - 1]);
        $scope.radialButtonStatus.group = pid;
    }

    $scope.RadialChildButtonClicked = function (event, position, pid, cid) {
        if (position == 'LT') {
            if (pid == 1) { // Zoom
                if (cid == undefined) {
                    $scope.ShowRadialGroupButtons(event, position, pid);
                } else {
                    if (cid == 1) {
                        $scope.ZoomView();
                    } else if (cid == 2) {
                        $scope.ZoomSelected();
                    } else if (cid == 3) {
                        $scope.ZoomWindow();
                    } else if (cid == 4) {
                        // Hide Zoom group buttons
                        $scope.RadialGroupButtonClicked(false, position, pid, $scope.radialLTGroupButtonsNum[0]);
                    }
                }
            } else if (pid == 2) { // Visibility
                if (cid == undefined) {
                    $scope.ShowRadialGroupButtons(event, position, pid);
                } else {
                    if (cid == 1) {
                        $scope.SetVisibility(true, true);
                    } else if (cid == 2) {
                        $scope.Isolate();
                    } else if (cid == 3) {
                        $scope.SetVisibility(false, false);
                    } else if (cid == 4) {
                        // Hide Zoom group buttons
                        $scope.RadialGroupButtonClicked(false, position, pid, $scope.radialLTGroupButtonsNum[1]);
                    }
                }
            } else if (pid == 3) { // Orientation
                if (cid == undefined) {
                    $scope.ShowRadialGroupButtons(event, position, pid);
                } else {
                    if (cid == 1) {
                        $scope.session.ApplyOrientPreset(Module.OrientPreset.ORIENT_ISO1, 1000.0);
                        $scope.GetViewLocation();
                    } else if (cid == 2) {
                        $scope.session.ApplyOrientPreset(Module.OrientPreset.ORIENT_ISO2, 1000.0);
                        $scope.GetViewLocation();
                    } else if (cid == 3) {
                        $scope.session.ApplyOrientPreset(Module.OrientPreset.ORIENT_TOP, 1000.0);
                        $scope.GetViewLocation();
                    } else if (cid == 4) {
                        $scope.session.ApplyOrientPreset(Module.OrientPreset.ORIENT_BOTTOM, 1000.0);
                        $scope.GetViewLocation();
                    } else if (cid == 5) {
                        $scope.session.ApplyOrientPreset(Module.OrientPreset.ORIENT_LEFT, 1000.0);
                        $scope.GetViewLocation();
                    } else if (cid == 6) {
                        $scope.session.ApplyOrientPreset(Module.OrientPreset.ORIENT_RIGHT, 1000.0);
                        $scope.GetViewLocation();
                    } else if (cid == 7) {
                        $scope.session.ApplyOrientPreset(Module.OrientPreset.ORIENT_FRONT, 1000.0);
                        $scope.GetViewLocation();
                    } else if (cid == 8) {
                        $scope.session.ApplyOrientPreset(Module.OrientPreset.ORIENT_BACK, 1000.0);
                        $scope.GetViewLocation();
                    } else if (cid == 9) {
                        // Hide Zoom group buttons
                        $scope.RadialGroupButtonClicked(false, position, pid, $scope.radialLTGroupButtonsNum[2]);
                    }
                }
            }
        }

        if (event) {
            event.stopPropagation();
        }
    }

    $scope.menuEnterPos = {};
    $scope.ShowModelsMenu = function (event, click) {
        if (click) {
            if ($scope.ModelsMenuVisible) {
                let pos = getPosition(event);
                if ($scope.menuEnterPos.x != pos.x || $scope.menuEnterPos.y != pos.y) {
                    $scope.ModelsMenuVisible = false;
                }
            } else {
                $scope.ModelsMenuVisible = true;
            }
        } else {
            $scope.menuEnterPos = getPosition(event);
            $scope.ModelsMenuVisible = true;
        }

        $scope.SettingsMenuVisible = false;

        if (event) {
            event.stopPropagation();
        }

        $scope.DelayedApply(10, function () {
            if ($scope.ModelsMenuVisible)
                $scope.AdjustModelsMenuWidth();
            resizeBody();
        });
    }

    $scope.HideModelsMenu = function (event, parent) {
        var elem;
        var pos = getPosition(event);
        if ($scope.menuEnterPos.x == pos.x && $scope.menuEnterPos.y == pos.y) {
            return;
        }

        if (parent) {
            elem = document.getElementById("modelsMenuChildren");
        } else {
            elem = document.getElementById("modelsMenuParent");
        }

        $scope.HideMenus(elem, pos);
    }

    $scope.ShowSettingsMenu = function (event, click) {
        if (click) {
            if ($scope.SettingsMenuVisible) {
                let pos = getPosition(event);
                if ($scope.menuEnterPos.x != pos.x || $scope.menuEnterPos.y != pos.y) {
                    $scope.SettingsMenuVisible = false;
                }
            } else {
                $scope.SettingsMenuVisible = true;
            }
        } else {
            $scope.menuEnterPos = getPosition(event);
            $scope.SettingsMenuVisible = true;
        }

        $scope.ModelsMenuVisible = false;

        if (event) {
            event.stopPropagation();
        }

        $scope.DelayedApply(10, function () {
            resizeBody();
            resizeSettings();
        });
    }

    $scope.HideSettingsMenu = function (event, parent) {
        var elem;
        var pos = getPosition(event);
        if ($scope.menuEnterPos.x == pos.x && $scope.menuEnterPos.y == pos.y) {
            return;
        }

        if (parent) {
            elem = document.getElementById("settingsMenuChildren");
        } else {
            elem = document.getElementById("settingsMenuParent");
        }
        $scope.HideMenus(elem, pos);
    }

    $scope.HideMenus = function (elem, pos) {
        if (elem.offsetLeft <= pos.x && pos.x <= (elem.offsetLeft + elem.offsetWidth) &&
            elem.offsetTop <= pos.y && pos.y <= (elem.offsetTop + elem.offsetHeight)) {
            return;
        }

        $scope.ModelsMenuVisible = false;
        $scope.SettingsMenuVisible = false;
    }

    $scope.AdjustModelsMenuWidth = function () {
        let modelsTopWidth = 0;

        let urlElem = document.getElementById("pvsUrlInput");
        let loadBtnElem = document.getElementById("loadbtn");

        if (urlElem && loadBtnElem) {
            let urlElemRect = urlElem.getBoundingClientRect();
            let loadBtnElemRect = loadBtnElem.getBoundingClientRect();

            if (urlElemRect && loadBtnElemRect) {
                modelsTopWidth = urlElemRect.width + loadBtnElemRect.width + 12;
            }
        }

        let modelsBottomWidth = 0;

        let maxModelWidth = 0;
        for (let i = 0; i < $scope.availableModels.length; i++) {
            let modelId = 'models' + i.toString();
            let modelElem = document.getElementById(modelId);
            if (modelElem) {
                let modelElemRect = modelElem.getBoundingClientRect();
                if (modelElemRect) {
                    let modelElemWidth = modelElemRect.width;
                    if (modelElemWidth > maxModelWidth) {
                        maxModelWidth = modelElemWidth;
                    }
                }
            }
        }

        let closeBtnElem = document.getElementById("closebtn");
        if (closeBtnElem) {
            let closeBtnElemRect = closeBtnElem.getBoundingClientRect();
            if (closeBtnElemRect) {
                modelsBottomWidth = maxModelWidth + closeBtnElemRect.width + 33;
            }
        }

        if (modelsTopWidth > modelsBottomWidth) {
            document.getElementById("modelsMenuChildrenTop").style.width = modelsTopWidth;
            document.getElementById("modelsMenuChildrenBottom").style.width = modelsTopWidth;
        } else {
            document.getElementById("modelsMenuChildrenTop").style.width = modelsBottomWidth;
            document.getElementById("modelsMenuChildrenBottom").style.width = modelsBottomWidth;
        }
    }

    $scope.StopPropagation = function (event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    $scope.HideModelLocationRibbon = function () {
        $scope.DelayedApply(50, function () {
            if ($scope.activeMenu == 'modellocation' &&
                $scope.webglSettings.partSelection != 'NO' ||
                $scope.webglSettings.modelSelection != 'YES') {
                $scope.activeMenu = 'home';
            }
        });
    }

    $scope.HideAllMenu = function () {
        $scope.ModelsMenuVisible = false;
        $scope.SettingsMenuVisible = false;
        $scope.RadialParentButtonClicked(null, 'LT', $scope.radialLTButtonsNum);
        for (let i = 0; i < $scope.radialLTButtonsNum; i++) {
            $scope.RadialGroupButtonClicked(false, 'LT', i + 1, $scope.radialLTGroupButtonsNum[i]);
        }
    }

    $scope.SafeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest')
            this.$eval(fn);
        else
            this.$apply(fn);
    }

    $scope.DelayedApply = function (duration, fn) {
        if (angular.isDefined($scope.delayApply)) {
            $timeout.cancel($scope.delayApply);
        }
        $scope.delayApply = $timeout(function () {
            $scope.$apply(fn);
        }, duration);
    }

    $scope.SetTimer = function () {
        $scope.timer = $interval(function () {
            var elem = document.getElementById("progressBar");
            if (elem) {
                if ($scope.session.HasProgress()) {
                    $scope.progress = $scope.session.GetProgress();

                    elem.style.width = ($scope.progress / 100) + '%';
                    $scope.loadTime = $scope.GetLoadTime();
                } else {
                    $scope.progress = 0;
                    elem.style.width = 0 + '%';
                }
            }
        }, 30);
    }
    $scope.StopTimer = function () {
        if (angular.isDefined($scope.timer)) {
            $scope.progress = $scope.session.GetProgress();
            var elem = document.getElementById("progressBar");
            if (elem) {
                elem.style.width = 0 + '%';
            }
            $interval.cancel($scope.timer);
        }
    }
    $scope.CancelLoad = function () {
        console.log("CancelPendingDownloads");
        $scope.session.CancelPendingDownloads();
    }
});

function PrependModelId(idpath, modelId) {
    var str = ':';
    if (modelId) {
        str += modelId;
    } else {
        str += '1';
    }

    if (idpath.length == 1 && idpath == '/') {
        return str;
    } else if (idpath.length > 1 && idpath[0] == '/') {
        str += idpath;
        return str;
    } else {
        return idpath;
    }
}

/* Draggable Dialog Box - Start*/
var _selectedDialogElement = null,
    _dialog_x_pos = 0,
    _dialog_y_pos = 0,
    _dialog_x_elem = 0,
    _dialog_y_elem = 0;

function _dialog_drag_init(elem) {
    _selectedDialogElement = elem;
    _dialog_x_elem = _dialog_x_pos - _selectedDialogElement.offsetLeft;
    _dialog_y_elem = _dialog_y_pos - _selectedDialogElement.offsetTop;
}

function _dialog_move_elem(e) {
    _dialog_x_pos = window.all ? window.event.clientX : e.pageX;
    _dialog_y_pos = window.all ? window.event.clientY : e.pageY;
    if (_selectedDialogElement !== null) {
        _selectedDialogElement.style.left = (_dialog_x_pos - _dialog_x_elem) + 'px';
        _selectedDialogElement.style.top = (_dialog_y_pos - _dialog_y_elem) + 'px';
    }
}

function _dialog_destroy() {
    _selectedDialogElement = null;
}
/* Draggable Dialog Box - End */

/* encode / decode utf8 - Start */
// Use this to input multibyte characters to API
function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}

// Use this to display multibyte characters on web page
function decode_utf8(s) {
    return decodeURIComponent(escape(s));
}
/* utf encode / decode - End */

tvModule.filter('toScale', function () {
    return function (num, scale) {
        return Number(num).toFixed(Number(scale));
    };
});

//zhanghua
//零件闪烁
var blinkLoop; // 用于循环监测是否可以让球标闪烁
var blinkTimer;
function setViewBlink(callId, scope) {
    // var scope = angular.element(document.getElementById('app')).scope();
    var arr = scope.itemslist;

    if (arr && arr.length > 0) {
        clearInterval(blinkLoop); // 一旦可以获取球标，则停止循环
        let start = 0;
        let end = 40;
        let delay = 300;

        if (blinkTimer) {
            clearInterval(blinkTimer);
        }

        for (var j = 0; j < arr.length; j++) {
            var temp = arr[j];
            temp.selected = false;
        }

        for (var i = 0; i < arr.length; i++) {
            let temp = arr[i];
            if (callId == temp.label) {
                if (!temp.selected) {
                    blinkTimer = setInterval(function () {
                        if (start >= end) {
                            clearInterval(blinkTimer);
                        }
                        start++;
                        if (start % 2 !== 0) {
                            scope.itemListSelection(temp.calloutId, temp.calloutId);
                        } else {
                            scope.ClearNodeSelection()
                        }
                    }
                        , delay);
                }
            }
        }
    }
}

tvModule.directive('tview', function ($timeout) {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: '<div id="{{sessionId}}"></div>',
        link: function ($scope, elm, attrs, ctrl) {
            var sessionId = $scope.sessionId;
            $scope.showSpinner = true;
            $scope.webglVersion = 'Version: ' + ThingView.GetFileVersion();
            ThingView.init("js/ptc/thingview/", function () { // ThingView.init should only ever be called once in a web page
                ThingView.SetInitFlags(
                    Module.ThingViewInitFlags.LOAD_PVS_PROPERTIES.value |
                    Module.ThingViewInitFlags.CLEAR_UNUSED_SHAPES_ON_DESTRUCTION.value |
                    Module.ThingViewInitFlags.ENABLE_HIDDEN_RC_SHAPE_INSTANCE.value |
                    Module.ThingViewInitFlags.LOAD_MARKUPS.value |
                    Module.ThingViewInitFlags.LOAD_MEASUREMENTS.value |
                    Module.ThingViewInitFlags.USE_ADVANCED_SELECTION_MANAGER.value |
                    Module.ThingViewInitFlags.LOAD_ITEMSLIST.value |
                    Module.ThingViewInitFlags.ENABLE_INSTANCE_SYSTEM_PROPERTIES.value |
                    Module.ThingViewInitFlags.ENABLE_FEATURE_MANAGER.value |
                    Module.ThingViewInitFlags.ILLUSTRATION_UNLOAD_PARTS.value
                );
                $scope.session = ThingView.CreateSession($scope.sessionId);
                ThingView.SetHighMemoryUsageValue(100); // MB
                $scope.SetBackgroundColor();


                //zbh
                //$scope.model_temp = $scope.session.MakeModel();
                //$scope.model_temp.LoadFromURLWithCallback("http://localhost:8080/imeWeb/jsp/tis/epc/creoview_links_files/file/CX11-211-01-A1/CX11-211-01-A1.pvz", true, true, false, function(success, isStructure, errorStack){
                //console.log("Model LoadFromURLWithCallback - success: " + success + ", isStructure: " + isStructure);
                //});

                //console.log("widget1 path" + path);
                var widget1 = $scope.session.MakeModel();
                widget1.type = "Model";
                widget1.id = $scope.nextModelWidgetId;;
                widget1.name = widget1.type + widget1.id;
                widget1.$scope = $scope;
                $scope.modelWidgets[widget1.name] = widget1;
                $scope.currentModelWidget = widget1;
                //var path = window.parent.addFile();
                //zhanghua是否显示播放按钮
                var transitionButtonFlag = $.urlGet()['hasTransitionButton'];
                if (transitionButtonFlag) {
                    $scope.hasTransitionButton = transitionButtonFlag === 'true' ? true : false;
                }
                //zhanghua
                var path = $.urlGet()['partNumber'];
                var transitionFlag = $.urlGet()['transitionFlag'];
                if (path) {
                    switch (path) {
                        case '23XB351':
                            if (transitionFlag) {
                                path = './illustrations/ctmc/remove1.pvz';
                            } else {
                                path = './illustrations/ctmc/23XB351.pvz';
                            }
                            break;
                        case '21BBG2600000.01':
                            // console.log('transitionFlag: ' + transitionFlag);
                            if (transitionFlag) {
                                path = './illustrations/ctmc/21BBG2600000/21BBG2600000DH.pvz';
                            } else {
                                path = './illustrations/ctmc/21BBG2600000/TAV-21BBG2600000.01.pvz';
                            }
                            // path='./illustrations/ctmc/21BBG2610000/TAV-21BBG2600000.01.pvz';
                            // path='./illustrations/CC11-651-02-A1.pvz';
                            // path='./illustrations/ctmc/123.pvz'
                            // path='./illustrations/ctmc/remove1.pvz';
                            break;
                        case '21BBG2600000.02':
                            if (transitionFlag) {
                                path = './illustrations/ctmc/21BBG2600000/21BBG2600000DH.pvz';
                            } else {
                                path = './illustrations/ctmc/21BBG2600000/TAV-21BBG2600000.02.pvz';
                            }
                            break;
                        case '21BBG2600000.03':
                            if (transitionFlag) {
                                path = './illustrations/ctmc/21BBG2600000/21BBG2600000DH.pvz';
                            } else {
                                path = './illustrations/ctmc/21BBG2600000/TAV-21BBG2600000.03.pvz';
                            }
                            break;
                        case '21BBG2610000':
                            if (transitionFlag) {
                                path = './illustrations/ctmc/remove1.pvz';
                            } else {
                                path = './illustrations/ctmc/21BBG2610000/TAV-21BBG2610000.pvz';
                            }
                            break;
                        case '23BBG252AA00.01':
                            if (transitionFlag) {
                                path = './illustrations/ctmc/23BBG252AA00/test01.pvz';
                            } else {
                                path = './illustrations/ctmc/23BBG252AA00/TAV-23BBG252AA00.01.pvz';
                            }
                            break;
                        case '23BBG252AA00.02':
                            if (transitionFlag) {
                                path = './illustrations/ctmc/remove1.pvz';
                            } else {
                                path = './illustrations/ctmc/23BBG252AA00/TAV-23BBG252AA00.02.pvz';
                            }
                            break;
                        case '23BBG252AA00.03':
                            if (transitionFlag) {
                                path = './illustrations/ctmc/remove1.pvz';
                            } else {
                                path = './illustrations/ctmc/23BBG252AA00/TAV-23BBG252AA00.03.pvz';
                            }
                            break;
                        case '23BBG252AA00.04':
                            if (transitionFlag) {
                                path = './illustrations/ctmc/remove1.pvz';
                            } else {
                                path = './illustrations/ctmc/23BBG252AA00/TAV-23BBG252AA00.04.pvz';
                            }
                            break;
                        case '23BBG252AA00.05':
                            if (transitionFlag) {
                                path = './illustrations/ctmc/23BBG252AA00/yifenzhongdonghua.pvz'; //lingjiandonghua.pvz  TAV-23BBG252AA00_animation
                            } else {
                                path = './illustrations/ctmc/23BBG252AA00/new23BBG252AA00.05.pvz';
                            }
                            break;
                        default:
                            if (transitionFlag) {
                                path = './illustrations/ctmc/remove1.pvz';
                            } else {
                                path = './illustrations/ctmc/21BBG2600000/TAV-21BBG2600000.01.pvz';
                            }
                            break;
                    }
                } else {
                    // path='./illustrations/CX11-373-01-A1.pvz';   illustrations/ctmc/worldcar-brake-multi-figure.pvz
                    if (transitionFlag) {
                        path = './illustrations/ctmc/worldcar-brake-multi-figure.pvz';
                    } else {
                        path = './illustrations/ctmc/worldcar-brake-multi-figure.pvz';
                    }
                }
                console.log("===" + path);
                //majar
                path = './illustrations/ctmc/worldcar-brake-multi-figure.pvz'
                //widget1.LoadFromURLWithCallback这个函数在这里调用时，无法给$scope.structure赋值，在后面打开弹窗时无法获取let propsJson = $scope.structure.GetInstanceProperties(strippedIdpath)
                //如果换成官方版本demo中的$scope.structure = $scope.session.LoadStructureWithURL()方法，会报错，比较是不是同一个版本（ptc2中是官方demo依赖库文件
                widget1.LoadFromURLWithCallback(path, true, true, true, function(success, isStructure, errorStack){
                   $('#app').css('display','');
                   $('#appLoding').css('display','none');
                   $('#appLoding').mLoading("hide");
                    console.log("Model LoadFromURLWithCallback - success: " + success + ", isStructure: " + isStructure);
                    if (success === true) {
                        $scope.loadState = "Loaded";
                        console.log("last process");

                        if($.urlGet()['model']){

                        }else{
                            $scope.LoadIllustration($scope.illustrations[0]);
                        }
                    if ($scope.MyModelClass == undefined) {
                        $scope.CreateWidgetClasses();
                    }
                        $scope.StructuerLoadComplete();
                    }
                    var playAnimationFlag = setInterval(function(){
                        if($scope.currentModelWidget.HasAnimation()){
                            $scope.currentModelWidget.PlayAnimation();
                            clearInterval(playAnimationFlag);
                        }
                    }, 1000);
                });

                $scope.session.AllowPartSelection($scope.webglSettings.partSelection == 'YES');
                if ($scope.webglSettings.dragMode == 'YES')
                    $scope.session.SetDragMode(Module.DragMode.DRAG);
                else
                    $scope.session.SetDragMode(Module.DragMode.NONE);
                $scope.session.SetDragSnap($scope.webglSettings.dragSnap == 'YES');
                $scope.SetNavigationMode($scope.webglSettings.navMode);
                $scope.session.ShowSpinCenter($scope.webglSettings.showSpinCenter == 'YES');
                if ($scope.webglSettings.antiAliasing == "YES")
                    $scope.session.SetAntialiasingMode(Module.AntialiasingMode.SS4X);
                else
                    $scope.session.SetAntialiasingMode(Module.AntialiasingMode.NONE);
                $scope.session.EnableCrossSiteAccess($scope.webglSettings.enableCrossSiteAccess == 'YES');
                $scope.session.SetShapeFilters($scope.webglSettings.shapeFilters); // Turn on misc & planar annotations
                $scope.SetSelectionColor(true);
                $scope.SetSelectionColor(false);
                $scope.SetInertialSpinDecayRate();
                $scope.showSpinner = false;
                $scope.$apply();

                //zhanghua 闪烁
                var blinkId = $.urlGet()['blinkId'];
                if (path.toString().indexOf('23BBG252AA00.05') != -1) {
                    blinkLoop = setInterval(() => {
                        if (blinkId) {
                            setViewBlink(blinkId, $scope);
                        }
                    }
                        , 200);
                    // setTimeout(()=>{
                    //     if (blinkId) {
                    //         setViewBlink(blinkId, $scope);
                    //     }
                    // },1000)
                }
            });
        }
    };
});

tvModule.directive('itemslist', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: ' \
        <div class="widthFull"> \
            <div class="row"> \
                <div class="cell headColor" style="padding: 1px 2px;">Callout ID</div> \
                <div class="cell headColor" style="padding: 1px 2px;">Label</div> \
                <div class="cell headColor">Name</div> \
                <div class="cell headColor" style="padding: 1px 2px;">Quantity</div> \
            </div> \
            <div id="itemList_{{$index}}" class="property-row" ng-repeat="item in itemslist" ng-click="itemListSelection(item.calloutId, $index)"> \
                <div class="cell">{{item.calloutId}}</div> \
                <div class="cell">{{item.label}}</div> \
                <div class="cell" style="padding: 1px 2px;">{{item.nameTag}}</div> \
                <div class="cell">{{item.quantity}}</div> \
            </div> \
        </div>',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

tvModule.directive('properties', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: ' \
        <div class="widthFull" id="properties"> \
            <div class="row" ng-show="foundIds.length > 0"> \
                <div class="property-cell headColor">ID Path</div> \
                <div class="property-cell headColor">Instance Name</div> \
            </div> \
            <div class="property-row" ng-show="foundIds.length > 0" \
                                      ng-repeat="id in foundIds" \
                                      ng-mouseenter="HighlightPart(id.origId)" \
                                      ng-mouseleave="DehighlightPart(id.origId)"> \
                <div class="property-cell">{{id.origId}}</div> \
                <div class="property-cell">{{id.instName}}</div> \
            </div> \
            <div class="row" ng-show="foundIds.length == 0 && selection.length == 1"> \
                <div class="property-cell headColor">Name</div> \
                <div class="property-cell headColor">Category</div> \
                <div class="property-cell headColor">Value</div> \
            </div> \
            <div class="property-row" ng-show="foundIds.length == 0 && selection.length == 1" \
                                      ng-repeat="prop in instanceProperties[0]"> \
                <div class="property-cell">{{prop.name}}</div> \
                <div class="property-cell">{{prop.category}}</div> \
                <div class="property-cell">{{prop.value}}</div> \
            </div> \
            <div class="row" ng-show="foundIds.length == 0 && selection.length > 1"> \
                <div class="property-cell headColor">Part</div> \
                <div class="property-cell headColor" ng-repeat="name in propertyNames">{{name}}</div> \
            </div> \
            <div class="property-row" title="{{GetPropertybyName(prop, \'instanceName\')}}" \
                                      ng-show="foundIds.length == 0 && selection.length > 1" \
                                      ng-repeat="prop in instanceProperties" \
                                      ng-mouseenter="HighlightPart(GetPropertybyName(prop, \'strippedIdpath\'))" \
                                      ng-mouseleave="DehighlightPart(GetPropertybyName(prop, \'strippedIdpath\'))"> \
                <div class="property-cell keyColor">{{GetPropertybyName(prop, \'instanceName\')}}</div> \
                <div class="property-cell" ng-repeat="name in propertyNames"> \
                    {{GetPropertybyName(prop, name)}} \
                </div> \
            </div> \
        </div>',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

tvModule.directive('bboxsphere', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: ' \
        <div class="widthFull"> \
            <div class="row"> \
                <div class="cell keyColor">ID</div> \
                <div class="cell keyColor">Type</div> \
                <div class="cell keyColor">Dimension \
                    <input id="boxInfo" type="checkbox" ng-model="showBoundBoxInfo" ng-true-value="\'YES\'" ng-false-value="\'NO\'" /> \
                    <label for="boxInfo">Show Box Info</label> \
                </div> \
                <div class="cell keyColor">Update</div> \
                <div class="cell keyColor">Unsel Drag Opt.</div> \
                <div class="cell keyColor">Sel Drag Opt.</div> \
                <div class="cell keyColor">Selectable</div> \
                <div class="cell keyColor">Selected</div> \
                <div class="cell keyColor">Remove</div> \
            </div> \
            <div class="row" ng-repeat="x in boundWidgets | orderBy: id"> \
                <div class="cell">{{ x.id }}</div> \
                <div class="cell">{{ x.type }}</div> \
                <div class="cell"> \
                    <div class="table widthFull" ng-show="x.type == \'Box\'"> \
                        <div class="row" ng-show="showBoundBoxInfo != \'YES\'"> \
                            <div class="table widthFull"> \
                                <div class="cell keyColor" style="width: 10%;">Min</div> \
                                <div class="cell" style="width: 20px;">X</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.minx" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Y</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.miny" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Z</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.minz" size="8" /></div> \
                            </div> \
                        </div> \
                        <div class="row" ng-show="showBoundBoxInfo != \'YES\'"> \
                            <div class="table widthFull"> \
                                <div class="cell keyColor" style="width: 10%;">Max</div> \
                                <div class="cell" style="width: 20px;">X</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.maxx" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Y</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.maxy" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Z</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.maxz" size="8" /></div> \
                            </div> \
                        </div> \
                        <div class="row" ng-show="showBoundBoxInfo == \'YES\'"> \
                            <div class="table widthFull"> \
                                <div class="cell keyColor" style="min-width: 85px;">Position</div> \
                                <div class="cell" style="width: 20px;">X</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.posx" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Y</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.posy" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Z</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.posz" size="8" /></div> \
                            </div> \
                        </div> \
                        <div class="row" ng-show="showBoundBoxInfo == \'YES\'"> \
                            <div class="table widthFull"> \
                                <div class="cell keyColor" style="min-width: 85px;">Orientation</div> \
                                <div class="cell" style="width: 20px;">X</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.orix" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Y</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.oriy" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Z</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.oriz" size="8" /></div> \
                            </div> \
                        </div> \
                        <div class="row" ng-show="showBoundBoxInfo == \'YES\'"> \
                            <div class="table widthFull"> \
                                <div class="cell keyColor" style="min-width: 85px;">Size</div> \
                                <div class="cell" style="width: 20px;">X</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.sizex" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Y</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.sizey" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Z</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.sizez" size="8" /></div> \
                            </div> \
                        </div> \
                    </div> \
                    <div class="table widthFull" ng-show="x.type == \'Sphere\'"> \
                        <div class="row"> \
                            <div class="table widthFull"> \
                                <div class="cell keyColor">Center</div> \
                                <div class="cell" style="width: 20px;">X</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.cenx" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Y</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.ceny" size="8" /></div> \
                                <div class="cell" style="width: 20px;">Z</div> \
                                <div class="cell"><input type="text" style="text-align: center;" ng-model="x.cenz" size="8" /></div> \
                            </div> \
                        </div> \
                        <div class="row"> \
                            <div class="table widthFull"> \
                                <div class="cell keyColor">Radius</div> \
                                <div class="cell "><input type="text" style="text-align: center;" ng-model="x.radius" size="8" /></div> \
                            </div> \
                        </div> \
                    </div> \
                </div> \
                <div class="cell"> \
                    <input type="button" value="Update" ng-click="UpdateBoundingMarker(x.name)"/> \
                </div> \
                <div class="cell"> \
                    <div class="dragOptionDiv"> \
                        <label class="dragOptionParentLabel" ng-style="GetDOParentLabelStyle(x.name, \'unselOptTranslate\')" ng-click="SetDOUnselTranslate(x.name, \'All\')" ng-show="x.type == \'Box\'">Translate</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptTranslateX\')" ng-click="SetDOUnselTranslate(x.name, \'X\')" ng-show="x.type == \'Box\'">X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptTranslateY\')" ng-click="SetDOUnselTranslate(x.name, \'Y\')" ng-show="x.type == \'Box\'">Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptTranslateZ\')" ng-click="SetDOUnselTranslate(x.name, \'Z\')" ng-show="x.type == \'Box\'">Z</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptTranslateP\')" ng-click="SetDOUnselTranslate(x.name, \'P\')" ng-show="x.type == \'Box\'">P</label> \
                    </div> \
                    <div class="dragOptionDiv"> \
                        <label class="dragOptionParentLabel" ng-style="GetDOParentLabelStyle(x.name, \'unselOptRotate\')" ng-click="SetDOUnselRotate(x.name, \'All\')" ng-show="x.type == \'Box\'">Rotate</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptRotateX\')" ng-click="SetDOUnselRotate(x.name, \'X\')" ng-show="x.type == \'Box\'">X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptRotateY\')" ng-click="SetDOUnselRotate(x.name, \'Y\')" ng-show="x.type == \'Box\'">Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptRotateZ\')" ng-click="SetDOUnselRotate(x.name, \'Z\')" ng-show="x.type == \'Box\'">Z</label> \
                    </div> \
                    <div class="dragOptionDiv"> \
                        <label class="dragOptionParentLabel" ng-style="GetDOParentLabelStyle(x.name, \'unselOptArrow\')" ng-click="SetDOUnselArrow(x.name, \'All\')" ng-show="x.type == \'Box\'">Arrow</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptArrowXP\')" ng-click="SetDOUnselArrow(x.name, \'XP\')" ng-show="x.type == \'Box\'">+X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptArrowXM\')" ng-click="SetDOUnselArrow(x.name, \'XM\')" ng-show="x.type == \'Box\'">-X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptArrowYP\')" ng-click="SetDOUnselArrow(x.name, \'YP\')" ng-show="x.type == \'Box\'">+Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptArrowYM\')" ng-click="SetDOUnselArrow(x.name, \'YM\')" ng-show="x.type == \'Box\'">-Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptArrowZP\')" ng-click="SetDOUnselArrow(x.name, \'ZP\')" ng-show="x.type == \'Box\'">+Z</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptArrowZM\')" ng-click="SetDOUnselArrow(x.name, \'ZM\')" ng-show="x.type == \'Box\'">-Z</label> \
                    </div> \
                    <div class="dragOptionDiv"> \
                        <label class="dragOptionParentLabel" ng-style="GetDOParentLabelStyle(x.name, \'unselOptFace\')" ng-click="SetDOUnselFace(x.name, \'All\')" ng-show="x.type == \'Box\'">Face</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptFaceXP\')" ng-click="SetDOUnselFace(x.name, \'XP\')" ng-show="x.type == \'Box\'">+X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptFaceXM\')" ng-click="SetDOUnselFace(x.name, \'XM\')" ng-show="x.type == \'Box\'">-X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptFaceYP\')" ng-click="SetDOUnselFace(x.name, \'YP\')" ng-show="x.type == \'Box\'">+Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptFaceYM\')" ng-click="SetDOUnselFace(x.name, \'YM\')" ng-show="x.type == \'Box\'">-Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptFaceZP\')" ng-click="SetDOUnselFace(x.name, \'ZP\')" ng-show="x.type == \'Box\'">+Z</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'unselOptFaceZM\')" ng-click="SetDOUnselFace(x.name, \'ZM\')" ng-show="x.type == \'Box\'">-Z</label> \
                    </div> \
                    <div class="dragOptionDiv"> \
                        <label class="dragOptionParentLabel" ng-style="GetDOParentLabelStyle(x.name, \'unselOptPlanar\')" ng-click="SetDOUnselPlanar(x.name, \'All\')" ng-show="x.type == \'Box\'">Planar</label> \
                    </div> \
                </div> \
                <div class="cell"> \
                    <div class="dragOptionDiv"> \
                        <label class="dragOptionParentLabel" ng-style="GetDOParentLabelStyle(x.name, \'selOptTranslate\')" ng-click="SetDOSelTranslate(x.name, \'All\')" ng-show="x.type == \'Box\'">Translate</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptTranslateX\')" ng-click="SetDOSelTranslate(x.name, \'X\')" ng-show="x.type == \'Box\'">X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptTranslateY\')" ng-click="SetDOSelTranslate(x.name, \'Y\')" ng-show="x.type == \'Box\'">Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptTranslateZ\')" ng-click="SetDOSelTranslate(x.name, \'Z\')" ng-show="x.type == \'Box\'">Z</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptTranslateP\')" ng-click="SetDOSelTranslate(x.name, \'P\')" ng-show="x.type == \'Box\'">P</label> \
                    </div> \
                    <div class="dragOptionDiv"> \
                        <label class="dragOptionParentLabel" ng-style="GetDOParentLabelStyle(x.name, \'selOptRotate\')" ng-click="SetDOSelRotate(x.name, \'All\')" ng-show="x.type == \'Box\'">Rotate</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptRotateX\')" ng-click="SetDOSelRotate(x.name, \'X\')" ng-show="x.type == \'Box\'">X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptRotateY\')" ng-click="SetDOSelRotate(x.name, \'Y\')" ng-show="x.type == \'Box\'">Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptRotateZ\')" ng-click="SetDOSelRotate(x.name, \'Z\')" ng-show="x.type == \'Box\'">Z</label> \
                    </div> \
                    <div class="dragOptionDiv"> \
                        <label class="dragOptionParentLabel" ng-style="GetDOParentLabelStyle(x.name, \'selOptArrow\')" ng-click="SetDOSelArrow(x.name, \'All\')" ng-show="x.type == \'Box\'">Arrow</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptArrowXP\')" ng-click="SetDOSelArrow(x.name, \'XP\')" ng-show="x.type == \'Box\'">+X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptArrowXM\')" ng-click="SetDOSelArrow(x.name, \'XM\')" ng-show="x.type == \'Box\'">-X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptArrowYP\')" ng-click="SetDOSelArrow(x.name, \'YP\')" ng-show="x.type == \'Box\'">+Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptArrowYM\')" ng-click="SetDOSelArrow(x.name, \'YM\')" ng-show="x.type == \'Box\'">-Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptArrowZP\')" ng-click="SetDOSelArrow(x.name, \'ZP\')" ng-show="x.type == \'Box\'">+Z</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptArrowZM\')" ng-click="SetDOSelArrow(x.name, \'ZM\')" ng-show="x.type == \'Box\'">-Z</label> \
                    </div> \
                    <div class="dragOptionDiv"> \
                        <label class="dragOptionParentLabel" ng-style="GetDOParentLabelStyle(x.name, \'selOptFace\')" ng-click="SetDOSelFace(x.name, \'All\')" ng-show="x.type == \'Box\'">Face</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptFaceXP\')" ng-click="SetDOSelFace(x.name, \'XP\')" ng-show="x.type == \'Box\'">+X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptFaceXM\')" ng-click="SetDOSelFace(x.name, \'XM\')" ng-show="x.type == \'Box\'">-X</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptFaceYP\')" ng-click="SetDOSelFace(x.name, \'YP\')" ng-show="x.type == \'Box\'">+Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptFaceYM\')" ng-click="SetDOSelFace(x.name, \'YM\')" ng-show="x.type == \'Box\'">-Y</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptFaceZP\')" ng-click="SetDOSelFace(x.name, \'ZP\')" ng-show="x.type == \'Box\'">+Z</label> \
                        <label class="dragOptionChildLabel" ng-style="GetDOChildLabelStyle(x.name, \'selOptFaceZM\')" ng-click="SetDOSelFace(x.name, \'ZM\')" ng-show="x.type == \'Box\'">-Z</label> \
                    </div> \
                    <div class="dragOptionDiv"> \
                        <label class="dragOptionParentLabel" ng-style="GetDOParentLabelStyle(x.name, \'selOptPlanar\')" ng-click="SetDOSelPlanar(x.name, \'All\')" ng-show="x.type == \'Box\'">Planar</label> \
                    </div> \
                </div> \
                <div class="cell"> \
                    <input type="button" value="O" ng-click="SetBoundMarkerSelectable(x.name, true)"/> \
                    <input type="button" value="X" ng-click="SetBoundMarkerSelectable(x.name, false)"/> \
                </div> \
                <div class="cell"> \
                    <input type="checkbox" ng-click="SelectBoundMarker(x)" ng-model="x.selected" ng-true-value="\'YES\'" ng-false-value="\'NO\'"/> \
                </div> \
                <div class="cell"><input type="button" value="X" ng-click="RemoveBoundingMarker(x.name)"/></div> \
            </div> \
        </div> \
        ',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

tvModule.directive('markups', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: '<div class="list"> \
                   <button class="viewableitem" ng-repeat="x in boundWidgets | orderBy: id">{{x.type}} {{x.id + 1}}</button> \
                   <button class="viewableitem" ng-repeat="x in leaderlines track by $index">{{x.type}} {{x.id}}</button> \
                   </div>',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

tvModule.directive('selinstances', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: '<div class="list"> \
                   <button class="viewableitem" ng-repeat="seli in selection">{{seli}}</button> \
                   </div>',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

tvModule.directive('console', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: '<div class="list" id="log"> \
                   </div>',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

tvModule.directive('layers', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: '<div class="list"> \
                        <div class="layertitle">{{layerTargetText}}<span ng-show="layers.length>0">({{layers.length}})</span></div> \
                        <div class="layeritem" \
                             ng-repeat="layer in layers" \
                             ng-style="GetLayerStyle(layer);" \
                             ng-click="LayerClicked($event, layer);" \
                             ng-mouseenter="LayerPreselect(layer, true)" \
                             ng-mouseleave="LayerPreselect(layer, false)"> \
                            <input type="checkbox" id="{{GetLayerID(layer.name)}}" \
                                   ng-checked="GetLayerCheckState(layer)" \
                                   ng-click="SetLayerCheckState($event, layer)" />\
                            <img ng-src="{{GetLayerIcon(layer)}}" \
                                 ng-style="GetLayerIconStyle(layer)" /> \
                            <span>{{layer.name}}</span> \
                        </div> \
                    </div>',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

tvModule.directive('spatialfilter', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: '<div class="list noselect" ng-click="SpatialFilterResultClearSelection($event)"> \
                        <div class="layertitle">Spatial Filter - {{spatialFilterResult.query.type}}<span>({{spatialFilterResult.filteredItemsNum}})</span></div> \
                        <div class="viewableitem" style="padding-left: 2px; width: 99%;" \
                             ng-repeat="item in spatialFilterResult.filteredItems" \
                             ng-style="GetSpatialFilterResultStyle(item)" \
                             ng-mouseenter="SpatialFilterResultPreselect(item, true)" \
                             ng-mouseleave="SpatialFilterResultPreselect(item, false)" \
                             ng-click="SpatialFilterResultSelect($event, item)" \
                             ng-dblclick="SpatialFilterResultZoom($event, item)" \
                             title="{{item.id}}"> \
                            <span>{{item.name}}</span> \
                        </div> \
                    </div>',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

//zhanghua增加视图
tvModule.directive('multiviews', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: '<div> \
                        <div> \
                            <div class="viewButtonContainer noselect" ng-show="view3D && loadState == \'Loaded\'"> \
                                <div class="radialButtons"> \
                                    <div class="radialButton" style="ma" id="toggleButton" ng-click="SetDefaultView()"> \
                                        <div class="figureCenterModel"> \
                                            模型 \
                                        </div> \
                                    </div> \
                                </div> \
                            </div> \
                        </div> \
                        <div class="viewListContainer"> \
                            <ul> \
                                <li ng-repeat="illustration in illustrations track by $index" ng-click="LoadIllustration(illustration)"> \
                                    <div class="noselect" ng-show="view3D && loadState == \'Loaded\'"> \
                                        <div class="radialButtons"> \
                                            <div class="radialButton" id="toggleButton"> \
                                                <div class="figureCenter"> \
                                                    <!--{{illustration.humanReadableName}}-->图{{$index + 1}} \
                                                </div> \
                                            </div> \
                                        </div> \
                                    </div> \
                                </li> \
                            </ul> \
                        </div> \
                    </div>',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

tvModule.directive('viewables', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: '<div class="list"> \
                        <div class="viewables"> \
                            <a href="#" ng-click="ToggleViewablesModel();">Model \
                                <span ng-show="viewablesModelDisplay == false">({{viewStates.length + 2}})</span> \
                            </a> \
                        </div> \
                        <div ng-show="viewablesModelDisplay == true"> \
                            <button class="viewableitem" ng-show="loadState == \'Loaded\'" ng-click="SetDefaultView()">Default View</button> \
                            <button class="viewableitem" ng-show="loadState == \'Loaded\'" ng-click="SetEmptyView()">Empty View</button> \
                            <button class="viewableitem" ng-repeat="viewState in viewStates track by $index" ng-click="SetViewState(viewState.viewStateName, viewState.viewStatePath)">{{viewState.viewStateName}}</button> \
                        </div> \
                        <div class="viewables" ng-show="illustrations.length>0"> \
                            <a href="#" ng-click="ToggleViewablesFigures();">Figures \
                                <span ng-show="viewablesFiguresDisplay == false">({{illustrations.length}})</span> \
                            </a> \
                        </div> \
                        <div ng-show="viewablesFiguresDisplay == true"> \
                            <button class="viewableitem" ng-repeat="illustration in illustrations" ng-click="LoadIllustration(illustration)">{{illustration.humanReadableName}}</button> \
                        </div> \
                        <div class="viewables" ng-show="viewablesData.length>0"> \
                            <a href="#" ng-click="ToggleViewablesDocuments();">Documents \
                                <span ng-show="viewablesDocumentsDisplay == false">({{viewablesData.length}})</span> \
                            </a> \
                        </div> \
                        <div class="viewablesDocumentsDisplay" ng-show="viewablesDocumentsDisplay == true"> \
                            <div class="viewableitemDiv" ng-repeat="viewable in viewablesData track by $index">\
                                <button class="viewableitem" ng-mouseenter="ShowDocumentTooltip(viewable)" ng-mouseleave="HideDocumentTooltip(viewable)" ng-click="LoadDocument(viewable)">{{viewable.humanReadableDisplayName}}</button> \
                            </div>\
                        </div> \
                    </div>',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

tvModule.directive('annotations', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: '<div class="list"> \
                        <button class="viewableitem" ng-repeat="annoset in annotationSets track by $index" ng-click="LoadAnnotationSet(annoset)">{{annoset}}</button> \
                    </div>',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

tvModule.directive('viewablesData', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: 'true',
        template: '<div class="list"> \
                        <ul> \
                             <button ng-repeat="viewable in viewablesData track by $index" ng-click="LoadDocument(viewable)">{{viewable}}</button> \
                        </ul> \
                    </div>',
        link: function ($scope, elm, attrs, ctrl) {
        }
    };
});

tvModule.directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        w.bind('resize', function () {
            // resizeBody();
        });
    }
});

tvModule.directive('urlChecker', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, mCtrl) {
            function validation(value) {
                let upValue = angular.lowercase(value);
                if (upValue.indexOf(".pvs") != -1 ||
                    upValue.indexOf(".pvz") != -1) {
                    mCtrl.$setValidity('pvspvz', true);
                } else {
                    mCtrl.$setValidity('pvspvz', false);
                }
                return value;
            }
            mCtrl.$parsers.push(validation);
        }
    };
});

tvModule.directive('colorPicker', ['$window', function ($window) {
    var tmpl = ''
        + '<div class="angular-color-picker">'
        + '    <div class="_variations" ng-style="{ backgroundColor: hueBackgroundColor }">'
        + '        <div class="_whites">'
        + '            <div class="_blacks">'
        + '                <div class="_cursor" ng-if="colorCursor" ng-style="{ left: colorCursor.x - 5 + \'px\', top: colorCursor.y - 5 + \'px\' }"></div>'
        + '                <div class="_mouse-trap" ng-mousedown="startDrag($event, \'color\')"></div>'
        + '            </div>'
        + '        </div>'
        + '    </div>'
        + ''
        + '    <div class="_hues">'
        + '        <div class="_ie-1"></div>'
        + '        <div class="_ie-2"></div>'
        + '        <div class="_ie-3"></div>'
        + '        <div class="_ie-4"></div>'
        + '        <div class="_ie-5"></div>'
        + '        <div class="_ie-6"></div>'
        + '        <div class="_cursor" ng-style="{ top: hueCursor - 5 + \'px\' }"></div>'
        + '        <div class="_mouse-trap" ng-mousedown="startDrag($event, \'hue\')"></div>'
        + '    </div>'
        + ''
        + '    <div class="_alpha" ng-show="hsva.a != undefined">'
        + '        <div class="_background"></div>'
        + '        <div class="_foreground"></div>'
        + '        <div class="_ie-7"></div>'
        + '        <div class="_cursor" ng-style="{ top: alphaCursor - 5 + \'px\' }"></div>'
        + '        <div class="_mouse-trap" ng-mousedown="startDrag($event, \'alpha\')"></div>'
        + '    </div>'
        + '</div>';

    return {
        restrict: 'AE',
        template: tmpl,
        replace: true,
        require: '?ngModel',
        scope: {
        },

        link: function ($scope, $element, $attributes, ngModel) {
            function hsvToHexRgb(h, s, v, a) {
                if (typeof h === 'object') {
                    a = h.a;
                    s = h.s;
                    v = h.v;
                    h = h.h;
                }

                var i = Math.floor(h * 6),
                    f = h * 6 - i,
                    p = v * (1 - s),
                    q = v * (1 - f * s),
                    t = v * (1 - (1 - f) * s);

                var r, g, b;

                switch (i % 6) {
                    case 0:
                        r = v;
                        g = t;
                        b = p;
                        break;
                    case 1:
                        r = q;
                        g = v;
                        b = p;
                        break;
                    case 2:
                        r = p;
                        g = v;
                        b = t;
                        break;
                    case 3:
                        r = p;
                        g = q;
                        b = v;
                        break;
                    case 4:
                        r = t;
                        g = p;
                        b = v;
                        break;
                    case 5:
                        r = v;
                        g = p;
                        b = q;
                        break;
                }

                r = Math.floor(r * 255) + 256;
                g = Math.floor(g * 255) + 256;
                b = Math.floor(b * 255) + 256;
                if (a == undefined) {
                    return '#'
                        + r.toString(16).slice(1)
                        + g.toString(16).slice(1)
                        + b.toString(16).slice(1);

                } else {
                    a = Math.floor(a * 255) + 256;
                    return '#'
                        + r.toString(16).toUpperCase().slice(1)
                        + g.toString(16).toUpperCase().slice(1)
                        + b.toString(16).toUpperCase().slice(1)
                        + a.toString(16).toUpperCase().slice(1);
                }
            }

            function hexRgbaToHsva(hexColor) {
                let tokens;
                if (hexColor.length == 9) {
                    tokens = /^#(..)(..)(..)(..)$/.exec(hexColor);
                } else if (hexColor.length == 7) {
                    tokens = /^#(..)(..)(..)$/.exec(hexColor);
                }

                if (tokens) {
                    var rgba = tokens.slice(1).map(function (hex) {
                        return parseInt(hex, 16) / 255; // Normalize to 1
                    });

                    var r = rgba[0],
                        g = rgba[1],
                        b = rgba[2],
                        a = rgba.length == 4 ? rgba[3] : undefined,
                        //a = rgba[3],
                        h, s,
                        v = Math.max(r, g, b),
                        diff = v - Math.min(r, g, b),
                        diffc = function (c) {
                            return (v - c) / 6 / diff + 1 / 2;
                        };

                    if (diff === 0) {
                        h = s = 0;
                    } else {
                        s = diff / v;

                        var rr = diffc(r),
                            gg = diffc(g),
                            bb = diffc(b);

                        if (r === v) {
                            h = bb - gg;
                        } else if (g === v) {
                            h = (1 / 3) + rr - bb;
                        } else if (b === v) {
                            h = (2 / 3) + gg - rr;
                        }

                        if (h < 0) {
                            h += 1;
                        } else if (h > 1) {
                            h -= 1;
                        }
                    }

                    return {
                        h: h,
                        s: s,
                        v: v,
                        a: a
                    };
                }
            }

            $scope.hsva = { h: 0, s: 0, v: 0, a: undefined };

            if (ngModel) {
                ngModel.$render = function () {
                    if (/^#[0-9A-Fa-f]{8}$/.test(ngModel.$viewValue)) {
                        $scope.color = ngModel.$viewValue;
                        $scope.hsva = hexRgbaToHsva($scope.color);
                        $scope.colorCursor = {
                            x: $scope.hsva.s * 200,
                            y: (1 - $scope.hsva.v) * 200
                        };
                    } else if (/^#[0-9A-Fa-f]{6}$/.test(ngModel.$viewValue)) {
                        $scope.color = ngModel.$viewValue;
                        $scope.hsva = hexRgbaToHsva($scope.color);
                        $scope.colorCursor = {
                            x: $scope.hsva.s * 200,
                            y: (1 - $scope.hsva.v) * 200
                        };
                    } else {
                        $scope.color = null;
                        $scope.hsva = { h: 0.5 };
                        $scope.colorCursor = null;
                    }

                    $scope.hueBackgroundColor = hsvToHexRgb($scope.hsva.h, 1, 1);
                    $scope.hueCursor = $scope.hsva.h * 200;
                    if ($scope.hsva.a != undefined)
                        $scope.alphaCursor = (1 - $scope.hsva.a) * 200;
                };
            }

            var dragSubject,
                dragRect;

            function doDrag(x, y) {
                x = Math.max(Math.min(x, dragRect.width), 0);
                y = Math.max(Math.min(y, dragRect.height), 0);

                if (dragSubject === 'hue') {
                    $scope.hueCursor = y;

                    $scope.hsva.h = y / dragRect.height;

                    $scope.hueBackgroundColor = hsvToHexRgb($scope.hsva.h, 1, 1);
                } else if (dragSubject === 'alpha') {
                    if ($scope.hsva.a != undefined) {
                        $scope.alphaCursor = y;

                        $scope.hsva.a = 1 - y / dragRect.height;
                    }
                } else {
                    $scope.colorCursor = {
                        x: x,
                        y: y
                    };

                    $scope.hsva.s = x / dragRect.width;
                    $scope.hsva.v = 1 - y / dragRect.height;
                }

                if (typeof $scope.hsva.s !== 'undefined') {
                    $scope.color = hsvToHexRgb($scope.hsva);

                    if (ngModel) {
                        ngModel.$setViewValue($scope.color);
                    }
                }
            }

            function onMouseMove(evt) {
                evt.preventDefault();

                $scope.$apply(function () {
                    doDrag(evt.clientX - dragRect.x, evt.clientY - dragRect.y);
                });
            }
            function onTouchMove(evt) {
                //evt.preventDefault();

                $scope.$apply(function () {
                    doDrag(evt.targetTouches[0].clientX - dragRect.x, evt.targetTouches[0].clientY - dragRect.y);
                });
            }
            function onMouseUp() {
                angular.element($window)
                    .off('mousemove', onMouseMove)
                    .off('touchmove', onTouchMove);
            }

            $scope.startDrag = function (evt, subject) {
                var rect = evt.target.getBoundingClientRect();

                dragSubject = subject;
                dragRect = {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height
                };

                doDrag(evt.offsetX || evt.layerX, evt.offsetY || evt.layerY);

                angular.element($window)
                    .on('mousemove', onMouseMove)
                    .on('touchmove', onTouchMove)
                    .one('mouseup', onMouseUp)
                    .one('touchend', onMouseUp);
            };
        }
    };
}]);