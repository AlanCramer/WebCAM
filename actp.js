
(function(ACTP) {
    
    ACTP.OnLoadImage = function() {

        var fileElem = $("#openimage");
        fileElem.click();
    };
    
    ACTP.DrawImageCanvas = function() {
        
        var canvas = document.getElementById('imagecanvas');
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvas.width, canvas.height);
      
        ctx.drawImage(ACTP.image, 0, 0, canvas.width, canvas.height);
    };
    
    ACTP.handleFileSelect = function(evt) {
        var files = evt.target.files; // FileList object
        var file = files[0];
        
        var fileReadAsDataUrl = new FileReader();
        
        fileReadAsDataUrl.onload = (function(progEvt) {

            var imageAsDataUrl = progEvt.target.result;
            
            var img = new Image();
            img.src = progEvt.target.result;
            
            ACTP.image = img;

            ACTP.DrawImageCanvas();
            ACTP.SetSetScaleState();
        });
        
        fileReadAsDataUrl.readAsDataURL(file); 
    };
    
    ACTP.SetSetScaleState = function() {

        $("#topstring").text("Set the Scales (inches) ... ");
        //$("#buttons").hide();
        //$("#axisScaleInputs").show();
    };
    
    ACTP.SetState = function(stateName) {

        
    };
    
})(this.ACTP = {});

$(document).ready(function() {
    
    document.getElementById('openimage').addEventListener('change', ACTP.handleFileSelect, false);
});



