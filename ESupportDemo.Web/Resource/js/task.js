var aware = new $.Aware();
(function ($) {
    var handlers = {
        restartTaskManager: function () {
            return handlers.ajaxRequest("/Task/Refresh", {});
        },
        startTaskManager: function () {
            return handlers.ajaxRequest("/Task/Start", {});
        },
        stopTaskManager: function () {
            return handlers.ajaxRequest("/Task/Stop", {});
        },
        executeTask: function () {
            var type = $(this).parents('tr:eq(0)').data('task-type');
            var executionParam = $(this).parents('tr:eq(0)').find('#ExecutionParam').val();
            var data = { type: type, executionParam: executionParam };
            return handlers.ajaxRequest("/Task/Execute", data);
        },
        ajaxRequest: function (url, data) {
            aware.showLoading();
            $.post(url, data, function (result) {
                if (result.success == 1) {
                    aware.showToastr('İşlem başarıyla tamamlandı.', 'success');
                    setTimeout(function () { window.location.reload(); }, 600);
                }
                else {
                    aware.showToastr(data.message, 'error');
                }
            });
            return false;
        },
        ready: function () {

        }
    };

    var element = {
        btnRestart: ".task-list .btn-restart",
        btnStart: ".task-list .btn-start",
        btnStop: ".task-list .btn-stop",
        btnExecute: ".btn-execute-task",
    };

    var eventMetaData = [
        { selector: undefined, container: document, event: "ready", handler: handlers.ready, data: {} },
        { selector: element.btnRestart, container: document, event: "click", handler: handlers.restartTaskManager, data: {} },
        { selector: element.btnStart, container: document, event: "click", handler: handlers.startTaskManager, data: {} },
        { selector: element.btnStop, container: document, event: "click", handler: handlers.stopTaskManager, data: {} },
        { selector: element.btnExecute, container: document, event: "click", handler: handlers.executeTask, data: {} }
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));