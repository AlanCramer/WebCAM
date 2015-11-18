
(function(webCAM) {
    
    webCAM.image = null;
    webCAM.toolpaths = [];
    webCAM.svgW = 500;
    webCAM.svgH = 500;
    
    webCAM.OnDrawToolpaths = function() {

        this.clearPathCanvas();
        this.CalcToolpaths();
        this.DrawPathCanvas();
        //this.DrawImageCanvas();
        this.DrawSvgImage();
        this.DrawPathsSvg();
    };
    
    webCAM.OnDrawPocket = function() {

        this.clearPathCanvas();
        this.CalcPocket();
        this.DrawPathCanvas();
        //this.DrawImageCanvas();
        this.DrawSvgImage();
        this.DrawPathsSvg();
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
        
        webCAM.clearPathCanvas();
        webCAM.DrawImageCanvas();
        webCAM.DrawSvgImage();
    };
    
    webCAM.OnExportGCode = function() {
    
        // currently have 1 toolpath object, 
    
        var pxPerInTP = parseFloat($("#pxPerInTPCalc").val());
        var pxPerInImg = parseFloat($("#pxPerInImg").val()); 
        var pxPerMm = pxPerInTP/25.4;
        var gcode = ACTP.gCodePaths(webCAM.toolpaths, pxPerMm);
        
        webCAM.exportToFile(gcode, "gcodeDownload.nc");
        
    };
    
    webCAM.drawBBox = function() {
        
        var that = this;
        var imgSel = d3.select(this);
        
        var svg = d3.select("#canvasSvg");
        
        if (!webCAM.bboxDrawn) {
            
            webCAM.bboxDrawn = true;
            var manipG = svg.append("g")
                .attr("class", "manip")
                .attr("transform", "translate(" + this.x.baseVal.value + "," + this.y.baseVal.value +")");
                
            manipG.append("rect")
                .attr("x", 0) //this.x.baseVal.value)
                .attr("y", 0) // this.y.baseVal.value) 
                .attr("width", this.width.baseVal.value)
                .attr("height", this.height.baseVal.value)
                .style("stroke-width", "1")
                .style("fill", "none")
                .style("stroke", "orange")
                ;
                
            // manipG.append("circle")
                // .attr("cx", this.width.baseVal.value-10)
                // .attr("cy", 10) //this.y.baseVal.value)
                // .attr("r", 8)
                // .style("stroke-width", "1")
                // .style("fill", "orange")
                // .on("mouseover", function() { 
                   // d3.select(this).style("fill", "blue"); 
                // })
                // .on("mouseout", function() { 
                   // d3.select(this).style("fill", "orange"); 
                // })
                // .call(dragScale)
                // ;            
        }
    }
    
    webCAM.eraseBBox = function() {
        
        var imgSel = d3.select(this);
        var mouse = d3.mouse(this);
                   
        var svg = d3.select("#canvasSvg");
        
        svg.selectAll(".manip")
            .remove();
            
        webCAM.bboxDrawn = false;
    }
    
    var drag = d3.behavior.drag()
        .origin(function(d) {
                var img = d3.select(this);
                return {x: img.attr("x"), y: img.attr("y")}; 
        })
        .on("dragstart", webCAM.clearPathCanvas)
        .on("dragstart", function() {
            webCAM.clearPathCanvas(); })
        .on("drag", dragmove);
          
    function dragmove(d) {
        d3.select(this)
            .attr("x", d3.event.x)
            .attr("y", d3.event.y);
          
        // todo only associated manips, of course  
        var manips = d3.selectAll(".manip");
        
        manips
            .attr("transform", "translate (" + d3.event.x + "," + d3.event.y +")")
        ;           
    };
        
    function dragscale(d) {
        
        // get the img
        // d3.select(this)
            // .attr("x", d3.event.x)
            // .attr("y", d3.event.y);
          
        // todo only associated manips, of course  
        var img = d3.select("image"); // the manip  group
        var dist = Math.sqrt(d3.event.x*d3.event.x + d3.event.y*d3.event.y);

        var cW = parseFloat(img.attr("width"));
        var cH = parseFloat(img.attr("height"));

        console.log(dist);
        // img.attr("width", cW*dist);
        // img.attr("height", cH*dist);
        
        // webCAM.eraseBBox();
        // webCAM.drawBBox();
    };
    
    // redraws image canvas, probably want to clear path canvas 
    // only in tp pixel space!
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
            //var pxPerIn = parseFloat($("#pxPerIn").val()); 
            
            // how many pixels for the image?
            var scale = pxPerInTP/pxPerInImg;             
            canvas.width = img.width*scale;
            canvas.height = img.height*scale;
            
            var sz = d3.max([img.width, img.height]);
            
            //canvas.style.width =  ((600/sz)*img.width).toString() + "px";
            //canvas.style.height = ((600/sz)*img.height).toString() + "px";
            
            var canv2 = document.getElementById('path-canvas');
            canv2.width = canvas.width;
            canv2.height = canvas.height;
            //canv2.style.width = canvas.style.width;
            //canv2.style.height = canvas.style.height;
            
            ctx.drawImage(webCAM.image, 0, 0, canvas.width, canvas.height);
         
        }    
    };
    
    webCAM.DrawSvgImage = function() {
        
        var img = webCAM.image;
        if (!img)
            return;
        
        var pxPerInImg = parseFloat($("#pxPerInImg").val()); 
        var pxPerInTP = parseFloat($("#pxPerInTPCalc").val()); 
        var pxPerIn = parseFloat($("#pxPerIn").val());
                    
        var imgW = img.width*pxPerIn/pxPerInImg; // converted to display 
        var imgH = img.height*pxPerIn/pxPerInImg;
        
        var svg = d3.select("#canvasSvg");
        var imgs = svg.selectAll("image").data([img]);
    
        imgs
            .enter()
            .append("svg:image")
            .attr("xlink:href", img.src);

        imgs
            .attr("width", imgW) 
            .attr("height", imgH)
            .on("mouseenter", webCAM.drawBBox)
            .on("mouseleave", webCAM.eraseBBox)
            .call(drag);
    };
    
    webCAM.DrawPathsSvg = function() {
        
        var tp = this.toolpaths;    
        if (!tp)
            return;
               
        //var pxPerInImg = parseFloat($("#pxPerInImg").val()); 
        var pxPerInTP = parseFloat($("#pxPerInTPCalc").val()); 
        var pxPerIn = parseFloat($("#pxPerIn").val());
        //var scale1 = pxPerIn/pxPerInTP;
        //var scale2 = pxPerIn/pxPerInImg;
        var scale = pxPerIn/pxPerInTP;
        
        // get the x, y of the img, trf tp by scaled versions
        
        var img = d3.select("image"); // only 1 for the moment ...
        var xoff = +img.attr("x") ;
        var yoff = +img.attr("y");
        
        var svg = d3.select("#canvasSvg");
        var svgtp = svg.selectAll(".toolpath")
            .data(tp[0].pathSimpleSegs); 
        
        var polyline = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            ;
        
        //var tpwidth = 1/scale;
        svgtp.enter()
            .append("path")
            .datum(function(d) { return d; })
            .attr("class", "line toolpath")
            .attr("transform", "translate(" + xoff + " , " + yoff + ") scale(" + scale + ")")
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("d", function(d) { 
                return polyline(d) + "Z";});
        
    };
    
    webCAM.DrawPathCanvas = function() {
        
        var canvas = document.getElementById('path-canvas');
        var ctx = canvas.getContext('2d');
        
        ctx.fillStyle = "#0000FF";
        ctx.strokeStyle = "#0000FF";
        ctx.lineWidth = 3;
        
        this.toolpaths.forEach(function(tp) {
            //tp.draw(canvas);
            tp.drawSimpleSegments(canvas);
        })
    };
    
    webCAM.CalcPocket = function() {
                
        // get user values
        var tbd = parseFloat($("#bitdiam").val());
        
        if (tbd) {
            
            var pxPerInImg = parseFloat($("#pxPerInImg").val()); 
            var pxPerInTP = parseFloat($("#pxPerInTPCalc").val()); 
            var pxPerIn = parseFloat($("#pxPerIn").val()); 
            
            var scale = pxPerInTP;
            
            tbd *= scale;
        }
        
        var toolCtx = { 
         
            toolbitDiamInPx: tbd || alert("No Tool bit diam defined"),
        };
        
        var imgCanvas = document.getElementById('image-canvas');
        
        // hmm ... plural or not? 
        var path = ACTP.buildPocketToolpaths(toolCtx, imgCanvas);
        
        this.toolpaths.length = 0; // empty the array
        this.toolpaths.push(path);
    };
    
    webCAM.CalcToolpaths = function() {
                
        // get user values
        var tbd = parseFloat($("#bitdiam").val());
        
        if (tbd) {
            
            var pxPerInImg = parseFloat($("#pxPerInImg").val()); 
            var pxPerInTP = parseFloat($("#pxPerInTPCalc").val()); 
            var pxPerIn = parseFloat($("#pxPerIn").val()); 
            
            var scale = pxPerInTP;
            
            tbd *= scale;
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

        var svg = d3.select("#canvasSvg");
        var svgtp = svg.selectAll(".toolpath");
        svgtp.remove();
    };
    
    webCAM.getUserScale = function() {

        var xdim = parseFloat($("#xAxisScale").val());
        var ydim = parseFloat($("#yAxisScale").val());
        
        var pxPerIn = parseFloat($("#pxPerIn").val());  
        var pxPerInImg = parseFloat($("#pxPerInImg").val());  
        
        return {x: xdim, y:ydim, pxPerIn: pxPerIn, pxPerInImg: pxPerInImg};
    };
    
    webCAM.setupSvg = function() {

        var svgMargin = { top: 50, left: 50, right: 50, bottom:50};
        
        var us = this.getUserScale();
        
        webCAM.svgW = us.x*us.pxPerIn + svgMargin.left + svgMargin.right;
        webCAM.svgH = us.y*us.pxPerIn + svgMargin.top + svgMargin.bottom;
        
        var svgWorkingW = webCAM.svgW-svgMargin.left-svgMargin.right;
        var svgWorkingH = webCAM.svgH-svgMargin.top-svgMargin.bottom;
        
        var svg = d3.select("#canvasSvg")
            .style("border", "2px solid #9bb")
            .attr("width", webCAM.svgW)            
            .attr("height", webCAM.svgH)  
            .call(d3.behavior.zoom().on("zoom", function () {
                //svg.attr("transform",  " scale(" + d3.event.scale + ")")
                var ppi = +$("#pxPerIn").val();
                $("#pxPerIn").val(ppi*d3.event.scale);
                webCAM.OnScaleChange();
            }))
      .append("g")            
        ;
        
        var xScale = d3.scale.linear()
            .domain([0, us.x]) 
            .range([0, svgWorkingW]);
        
        var yScale = d3.scale.linear()
            .domain([0, us.y]) 
            .range([0, -svgWorkingH]);
        
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            ;
        
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            ;
        
        svg.selectAll(".axis")
            .remove();
        
        svg.append("g")
            .attr("class", "axis")
             .attr("transform", "translate( " + svgMargin.left  + ", " + (svgMargin.top+svgWorkingH) + ")")   // 
            .call(xAxis);
            
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + svgMargin.left +", " + (svgMargin.top+svgWorkingH) + ")")
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
            webCAM.DrawSvgImage();
        });
        
        fileReadAsDataUrl.readAsDataURL(file); 
    };
    
})(this.webCAM = {});

$(document).ready(function() {
    
    document.getElementById('openimage').addEventListener('change', webCAM.handleFileSelect, false);
    webCAM.resizeDisplayCanvas();
    
    webCAM.setupSvg();
    
    
    
});



