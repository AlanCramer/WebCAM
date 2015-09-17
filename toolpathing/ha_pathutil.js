
HA_PathUtil = {};


// top is 0, each paths is cut at the next depthPerPass (i.e., -i*depthPerPass)
HA_PathUtil.gCodeRoughPass = function(arrayOfPaths, depthPerPass, pxPerMm) {

    var gCode = "";
    var ceiling = 1.0; // inches
    var feedrateInPerMin = 120;
    var cutHeight = -depthPerPass;

    gCode += this.gCodeSetUp(feedrateInPerMin);
      
    for (var iPaths = arrayOfPaths.length-1; iPaths >= 0; --iPaths) { 
    
        var curpaths = arrayOfPaths[iPaths];
        for (var iPath = 0; iPath < curpaths.length; ++iPath) {
        
            var path = curpaths[iPath];
            gCode += path.gCodeForSegs(path.pathSimpleSegs, ceiling, cutHeight, pxPerMm); 
        }
        cutHeight -= depthPerPass;
    }
    
    gCode += this.gCodeTakeDown(ceiling);
    
    return gCode;
}

    // create one gCode string for multiple paths
HA_PathUtil.gCodePaths = function(paths, pxPerMm) {

    var gCode = "";
    var ceiling = 1.0; // inches
    var cutHeight = -.1;
    var feedrateInPerMin = 120;

    gCode += this.gCodeSetUp(feedrateInPerMin);
    
    for (var iPath = 0; iPath < paths.length; ++iPath) {
    
        var path = paths[iPath];
        gCode += path.gCodeForSegs(path.pathSimpleSegs, ceiling, cutHeight, pxPerMm); 
        
        // if (iPath < paths.length -2) {
            // gCode += this.gCodeJogPoints(ceiling, cutHeight, paths[iPath+1].pathSimpleSegs[0][0], pxPerMm);
        // }
    }
    
    gCode += this.gCodeTakeDown(ceiling);
    
    return gCode;
}
    
// pull up to height, move to pt, plunge to cut depth
HA_PathUtil.gCodeJogPoints = function(jogHeight, cutDepth, pt, pxPerMm) {

    var gCode = "";
    gCode += "G0 Z" + jogHeight.toString() + "\n";
    gCode += getGCodeMoveTo(pt, jogHeight, pxPerMm);
    gCode += "G0 Z" + cutDepth.toString() + "\n";        
    
    return gCode;
}

HA_PathUtil.gCodeTakeDown = function (finalHeight) {

    var gCode = "";
    gCode += "G0 Z" + finalHeight.toString() + "\n"; // pull up to ceiling
    return gCode;
}

HA_PathUtil.gCodeSetUp = function(feedrateInPerMin) {
        
    var gCode = "";
    gCode += "(ToDo, add information about what, how, when, and who made this file)\n\n";
    
    // initialization
    gCode += "G17 (set XY Plane)\n";
    gCode += "G20 (inches)\n";
    gCode += "G40 (Tool Radius Compensation: off)\n";
    gCode += "G49 (Tool Length Offset Compensation: off)\n";
    gCode += "G54 (Work Coordinate System)\n";
    gCode += "G80 (Cancel Canned Cycle)\n";
    gCode += "G90(absolute programming)\n";
    gCode += "G94 (feedrate per minute)\n";
//    gCode += "G0 Z" + initZinch + " (initial z value, in inches)\n"; 
    gCode += "F" + feedrateInPerMin + " (feedrate in inches per minute)\n";
    
    return gCode;
}
