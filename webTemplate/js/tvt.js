// Frank Cedeno 09/17/2014
/*jslint browser: true  plusplus: true  */
/*global COMMON, AJAXPOST, FILLIN*/
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
//************************************************Help*******************************************************
TVT.zdisplayHelp = function () {
    "use strict";
    var iHTML, slider, play_pause, volume, fullscreen, fullscreen2;
    slider = "data:image/jpeg;base64,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";
    play_pause = "data:image/jpeg;base64,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";
    volume = "data:image/jpeg;base64,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";
    fullscreen = "data:image/jpeg;base64,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";
    fullscreen2 = "data:image/jpeg;base64,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";
    iHTML = "<h3>Page Overview</h3><div><img src=\"jpg/fullpage.jpg\" alt=\"Full page view\" /></div><p>The page has a left and right section.  The left section is where the video is diplayed, The right has a link to the home page and this help page as well as other videos in this series.  Click on any video to start it displaying in the left section.</p><h3>Controls</h3><p>The video player has several controls. Not all controls will be displayed depending on the browser you are using, particularly the full screen control that is not available in Internet Explorer 9. However, the system will automatically detect this and provide an alternate fullscreen control. The section below will show the function of the controls.</p><ul><li><img src=\"" + play_pause + "\" alt=\"Play Pause Button\" /><br /><em>Play Pause Button</em> - Use this button to start and pause the video.</li><li><img src=\"" + slider + "\" alt=\"Slider and time\" /><br /><em>Time Counter and Slider</em> - This will show how much time has elapse on the video. In some browsers if you hover your mouse indicator over the time, you will be able to &quot;rewind&quot; the video 30 seconds.  Some browsers will also display the time remaining at the right end of the slider control.  Again, hovering over the time on the right will enable you to &quot;fast-forward&quot; the video by 30 seconds. Finally, the slider is the bar to the right of the time which indicates where in the time line the video is playing. Click and hold the left mouse button over the the indicator on the slider and you can drag the video to the area on the time line you want to get to. Clicking to the left or right of the indicator will place the indicator as well as the video to the place on the time line you have clicked.</li><li><img src=\"" + volume + "\" alt=\"Volume Control\" /><br /><em>Volumn Control</em> - Click on the volume control to display a vertical bar that represents the volume. Click and hold the left mouse button over the indicator to set the volume.  Maximum volume is at the top.</li><li><img src=\"" + fullscreen + "\" alt=\"Full Screen Control\" /><br /><em>Full Screen</em> - This control may not be available in your browser. Please see the next control as an alternative. Click on this control to expand the video to the size of the screen. Click on it again or press the Escape key on your keyboard to return to normal view.</li><li><img src=\"" + fullscreen2 + "\" alt=\"Full Screen Control\" /><br /><em>Full Screen IE9</em> - This control is an alternative to set the screen size to fill the entire browser.  This button will be shown if you place the mouse anywhere in the area of the video and will fade away again after a few seconds.  Note, this will not maximize the window of the browser and you will have to manually increase the size of the window.  This can be accomplished quickly by pressing the F11 key on your Keyboard.  Click on the button again to return the screen to normal (F11 again to return your browser menus).</li></ul><h3>Download the Video</h3><p>Right-click anyhere on the video and choose &quot;Download Video&quot; from the context menu</p>";
    FILLIN.okDialog("toplevel", "Help/Instructions", iHTML, "90%");
};