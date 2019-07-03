(function ($) {
    var elem = {
        btnSaveUser: ".btn-save-user",
        btnchangeUserPassword: ".btn-change-password",
        btnLogin: ".btn-login",
        btnForgotPassword: ".btn-forgot-password",
        btnNewActivation: ".btn-new-activation",
        btnBack: ".login-panel .btn-back",
        hdnRole: ".role-selector input[type='hidden']",
        btnDeleteUser: ".btn-remove-user",

        cbxAuthority: ".authority-list .cbx-authority",
        btnSaveAuthority: ".authority-list .btn-save-authority",
        hdnAllowEditAuthority: ".authority-list #AllowEdit"
    };

    var handlers = {
        handleLogin: function () {
            if (aware.validate('.login-dialog')) {
                aware.showLoading();
                $.post("/User/Login", $('.login-dialog form').serialize(), function (data) {
                    if (data.success == 1) {
                        location.reload();
                    }
                    else if (data.message == '403') { //Erişim yok
                        window.location.href = '/erisim-yok';
                    }
                    else {
                        aware.hideDialog();
                        $(".login-dialog .login-message").html("E-posta ya da şifreniz hatalı. Giriş başarısız!").removeClass("dn");
                        //setTimeout(function () { $(".login-dialog .login-message").html("").addClass("dn"); }, 3000);
                    }
                });
            }
            return false;
        },
        forgotPassword: function () {
            var container = '.forgot-password-dialog';
            if (aware.validate(container)) {
                aware.showLoading();
                $.post("/User/ForgotPassword", $(container + ' form').serialize(), function (data) {
                    if (data.success == 1) {
                        aware.showMessage(undefined, data.message);
                        aware.clearFields(container);
                    }
                    else {
                        aware.showError(data.message);
                    }
                });
            }
            return false;
        },
        saveUser: function () {
            return aware.validate('.user-detail-dialog');
        },
        onDeleteUser: function () {
            var userID = $(".user-detail-dialog #ID").val();
            if (userID > 0) {
                aware.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?', function () {
                    aware.showLoading();
                    $.post("/User/DeleteUser", { userID: userID }, function (data) {
                        if (data.success == 1) {
                            aware.showMessage(undefined, data.message);
                            aware.delayedRefresh(1000, '/kullanicilar');
                        }
                        else {
                            aware.showError(data.message);
                        }
                    });
                });
            }
            return false;
        },
        changePassword: function () {
            var wrapper = ".change-password-dialog";
            if (aware.validate(wrapper)) {
                var current = $(wrapper + " #CurrentPassword").val();
                if (current == undefined || current.length == 0) { current = ''; }
                var newPassword = $(wrapper + " #Password").val();
                var requestData = $(wrapper + " #RequestData").val();

                $.post("/User/ChangePassword", { currentpassword: current, password: newPassword, data: requestData }, function (data) {
                    if (data.success == 1) {
                        aware.clearFields(wrapper);
                        aware.showMessage(undefined, data.message);
                        setTimeout(function () { window.location.href = "/dashboard"; }, 2000);
                    }
                    else {
                        aware.showError(data.message);
                    }
                });
            }
            return false;
        },
        sendNewActivation: function () {
            var container = '.activation-dialog';
            if (aware.validate(container, 'top')) {
                var _email = $(container + ' #Email').val();
                $.post("/User/SendActivation", { email: _email }, function (data) {
                    if (data.success == 1) {
                        aware.showMessage(undefined, data.message);
                        aware.clearFields(container);
                        aware.delayedRefresh(2000, '/dashboard');
                    }
                    else {
                        aware.showError(data.message);
                    }
                });
            }
            return false;
        },
        onBackClick: function () {
            if ($(".login-panel .forgot-password-dialog").hasClass("dn")) {
                $(".login-panel .forgot-password-dialog").removeClass('dn');
                $(".login-panel .login-dialog").addClass('dn');
            } else {
                $(".login-panel .forgot-password-dialog").addClass('dn');
                $(".login-panel .login-dialog").removeClass('dn');
            }
            return false;
        },
        onRoleSelected: function () {
            var value = $(this).val();
            if (value == 1 || value == 2) {
                $('.store-field').removeClass('dn');
                $('.store-field .store-selector').addClass('validate');
            } else {
                $('.store-field').addClass('dn');
                $('.store-field .store-selector').removeClass('validate');
            }
        },
        onAuthorityClick: function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
                $(this).find("i").removeClass('fa-check-square').addClass('fa-square-o');
                $(this).parents('tr:eq(0)').find('.txt-quota').prop('disabled', true);
                $(this).parents('tr:eq(0)').find('.txt-expire-date').prop('disabled', true);
            }
            else {
                $(this).addClass('selected');
                $(this).find("i").removeClass('fa-square-o').addClass('fa-check-square');
                $(this).parents('tr:eq(0)').find('.txt-quota').removeAttr('disabled');
                $(this).parents('tr:eq(0)').find('.txt-expire-date').removeAttr('disabled');
            }
        },
        onSaveAuthorities: function () {
            aware.showLoading();
            var selectedAuthorities = [];
            $(elem.cbxAuthority + '.selected').each(function () {
                var elem = $(this);
                var expireDateField = $(elem).parents("tr:eq(0)").find(".txt-expire-date");
                var expireDate = expireDateField && expireDateField.length > 0 ? $(expireDateField).val() : "";

                selectedAuthorities.push({
                    definitionid: $(elem).data("authority-id"),
                    quota: $(elem).parents("tr:eq(0)").find(".txt-quota").val(),
                    expiredate: expireDate
                });
            });

            var relID = $(".authority-list #RelationID").val();
            var relType = $(".authority-list #RelationType").val();
            var postData = { relationID: relID, relationType: relType, authorities: selectedAuthorities };

            $.ajax({
                url: "/Common/SaveAuthorityUsage", type: "POST", data: JSON.stringify(postData),
                contentType: "application/json, charset=utf-8", dataType: "json",
                success: function (data) {
                    aware.hideDialog();
                    if (data.success == 1) {
                        aware.showToastr(data.message, 'success');
                    }
                    else {
                        aware.showToastr(data.message, 'error');
                    }
                }
            });
            return false;
        },
        ready: function () {
            $(".status-selector").selecto();
            $(".role-selector").selecto();
            $(".title-selector").selecto();
            $(".store-selector").selecto({ type: "multi" });
            aware.asDatePicker(".datepicker");
        }
    };

    var eventMetaData = [
        { selector: undefined, container: document, event: "ready", handler: handlers.ready, data: {} },
        { selector: elem.btnLogin, container: document, event: "click", handler: handlers.handleLogin, data: {} },
        { selector: elem.btnForgotPassword, container: document, event: "click", handler: handlers.forgotPassword, data: {} },
        { selector: elem.btnSaveUser, container: document, event: "click", handler: handlers.saveUser, data: {} },
        { selector: elem.btnDeleteUser, container: document, event: "click", handler: handlers.onDeleteUser, data: {} },
        { selector: elem.btnchangeUserPassword, container: document, event: "click", handler: handlers.changePassword, data: {} },
        { selector: elem.btnNewActivation, container: document, event: "click", handler: handlers.sendNewActivation, data: {} },
        { selector: elem.btnBack, container: document, event: "click", handler: handlers.onBackClick, data: {} },
        { selector: elem.hdnRole, container: document, event: "change", handler: handlers.onRoleSelected, data: {} },
        { selector: elem.cbxAuthority, container: document, event: "click", handler: handlers.onAuthorityClick, data: {} },
        { selector: elem.btnSaveAuthority, container: document, event: "click", handler: handlers.onSaveAuthorities, data: {} }
    ];

    $(function () {
        for (var it in eventMetaData) {
            var item = eventMetaData[it];
            $(item.container).on(item.event, item.selector, item.data, item.handler);
        }
    });
}(jQuery));