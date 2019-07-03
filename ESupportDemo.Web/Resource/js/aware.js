$.awareValidation = function () {
    var isInput = function (field) {
        return !$(field).hasClass('sbx-check') && !$(field).hasClass('cbx-check') && !$(field).hasClass('validate-file');
    }

    var getTitle = function (field) {
        var title = $(field).parents(".form-group:eq(0)").find(".title").html();
        title = title || $(field).attr("placeholder");
        return title;
    }

    var nullCheck = function (field, value) {
        if ($(field) && $(field).hasClass("horizantal-selector")) {
            value = $(field).find("input[type='hidden']").val();
            valid = value.length > 0 && value != 0 && value != "0";
            return { valid: valid, message: valid ? "" : getTitle(field) + " için seçim yapmadınız!" };
        }

        var valid = !$(field) || !isInput(field) || value.length > 0;
        return { valid: valid, message: valid ? "" : getTitle(field) + " boş olamaz!" };
    }

    var emailCheck = function (field, value) {
        var isEmail = $(field).hasClass("email-check");
        var valid = !isEmail || aware.isValidEmail(value);
        return { valid: valid, message: valid ? "" : "Belirttiğiniz e-posta adresi geçerli değil!" };
    }

    var sbxCheck = function (field, value) {
        var isSelection = $(field).hasClass("sbx-check");
        var valid = !isSelection;
        if (!valid && $(field).hasClass("selecto-wrap")) {
            var hiddenValue = $(field).find("input[type='hidden']").val();
            valid = hiddenValue.length > 0 && hiddenValue != "0";
        }
        else if (!valid) {
            valid = !($(field).data("id") == 0 || $(field).val() == 0);
        }
        return { valid: valid, message: valid ? "" : getTitle(field) + " için seçim yapmadınız!" };
    }

    var cbxCheck = function (field, value) {
        var isCbx = $(field).hasClass("cbx-check");
        var valid = !isCbx || !$(field).is(':checked');
        return { valid: valid, message: valid ? "" : getTitle(field) + " seçilmedi!" };
    }

    var fileCheck = function (field, value) {
        var allowFileCheck = $(field).hasClass("validate-file") && $(field).data("check-file") == 1;
        var valid = !allowFileCheck || $(field).find("input[type='file']").val().length > 0;

        if (allowFileCheck && valid) {
            var input = $(field).find("input[type='file']:eq(0)");
            var allowedExtensions = $(input).attr('accept');
            var fileName = $(input).val().toLowerCase();
            if (!aware.checkExtension(fileName, allowedExtensions)) {
                return { valid: fals, message: "Sadece '" + allowedExtensions + "' uzantılı dosyalar yükleyebilirsiniz!" };
            }
        }
        return { valid: valid, message: valid ? "" : getTitle(field) + " için dosya seçmediniz!" };
    }

    var eqaulityCheck = function (container, field, value) {
        var message = "";
        var valid = !$(field).hasClass("must-equal");

        if (!valid) {
            var comparedField = $(container).find("#" + $(field).data("compare-id"));
            valid = $(comparedField) == undefined || $(comparedField).val() == value;
            message = valid ? message : getTitle(comparedField) + " ve " + getTitle(field) + " eşleşmiyor!"
        }
        return { valid: valid, message: message };
    }

    var inEqualityCheck = function (container, field, value) {
        var message = "";
        var valid = !$(field).hasClass("not-equal");

        if (!valid) {
            var comparedField = $(container).find("#" + $(field).data("compare-id"));
            valid = $(comparedField) == undefined || $(comparedField).val() != value;
            message = valid ? message : getTitle(field) + " ve " + getTitle(comparedField) + " aynı olamaz!!"
        }
        return { valid: valid, message: message };
    }

    var handleValidation = function (container) {
        var validated = true;
        $(container).find(".error").removeClass("error");

        $(container).find(".validate").each(function () {
            try {
                var field = $(this);
                var value = $(field).val().trim();

                var result = nullCheck(field, value);
                if (result.valid) {
                    result = emailCheck(field, value);
                }

                if (result.valid) {
                    result = sbxCheck(field, value);
                }

                if (result.valid) {
                    result = cbxCheck(field, value);
                }

                if (result.valid) {
                    result = fileCheck(field, value);
                }

                if (result.valid) {
                    result = fileCheck(field, value);
                }

                if (result.valid) {
                    result = eqaulityCheck(container, field, value);
                }

                if (result.valid) {
                    result = inEqualityCheck(container, field, value);
                }

                if (!result.valid) {
                    validated = false;
                    $(field).addClass('error');
                    aware.showToastr(result.message, 'error');
                }
            } catch (ex) {
                console.log("Aware > Validation Error", ex);
            }
        });

        if (!validated) {
            $(container).find(".validate.error:eq(0)").focus();
        }
        return validated;
    }

    this.validate = handleValidation;

    this.instantValidate = function (container) {
        $(container + " input.validate").on("keyup blur paste", {}, function () {
            var field = $(this);
            var value = $(field).val().trim();
            if (!value) {
                $(field).addClass('error');
            }
            else {
                $(field).removeClass('error');
            }
        });

        $(container + " select.validate").on("change blur", {}, function () {
            var field = $(this);
            var value = $(field).val();
            if (!value || value == 0) {
                $(field).addClass('error');
            }
            else {
                $(field).removeClass('error');
            }
        });
    };

    this.isValidEmail = function (email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    };
}

