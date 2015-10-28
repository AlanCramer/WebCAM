
(function(webCAM) {
    
    webCAM.image = null;
    webCAM.toolpaths = [];
    webCAM.svgW = 500;
    webCAM.svgH = 500;
    
    webCAM.OnDrawToolpaths = function() {

        this.clearPathCanvas();
        this.CalcToolpaths();
        this.DrawPathCanvas();
    };
    
    webCAM.OnScaleChange = function() {
      
        this.resizeDisplayCanvas();
        this.setupSvg();
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
        
        // if (webCAM.image) {
            // webCAM.image.width = xdim*pxPerIn;
            // webCAM.image.height = ydim*pxPerIn;   
        // }
            
        
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
            
            var pxPerInImg = parseFloat($("#pxPerInImg").val()); 
            var pxPerInTP = parseFloat($("#pxPerInTPCalc").val()); 
            var pxPerIn = parseFloat($("#pxPerIn").val()); 
            
            // how many pixels for the image?
            var scale = pxPerInTP/pxPerIn;
            
            // how many px for the image ? 
            // pct = (image width)/(svg width) 
            // pxs = [imgWidth(in px) / pxPerIn] * pxPerInTP
            canvas.width = img.width*scale;
            canvas.height = img.height*scale;
            canvas.style.width = "600px";
            canvas.style.height = "600px";
            
            var canv2 = document.getElementById('path-canvas');
            canv2.width = img.width*scale;
            canv2.height = img.height*scale;
            canv2.style.width = "600px";
            canv2.style.height = "600px";
            
            ctx.drawImage(webCAM.image, 0, 0, img.width*scale, img.height*scale);
     
            var imgW = img.width*pxPerIn/pxPerInImg; // converted to display 
            var imgH = img.width*pxPerIn/pxPerInImg;
         
            var svg = d3.select("#canvasSvg");
            var imgs = svg.selectAll("image").data([img]);
            
            imgs
                .enter()
                .append("svg:image")
                .attr("xlink:href", img.src);
            
            imgs
                .attr("width", imgW) 
                .attr("height", imgH)
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
            
            var ppi = parseFloat($("#pxPerInTPCalc").val());
            tbd *= ppi;
        }
        
        var toolCtx = { 
         
            toolbitDiamInPx: tbd || alert("No Tool bit diam defined"),
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
    
    webCAM.getUserScale = function() {

        var xdim = parseFloat($("#xAxisScale").val());
        var ydim = parseFloat($("#yAxisScale").val());
        
        var pxPerIn = parseFloat($("#pxPerIn").val());  
        var pxPerInImg = parseFloat($("#pxPerInImg").val());  
        
        return {x: xdim, y:ydim, pxPerIn: pxPerIn, pxPerInImg: pxPerInImg};
    };
    
    webCAM.setupSvg = function() {

        var svgPaddingW = 50;
        var svgPaddingH = 50;
        
        var us = this.getUserScale();
        
        webCAM.svgW = us.x*us.pxPerIn + svgPaddingW;
        webCAM.svgH = us.y*us.pxPerIn + svgPaddingH;
        
        var svgWorkingW = webCAM.svgW-svgPaddingW;
        var svgWorkingH = webCAM.svgH-svgPaddingH;
        
        var svg = d3.select("#canvasSvg")
            .style("border", "2px solid #9bb")
            .attr("width", webCAM.svgW)            
            .attr("height", webCAM.svgH)            
        ;
        
        var xScale = d3.scale.linear()
            .domain([0, us.x]) 
            .range([0, svgWorkingW]);
        
        var yScale = d3.scale.linear()
            .domain([0, us.y]) 
            .range([0, svgWorkingH]);
        
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("top")
            ;
        
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            ;
        
        svg.selectAll(".axis")
            .remove();
        
        svg.append("g")
            .attr("class", "axis")
             .attr("transform", "translate( " + svgPaddingW  + ", " + svgPaddingH + ")")   // 
            .call(xAxis);
            
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + svgPaddingW +", " + svgPaddingH + ")")
            .call(yAxis);   
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
    
    webCAM.setupSvg();
    
    
    
});



