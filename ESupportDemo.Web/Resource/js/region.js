(function ($) {
    var elem = {
        regionItem: ".region-list ul li",
        btnEdit: ".region-list ul li .btn-edit",
        btnCancel: ".region-list ul li .btn-cancel",
        btnSave: ".region-list ul li .btn-save",
        btnRemove: ".region-list ul li .btn-remove"
    };

    var handlers = {
        onRegionSelected: function (regionType, parentID) {
            if (regionType != 3) { //Mahalle dışında seçim yapılırsa
                $.post("/Region/GetSubRegions", { parentID: parentID, regionType: (regionType + 1) }, function (result) {
                    if (regionType == 0) {
                        $(".region-list.city > div").html(result.html);
                        $(".region-list.county > div").html("<span class='info'>İl Seçiniz</span>");
                        $(".region-list.district > div").html("<span class='info'>İlçe Seçiniz</span>");
                    }
                    if (regionType == 1) {
                        $(".region-list.county > div").html(result.html);
                        $(".region-list.district > div").html("<span class='info'>İlçe Seçiniz</span>");
                    }
                    else if (regionType == 2) {
                        $(".region-list.district > div").html(result.html);
                    }
                });
            }
            return false;
        },
        saveRegion: function () {
            var isValid = aware.validate($(this).parents(".region-form"));
            if (isValid) {
                var postData = {
                    id: $(this).parents("li:eq(0)").data("id"),
                    parentID: $(this).parents("li:eq(0)").data("parent-id"),
                    name: $(this).parents(".region-form").find("input").val(),
                    regionType: $(this).parents("ul:eq(0)").data("type")
                };

                aware.showLoading();
                $.post("/Region/SaveRegion", postData, function (result) {
                    aware.hideDialog();
                    if (result.success == 1) {
                        handlers.onRegionSelected(postData.regionType - 1, postData.parentID);
                    } else {
                        aware.showToastr(result.message, "error");
                    }
                });
            }
            return false;
        },
        deleteRegion: function () {
            var data = {
                id: $(this).parents("li:eq(0)").data("id"),
                parentID: $(this).parents("li:eq(0)").data("parent-id"),
                regionType: $(this).parents("ul:eq(0)").data("type")
            };

            aware.confirm("Bu bölgeyi silmek istediğinize emin misiniz?", function () {
                aware.showLoading();
                $.post("/Region/DeleteRegion", { regionID: data.id }, function (result) {
                    if (result.success == 1) {
                        aware.hideDialog();
                        handlers.onRegionSelected(data.regionType - 1, data.parentID);
                    } else {
                        aware.showError(result.message);
                    }
                });
            });
            return false;
        },
        toggleRegion: function (e) {
            if (e.data.edit) {
                $(this).parents("li:eq(0)").find(".region-info").addClass("dn");
                $(this).parents("li:eq(0)").find(".region-form").removeClass("dn");
                $(this).parents("li:eq(0)").find(".region-form input").focus();
            } else {
                $(this).parents("li:eq(0)").find(".region-info").removeClass("dn");
                $(this).parents("li:eq(0)").find(".region-form").addClass("dn");
            }
            return false;
        }
    };

    var eventMetaData = [

        { selector: elem.btnEdit, container: document, event: "click", handler: handlers.toggleRegion, data: { edit: true } },
        { selector: elem.btnSave, container: document, event: "click", handler: handlers.saveRegion, data: { edit: true } },
        { selector: elem.btnRemove, container: document, event: "click", handler: handlers.deleteRegion, data: {} },
        { selector: elem.btnCancel, container: document, event: "click", handler: handlers.toggleRegion, data: { edit: false } },
        {
            selector: elem.regionItem, container: document, event: "click", data: {}, handler: function () {
                var regionType = $(this).parent("ul").data("type");
                var regionID = $(this).data("id");

                $(".region-list ul[data-type='" + regionType + "'] li").removeClass("active");
                if (regionID > 0) {
                    $(this).addClass("active");
                    return handlers.onRegionSelected(regionType, regionID);
                } else {
                    $(this).find(".region-info").addClass("dn");
                    $(this).find(".region-form").removeClass("dn");
                    $(this).find(".region-form input").focus();
                }
                return false;
            }
        }
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));