$.AwarePager = function () {
    var selector = null;
    var pagerDefinition = {
        urlName: "page",
        linkCount: 10,
        elementPerPage: 10,
        size: 0
    };

    function drawPager() {
        var pagerCount = Math.ceil(pagerDefinition.size / pagerDefinition.elementPerPage);
        if (pagerCount <= 1) { $(selector).remove(); return false; }

        if (pagerDefinition.linkCount > pagerCount) {
            pagerDefinition.linkCount = pagerCount;
        }

        var currentPage = location.search.qstring(pagerDefinition.urlName).cint(1);
        var pagerHtml = '<ul class="pagination">';
        var pageIndex;
        if (currentPage > pagerDefinition.linkCount) {
            pageIndex = currentPage - (currentPage % pagerDefinition.linkCount);
            if (currentPage % pagerDefinition.linkCount == 0) {
                pageIndex = currentPage - pagerDefinition.linkCount;
            }
            var beforeLink = aware.QS_replace(pagerDefinition.urlName, pageIndex);
            pagerHtml += '<li class="paginate_button page"><a href="' + beforeLink + '"><i class="fa fa-angle-left"></i></a></li>';
        }

        for (i = 0; i < pagerDefinition.linkCount; i++) {
            pageIndex = (Math.floor((currentPage - 1) / pagerDefinition.linkCount) * pagerDefinition.linkCount + i + 1);
            if (pageIndex <= pagerCount) {
                var pageLink = aware.QS_replace(pagerDefinition.urlName, pageIndex);
                pagerHtml += '<li class="paginate_button page' + (currentPage == pageIndex ? " active" : "") + '"><a href="' + pageLink + '">' + pageIndex + '</a></li>';
            }
        }


        if (Math.ceil(currentPage / pagerDefinition.linkCount) < Math.ceil(pagerCount / pagerDefinition.linkCount) && pagerCount > pagerDefinition.linkCount) {
            pageIndex = currentPage + pagerDefinition.linkCount - (currentPage % pagerDefinition.linkCount);
            if (currentPage % pagerDefinition.linkCount == 0) {
                pageIndex -= pagerDefinition.linkCount;
            }

            if (pageIndex <= pagerCount) {
                var afterLink = aware.QS_replace(pagerDefinition.urlName, pageIndex+1);
                pagerHtml += '<li class="paginate_button page"><a href="' + afterLink + '"><i class="fa fa-angle-right"></i></a></li>';
            }
        }
        pagerHtml += '</ul>';
        $(selector).html(pagerHtml);
        return true;
    };

    this.draw = function (selectorElement, definition) {
        if (definition != undefined) {
            selector = selectorElement;
            if (definition.urlName == undefined || definition.urlName.length <= 0) { definition.urlName = pagerDefinition.urlName; }
            if (definition.linkCount == undefined || definition.linkCount.length <= 0) { definition.linkCount = pagerDefinition.linkCount; }
            if (definition.elementPerPage == undefined || definition.elementPerPage.length <= 0) { definition.elementPerPage = pagerDefinition.elementPerPage; }
            if (definition.size == undefined || definition.size.length <= 0) { definition.size = pagerDefinition.size; }

            pagerDefinition = definition;
            drawPager();
        }
    };
};

