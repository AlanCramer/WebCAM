
(function(webCAM) {
    
    webCAM.image = {};
    webCAM.toolpaths = [];
    
    webCAM.OnLoadImage = function() {

        var fileElem = $("#openimage");
        fileElem.click();
    };
    
    webCAM.OnDrawToolpaths = function() {

        this.clearPathCanvas();
        this.CalcToolpaths();
        this.DrawPathCanvas();
    };
    
    webCAM.DrawImageCanvas = function() {
        
        var canvas = document.getElementById('image-canvas');
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvas.width, canvas.height); // draw white, 
      
        ctx.drawImage(webCAM.image, 0, 0, canvas.width, canvas.height);
        
        this.clearPathCanvas();
    };
    
    webCAM.DrawPathCanvas = function() {
        
        var canvas = document.getElementById('path-canvas');
        var ctx = canvas.getContext('2d');
        ctx.fillStyle= "black";
        ctx.fillRect(5,5,120, 15);
        ctx.fillStyle= "white";
        ctx.fillText("I am the path canvas", 10, 15);
    };
    
    webCAM.CalcToolpaths = function() {
        
    };
    
    webCAM.clearPathCanvas = function() {
        
        var canvas = document.getElementById('path-canvas');
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.clearRect(0, 0, canvas.width, canvas.height); // note the diff to image canvas      
    };
    
    webCAM.handleFileSelect = function(evt) {
        var files = evt.target.files; // FileList object
        var file = files[0];
        
        var fileReadAsDataUrl = new FileReader();
        
        fileReadAsDataUrl.onload = (function(progEvt) {

            var imageAsDataUrl = progEvt.target.result;
            
            var img = new Image();
            img.src = progEvt.target.result;
            
            webCAM.image = img;
            webCAM.DrawImageCanvas();
        });
        
        fileReadAsDataUrl.readAsDataURL(file); 
    };
    
})(this.webCAM = {});

$(document).ready(function() {
    
    document.getElementById('openimage').addEventListener('change', webCAM.handleFileSelect, false);
});



