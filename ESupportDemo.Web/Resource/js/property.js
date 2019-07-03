; (function ($) {
    var handlers = {
        ready: function () {
            $('.property-selector').selecto();
            $('.value-selector').selecto();
            $('.parent-selector').selecto({ type: 'single' });
            $('.parent-selector').selecto({ type: 'single' });
            $(".display-mode-selector").selecto({ type: 'single' });

            $('.property-selection-panel .btn-save').hide();
            $('.property-selection-panel .btn-cancel').hide();
            $('.property-selection-panel .btn-add-new').show();
        },
        onSaveProperty: function () {
            return aware.validate('.property-detail-panel');
        },
        onPropertyDeletion: function () {
            var elem = $(this);
            aware.confirm('Bu özelliği silmek istediğinizden emin misiniz?', function () {
                if ($(elem).data("childs") != undefined && $(elem).data("childs") > 0) {
                    aware.showError("Bu özelliğe tanımlı alt özellikler olduğu için işleme devam edilemiyor!", "Özellik Silinemiyor", "remove");
                    return false;
                }

                var propertyID = $(elem).data('id');
                var isOption = $(elem).data('is-option') != undefined && $(elem).data('is-option') == 1;

                $.post("/Property/DeleteProperty", { id: propertyID }, function (result) {
                    if (result.success == 1) {
                        aware.showMessage(undefined, result.message);
                        isOption ? $(elem).parents('tr:eq(0)').remove()
                                 : aware.delayedRefresh(800, '/ozellik-yonetimi');
                    }
                    else {
                        aware.showError(result.message);
                    }
                });
            });
            return false;
        },
        onVariantDeletion: function () {
            var elem = $(this);
            aware.confirm('Bu öğeyi silmek istediğinizden emin misiniz?', function () {
                if ($(elem).data("childs") != undefined && $(elem).data("childs") > 0) {
                    aware.showError("Bu öğeye tanımlı seçimlik özellikler olduğu için işleme devam edilemiyor!", "Öğe Silinemiyor", "remove");
                    return false;
                }

                var propertyID = $(elem).data('id');
                $.post("/Property/DeleteVariantProperty", { id: propertyID }, function (result) {
                    if (result.success == 1) {
                        aware.showMessage(undefined, result.message);
                        aware.delayedRefresh(800, '/ozellik-yonetimi');
                    }
                    else {
                        aware.showError(result.message);
                    }
                });
            });
            return false;
        },
        closeEditMode: function (parent, validate) {
            if (validate) {
                var validated = true;
                var option = $(parent).find('input.name').val();
                if (option.length == 0) { aware.showToastr('Seçimlik değer gereklidir.', 'error'); $(parent).find('input.name').addClass('error'); validated = false; }

                var sortOrder = $(parent).find('input.sort-order').val();
                if (sortOrder.length == 0) { aware.showToastr('Sıra bilgisi gereklidir.', 'error'); $(parent).find('input.sort-order').addClass('error'); validated = false; }
                if (!validated) { return false; }
            }

            $(parent).find(".error").removeClass("error");
            $(parent).find('.editable').removeClass('editable').attr("disabled", "disabled");
            $(parent).find('.btn-save').hide();
            $(parent).find('.btn-cancel').hide();
            $(parent).find('.btn-edit').show();
            $(parent).find('.btn-delete-property').show();
        },
        togglePropertyOptionRow: function (e) {
            var parent = $(this).parents('tr:eq(0)');
            var isEditMode = e.data.edit;
            if (isEditMode) {
                $(parent).find('input.name').removeAttr('disabled').addClass('editable');
                $(parent).find('input.sort-order').removeAttr('disabled').addClass('editable');
                $(parent).find('.btn-save').show();
                $(parent).find('.btn-cancel').show();
                $(parent).find('.btn-delete-property').hide();
                $(this).hide();
            }
            else {
                handlers.closeEditMode(parent, true);
            }
            return false;
        },
        onSavePropertyOption: function () {
            var parent = $(this).parents('tr:eq(0)');
            var validated = true;
            $(parent).find('input').removeClass('error');

            var name = $(parent).find('input.name').val();
            if (name.length == 0) { aware.showToastr('Seçimlik değer gereklidir.', 'error'); $(parent).find('input.name').addClass('error').focus(); validated = false; }

            var sOrder = $(parent).find('input.sort-order').val();
            if (sOrder.length == 0) { aware.showToastr('Sıra bilgisi gereklidir.', 'error'); $(parent).find('input.sort-order').addClass('error').focus(); validated = false; }
            if (!validated) { return false; }

            var id = $(parent).data("id");
            var parentID = $(parent).data("parentid");
            var isVariant = $(this).data("isvariant") == 1 ? true : false;

            $.post("/Property/SavePropertyOption", { id: id, parentID: parentID, name: name, sortOrder: sOrder, isVariant: isVariant }, function (result) {
                if (result.success == 1) {
                    if (id == 0) {
                        if($(parent).prev('tr').length==0){
                            aware.delayedRefresh(0);
                            return false;
                        }
                        else {
                            var before = $.parseHTML($(parent).prev('tr')[0].outerHTML);
                            $(before).attr('data-id', result.itemID);
                            $(before).find('td:eq(0)').html(result.itemID);
                            $(before).find('input.name').attr('value', name);
                            $(before).find('button.btn-delete-property').attr('data-id', result.itemID);
                            $(before).find('input.sort-order').attr('value', sOrder);
                            $(parent).before(before);

                            $(parent).find('input.name').val("");
                            $(parent).find('input.sort-order').val("");
                        }
                    }
                    else {
                        handlers.closeEditMode(parent);
                    }
                }
                aware.showToastr(result.message, result.success == 1 ? "success" : "error");
            });
            return false;
        },
        onPropertyTypeChange: function () {
            var value = $(this).val();
            if (value == 1) {
                $(".parent-selector").addClass("disabled").addClass("viewable");
                $(".parent-selector ul li[data-value='0']").click();
            }
            else {
                $(".parent-selector").removeClass("disabled").removeClass("viewable");
            }
            return false;
        }
    };

    var element = {
        btnSaveProperty: ".btn-save-property",
        btnDeleteProperty: '.btn-delete-property',
        btnDeleteVariantProperty:".btn-delete-variant",
        propBtnEdit: '.property-selection-panel .btn-edit',
        propBtnSave: '.property-selection-panel .btn-save',
        propBtnCancel: ".property-selection-panel .btn-cancel",
        propertyType: ".type-selector input[type='hidden']"
    };

    var eventMetaData = [
       { selector: undefined, container: document, event: "ready", handler: handlers.ready, data: {} },
       { selector: element.btnSaveProperty, container: document, event: "click", handler: handlers.onSaveProperty, data: {} },
       { selector: element.btnDeleteProperty, container: document, event: "click", handler: handlers.onPropertyDeletion, data: {} },
       { selector: element.btnDeleteVariantProperty, container: document, event: "click", handler: handlers.onVariantDeletion, data: {} },
       { selector: element.propBtnEdit, container: document, event: "click", handler: handlers.togglePropertyOptionRow, data: { edit: true } },
       { selector: element.propBtnSave, container: document, event: "click", handler: handlers.onSavePropertyOption, data: {} },
       { selector: element.propBtnCancel, container: document, event: "click", handler: handlers.togglePropertyOptionRow, data: { edit: false } },
       { selector: element.propertyType, container: document, event: "change", handler: handlers.onPropertyTypeChange, data: {} },
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));