$.AwareSelecto = function () {
    var selector = null;
    var initialized = 0;
    var definition = {
        type: 'single',
        allowSearch: false,
        url: '',
        onChange: undefined
    };

    function getMultiSelectedItem(id, text, disabled) {
        if (disabled != undefined && disabled == true) {
            return '<span data-id="' + id + '">' + text + '</span>';
        }
        return '<span data-id="' + id + '">' + text + '<i class="fa fa-remove"></i></span>';
    }

    function searchFiltered(elem) {
        var text = $(elem).val();
        $(elem).addClass('loading');

        var parent = $(elem).parent('.selecto-wrap:eq(0)');
        $(parent).find('input[type="hidden"]').val(0).trigger('change');
        $(parent).find('ul').each(function () { $(this).remove(); });

        $.post($(parent).data('url'), { keyword: text }, function (result) {
            $(parent).find('ul').each(function () { $(this).remove(); });
            $(elem).removeClass('loading');
            if (result.success == 1) {
                if (result.data.length == 0) {
                    $(parent).append("<ul><span>Sonuç bulunamadı!</span></ul>");
                } else {
                    var html = "<ul>";
                    for (var i = 0; i < result.data.length; i++) {
                        var data = result.data[i];
                        html += '<li data-value="' + data.id + '">' + data.value + '</option>';
                    }
                    html += "</ul>";
                    $(parent).append(html);
                    if (result.data.length > 10) $(parent).find("ul").addClass("scrolled");
                }
            }
            else {
                $(parent).append("<ul><span>Sonuç bulunamadı!</span></ul>");
            }
            $(parent).find('ul').fadeIn('fast');
        });
        return false;
    }

    var liIndex = -1;
    var searchTimeout;
    function arrangeEvents() {
        $(document).on('click', '.single.selecto-wrap', {}, function () {
            if ($(this).hasClass("disabled")) { return false; }
            $(this).find('ul').fadeIn('fast');
            $(this).find('ul .searchable').removeClass('dn').focus().select();
            search($(this).find('ul .searchable'), '');
            return false;
        });

        $(document).on('click', '.single.selecto-wrap > ul > li', {}, function () {
            var parent = $(this).parents('.selecto-wrap:eq(0)');
            $(parent).find('input[type="hidden"]').val($(this).data('value')).trigger('change');

            var html = $(this).html().replace(/&amp;/g, '&');
            $(parent).find('div.preview').html(html);
            $(parent).find('ul input.txt').val(html).addClass('dn');
            $(parent).find('ul li').removeClass('selected').removeClass('hover');
            $(this).addClass('selected').addClass('hover');
            $(parent).find('ul').fadeOut('fast');
            return false;
        });

        $(document).on('keyup', '.single.selecto-wrap ul input.txt', {}, function (e) {
            if (!$(this).hasClass('searchable')) { return false; }
            if (!(e.which == 38 || e.which == 40 || e.which == 13)) {
                search(this, $(this).val());
            }
        });

        $(document).on('keydown', '.selecto-wrap ul input.txt', {}, function (e) {
            if (e.which == 38 || e.which == 40 || e.which == 13) {
                e.preventDefault();
            }

            var allowSearch = $(this).hasClass('searchable');
            if (liIndex == -1) { liIndex = $(this).next('ul').children('li.selected').index(); }
            if (e.which == 27) {
                $(this).next('ul').fadeOut(); //ESC
            }
            else if (e.which == 13) {
                if (liIndex > -1) { //ENTER
                    liIndex = -1;
                    $(this).next('ul').children('li.hover').click();
                }
            }
            else if (!allowSearch && !(e.keyCode == 38 || e.keyCode == 40)) { return false; }

            if (e.keyCode == 38 || e.keyCode == 40) {
                var newItem = null;
                var currentItem = $(this).next('ul').children('li.hover').eq(0);
                if (currentItem != undefined && currentItem.length > 0) {
                    if (e.keyCode == 38) {
                        newItem = $(currentItem).prevAll('li:not(".hidden")').first();
                        newItem = newItem.length > 0 ? newItem : $(this).next('ul').children('li:not(".hidden")').first();
                    }
                    else if (e.keyCode == 40) {
                        newItem = $(currentItem).nextAll('li:not(".hidden")').eq(0);
                        newItem = newItem.length > 0 ? newItem : $(this).next('ul').children('li:not(".hidden")').last();
                    }
                }

                if (newItem == undefined || newItem.length == 0) {
                    newItem = $(this).next('ul').children('li:not(".hidden")').eq(0);
                }

                $(this).next('ul').fadeIn('fast');
                $(this).next('ul').children('li.hover').removeClass('hover');
                if (newItem != undefined && newItem.length > 0) {
                    $(newItem).addClass('hover').select();
                }
            }
        });

        $(document).on('click', '.filtered.selecto-wrap > input.txt', {}, function () {
            $(this).select();
            if ($(this).next('ul').find('li').length > 0) {
                $(this).next('ul').fadeIn('fast');
            }
        });

        $(document).on('click', '.filtered.selecto-wrap > ul > li', {}, function () {
            var parent = $(this).parents('.selecto-wrap:eq(0)');
            $(parent).find('input[type="hidden"]').val($(this).data('value')).trigger('change');
            $(parent).find('input.txt').val($(this).html().replace(/&amp;/g, '&'));
            $(parent).find('ul li').removeClass('selected').removeClass('hover');
            $(this).addClass('selected').addClass('hover');
            $(parent).find('ul').fadeOut('fast');
        });

        $(document).on('keyup', '.filtered.selecto-wrap > input.txt', {}, function (e) {
            if ((e.which == 38 || e.which == 40 || e.which == 13)) { return false; }
            var elem = $(this);
            var parent = $(elem).parent('.selecto-wrap:eq(0)');
            $(parent).find('ul').each(function () { $(this).remove(); });

            if ($(elem).val().length > 2) {
                $(elem).addClass('loading');
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(function () { searchFiltered(elem); }, 600);
            }
            else {
                $(parent).find('input[type="hidden"]').val(0).trigger('change');
                $(parent).append('<ul><span class="info">En az 3 karakter girin..</span></ul>');
                $(elem).next('ul').fadeIn('fast');
            }
        });

        $(document).on('click', '.multi.selecto-wrap > .selection', {}, function () {
            if ($(this).parent('.multi.selecto-wrap').hasClass('un-edit')) { return false; }
            $(this).next('ul').fadeIn('fast');
        });

        $(document).on('mouseleave', '.selecto-wrap', {}, function (event) {
            $(this).find('ul input.txt').addClass('dn');
            $(this).find('ul').hide();
        });

        $(document).on('click', '.multi.selecto-wrap > ul > li', {}, function () {
            var parent = $(this).parents('.selecto-wrap:eq(0)');
            var cbxMode = $(parent).hasClass("checkbox-mode");

            if ($(this).data('value') == 0 || (!cbxMode && $(this).hasClass('selected'))) {
                return false;
            };


            if ($(this).data("value") == "-1") {
                $(parent).find(".selection span > i.fa-remove").click(); //Hepsini kaldır, tümü seçildi
            }
            else {
                $(parent).find(".selection span[data-id='-1'] > i.fa-remove").click(); //Tümü seçeneğini kaldırmak için
            }

            if (cbxMode) {
                if ($(this).hasClass('selected')) {
                    $(this).removeClass('selected');
                    $(parent).find(".selection span[data-id='" + $(this).data('value') + "'] > i.fa-remove").click();
                }
                else {
                    $(this).addClass('selected');
                    $(parent).find('div.selection').append(getMultiSelectedItem($(this).data('value'), $(this).html()));
                }
            }
            else {
                $(this).addClass('selected');
                $(parent).find('div.selection').append(getMultiSelectedItem($(this).data('value'), $(this).html()));
            }

            var sIDs = "";
            $(parent).find('ul > li.selected').each(function () {
                sIDs += $(this).data('value') + ',';
            });

            if (sIDs.length > 0) { //remove last ',' char
                sIDs = sIDs.slice(0, -1);
            }

            $(parent).find('input[type="hidden"]').val(sIDs).trigger('change');
            if (!cbxMode) { $(parent).find('ul').fadeOut('fast'); }
            return false;
        });

        $(document).on('click', '.multi > .selection > span > i', {}, function () {
            if ($(this).parents('.multi.selecto-wrap:eq(0)').hasClass('un-edit')) { return false; }
            var selectedIDs = '';
            var id = $(this).parent('span').data('id');
            var parent = $(this).parents('.selecto-wrap:eq(0)');
            $(this).parent('span:eq(0)').remove();
            $(parent).find('ul > li[data-value="' + id + '"]').removeClass('selected');
            $(parent).find('ul > li.selected').each(function () {
                selectedIDs += $(this).data('value') + ",";
            });

            if (selectedIDs.length > 0) { //remove last ',' char
                selectedIDs = selectedIDs.slice(0, -1);
            }
            $(parent).find('input[type="hidden"]').val(selectedIDs).trigger('change');
            return false;
        });

        $(document).on('changed', '.selecto-wrap input[type="hidden"]', {}, function () {
            var parent = $(this).parents('.selecto-wrap:eq(0)');
            var id = $(this).val();
            $(parent).find('ul > li[data-value="' + id + '"]').click();
            return false;
        });
    }

    function search(elem, text) {
        liIndex = -1;
        var c = 0;
        text = text.toLowerCase();
        var regex = new RegExp(".*" + text.replace(/\*/g, '.*').replace(/\%/g, '.*') + ".*");

        var parent = $(elem).parents('.selecto-wrap:eq(0)');
        $(parent).find('ul span.no-result').remove();
        $(parent).find('ul li').each(function () {
            $(this).removeClass('hidden');
            if (!(regex.test($(this).data('value')) || regex.test($(this).html().toLowerCase())) || c > 7) {
                $(this).addClass('hidden');
            }
            else {
                c++;
            }
        });

        if (c <= 0) { var result = '<span class="no-result">Sonuç bulunamadı!</span>'; $(parent).find('ul').append(result); }
        c > 10 ? $(elem).parent('ul').addClass('scrolled') : $(elem).parent('ul').removeClass('scrolled');
    }

    this.draw = function (_selector, _definition) {
        selector = _selector;
        if (_definition == undefined) _definition = definition;

        if (_definition.type == 'multi') {
            drawMulti(_definition);
        }
        else if (_definition.type == 'filtered') {
            drawFiltered(_definition);
        }
        else {
            drawSingle(_definition);
        }
        if (initialized == 0) { arrangeEvents(); initialized = 1; }
    };

    var drawSingle = function (definition) {
        var attributes = $(selector).addClass('selecto-wrap single').prop("attributes");
        var attrString = '';
        var idInfo = $(selector).attr('id');
        var nameInfo = $(selector).attr('name') || idInfo;

        $.each(attributes, function () {
            if (this.name != 'id' && this.name != 'name') {
                attrString += this.name + '="' + this.value + '" ';
            }
        });

        var selectedID = $(selector).val();
        var selectedText = $(selector).find('option:selected').text();
        var html = '<div ' + attrString + '>';
        html += '<input type="hidden" id="' + idInfo + '" name="' + nameInfo + '" value="' + selectedID + '"/>';
        html += '<div class="preview">' + selectedText + '</div>';

        var c = 0;
        var subHtml = '';
        if (definition.allowSearch) {
            subHtml += '<input type="text" class="dn txt searchable" placeholder="Ara"/>';
        }

        $(selector).find('option').each(function () {
            var id = $(this).val();
            subHtml += '<li data-value="' + id + '"' + (id == selectedID ? 'class="selected"' : '') + '>';
            subHtml += $(this).html().replace(/&amp;/g, '&') + '</li>';
            c++;
        });
        html += '<ul ' + (c > 10 ? 'class="scrolled"' : '') + '>' + subHtml + '</ul></div>';
        $(selector).replaceWith(html);
    };

    var drawMulti = function (definition) {
        $(selector).addClass("selecto-wrap multi" + (definition.display == "checkbox" ? " checkbox-mode" : ""))
        var attributes = $(selector).prop("attributes"), attrString = "";
        $.each(attributes, function () {
            if (this.name != 'id' && this.name != 'name' && this.name != 'multiple' && this.name != 'data-selected') {
                attrString += this.name + '="' + this.value + '" ';
            }
        });

        var idInfo = $(selector).attr('id');
        var nameInfo = $(selector).attr('name') || idInfo;

        var selectedValue = $(selector).data('selected');
        var c = 0, disabled = $(selector).hasClass('disabled');
        var subHtml = '', selectedText = '';

        if (definition.allowSearch) {
            subHtml += '<input type="text" class="dn txt searchable" placeholder="Ara"/>';
        }

        $(selector).find('option').each(function () {
            var id = $(this).val();
            var value = $(this).html().replace(/&amp;/g, '&');
            subHtml += '<li data-value="' + id + '"';
            if ((',' + selectedValue + ',').indexOf(',' + id + ',') > -1) {
                subHtml += 'class="selected"';
                selectedText += getMultiSelectedItem(id, value, disabled);
            }
            subHtml += '>' + value + '</li>';
            c++;
        });

        var html = '<div ' + attrString + '>';
        html += '<input type="hidden" id="' + idInfo + '" name="' + nameInfo + '" value="' + selectedValue + '"/>';
        html += '<div class="selection" placeholder="Seçiniz">' + selectedText + '</div>';

        if (!disabled) {
            html += '<ul ' + (c > 10 ? 'class="scrolled"' : '') + '>' + subHtml + '</ul>';
        }
        html += '</div>';
        $(selector).replaceWith(html);
    };

    var drawFiltered = function (definition) {
        var attributes = $(selector).addClass('selecto-wrap filtered').prop("attributes");
        var attrString = '';

        var idInfo = $(selector).attr('id');
        var nameInfo = $(selector).attr('name') || idInfo;

        $.each(attributes, function () {
            if (this.name != 'id' && this.name != 'name') {
                attrString += this.name + '="' + this.value + '" ';
            }
        });

        var selectedID = $(selector).data('id') || 0;
        var selectedText = $(selector).val() || '';

        var html = '<div ' + attrString + ' data-url="' + definition.url + '">';
        html += '<input type="hidden" id="' + idInfo + '" name="' + nameInfo + '" value="' + selectedID + '"/>';
        html += '<input type="text" class="txt searchable" value="' + selectedText + '" placeholder="Aramaya başla.."/>';

        if (selectedText.length > 0) {
            html += '<ul><li data-value="' + selectedID + '">' + selectedText + '</li></ul></div>';
        }
        $(selector).replaceWith(html);
    };
};

