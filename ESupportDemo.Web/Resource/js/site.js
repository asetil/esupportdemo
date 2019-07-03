var aware = new $.Aware();
(function ($) {
    var handlers = {
        ready: function () {
            handlers.arrangeFormFields();

            if ($(".sidebar-wrapper").length) {
                $(".sidebar-wrapper").perfectScrollbar();
                $(".main-panel").perfectScrollbar();
            }

            //Scroll to top
            //$(window).scroll(function () {
            //    if ($(window).scrollTop() >= 500) {
            //        $(element.scrollToTop).fadeIn(400);
            //    } else {
            //        $(element.scrollToTop).fadeOut(400);
            //    }
            //});

            $(element.scrollToTop).click(function () { $("html, body").animate({ scrollTop: 0 }, "slow"); });

            $('input.disabled, .disabled input').each(function () {
                $(this).attr('disabled', 'disabled');
            });

            $(document).on('click', element.btnCloseDialog, {}, function () { aware.hideDialog(); });
            $(document).on('click', '.sidebar-toggle', {}, function (e) {
                e.preventDefault();

                //Enable sidebar push menu
                if ($(window).width() > (element.screenSizes.sm - 1)) {
                    if ($("body").hasClass('sidebar-collapse')) {
                        $("body").removeClass('sidebar-collapse').trigger('expanded.pushMenu');
                    } else {
                        $("body").addClass('sidebar-collapse').trigger('collapsed.pushMenu');
                    }
                }
                else { //Handle sidebar push menu for small screens
                    if ($("body").hasClass('sidebar-open')) {
                        $("body").removeClass('sidebar-open').removeClass('sidebar-collapse').trigger('collapsed.pushMenu');
                    } else {
                        $("body").addClass('sidebar-open').trigger('expanded.pushMenu');
                    }
                }
            });

            $(document).on('click', '.sidebar-menu > li.treeview > a', {}, function () {
                var parent = $(this).parent();
                if ($(parent).hasClass('active')) {
                    $(parent).removeClass('active');
                    $(parent).find('ul').removeClass('menu-open').slideUp();
                } else {
                    $(parent).find('ul').addClass('menu-open').slideDown();
                    $(parent).addClass('active');
                }
            });

            $(element.previewImage).error(function () {
                $(element.previewImage).attr('src', '/resource/img/Product/0.png');
            });

            $('.status-selector').each(function () {
                $(this).selecto();
            });

            if ($('.pnl-operation-result').length > 0) {
                setTimeout(function () { $('.pnl-operation-result').fadeOut(1000); }, 4000);
            }

            handlers.registerLanguageEvents();
            handlers.handleAjaxError(); //Ajax unauthorized fix
        },
        handleAjaxError: function () {
            $(document).ajaxError(function (e, xhr) {
                $('.modal').modal('hide');
                if (xhr.status == 401) {
                    aware.showMessage("Bilgi", "İşleminize devam etmek için giriş yapmalısınız!");
                    aware.delayedRefresh(500, "/uye-girisi");
                }
                else if (xhr.status == 403) {
                    aware.showError("Bu işlemi gerçekleştirme yetkiniz yok!", "Uyarı");
                }
                else if (xhr.status == 500) {
                    console.log("Hata : ", e, xhr);
                    aware.showError("Ajax isteği işlenirken bir hata gerçekleşti. Detaylı bilgi için consol ekranını inceleyin!", "Ajax Hatası : 500");
                }
            });
        },
        clearCache: function () {
            var btn = $(this);
            $.post("/Common/ClearCache", { cacheKey: $(this).data('cache-key') }, function (result) {
                if (result.isSuccess == 1) {
                    $(btn).parents('tr:eq(0)').addClass('ok');
                    aware.showToastr("İşlem başarıyla tamamlandı.", "success");
                }
                else {
                    $(btn).parents('tr:eq(0)').addClass('fail');
                    aware.showToastr("İşlem başarısız. Lütfen daha sonra tekrar deneyin!", 'error');
                }
            });
            return false;
        },
        previewLoadedImage: function () {
            var input = this;
            if (input.files && input.files[0]) {
                var fileName = input.files[0].name;
                var allowedExtensions = $(input).attr('accept');

                $('.image-wrapper .selector span').html(fileName);
                var reader = new FileReader();
                reader.onload = function (e) {
                    if (aware.checkExtension(fileName, allowedExtensions)) {
                        $(element.previewImage).attr('src', e.target.result);
                    } else {
                        var extension = aware.fileExtension(fileName);
                        $(element.previewImage).attr('src', '/resource/img/Icons/' + extension + '.png');
                        aware.showToastr('Geçersiz uzantıya sahip bir dosya seçtiniz. Lütfen sadece \'' + allowedExtensions + '\' uzantılı dosyalar seçin!', 'error');
                    }
                };
                reader.readAsDataURL(input.files[0]);
            }
        },
        arrangeFormFields: function () {
            $('[data-toggle="tooltip"]').tooltip();
        },
        onCheckboxClick: function () {
            var active = !$(this).hasClass('active');
            var isBool = !($(this).data("value-type") && $(this).data("value-type") == "byte");

            if (active) {
                $(this).addClass('active');
                $(this).find('input[type="hidden"]').val(isBool ? "true" : "1");
            } else {
                $(this).removeClass('active');
                $(this).find('input[type="hidden"]').val(isBool ? "false" : "2");
            }
        },
        setTinyMce: function (selector, height) {
            if (tinymce != undefined) {
                if (tinymce.editors.length > 0) {
                    while (tinymce.editors.length > 0) {
                        var editorFieldName = tinymce.editors[0].id;
                        try {
                            //tinymce.EditorManager.execCommand('mceRemoveEditor', true, editorFieldName);
                            tinymce.remove("#" + editorFieldName);
                        } catch (e) {
                            //console.log("TinyMce Remove Error : ",e);
                        }
                    }
                }

                tinymce.init({
                    theme_advanced_resizing: false,
                    theme: "modern",
                    menubar: false,
                    statusbar: false,
                    toolbar_items_size: 'small',
                    //verify_html: false,
                    //language: "tr_TR",
                    selector: selector,
                    height: height || 300,
                    plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table contextmenu paste code'
                    ],
                    toolbar: 'styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media code',
                    content_css: '//www.tinymce.com/css/codepen.min.css',

                    setup: function (editor) {
                        editor.on('change', function () {
                            tinymce.triggerSave();
                        });
                    }
                });
            }
        },
        setTinyContent: function (id, data) {
            var tinyEditor = tinyMCE.get(id);
            if (tinyEditor != null) {
                tinyEditor.setContent(data);
            }
        },
        onHorizantalItemClick: function () {
            var parent = $(this).parents(".horizantal-selector:eq(0)");
            $(parent).find(".btn").removeClass("active");

            var value = $(this).data("id");
            if ($(parent).hasClass("bool-selector") && value != "true" && value != "false") {
                value = value == 1 ? "true" : "false";
            }

            $(parent).find("input[type='hidden']").val(value);
            $(this).addClass("active");
            return false;
        },
        registerLanguageEvents: function () {
            $(document).on("click", ".language-list li", {}, function () {
                $(".language-list li").removeClass("active");
                $(".language-fields").removeClass("active");

                $(this).addClass("active");
                var id = $(this).data("id");
                $(".language-fields[data-id='" + id + "']").addClass("active");
                return false;
            });

            $(document).on("click", ".btn-save-language-value", {}, function () {
                var data = $(".language-form").serialize();
                $.post("/Management/SaveLanguageValue", data, function (result) {
                    if (result.success == 1) {
                        aware.showMessage(result.message, "", "success", "fa-minus-circle");
                    }
                    else {
                        aware.showError(result.message, "Giriş Başarısız", "fa-minus-circle");
                    }
                });
                return false;
            });
        },
        processLogout: function () {
            aware.confirm("Oturumu kapatmak istediğinizden emin misiniz?", function () {
                aware.showLoading();
                aware.delayedRefresh(100, "/oturumu-kapat");
            }, "Onaylayın?");
            return false;
        }
    };

    var element = {
        scrollToTop: ".scroll-to-top",
        modalBackdrop: ".modal-backdrop",
        btnClearCache: ".btn-clear-cache",
        btnCloseDialog: ".btn-close-dialog",
        btnSelectFile: ".btn-select-image",
        fileInput: "input[type='file'].upload-file",
        previewImage: ".image-wrapper .thumbnail img",
        customCbx: "div.cbx",
        horizantalSelection: ".horizantal-selector .btn",
        btnLogout: ".btn-logout",

        screenSizes: {
            xs: 480,
            sm: 768,
            md: 992,
            lg: 1200
        }
    };

    var eventMetaData = [
        { selector: undefined, container: document, event: "ready", handler: handlers.ready, data: {} },
        { selector: element.customCbx, container: document, event: "click", handler: handlers.onCheckboxClick, data: {} },
        { selector: element.btnClearCache, container: document, event: "click", handler: handlers.clearCache, data: {} },
        { selector: element.modalBackdrop, container: document, event: "click", handler: function () { $('.modal').modal('hide'); }, data: {} },
        { selector: element.fileInput, container: document, event: "change", handler: handlers.previewLoadedImage, data: {} },
        { selector: element.btnSelectFile, container: document, event: "click", handler: function () { $(element.fileInput).click(); return false; }, data: {} },
        { selector: element.horizantalSelection, container: document, event: "click", handler: handlers.onHorizantalItemClick, data: {} },
        { selector: element.btnLogout, container: document, event: "click", handler: handlers.processLogout, data: {} }
    ];

    window.setTinyMce = handlers.setTinyMce;
    window.setTinyContent = handlers.setTinyContent;

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));

function FixMouseOut(element, event) {
    var child = null;
    if (event.toElement) { child = event.toElement; }
    else if (event.relatedTarget) { child = event.relatedTarget; }

    if (child != null) {
        while (child.parentNode) {
            if ((child = child.parentNode) == element) { return false; }
        }
    }

    if (element != child) { return true; }
    return false;
}

function setPager(selector, pageSize, total) {
    $(selector).paginate({
        linkCount: 10,
        elementPerPage: pageSize,
        size: total
    }, true);
}