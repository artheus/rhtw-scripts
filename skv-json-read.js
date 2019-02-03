(function($){
  var loaderOverlay = $('<div><span style="color: white; position: relative; top: 37%; left: 50%; font-size: 54px; text-align: center; margin-left: -84px;">Laddar</span></div>');

  loaderOverlay.hide()
  loaderOverlay.css({
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: "9999"
  });

  loaderOverlay.appendTo($('body'))

  window.showLoader = function() {
    loaderOverlay.show()
  }

  window.hideLoader = function() {
    loaderOverlay.hide()
  }
})(jQuery);


(function($){
  if($('.pagination').length == 0) return;

  var mainTbody = $('.content table:first tbody');
  var loadLink = $('<a class="loadLinkButton button hint hint--top" href="#">Ladda alla sidor</a>');

  function traversePages() {
    var href = $('.pagination:first .next:not(.disabled) a').attr('href');

    if(href != null) {
      do {
        data = $.ajax({
          type: "GET",
          url: href,
          async: false
        }).responseText

        href = $(data).find('.pagination:first .next:not(.disabled) a').attr('href');
        var tableRows = $(data).find('.content table:first tbody tr')

        tableRows.each(function(tr){
          $('tr:last', mainTbody).after(tableRows[tr])
        });
      } while(href != null)

      window.hideLoader()
    }
  }

  loadLink.click(function(e){
    e.preventDefault();

    $('.pagination').hide()
    $('.loadLinkButton').hide()
    window.showLoader()
    setTimeout(traversePages, 200)
  });

  loadLink.insertAfter($('.pagination'));
})(jQuery);

// $('table.bordered.striped tbody tr td:nth-child(2)').each(function(k,v){ var kundnr = $(v).text(); var formData = {"url": "/clients/view/"+kundnr+"?list=clients&page=1&pt=0", "am_clientid": kundnr, "am_employee_id": "5"}; $.ajax({async:false, method:'POST', data: formData, url:'https://renahem.timewave.se/clients/accountmanager'})})

(function($){
  if($('#exportClientsModal').length != 0) return;

  window.addEventListener("dragover",function(e){
    e = e || event;
    e.preventDefault();
  },false);
  window.addEventListener("drop",function(e){
    e = e || event;
    e.preventDefault();
  },false);

  var container = $('<div style="margin: 20px;position:relative;"></div>');
  var dropZone = $('<div class="skv-file-drop-zone" style="user-select:none;margin-bottom:-40px;padding:20px;border:dashed #dfdfdf;border-radius:20px;position:relative;width:80%;left:9%;font-size:19px;color:#afafaf;font-weight:bold;text-align:center;">Släpp skatteverket fil här</div></div>');

  dropZone.appendTo(container);
  container.prependTo($('.content'));

  dropZone.on('drop', function(e){
    e.preventDefault();
    e.stopPropagation();

    window.showLoader()

    var files = e.originalEvent.target.files || e.originalEvent.dataTransfer.files;

    for (var i = 0, file; file = files[i]; i++) {
      var reader = new FileReader();
      reader.onload = function(e) {
    		// get file content
    		var jsonData = e.target.result;
    		skvData = JSON.parse(jsonData)

        skvData.beslut.forEach(function(b){
          b.arenden.forEach(function(a){
            result = $('.content table tr:contains('+a.fakturanummer+')')

            if (result.length == 0) {
              window.hideLoader();
              return;
            }

            var ansokningsnr = $('td:nth-child(7)', result).text();
            var begart = parseInt($('td:nth-child(9)', result).text().replace(/[kr ]/g, ''));
            var personnummer = $('td:nth-child(11)', result).text().replace(/[^0-9]/g,'');

            if (b.namn == ansokningsnr && personnummer == a.personnummer) {
              if(begart == a.godkantBelopp) {
                // check checkbox
                result.css("background-color", "");
                $('td:first input', result).prop( "checked", true )
              } else {
                // mark yellow
                result.css({backgroundColor: "rgb(245, 255, 145)"})
                $('td:first input', result).prop( "checked", false )
              }
              window.hideLoader();
            }
          });
        });
      }
      reader.readAsText(file);
    }
  })
})(jQuery);
