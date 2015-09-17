
drawArc3Pts = function (ctx, p0, p1, p2) {

    // convert the arc comment to an arc through 3pts
    //  ctx.arc(x, y, radius, startAngle, endAngle, counterClockwise);

    // gives x, y, rad
    var circ = makeCircleBy3Pts(p0, p1, p2);
    var x = circ.center.x;
    var y = circ.center.y;
    var rad = circ.radius;
    
    var a0 = Math.atan2((p0.y-y), (p0.x - x));
    var a1 = Math.atan2((p1.y-y), (p1.x - x));
    var a2 = Math.atan2((p2.y-y), (p2.x - x));
    
    var cw = ((a0 < a2) &&  (a1 > a0) && (a1 < a2)) ||
             ((a0 > a2) && ((a1 > a0) || (a1 < a2)));
    
    ctx.beginPath();
    ctx.arc(x,y,rad, a0, a2, !cw);
    ctx.stroke();
    ctx.closePath();
}