
// returns the 8 circles tangent to the 3 input circles
//
// circles are objects with center (2d point, object with x and y) and radius
//

// assumes real solutions
solveQuadratic = function (a, b, c) {

    var det = b*b - 4*a*c;
    
    if (det < 0)
        return undefined;
    
    var term = Math.sqrt(det);
    var ret = {};
    
    ret.s0 = (-b + term)/ (2*a);
    ret.s1 = (-b - term)/ (2*a);
    
    return ret;
}

// This finds, when "++" is the type
// a) the circle containing c1 and outside c2 and c3, and 
// b) the circle outside c1 and containing c2 and c3.
// 
// If "+-" is the type, then it finds the circles
// a) containing all three, and b
// b) outside of all three.

findTwoAppoloniusCircles = function(c1, c2, c3, type) {
    // see Maier thesis, 2010, p.29
    // and/or http://mathforum.org/mathimages/index.php/Problem_of_Apollonius   
    //
    // solve 
    //   (A)  a0x + b0y + c0r = d0, and 
    //   (B)  a1x + b1y + c1r = d1
    //
    // where a0 = 2(x1 - x2), b0 = 2(y1 - y2), c0 = 2(+- r1 +- r2), 
    // and d0 = (x1^2 + y1^2 - r1^2) - (x2^2 + y2^2 - r2^2)
    // same for a1, b1, c1, d1 where '2' is replaced with '3'
    
    // so ... if (c0 != 0) solve (A) for r in terms of x and y (C)
    // substitute into (B), if (b1 != 0) solve for y in terms of x (D)
    // sub (D) into (C) to have (E) r = fx+g and (D) y = hx+i
    
    // finally solve (F) (x-x1)^2 + (y-y1)^2 - (r+-r1)^2 = 0 for x
    //
    //   (C) r = (d0- a0x - b0y)/c0
    //   (D) y = (d1 - c1r - a1x)/b1 = (d1 - (c1/c0)(d0 - a0x - b0y) - a1x)/b1
    //       solve for y ... 
    //   (E) r = (d0 - a0x - b0( ...
    
    // So I get y = (1/(c0b1+c1b0))[(d1c0-c1d0) + (c1a0-c0a1) x ]
    // And with (C), r(x) = ...
    //  
    // Now this needs to go back into (x-x1)^2 + (y-y1)^2 - (r+-r1)^2 = 0
    
    var x1 = c1.cx;
    var x2 = c2.cx;
    var x3 = c3.cx;
    var y1 = c1.cy;
    var y2 = c2.cy;
    var y3 = c3.cy;
    var r1 = c1.cr;
    var r2 = c2.cr;
    var r3 = c3.cr;

    var a0 = 2*(x1-x2);
    var b0 = 2*(y1-y2);
    var c0 = (type === "++") ? 2*( r1+r2) :
             (type === "+-") ? 2*( r1-r2) :
             (type === "-+") ? 2*(-r1+r2) : 2*(-r1-r2);
    
    var d0 = x1*x1 + y1*y1 - r1*r1 - x2*x2 - y2*y2 + r2*r2;
 
    var a1 = 2*(x1-x3);
    var b1 = 2*(y1-y3);
    var c1 = (type === "++") ? 2*( r1+r3) :
             (type === "+-") ? 2*( r1-r3) :
             (type === "-+") ? 2*(-r1+r3) : 2*(-r1-r3);
             
    var d1 = x1*x1 + y1*y1 - r1*r1 - x3*x3 - y3*y3 + r3*r3;
    
    // from http://mathforum.org/mathimages/index.php/Problem_of_Apollonius
    // indicies are 2 less due to notation differences
    // we want x = e+fr and y = g+hr
    var ef_den = a1*b0 - a0*b1;
    var e_num  = b0*d1 - b1*d0;
    var f_num  = b1*c0 - b0*c1;
    
    var gh_den = a0*b1 - a1*b0;
    var g_num  = a0*d1 - a1*d0;
    var h_num  = a1*c0 - a0*c1;
    
    // there are 3 circles we could plug back into, (x1, y1, r1) or (x2, y2, r2) or 3's
    // the first seems to give 4 solutions (?), let's try the second also and call them (xi, yi, ri)
    
    // problem! - this is only working for (x1, y1, r1) not for (x2, y2, r2) 
    // (close - for ++, two solns tangent to c2. and two valid solns for +-, same solns for -+, and same solns as ++ for --).
    // same wrong behavior for (x3, y3, r3)
    var xi = x1; //(type === "++" || type === "+-") ? x1 : x2;
    var yi = y1; //(type === "++" || type === "+-") ? y1 : y2;
    var ri = r1; //(type === "++" || type === "+-") ? r1 : r2;
    
    // now when plugging back into (1), we subtract x1 from x, so
    var e0_num = e_num - xi*(ef_den);
    var g0_num = g_num - yi*(gh_den);
    
    // for numerical stability, this is not a good term to calculate
    var ef_den_sq = (1/ef_den)*(1/ef_den);
    var gh_den_sq = (1/gh_den)*(1/gh_den);
    
    // collect r*r, r and 1 terms to make ar^2 + br + c = 0, call these aq, bq and cq
    var sign_ri = (type === "++" || type === "+-") ? -1 : 1;
    
    var aq = f_num*f_num*ef_den_sq + h_num*h_num*gh_den_sq -1;
    var bq = 2*(e0_num*f_num*ef_den_sq+g0_num*h_num*gh_den_sq + sign_ri * ri);
    var cq = e0_num*e0_num*ef_den_sq + g0_num*g0_num*gh_den_sq - ri * ri;
    
    var sln = solveQuadratic(aq, bq, cq);
    
    if (!sln)
        return undefined;

    // plug to get the two circles    
    var ans = [];
        
    var cr = sln.s0;    
    var cx = (e_num+f_num*cr)/ef_den;
    var cy = (g_num+h_num*cr)/gh_den;
    
    var cir = { cx:cx, cy:cy, cr: Math.abs(cr) };
    ans.push(cir);
    
    cr = sln.s1;
    cx = (e_num+f_num*cr)/ef_den;
    cy = (g_num+h_num*cr)/gh_den;
    
    cir = { cx:cx, cy:cy, cr: Math.abs(cr) };
    ans.push(cir);
    
    return ans;
}

findApolloniusCircles = function (c1, c2, c3) {

    var ret = [];
    var ans = [];
    
    ans = findTwoAppoloniusCircles(c1, c2, c3, "++");
    ret = ret.concat(ans);
    ans = findTwoAppoloniusCircles(c2, c1, c3, "++");
    ret = ret.concat(ans);
    ans = findTwoAppoloniusCircles(c3, c2, c1, "++");
    ret = ret.concat(ans);
    
    // inner to all three and outer to all three
    ans = findTwoAppoloniusCircles(c1, c2, c3, "+-");
    ret = ret.concat(ans);

    // bug not giving these solutions
/*    ans = findTwoAppoloniusCircles(c1, c2, c3, "-+");
    ret = ret.concat(ans);
    ans = findTwoAppoloniusCircles(c1, c2, c3, "--");
    ret = ret.concat(ans);
    */
    return ret;
}

 
 

