
// import acGreyImage.js
// import path.js
// import distTrans.js
// import vectorize.js

// Main API


(function(ACTP) {

    ACTP.ToolpathsFromCanvas = function(toolCtx, incanvas) {

        var inCanvasImage = new ACTP.AcGrey8Image(incanvas.width, incanvas.height);
        inCanvasImage.initFromCanvas(incanvas); 

        var dt = new ACTP.AcGrey16Image(incanvas.width, incanvas.height);

        ACTP.computeDistTrans(inCanvasImage, dt);
        
        var path = new ACTP.Path();
        vectorizeDistanceTrf(dt, toolCtx.toolbitDiamInPx/2, path);
        
        path.buildSimpleSegs(1);
        //path.buildArcInterp(1);
        
        return path;
    }

})(this.ACTP = this.ACTP || {});