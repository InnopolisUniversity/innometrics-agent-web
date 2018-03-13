function BrowserTracker() {
    var self = this;
    kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, self._showPopup);
    kango.browser.addEventListener(kango.browser.event.DOCUMENT_COMPLETE, function (event) {
        var data = {
            url: event.url,
            title: event.title,
            tabId: event.tabId
        };
        self._handleActivity(data);
    });
    kango.browser.addEventListener(kango.browser.event.TAB_CHANGED, function (event) {
        var data = {
            url: event.url,
            title: event.title,
            tabId: event.tabId
        };
        self._handleActivity(data);
    });
    kango.browser.addEventListener(kango.browser.event.TAB_REMOVED, function (event) {
        var data = {
            url: event.url,
            title: event.title,
            tabId: event.tabId
        };
        self._handleActivity(data);
    });
}

BrowserTracker.prototype = {

    _showPopup: function () {
        kango.ui.browserButton.setPopup({
            url: 'popup/popup.html',
            width: 200,
            height: 300
        });
    },

    _handleActivity: function (data) {
        var self = this;
        if (!kango.storage.getItem("isListening")) {
            self._stopLastActivity();
            return;
        }
        var url = data.url;
        var title = data.title;
        var tabId = data.tabId;

        if (url && title) {
            console.log(this);
            if (!self.lastActivity) {
                self._startNewActivity(title, url);
            } else if (self.lastActivity && self.lastActivity.measurements[2].value !== url) {
                self._stopLastActivity();
                self._startNewActivity(title, url);
            }
        }
        if ((!url || !title) && tabId) {
            self._stopLastActivity();
        }
    },

    _startNewActivity: function (title, url) {
        var self = this;

        var startTime = Math.round(new Date / 1000);
        self.lastActivity = {
            name: kango.browser.getName() + "Agent",
            measurements: [
                {
                    name: "activity start",
                    type: "epoch_time",
                    value: startTime
                },
                {
                    name: "title",
                    type: "string",
                    value: title
                },
                {
                    name: "url",
                    type: "string",
                    value: url
                }
            ]
        };
    },

    _stopLastActivity: function () {
        var self = this;
        if (!self.lastActivity)
            return;
        var endTime = Math.round(new Date / 1000);
        var startTime = self.lastActivity.measurements[0].value;
        var activities = self._getActivities();

        self.lastActivity.measurements.push(
            {
                name: "activity end",
                type: "epoch_time",
                value: endTime
            },
            {
                name: "activity duration",
                type: "long",
                value: endTime - startTime
            }
        );
        activities.push(self.lastActivity);
        self._setActivities(activities);
        self.lastActivity = null;
    },

    _getActivities: function () {
        var activities = kango.storage.getItem("activities");
        if (!activities) {
            activities = [];
        }
        return activities;
    },

    _setActivities: function (activities) {
        kango.storage.setItem("activities", activities);
    }
};

var extension = new BrowserTracker();