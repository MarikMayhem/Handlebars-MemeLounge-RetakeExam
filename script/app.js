$(() => {

    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');

        this.get('home', loadHomePage);
        this.get('index.html', loadHomePage);

        //Login
        this.get('#/login', (ctx) => {
            ctx.loadPartials({
                navigation: '../templates/common/nav.hbs',
                footer: '../templates/common/footer.hbs',
            }).then(function () {
                this.partial('../templates/authForms/loginForm.hbs');
            });
        });

        //Post
        this.post('#/login', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;

            console.log(username, password)
            if (!/^[a-zA-Z]{3,}$/.test(username)) {
                notify.showError('Username should be at least 3 characters long and contain only english alphabet letters');
            } else if (!/^[A-Za-z\d]{6,}$/.test(password)) {
                notify.showError('Password should be at least 6 characters long and contain only english alphabet letters');
            } else {
                auth.login(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        notify.showInfo('Login successful.');
                        ctx.redirect('#/memeFeed');
                    })
                    .catch(notify.handleError);
            }
        });

        //Register

        this.get('#/register', (ctx) => {

            ctx.loadPartials({
                navigation: '../templates/common/nav.hbs',
                footer: '../templates/common/footer.hbs',
            }).then(function () {
                this.partial('../templates/authForms/registerForm.hbs');
            });
        });

        //Post
        this.post('#/register', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let repeatPass = ctx.params.repeatPass;
            let email = ctx.params.email;
            let avatarUrl = ctx.params.avatarUrl;


            console.log(username, password, repeatPass, email, avatarUrl);

            if (!/^[a-zA-Z]{3,}$/.test(username)) {
                notify.showError('Username should be at least 3 characters long and contain only english alphabet letters');
            } else if (!/^[A-Za-z\d]{6,}$/.test(password)) {
                notify.showError('Password should be at least 6 characters long and contain only english alphabet letters');
            } else if (repeatPass !== password) {
                notify.showError('Passwords must match!');
            } else {
                auth.register(username, password, email, avatarUrl)
                    .then((userData) => {
                        auth.saveSession(userData);
                        notify.showInfo('User registration successful!');
                        ctx.redirect('#/memeFeed');
                    })
                    .catch(notify.handleError);
            }
        });
        this.get('#/logout', (ctx) => {
            auth.logout()
                .then(() => {
                    sessionStorage.clear();
                    ctx.redirect('#/home');
                })
                .catch(notify.handleError);
        });

        //CreateMeme

        this.get('#/create/meme', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }

            ctx.userPanelId = sessionStorage.getItem('userId');
            ctx.isAuth = auth.isAuth();
            ctx.username = sessionStorage.getItem('username');

            ctx.loadPartials({
                navigation: '../templates/common/nav.hbs',
                footer: '../templates/common/footer.hbs',
            }).then(function () {
                this.partial('../templates/create-edit/createMeme.hbs');
            });
        });

        //PostMeme
        this.post('#/create/meme', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }

            let creator = sessionStorage.getItem('username');
            let title = ctx.params.title;
            let description = ctx.params.description;
            let imageUrl = ctx.params.imageUrl;

            console.log(creator, title, description, imageUrl)

            memes.createMeme(creator, title, description, imageUrl)
                .then(() => {
                    notify.showInfo('Meme created.');
                    ctx.redirect('#/home');
                })
                .catch(notify.handleError);

        });

        //GetMemeById
        this.get('#/details/meme/:memeId', (ctx) => {
            let memeId = ctx.params.memeId;
            ctx.userPanelId = sessionStorage.getItem('userId');

            memes.getMemeById(memeId)
                .then((meme) => {
                    console.log(meme)
                    ctx.isAuthor = meme._acl.creator === sessionStorage.getItem('userId');
                    ctx.isAuth = auth.isAuth();
                    ctx.username = sessionStorage.getItem('username');
                    ctx.meme = meme;

                    ctx.title = meme.title;
                    ctx.description = meme.description;
                    ctx.imageUrl = meme.imageUrl;
                    ctx.creator = meme.creator;
                    ctx.memeId = meme._id;
                    ctx.creatorId = meme._acl.creator;

                    ctx.loadPartials({
                        navigation: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs'
                    }).then(function () {
                        this.partial('./templates/details/memeDetails.hbs');
                    })
                }).catch(notify.handleError);
        });


        //EditMeme
        //GetEditMeme
        this.get('#/edit/meme/:memeId', (ctx) => {

            ctx.userPanelId = sessionStorage.getItem('userId');


            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            let memeId = ctx.params.memeId;

            memes.getMemeById(memeId)
                .then((meme) => {
                    ctx.isAuth = auth.isAuth();
                    ctx.username = sessionStorage.getItem('username');
                    ctx.title = meme.title;
                    ctx.description = meme.description;
                    ctx.imageUrl = meme.imageUrl;
                    ctx.meme = meme;
                    ctx.loadPartials({
                        navigation: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                    }).then(function () {
                        this.partial('./templates/create-edit/editMeme.hbs');
                    });
                });
        });
        //PostEditMeme
        this.post('#/edit/meme', (ctx) => {

            let memeId = ctx.params.memeId;
            let creator = sessionStorage.getItem('username');
            let title = ctx.params.title;
            let description = ctx.params.description;
            let imageUrl = ctx.params.imageUrl;


            memes.editMeme(memeId, creator, title, description, imageUrl)
                .then(() => {
                    notify.showInfo(`Post ${title} updated.`);
                    ctx.redirect('#/home');
                })
                .catch(notify.showError);

        });

        //DeleteMeme
        this.get('#/delete/meme/:memeId', (ctx) => {
            ctx.userPanelId = sessionStorage.getItem('userId');

            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }

            let memeId = ctx.params.memeId;
            memes.deleteMeme(memeId)
                .then(() => {
                    notify.showInfo('Meme deleted.');
                    ctx.redirect('#/home');
                })
                .catch(notify.handleError);
        });

        this.get('#/user/:userId', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            ctx.userPanelId = sessionStorage.getItem('userId');
            ctx.userId = ctx.params.userId;
            ctx.isCurrentUser = isCurrentUser(ctx.params.userId);

            auth.getUserById(ctx.userId)
                .then((user) => {
                    ctx.isAuth = auth.isAuth();
                    ctx.username = sessionStorage.getItem('username');
                    ctx.userProfileName = user.username;
                    ctx.email = user.email;
                    ctx.avatarUrl = user.avatarUrl;

                    memes.getUserMemes(user.username)
                        .then((userMemes) => {
                            userMemes.forEach((m) => {
                                m.userMemes = m;
                                m.title = m.title;
                                m.description = m.description;
                                m.imageUrl = m.imageUrl;
                                m.isAuthor = m.creator === sessionStorage.getItem('username');
                                m.creatorId = m.creator;
                                console.log(m)
                            });
                            ctx.userMemes = userMemes;

                            ctx.loadPartials({
                                navigation: '../templates/common/nav.hbs',
                                footer: '../templates/common/footer.hbs',
                                userProfileMeme: '../templates/user-profile/userProfileMeme.hbs'
                            }).then(function () {
                                this.partial('../templates/user-profile/userProfile.hbs');
                            });
                        }).catch((err) => console.log(err))


                })
                .catch((err) => {
                    console.log(err);
                })
        });

        this.get('#/user/profile/:userId', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }

            ctx.userPanelId = sessionStorage.getItem('userId');
            ctx.userId = ctx.params.userId;

            ctx.isCurrentUser = isCurrentUser(ctx.params.userId);

            auth.getUserById(ctx.userId)
                .then((user) => {
                    ctx.isAuth = auth.isAuth();
                    ctx.username = sessionStorage.getItem('username');
                    ctx.userProfileName = user.username;
                    ctx.email = user.email;
                    ctx.avatarUrl = user.avatarUrl;


                    memes.getUserMemes(user.username)
                        .then((userMemes) => {
                            userMemes.forEach((m) => {
                                m.userMemes = m;
                                m.title = m.title;
                                m.description = m.description;
                                m.imageUrl = m.imageUrl;
                                m.isAuthor = m.creator === sessionStorage.getItem('username');
                                m.creatorId = m.creator;
                            });
                            ctx.userMemes = userMemes;

                            ctx.loadPartials({
                                navigation: '../templates/common/nav.hbs',
                                footer: '../templates/common/footer.hbs',
                                userProfileMeme: '../templates/user-profile/userProfileMeme.hbs'
                            }).then(function () {
                                this.partial('../templates/user-profile/userProfile.hbs');
                            });
                        }).catch((err) => console.log(err))
                })
                .catch((err) => {
                    console.log(err);
                })
        });

        this.get('#/user/profile/deleteUser/:id', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }

            let userPanelId = ctx.params.id;

            auth.deleteUser(userPanelId)
                .then(() => {
                    notify.showInfo('User deleted.');
                    sessionStorage.clear();
                    ctx.redirect('#/home');
                })
                .catch(notify.handleError);
        })

        //GetAllMemes
        this.get('#/memeFeed', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            ctx.userPanelId = sessionStorage.getItem('userId');

            memes.getAllMemes()
                .then((memes) => {
                    console.log(memes)
                    memes.forEach((m) => {
                        m.author = m.author;
                        m.title = m.title;
                        m.description = m.description;
                        m.imageUrl = m.imageUrl;
                        m.isAuthor = m._acl.creator === sessionStorage.getItem('userId');
                        m.creatorId = m._acl.creator;

                    });
                    ctx.isAuth = auth.isAuth();
                    ctx.username = sessionStorage.getItem('username');
                    ctx.memes = memes;
                    ctx.memeId = ctx.params.memeId;

                    ctx.loadPartials({
                        navigation: '../templates/common/nav.hbs',
                        footer: '../templates/common/footer.hbs',
                        meme: '../templates/home/meme-feed/meme.hbs',
                    }).then(function () {
                        this.partial('../templates/home/meme-feed/memeFeed.hbs');
                    });
                });
        }).catch(notify.handleError);


        function loadHomePage(ctx) {
            if (auth.isAuth()) {
                ctx.redirect('#/memeFeed');
                return;
            }

            ctx.loadPartials({
                navigation: '../templates/common/nav.hbs',
                footer: '../templates/common/footer.hbs',
            }).then(function () {
                this.partial('../templates/home/mainUnlogged.hbs');
            });
        }

        function isCurrentUser(userId) {
            if (userId === sessionStorage.getItem('userId')) {
                return true;
            }
            return false;
        }

    });

    app.run();
});