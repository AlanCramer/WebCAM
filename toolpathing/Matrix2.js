


function Matrix2(a00, a01, a10, a11) {

    this.vals = [[a00, a01], [a10, a11]];

    
}

// vec has x and y
Matrix2.prototype.multiplyVec = function(vec) {

    var res = {};
    res.x = vec.x*this.vals[0][0] + vec.y*this.vals[0][1];
    res.y = vec.x*this.vals[1][0] + vec.y*this.vals[1][1];

    return res;
}
