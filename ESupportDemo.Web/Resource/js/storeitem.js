; (function ($) {
    var element = {
        btnSave: '.storeitem-detail-dialog .btn-save',
        btnExportExcell: ".btn-exportto-excell",
        btnShowStockPanel: ".btn-show-stock",
        btnSaveStock: ".btn-save-stock",
        btnSearch: ".search-panel .btn-search",
        btnCleanFilters: ".btn-clean-filter",
        importForm: "#importItemsModal form",
        selectedItem: 0
    };

    var handlers = {
        ready: function () {
            $('.category-selector').selecto({ allowSearch: true, type: 'multi' });
            $('.store-selector').selecto({ type: 'multi' });
            $('.store-single-selector').selecto();
            $('.status-selector').selecto();
            aware.imageGallery("img.item-image");

            $(".product-selector").selecto({ type: "filtered", url: "/Product/SearchProducts" });
            $(".product-selector #ProductID").change(function () {
                $(this).next(".input-group-addon").find("a").attr("href", "/Product/Detail/" + $(this).val());

                $.post("/Product/GetUnit", { productID: $(this).val() }, function (data) {
                    $("#Stock").next(".input-group-addon").html(data.value);
                });
            });
        },
        onSaveItem: function () {
            return aware.validate('.storeitem-detail-dialog');
        },
        showItemStock: function () {
            var itemName = $(this).parents("tr:eq(0)").find("td.td-name").html();
            element.selectedItem = $(this).parents("tr:eq(0)").data("item-id");

            $('#updateStockModal .item-name').html(itemName + " Hızlı Güncelleme");
            $('#updateStockModal #Price').val($(this).data("price"));
            $('#updateStockModal #ListPrice').val($(this).data("list-price"));
            $('#updateStockModal #Stock').val($(this).data("stock"));
            $('#updateStockModal').modal();
        },
        onSaveStock: function () {
            if (aware.validate("#updateStockModal")) {
                aware.showLoading();
                var postData = {
                    itemID: element.selectedItem,
                    stock: $('#updateStockModal #Stock').val().replace(".", ","),
                    price: $('#updateStockModal #Price').val().replace(".", ","),
                    listPrice: $('#updateStockModal #ListPrice').val().replace(".", ",")
                };

                $.post("/StoreItem/QuickUpdate", postData, function (result) {
                    if (result.success == 1) {
                        aware.hideDialog();
                        var row = ".item-list table tr[data-item-id='" + element.selectedItem + "']";
                        $(row).find('td.sales-price').html(postData.price + " <i class='fa fa-turkish-lira'></i>");
                        $(row).find('td.list-price').html(postData.listPrice + " <i class='fa fa-turkish-lira'></i>");
                        $(row).find('td.stock').html(postData.stock == "-1" ? "Sınırsız" : postData.stock + " ad");

                        $(row).find(".btn-show-stock").data("stock", postData.stock.replace(",", "."));
                        $(row).find(".btn-show-stock").data("price", postData.price.replace(",", "."));
                        $(row).find(".btn-show-stock").data("list-price", postData.listPrice.replace(",", "."));

                        $("#updateStockModal").modal('hide');
                        aware.showToastr(result.message, 'success');
                    }
                    else {
                        aware.showError(result.message);
                    }
                });
            }
            return false;
        },
        exportToExcell: function () {
            var sid = $('#StoreID').val();
            window.location.href = "/file/ExportToExcell?storeID=" + sid;
            //$.post("/StoreItem/ExportToExcell", {storeID:sid}, function (result) {
            //    if (result.success == 1) {
            //        window.toastr.info(result.message, 'Bilgi');
            //        $(parent).remove();
            //    }
            //    else {
            //        window.toastr.error(result.message, 'Hata');
            //    }
            //});
        },
        onBeforeExportTemplate: function () {
            var storeID = $('#StoreID').val();
            if (storeID <= 0) {
                aware.showError('Şablona aktarım yapmak için market seçimi yapmalısınız!', 'Uyarı');
                return false;
            }

            aware.showLoading();
            $.post("/File/GetItemsForExport", { storeID: storeID }, function (result) {
                if (result.success == 1) {
                    aware.hideDialog();
                    $('#exportTemplateModal').find('.modal-body').html(result.html);
                    $('.btn-export-template').removeAttr("disabled");
                    $('#exportTemplateModal').modal();
                }
                else {
                    $('.btn-export-template').attr("disabled", "disabled");
                    aware.showError(result.html);
                }
                return false;
            });
        },
        exportTemplate: function () {
            var sid = $('#StoreID').val();
            window.location = '/file/ExportToTemplate?storeID=' + sid;
            $('#exportTemplateModal').modal('hide');
        },
        onBeforeImport: function () {
            if ($(this).hasClass('excell')) {
                $('#importItemsModal span.file-type').html('excell');
                $('#importItemsModal span.ext-type').html('.xls veya .xlsx');
                $('#importItemsModal input.upload').data('extension', '.xls,.xlsx');
            }
            else {
                $('#importItemsModal span.file-type').html('text');
                $('#importItemsModal span.ext-type').html('.txt');
                $('#importItemsModal input.upload').data('extension', '.txt');
            }

            $('#importItemsModal form #StoreID').val($('#StoreID').val());
            $('#importItemsModal').modal();
        },
        onRemoveItem: function () {
            aware.confirm('Bu ürünü ürünlerinizden kaldırmak istediğinizden emin misiniz?', function () {
                aware.showError("Ürün kaldırma işlemi henüz inşa aşamasında!!!", "Uyarı");
                return false;
                $.post("/StoreItem/RemoveItem", { itemID: element.selectedItem }, function (result) {
                    aware.hideDialog();
                    if (result.success == 1) {
                        //Show success message,
                        //Redirect to items
                    }
                    else {
                        //Show error
                    }
                });
            });
            return false;
        },
        onImportItems: function (e) {
            e.preventDefault();
            $.ajax({
                url: "/StoreItem/ImportItems",
                type: "POST", data: new FormData(this),
                contentType: false, cache: false, processData: false, success: function (data) {
                    if (data.success) {
                        aware.showMessage(undefined, data.message);
                        aware.delayedRefresh(800);
                    } else {
                        aware.showError(data.message);
                    }
                }
            });
            return false;
        },
        cleanFilters: function () {
            aware.clearFields(".search-panel");
            return false;
        },
        onSearchItems: function () {
            var query = "";
            var ids = $("#ids").val();
            if (ids.length > 0) { query += "ids=" + ids + "&"; }

            var name = $("#q").val();
            if (name.length > 0) { query += "q=" + name + "&"; }

            var storeIDs = $("#sid").val();
            if (storeIDs.length > 0) { query += "sid=" + storeIDs + "&"; }

            var categoryID = $("#cid").val();
            if (categoryID.length > 0) { query += "cid=" + categoryID + "&"; }

            var status = $("#st").val();
            if (status.length > 0 && parseInt(status) > 0) { query += "st=" + status + "&"; }

            var priceFrom = $(".price-from").val();
            var priceTo = $(".price-to").val();
            if (priceFrom.length > 0 || priceTo.length > 0) { query += "price=" + "[" + priceFrom + ":" + priceTo + "]" + "&"; }

            var stockFrom = $(".stock-from").val();
            var stockTo = $(".stock-to").val();
            if (stockFrom.length > 0 || stockTo.length > 0) { query += "stock=["+ stockFrom + ":" + stockTo+"]&"; }
            if ($(".unlimited-stock .cbx").is(":checked")) { query += "ustock=1&"; }
            if ($(".for-sale .cbx").is(":checked")) { query += "forsale=1&"; }
            
            var url = window.location.href.split("?")[0] + "?" + query + "page=1";
            window.location.href = url;

            return false;
        }
    };

    var eventMetaData = [
        { selector: undefined, container: document, event: "ready", handler: handlers.ready, data: {} },
        { selector: element.btnSave, container: document, event: "click", handler: handlers.onSaveItem, data: {} },
        { selector: element.btnCleanFilters, container: document, event: "click", handler: handlers.cleanFilters, data: {} },
        { selector: element.btnExportExcell, container: document, event: "click", handler: handlers.exportToExcell, data: {} },
        { selector: element.btnShowStockPanel, container: document, event: "click", handler: handlers.showItemStock, data: {} },
        { selector: element.importForm, container: document, event: "submit", handler: handlers.onImportItems, data: {} },
        { selector: element.btnSaveStock, container: document, event: "click", handler: handlers.onSaveStock, data: {} },
        { selector: element.btnSearch, container: document, event: "click", handler: handlers.onSearchItems, data: {} },
        { selector: ".btn-remove-item", container: document, event: "click", handler: handlers.onRemoveItem, data: {} }
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }

        $(document).on('click', '.btn-export-modal', {}, handlers.onBeforeExportTemplate);
        $(document).on('click', '.btn-export-template', {}, handlers.exportTemplate);
        $(document).on('click', '.btn-import-data', {}, handlers.onBeforeImport);
        $(document).on('change', ".fileUpload .upload", {}, function () {
            var ext = '.' + $(this).val().split('.').pop();
            var allowedExtensions = $(this).data('extension').split(',');

            var found = false;
            for (var it in allowedExtensions) {
                found = (ext == allowedExtensions[it]);
            }

            if (!found) {
                aware.showToastr('Sadece ' + $(this).data('extension') + ' uzantılı dosyalar desteklenmektedir!', 'error');
                $('.fileUploaded').html('Geçersiz dosya!');
                $('.btn-start-import').attr('disabled', 'disabled');
                return false;
            }

            $('.fileUploaded').html($(this).val());
            $('.btn-start-import').removeAttr('disabled');
        });

        $(document).on('click', ".fileUpload .btn", {}, function () {
            $('.fileUpload input.upload').click();
            return false;
        });

        $(document).on('click', ".btn-start-import", {}, function () {
            aware.showLoading("Aktarım işlemi devam ediyor..");
            $('#importItemsModal form').submit();
            return false;
        });
    });
}(jQuery));