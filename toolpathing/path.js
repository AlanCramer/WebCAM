

// these are 2D paths - todo, consolidate with 3D paths
function Path() {

    this.ptdirs = []; // array of positions and dir, x,y,dir
    this.pathSegments = []; // subarrays (by refs) of the above, collected in order 
    this.pathSimpleSegs = []; // reduced pathSegments
    this.pathArcSegs = []; // reduced arc approx
    
    this.meshes = [];
    
    this.scaleSimpleSegs = function(scale) {
    
        for (var i=0; i < this.pathSimpleSegs.length; ++i) {
            
            var curSeg = this.pathSimpleSegs[i];
            
            for (var j = 0; j < curSeg.length; ++j)
            {
                curSeg[j].x *= scale;
                curSeg[j].y *= scale;
          
            }
        }
    }
    
    this.buildThreeShape = function(pathSeg) {
    
        var theShape = new THREE.Shape();
        
        var firstPt = pathSeg[0];
        var lastPt = pathSeg[pathSeg.length -1];
        var i;
        
        theShape.moveTo( firstPt.x, firstPt.y );
        
        for (i=1; i < pathSeg.length; ++i) {
            theShape.lineTo(pathSeg[i].x, pathSeg[i].y);
        }
        
        theShape.lineTo(lastPt.x, lastPt.y);
        
        return theShape;
    }
    
    this.addSimpleSegsAsMeshes = function(matThick) {
    
        var i;
        for (i=0; i < this.pathSimpleSegs.length; ++i) {
            var nextShape = this.buildThreeShape(this.pathSimpleSegs[i]);
                
            var extrudeSettings = { amount: matThick }; // bevelSegments: 2, steps: 2 , bevelSegments: 5, bevelSize: 8, bevelThickness:5

            extrudeSettings.bevelEnabled = false;
            extrudeSettings.steps = 1;

            // todo  - remove positioning hack. 
            var mesh = addShape( nextShape, extrudeSettings, 0xBF936D, -150, 300, 0, Math.PI, 0, 0, 1 );
            //addLine( nextShape, 0x000000, -150, 300, 0, Math.PI, 0, 0, 1 );
            
            this.meshes.push(mesh);
        }
    }
    
    this.addSimpleSegsToScene = function() {
    
        var i;
        for (i=0; i < this.pathSimpleSegs.length; ++i) {
            var nextShape = this.buildThreeShape(this.pathSimpleSegs[i]);

            // todo  - remove positioning hack. 
            addLine( nextShape, 0x000000, -150, 300, 0, Math.PI, 0, 0, 1 );
        }
    }
    
    
    this.buildSimpleSegs = function(err) {
        
        var i, simpSeg;
        
        for (i=0; i < this.pathSegments.length; ++i) {

            simpSeg = RamerDouglasPeucker(this.pathSegments[i], err);            
            this.pathSimpleSegs.push(simpSeg);
        }
    } 
    
    this.buildArcInterp = function(err) {
            
        var i, simpArc;
        
        for (i=0; i < this.pathSegments.length; ++i) {

            simpArc = DouglasPeuckerCircs(this.pathSegments[i], err);            
            this.pathArcSegs.push(simpArc);
        }
    }
    
    getGCodeMoveTo = function(pt, zVal, pixelsPerMm) {
            
        // paths are in pixels
        // convert to inches
        var conX = pt.x/(25.4*pixelsPerMm);
        var conY = pt.y/(25.4*pixelsPerMm);
        
        conX = conX.toFixed(5);
        conY = conY.toFixed(5);
        
        dataStr = "X" + conX.toString() + " Y" + conY.toString() + " Z" + zVal.toString();
        
        return dataStr;
    }
    
    // array of pointdirs to gcode
    this.gcodeForSegment = function(pathSegment, jogHeight, cutHeight, pxPerMm) {
              
        var gCode = "";
        gCode += "G0 Z" + jogHeight.toString() + "\n"; // pull up to ceiling
        var jog = pathSegment[0];
        dataStr = getGCodeMoveTo(jog, jogHeight, pxPerMm);
        gCode += dataStr + "\n";
        
        pathSegment.forEach(function(ptDir, iPtDir) {
        
            dataStr = getGCodeMoveTo(ptDir, cutHeight, pxPerMm);
            gCode += dataStr + "\n";
        });
        
        return gCode;
    }
    
    this.gCodeForSegs = function (pathSegs, jogHeight, cutHeight, pxPerMm) {
    
        var gCode = "";
        for (var iSeg = 0; iSeg < pathSegs.length ; ++iSeg) {
            
            pathSeg = pathSegs[iSeg];
            gCode += this.gcodeForSegment(pathSeg, jogHeight, cutHeight, pxPerMm); 
        }
        return gCode;
    }
    
    this.generateGCode = function(pxPerMm, useSimplifiedSegs) {
    
        useSimplifiedSegs = (typeof useSimplifiedSegs === 'undefined'); // default to true
        var feedrateInPerMin = 120;
        
        var gCode = "";

        gCode += HA_PathUtil.gCodeSetUp(feedrateInPerMin);
        
        var dataStr, jogSt, pathSeg, iSeg;
        var cutHeight = -0.1; // inches
        var jogHeight = .9; // inches
        
        var segs = useSimplifiedSegs ? this.pathSimpleSegs : this.pathSegments;
        gCode += this.gCodeForSegs(segs, jogHeight, cutHeight, pxPerMm);
                
        gCode += HA_PathUtil.gCodeTakeDown(jogHeight);
        
        return gCode;
    }
    
    this.drawSegments = function(canvas) {
        
        var ctx = canvas.getContext('2d');
        var i;
        for (i=0; i < this.pathSegments.length; ++i) {
            drawPtDirs(ctx, this.pathSegments[i]);
        }
    }
    
    this.drawSimpleSegments = function(canvas) {
        
        var ctx = canvas.getContext('2d');
        
        var i;
        var end = this.pathSimpleSegs.length;
        
        for (i=0; i < end; ++i) {
            draw2DPtArrayWithLines(ctx, this.pathSimpleSegs[i]);
        }
    }
    
    this.drawArcSegs = function(canvas) {
        
        var ctx = canvas.getContext('2d');
        var i;
        var end = this.pathArcSegs.length;
        
        for (i=0; i < end; ++i) {
            drawPtsWithArcs(ctx, this.pathArcSegs[i]);
        }
    }
        
    var drawPtsWithArcs = function(ctx, pts) {
            
        var i, ipt, ipt1, ipt2;   
        var end = pts.length-1;
        
        ctx.save();
        
        ctx.strokeStyle='rgb(150,0,0)';
        ctx.lineWidth=4;
        
        ctx.beginPath(); 
        
        ctx.moveTo(pts[0].x, pts[0].y);
        for (i=0; i < pts.length-2; i += 2) {
            
            ipt = pts[i];
            ipt1 = pts[i+1];
            ipt2 = pts[i+2];
            
            ctx.arcTo(ipt1.x, ipt1.y, ipt2.x, ipt2.y, ipt1.radius);  
        }
        
        ctx.stroke();
    }
    
    var drawPtDirs = function(ctx, ptdirs) {
            
        ctx.beginPath(); // todo, what's this do again? only for stroke?
        
        for (i=0; i < ptdirs.length; ++i) {
            
            iPtDir = ptdirs[i];
            ctx.rect(iPtDir.x, iPtDir.y, 1, 1);            
        }
        
        ctx.fill();
    }
    
    this.draw = function(canvas) {
    
        var i, iPtDir;
        var ctx = canvas.getContext('2d');
        
        drawPtDirs(ctx, this.ptdirs);        
    }
}


function Path3D() {

    this.pts = []; // array of positions x,y,z - ordered, thus it's the same as 2D pathSegments
    this.simpleSegs = []; // reduced segments
    
    
}   