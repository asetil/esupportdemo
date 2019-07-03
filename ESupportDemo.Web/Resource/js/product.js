; (function ($) {
    var element = {
        productID: 0,
        btnSearch: ".search-panel .btn-search",
        btnSaveProduct: ".btn-save-product",
        btnSaveRelation: ".product-property-panel .btn-save-relation",
        btnDeleteRelation: ".product-property-panel .btn-remove-relation",
        btnEditRelation: ".product-property-panel .btn-edit-relation",
        btnCancelRelation: ".product-property-panel .btn-cancel-relation"
    };

    var handlers = {
        ready: function () {
            element.productID = $('#ProductID').val();
            $(".category-selector").selecto({ allowSearch: true, type: "single" });
            $(".brand-selector").selecto({ allowSearch: true, type: "single" });
            $(".unit-selector").selecto({ type: "single" });

            if (element.productID > 0) {
                handlers.drawProductRelations();
                handlers.drawProductImages();
            }
            aware.imageGallery("img.product-image");
            window.setTinyMce("#Product_Description");
        },
        onBeforeSave: function () {
            return aware.validate('.product-detail-dialog');
        },
        searchProducts: function () {
            var filter = '';
            var name = $('.search-panel input.name').val();
            if (name.length > 0) { filter += 'q_' + name + ';'; }

            var barcode = $('.search-panel input.barcode').val();
            if (barcode.length > 0) { filter += 'b_' + barcode + ';'; }

            var category = $('.search-panel #category').val();
            if (category != undefined && category > 0) { filter += 'cid_' + category + ';'; }

            var status = $('.search-panel  #status').val();
            if (status != undefined && status > 0) { filter += 'status_' + status + ';'; }

            var url = aware.QS_replace('filter', filter);
            window.location.href  = aware.QS_remove('page', url);
            return false;
        },
        onSaveRelation: function () {
            var parent = $(this).parents("tr:eq(0)");
            var validated = aware.validate(parent);
            if (!validated) { $(parent).find(".error:eq(0)").focus(); return false; }

            var propertyID = $(parent).data("property-id");
            var relationID = $(parent).data("relation-id");
            var value = $(parent).find(".relation-value").val();
            var sortOrder = $(parent).find(".sort-order").val();

            $.post("/Property/SavePropertyRelation", { productID: element.productID, propertyID: propertyID, value: value, sortOrder: sortOrder }, function (result) {
                if (result.success == 1) {
                    if ($(parent).find(".relation-value").hasClass("sbx")) {//seçimlik
                        value = $(parent).find(".relation-value option:selected").html();
                    }

                    $(parent).find("span.lbl-value").html(value);
                    $(parent).find("span.lbl-sort-order").html(sortOrder);
                    $(parent).removeClass("new");
                    $(parent).find(".btn-edit-relation").removeClass("btn-info").addClass("btn-primary").html("<i class='fa fa-edit'></i> Güncelle");

                    if (relationID == 0) {
                        $(parent).data("relation-id", result.relationID);
                    }

                    handlers.toggleProductRelationRow({ data: { editMode: false, parent: parent } });
                    aware.showToastr(result.message, "success");
                }
                else {
                    aware.showToastr(result.message, "error");
                }
            });
            return false;
        },
        onDeleteRelation: function () {
            var parent = $(this).parents("tr:eq(0)");
            aware.confirm("Bu özellik üründen kaldırılacak. Devam etmek istediğinize emin misiniz?", function () {
                var propertyID = $(parent).data("property-id");
                $.post("/Property/DeleteProductRelation", { productID: element.productID, propertyID: propertyID }, function (result) {
                    aware.hideDialog();
                    if (result.success == 1) {
                        if ($(parent).find(".relation-value").hasClass("sbx")) {//seçimlik
                            $(parent).find("span.lbl-value").html("Seçiniz..");
                            $(parent).find(".relation-value").val(0);
                        }
                        else {
                            $(parent).find("span.lbl-value").html("");
                            $(parent).find(".relation-value").val("");
                        }

                        $(parent).find("span.lbl-sort-order").html("");
                        $(parent).find(".sort-order").val("");
                        $(parent).addClass("new");
                        $(parent).find(".btn-edit-relation").removeClass("btn-primary").addClass("btn-info").html("<i class='fa fa-plus'></i> Ekle");

                        handlers.toggleProductRelationRow({ data: { editMode: false, parent: parent } });
                        aware.showToastr(result.message, "success");
                    }
                    else {
                        aware.showToastr(result.message, "error");
                    }
                });
            }, "Özellik Kaldırılsın mı?");
            return false;
        },
        drawProductRelations: function () {
            $.post("/Property/DrawProductRelations", { productID: element.productID }, function (result) {
                if (result.success == 1) {
                    $(".product-property-panel").html(result.html);
                }
            });
            return false;
        },
        drawProductImages: function () {
            $.post("/Product/GetProductImages", { productID: element.productID }, function (data) {
                if (data.success == 1) {
                    $(".product-image-panel .file-gallery").replaceWith(data.html);
                    aware.imageGallery(".file-gallery .preview img.img-view");
                } else {
                    $(".product-image-panel .file-gallery img").hide();
                    $(".product-image-panel .file-gallery .load-error").removeClass("dn");
                }
            });
            return false;
        },
        toggleProductRelationRow: function (e) {
            var parent = e.data.parent || $(this).parents("tr:eq(0)");
            var isEdit = e.data.editMode;
            $(parent).find(".error").removeClass("error");

            if (isEdit) {
                $(parent).addClass("edit-mode");
            } else {
                $(parent).removeClass("edit-mode");
            }
            return false;
        }
    };

    var eventMetaData = [
       { selector: undefined, container: document, event: "ready", handler: handlers.ready, data: {} },
       { selector: element.btnSearch, container: document, event: "click", handler: handlers.searchProducts, data: {} },
       { selector: element.btnSaveProduct, container: document, event: "click", handler: handlers.onBeforeSave, data: {} },
       { selector: element.btnSaveRelation, container: document, event: "click", handler: handlers.onSaveRelation, data: {} },
       { selector: element.btnDeleteRelation, container: document, event: "click", handler: handlers.onDeleteRelation, data: {} },
       { selector: element.btnEditRelation, container: document, event: "click", handler: handlers.toggleProductRelationRow, data: { editMode: true } },
       { selector: element.btnCancelRelation, container: document, event: "click", handler: handlers.toggleProductRelationRow, data: { editMode: false } }
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));