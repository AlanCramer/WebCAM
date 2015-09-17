
    // http://stijndewitt.wordpress.com/2014/01/26/enums-in-javascript/
    var DirectionEnum = {
  
        North: "north",
        East: "east",
        South: "south",
        West: "west",
        Corner: "corner",
        Stop: "stop"
    };
    Object.freeze(DirectionEnum);



function DirectionMap() {

    this.dirMap = {};
    
    this.nbrhdToDir = function(encodedNbrhd) {

        if (!encodedNbrhd)
            return DirectionEnum.Stop;
            
        var res = this.dirMap[encodedNbrhd];
        return res;
    }
    
    this.init = function() {
        // 0 = empty
        // 1 = interior
        // 2 = boundary
        //
        // 011
        // 111
        // 111
        this.addDirMapEntry(0,1,1,1,1,1,1,1,1, DirectionEnum.North);
        // 101
        // 111
        // 111
        this.addDirMapEntry(1,0,1,1,1,1,1,1,1, DirectionEnum.East);
        //
        // 2 0's:
        //
        // 001
        // 111
        // 111
        this.addDirMapEntry(0,0,1,1,1,1,1,1,1,DirectionEnum.East);
        // 100
        // 111
        // 111
        this.addDirMapEntry(1,0,0,1,1,1,1,1,1,DirectionEnum.East);
        // 010
        // 111
        // 111
        this.addDirMapEntry(0,1,0,1,1,1,1,1,1,DirectionEnum.East);
        // 011
        // 110
        // 111
        this.addDirMapEntry(0,1,1,1,1,0,1,1,1,DirectionEnum.South);
        // 110
        // 011
        // 111
        this.addDirMapEntry(1,1,0,0,1,1,1,1,1,DirectionEnum.East);
        // 101
        // 011
        // 111
        this.addDirMapEntry(1,0,1,0,1,1,1,1,1,DirectionEnum.East);
        // 101
        // 110
        // 111
        this.addDirMapEntry(1,0,1,1,1,0,1,1,1,DirectionEnum.South);
        // 011
        // 111
        // 110
        this.addDirMapEntry(0,1,1,1,1,1,1,1,0,DirectionEnum.Corner); // this is probably a bug, the direction is "corner"
        // 011
        // 111
        // 101
        this.addDirMapEntry(0,1,1,1,1,1,1,0,1,DirectionEnum.North);
        // 110
        // 111
        // 101
        this.addDirMapEntry(1,1,0,1,1,1,1,0,1,DirectionEnum.West);
        // 101
        // 111
        // 110
        this.addDirMapEntry(1,0,1,1,1,1,1,1,0,DirectionEnum.South);
        // 101
        // 111
        // 011
        this.addDirMapEntry(1,0,1,1,1,1,0,1,1,DirectionEnum.East);
        //
        // 3 0's:
        //
        // 001
        // 011
        // 111
        this.addDirMapEntry(0,0,1,0,1,1,1,1,1,DirectionEnum.East);
        // 010
        // 011
        // 111
        this.addDirMapEntry(0,1,0,0,1,1,1,1,1,DirectionEnum.East);
        // 010
        // 110
        // 111
        this.addDirMapEntry(0,1,0,1,1,0,1,1,1,DirectionEnum.South);
        // 010
        // 111
        // 011
        this.addDirMapEntry(0,1,0,1,1,1,0,1,1,DirectionEnum.East);
        // 010
        // 111
        // 110
        this.addDirMapEntry(0,1,0,1,1,1,1,1,0,DirectionEnum.South);
        // 110
        // 011
        // 011
        this.addDirMapEntry(1,1,0,0,1,1,0,1,1,DirectionEnum.East);
        // 011
        // 110
        // 110
        this.addDirMapEntry(0,1,1,1,1,0,1,1,0,DirectionEnum.South);
        // 101
        // 011
        // 011
        this.addDirMapEntry(1,0,1,0,1,1,0,1,1,DirectionEnum.East);
        // 101
        // 110
        // 110
        this.addDirMapEntry(1,0,1,1,1,0,1,1,0,DirectionEnum.South);
        // 011
        // 011
        // 011;
        this.addDirMapEntry(0,1,1,0,1,1,0,1,1,DirectionEnum.North);
        //
        // 4 0's:
        //
        // 001
        // 011
        // 011
        this.addDirMapEntry(0,0,1,0,1,1,0,1,1,DirectionEnum.East);
        // 100
        // 110
        // 110
        this.addDirMapEntry(1,0,0,1,1,0,1,1,0,DirectionEnum.South);
        // 010
        // 011
        // 011
        this.addDirMapEntry(0,1,0,0,1,1,0,1,1,DirectionEnum.East);
        // 010
        // 110
        // 110
        this.addDirMapEntry(0,1,0,1,1,0,1,1,0,DirectionEnum.South);
        // 001
        // 110
        // 110
        this.addDirMapEntry(0,0,1,1,1,0,1,1,0,DirectionEnum.South);
        // 100
        // 011
        // 011
        this.addDirMapEntry(1,0,0,0,1,1,0,1,1,DirectionEnum.East);
        //
        // 5 0's:
        //
        // 000
        // 011
        // 011
        this.addDirMapEntry(0,0,0,0,1,1,0,1,1,DirectionEnum.East);
        //
        // boundary states
        //
        // 200
        // 211
        // 211
        this.addDirMapEntry(2,0,0,2,1,1,2,1,1,DirectionEnum.East);
        // 201
        // 211
        // 211
        this.addDirMapEntry(2,0,1,2,1,1,2,1,1,DirectionEnum.East);
        // 210
        // 211
        // 211
        this.addDirMapEntry(2,1,0,2,1,1,2,1,1,DirectionEnum.East);
        // 002
        // 112
        // 112
        this.addDirMapEntry(0,0,2,1,1,2,1,1,2,DirectionEnum.Stop);
        // 102
        // 112
        // 112
        this.addDirMapEntry(1,0,2,1,1,2,1,1,2,DirectionEnum.Stop);
        // 002
        // 112
        // 102
        this.addDirMapEntry(0,0,2,1,1,2,1,0,2,DirectionEnum.Stop);
        // 012
        // 112
        // 112
        this.addDirMapEntry(0,1,2,1,1,2,1,1,2,DirectionEnum.Stop);
        // 012
        // 112
        // 102
        this.addDirMapEntry(0,1,2,1,1,2,1,0,2,DirectionEnum.Stop);
    }



    // there must be a cute, clever version of this 
    // are these ints? NORTH+1 === EAST?
    
    this.RotDir90 = function(dir) {
        if (dir === DirectionEnum.East)
            return DirectionEnum.South;

        if (dir === DirectionEnum.South)
            return DirectionEnum.West;

        if (dir === DirectionEnum.West)
            return DirectionEnum.North;

        if (dir === DirectionEnum.North)
            return DirectionEnum.East;

        // corner and stop maps to themselves
        return dir;
    }
    
    this.RotDir180 = function(dir) {
    
        if (dir === DirectionEnum.East)
            return DirectionEnum.West;

        if (dir === DirectionEnum.South)
            return DirectionEnum.North;

        if (dir === DirectionEnum.West)
            return DirectionEnum.East;

        if (dir === DirectionEnum.North)
            return DirectionEnum.South;

        // corner and stop maps to themselves
        return dir;
    }
        
    this.RotDir270 = function(dir)
    {
        if (dir === DirectionEnum.East)
            return DirectionEnum.North;

        if (dir === DirectionEnum.South)
            return DirectionEnum.East;

        if (dir === DirectionEnum.West)
            return DirectionEnum.South;

        if (dir === DirectionEnum.North)
            return DirectionEnum.West;

        // corner and stop maps to themselves
        return dir;
    }
    

    
    this.encodeNbrhdRot90 = function( 
        nw,  nn,  ne,
        ww,  cc,  ee,
        sw,  ss,  se)
    {
        return  (sw <<  0) + (ww <<  2) + (nw <<  4) +
                (ss <<  6) + (cc <<  8) + (nn << 10) +
                (se << 12) + (ee << 14) + (ne << 16);
    }
        
    this.encodeNbrhdRot180 = function(
        nw,  nn,  ne,
        ww,  cc,  ee,
        sw,  ss,  se)
    {
        return  (se <<  0) + (ss <<  2) + (sw <<  4) +
                (ee <<  6) + (cc <<  8) + (ww << 10) +
                (ne << 12) + (nn << 14) + (nw << 16);
    }

    this.encodeNbrhdRot270 = function(
        nw,  nn,  ne,
        ww,  cc,  ee,
        sw,  ss,  se)
    {
        return  (ne <<  0) + (ee <<  2) + (se <<  4) +
                (nn <<  6) + (cc <<  8) + (ss << 10) +
                (nw << 12) + (ww << 14) + (sw << 16);
    }
    

    
    this.addDirMapEntry = function(
        nw,  nn,  ne,
        ww,  cc,  ee,
        sw,  ss,  se,
        dir)
    {
        this.dirMap[DirectionMap.encodeNbrhd(nw, nn, ne, ww, cc, ee, sw, ss, se)] = dir;
        this.dirMap[this.encodeNbrhdRot90(nw, nn, ne, ww, cc, ee, sw, ss, se)] = this.RotDir90(dir);
        this.dirMap[this.encodeNbrhdRot180(nw, nn, ne, ww, cc, ee, sw, ss, se)] = this.RotDir180(dir);
        this.dirMap[this.encodeNbrhdRot270(nw, nn, ne, ww, cc, ee, sw, ss, se)] = this.RotDir270(dir);
    }

    this.init();
}

// inputs are uint8s and out is uint32
DirectionMap.encodeNbrhd = function( 
    nw,  nn,  ne,
    ww,  cc,  ee,
    sw,  ss,  se)
{
    en1 = nw << 0;
    en2 = nn << 2;
    en3 = ne << 4;
    en4 = ww << 6;
    en5 = cc << 8;
    en6 = ee << 10;
    en7 = sw << 12;
    en8 = ss << 14;
    en9 = se << 16;

    return en1 + en2 + en3 + en4 + en5 + en6 + en7 + en8 + en9;
}


