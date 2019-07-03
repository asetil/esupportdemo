adminApp.controller('variantCtrl', function ($scope, $filter, variantService) {
    $scope.variantProperties = [];
    $scope.variantRelations = [];
    $scope.variantSelections = [];

    $scope.selectionProps = [];
    $scope.newRelation = {};
    $scope.newSelection = { props: [], Stock: "" };

    $scope.relationID = 0;
    $scope.relationType = 0;
    $scope.onSave = false;

    angular.element(document).ready(function () {
        variantService.getVariantRelations($scope.relationID, $scope.relationType)
       .then(function (response) {
           $scope.variantProperties = response.model.VariantProperties;
           $scope.variantRelations = response.model.Relations;
           $scope.variantSelections = response.model.Selections;

           initNewRelation();
           arrangeSelectionProps();
           arrangeVariantSelections();
       });
    });

    var initNewRelation = function () {
        $scope.newRelation = {
            ID: 0, RelationID: $scope.relationID, RelationType: $scope.relationType,
            VariantID: 0, VariantValue: 0, Price: 0
        };
    }

    $scope.getName = function (relation, type) {
        var variantProperty = $filter('filter')($scope.variantProperties, { ID: relation.VariantID })[0];
        if (type == 'P' && variantProperty) {
            return variantProperty.Name;
        }
        else if (type == 'O' && variantProperty) {
            if (relation.VariantValue == 0) {
                return "Tümü";
            }

            var option = aware._first(variantProperty.OptionList, relation.VariantValue);
            return option ? option.Name : "-";
        }
        return "-";
    };

    $scope.getOptionList = function (parentID) {
        if (parentID && parentID > 0) {
            var propertyList = $filter('filter')($scope.variantProperties, { ID: parentID });
            if (propertyList && propertyList.length > 0) {
                return propertyList[0].OptionList;
            }
        }
        return [];
    };

    $scope.saveRelation = function (relation) {
        var valid = true;
        if (relation.VariantID == 0) { aware.showToastr('Özellik seçmediniz!', 'error'); valid = false; }

        var isNew = relation.ID == 0;
        if (isNew && valid) {
            var existing = $filter('filter')($scope.variantRelations, { VariantID: relation.VariantID, VariantValue: relation.VariantValue })[0];
            if (existing && existing.ID > 0) { aware.showToastr('Seçimlerinize uyan bir varyant zaten tanımlı!', 'error'); valid = false; }
        }

        $scope.onSave = !valid;
        if (valid) {
            variantService.saveRelation(relation).then(function (response) {
                $scope.onSave = false;
                if (response.success) {
                    if (isNew) {
                        relation.ID = response.id;
                        $scope.variantRelations.push(relation);
                        initNewRelation();
                        aware.showToastr('Varyant özelliği başarıyla eklendi.', "success");
                    }
                    else {
                        aware.showToastr('Varyant özelliği başarıyla güncellendi.', "success");
                    }
                }
                else {
                    aware.showToastr("İşlem başarısız!", "error");
                }
            });
        }
    };

    $scope.removeRelation = function (relation) {
        aware.confirm("Varyant özelliği silinecek. Devam etmek istediğinize emin misiniz?", function () {
            variantService.deleteRelation(relation.ID).then(function (response) {
                if (response.success) {
                    aware.hideDialog();

                    var index = $scope.variantRelations.indexOf(relation);
                    $scope.variantRelations.splice(index, 1);
                    $scope.$apply();
                    aware.showToastr('Varyant başarıyla silindi.', "success");
                }
                else {
                    aware.showToastr("İstek işlenirken bir hata oluştu!", "error");
                }
            });
        });
    };

    $scope.saveVariantSelection = function (selectionInfo) {
        if (aware.validate("tr.variant-selection-row", "bottom")) {
            var combination = "";
            var ppt = [];

            for (var i = 0; i < $scope.selectionProps.length; i++) {
                var prop = $scope.selectionProps[i];
                var opt = selectionInfo.props[prop.id];
                combination += prop.id + ":" + opt + ";";
                ppt.push(prop.id + "_" + opt);
            }

            var isAdded = isSelectionAdded(ppt);
            if (isAdded) { aware.showToastr("Bu kombinasyon zaten eklenmiş!", "error"); return false; }

            var selection = {
                ID: 0, RelationID: $scope.relationID, RelationType: $scope.relationType,
                VariantCombination: combination, Stock: selectionInfo.Stock, Price: 0
            };

            variantService.saveVariantSelection(selection).then(function (response) {
                if (response.success) {
                    selection.ID = response.id;
                    $scope.variantSelections.push(selection);
                    arrangeVariantSelections();
                    aware.showToastr("Kombinasyon başarıyla eklendi.", "success");
                }
                else {
                    aware.showToastr("İşlem gerçekleştirlirken bir hata oluştu!", "error");
                }
            });
        }
        return false;
    }

    $scope.updateVariantSelection = function (selection) {
        variantService.saveVariantSelection(selection).then(function (response) {
            if (response.success) {
                aware.showToastr("Kombinasyon başarıyla güncellendi.", "success");
            }
            else {
                aware.showToastr("İşlem gerçekleştirlirken bir hata oluştu!", "error");
            }
        });
        return false;
    }

    $scope.removeVariantSelection = function (selection) {
        aware.askUser("<i style='font-weight:400;color:#dec544;'>" + selection.Name + "</i> kombinasyonunu silmek istediğinize emin misiniz?", function () {
            variantService.removeVariantSelection(selection.ID).then(function (response) {
                if (response.success) {
                    var index = $scope.variantSelections.indexOf(selection);
                    $scope.variantSelections.splice(index, 1);
                    aware.showToastr("Kombinasyon başarıyla silindi.", "success");
                }
                else {
                    aware.showToastr("İşlem gerçekleştirlirken bir hata oluştu!", "error");
                }
            });
        });
        return false;
    }

    $scope.$watch("newRelation.VariantID", function (newValue) {
        if ($scope.newRelation) {
            $scope.newRelation.VariantValue = 0;
            $scope.onSave = false;
        }
    });

    var arrangeSelectionProps = function () {
        var result = [];
        if ($scope.variantProperties && $scope.variantRelations) {
            for (var i = 0; i < $scope.variantProperties.length; i++) {
                var prop = $scope.variantProperties[i];
                if (!prop.TrackStock) { continue; }

                var options = [];
                $scope.newSelection.props[prop.ID] = 0;
                var contains = $.grep($scope.variantRelations, function (e) {
                    if (e.VariantID == prop.ID) {
                        if (e.VariantValue == 0) {
                            $.each(prop.OptionList,function () {
                                options.push({ id: $(this)[0].ID, name: $(this)[0].Name });
                            });
                        }
                        else {
                            var opt = aware._first(prop.OptionList, e.VariantValue);
                            options.push({ id: e.VariantValue, name: opt.Name });
                        }
                        return true;
                    }
                    return false;
                }).length > 0;

                if (contains) {
                    result.push({ id: prop.ID, name: prop.Name, options: options });
                }
            }
        }
        $scope.selectionProps = result;
    };

    var arrangeVariantSelections = function () {
        if ($scope.variantSelections) {
            for (var i = 0; i < $scope.variantSelections.length; i++) {
                var names = [];
                var PPT = [];

                var selection = $scope.variantSelections[i];
                var combination = selection.VariantCombination.split(";");

                for (var j = 0; j < combination.length; j++) {
                    if (combination[j].length <= 0) { continue; }

                    var propID = combination[j].split(":")[0];
                    var optID = combination[j].split(":")[1];
                    var prop = aware._first($scope.variantProperties, propID);
                    var opt = aware._first(prop.OptionList, optID);
                    names.push(prop.Name + ":" + opt.Name);
                    PPT.push(prop.ID + "_" + opt.ID);
                }

                var name = names.join(", ");
                $scope.variantSelections[i].Name = name;
                $scope.variantSelections[i].PPT = PPT;
            }
        }
    };

    var isSelectionAdded = function (ppt) {
        for (var i = 0; i < $scope.variantSelections.length; i++) {
            var found = true;
            var selection = $scope.variantSelections[i];
            for (var j = 0; j < ppt.length; j++) {
                if (!aware._contains(selection.PPT, ppt[j])) {
                    found = false; break;
                }
            }
            if (found) { return true; }
        }
        return false;
    }
});

