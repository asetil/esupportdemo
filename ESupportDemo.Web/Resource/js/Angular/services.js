adminApp.factory('variantService', ['$resource', '$q', function ($resource, $q) {
    return {
        getVariantRelations: function (relationID, relationType) {
            var deferred = $q.defer();
            $resource('/Variant/GetVariantRelations', { relationID: relationID, relationType: relationType }, { query: { method: 'POST', isArray: false } }).query(
                function (result) {
                    deferred.resolve(result);
                },
                function (response) {
                    //handle response
                }
            );
            return deferred.promise;
        },

        saveRelation: function (relation) {
            var deferred = $q.defer();
            $resource('/Variant/SaveVariantRelation', relation, { query: { method: 'POST' } }).save(function (result) {
                deferred.resolve(result);
            }, function (response) {
                //handle response
            });
            return deferred.promise;
        },

        deleteRelation: function (relationID) {
            var deferred = $q.defer();
            $resource('/Variant/DeleteVariantRelation', { id: relationID }, { query: { method: 'POST' } }).save(function (result) {
                deferred.resolve(result);
            }, function (response) {
                //handle response
            });
            return deferred.promise;
        },

        saveVariantSelection: function (selection) {
            var deferred = $q.defer();
            $resource('/Variant/SaveVariantSelection', selection, { query: { method: 'POST' } }).save(function (result) {
                deferred.resolve(result);
            }, function (response) {
                //handle response
            });
            return deferred.promise;
        },

        removeVariantSelection: function (selectionID) {
            var deferred = $q.defer();
            $resource('/Variant/DeleteVariantSelection', { selectionID: selectionID }, { query: { method: 'POST' } }).save(function (result) {
                deferred.resolve(result);
            }, function (response) {
                //handle response
            });
            return deferred.promise;
        }
    };
}]);

adminApp.factory('commonService', ['$resource', '$q', function ($resource, $q) {
    return {
        get: function (url,postData) {
            var deferred = $q.defer();
            $resource(url, postData, { query: { method: 'POST', isArray: false } }).query(
                function (result) {
                    deferred.resolve(result);
                },
                function (response) {
                    //handle response
                }
            );
            return deferred.promise;
        },

        save: function (url,item) {
            var deferred = $q.defer();
            $resource(url, item, { query: { method: 'POST' } }).save(function (result) {
                deferred.resolve(result);
            }, function (response) {
                //handle response
            });
            return deferred.promise;
        },

        remove: function (url,itemID) {
            var deferred = $q.defer();
            $resource(url, {id:itemID}, { query: { method: 'POST' } }).save(function (result) {
                deferred.resolve(result);
            }, function (response) {
                //handle response
            });
            return deferred.promise;
        },

        removeItem: function (url, postData) {
            var deferred = $q.defer();
            $resource(url, postData, { query: { method: 'POST' } }).save(function (result) {
                deferred.resolve(result);
            }, function (response) {
                //handle response
            });
            return deferred.promise;
        },

        handleAction: function (url, postData) {
            var deferred = $q.defer();
            $resource(url, postData, { query: { method: 'POST' } }).save(function (result) {
                deferred.resolve(result);
            }, function (response) {
                //handle response
            });
            return deferred.promise;
        },
    };
}]);