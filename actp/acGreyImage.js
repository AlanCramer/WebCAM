
(function(ACTP) {

    // abstract base class - todo, how to enforce?
    ACTP.AcGreyImage = function(width, height) {

    // private:
        this.width = width;
        this.height = height;
        // this.databuffer = new ArrayBuffer(width*height);
        // this.data = new Uint8ClampedArray(this.databuffer);
            
    }

    // public:    
    ACTP.AcGreyImage.prototype.getAt = function(x,y) {
        return this.data[this.width*y + x];
    }
    ACTP.AcGreyImage.prototype.setAt = function(x,y, val) {
        this.data[this.width*y + x] = val;
    }
    // this should be protected - is this adequate enforcement?
    ACTP.AcGreyImage.prototype.copy = function(dst) {

        throw(new Error("not implemented - needs to be overridden in subclass"));         
    }

    ACTP.AcGreyImage.prototype.getNbrhd = function(x,y) {
        var ret = {};
        if (x > 0 && y > 0 && x < (this.width -1) && y < (this.height-1))
        {
            ret.nw = this.getAt(x-1, y-1);
            ret.nn = this.getAt(x  , y-1);
            ret.ne = this.getAt(x+1, y-1);
            ret.ww = this.getAt(x-1, y  );
            ret.cc = this.getAt(x  , y  );
            ret.ee = this.getAt(x+1, y  );
            ret.sw = this.getAt(x-1, y+1);
            ret.ss = this.getAt(x  , y+1);
            ret.se = this.getAt(x+1, y+1);
        }
        return ret;
    }

    ACTP.AcGreyImage.prototype.getEncodedNbrhd = function(x,y) {

        var ret = this.getNbrhd(x,y);
        return DirectionMap.encodeNbrhd(ret.nw, ret.nn, ret.ne, 
                                        ret.ww, ret.cc, ret.ee, 
                                        ret.sw, ret.ss, ret.se);
    }

    // make the edges of the image a 2, 
    // this is a speciality function for threshold images
    ACTP.AcGreyImage.prototype.insertBoundary = function() {

        var i, j;
        var maxj = this.height -1;
        var maxi = this.width -1;
        
        for (i = 0; i < this.width; ++i)
        {
            this.setAt(i, 0, 2) ;
            this.setAt(i, maxj, 2);
        }
        
        for (j = 0; j < this.height; ++j)
        {
            this.setAt(0, j, 2) ;
            this.setAt(maxi, j, 2);
        }

    }

    ACTP.AcGreyImage.prototype.invertImage  = function() {

        var i, j;
        for (i = 0; i < this.width; ++i)
        {
            for (j = 0; j < this.height; ++j)
            {
                this.setAt(i,j, (this.getAt(i,j) === 0)? 1.0 : 0) ;
            }
        }
    }

    ACTP.AcGreyImage.prototype.thresholdImage  = function(value) {

        var i, j;
        for (i = 0; i < this.width; ++i)
        {
            for (j = 0; j < this.height; ++j)
            {
                this.setAt(i,j, (this.getAt(i,j) < value)? 1 : 0) ;
            }
        }
    }
        
    ACTP.AcGreyImage.prototype.debugPrint = function() {

        console.log("Width, Height: " + this.width + ", " + this.height); 
        var msg = "";
        var pad = "000";
                                
        for (var y = 0; y < this.height; ++y) {
            for (var x = 0; x < this.width; ++x) {
                var value = this.getAt(x,y);        
                var result = (pad+value.toString()).slice(-pad.length);
               
                msg = msg + result + " ";
            }
            msg = msg + "\n";
        }
        console.log(msg);
    }

    ACTP.AcGreyImage.prototype.initFromCanvas = function(canvas) {
        var ctx = canvas.getContext('2d'); // todo error checking

        this.width  = canvas.width;
        this.height = canvas.height;
        
        var imageData = ctx.getImageData(0, 0, this.width, this.height);

        var buf = imageData.data;
        //var buf = new ArrayBuffer(imageData.data.length);
        var buf8 = new Uint8ClampedArray(imageData.data);
        var data = new Uint32Array(imageData.data);
        
        this.databuffer = new ArrayBuffer(imageData.data.length/4);
        this.data = new Uint8ClampedArray(this.databuffer);
            
        // Determine whether Uint32 is little- or big-endian.
        data[1] = 0x0a0b0c0d;
        var isLittleEndian = true;
        if (buf[4] === 0x0a && buf[5] === 0x0b && buf[6] === 0x0c &&
            buf[7] === 0x0d) {
            isLittleEndian = false;
        }

        for (var y = 0; y < this.height; ++y) {
            for (var x = 0; x < this.width; ++x) {
                var i = (y*canvas.width +x)*4;
                var red = isLittleEndian ? data[i] : data[i+3];
                var green = isLittleEndian ? data[i + 1] : data[i+2];
                var blue = isLittleEndian ? data[i + 2] : data[i+1];
                var alpha = isLittleEndian ? data[i + 3] : data[i];
                
                var val = 0.2126 *red + 0.7152*green + 0.0722 *blue; // wikipedia: Stokes et al, 
                   //"A Standard Default Color Space for the Internet - sRGB" 
                
                // but for us, transparent is going to be white
                if (alpha === 0)
                   val = 1.0;
                
                this.data[y * this.width + x] = val;
            }
        }
    }
        
        
    ACTP.AcGreyImage.prototype.draw = function(canvas, xPos, yPos) {

        var canvasWidth  = canvas.width;
        var canvasHeight = canvas.height;
        var ctx = canvas.getContext('2d');
        var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        
        var buf = new ArrayBuffer(imageData.data.length);
        var buf8 = new Uint8ClampedArray(buf);
        var data = new Uint32Array(buf);
            
        // Determine whether Uint32 is little- or big-endian.
        data[1] = 0x0a0b0c0d;
        var isLittleEndian = true;
        if (buf[4] === 0x0a && buf[5] === 0x0b && buf[6] === 0x0c &&
            buf[7] === 0x0d) {
            isLittleEndian = false;
        }

        for (var y = 0; y < this.height; ++y) {
            for (var x = 0; x < this.width; ++x) {
                var value = this.getAt(x,y);
                data[y * canvasWidth + x] = this.encodeHeight(value, isLittleEndian);
            }
        }

        imageData.data.set(buf8);
        ctx.putImageData(imageData, 0, 0);
    }
       
    // call the input function on the neighborhood at each pixel in img
    // set the value in this to the returned value   
    ACTP.AcGreyImage.prototype.convolve3x3 = function(img, fn) {
        
        for (var y = 1; y < this.height; ++y) {
            for (var x = 1; x < this.width; ++x) {
            
                var nbr = img.getNbrhd(x, y);
                var val = fn(nbr);
                this.setAt(x, y, val);
            }  
        }
    }   
        
        
        // would be nice to introduce a binary image as well, 
    // could be fancy with space requirements and is needed for each
    // distance transform input

    ACTP.AcGrey8Image = function(width, height) {

        ACTP.AcGreyImage.call(this, width, height);

        this.databuffer = new ArrayBuffer(width*height);
        this.data = new Uint8ClampedArray(this.databuffer);
    }

    ACTP.AcGrey8Image.prototype = Object.create(ACTP.AcGreyImage.prototype);
    ACTP.AcGrey8Image.prototype.constructor = ACTP.AcGreyImage;
    ACTP.AcGrey8Image.prototype.copy = function () {
        var dst = new ACTP.AcGrey8Image(this.width, this.height);
        dst.data.set(this.data);
        return dst;
    }

    ACTP.AcGrey16Image = function(width, height) {

        ACTP.AcGreyImage.call(this, width, height);

        this.databuffer = new ArrayBuffer(width*height*2);
        this.data = new Uint16Array(this.databuffer);
    }
    ACTP.AcGrey16Image.prototype = Object.create(ACTP.AcGreyImage.prototype);
    ACTP.AcGrey16Image.prototype.constructor = ACTP.AcGreyImage;
    ACTP.AcGrey16Image.prototype.copy = function () {
        var dst = new ACTP.AcGrey16Image(this.width, this.height);
        dst.data.set(this.data);
        return dst;
    }   

    ACTP.AcGrey32Image = function(width, height) {

        ACTP.AcGreyImage.call(this, width, height);

        this.databuffer = new ArrayBuffer(width*height*4);
        this.data = new Uint32Array(this.databuffer);
    }
    ACTP.AcGrey32Image.prototype = Object.create(ACTP.AcGreyImage.prototype);
    ACTP.AcGrey32Image.prototype.constructor = ACTP.AcGreyImage;
    ACTP.AcGrey32Image.prototype.copy = function () {
        var dst = new ACTP.AcGrey32Image(this.width, this.height);
        dst.data.set(this.data);
        return dst;
    } 
    
        
    //private:
        // height is 0 to 255, littleEndian is a bool
        // todo - this is pure virtual (must be overridden)
        // depending on the bit depth
    ACTP.AcGrey8Image.prototype.encodeHeight = function(value, littleEndian) {
        if (littleEndian) {
            return  (255   << 24) |    // alpha
                    (value << 16) |    // blue
                    (value <<  8) |    // green
                    value;            // red
        } 
        else {
            return  (value << 24) |    // red
                    (value << 16) |    // green
                    (value <<  8) |    // blue
                     255;              // alpha
        }
    }    

    // value 
    ACTP.AcGrey16Image.prototype.encodeHeight = function(value, littleEndian) {
        if (littleEndian) {
        
        // todo this is a weird hack - dividing by 10
        // values can be to 256*256 = 65535
        // dividing by 256 makes many pics black - maybe divide by largest element(and then *256)?
            if (value >  2550) 
                value = 2550;
                
            return  (255   << 24) |    // alpha
                    (value/10 << 16) |    // blue
                    (value/10 <<  8) |    // green
                    value/10;            // red
        } 
        else {
            return  (value/255 << 24) |    // red
                    (value/255 << 16) |    // green
                    (value/255 <<  8) |    // blue
                     255;              // alpha
        }
    }
    
    ACTP.AcGrey32Image.prototype.encodeHeight = function(value, littleEndian) {
        if (littleEndian) {
        
        // todo this is a weird hack - dividing by 10
        // values can be to 256*256 = 65535
        // dividing by 256 makes many pics black - maybe divide by largest element(and then *256)?
            if (value >  2550) 
                value = 2550;
                
            return  (255   << 24) |    // alpha
                    (value/10 << 16) |    // blue
                    (value/10 <<  8) |    // green
                    value/10;            // red
        } 
        else {
            return  (value/255 << 24) |    // red
                    (value/255 << 16) |    // green
                    (value/255 <<  8) |    // blue
                     255;              // alpha
        }
    }
    
    
})(this.ACTP = this.ACTP || {});
