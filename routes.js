var mongoose = require('mongoose');
var fs = require('fs');
var im = require('imagemagick');
var User = require('./models/user');
var Article = require('./models/article');
var Config = require('./models/config');
var Vote = require('./models/vote');
var findHashtags = require('find-hashtags');



module.exports = function (app, passport) {

	app.get('/', function (req, res) {
		// Article.find().sort({'_id': -1}).limit(20).exec(function(err, articles){
  //           if (!err && articles) {
            	Config.findOne(function (err, counter) {
            		console.log('began incrementation of visits');
            		counter.number_of_visits += 1;
            		console.log(counter);
					if (req.isAuthenticated()) {
            			counter.number_of_logged_visits += 1;
						console.log("Logged in and ok");
						res.redirect('/@' + req.user.local.username);
					} else {
            			counter.number_of_disc_visits += 1;
            			console.log('moush on');
						res.render('home/home', { user : 'not connected', title: 'Acceuil'});
					}
					counter.save();
				})
            	// res.render('articles/list', { articlesList: articles});
		// 	} else {
		// 		console.log('There was an error retrieving our articles');
		// 		res.redirect('erreur/404');
		// 	}
		// });

	});

// DANGEROOUUUUUUS TO OMIT AFTER INSTALL
	app.get('/deploy/r2d2c3po', function(req, res) {

		var deploy = new Config({
			number_of_articles:  0,
    		number_of_visits:0,
		    number_of_reads:0,
		    number_of_logged_visits:0,
		    number_of_disc_visits:0,
		    number_of_users:0,

		    fb_page: "",
		    tw_account: "",
		    g_page: "",
		    p_account: "",
		    in_account: "",
	        });
		console.log('DEPLOY STEP ONE : FULLFILL THE BLANKS')

		deploy.save(function (err, plateforme) {

			console.log('DEPLOY STEP TWO : DONE CREATING THE DATABASE LAYER');

	        console.log("saved");
	        res.redirect('/');

		});
	});


	app.get('/analytics', function (req, res) {

		Config.findOne(function (err, counter) {
			res.render('admin/analytics', {counter: counter});
		});
	});

	function slugify(text) {

		return text.toString().toLowerCase()
		.replace(/\s+/g, '-')        // Replace spaces with -
		.replace(/[^\w\-]+/g, '')   // Remove all non-word chars
		.replace(/\-\-+/g, '-')      // Replace multiple - with single -
		.replace(/^-+/, '')          // Trim - from start of text
		.replace(/-+$/, '');         // Trim - from end of text
	
	}

	function slugifytitle(text) {

		return text.toString().toLowerCase()
		.replace(/\s+/g, '')        // Replace spaces with -
		.replace(/[^\w\-]+/g, '')   // Remove all non-word chars
		.replace(/\-\-+/g, '')      // Replace multiple - with single -
		.replace(/^-+/, '')          // Trim - from start of text
		.replace(/-+$/, '');         // Trim - from end of text
	
	}

	function metakeywordify(text) {

		return text.toString().toLowerCase()
		.replace(/\s+/g, '')        // Replace spaces with -
		.replace(/[^\w\-]+/g, '')   // Remove all non-word chars
		.replace(/\-\-+/g, '')      // Replace multiple - with single -
		.replace(/^-+/, '')          // Trim - from start of text
		.replace(/-+$/, '');         // Trim - from end of text
	
	}

	


	// =====================================================
	// LOGINS AND CREDENTIALS ==============================
	// =====================================================
	app.get('/login', function(req, res) {
		res.render('login', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/loginFailure', function(req, res, next) {
		res.send('Failed to authenticate');
	});
	 
	app.get('/loginSuccess', function(req, res, next) {
		res.send('Successfully authenticated');
	});
	 
	app.get('/profile', isLoggedIn, function(req, res, next) {
		res.send(req._passport.session.user);
	});



	// =====================================================
	// SIGNUPS =============================================
	// =====================================================
	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile/edit', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));


	//DEAL WITH REGISTRATION GET
	app.get('/register', function(req, res) {
		res.render('register', { });
	});


	// =====================================================
	// CHECK IF LOGGED IN ==================================
	// =====================================================
	// route middleware to make sure a user is logged in
	function isLoggedIn(req, res, next) {

		// if user is authenticated in the session, carry on 
		if (req.isAuthenticated())
			return next();

		// if they aren't redirect them to the home page
		res.redirect('/login');
	}



	// =====================================================
	// EDIT THE USER =======================================
	// =====================================================
	app.get('/profile/edit', isLoggedIn, function(req, res, next) {
		console.log(req.user.local.email);
		userdata = req.user;
		console.log(userdata);
		res.render("user/edit", userdata );
		//console.log(req.user);
	});

	app.post('/profile/edit', isLoggedIn, function(req, res, next) {
		console.log("Started Edition");
		console.log(req.files.avatar.path);

		fs.readFile(req.files.avatar.path, function (err, data) {

			var imageName = req.files.avatar.name;
			console.log("Got the name")

			/// If there's an error
			if(!imageName){
				console.log("There was an error in finding the imageName")
			} else {
			  var newPath = __dirname + "/public/uploads/avatars/fullsize/" + req.body.user_id;
			  /// write file to uploads/fullsize folder
			  fs.writeFile(newPath, data, function (err) {
			  });



			  	im.crop({
				  srcPath: newPath,
				  dstPath: newPath + '-150',
				  width:   150,
				  height: 150,
				  quality: 1,
				  gravity: "Center"
				}, function(err, stdout, stderr){
				  if (err) throw err;
				  console.log('resized kittens.jpg to fit within 256x256px');
				});

			};
		});


		fs.readFile(req.files.blogcover.path, function (err, data) {

			var imageName = req.files.blogcover.name;
			console.log("Got the name")

			/// If there's an error
			if(!imageName){
				console.log("There was an error in finding the imageName")
			} else {
			  	var newPath = __dirname + "/public/uploads/blogcovers/fullsize/" + req.body.user_id;
			  	/// write file to uploads/fullsize folder
			  	fs.writeFile(newPath, data, function (err) {
				});

			  	User.findById(req.body.user_id, function (err, user) {

					user.blogcover = req.body.user_id;
					user.save(function (err) {
						if (err) return handleError(err);
					});


				})
			};
		});

		User.findById(req.body.user_id, function (err, user) {
			user.local.first_name = req.body.first_name;
			user.local.last_name = req.body.last_name;
			user.local.username = req.body.username;
			user.local.avatar = req.body.user_id;
			user.local.about = req.body.about;
			user.fb_page = req.body.fb_page;
			user.tw_account = req.body.tw_account;
			user.in_account = req.body.in_account;
			user.blogname = req.body.blogname;
			if (req.body.blogslug){
				user.blogslug = slugifytitle(req.body.blogslug);
			} else {
				user.blogslug = slugifytitle(req.body.blogname);
			}
			user.save(function (err) {
				if (err) return handleError(err);
				res.redirect('/user/'+req.body.user_id);
			});


		})
	});


	// =====================================================
	// LOGOUT ==============================================
	// =====================================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


	// =====================================================
	// ARTICLE THINGS ======================================
	// =====================================================
	// Creating the articles interface
	app.get('/articles', function(req, res) {
		Article.find({}, function(err, articles){
            if (!err && articles) {
				//console.log(articles);
				res.render('articles/list', { articlesList: articles});
			} else {
				console.log('There was an error retrieving our articles');
				res.redirect('erreur/404');
			}
		});
	});




//===============================================================================================
	// =====================================================
	// WRITE NEW ARTICLE ===================================
	// =====================================================
    app.get('/article/new', isLoggedIn, function(req, res) {
        res.render('articles/new', { author: req._passport.session.user });
    });

	app.post('/article/new', function(req, res) {

		fs.readFile(req.files.image.path, function (err, data) {

			var imageName = req.files.image.name;

			/// If there's an error
			if(!imageName){

				console.log("There was an error in finding the imageName");
				res.redirect('erreur/404');

			} else {

				var newPath = __dirname + "/public/uploads/shots/fullsize/" + req.body.author_id + "-" + slugify(req.body.title).substring(0, 50) + '.png';

			  	/// write file to uploads/fullsize folder
			  	fs.writeFile(newPath, data, function (err) {

			  	/// let's see it
			  	//res.redirect('erreur/404');

			  	});

			  	im.crop({
				  srcPath: newPath,
				  dstPath: newPath + '-small-home.png',
				  width:   250,
				  height: 350,
				  quality: 1,
				  gravity: "Center"
				}, function(err, stdout, stderr){
				  if (err) throw err;
				  console.log('resized to fit within 256x256px');
				});
			};
		});

		console.log(findHashtags((req.body.article_content).replace(/(<([^>]+)>)/ig,"")));

		var article = new Article({ title: req.body.title,
	        abstract: req.body.article_abstract,
	        content: req.body.article_content,
			overlay: req.body.overlay,
	        slug: slugify(req.body.title),
	        shot: "/public/uploads/shots/fullsize/" + req.body.author_id + "-" + slugify(req.body.title).substring(0, 50) + '.png',
	        sum_of_views: 0,
	        sum_of_comments: 0,
	        author: req.body.author_id,
	        created: new Date()
	        });
		console.log('article created')



		article.save(function (err, post) {

			console.log('started inserting data to user\'s profile');
			User.findOne(req.body.author_id, function (err, user) {
				if (!err && user) {
					console.log("found user");
					console.log("found user for injection");

		            user.articles.push(post._id);
		            user.number_of_articles += 1;
		            console.log('we test ' + user.number_of_articles);
		            console.log("pushed injection");
		            user.save();
		            console.log("saved");
				} else {
					console.log('no can do :' + err);
				}

				Config.findOne(function (err, counter) {
					counter.number_of_articles += 1;
					counter.save();
				});


	        });

	        console.log("saved");
	        res.redirect('article/' + article._id + '/' + article.slug);

		});
	});







	// =====================================================
	// EDIT AN ARTICLE =====================================
	// =====================================================
    app.get('/article/edit/:articleid', isLoggedIn, function(err, req, res) {

		Article.findById(req.params.articleid, function(err, post){
            if (post) {

                res.redirect('/article/edit/'+articleid+'/'+post.slug);
            } else {
                console.log('404 : ' + err);
                res.redirect('erreur/404');
            }
        });
    });

    app.get('/article/edit/:articleid/*', isLoggedIn, function(req, res) {
    	console.log("WE ARE HERE");

		Article.findById(req.params.articleid, function(err, post){
            if (post) {
    			console.log("WE ARE HERE 2");
            	console.log(post.title);

                post.populate('author', function () {

			        post.save(function (err) {
					  if (err) // ...
					  console.log('article not saved ' + err);
					});

		            res.render('articles/edit', {user: req.user, post: post});

		        });
            } else {
                console.log('404 : ahyna' + err);
                res.redirect('erreur/404');
            }
        });
    });

    app.post('/article/update/:articleid', isLoggedIn, function(req, res) {

		Article.findById(req.params.articleid, function(err, article){
            if (article) {

				article.title = req.body.title;
			    article.abstract = req.body.article_abstract;
			    article.content = req.body.article_content;
			    article.overlay = req.body.overlay;
			    article.slug = slugify(req.body.title);

			    if (req.files.image.path == '') {
			    	console.log("it's empty");
			    } else {
			    	console.log("famma : "+req.files.image.path);
			    }
			    console.log('the file path is ' + req.files.image.path);
				
				if (req.files.image.path != "") {

			    	fs.readFile(req.files.image.path, function (err, data) {

						var imageName = req.files.image.name;

						/// If there's an error
						// if(!imageName){

						// 	console.log("There was an error in finding the imageName")
						// 	res.redirect('erreur/404');

						// } else {

						  	var newPath = __dirname + article.shot;
						  	console.log(newPath);
						  	/// write file to uploads/fullsize folder
						  	fs.writeFile(newPath, data, function (err) {

						  	/// let's see it
						  	//res.redirect('erreur/404');

						  	});

						  	im.crop({
							  srcPath: newPath,
							  dstPath: newPath + '-small-home.png',
							  width:   250,
							  height: 350,
							  quality: 1,
							  gravity: "Center"
							}, function(err, stdout, stderr){
							  if (err) throw err;
							  console.log('resized kittens.jpg to fit within 256x256px');
							});
						// };
					});
			    }
			    // article.shot = "/public/uploads/shots/fullsize/" + article.author + "-" + slugify(req.body.title)+'.png';
						  	
			    article.updated = new Date();
			    

				article.save();
				res.redirect('/article/'+article._id+'/'+article.slug.substring(0, 50) + '.png');
				console.log('article updated')

	        } else {
	            console.log('404 : ' + err);
	            res.redirect('erreur/404');
	        }
        });

    });


	// =====================================================
	// BLOG SHOW ===========================================
	// =====================================================
	//========================================================================================
    app.get('/blog/:blogslug', function(req, res) {

        User.findOne({'blogslug': req.params.blogslug}, function(err, user){
            if (user) {

                user.populate('articles', function() {
                	console.log('accessed the populatr');
                	console.log(user.articles);
                	res.render('user/blog', {'user': user});
                });

            } else {
                console.log('404 : ' + err);
                res.redirect('erreur/404');
            }
        });
    });

    app.get('/user/:userid', function(req, res) {

        User.findById(req.params.userid, function(err, user){
            if (user) {

            	res.redirect('/@'+ user.local.username);

            } else {
                console.log('404 : ' + err);
                res.redirect('erreur/404');
            }
        });
    });


	// =====================================================
	// USER SHOW ===========================================
	// =====================================================
	//========================================================================================
    app.get('/@:nickname', function(req, res) {
		Config.findOne(function (err, counter) {
			counter.number_of_visits += 1;
	        User.findOne({'local.username': req.params.nickname}, function(err, user){
	        	
	        	if (user) {

	                user.populate('articles', function() {
	                	console.log('accessed the populatr');

						if (req.isAuthenticated()) {
							counter.number_of_logged_visits += 1;
							res.render('user/blog', {'user': user, 'current_user': req.user});
		
	                	} else {
							counter.number_of_disc_visits += 1;
							res.render('user/blog', {'user': user, 'current_user': 'not_connected'});
	                	} 
	                });

	            } else {
	                console.log('404 : ' + err);
	                res.redirect('erreur/404');
	            }
	        });

	        counter.save();
	    });
    });
//===============================================================================================
	// =====================================================
	// READ AN ARTICLE =====================================
	// =====================================================
    app.get('/article/:articleid', function(req, res) {

        Article.findById(req.params.articleid, function(err, post){
            if (post) {
            	res.redirect('article/' + post._id + '/' + post.slug);
            } else {
                console.log('404 : ' + err);
                res.redirect('erreur/404');
            }
        });
    });


    app.get('/article/:articleid/*', function(req, res) {

		Config.findOne(function (err, counter) {
			counter.number_of_visits += 1;
			counter.number_of_reads += 1;
	        Article.findById(req.params.articleid, function(err, post){
	            if (post) {

	                post.populate('author', function () {

				        post.sum_of_views = post.sum_of_views + 1;
				        post.save(function (err) {
						  if (err) // ...
						  console.log('article not saved ' + err);
						});

				        User.findById(post.author.id, function(err, writer){
							if (writer) {

				                writer.populate({ path: 'articles', options: {limit: 5}}, function() {
				                	console.log('accessed the populatr');
				                	console.log(writer.articles);

									if (req.isAuthenticated()) {
										counter.number_of_logged_visits += 1;
										User.findOne({'_id': req.user.id, 'followees': post.author.id}, function(err, following) {
											if (following) {
												console.log('User is following the author');
												res.render('articles/show', {user: req.user, follow:'true', post: post, writer: writer, articlesList: writer.articles});
											} else {
												console.log('User is not following the author');
												res.render('articles/show', {user: req.user, follow:'false', post: post, writer: writer, articlesList: writer.articles});
											}
										})
							        } else {
							        	counter.number_of_disc_visits += 1;
							        	res.render('articles/show', {user: "not connected", follow:'false', post: post, writer: writer, articlesList: writer.articles});
							        }
								});
							}
						});
			        });
	            } else {
	                console.log('404 : ' + err);
	                res.redirect('erreur/404');
	            }
	        });

			counter.save();
		});
    });

	// =====================================================
	// VOTES HANDLING ======================================
	// =====================================================
	//========================================================================================
    app.post('/vote', function(req, res) {
		var obj = {};
		console.log('body: ' + JSON.stringify(req.body));
		console.log(req.body.type);


		var vote = new Vote({ type: req.body.type,
	        article: req.body.article_id,
	        voter: req._passport.session.user,
	        created: new Date()
	    });
		console.log('vote created');

		vote.save(function (err, vote) {
			console.log(vote);
			if (err) {
				console.log(err);
			}
		});

    });

	/* ===================================================================== 
	** MEDIA PATHS =========================================================
	** ===================================================================*/


	app.get('/public/uploads/avatars/fullsize/:file', function (req, res){
		file = req.params.file;
		var img = fs.readFileSync(__dirname + "/public/uploads/avatars/fullsize/" + file);
		res.writeHead(200, {'Content-Type': 'image/jpg' });
		res.end(img, 'binary');

	});


	app.get('/public/uploads/shots/fullsize/:file', function (req, res){
		file = req.params.file;
		var img = fs.readFileSync(__dirname + "/public/uploads/shots/fullsize/" + file);
		res.writeHead(200, {'Content-Type': 'image/jpg' });
		res.end(img, 'binary');

	});
	app.get('/public/uploads/photos/:file', function (req, res){
		file = req.params.file;
		var img = fs.readFileSync(__dirname + "/public/uploads/photos/" + file);
		res.writeHead(200, {'Content-Type': 'image/jpg' });
		res.end(img, 'binary');

	});

	app.get('/public/uploads/blogcovers/fullsize/:file', function (req, res){
		file = req.params.file;
		var img = fs.readFileSync(__dirname + "/public/uploads/blogcovers/fullsize/" + file);
		res.writeHead(200, {'Content-Type': 'image/jpg' });
		res.end(img, 'binary');

	});

	/* ===================================================================== 
	** ARTICLE IMAGE HANDLING ==============================================
	** ===================================================================*/
	app.post('/api/article/images', isLoggedIn, function(req, res, next) {
		console.log("Started Uploading the image");
		console.log(req.files.file.path);

		fs.readFile(req.files.file.path, function (err, data) {

			var imageName = req.files.file.name;
			console.log("Got the name " + imageName);

			/// If there's an error
			if(!imageName){
				console.log("There was an error in finding the imageName")
			} else {
				var newName = Math.random().toString(32).slice(2) + Math.random().toString(32).slice(2) + Math.random().toString(32).slice(2);
				console.log("named it " + newName);
				var newPath = __dirname + "/public/uploads/photos/" + newName;
			  /// write file to uploads/fullsize folder
			  fs.writeFile(newPath, data, function (err) {
			  });

			  res.send("/public/uploads/photos/" + newName);

			};
		});

	});

	/* ===================================================================== 
	** ERRORS HANDLING =====================================================
	** ===================================================================*/

	app.get('/erreur/404', function (req, res){
		
		res.render('errors/article404');

	});


	app.get('/registration/closed', function (req, res){
		
		res.render('errors/closedregistration');

	});




	app.use(function (req, res, next) {
		res.locals.login = req.isAuthenticated();
		next();
	});



	app.get('/erreur/404', function (req, res){
		
		res.render('errors/article404');

	});
};