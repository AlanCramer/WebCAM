

// if the height in the region is different than the passed in iz, push a segment
// return the height of the current segment (either new or old)
var addSegIfHeightChange = function (path, img, iz, ix, iy, bitRad) {

    var pt;

    // collect pixels in region under bit, find the largest height
    var iz1 = findLargestHeight(img, ix, iy, bitRad);
    if (iz1 != iz) {
        pt = { x:ix, y:iy, z:iz };
        path.pts.push(pt);
        iz = iz1;
    }
    
    return iz;
} 

var addSeg = function (path, img, ix, iy, bitRad) {

    // collect pixels in region under bit, find the largest height
    var iz = findLargestHeight(img, ix, iy, bitRad);
    var pt = { x:ix, y:iy, z:iz };
    path.pts.push(pt);
    
    return iz;
} 


// assumes binary image -- 0 and 1s, zeros are not touched, non zeros get cut
// returns one path 
//
var buildRasterPathInXFromImage = function(img, bitDiamPx) {
    
    var path = new Path3D();
    
    // we will use the max height of each value within bitRadius 
    var bitRad = bitDiamPx/2;
    var w = img.width;
    var h = img.height;
    var ix, iy, iz;
    var iz1 = -1;
    var dir = -1;

    iy = 0;
    while (iy < h) {
    
        dir = dir*-1;
        
        if (dir > 0) {
        
            // push a point
            iz = addSeg(path, img, 0, iy, bitRad);
            
            for (ix = 0; ix < w ; ix++) {
            
                iz = addSegIfHeightChange(path, img, iz, ix, iy, bitRad);
            }
            
        } else {
        
            // push a point
            iz = addSeg(path, img, w, iy, bitRad);
            
            for (ix = w; ix > 0 ; --ix) {
                
                iz = addSegIfHeightChange(path, img, iz, ix, iy, bitRad);
            }
        }
        
        // close out the last segment (going across - starting a new one going down)
        iz = addSeg(path, img, ix, iy, bitRad);
        
        // walk down
        var endy = Math.min(iy + 2*bitRad, h);        
        while (iy < endy) {
            
            iz = addSegIfHeightChange(path, img, iz, ix, iy, bitRad);
            ++iy; 
        }
        
        // and close the down one, starting the next across
        iz = addSeg(path, img, ix, iy, bitRad);
    }
    
    return path;
}



// assumes binary image -- 0 and 1s, zeros are not touched, non zeros get cut
// returns one path 
//
var buildRasterPathInXFromImageOld = function(img, bitDiamPx) {
    
    var path = new Path3D();
    
    // we will use the max height of each value within bitRadius 
    var bitRad = bitDiamPx/2;
    var w = img.width;
    var h = img.height;
    var iz, pt, dir = -1;
    
    for (var iy = bitRad; iy < h; iy+=bitDiamPx) {
    
        dir = dir*-1;
        
        if (dir > 0) {
            for (var ix = bitRad; ix < w ; ix += bitDiamPx) {
                
                // collect pixels in region under bit, find the largest height
                iz = findLargestHeight(img, ix, iy, bitRad);
                pt = { x:ix, y:iy, z:iz };
                path.pts.push(pt);
            }
        } else {
            for (var ix = w; ix > bitRad ; ix -= bitDiamPx) {
                
                // collect pixels in region under bit, find the largest height
                iz = findLargestHeight(img, ix, iy, bitRad);
                pt = { x:ix, y:iy, z:iz };
                path.pts.push(pt);
            }
        }
        
    }
    
    return path;
}

// in the square of pixels with center at x, y, what is the largest height?
findLargestHeight = function(img, x, y, rad) {

    var val;
    var w = img.width;
    var h = img.height;
    var z = -1;
    
    for (var iy = y-rad; iy < y+2*rad; ++iy) {
        for (var ix = x-rad; ix < x+2*rad; ++ix) {
            
            // boundary check
            if (ix >= w || ix < 0 || iy >= h || iy < 0)
                continue;
            
            val = img.getAt(Math.floor(ix), Math.floor(iy)) ;
            
            if (val === undefined)
                console.log ("what?");
                
            z = val > z ? val : z;
        }
    }

    return z;
}