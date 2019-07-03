var aware = new $.Aware();
(function ($) {
    var elem = {
        btnNewAuthority: ".btn-new-authority",
        btnEditAuthority: ".btn-edit-authority",
        btnSaveAuthority: ".btn-save-authority",
        pnlEditAuthority: ".pnl-edit-authority",
        btnDeleteAuthority: ".btn-delete-authority",
        btnClear: ".btn-clear",
        btnCommentStatus: ".comment-list .btn-status"
    };

    var handlers = {
        showAuthority: function (e) {
            aware.clearFields(elem.pnlEditAuthority);
            var id = e.data.isNew ? 0 : $(this).parents('tr:eq(0)').data('id');
            $(elem.pnlEditAuthority).find('#ID').val(id);
            $(elem.pnlEditAuthority).find('label.lbl-id').html(id);
            $(elem.pnlEditAuthority).removeClass("dn");

            if (!e.data.isNew) {
                $.post("/Common/GetAuthorityDetail", { id: id }, function (data) {
                    if (data.authority != undefined) {
                        $(elem.pnlEditAuthority).find('#Title').val(data.authority.Title);
                        $(elem.pnlEditAuthority).find('#Type').val(data.authority.Type).trigger('changed');
                        $(elem.pnlEditAuthority).find('#Mode').val(data.authority.Mode).trigger('changed');
                    }
                    else {
                        aware.showError('Yetki bilgisi yüklenemedi!');
                        $(elem.pnlEditAuthority).addClass("dn");
                    }
                });
            }
            return false;
        },
        onSaveAuthority: function () {
            if (aware.validate(elem.pnlEditAuthority)) {
                var postData = $(elem.pnlEditAuthority).find('form').serialize();
                aware.processRequest("/Common/SaveAuthority", postData, "İşlem Sürüyor", function (data) {
                    aware.delayedRefresh(0, '/yetkiler');
                });
            }
            return false;
        },
        onDeleteAuthority: function () {
            var parent = $(this).parents("tr:eq(0)");
            var authorityID = $(parent).data("id");
            aware.confirm("Tanımlı yetkiyi silmek istediğinize emin misiniz?", function () {
                aware.processRequest("/Common/DeleteAuthority", { authorityID: authorityID }, "İşlem Sürüyor..", function (data) {
                    $(parent).remove();
                });
            });
            return false;
        },
        clearFields: function () {
            aware.clearFields('.search-panel');
            return false;
        },
        changeCommentStatus: function () {
            var btn = $(this);
            aware.confirm('Yorum durumunu güncellemek üzeresiniz. Devam etmek istiyor musunuz?', function () {
                var postData = { commentID: $(btn).parents('tr:eq(0)').data('comment-id'), status: $(btn).data('status') };
                aware.processRequest("/Property/ChangeCommentStatus", postData, "İşlem Sürüyor", function (data) {
                    $(btn).remove();
                });
            });
            return false;
        },
        ready: function () {
            $('.authority-type-selector').selecto();
            $('.authority-mode-selector').selecto();
            $('.rating-selector').selecto();
        }
    };

    $(function () {
        $(document).on('click', elem.btnNewAuthority, { isNew: true }, handlers.showAuthority);
        $(document).on('click', elem.btnEditAuthority, { isNew: false }, handlers.showAuthority);
        $(document).on('click', elem.btnSaveAuthority, {}, handlers.onSaveAuthority);
        $(document).on('click', elem.btnDeleteAuthority, {}, handlers.onDeleteAuthority);
        $(document).on('click', elem.btnClear, {}, handlers.clearFields);
        $(document).on('click', elem.btnCommentStatus, {}, handlers.changeCommentStatus);
        $(document).on('ready', undefined, {}, handlers.ready);
    });
}(jQuery));