
// Yang Du, Numerical Methods for Approx. digitized curves by piecewise circular arcs

// D = delta = {V_1, ... , V_n }

// This is E_inf(D, G), the max dist to the circ of all the pts
circToPtsErr = function(ptArr, circle) {

    var maxErr = 0;
    
    for (var i = 0; i < ptArr.length; ++i) {

        // e_i(m) = min {d(V_i, P): P in G_m}
        var curErr = distPtCirc(ptArr[i], circle)

        if (curErr > maxErr)
            maxErr = curErr;
    }
    
    return maxErr;
}

// todo: currently requires transform to (-a,0) (0,m) (a,0)
reduceInterval = function (ptArr, mmin, ma, mb, mmax) {

    var ret = {min:mmin, max:mmax};
    var circ_ma = makeCircleBy3Pts(ptArr[0], {x:0, y:ma}, ptArr[ptArr.length-1]);
    var circ_mb = makeCircleBy3Pts(ptArr[0], {x:0, y:mb}, ptArr[ptArr.length-1]);
    
    var err_a = circToPtsErr(ptArr, circ_ma);
    var err_b = circToPtsErr(ptArr, circ_mb);

    var tol = .0001; // todo - where to store, what value appropriate
    
    if (Math.abs(err_a - err_b) < tol) {
        ret.min = ma;
        ret.max = mb;
        return ret;
    }
    
    if (err_a < err_b) {
        ret.max = mb;
        return ret;
    }
    
    if (err_a > err_b) {
        ret.min = ma;
        return ret;
    }
}

// assumes more than 2 pts, and pt[0].y === pt[last].y === 0
findMminMmax = function(ptArr) {
    
    if (ptArr.length < 3)
        alert("less than 3 pts in findMminMmax");

    var last = ptArr.length-1;
    var st = ptArr[0];
    var en = ptArr[last];
    var mmin, mi, mmax;
    var circ;
    var allCollinear = true;
    
    var perp = makePerpBisectLine(st, en);
    
    mmin = Number.MAX_VALUE;
    mmax = Number.MIN_VALUE;

    for (var i = 1; i < last; ++i) {
    
        if (collinear(st, ptArr[i], en))
            continue;
    
        allCollinear = false;
    
        circ = makeCircleBy3Pts(st, ptArr[i], en);
        
        // assumes y axis - todo : I guess this should be a param value on the line
        mi = circ.center.y + circ.radius;
        
        if (mi < mmin)
            mmin = mi;
            
        if (mi > mmax)
            mmax = mi;
    }
    
    if (allCollinear)
    {
        alert("all collinear?");
        mmin = mmax = 0;
    }
    
    return {min:mmin, max:mmax};
}

// find circ that minimizes max E_inf dist from ptArr
// requires ptArr[0] = (-a, 0) and ptArr[end] = (a, 0)
_findBestArcYVal = function(ptArr, epsilon) {

    var intvl = findMminMmax(ptArr);
    var ma, mb;
    var d = (intvl.max - intvl.min);
    
    while ( d > epsilon) {
        
        ma = d/3 + intvl.min;
        mb = 2*d/3 + intvl.min;
        intvl = reduceInterval(ptArr, intvl.min, ma, mb, intvl.max);
        d = (intvl.max - intvl.min);
    }
    
    var mbar = (intvl.max + intvl.min)/2;
    return mbar;
    //return makeCircleBy3Pts(ptArr[0], {x:0, y:mbar}, ptArr[ptArr.length - 1]);
}

findBestCircleFit = function(pts, epsilon) {

    // copy input array
    var trfPts = pts.slice(0);
    var pt0 = pts[0];
    var end = pts.length-1;
    var ptn = pts[end];
    
    // transform points so that pts[0] = (-a,0)  and pts[end] = (a,0)
    // first rotate then we'll find a translation
    // rotate about origin so that pt0 and ptn have same y val
    var dy = ptn.y - pt0.y;
    var dx = ptn.x - pt0.x;
    var dist = distPtPt(pt0, ptn); 
    var dyu = dy/dist;
    var dxu = dx/dist;
    
    var rot = new Matrix2(dxu, dyu, -dyu, dxu);
    var rotinv = new Matrix2(dxu, -dyu, dyu, dxu); // we'll need this later

    // rotate by negative theta
    for (var iPt = 0; iPt < pts.length; ++iPt) {
        trfPts[iPt] = rot.multiplyVec(pts[iPt]);
    }    

    // now translate each pt by negative the midpoint vec
    var midpt = makeMidPt(trfPts[0], trfPts[end]);
    
    // todo: avoid a loop by doing both at once
    // another todo: are we making a geom lib or not? - this is a point operation
    for (var iPt = 0; iPt < pts.length; ++iPt) {  
        trfPts[iPt].x = trfPts[iPt].x - midpt.x;
        trfPts[iPt].y = trfPts[iPt].y - midpt.y;
    }    
    
    // TODO problems here if when line is the fit - MUST THINK HERE!!!
    var arcY = _findBestArcYVal(trfPts, epsilon);
    var circ = makeCircleBy3Pts(trfPts[0], {x:0, y:arcY}, trfPts[end]);
    
    // finally, transform the circle back
    circ.center.x = circ.center.x + midpt.x;
    circ.center.y = circ.center.y + midpt.y;
    var arcmid = {x:0+midpt.x, y:arcY+midpt.y};
    
    circ.center = rotinv.multiplyVec(circ.center);
    arcmid = rotinv.multiplyVec(arcmid);
   
    return {circle:circ, arcpts:[pts[0], arcmid, pts[end]]};
}