adminApp.controller('brandCtrl', function ($scope, $filter, commonService) {
    $scope.brandList = [];
    $scope.newBrand = {};
    $scope.loaded = false;

    angular.element(document).ready(function () {
        commonService.get("/Brand/GetBrands", {page:1})
       .then(function (response) {
           $scope.brandList = response.model;
           $scope.newBrand = { ID: 0, Name: "", ImagePath: "", Status: 1 };
           $scope.loaded = true;
       });
    });

    $scope.save = function (brand) {
        brand.hasError = false;
        if (brand.Name.length == 0) { aware.showToastr("Marka adı belirtmediniz!", "error"); brand.hasError = true; }
        if (!brand.hasError) {
            var isNew = brand.ID == 0;
            commonService.save("/Brand/Save", brand).then(function (result) {
                if (result.IsSuccess==1) {
                    if (isNew) {
                        brand.ID = result.Value;
                        $scope.brandList.push(brand);
                        $scope.newBrand = { ID: 0, Name: "", ImagePath: "", Status: 1 };
                    }
                    aware.showToastr("İşlem başarıyla tamamlandı.", "success");
                }
                else {
                    aware.showToastr("İşlem gerçekleştirilirken bir hata oluştu!", "error");
                }
                brand.hasError = false;
            });
        }
    };

    $scope.remove = function (brand) {
        aware.askUser("'" + brand.Name + "' markasını silmek üzeresiniz. Devam ederseniz marka ve bu markanın kullanıldığı tüm ürünlerdeki marka bilgisi silinecektir. Devam etmek istediğinize emin misiniz?", function () {
            commonService.removeItem("/Brand/Delete", { brandID: brand.ID }).then(function (response) {
                if (response.success) {
                    var index = $scope.brandList.indexOf(brand);
                    $scope.brandList.splice(index, 1);
                    $scope.$apply();
                    aware.showToastr("İşlem başarıyla tamamlandı.", "success");
                }
                else {
                    aware.showToastr("İstek işlenirken bir hata oluştu!", "error");
                }
            });
        });
    };

    $scope.getImagePath = function (brand) {
        if (brand && brand.ImagePath && brand.ImagePath.length > 0) {
            return brand.ImagePath;
        }
        return "/brand/0.jpg";
    };
});

