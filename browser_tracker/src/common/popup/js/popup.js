KangoAPI.onReady(function () {
    initStartPage();
    initDataCollectionListener();
    initDataSendListener();
    initNavigationListener();
    initLoginLogout();
    initSettingsWindow();
});

function initSettingsWindow() {
    var settings = getSettings();
    if (settings && settings.hasOwnProperty("serverAddress") && settings.serverAddress) {
        $("#server-address").val(settings.serverAddress);
    }
    $("#save-settings").on("click", function (e) {
        e.preventDefault();
        settings.serverAddress = $("#server-address").val();
        setSettings(settings);
        navigateToWindow(windows.main);
    })
}

function initDataSendListener() {
    $("#send-activities").on("click", function (e) {
        e.preventDefault();
        sendActivities();
    })
}

function sendActivities() {
    var settings = getSettings();
    var url = (settings.serverAddress) ? settings.serverAddress : "http://127.0.0.1:8080";
    $.ajax({
        type: "POST",
        url: url + "/activities/",
        contentType: "application/json",
        data: JSON.stringify({activities: getActivities()}),
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Token " + settings.token);
        }
    }).done(function () {
        setActivities([]);
    }).fail(function (e) {
        var kek = e.statusText;
    });
}

function initLoginLogout() {
    $("#login-form").on("submit", function (e) {
        e.preventDefault();
        var settings = getSettings();
        var $form = $(e.target);
        var username = $form.find("#username").val();
        var password = $form.find("#password").val();
        var url = (settings.serverAddress) ? settings.serverAddress : "http://127.0.0.1:8080";
        $.ajax({
            type: "POST",
            url: url + "/api-token-auth/",
            contentType: "application/json",
            data: JSON.stringify({username: username, password: password})
        }).done(function (response) {
            var settings = getSettings();
            settings.token = response.token;
            settings.username = username;
            setSettings(settings);
            navigateToWindow(windows.main);
        }).fail(function (e) {
            var kek = e.statusText;
        });
    });
    $("#logout").on("click", function (e) {
        e.preventDefault();
        clearLoginData();
        navigateToWindow(windows.login);
        disableDataCollection();
    })
}

function initStartPage() {
    var settings = getSettings();
    if (settings && settings.hasOwnProperty("token") && settings.token) {
        navigateToWindow(windows.main);
    } else {
        navigateToWindow(windows.login);
    }
}

function initDataCollectionListener() {
    var $dataCollection = $("#data-collection");
    var isListen = kango.storage.getItem("isListening");
    $dataCollection.prop("checked", isListen);
    $dataCollection.on("change", function () {
        if ($dataCollection.prop("checked")) {
            enableDataCollection();
        } else {
            disableDataCollection();
        }
    });
}

function enableDataCollection() {
    kango.storage.setItem("isListening", true);
}

function disableDataCollection() {
    kango.storage.setItem("isListening", false);
}

function clearLoginData() {
    var settings = getSettings();
    settings.token = null;
    settings.username = null;
    setSettings(settings);
}

function setSettings(settings) {
    kango.storage.setItem("settings", settings);
}

function getSettings() {
    var settings = kango.storage.getItem("settings");
    if (!settings) {
        settings = {};
        setSettings(settings);
    }
    return settings;
}

function getActivities() {
    var activities = kango.storage.getItem("activities");
    if (!activities) {
        activities = [];
    }
    return activities;
}

function setActivities(activities) {
    kango.storage.setItem("activities", activities);
}

function initNavigationListener() {
    $(".js-navigation-link").on("click", function (e) {
        e.preventDefault();
        var $this = $(e.target);
        navigateToWindow($this.attr("id"));
    })
}

function navigateToWindow(windowId) {
    if ($("#" + windowId + "-window:hidden").length > 0) {
        $(".js-navigation-window").hide(200);
        $("#" + windowId + "-window").show(200);
    }
}

var windows = {
    main: "main",
    settings: "settings",
    login: "login"
};