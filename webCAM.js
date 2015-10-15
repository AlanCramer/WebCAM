
(function(webCAM) {
    
    webCAM.image = {};
    webCAM.toolpaths = [];
    webCAM.pxPerIn = 1; // ??
    
    webCAM.OnDrawToolpaths = function() {

        this.clearPathCanvas();
        this.CalcToolpaths();
        this.DrawPathCanvas();
    };
    
    webCAM.OnExportGCode = function() {
    
        // currently have 1 toolpath object, 
    
        var pxPerMm = 3; // todo ??
        var gcode = ACTP.gCodePaths(webCAM.toolpaths, pxPerMm);
        
        webCAM.exportToFile(gcode, "gcodeDownload.nc");
        
    };
    
    webCAM.DrawImageCanvas = function() {
        
        // todo - image resolution vs dimensions
        // display dimension should be not relevant 
        
        var canvas = document.getElementById('image-canvas');
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvas.width, canvas.height); // draw white, 
      
        ctx.drawImage(webCAM.image, 0, 0, canvas.width, canvas.height);
        
        this.clearPathCanvas();
    };
    
    webCAM.DrawPathCanvas = function() {
        
        var canvas = document.getElementById('path-canvas');
        var ctx = canvas.getContext('2d');
        
        ctx.fillStyle = "#0000FF";
        ctx.strokeStyle = "#0000FF";
        ctx.lineWidth = 3;
        //this.toolpaths.drawSimpleSegments(canvas);
        this.toolpaths.forEach(function(tp) {
            tp.draw(canvas);
        })
    };
    
    webCAM.CalcToolpaths = function() {
                
        // get user values
        var tbd = parseFloat($("#bitdiam").val());
        
        if (tbd) {
            
            var pxPerIn = 60;
            tbd *= pxPerIn;
        }
        
        var toolCtx = { 
         
            toolbitDiamInPx: tbd || 12,
        };
        
        var imgCanvas = document.getElementById('image-canvas');
        
        // hmm ... plural or not? 
        var path = ACTP.ToolpathsFromCanvas(toolCtx, imgCanvas);
        
        this.toolpaths.length = 0; // empty the array
        this.toolpaths.push(path);
    };
    
    webCAM.clearPathCanvas = function() {
        
        var canvas = document.getElementById('path-canvas');
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.clearRect(0, 0, canvas.width, canvas.height); // note the diff to image canvas      
    };
    
    webCAM.OnLoadImage = function() {

        var fileElem = $("#openimage");
        fileElem.click();
    };
    
    
    webCAM.handleFileSelect = function(evt) {
        var files = evt.target.files; // FileList object
        var file = files[0];
        
        var fileReadAsDataUrl = new FileReader();
        
        fileReadAsDataUrl.onload = (function(progEvt) {

            var imageAsDataUrl = progEvt.target.result;
            
            var img = new Image();
            img.src = progEvt.target.result;
            
            webCAM.image = img;
            webCAM.DrawImageCanvas();
        });
        
        fileReadAsDataUrl.readAsDataURL(file); 
    };
    
})(this.webCAM = {});

$(document).ready(function() {
    
    document.getElementById('openimage').addEventListener('change', webCAM.handleFileSelect, false);
});