adminApp.controller('bankCtrl', function ($scope, $filter, commonService) {
    $scope.bankList = [];
    $scope.newBank = {};
    $scope.loaded = false;

    angular.element(document).ready(function () {
        commonService.get("/Order/GetBankList", {})
       .then(function (response) {
           $scope.bankList = response.model;
           $scope.newBank = { ID: 0, Name: "", BranchName: "", IBAN: "", AccountNumber: "" };
           $scope.loaded = true;
       });
    });

    $scope.save = function (bank) {
        bank.hasError = false;
        if (bank.Name.length == 0 || bank.BranchName.length == 0 || bank.IBAN.length == 0 || bank.AccountNumber.length == 0) {
            aware.showToastr("Lütfen zorunlu alanları doldurun!", 'error');
            bank.hasError = true;
        }

        if (!bank.hasError) {
            var isNew = bank.ID == 0;
            commonService.save("/Order/SaveBankInfo", bank).then(function (response) {
                if (response.success) {
                    if (isNew) {
                        bank.ID = response.itemID;
                        $scope.bankList.push(bank);
                        $scope.newBank = { ID: 0, Name: "", BranchName: "", IBAN: "", AccountNumber: "" };
                    }
                    aware.showToastr("İşlem başarıyla tamamlandı.", "success");
                }
                else {
                    aware.showToastr("İşlem gerçekleştirilirken bir hata oluştu!", "error");
                }
                bank.hasError = false;
            });
        }
        return false;
    };

    $scope.remove = function (bank) {
        aware.askUser("'" + bank.Name + "' bankasını silmek üzeresiniz. Devam etmek istediğinize emin misiniz?", function () {
            commonService.removeItem("/Order/DeleteBankInfo", { bankID: bank.ID }).then(function (response) {
                if (response.success) {
                    var index = $scope.bankList.indexOf(bank);
                    $scope.bankList.splice(index, 1);
                    $scope.$apply();
                    aware.showToastr("İşlem başarıyla tamamlandı.", "success");
                }
                else {
                    aware.showToastr("İstek işlenirken bir hata oluştu!", "error");
                }
            });
        });
    };

    $scope.getImagePath = function (bank) {
        if (bank && bank.ImageUrl && bank.ImageUrl.length > 0) {
            return bank.ImageUrl;
        }
        return "0.jpg";
    };
});

