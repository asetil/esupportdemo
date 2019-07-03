; (function ($) {
    var elem = {
        btnViewDirectory: ".directory-item:not(.create)",
        btnCreateDirectory: ".directory-item.create .new-directory-panel i",
        btnRemoveDirectory: ".path-hierarchy .btn-remove-directory",
        btnViewHierarchy: ".hierarchy-item",
        btnToggleView: ".path-hierarchy .btn-view-mode",

        btnSaveFiles: ".gallery-browser .btn-save-files",
        btnSelectFile: ".gallery-browser .btn-single-upload",
        btnSelectMultiFile: ".gallery-browser .btn-multi-upload",
        btnRemoveFile: ".gallery-browser .btn-remove-file",
        btnCopyLink: ".gallery-browser .btn-copy-link",
        btnInspect: ".gallery-browser .btn-inspect",
        fileSingleUpload: ".gallery-browser input.upload-single-file",
        fileMultiUpload: ".gallery-browser input.upload-multi-file",
        selectedFilesPanel: ".gallery-browser .upload-panel .selections",

        allowedExtensions: [],
        formData: null,
    };

    var fileOperations = {
        selectFiles: function (e) {
            if (e.data.multi) {
                $(elem.fileMultiUpload).click();
            }
            else {
                $(elem.fileSingleUpload).click();
            }
            return false;
        },
        onFileSelected: function (e) {
            var html = "", invalidHtml = "";
            var addedCount = 0, gallerySize = $('.file-gallery:eq(0) #Size').val();

            elem.formData = new FormData();
            elem.formData.append("path", $("#CurrentPath").val());

            for (var i = 0; i < this.files.length; i++) {
                var file = this.files[i];
                if (file == undefined || file.type == undefined) { continue; }

                if (!aware.checkExtension(file.name, elem.allowedExtensions)) {
                    aware.showToastr(file.name + ' - Geçersiz Dosya Uzantısı. Sadece .jpg, .png, .gif ve .jpeg uzantılı görseller yükleyebilirsiniz..', 'error');
                    invalidHtml += "<div class='text-danger'><i class='fa fa-remove'></i> " + file.name + " - Geçersiz Dosya Uzantısı!</div>";
                }
                else {
                    var size = Math.ceil(file.size / 1024);
                    html += "<div class='text-green'><i class='fa fa-check'></i> " + file.name + " - " + size + " kb</div>";

                    elem.formData.append("files[]", file);
                    addedCount++;
                }

                if (addedCount >= 10) {
                    invalidHtml += "<div class='text-danger'><i class='fa fa-info-circle'></i> Tek seferde en fazla 10 dosya yükleyebilirsiniz.</div>";
                    break;
                }
            }

            $(elem.selectedFilesPanel).html(html + invalidHtml).removeClass("dn");
            if (addedCount > 0) { $(elem.btnSaveFiles).removeClass("dn"); }
            else { $(elem.btnSaveFiles).addClass("dn"); }

            return false;
        },
        uploadFiles: function (e) {
            e.preventDefault();
            elem.formData = elem.formData || new FormData(this);
            $.ajax({
                url: "/Gallery/AjaxFileUpload",
                type: "POST", data: elem.formData, contentType: false, cache: false, processData: false,
                success: function (data) {
                    if (data.success) {
                        elem.formData = undefined;
                        aware.showToastr('Dosya/lar başarıyla yüklendi.', 'success');

                        var path = $("#CurrentPath").val();
                        handlers.loadPath(path);
                    } else {
                        aware.showToastr(data.message, 'error');
                    }
                }
            });
            return false;
        },
        removeFile: function () {
            var currentPath = $("#CurrentPath").val();
            var fileName = $(this).parents(".file-item:eq(0)").data("path");

            aware.confirm("Bu dosya silinecek. Devam etmek istediğinize emin misiniz?", function () {
                $.post('/Gallery/RemoveFile', { path: (currentPath + "/" + fileName) }, function (result) {
                    aware.hideDialog();
                    if (result.success == 1) {
                        aware.showToastr("Dosya başarıyla silindi.", "success");
                        handlers.loadPath(currentPath);
                    } else {
                        aware.showToastr(result.message, "error");
                    }
                });
            });
            return false;
        },
        copyFileAddress: function () {
            var siteUrl = $("#SiteUrl").val();
            var directory = $("#CurrentPath").val();
            var fileName = $(this).parents(".file-item:eq(0)").data("path");

            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val(siteUrl + directory + "/" + fileName).select();
            document.execCommand("copy");
            $temp.remove();

            aware.showToastr("Dosya yolu başarıyla kopyalandı", "success");
            return false;
        },
        inspectFile: function () {
            $(this).parents(".file-item:eq(0)").find("img").click();
            return false;
        }
    };

    var handlers = {
        loadPath: function (path) {
            aware.showLoading();

            $.post('/Gallery/LoadPath', { path: path }, function (result) {
                aware.hideDialog();
                if (result.success == 1) {
                    $(".gallery-placeholder").html(result.html);
                    aware.imageGallery("img.inspectable");
                } else {
                    aware.showToastr(result.message, "error");
                }
            });
            return false;
        },
        viewDirectory: function (e) {
            var path = $(this).data("path");
            if (e.data.t == 0) {
                var currentPath = $("#CurrentPath").val();
                path = currentPath + "/" + path;
            }

            if (path && path.length) { handlers.loadPath(path); }
            return false;
        },
        createDirectory: function () {
            var currentPath = $("#CurrentPath").val();
            var name = $(this).parent().find("input[type='text']").val();
            if (!name) {
                aware.showToastr("Dizin adını belirtmediniz!", "error");
                $(this).parent().find("input[type='text']").focus();
                return;
            }

            aware.showLoading();
            $.post('/Gallery/AddDirectory', { path: currentPath, name: name }, function (result) {
                if (result.success == 1) {
                    aware.showToastr(name + " dizini başarıyla oluşturuldu!", "success");
                    handlers.loadPath(currentPath);
                } else {
                    aware.hideDialog();
                    aware.showToastr(result.message, "error");
                }
            });
            return false;
        },
        removeDirectory: function () {
            var currentPath = $("#CurrentPath").val();
            aware.confirm("Bu dizini ve alt dizinlerini içerikleriyle birlikte tamamen silmek istediğinizden emin misiniz?", function () {
                $.post('/Gallery/RemoveDirectory', { path: currentPath }, function (result) {
                    if (result.success == 1) {
                        aware.showToastr("Dizin başarıyla silindi!", "success");
                        handlers.loadPath(result.value);
                    } else {
                        aware.hideDialog();
                        aware.showToastr(result.message, "error");
                    }
                });
            });
            return false;
        },
        toggleView: function () {
            $(elem.btnToggleView).removeClass("active");
            $(this).addClass("active");

            var mode = $(this).data("mode");
            if (mode == 1) {
                $(".gallery-browser").addClass("list-view");
            }
            else {
                $(".gallery-browser").removeClass("list-view");
            }
            return false;
        },
        ready: function () {
            var currentPath = $("#CurrentPath").val();
            handlers.loadPath(currentPath);

            //aware.imageGallery(".file-gallery .preview img.img-view",true);
            //elem.allowedExtensions = $("#AllowedExtensions").val();
        },

    };

    $(function () {
        $(document).on("ready", undefined, {}, handlers.ready);
        $(document).on("click", elem.btnViewDirectory, { t: 0 }, handlers.viewDirectory);
        $(document).on("click", elem.btnViewHierarchy, { t: 1 }, handlers.viewDirectory);
        $(document).on("click", elem.btnCreateDirectory, {}, handlers.createDirectory);
        $(document).on("click", elem.btnRemoveDirectory, {}, handlers.removeDirectory);
        $(document).on("click", elem.btnToggleView, {}, handlers.toggleView);

        $(document).on("click", elem.btnSelectMultiFile, { multi: true }, fileOperations.selectFiles);
        $(document).on("click", elem.btnSelectFile, { multi: false }, fileOperations.selectFiles);
        $(document).on("change", elem.fileMultiUpload, {}, fileOperations.onFileSelected);
        $(document).on("change", elem.fileSingleUpload, {}, fileOperations.onFileSelected);
        $(document).on("click", elem.btnSaveFiles, {}, fileOperations.uploadFiles);
        $(document).on("click", elem.btnRemoveFile, {}, fileOperations.removeFile);
        $(document).on("click", elem.btnCopyLink, {}, fileOperations.copyFileAddress);
        $(document).on("click", elem.btnInspect, {}, fileOperations.inspectFile);
    });
}(jQuery));