$.Aware = function () {
    this.pager = new $.AwarePager();
    this.selecto = new $.AwareSelecto();
    this.validator = new $.awareValidation();

    this.validate = function (container) {
        return this.validator.validate(container);
    };

    this.instantValidate = function (container) {
        this.validator.instantValidate(container);
    };

    this.showPopup = function (objID) {
        $('#' + objID).css("top", "0");
        $('#' + objID).css("left", "0");
        $('#' + objID).css("bottom", "inherit");
        $('#' + objID).css("right", "inherit");

        $('#' + objID).css('opacity', '1');
        $('#' + objID).addClass('open').show();
        $('#' + objID + 'Fade').show();

        var height = $('#' + objID).outerHeight();
        var width = $("#" + objID).outerWidth();
        var windowHeight = $(window).height();
        var windowWidth = $(window).width();

        var hflow = false, wflow = false;
        var offsetWidth = windowWidth > 720 ? 100 : 20;
        var offsetHeight = windowWidth > 720 ? 100 : 40;

        if (height >= windowHeight - offsetHeight) { height = windowHeight - offsetHeight; $('#' + objID).css("max-height", height + "px"); hflow = true; }
        if (width >= windowWidth - offsetWidth) { width = windowWidth - offsetWidth; $('#' + objID).css("max-width", width + "px"); wflow = true; }

        var mtop = parseInt((windowHeight - height) / 2);
        var mleft = parseInt((windowWidth - width) / 2);

        $('#' + objID).css("top", mtop + "px");
        $('#' + objID).css('left', mleft + "px");
        if (hflow) { $('#' + objID).css("bottom", mtop + "px"); }
        if (wflow) { $('#' + objID).css("right", mleft + "px"); }
        return false;
    };

    //this.showPopup = function (objID) {
    //    var width = $("#" + objID).width();
    //    $('#' + objID).css('margin-left', '-' + width / 2 + 'px');
    //    $('#' + objID).css('opacity', '1');
    //    $('#' + objID).addClass('open').fadeIn('slow', function () { });
    //    $('#' + objID + 'Fade').fadeIn('fast', function () { });
    //    return false;
    //};

    this.hidePopup = function (objID, fast) {
        if (fast != undefined && fast == true) {
            $('#' + objID).removeClass('open').hide();
            $('#' + objID + 'Fade').fadeOut('fast', function () { });
        } else {
            $('#' + objID).fadeOut('fast', function () { });
            $('#' + objID + 'Fade').fadeOut('slow', function () { });
        }

        return false;
    };

    this.showTooltip = function (field, message, pos) {
        pos = pos || 'top';
        $(field).tooltip('destroy');
        $(field).removeAttr('data-original-title');
        $(field).attr('title', message);
        $(field).data('placement', pos);
        $(field).tooltip('show');

        if ($(field).hasClass('preview')) {
            setTimeout(function () {
                $(field).removeClass('error');
                $(field).tooltip('destroy');
            }, 1200);
        }
        return true;
    };

    this.clearFields = function (wrapper) {
        $(wrapper + ' .text').val('');
        $(wrapper + ' input[type="text"]').val('');
        $(wrapper + ' .sbx').val(0);
        $(wrapper + ' .sbx input[type="hidden"]').val(0).trigger('changed');
    };

    this.isValidEmail = function (email) {
        return this.validator.isValidEmail(email);
    };

    this.imageGallery = function (item, isDynamic) {
        if ($(item).length == 0 && !isDynamic) { return; }

        var target = $('#zoomImage img');
        var ind = -1;

        function checkSize() {
            var count = $(activeItem).length;
            if (count > 1) {
                $(target).parent().find('.buttons i.fa').removeClass('dn');
            } else {
                $(target).parent().find('.buttons i.fa').addClass('dn');
            }
            return count;
        }

        $(document).on('keydown', 'body', {}, function (e) {
            if ($('#zoomImage').hasClass('open')) {
                if (e.which == 38 || e.which == 40 || e.which == 13) {
                    e.preventDefault();
                }
                if (e.which == 27) {
                    aware.hidePopup('zoomImage');
                } else if (e.which == 37) {
                    $(this).find('.btn-prev').click();
                }
                else if (e.which == 39) {
                    $(this).find('.btn-next').click();
                }
            }
        });

        var activeItem = undefined;
        $(document).on('click', item, {}, function () {
            activeItem = item;
            $(target).attr('src', $(this).attr('src'));
            var size = checkSize();

            for (var i = 0; i < size; i++) {
                if ($(item)[i] === $(this)[0]) { ind = i; break; }
            }
            aware.showPopup("zoomImage");
        });

        $(document).on('click', '.btn-next', {}, function () {
            if (activeItem) {
                ind = ind + 1 >= $(activeItem).length ? 0 : ind + 1;
                var nextItem = $(activeItem)[ind];
                $(target).attr('src', $(nextItem).attr('src'));
                aware.showPopup("zoomImage");
            }
            return false;
        });

        $(document).on('click', '.btn-prev', {}, function () {
            if (activeItem) {
                ind = ind - 1 < 0 ? $(activeItem).length - 1 : ind - 1;
                var prevItem = $(activeItem)[ind];
                $(target).attr('src', $(prevItem).attr('src'));
                aware.showPopup("zoomImage");
            }
            return false;
        });
    };

    this.showLoading = function (message) {
        message = message || 'Lütfen bekleyiniz..';
        $('.message-dialog .title').html(message);
        $('.message-dialog').attr('class', 'loading message-dialog').fadeIn(500);
    };

    this.hideDialog = function (dialog) {
        dialog = dialog || ".message-dialog";
        $(dialog).fadeOut("slow");
    };

    this.showMessage = function (title, message, css, icon) {
        title = title || 'İşlem Başarılı';
        title = '<i class="fa fa-' + (icon || 'check') + '"></i>&nbsp;&nbsp;' + title;
        message = message || '';

        $('.message-dialog .title').html(title);
        $('.message-dialog .message-content').html(message);
        $('.message-dialog').attr('class', 'message-dialog ' + css).fadeIn(500);
    };

    this.showError = function (message, title, iconCss) {
        title = title || 'İşlem Başarısız';
        iconCss = iconCss || 'exclamation-triangle';
        this.showMessage(title, message, 'fail', iconCss);
        return false;
    };

    this.delayedRefresh = function (time, url) {
        url = url || window.location.href;
        time = (time || 800);
        setTimeout(function () { window.location.href = url; }, time);
    };

    this.toSeoUrl = function (value) {
        var charMap = { Ç: 'c', Ö: 'o', Ş: 's', İ: 'i', I: 'i', Ü: 'u', Ğ: 'g', ç: 'c', ö: 'o', ş: 's', ı: 'i', ü: 'u', ğ: 'g' };
        str_array = value.split('');
        for (var i = 0, len = str_array.length; i < len; i++) {
            str_array[i] = charMap[str_array[i]] || str_array[i];
        }
        value = str_array.join('').replace(/ /g, "-").replace(/--/g, "-").replace(/[^a-z0-9-.çöşüğı]/gi, "").toLowerCase();
        return value;
    };

    this.getCookie = function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    };

    this.processRequest = function (url, postData, loadingMessage, onSuccess, onError) {
        aware.showLoading(loadingMessage, true);
        $.post(url, postData, function (data) {
            if (data.success == 1) {
                aware.showMessage(undefined, data.message);
                if (onSuccess != undefined) {
                    onSuccess(data);
                }
            } else {
                aware.showError(data.message);
                if (onError != undefined) {
                    onError(data);
                }
            }
        });
    };

    this.showToastr = function (message, css) {
        var iconCss = (css == 'error' ? 'exclamation-circle' : 'check');
        iconCss = (css == 'warn' ? 'exclamation-triangle' : iconCss);
        iconCss = (css == 'info' ? 'info-circle' : iconCss);

        var html = '<span class="' + css + '"><i class="dbfl fa fa-' + iconCss + '"></i><span>' + message + '</span></span>';
        $('.aware-toastr').append(html);
        var item = $('.aware-toastr > span').last();
        setTimeout(function () { $(item).fadeOut(1000, function () { $(this).remove(); }) }, 3000);
    };

    this.asDatePicker = function (elem, options) {
        try {
           if ($(elem) && $(elem).length) {
               options = options || {};
               $(elem).datepicker({
                   dateFormat: "dd.mm.yy",//tarih formatı yy=yıl mm=ay dd=gün
                   autoSize: false,//inputu otomatik boyutlandırır
                   dayNames: ["pazar", "pazartesi", "salı", "çarşamba", "perşembe", "cuma", "cumartesi"],//günlerin adı
                   dayNamesMin: ["pa", "pzt", "sa", "çar", "per", "cum", "cmt"],//kısaltmalar
                   defaultDate: options.defaultDate || 0,//takvim açılınca seçili olanı bu günden 10 gün sonra olsun dedik
                   maxDate: options.maxDate || "+2y+1m +2w",//ileri göre bilme zamanını 2 yıl 1 ay 2 hafta yaptık
                   minDate: options.minDate || "-1y-1m -2w",//geriyi göre bilme alanını 1 yıl 1 ay 2 hafta yaptık.bunu istediğiniz gibi ayarlaya bilirsiniz
                   monthNames: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],//ay seçim alanın düzenledik
                   monthNamesShort: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],//ay seçim alanın düzenledik
                   nextText: "ileri",//ileri butonun türkçeleştirdik
                   prevText: "geri",//buda geri butonu için
                   //minDate: 0,
                   showAnim: "slideDown"//takvim açılım animasyonu alta tüm animasyon isimleri yazdım 
               });
           }
        } catch (e) {
            console.log(e.message);
        }
    }

    this.onConfirmEvent = null;
    this.confirm = function (message, onConfirm, title) {
        title = title || "Lütfen Onaylayın";
        $("#confirmModal .title span").html(title);
        $("#confirmModal .message").html(message);
        this.onConfirmEvent = onConfirm;
        $("#confirmModal").data("loading", 1);
        $("#confirmModal").modal();
        return false;
    }

    this.askUser = function (message, onConfirm, title) {
        title = title || "Lütfen Onaylayın";
        $("#confirmModal .title span").html(title);
        $("#confirmModal .message").html(message);
        this.onConfirmEvent = onConfirm;
        $("#confirmModal").data("loading", 0);
        $("#confirmModal").modal();
        return false;
    }

    this.QS_value = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    this.QS_replace = function (key, value, url) {
        url = url || window.location.href;
        if (url) {
            value = value + ""; key=key+"";
            var main = url.split('?')[0];
            var qstring = url.split('?')[1];

            if (qstring) {
                var queries = qstring.split("&");
                qstring = "";
                var found = false;

                for (var i = 0; i < queries.length; i++) {
                    var item = queries[i];
                    if (item && item.indexOf(key + '=') > -1) {
                        found = true;
                        if (value.length > 0) {
                            qstring += '&' + key + '=' + value;
                        }
                    }
                    else if (item.length > 0) {
                        qstring += '&' + item;
                    }
                }

                if (!found && value.length > 0 && key.length > 0) {
                    qstring += '&' + key + '=' + value;
                }
            }
            else {
                qstring = key + "=" + value;
            }
            return main + (qstring ? "?" + qstring.replace('&', '') : "");
        }
        return "";
    };

    this.QS_remove = function (key, url) {
        url = url || window.location.href;
        if (url) {
            var main = url.split('?')[0];
            var qstring = url.split('?')[1];

            if (qstring) {
                var queries = query.split('&');
                qstring = "";
                for (var i = 0; i < queries.length; i++) {
                    var item = queries[i];
                    if (item.length > 0 && item.indexOf(key + '=') == -1) {
                        qstring += '&' + item;
                    }
                }
            }
            return main + (qstring ? "?" + qstring.replace('&', '') : "");
        }
        return "";
    };

    this.fileExtension = function (fileName) {
        if (fileName.length > 0) {
            var result = fileName.split(".")[fileName.split(".").length - 1];
            return result.toLowerCase();
        }
        return fileName;
    };

    this.checkExtension = function (fileName, extensionString) {
        if (extensionString && extensionString.length > 0) {
            var extension = this.fileExtension(fileName);
            var allowedExtensions = extensionString.toLowerCase().split(",");
            return $.inArray("." + extension, allowedExtensions) >= 0;
        }
        return true;
    };

    this.createCookie = function (name, value, minutes, path) {
        path = path || "/";
        var expires = "";

        if (minutes) {
            var date = new Date();
            date.setTime(date.getTime() + (minutes * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        document.cookie = name + "=" + value + expires + "; path=" + path;
    }

    this.readCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    this.deleteCookie = function (name) {
        createCookie(name, "", -1);
    }

    this.fixMouseOut = function (item, event) {
        var child = null;
        if (event.toElement) {
            child = event.toElement;
        } else if (event.relatedTarget) {
            child = event.relatedTarget;
        }

        if (child != null) {
            while (child.parentNode) {
                if ((child = child.parentNode) == item) {
                    return false;
                }
            }
        }
        return item != child;
    }

    this._first = function (list, id) {
        var result = $.grep(list, function (e) { return e.ID == id || e.id == id; })[0];
        return result;
    }

    this._firstItem = function (list, checker) {
        if (list && checker) {
            var result = $.grep(list, function (e) { return checker(e); })[0];
            return result;
        }
        return undefined;
    }

    this._contains = function (list, value) {
        var result = $.grep(list, function (e) { return e == value; });
        return result && result.length > 0;
    }

    this._containsValue = function (list, checker) {
        var result = $.grep(list, checker);
        return result && result.length > 0;
    }

    this._select = function (list, mapper) {
        var result = [];
        if (list && mapper) {
            for (var i = 0; i < list.length; i++) {
                var item = mapper(list[i]);
                if (item) { result.push(item); }
            }
        }
        return result;
    }

    this._clone = function (list) {
        var result = [];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                result.push(list[i]);
            }
        }
        return result;
    }
};