adminApp.controller('installmentCtrl', function ($scope, $filter, commonService) {
    $scope.itemList = [];
    $scope.posList = [];
    $scope.newItem = {};
    $scope.loaded = false;

    angular.element(document).ready(function () {
        commonService.get("/Order/GetInstallmentList", {})
       .then(function (response) {
           $scope.itemList = response.model;
           $scope.posList = response.posList;
           $scope.newItem = { ID: 0, Name: "", PosID: 0, Count: 0, Commission: 0 };
           $scope.loaded = true;
       });
    });

    $scope.save = function (item) {
        item.hasError = false;
        if (item.Name.length == 0 || item.PosID == 0) {
            aware.showToastr("Lütfen zorunlu alanları doldurun!", 'error');
            item.hasError = true;
        }

        if (item.Count < 2) {
            aware.showToastr("Taksit sayısı en az 2 olmalıdır!", 'error');
            item.hasError = true;
        }

        if (!item.hasError) {
            var isNew = item.ID == 0;
            commonService.save("/Order/SaveInstallmentInfo", item).then(function (response) {
                if (response.success) {
                    if (isNew) {
                        item.ID = response.itemID;
                        $scope.itemList.push(item);
                        $scope.newItem = { ID: 0, Name: "", PosID: 0, Count: 0, Commission: 0 };
                    }
                    aware.showToastr("İşlem başarıyla tamamlandı.", "success");
                }
                else {
                    aware.showToastr("İşlem gerçekleştirilirken bir hata oluştu!", "error");
                }
                item.hasError = false;
            });
        }
        return false;
    };

    $scope.remove = function (item) {
        aware.askUser("Taksit bilgisi silinecek. Devam etmek istediğinize emin misiniz?", function () {
            commonService.removeItem("/Order/DeleteInstallmentInfo", { installmentID: item.ID }).then(function (response) {
                if (response.success) {
                    var index = $scope.itemList.indexOf(item);
                    $scope.itemList.splice(index, 1);
                    $scope.$apply();
                    aware.showToastr("İşlem başarıyla tamamlandı.", "success");
                }
                else {
                    aware.showToastr("İstek işlenirken bir hata oluştu!", "error");
                }
            });
        });
    };

    $scope.hasPos=function() {
        return !!$scope.posList && $scope.posList.length > 0;
    }
});

adminApp.controller('languageCtrl', function ($scope, $filter, commonService) {
    $scope.itemList = [];
    $scope.loaded = false;

    angular.element(document).ready(function () {
        commonService.get("/Management/GetLanguageList", {}).then(function (response) {
           $scope.itemList = response.model;
           $scope.itemList.unshift({ ID: 0, Name: "", Abbreviate: "", Status: 1, IsDefault: false });
           $scope.loaded = true;
       });
    });

    $scope.save = function (language) {
        language.hasError = false;
        if (language.Name.length == 0 || language.Abbreviate.length == 0) {
            aware.showToastr("Lütfen zorunlu alanları doldurun!", 'error');
            language.hasError = true;
        }

        if (!language.hasError) {
            var isNew = language.ID == 0;
            aware.showLoading();
            commonService.save("/Management/SaveLanguage", language).then(function (response) {
                aware.hideDialog();
                if (response.success) {
                    if (isNew) {
                        var addedLanguage = angular.copy(language);
                        addedLanguage.ID = response.langID;

                        $scope.itemList.splice(0, 1);
                        $scope.itemList.push(addedLanguage);
                        $scope.itemList.unshift({ ID: 0, Name: "", Abbreviate: "", Status: 1, IsDefault: false });
                    }
                    aware.showToastr("İşlem başarıyla tamamlandı.", "success");
                }
                else {
                    aware.showToastr("İşlem gerçekleştirilirken bir hata oluştu!", "error");
                }
                language.hasError = false;
            });
        }
        return false;
    };

    $scope.remove = function (item) {
        aware.askUser("Dil bilgisi silinecek. Devam etmek istediğinize emin misiniz?", function () {
            aware.showLoading();
            commonService.removeItem("/Management/DeleteLanguage", { languageID: item.ID }).then(function (response) {
                aware.hideDialog();
                if (response.success) {
                    var index = $scope.itemList.indexOf(item);
                    $scope.itemList.splice(index, 1);
                    $scope.$apply();
                    aware.showToastr("İşlem başarıyla tamamlandı.", "success");
                }
                else {
                    aware.showToastr("İstek işlenirken bir hata oluştu!", "error");
                }
            });
        });
    };

    $scope.setAsDefault = function (item) {
        commonService.handleAction("/Management/SetAsDefaultLanguage", { languageID: item.ID }).then(function (response) {
            if (response.success) {
                for (var ind in $scope.itemList) {
                    $scope.itemList[ind].IsDefault = $scope.itemList[ind].ID == item.ID;
                }
                aware.showToastr("İşlem başarıyla tamamlandı.", "success");
            }
            else {
                aware.showToastr("İstek işlenirken bir hata oluştu!", "error");
            }
        });
    };

    $scope.getImagePath = function (language) {
        if (language && language.ImageInfo && language.ImageInfo.length > 0) {
            return language.ImageInfo;
        }
        return "0.jpg";
    };
});

//$scope.variantRelations=$.grep($scope.variantRelations, function (value) {
//    return value.ID != relation.ID;
//});