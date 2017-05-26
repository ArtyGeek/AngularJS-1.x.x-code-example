(() => {
    function UserFactory($q, $state, $stateParams, $location, localStorageService, http, species) {
        let loginProgress = false;

        const user = {
            user: null,

            login(details) {
                if (!details) {
                    return $q.reject('Authorization error');
                }
                if (!details.email || !details.password) {
                    return $q.reject('Authorization error');
                }
                loginProgress = true;
                const loginDetails = `grant_type=password&username=${details.email}&password=${details.password}`;

                return http.post('/token', loginDetails, {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    ignoreLoadingBar: true
                })
                    .then(response => user.setAuthorized(response.data.access_token))
                    .then(() => species.list(true))
                    .then(() => user.verify('app.pets-list'))
		    .catch(error => $q.reject(error.data.error))
                    .finally(() => {
                        loginProgress = false;
                    });
            },

            signup(details) {
                if (angular.isString(details.email)) {
                    details.email = details.email.trim();
                }

                if (details.password !== details.confirmPassword) {
                    return $q.reject('Not matching');
                }

                return http.post('/account/register', details, {ignoreLoadingBar: true})
                    .then(response => response).catch(error => $q.reject(error.data.message));
            },

            setAuthorized(token) {
                localStorageService.set('authorizationData', {token});
            },

            setAuthorizedData(_user) {
                if (!user.user) {
                    user.user = {};
                }
                angular.extend(user.user, _user);
            },

            setUnauthorized() {
                localStorageService.remove('authorizationData');
                user.user = null;
            },

            onUnauthorized(response) {
                if (!loginProgress) {
                    user.setUnauthorized($location.path());
                    $location.path('/home').replace();
                }

                return $q.reject(response);
            },

            verify(nextLocation) {
                return http.get('/account', {ignoreLoadingBar: loginProgress})
                    .then(response => {
                        user.setAuthorizedData(response.data);
                        if (nextLocation) {
                            $state.transitionTo($state.get(nextLocation), $stateParams, {
                                reload: true,
                                inherit: false,
                                notify: true
                            });
                        }

                        return response.data;
                    })
            },

            get() {
                return http.get('/account')
                    .then(response => response.data)
                    .catch(error => $q.reject('Сервіс недоступний'));
            },

            update(details, ilb) {
                return http.put('/account', details, {ignoreLoadingBar: !!ilb})
                    .then(response => response.data)
                    .catch(error => $q.reject(error.message));
            },

            logout() {
                user.setUnauthorized();
                $state.transitionTo('home', $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            },

            sendFriendRequest(userId) {
                return http.post('/friends/add', {id: userId}, {ignoreLoadingBar: true})
                    .then(response => response.data)
                    .catch(error => $q.reject(error.message));
            },

            acceptFriendRequest(userId) {
                return http.post('/friends/accept', {id: userId}, {ignoreLoadingBar: true})
                    .then(response => response.data)
                    .catch(error => $q.reject(error.message));
            },

            declineFriendRequest(userId) {
                return http.post('/friends/decline', {id: userId}, {ignoreLoadingBar: true})
                    .then(response => response.data)
                    .catch(error => $q.reject(error.message))
            },

            removeFromFriends(userId) {
                return http.post('/friends/remove', {id: userId}, {ignoreLoadingBar: true})
                    .then(response => response.data)
                    .catch(error => $q.reject(error.message));
            },

            get isAuthorized() {
                return this.user !== null;
            }
        };

        return user;

    }

    angular.module('app.users')
        .factory('user', UserFactory);
})();
