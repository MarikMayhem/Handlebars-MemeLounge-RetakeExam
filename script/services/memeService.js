let memes = (() => {
    function getAllMemes() {
        const endpoint = 'memes?query={}&sort={"_kmd.ect": -1}';

        return remote.get('appdata', endpoint, 'kinvey');
    }

    function createMeme(creator, title, description, imageUrl) {
        let data = { creator, title, description, imageUrl };

        return remote.post('appdata', 'memes', 'kinvey', data);
    }

    function editMeme(memeId, creator, title, description, imageUrl) {
        console.log(memeId, creator, title, description, imageUrl)
        const endpoint = `memes/${memeId}`;
        let data = { memeId, creator, title, description, imageUrl };

        return remote.update('appdata', endpoint, 'kinvey', data);
    }

    function deleteMeme(memeId) {
        const endpoint = `memes/${memeId}`;

        return remote.remove('appdata', endpoint, 'kinvey');
    }

    function getMyCars(username) {
        const endpoint = `cars?query={"seller":"${username}"}&sort={"_kmd.ect": -1}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }

    function getMemeById(memeId) {
        const endpoint = `memes/${memeId}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }
    function getUserMemes(username) {
        const endpoint = `memes?query={"creator":"${username}"}&sort={"_kmd.ect": -1}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }

    return {
        getAllMemes,
        createMeme,
        editMeme,
        deleteMeme,
        getMemeById,
        getUserMemes,
        getMyCars
    }
})();