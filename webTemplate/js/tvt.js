// Frank Cedeno 09/17/2014
/*jslint browser: true  plusplus: true  */
/// <reference path="common.js" />
var TVT = {};
//fullscreen variables for IE 9
TVT.fadeIteration = -1; //keeps track of fade cycles for fullscreen button
TVT.fadeTO = null; //the TimeOut variable for fullscreen button fade
TVT.fullScreenStatus = false; //is full screen being displayed?
TVT.fullScreenStatus = false; //for full screen button prevents over clicking(IE 9 only)
TVT.fadeIteration = -1; //keeps track of fading and appearing full screen button (IE 9 only)
//Aspect ratio variables
TVT.currentVideoHT = 0; //the height of the current video
TVT.currentVideoWD = 0; //the width of the current video
//Display Information Variables
TVT.currentVideoTitle = ""; //the optional title of the video
TVT.searchObj = null; //Object containing the data from the URL search string
TVT.currentDisplayedFile = ""; //the name of the file
TVT.videodata = null; //data from ajax call for videos in the selected folder
TVT.currentDisplayedFileIndex = -1; //the index of the file in TVT.videodata
//Progress Tracker variables
TVT.videoCurrentlyPlaying = false; //Prevents overclicking of links
//element id constants
TVT.videoEnvelopeId = "dvVidEnvelope"; //the id of the div holding the video element
TVT.fullScreenButtonId = "btnFullScreen"; //the id of the full screen button
TVT.ExitButtonId = "btnExitVideo"; //the id of the button to exit the video
TVT.vidObjId = "vidMain"; //the id of the video element
TVT.VideoTitleId = "h2Title"; //the id of the video title, an h2 element
TVT.vidEnvelopeId = "leftdisplay"; //id of the div containing the video tag
TVT.vidObjId = "vidPlayer"; //the id of the video tag
TVT.waitingObjId = "divWaiting"; //Loading gif container id
TVT.fullScreenBtnId = "btnFullScreen"; //for full screen button (IE 9 only)
//Continuing functions that are run after event occurs
TVT.videoEndFunction = null; //runs when video ends
TVT.videoStartFunction = null; //runs when video is started
TVT.videoPausedFunction = null; //runs when video is paused
//***************************************Page Links to videos******************************************//
//Expected format the will be populated with links for videos found in the given folder
//<div class="grouping" id="divUnique Name">
//    <h5>Name of Video Grouping</h5>
//</div>
TVT.populateVideoLinks = function (displayDivId, folderName) {
    ///<summary>Populates video links on MIS home page</summary>
    ///<param name="displayDivId" type="String">The id of div container where the links will be shown</param>
    ///<param name="folderName" type="String">The relative path to the folder containing the video files to be displayed</param>
    "use strict";
    var baseObj, i, iHTML, obj1, groupName;
    baseObj = document.getElementById(displayDivId);
    groupName = baseObj.getElementsByTagName("h5")[0].innerHTML;
    TVT.zgetLinks(folderName);
    if (!TVT.videodata || TVT.videodata.length === 0) { return; }
    for (i = 0; i < TVT.videodata.length; i++) {
        iHTML = "<a href=\"trainingvideos.html?foldername=" + encodeURIComponent(folderName) + "&filename=" + encodeURIComponent(TVT.videodata[i].filename) + "&groupname=" + groupName + "\" >";
        iHTML += TVT.videodata[i].filename.replace(".mp4", "") + "</a>";
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
TVT.zgetLinks = function (folderName) {
    //NOT FOR EXTERNAL USE
    "use strict";
    TVT.videodata = AJAXPOST.getFileList(folderName, false, "*.mp4", null, null, true);
    if (!TVT.videodata || TVT.videodata.length === 0) { return; }
};
//**********NOT FOR EXTERNAL USER*********Video Display page (Expects trainingvideo.html)*****************************//
TVT.initdisplay = function (displayDivId) {
    //initializes the training video page
    "use strict";
    var baseObj, obj1, i, iHTML;
    TVT.searchObj = COMMON.getSearchString();
    TVT.currentDisplayedFile = TVT.searchObj.filename;
    document.title = TVT.searchObj.groupname
    if (TVT.currentDisplayedFile && TVT.currentDisplayedFile !== "") {
        baseObj = document.getElementById(displayDivId);
        obj1 = COMMON.getBasicElement("h3", null, "Now Displaying:");
        baseObj.appendChild(obj1);
        obj1 = COMMON.getBasicElement("h1", null, TVT.currentDisplayedFile.replace(".mp4", ""));
        baseObj.appendChild(obj1);
    }
    obj1 = COMMON.getBasicElement("h3", null, "Other Training Videos in this series");
    baseObj.appendChild(obj1);
    TVT.zgetLinks(TVT.searchObj.foldername);//get all available videos
    //display links to other videos if more than one.  Assume that there is at least one video
    if (TVT.videodata !== undefined && TVT.videodata !== null && TVT.videodata.length > 1) {
        for (i = 0; i < TVT.videodata.length; i++) {
            if (TVT.videodata[i].filename !== TVT.currentDisplayedFile) {
                iHTML = "<a href=\"trainingvideos.html?foldername=" + encodeURIComponent(TVT.searchObj.foldername) + "&filename=" + encodeURIComponent(TVT.videodata[i].filename) + "&groupname=" + TVT.searchObj.groupname + "\" >";
                iHTML += "<img src=\"images/" + encodeURIComponent(TVT.videodata[i].filename.replace(".mp4", ".jpg")) + "\" alt=\"video thumbnail\" width=\"75\" height=\"75\" /><br />";
                iHTML += "<span>" + TVT.videodata[i].filename.replace(".mp4", "") + "</span></a>";
                obj1 = COMMON.getBasicElement("div", null, iHTML, "onecell");
                baseObj.appendChild(obj1);
            }
            if (TVT.videodata[i].filename === TVT.currentDisplayedFile) { TVT.currentDisplayedFileIndex = i; }
        }
    } else {
        TVT.currentDisplayedFile = 0;
    }
    //Play the video
    if (TVT.currentDisplayedFile && TVT.currentDisplayedFile !== "") {
        TVT.showVideo();
    }
};
//******************************************************Event handlers******************************************************//
TVT.videoEnded = function () {
    "use strict";
    //triggered by video end event
    TVT.videoCurrentlyPlaying = false;
    //if fullscreen, return to normal
    if (TVT.fullScreenStatus) {
        TVT.setFullScreen();
    }
    if (TVT.videoEndFunction !== undefined && TVT.videoEndFunction !== null) { TVT.videoEndFunction(); }
};
TVT.videoStarted = function () {
    "use strict";
    //triggered when video has finished loading
    var obj;
    obj = document.getElementById(TVT.vidEnvelopeId);
    obj.removeChild(document.getElementById(TVT.waitingObjId));
    if (TVT.videoStartFunction !== undefined && TVT.videoStartFunction !== null) { TVT.videoStartFunction(); }
};
TVT.videoPaused = function () {
    "use strict";
    if (TVT.videoPausedFunction !== undefined && TVT.videoPausedFunction !== null) { TVT.videoPausedFunction(); }
};
//************************Full Screen handlers used for prior to HTML5 browsers such as IE 9******************************************//
TVT.showFullScreenButton = function () {
    "use strict";
    var fadeValue;
    if (TVT.fadeIteration === -1) { TVT.fadeIteration = 1; }
    if (TVT.fadeIteration >= 500) {
        TVT.fadeIteration = -1;
        TVT.hideFullScreenButton();
        if (TVT.fadeTO) {
            window.clearTimeout(TVT.fadeTO);
            TVT.fadeTO = null;
        }
        TVT.setVideoObjMouseAttributes();
        return;
    }
    fadeValue = -1 * Math.sin((((2 * Math.PI / 17.5) * 0.1) - ((2 * Math.PI) / 17.5) * TVT.fadeIteration) * Math.PI / 180);
    TVT.fadeInFullScreenButton(fadeValue);
    TVT.fadeIteration++;
    TVT.fadeTO = window.setTimeout(function () { TVT.showFullScreenButton(); }, 10);
};
TVT.hideFullScreenButton = function () {
    "use strict";
    var btnObj;
    btnObj = document.getElementById(TVT.fullScreenBtnId);
    if (!btnObj) { return; }
    btnObj.style.display = "none";
    if (TVT.fadeTO) {
        window.clearTimeout(TVT.fadeTO);
        TVT.fadeTO = null;
    }
    TVT.fadeIteration = -1;
};
TVT.fadeInFullScreenButton = function (fadeValue) {
    "use strict";
    var btnObj;
    btnObj = document.getElementById(TVT.fullScreenBtnId);
    if (!btnObj) {
        btnObj = document.createElement("input");
        btnObj.type = "button";
        btnObj.id = TVT.fullScreenBtnId;
        btnObj.setAttribute("onclick", "TVT.setFullScreen();");
        btnObj.setAttribute("onmouseover", "TVT.fullScreenBtnOnMouseOver();");
        btnObj.setAttribute("onmouseout", "TVT.showFullScreenButton();");
        document.getElementById(TVT.vidEnvelopeId).appendChild(btnObj);
    }
    btnObj.value = (TVT.fullScreenStatus ? "Exit Full Screen" : "Full Screen");
    btnObj.style.display = "inline";
    btnObj.style.opacity = fadeValue;
    btnObj.style.filter = "alpha(opacity=" + String(Math.floor(fadeValue * 100)) + ")";
};

TVT.setFullScreen = function () {
    "use strict";
    var leftDisplayObj;
    leftDisplayObj = document.getElementById(TVT.vidEnvelopeId);
    leftDisplayObj.style.width = (TVT.fullScreenStatus ? "75%" : "100%");
    TVT.fullScreenStatus = !TVT.fullScreenStatus;
    TVT.getDisplayRatio(document.getElementById(TVT.vidObjId));
};
TVT.fullScreenBtnOnMouseOver = function () {
    "use strict";
    var btnObj;
    btnObj = document.getElementById(TVT.fullScreenBtnId);
    if (!btnObj) { return; }
    if (TVT.fadeTO) {
        window.clearTimeout(TVT.fadeTO);
        TVT.fadeTO = null;
    }
    TVT.setVideoObjMouseAttributes(true);
    TVT.fadeIteration = 250;
    TVT.fadeInFullScreenButton(1);
};
TVT.setVideoObjMouseAttributes = function (remove) {
    "use strict";
    var vidObj;
    vidObj = document.getElementById(TVT.vidObjId);
    if (!remove) {
        vidObj.setAttribute("onmouseover", "TVT.showFullScreenButton();");
        vidObj.setAttribute("onmouseout", "TVT.hideFullScreenButton();");
    } else {
        vidObj.removeAttribute("onmouseover");
        vidObj.removeAttribute("onmouseout");
    }
};
//*************************************Aspect Ratio handlers, sets the screen size and shows video to user********************************************//
TVT.makeVideoDivVisible = function () {
    "use strict";
    var wdOffset, htOffset, titleOffset, vidEnvelope;
    vidEnvelope = document.getElementById(TVT.videoEnvelopeId);
    titleOffset = (TVT.currentVideoTitle && TVT.currentVideoTitle !== "" ? 25 : 0);
    vidEnvelope.style.visibility = "visible";
    wdOffset = window.innerWidth - TVT.currentVideoWD;
    htOffset = window.innerHeight - TVT.currentVideoHT;
    wdOffset = (wdOffset <= 0 ? 0 : wdOffset);
    htOffset = (htOffset <= 0 ? 0 : htOffset);
    vidEnvelope.style.top = String(htOffset / 2) + "px";
    vidEnvelope.style.left = String(wdOffset / 2) + "px";
    vidEnvelope.style.height = String(TVT.currentVideoHT + titleOffset) + "px";
    vidEnvelope.style.width = String(TVT.currentVideoWD) + "px";
    vidEnvelope.style.zIndex = "10";
};
TVT.screenSizeChanged = function () {
    "use strict";
    //trigger by body on resize
    TVT.getDisplayRatio(document.getElementById(TVT.vidObjId));
};
TVT.getDisplayRatio = function (vidObj) {
    "use strict";
    //adjust the size of the video tag
    var adjWidth, adjHeight, currentVideo, ratio;
    currentVideo = TVT.videodata[TVT.currentDisplayedFileIndex];
    ratio = currentVideo.frameWidth / currentVideo.frameHeight;
    adjHeight = window.innerHeight; //height is the same in either configuration
    if (TVT.fullScreenStatus) {
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
TVT.showVideo = function () {
    //create video tag and play video
    "use strict";
    var vidObj, obj1, obj2, vidEnvelope, currentVideo;
    if (TVT.videoCurrentlyPlaying) { return; }
    currentVideo = TVT.videodata[TVT.currentDisplayedFileIndex];
    vidEnvelope = document.getElementById(TVT.vidEnvelopeId);
    while (vidEnvelope.firstChild) {
        vidEnvelope.removeChild(vidEnvelope.firstChild);
    }
    vidObj = document.createElement("video");
    vidObj.id = TVT.vidObjId;
    vidObj.controls = "controls";
    TVT.getDisplayRatio(vidObj);
    obj1 = document.createElement("source");
    obj1.src = TVT.searchObj.foldername + "/" + encodeURIComponent(currentVideo.filename);
    obj1.type = "video/mp4";
    vidObj.appendChild(obj1);
    vidEnvelope.appendChild(vidObj);
    if (COMMON.ieVer < 10) {
        TVT.setVideoObjMouseAttributes();
    }
    window.addEventListener("resize", TVT.screenSizeChanged);
    vidObj.addEventListener('ended', TVT.videoEnded);
    vidObj.addEventListener('canplay', TVT.videoStarted);
    vidObj.addEventListener('pause', TVT.videoPaused);
    vidObj.load();
    TVT.videoCurrentlyPlaying = true;
    vidObj.play();
    //loading display
    obj1 = COMMON.getBasicElement("div", TVT.waitingObjId);
    obj2 = COMMON.getBasicElement("h2", null, "Loading video...Please Wait.");
    obj1.appendChild(obj2);
    obj2 = COMMON.getImageElement(null, "images/waiting.gif", "Waiting Image");
    obj1.appendChild(obj2);
    vidEnvelope.appendChild(obj1);
};