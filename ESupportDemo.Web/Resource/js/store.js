; (function ($) {
    var helpers = {
        workTimes: new Array(),
        arrangeTime: function (time, dir) {
            if (dir == 0) {
                return (time < 10 ? '0' : '') + time;
            }
            return time + (time < 10 ? '0' : '');
        },
        arrangeWorkTimeSliders: function () {
            var valueArray = new Array();
            var htmlArray = new Array();
            var workTimeInfo = $('#WorkTimesInfo').val(); // [420:1040;0:0; ... ;400:1400]

            for (var i = 1; i <= 7; i++) {
                if (workTimeInfo==undefined || workTimeInfo.length <= 0) {
                    valueArray[i] = [420, 1040];
                    htmlArray[i] = '07:00 - 19:00';
                }
                else {
                    var workTimes = workTimeInfo.replace('[', '').replace(']', '').split(";");
                    var start = workTimes[i - 1].split(':')[0];
                    var finish = workTimes[i - 1].split(':')[1];
                    var shour = Math.floor(start / 60);
                    var ehour = Math.floor(finish / 60);

                    valueArray[i] = [start, finish];
                    htmlArray[i] = helpers.arrangeTime(shour,0) + ':' + helpers.arrangeTime(start % 60)
                        + ' - ' + helpers.arrangeTime(ehour,0) + ':' + helpers.arrangeTime(finish % 60);
                }
            }
            helpers.workTimes = valueArray;
            $(".slider-range").each(function () {
                var ind = $(this).data('index');
                $(this).slider({
                    range: true,
                    min: 0,
                    max: 1440,
                    step: 15,
                    values: valueArray[ind],
                    slide: function (e, ui) {
                        var values = ui.values;
                        var html = 'Tüm gün';

                        if (values[1] - values[0] < 40) {
                            html = 'Servis Yok';
                        }
                        else if (values[1] - values[0] < 1400) {
                            var shour = Math.floor(values[0] / 60), sminute = values[0] % 60;
                            var ehour = Math.floor(values[1] / 60), eminute = values[1] % 60;

                            html = (shour < 10 ? '0' : '') + shour + ':' + (sminute < 10 ? '0' : '') + sminute + ' - ';
                            html += (ehour < 10 ? '0' : '') + ehour + ':' + (eminute < 10 ? '0' : '') + eminute;
                        }

                        var dataIndex = $(this).data('index');
                        helpers.workTimes[dataIndex] = values;
                        $('.something[data-index="' + dataIndex + '"]').html(html);
                    }
                });
                $('.something[data-index="' + ind + '"]').html(htmlArray[ind]);
            });
        }
    };

    var handlers = {
        ready: function () {
            $(element.sbxManagerSelector).selecto({ type: 'multi'});
            $(element.sbxRegionSelector).selecto({ type: 'multi' });
            $('.status-selector').selecto();
            helpers.arrangeWorkTimeSliders();
        },
        onBeforeSaveStore: function () {
            return aware.validate('.store-detail-dialog');
        },
        saveStoreWorkTimeInfo: function (input) {
            var _wtInfo = '[';
            for (var i = 1; i <= 7; i++) {
                _wtInfo += helpers.workTimes[i][0] + ':' + helpers.workTimes[i][1];
                _wtInfo += (i < 7 ? ';' : ']');
            }

            var _sID = $('#Store_ID').val();
            $.post("/Store/SaveStoreWorkTimeInfo", { storeID: _sID, workTimeInfo: _wtInfo }, function (result) {
                if (result.success == 1) {
                    $('#workTimesModal').modal('hide');
                    aware.showMessage(undefined,'Market çalışma saatleri başarıyla kaydedildi.');
                }
                else {
                    aware.showError('Market çalışma saatleri kaydedilemedi');
                }
            });
            return false;
        }
    };

    var element = {
        btnSaveStore: ".btn-save-store",
        btnSaveWorkTime: ".btn-save-work-time",
        sbxManagerSelector: ".manager-selector",
        sbxRegionSelector: ".region-selector",
    };

    var eventMetaData = [
        { selector: undefined, container: document, event: "ready", handler: handlers.ready, data: {} },
        { selector: element.btnSaveStore, container: document, event: "click", handler: handlers.onBeforeSaveStore, data: {} },
        { selector: element.btnSaveWorkTime, container: document, event: "click", handler: handlers.saveStoreWorkTimeInfo, data: {} },
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));