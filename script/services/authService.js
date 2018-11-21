let auth = (() => {
    function isAuth() {
        return sessionStorage.getItem('authtoken') !== null;
    }


    function saveSession(userData) {
        sessionStorage.setItem('authtoken', userData._kmd.authtoken);
        sessionStorage.setItem('username', userData.username);
        sessionStorage.setItem('userId', userData._id);
    }


    function register(username, password, email, avatarUrl) {
        let obj = { username, password, email, avatarUrl };

        return remote.post('user', '', 'basic', obj);
    }

    function login(username, password) {
        let obj = { username, password };

        return remote.post('user', 'login', 'basic', obj);

    }

    function logout() {
        return remote.post('user', '_logout', 'kinvey');
    }

    function getUserById(userId) {
        const endpoint = userId;
        return remote.get('user', endpoint, 'kinvey');
    }

    function deleteUser(userId) {
        const endpoint = userId;
        return remote.remove('user', endpoint, 'kinvey');
    }

    return {
        isAuth,
        login,
        logout,
        register,
        getUserById,
        deleteUser,
        saveSession
    };

})();