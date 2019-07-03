; (function ($) {
    var elem = {
        btnShow: ".file-gallery i.fa-refresh,.file-gallery .btn-single-modal",
        btnDelete: ".file-gallery i.fa-remove",
        btnSaveFile: ".btn-save-file",
        btnViewFile: ".file-gallery i.fa-search",
        galleryModal: "#FileGalleryModal",
        singleFileForm: "form.single-file",

        multiGalleryModal: "#MultiFileGalleryModal",
        multiFileForm: "#MultiFileGalleryModal form.multi-file",
        fileMultiUpload: "#MultiFileGalleryModal input.upload-multi-file",
        btnMultiUploadModal: ".file-gallery .btn-multi-modal",
        btnSelectMultiFile: "#MultiFileGalleryModal .btn-multi-file",
        btnSaveMultiFile: "#MultiFileGalleryModal .btn-save-multi",

        formData: null,
        allowedExtensions: []
    };

    var handlers = {
        ready: function () {
            aware.imageGallery(".file-gallery .preview img.img-view",true);
            elem.allowedExtensions = $("#AllowedExtensions").val();
        },
        getEventData: function (trigger) {
            var fileID = 0;
            var parent = $('.file-gallery:eq(0)');
            if (trigger != null && trigger.length > 0) {
                fileID = $(trigger).parents('.wrp-file:eq(0)').data('file-id');
                parent = $(trigger).parents('.file-gallery:eq(0)');
            }

            return {
                parent: parent,
                fileID: fileID,
                relID: $(parent).find('#RelationID').val(),
                relType: $(parent).find('#RelationType').val(),
                size: $(parent).find('#Size').val()
            };
        },
        checkGallerySize: function (addCount) {
            var itemCount = $('.file-gallery:eq(0) .wrp-file:not(.inactive)').length;
            var gallerySize = $('.file-gallery:eq(0) #Size').val();
            if (gallerySize >= (itemCount + addCount)) {
                return true;
            }
            return false;
        },
        showFileEditModal: function () {
            if ($(this).hasClass("btn-single-modal") && !handlers.checkGallerySize(1)) {
                aware.showError("Bu galeriye daha fazla öğe ekleyemezsiniz!", 'Uyarı', 'info-circle');
            }

            var e = handlers.getEventData($(this));
            elem.formData = undefined;

            $.post('/File/GetFileDetail', { fileID: e.fileID, relationID: e.relID, relationType: e.relType }, function (data) {
                if (data.success == 1) {
                    $(elem.galleryModal).find('#ID').val(e.fileID);
                    $(elem.galleryModal).find('#RelationID').val(e.relID);
                    $(elem.galleryModal).find('#RelationType').val(e.relType);

                    $(elem.galleryModal).find('#Name').val(data.file.Name);
                    $(elem.galleryModal).find('#SortOrder').val(data.file.SortOrder);
                    $(elem.galleryModal).find('#Format').val(data.file.Format);
                    $(elem.galleryModal).find('#Status').val(data.file.Status);

                    var filePath = data.file.Path != null ? data.file.Path : e.relType + "/0.png";
                    $(elem.galleryModal).find(".image-wrapper").data("check-file", e.fileID > 0 ? 0 : 1);
                    $(elem.galleryModal).find(".thumbnail img").attr("src", "/resource/img/" + filePath);
                    $(elem.galleryModal).find(".upload-file").val("");

                    var title = e.fileID > 0 ? "Galeri Öğesi Düzenle" : "Yeni Öğe Ekle";
                    $(elem.galleryModal + " .modal-header h4.modal-title").html(title);
                    $(elem.galleryModal).modal("show");
                } else {
                    aware.showError(data.message);
                }
            });
            return false;
        },
        validateSaveFile: function () {
            if (aware.validate(elem.galleryModal)) {
                $(elem.galleryModal).find(elem.singleFileForm).submit();
            }
            return false;
        },
        onSaveFile: function (e) {
            e.preventDefault();
            elem.formData = elem.formData || new FormData(this);
            $.ajax({
                url: "/File/AjaxFileUpload",
                type: "POST", data: elem.formData, contentType: false, cache: false, processData: false,
                success: function (data) {
                    elem.formData = undefined;
                    if (data.success) {
                        $(elem.galleryModal).modal('hide');
                        $(elem.multiGalleryModal).modal('hide');
                        aware.showToastr('Dosya/lar başarıyla yüklendi.', 'success');

                        var ed = handlers.getEventData();
                        handlers.refreshGallery(ed);
                    } else {
                        aware.showToastr(data.message, 'error');
                    }
                }
            });
        },
        onFileDelete: function () {
            var el = handlers.getEventData($(this));
            var confirmMessage = 'Galeri öğesini silmek üzeresiniz. Devam etmek istediğinize emin misiniz?';
            aware.confirm(confirmMessage, function () {
                $.post('/File/DeleteFile', { fileID: el.fileID, relationID: el.relID, relationType: el.relType }, function (data) {
                    aware.hideDialog();
                    if (data.success == 1) {
                        aware.showToastr(data.message,"success");
                        handlers.refreshGallery(el);
                    } else {
                        aware.showToastr(data.message, "error");
                    }
                });
            });
            return false;
        },
        refreshGallery: function (ed) {
            $.post('/File/RefreshGallery', { relationID: ed.relID, relationType: ed.relType, size: ed.size }, function (data) {
                $(ed.parent).replaceWith(data.html);
            });
            return false;
        },
        previewFile: function () {
            $(this).parents('.wrp-file:eq(0)').find('img.img-view').click();
        },
        showMultiFileModal: function () {
            $(elem.multiGalleryModal + " .btn-save-multi").addClass("dn");
            $(elem.multiGalleryModal + " .selections").html("");

            var e = handlers.getEventData($(this));
            $(elem.multiGalleryModal).find('#ID').val(e.fileID);
            $(elem.multiGalleryModal).find('#RelationID').val(e.relID);
            $(elem.multiGalleryModal).find('#RelationType').val(e.relType);
            $(elem.multiGalleryModal).modal('show');
        },
        selectMultiFiles: function () {
            $(elem.fileMultiUpload).click();
            return false;
        },
        onMultiImageSelected: function (e) {
            var html = "", invalidHtml = "";
            var addedCount = 0, gallerySize = $('.file-gallery:eq(0) #Size').val();

            elem.formData = new FormData();
            elem.formData.append("ID", $(elem.multiGalleryModal).find('#ID').val());
            elem.formData.append("RelationID", $(elem.multiGalleryModal).find('#RelationID').val());
            elem.formData.append("RelationType", $(elem.multiGalleryModal).find('#RelationType').val());

            for (var i = 0; i < this.files.length; i++) {
                var file = this.files[i];
                if (file == undefined || file.type == undefined) { continue; }

                if (!aware.checkExtension(file.name, elem.allowedExtensions)) {
                    aware.showToastr(file.name + ' - Geçersiz Dosya Uzantısı. Sadece .jpg, .png, .gif ve .jpeg uzantılı görseller yükleyebilirsiniz..', 'error');
                    invalidHtml += "<div class='text-danger'><i class='fa fa-remove'></i> " + file.name + " - Geçersiz Dosya Uzantısı!</div>";
                }
                else if (handlers.checkGallerySize(addedCount + 1)) {
                    var size = Math.ceil(file.size / 1024);
                    html += "<div class='text-green'><i class='fa fa-check'></i> " + file.name + " - " + size + " kb</div>";

                    elem.formData.append("files[]", file);
                    addedCount++;
                } else {
                    html += "<div class='text-aqua'><i class='fa fa-info-circle'></i> " + file.name + " - Eklenemedi, galeriye en fazla " + gallerySize + " öğe ekleyebilirsiniz! </div>";
                    aware.showToastr(file.name + ' Eklenemedi, galeriye en fazla ' + gallerySize + ' öğe ekleyebilirsiniz!', 'info');
                }
            }

            $(elem.multiGalleryModal).find('.selections').html(html + invalidHtml);
            if (addedCount > 0) { $(elem.btnSaveMultiFile).removeClass("dn"); }
            else { $(elem.btnSaveMultiFile).addClass("dn"); }

            return false;
        }
    };

    var eventMetaData = [
        { selector: undefined, container: document, event: "ready", handler: handlers.ready, data: {} },
        { selector: elem.btnShow, container: document, event: "click", handler: handlers.showFileEditModal, data: {} },
        { selector: elem.btnDelete, container: document, event: "click", handler: handlers.onFileDelete, data: {} },
        { selector: elem.btnViewFile, container: document, event: "click", handler: handlers.previewFile, data: {} },
        { selector: elem.btnSaveFile, container: document, event: "click", handler: handlers.validateSaveFile, data: {} },
        { selector: elem.singleFileForm, container: document, event: "submit", handler: handlers.onSaveFile, data: {} },
        { selector: elem.btnMultiUploadModal, container: document, event: "click", handler: handlers.showMultiFileModal, data: {} },
        { selector: elem.btnSelectMultiFile, container: document, event: "click", handler: handlers.selectMultiFiles, data: {} },
        { selector: elem.fileMultiUpload, container: document, event: "change", handler: handlers.onMultiImageSelected, data: {} },
        { selector: elem.multiFileForm, container: document, event: "submit", handler: handlers.onSaveFile, data: {} }
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));