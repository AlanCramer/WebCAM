
// import acGreyImage.js
// import path.js
// import distTrans.js
// import vectorize.js

// Main API


(function(ACTP) {

    ACTP.ToolpathsFromCanvas = function(toolCtx, incanvas) {

        var inCanvasImage = new ACTP.AcGrey8Image(incanvas.width, incanvas.height);
        inCanvasImage.initFromCanvas(incanvas); 

        // todo, the depth of the image is a function of the widht and height 
        // (must be greater than the max dist possible)
        var dt = new ACTP.AcGrey32Image(incanvas.width, incanvas.height);

        ACTP.computeDistTrans(inCanvasImage, dt);
        
        var path = new ACTP.Path();
        vectorizeDistanceTrf(dt, toolCtx.toolbitDiamInPx/2, path);
        
        path.buildSimpleSegs(.1);
        //path.buildArcInterp(1);
        
        return path;
    }
    
    // input assumes what to cut is black - leave white alone
    // an invert of the image happens, so that toolpaths are in the white area
    ACTP.buildPocketToolpaths = function(toolCtx, incanvas) {
        
        var inCanvasImage = new ACTP.AcGrey8Image(incanvas.width,incanvas.height);
        inCanvasImage.initFromCanvas(incanvas); // todo, decide about js ctors
        inCanvasImage.invertImage();
        return ACTP.buildPocketToolpathsFromImage(inCanvasImage, toolCtx.toolbitDiamInPx);
    }

    // assumes binary image -- 0 and 1s, zeros are not touched, non zeros get cut
    // 
    // not public
    ACTP.buildPocketToolpathsFromImage = function(img, bitDiamPx) {
        
        var dt = new ACTP.AcGrey16Image(img.width, img.height);
        ACTP.computeDistTrans(img, dt);
        
        var paths = [];
        var path;
        
        var done = false;
        var pathCt = 1;
        while (!done) {
        
            path = new ACTP.Path();
            
            vectorizeDistanceTrf(dt, pathCt * bitDiamPx/2, path);
            path.buildSimpleSegs(.5);
            
            done = (path.pathSegments.length === 0);
            if (!done) {
                paths.push(path);
                ++pathCt;
            }
        }
        return paths;   
    }
    
    

})(this.ACTP = this.ACTP || {});