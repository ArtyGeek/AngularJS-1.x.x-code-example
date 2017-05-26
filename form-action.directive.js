(() => {
    function UiFormActionDirective($q, $timeout) {
        return {
            restrict: 'A',
            compile() {
                return (scope, elem, attrs) => {
                    let promise;

                    const spinner = angular.element('<span class="fa fa-circle-o-notch fa-spin"></span>');
                    const success = angular.element('<span class="fa fa-check"></span>');
                    const error = angular.element('<span class="fa fa-close fa-spin-stop"></span>');

                    elem.on('click', e => {
                        if (promise) {
                            return;
                        }

                        elem.prepend(spinner);
                        elem.addClass('disabled');

                        promise = $q.when(scope.$eval(attrs.uiFormAction, { $event: e }))
                            .then(() => {
                                elem.prepend(success);

                                $timeout(() => {
                                    promise = null;
                                    success.remove();
                                }, 2000);
                            })
                            .catch(() => {
                                elem.prepend(error);

                                $timeout(() => {
                                    promise = null;
                                    error.remove();
                                }, 2500);
                            })
                            .finally(() => {
                                spinner.remove();
                                elem.removeClass('disabled');
                            });
                    });

                }
            }
        }
    }

    angular.module('app.components.formAction')
        .directive('uiFormAction', UiFormActionDirective);
})();
