(() => {
    function SearchController ($rootScope, prSearch, prmm) {
        const vm = this;
        vm.searching = false;

        vm.search = prSearch;

        vm.loadMore = () => {
            if (vm.search.searching) {
                return;
            }
            vm.search.model.start = vm.search.results.length;

            return vm.search.search(vm.search.model);
        };

        vm.refresh = () => {
            if (vm.search.searching) {
                return;
            }
            vm.search.model.start = 0;
            vm.search.results.length = 0;

            return vm.search.search(vm.search.model);
        };

        $rootScope.$on('$stateChangeStart', () => {
            prmm.default();
        });
    }
    angular.module('app.search')
        .controller('SearchController', SearchController);
})();
