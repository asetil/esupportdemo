; (function ($) {
    var element = {
        btnRemoveItem: ".simple-items .btn-delete-item",
        btnViewItem: ".simple-items .btn-view-item",
        btnSaveItem: ".item-detail-modal .btn-save-item"
    };

    var handlers = {
        ready: function () {
            $('.status-selector').selecto();
            aware.imageGallery('img.zoom');
        },
        loadSimpleItem: function () {
            var id = $(this).parents('.item-wrp:eq(0)').data('item-id');
            id = id || 0;

            aware.showLoading();
            $.post("/Common/LoadSimpleItem", { itemID: id }, function (data) {
                if (data.success == 1) {
                    $('.item-detail-modal #ID').val(data.item.ID);
                    $('.item-detail-modal #PID').val(data.item.ID);
                    $('.item-detail-modal #Title').val(data.item.Title);
                    $('.item-detail-modal #Value').val(data.item.Value);
                    $('.item-detail-modal #Url').val(data.item.Url);
                    $('.item-detail-modal #SortOrder').val(data.item.SortOrder);
                    $('.item-detail-modal .status-selector ul li[data-value="' + data.item.Status + '"]').click();

                    aware.hideDialog();
                    $('.item-detail-modal').modal();
                }
                else {
                    aware.showError('Öğe yüklenirken bir sorunla karşılaştık. Daha sonra tekrar deneyiniz!');
                }
            });
            return false;
        },
        saveSimpleItem: function () {
            if (aware.validate('.item-detail-modal')) {
                var postData = $('.item-detail-modal form').serialize();
                $.post("/Common/SaveSimpleItem", postData, function (data) {
                    if (data.success == 1) {
                        $('.item-detail-modal').modal('hide');
                        aware.showToastr(data.message, 'success');
                        aware.delayedRefresh(1200);
                    }
                    else {
                        aware.showToastr(data.message, 'error');
                    }
                });
            }
            return false;
        },
        onRemoveSimpleItem: function () {
            var id = $(this).parents('tr:eq(0)').data('item-id');
            aware.confirm('Bu öğeyi kaldırmak istediğinizden emin misiniz?', function () {
                aware.processRequest("/Common/RemoveSimpleItem", { itemID: id }, undefined, function (data) {
                    aware.delayedRefresh(800);
                });
            });
            return false;
        }
    };

    var eventMetaData = [
        { selector: undefined, container: document, event: "ready", handler: handlers.ready, data: {} },
        { selector: element.btnViewItem, container: document, event: "click", handler: handlers.loadSimpleItem, data: {} },
        { selector: element.btnSaveItem, container: document, event: "click", handler: handlers.saveSimpleItem, data: {} },
        { selector: element.btnRemoveItem, container: document, event: "click", handler: handlers.onRemoveSimpleItem, data: {} }
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));