function BrowserTracker() {
    var self = this;
    kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function () {
        self._openOptionsPage();
    });
}

BrowserTracker.prototype = {

    _openOptionsPage: function () {
        kango.ui.optionsPage.open()
    }
};

var extension = new BrowserTracker();