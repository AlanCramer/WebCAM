
(function() {

    webCAM.exportToFile = function(content, filename) {

        var file = "data:text/csv;charset=utf-8,";
        file += content;
        
        var encodedUri = encodeURI(file);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        
        link.click();
    }
    
})();
