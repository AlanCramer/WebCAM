    
    
// draw lines between pts in array
var draw2DPtArrayWithLines = function(ctx, pts) {
        
    var i, iPt;    
    ctx.beginPath(); 
    
    ctx.moveTo(pts[0].x, pts[0].y);
    for (i=1; i < pts.length-1; ++i) {
        
        iPt = pts[i];
        ctx.lineTo(iPt.x, iPt.y);  
    }
    ctx.lineTo(pts[0].x, pts[0].y);
    
    ctx.stroke();
}

var valueToColor = function(val, min, max) {

   var lut = ['#0000ff', '#ff00ff', '#00ff00', '#ffff00', '#FFA500', '#FF0000'];
   var maxval = lut.length -1;

   var z = Math.floor((val/(max - min)) * maxval);
   
   return lut[z];
}


// draw lines between xy vals with color for z in array
var draw3DPtArrayWithLines = function(ctx, pts) {
        
    var minz = Number.MAX_VALUE;
    var maxz = 0; 
    var curz;

    // find min and max
    for (i=0; i < pts.length-1; ++i) {
        
        curz = pts[i].z;
        minz = curz < minz ? curz : minz;
        maxz = pts[i].z > maxz ? curz : maxz;
    }    
        
    var i, iPt;    
    ctx.beginPath(); 
    
    ctx.moveTo(pts[0].x, pts[0].y);
    for (i=1; i < pts.length-1; ++i) {

        i1pt = pts[i-1];
        iPt = pts[i];
        var clr = valueToColor(iPt.z, minz, maxz);
       
        ctx.beginPath(); 
        ctx.moveTo(i1pt.x, i1pt.y);
        ctx.lineTo(iPt.x, iPt.y);  
        ctx.strokeStyle = clr;
        ctx.stroke();
    }
    
}