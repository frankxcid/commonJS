// Frank Cedeno 09/17/2014
/*jslint browser: true  plusplus: true  */
/*global COMMON, AJAXPOST*/
/// <reference path="common.js" />
/// <reference path="ajaxpost.js" />
var TVT = {};
//public properties
TVT.currentVideoTitle = ""; //the optional title of the video
TVT.currentDisplayedFile = ""; //the name of the file
//fullscreen variables for IE 9
TVT.zfadeIteration = -1; //keeps track of fade cycles for fullscreen button
TVT.zfadeTO = null; //the TimeOut variable for fullscreen button fade
TVT.zfullScreenStatus = false; //for full screen button prevents over clicking(IE 9 only)
//Aspect ratio variables
TVT.zcurrentVideoHT = 0; //the height of the current video
TVT.zcurrentVideoWD = 0; //the width of the current video
//Display Information Variables
TVT.zsearchObj = null; //Object containing the data from the URL search string
TVT.zvideodata = null; //data from ajax call for videos in the selected folder
TVT.zcurrentDisplayedFileIndex = -1; //the index of the file in TVT.zvideodata
//Progress Tracker variables
TVT.zvideoCurrentlyPlaying = false; //Prevents overclicking of links
//element id constants
TVT.zvideoEnvelopeId = "dvVidEnvelope"; //the id of the div holding the video element
TVT.zvidObjId = "vidMain"; //the id of the video element
TVT.zvidEnvelopeId = "leftdisplay"; //id of the div containing the video tag
TVT.zwaitingObjId = "divWaiting"; //Loading gif container id
TVT.zfullScreenBtnId = "btnFullScreen"; //for full screen button (IE 9 only)
//Continuing functions that are run after event occurs
TVT.videoEndFunction = null; //runs when video ends
TVT.videoStartFunction = null; //runs when video is started
TVT.videoPausedFunction = null; //runs when video is paused
//Expected format the will be populated with links for videos found in the given folder
//<div class="grouping" id="divUnique Name">
//    <h5>Name of Video Grouping</h5>
//</div>
//*******************************************Public Methods*******************************************//
TVT.populateVideoLinks = function (displayDivId, folderName) {
    ///<summary>Populates video links on MIS home page</summary>
    ///<param name="displayDivId" type="String">The id of div container where the links will be shown</param>
    ///<param name="folderName" type="String">The relative path to the folder containing the video files to be displayed</param>
    "use strict";
    var baseObj, i, iHTML, obj1, groupName;
    baseObj = document.getElementById(displayDivId);
    groupName = baseObj.getElementsByTagName("h5")[0].innerHTML;
    TVT.zgetLinks(folderName);
    if (!TVT.zvideodata || TVT.zvideodata.length === 0) { return; }
    for (i = 0; i < TVT.zvideodata.length; i++) {
        iHTML = "<a href=\"trainingvideos.html?foldername=" + encodeURIComponent(folderName) + "&filename=" + encodeURIComponent(TVT.zvideodata[i].filename) + "&groupname=" + groupName + "\" >";
        iHTML += TVT.zvideodata[i].filename.replace(".mp4", "") + "</a>";
        obj1 = COMMON.getBasicElement("div", null, iHTML, "onecell");
        baseObj.appendChild(obj1);
    }
};
TVT.setVideoStartFunction = function (startVideoFunction) {
    ///<summary>Sets a function to run when the video is started. this function will only be run once. Uses the CANPLAY event so only runs once</summary>
    ///<param name="startVideoFunction" type="Function">The function to run for this event</param>
    "use strict";
    TVT.videoStartFunction = startVideoFunction;
};
TVT.setVideoPauseFunction = function (pauseVideoFunction) {
    ///<summary>Sets a function to run everytime the video is paused</summary>
    ///<param name="endVideoFunction" type="Function">The function to run for this event</param>
    "use strict";
    TVT.videoPausedFunction = pauseVideoFunction;
};
TVT.setVideoEndFunction = function (endVideoFunction) {
    ///<summary>Sets a function to run when the video ends</summary>
    ///<param name="endVideoFunction" type="Function">The function to run for this event</param>
    "use strict";
    TVT.videoEndFunction = endVideoFunction;
};
//***************************************Page Links to videos******************************************//
TVT.zgetLinks = function (folderName) {
    //NOT FOR EXTERNAL USE
    "use strict";
    TVT.zvideodata = AJAXPOST.getFileList(folderName, false, "*.mp4", null, null, true);
    if (!TVT.zvideodata || TVT.zvideodata.length === 0) { return; }
};
//**********NOT FOR EXTERNAL USER*********Video Display page (Expects trainingvideo.html)*****************************//
TVT.zinitdisplay = function (displayDivId) {
    //initializes the training video page
    "use strict";
    var baseObj, obj1, i, iHTML;
    TVT.zsearchObj = COMMON.getSearchString();
    TVT.currentDisplayedFile = TVT.zsearchObj.filename;
    document.title = TVT.zsearchObj.groupname;
    if (TVT.currentDisplayedFile && TVT.currentDisplayedFile !== "") {
        baseObj = document.getElementById(displayDivId);
        obj1 = COMMON.getBasicElement("h3", null, "Now Displaying:");
        baseObj.appendChild(obj1);
        obj1 = COMMON.getBasicElement("h1", null, TVT.currentDisplayedFile.replace(".mp4", ""));
        baseObj.appendChild(obj1);
    }
    obj1 = COMMON.getBasicElement("h3", null, "Other Training Videos in this series");
    baseObj.appendChild(obj1);
    TVT.zgetLinks(TVT.zsearchObj.foldername);//get all available videos
    //display links to other videos if more than one.  Assume that there is at least one video
    if (TVT.zvideodata !== undefined && TVT.zvideodata !== null && TVT.zvideodata.length > 1) {
        for (i = 0; i < TVT.zvideodata.length; i++) {
            if (TVT.zvideodata[i].filename !== TVT.currentDisplayedFile) {
                iHTML = "<a href=\"trainingvideos.html?foldername=" + encodeURIComponent(TVT.zsearchObj.foldername) + "&filename=" + encodeURIComponent(TVT.zvideodata[i].filename) + "&groupname=" + TVT.zsearchObj.groupname + "\" >";
                iHTML += "<img src=\"images/" + encodeURIComponent(TVT.zvideodata[i].filename.replace(".mp4", ".jpg")) + "\" alt=\"video thumbnail\" width=\"75\" height=\"75\" /><br />";
                iHTML += "<span>" + TVT.zvideodata[i].filename.replace(".mp4", "") + "</span></a>";
                obj1 = COMMON.getBasicElement("div", null, iHTML, "onecell");
                baseObj.appendChild(obj1);
            }
            if (TVT.zvideodata[i].filename === TVT.currentDisplayedFile) { TVT.zcurrentDisplayedFileIndex = i; }
        }
    } else {
        TVT.currentDisplayedFile = 0;
    }
    //Play the video
    if (TVT.currentDisplayedFile && TVT.currentDisplayedFile !== "") {
        TVT.zshowVideo();
    }
};
//******************************************************Event handlers******************************************************//
TVT.zvideoEnded = function () {
    "use strict";
    //triggered by video end event
    TVT.zvideoCurrentlyPlaying = false;
    //if fullscreen, return to normal
    if (TVT.zfullScreenStatus) {
        TVT.zsetFullScreen();
    }
    if (TVT.videoEndFunction !== undefined && TVT.videoEndFunction !== null) { TVT.videoEndFunction(); }
};
TVT.zvideoStarted = function () {
    "use strict";
    //triggered when video has finished loading
    var obj;
    obj = document.getElementById(TVT.zvidEnvelopeId);
    obj.removeChild(document.getElementById(TVT.zwaitingObjId));
    if (TVT.videoStartFunction !== undefined && TVT.videoStartFunction !== null) { TVT.videoStartFunction(); }
};
TVT.zvideoPaused = function () {
    "use strict";
    if (TVT.videoPausedFunction !== undefined && TVT.videoPausedFunction !== null) { TVT.videoPausedFunction(); }
};
//************************Full Screen handlers used for prior to HTML5 browsers such as IE 9******************************************//
TVT.zshowFullScreenButton = function () {
    "use strict";
    var fadeValue;
    if (TVT.zfadeIteration === -1) { TVT.zfadeIteration = 1; }
    if (TVT.zfadeIteration >= 500) {
        TVT.zfadeIteration = -1;
        TVT.zhideFullScreenButton();
        if (TVT.zfadeTO) {
            window.clearTimeout(TVT.zfadeTO);
            TVT.zfadeTO = null;
        }
        TVT.zsetVideoObjMouseAttributes();
        return;
    }
    fadeValue = -1 * Math.sin((((2 * Math.PI / 17.5) * 0.1) - ((2 * Math.PI) / 17.5) * TVT.zfadeIteration) * Math.PI / 180);
    TVT.zfadeInFullScreenButton(fadeValue);
    TVT.zfadeIteration++;
    TVT.zfadeTO = window.setTimeout(function () { TVT.zshowFullScreenButton(); }, 10);
};
TVT.zhideFullScreenButton = function () {
    "use strict";
    var btnObj;
    btnObj = document.getElementById(TVT.zfullScreenBtnId);
    if (!btnObj) { return; }
    btnObj.style.display = "none";
    if (TVT.zfadeTO) {
        window.clearTimeout(TVT.zfadeTO);
        TVT.zfadeTO = null;
    }
    TVT.zfadeIteration = -1;
};
TVT.zfadeInFullScreenButton = function (fadeValue) {
    "use strict";
    var btnObj;
    btnObj = document.getElementById(TVT.zfullScreenBtnId);
    if (!btnObj) {
        btnObj = document.createElement("input");
        btnObj.type = "button";
        btnObj.id = TVT.zfullScreenBtnId;
        btnObj.setAttribute("onclick", "TVT.zsetFullScreen();");
        btnObj.setAttribute("onmouseover", "TVT.zfullScreenBtnOnMouseOver();");
        btnObj.setAttribute("onmouseout", "TVT.zshowFullScreenButton();");
        document.getElementById(TVT.zvidEnvelopeId).appendChild(btnObj);
    }
    btnObj.value = (TVT.zfullScreenStatus ? "Exit Full Screen" : "Full Screen");
    btnObj.style.display = "inline";
    btnObj.style.opacity = fadeValue;
    btnObj.style.filter = "alpha(opacity=" + String(Math.floor(fadeValue * 100)) + ")";
};

