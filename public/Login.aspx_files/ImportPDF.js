function GetDiv() {
    var div = document.getElementById("divPdf");
    var hdfDiv = document.getElementById("hdfDiv");

    if (div == null) {
         div = document.getElementById("ctl00_divPdf");
         hdfDiv = document.getElementById("ctl00_hdfDiv");
    }

    var body = div.innerHTML;
    body = escape(body);
    hdfDiv.value = body;
}