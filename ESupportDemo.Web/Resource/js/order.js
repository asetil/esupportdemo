; (function ($) {
    var handler = {
        ready: function () {
            $('.payment-type-selector').selecto({ type: 'single' });
            $('.status-selector').selecto({ type: 'single' });
            $('.store-selector').selecto({ type: 'single' });
            $('.order-status-selector').selecto({ type: 'single' });
            aware.asDatePicker(".datepicker");
        },
        changeOrderStatus: function () {
            var elem = $(this);
            if (elem.hasClass("active")) { return false; }
            var message = $(this).html();

            aware.confirm('Sipariş durumunu <b>' + message + '</b><br/> olarak güncellemek üzeresiniz. Devam etmek istiyor musunuz?', function () {
                var orderID = $('.order-detail-dialog #Order_ID').val();
                var status = $(elem).data("status");

                aware.showLoading();
                $.post("/Order/ChangeStatus", { id: orderID, status: status }, function (result) {
                    if (result.success == 1) {
                        aware.showMessage(undefined, result.message);
                        $(e.btnChangeOrderStatus).removeClass('active');
                        $(elem).addClass('active');
                    }
                    else {
                        aware.showError(result.message);
                    }
                });
            });
            return false;
        },
        cleanFilters: function () {
            aware.clearFields(".search-panel");
            return false;
        }
    };

    var e = {
        btnChangeOrderStatus: ".order-processes div",
        btnCleanFilter: ".btn-clean-form",
        btnCancelOrder: ".btn-cancel-order"
    };

    var eventMetaData = [
       { selector: undefined, container: document, event: "ready", handler: handler.ready, data: {} },
       { selector: e.btnCleanFilter, container: document, event: "click", handler: handler.cleanFilters, data: {} },
       { selector: e.btnChangeOrderStatus, container: document, event: "click", handler: handler.changeOrderStatus, data: {} }
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));