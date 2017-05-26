(() => {
    function PrSearchFactory($q, http) {
        const limit = 10;

        function SearchModel() {
            return {
                text: null,
                start: 0,
                limit,
                searchFilter: 0
            }
        }

        const exports = {
            results: [],
            searching: false,
            quickSearching: false,

            model: new SearchModel(),

            search(model) {
                exports.searching = true;
                _.extend(exports.model, model);
                model.searchFilter = parseInt(model.searchFilter) || 0;

                if (!model.text) {
                    exports.searching = false;
                    return;
                }

                return http.post('/search', exports.model, {ignoreLoadingBar: true})
                    .then(response => {
                        if (!exports.results.length) {
                            exports.results = response.data;
                        }
                        exports.results = _.union(exports.results, response.data);

                        return response.data;
                    })
                    .catch(error => $q.reject(error.message))
                    .finally(() => {
                        exports.searching = false;
                    });
            },

            quickSearch(model) {
                exports.quickSearching = true;
                _.extend(exports.model, model);
                const _model = _.extend({limit}, _.pick(exports.model, 'text'));

                if (!_model.text) {
                    return exports.clear();
                }

                return http.post('/search/autocomplete', _model, {ignoreLoadingBar: true})
                    .then(response => response.data)
                    .catch(error => $q.reject(error.message))
                    .finally(() => {
                        exports.quickSearching = false;
                    });
            },

            clear() {
                exports.results.length = 0;
                exports.model = new SearchModel();
            }
        };

        return exports;
    }
    angular.module('app.search')
        .factory('prSearch', PrSearchFactory);
})();
