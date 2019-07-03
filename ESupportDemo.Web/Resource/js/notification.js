; (function ($) {
    var elem = {
        notificationContent:"#Content",
        btnShowNotification: ".btn-show-notification",
        notificationModal: ".notification-modal",
        btnSaveNotification: ".btn-save-notification"
    };

    var handlers = {
        showNotification: function () {
            var id = $(this).data("id");
            aware.showLoading();
            $.post("/Notification/GetNotification", { notificationID: id }, function (response) {
                aware.hideDialog();
                if (response.success == 1) {
                    $(elem.notificationModal).find(".modal-body").html(response.html);
                    $(".target-selector").selecto();
                    $(".display-selector").selecto();
                    $(".status-selector").selecto();
                    aware.asDatePicker(".datepicker", { minDate: "0d" });
                    window.setTinyMce(elem.notificationContent, 150);
                    $(elem.notificationModal).modal("show");
                }
                else {
                    aware.showError("Bildirim görüntülenemiyor.", "Hata", "minus-circle");
                }
            });
            return false;
        },
        saveNotification: function () {
            if (aware.validate(elem.notificationModal)) {
                aware.showLoading("Kaydediliyor..");
                var postData = $(elem.notificationModal).find('form').serialize();
                $.post("/Notification/SaveNotification", postData, function (response) {
                    if (response.success == 1) {
                        aware.showMessage("İşlem Başarılı", "Bildirim bilgileri başarıyla güncellendi.", "check");
                        $(elem.notificationModal).modal("hide");
                        aware.delayedRefresh(800);
                    }
                    else {
                        aware.showError(response.message, "İşlem Başarısız", "minus-circle");
                    }
                });
            }
            return false;
        },
        ready: function () {
            
        }
    };

    $(function () {
        $(function () {
            $(document).on('click', elem.btnSaveNotification, {}, handlers.saveNotification);
            $(document).on('click', elem.btnShowNotification, {}, handlers.showNotification);
            $(document).on('ready', undefined, {}, handlers.ready);
        });
    });
}(jQuery));