TVT.zsetFullScreen = function () {
    "use strict";
    var leftDisplayObj;
    leftDisplayObj = document.getElementById(TVT.zvidEnvelopeId);
    leftDisplayObj.style.width = (TVT.zfullScreenStatus ? "75%" : "100%");
    TVT.zfullScreenStatus = !TVT.zfullScreenStatus;
    TVT.zgetDisplayRatio(document.getElementById(TVT.zvidObjId));
};
TVT.zfullScreenBtnOnMouseOver = function () {
    "use strict";
    var btnObj;
    btnObj = document.getElementById(TVT.zfullScreenBtnId);
    if (!btnObj) { return; }
    if (TVT.zfadeTO) {
        window.clearTimeout(TVT.zfadeTO);
        TVT.zfadeTO = null;
    }
    TVT.zsetVideoObjMouseAttributes(true);
    TVT.zfadeIteration = 250;
    TVT.zfadeInFullScreenButton(1);
};
TVT.zsetVideoObjMouseAttributes = function (remove) {
    "use strict";
    var vidObj;
    vidObj = document.getElementById(TVT.zvidObjId);
    if (!remove) {
        vidObj.setAttribute("onmouseover", "TVT.zshowFullScreenButton();");
        vidObj.setAttribute("onmouseout", "TVT.zhideFullScreenButton();");
    } else {
        vidObj.removeAttribute("onmouseover");
        vidObj.removeAttribute("onmouseout");
    }
};
//*************************************Aspect Ratio handlers, sets the screen size and shows video to user********************************************//
TVT.zmakeVideoDivVisible = function () {
    "use strict";
    var wdOffset, htOffset, titleOffset, vidEnvelope;
    vidEnvelope = document.getElementById(TVT.zvideoEnvelopeId);
    titleOffset = (TVT.currentVideoTitle && TVT.currentVideoTitle !== "" ? 25 : 0);
    vidEnvelope.style.visibility = "visible";
    wdOffset = window.innerWidth - TVT.zcurrentVideoWD;
    htOffset = window.innerHeight - TVT.zcurrentVideoHT;
    wdOffset = (wdOffset <= 0 ? 0 : wdOffset);
    htOffset = (htOffset <= 0 ? 0 : htOffset);
    vidEnvelope.style.top = String(htOffset / 2) + "px";
    vidEnvelope.style.left = String(wdOffset / 2) + "px";
    vidEnvelope.style.height = String(TVT.zcurrentVideoHT + titleOffset) + "px";
    vidEnvelope.style.width = String(TVT.zcurrentVideoWD) + "px";
    vidEnvelope.style.zIndex = "10";
};
TVT.zscreenSizeChanged = function () {
    "use strict";
    //trigger by body on resize
    TVT.zgetDisplayRatio(document.getElementById(TVT.zvidObjId));
};
TVT.zgetDisplayRatio = function (vidObj) {
    "use strict";
    //adjust the size of the video tag
    var adjWidth, adjHeight, currentVideo, ratio;
    currentVideo = TVT.zvideodata[TVT.zcurrentDisplayedFileIndex];
    ratio = currentVideo.frameWidth / currentVideo.frameHeight;
    adjHeight = window.innerHeight; //height is the same in either configuration
    if (TVT.zfullScreenStatus) {
        adjWidth = window.innerWidth;
    } else {
        adjWidth = window.innerWidth * 0.75; //when normal max width is 75% of the window width
    }
    //maitains the aspect ratio by which dimension will fit best
    if ((adjWidth * ratio) > adjHeight) {
        //width will be current div width, adjust height
        adjHeight = (adjWidth / ratio);
    } else {
        adjWidth = (adjHeight * ratio);
    }
    vidObj.width = adjWidth;
    vidObj.height = adjHeight;
};
TVT.zshowVideo = function () {
    //create video tag and play video
    "use strict";
    var vidObj, obj1, obj2, vidEnvelope, currentVideo;
    if (TVT.zvideoCurrentlyPlaying) { return; }
    currentVideo = TVT.zvideodata[TVT.zcurrentDisplayedFileIndex];
    vidEnvelope = document.getElementById(TVT.zvidEnvelopeId);
    while (vidEnvelope.firstChild) {
        vidEnvelope.removeChild(vidEnvelope.firstChild);
    }
    vidObj = document.createElement("video");
    vidObj.id = TVT.zvidObjId;
    vidObj.controls = "controls";
    TVT.zgetDisplayRatio(vidObj);
    obj1 = document.createElement("source");
    obj1.src = TVT.zsearchObj.foldername + "/" + encodeURIComponent(currentVideo.filename);
    obj1.type = "video/mp4";
    vidObj.appendChild(obj1);
    vidEnvelope.appendChild(vidObj);
    if (COMMON.ieVer < 10) {
        TVT.zsetVideoObjMouseAttributes();
    }
    window.addEventListener("resize", TVT.zscreenSizeChanged);
    vidObj.addEventListener('ended', TVT.zvideoEnded);
    vidObj.addEventListener('canplay', TVT.zvideoStarted);
    vidObj.addEventListener('pause', TVT.zvideoPaused);
    vidObj.load();
    TVT.zvideoCurrentlyPlaying = true;
    vidObj.play();
    //loading display
    obj1 = COMMON.getBasicElement("div", TVT.zwaitingObjId);
    obj2 = COMMON.getBasicElement("h2", null, "Loading video...Please Wait.");
    obj1.appendChild(obj2);
    obj2 = COMMON.getImageElement(null, "images/waiting.gif", "Waiting Image");
    obj1.appendChild(obj2);
    vidEnvelope.appendChild(obj1);
};