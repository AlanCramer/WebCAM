
(function(webCAM) {
    
    webCAM.image = null;
    webCAM.toolpaths = [];
    webCAM.pxPerIn = 1; // ??
    
    webCAM.OnDrawToolpaths = function() {

        this.clearPathCanvas();
        this.CalcToolpaths();
        this.DrawPathCanvas();
    };
    
    webCAM.OnScaleChange = function() {
      
        this.resizeDisplayCanvas();
      
    };
    
    webCAM.resizeDisplayCanvas = function() {
      
        var imgCanvas = document.getElementById('image-canvas');
        var pathCanvas = document.getElementById('path-canvas');
        
        var xdim = parseFloat($("#xAxisScale").val());
        var ydim = parseFloat($("#yAxisScale").val());
        //var zdim = parseFloat($("#zAxisScale").val());
        
        var pxPerIn = parseFloat($("#pxPerIn").val());

        
        imgCanvas.width = xdim*pxPerIn;
        imgCanvas.height = ydim*pxPerIn;
        
        pathCanvas.width = xdim*pxPerIn;
        pathCanvas.height = ydim*pxPerIn;    
        
        if (webCAM.image) {
            webCAM.image.width = xdim*pxPerIn;
            webCAM.image.height = ydim*pxPerIn;   
        }
            
        
        // imgCanvas.style.width = "" + xdim*pxPerIn + "px";
        // imgCanvas.style.height = "" + ydim*pxPerIn+ "px";
        
        // pathCanvas.style.width = "" +xdim*pxPerIn+ "px";
        // pathCanvas.style.height = "" +ydim*pxPerIn+ "px";    
        
        webCAM.clearPathCanvas();
        webCAM.DrawImageCanvas();
    };
    
    webCAM.OnExportGCode = function() {
    
        // currently have 1 toolpath object, 
    
        var pxPerMm = 3; // todo ??
        var gcode = ACTP.gCodePaths(webCAM.toolpaths, pxPerMm);
        
        webCAM.exportToFile(gcode, "gcodeDownload.nc");
        
    };
    
    
    webCAM.drawBBox = function() {
        
        var that = this;
        var imgSel = d3.select(this);
        
        var svg = d3.select("#canvasSvg");
        
        svg.append("rect")
            .attr("class", "manip")
            .attr("x", this.x.baseVal.value)
            .attr("y", this.y.baseVal.value) 
            .attr("width", this.width.baseVal.value)
            .attr("height", this.height.baseVal.value)
            .style("stroke-width", "1")
            .style("fill", "none")
            .style("stroke", "orange")
            ;
    }
    
    webCAM.eraseBBox = function() {
        
        var that = this;
        var imgSel = d3.select(this);
        
        var svg = d3.select("#canvasSvg");
        
        svg.selectAll(".manip")
            .remove();
    }
    
    var drag = d3.behavior.drag()
        .origin(function(d) {
                var img = d3.select(this);
                return {x: img.attr("x"), y: img.attr("y")}; 
        })
        .on("drag", dragmove);
    
    function dragmove(d) {
        d3.select(this)
            .attr("x", d3.event.x)
            .attr("y", d3.event.y);
          
        // todo only associated manips, of course  
        d3.select(".manip")
            .attr("x", d3.event.x)
            .attr("y", d3.event.y);         
          
          
    };
    
    // redraws image canvas, probably want to clear path canvas 
    webCAM.DrawImageCanvas = function() 
    {
        
        // todo - image resolution vs dimensions
        // display dimension should be not relevant 
        
        var canvas = document.getElementById('image-canvas');
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvas.width, canvas.height); // draw white, 
      
        var img = webCAM.image;
        if (img) {
            ctx.drawImage(webCAM.image, 0, 0, img.width, img.height);
         
            var svg = d3.select("#canvasSvg");
            var imgs = svg.selectAll("image").data([img]);
            imgs.enter()
                .append("svg:image")
                .attr("width", img.width/2) 
                .attr("height", img.height/2)
                .attr("xlink:href", img.src)
                .on("mouseover", webCAM.drawBBox)
                .on("mouseout", webCAM.eraseBBox)
                .call(drag);
        }    
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

            console.log("in onload");
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
    webCAM.resizeDisplayCanvas();
    
    var svg = d3.select("#canvasSvg")
        .style("border", "2px solid orange")
        ;   
    
});



