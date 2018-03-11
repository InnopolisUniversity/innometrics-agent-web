KangoAPI.onReady(function() {
    $('#button-close').click(function(event) {
        KangoAPI.closeWindow()
    });
    alert(kango.browser.getName());
});