//Extensions
jQuery.fn.extend({
    fixMouseOut: function (event) {
        var child = null;
        if (event.toElement) {
            child = event.toElement;
        } else if (event.relatedTarget) {
            child = event.relatedTarget;
        }

        if (child != null) {
            while (child.parentNode) {
                if ((child = child.parentNode) == this) {
                    return false;
                }
            }
        }

        if (this != child) {
            return true;
        }
        return false;
    },
    selecto: function (definition) {
        if ($(this) != null && $(this) != undefined && $(this).length > 0 && !$(this).hasClass('selecto-wrap')) {
            aware.selecto.draw($(this), definition);
        }
        return false;
    },
    paginate: function (definition) {
        if ($(this) != null && $(this) != undefined && $(this).length > 0) {
            aware.pager.draw($(this), definition);
        }
        return false;
    },
    _replace: function (oldValue, newValue) {
        return $(this).replace(new RegExp(oldValue, 'gi'), newValue);
    },
    disable: function () {
        $(this).attr('disabled', 'disabled');
    },
    enable: function () {
        $(this).removeAttr('disabled');
    }
});

String.prototype.cint = function (defaultValue) {
    return parseInt(this) || (defaultValue || 0);
};

String.prototype.qstring = function (name) {
    var url = this;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

jQuery.browser = {};
(function () {
    jQuery.browser.msie = false;
    jQuery.browser.version = 0;
    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
        jQuery.browser.msie = true;
        jQuery.browser.version = RegExp.$1;
    }

    function allowNumeric(elem, event, allowNegative, allowDecimal) {
        var value = $(elem).val();
        if (event.shiftKey || event.altKey) {
            return false;
        }
        else if (event.keyCode === 37 || event.keyCode === 39) { // left/right
            return true;
        }
        else if (event.ctrlKey && event.keyCode === 65 || event.keyCode === 97) {
            return true;
        }
        else if (allowNegative && (event.keyCode === 109 || event.keyCode === 189)) { // - char
            return value.length === 0;
        }
        else if (allowDecimal && (event.keyCode === 190 || event.keyCode === 188 || event.keyCode === 110)) { // .,, chars
            return value.length > 0 && value !== "-" && value.indexOf(".") === -1 && value.indexOf(",") === -1;
        }
        return event.keyCode === 8 || (event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105);
    }

    $(document).on("keydown", "input[type='text'].number", {}, function (event) {
        var elem = $(this);
        return allowNumeric(elem, event, true, false);
    });

    $(document).on("keydown", "input[type='text'].dec-number", {}, function (event) {
        var elem = $(this);
        return allowNumeric(elem, event, true, true);
    });

    $(document).on("keydown", "input[type='text'].pnumber", {}, function (event) {
        var elem = $(this);
        return allowNumeric(elem, event, false, false);
    });

    $(document).on("keydown", "input[type='text'].dec-pnumber", {}, function (event) {
        var elem = $(this);
        return allowNumeric(elem, event, false, true);
    });

    $(document).on("click", "#confirmModal .btn-yes", {}, function () {
        var loading = $("#confirmModal").data("loading");
        if (loading && loading == 1) {
            aware.showLoading(undefined, true);
        }

        $("#confirmModal").modal("hide");
        if (aware.onConfirmEvent != null) {
            return aware.onConfirmEvent();
        }
        return false;
    });
})();

function setPager(selector, pageSize, total) {
    $(selector).paginate({
        linkCount: 10,
        elementPerPage: pageSize,
        size: total
    }, true);
}