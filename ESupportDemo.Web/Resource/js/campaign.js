; (function ($) {
    var handlers = {
        ready: function () {
            $(".store-selector").selecto({ type: "multi", allowSearch: true });
            $(".category-selector").selecto({ type: "multi", allowSearch: true });
            $(".property-selector").selecto({ type: "multi", allowSearch: true });
            $(".status-selector").selecto();
            aware.asDatePicker(".datepicker");
        },
        saveCampaign: function () {
            if (aware.validate(".campaign-detail")) {
                var filters = "";
                var storeIDs = $("#StoreInfo").val();
                if (storeIDs.length > 0 && storeIDs != "-1") {
                    filters += "sid=" + storeIDs + "&";
                }

                var categoryIDs = $("#CategoryInfo").val();
                if (categoryIDs.length > 0 && categoryIDs != "-1") {
                    filters += "cid=" + categoryIDs + "&";
                }

                var propertyIDs = $("#PropertyInfo").val();
                if (propertyIDs.length > 0 && propertyIDs != "-1") {
                    filters += "pid=" + propertyIDs + "&";
                }

                if (filters.length > 0) { //remove last '&' char
                    filters = filters.slice(0, -1);
                }

                $("#Campaign_FilterInfo").val(filters);
                return true;
            }
            return false;
        },
        deleteCampaign: function () {
            var campaignID = $('#Campaign_ID').val();
            aware.confirm("Bu kapanyayı silmek istediğinize emin misiniz?", function () {
                aware.showLoading();
                $.post("/Campaign/Delete", { id: campaignID }, function (result) {
                    if (result.success == 1) {
                        aware.showMessage("Kampanya başarı ile silindi");
                        aware.delayedRefresh(1200, "/kampanya-yonetimi");
                    }
                    else {
                        aware.showError("", "Kampanya Silinemedi!");
                    }
                });
                return false;
            }, "Kampanyayı Sil ?");

            return false;
        },
        onTemplateSelected: function () {
            $(element.campaignTemplate).removeClass("active");
            $(this).addClass("active");

            aware.showLoading();
            var templateID = $(element.campaignTemplate + ".active").data("id");
            var url = window.location.href.split("?")[0] + "?templateID=" + templateID;
            window.location.href = url;
            return false;
        },
        toggleTab: function (e) {
            var isPrev = e.data.back;
            var parent = $(this).parents(".tab-pane:eq(0)");

            var newTab;
            if (isPrev) {
                newTab = $(parent).prev(".tab-pane").attr("id");
            } else {
                newTab = $(parent).next(".tab-pane").attr("id");
            }

            $(".nav-tabs-custom .nav-tabs a[href='#" + newTab + "']").click();
            return false;
        }
    };

    var element = {
        btnSaveCampaign: ".btn-save-campaign",
        btnDeleteCampaign: ".btn-delete-campaign",
        campaignTemplate: ".campaign-template",
        btnPrev: ".campaign-detail .btn-prev",
        btnNext: ".campaign-detail .btn-next"
    };

    var eventMetaData = [
        { selector: undefined, container: document, event: "ready", handler: handlers.ready, data: {} },
        { selector: element.btnSaveCampaign, container: document, event: "click", handler: handlers.saveCampaign, data: {} },
        { selector: element.btnDeleteCampaign, container: document, event: "click", handler: handlers.deleteCampaign, data: {} },
        { selector: element.campaignTemplate, container: document, event: "click", handler: handlers.onTemplateSelected, data: {} },
        { selector: element.btnPrev, container: document, event: "click", handler: handlers.toggleTab, data: { back: true } },
        { selector: element.btnNext, container: document, event: "click", handler: handlers.toggleTab, data: { back: false } }
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));