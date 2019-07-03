; (function ($) {
    var elem = {
        btnSlide: ".slider-panel .slider-list > div",
        btnStatus: ".slider-panel .preview .status-bar span",
        btnChangeImage: ".btn-change-image",
        btnRemoveSlider: ".slider-panel .slider-list .btn-remove-slide",

        previewPanel: ".slider-panel .preview",
        fileInput: ".slider-panel .preview input[type='file']",
        previewImage: ".slider-panel .preview img",
        sliderForm: ".slider-panel .preview .slider-form"
    };

    var handlers = {
        ready: function () {

        },
        onSliderSelected: function () {
            var el = $(this);
            var sliderID = $(el).data("id");
            var type = $("#SliderType").val();
            var currentSlider = $(elem.previewPanel).data("id");

            if (sliderID != currentSlider) {
                $.post("/Management/GetSlider", { id: sliderID, type: type }, function (result) {
                    if (result.success == 1) {
                        $(elem.previewPanel).data("id", sliderID);
                        $(elem.previewPanel).replaceWith(result.html);
                        $(elem.btnSlide).removeClass("active");
                        $(el).addClass("active");
                    }
                    else {
                        aware.showError("Manşet öğesi görüntülenemiyor. Lütfen daha sonra tekrar deneyin!");
                    }
                });
            }
            return false;
        },
        previewSliderImage: function () {
            var input = this;
            if (input.files && input.files[0]) {
                var fileName = input.files[0].name;
                //var allowedExtensions = $(input).attr("accept");
                var allowedExtensions = ".jpg,.jpeg,.png";

                var reader = new FileReader();
                reader.onload = function (e) {
                    if (aware.checkExtension(fileName, allowedExtensions)) {
                        $(elem.previewImage).attr("src", e.target.result);
                    } else {
                        aware.showToastr('Geçersiz uzantıya sahip bir dosya seçtiniz. Lütfen sadece \'' + allowedExtensions + '\' uzantılı dosyalar seçin!', 'error');
                    }
                };
                reader.readAsDataURL(input.files[0]);
            }
        },
        onStatusSelected: function () {
            if ($(this).hasClass("plus")) {
                $(this).parent().addClass("active");
                $(elem.previewPanel).find("#Status").val(1);
            } else {
                $(this).parent().removeClass("active");
                $(elem.previewPanel).find("#Status").val(2);
            }
            return false;
        },
        onSaveSlider: function (e) {
            e.preventDefault();
            var formData = new FormData(this);
            $.ajax({
                url: "/Management/SaveSlider", type: "POST", data: formData, contentType: false, cache: false, processData: false,
                success: function (result) {
                    if (result.success) {
                        aware.showToastr("Manşet bilgileri başarıyla kaydedildi.", "success");
                        aware.delayedRefresh(500);
                    } else {
                        aware.showToastr(result.message, "error");
                    }
                }
            });
        },
        onRemoveSlider: function (e) {
            e.preventDefault();
            var el = $(this).parent();
            var sliderID = $(el).data("id");
            if (sliderID > 0) {
                aware.confirm("Bu öğeyi silmek istediğinizden emin misiniz?", function () {
                    $.post("/Management/RemoveSlider", { sliderID: sliderID }, function (result) {
                        aware.hideDialog();
                        if (result.success) {
                            aware.showToastr("Manşet öğesi başarıyla silindi.", "success");
                            $(el).remove();
                            $(elem.btnSlide + ":eq(0)").click();
                        }
                        else {
                            aware.showError("Manşet öğesi silinemedi. Lütfen daha sonra tekrar deneyin!");
                        }
                    });
                });
            }
            else { aware.showError("Manşet öğesi silinemiyor. Lütfen daha sonra tekrar deneyin!"); }
            return false;
        }
    };

    var eventMetaData = [
        { selector: undefined, container: document, event: "ready", handler: handlers.ready, data: {} },
        { selector: elem.btnSlide, container: document, event: "click", handler: handlers.onSliderSelected, data: {} },
        { selector: elem.fileInput, container: document, event: "change", handler: handlers.previewSliderImage, data: {} },
        { selector: elem.btnChangeImage, container: document, event: "click", handler: function () { $(elem.fileInput).click(); return false; }, data: {} },
        { selector: elem.btnStatus, container: document, event: "click", handler: handlers.onStatusSelected, data: {} },
        { selector: elem.btnRemoveSlider, container: document, event: "click", handler: handlers.onRemoveSlider, data: {} },
        { selector: elem.sliderForm, container: document, event: "submit", handler: handlers.onSaveSlider, data: {} }
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));