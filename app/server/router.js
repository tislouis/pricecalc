
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var PC = require('./modules/price-calc');


module.exports = function(app) {

// main login page //

 app.get('/test4', function (req,res)
    {
        console.log('DebutGet');
        
        PC.getTempPrice(req.session.user.name, function(o)
        
        {
            console.log('ici');
            console.log(o);
        if(o=== null) res.render('test4', {test6: 'rien pour linstant' , testPrice: '' , testProduct: '', price: '', user:'', website: '', productname: '', url: '' } );
         
         else{   
             
             console.log('Render');
             console.log(o);
            res.render('test4', {test6: o.product , testPrice: o.price , testProduct: o.product, price: o.price, user:o.user, website: o.website, productname: o.product, url: o.url } );
         
         }
            
        }
        );
    }
    );
    
      //Routing temporaire vers une page qui s'occupera de la mise à jour des TrackedProducts
    app.get('/update', function (req, res)
    
    {
        console.log('accès à update');
        PC.updateProductTracked(function (o)
        
        {
            
            
        }
        
        );
        
        res.render('update');
        
    }
    
    );
    
//    app.get('/test3', function(req, res) {
//	console.log('acces a test3');
//	console.log(req.body.produit);
	
// res.render('test3');
	
//	});
	
    //Bouton de productsaved pour supprimer un produit suivi
    app.post('/produit/:id/delete', function (req,res) {
        console.log("Je suis da/ns router.js deletepost");
        PC.delete(req.param('_id'),function(err,o){
            res.redirect('/productsaved');
        });
    });
    
    
    //Envoyer un email test
    app.post('/sendemail', function (req,res) {
        console.log("preparation du email");
        PC.yougotmail(req.param('emailBox'),function(err,o){
            res.redirect('/test3');
        });
    });
    
    app.post('/test4', function (req, res)
    {
    	console.log('accès à test4');
        console.log(req.body.site);
        console.log('DebutPOST');
        PC.addTempPrice({user 		: req.session.user.name,
         product 		: null,
         price 		: null,
				url         : null,
		website: req.body.site		
				}
 ,req.body.produit, function(e)
       
       {
           if(e)
           {
               
           console.log("erreur");    
           res.send(e, 400);
            
           
           }
           else
           {
              console.log("ok");
               res.send('ok', 200);
               res.redirect("test4");
           }
           
       }
      
       );
        
    });
    
    
    
       app.post('/productSaved', function (req, res)
    
    
    {
        console.log('post à productsaved');
        PC.addPriceTracked(
            {
            username : req.session.user.name,
            url : req.body.url,
            currentPrice: req.body.price,
            initialPrice: req.body.price,
            productName: req.body.product,
            website: req.body.website
            
        } , function(e)
        
        {
            
            if(e)
            {
                console.log('erreur');
                res.send(e,400);
                
            }
            
            else
            {
                console.log('sauvegardé');
                res.send('ok', 200);
                res.redirect('productSaved');
                
            }
        }
        
        );
        
    }
    );

    
    app.get('/productSaved', function (req, res)
    
   {
   	console.log('get a productsaved');
      PC.getTrackedProducts(req.session.user.name, function (o)
      {
        // console.log(o);
           res.render('productSaved', {
            "productlist" : o, testRender : "Render fonctionne"
        });
          
      }
      
      );
          
      
       
    });

    
    
 

//	app.get('/test2', function(req, res) {
//	console.log('acces a test2');
//	console.log(req.body.produit);
//	
//res.render('test2', { test6: "omaha" });
	
//	});



	app.get('/', function(req, res){
		console.log('racine');
		
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user === undefined || req.cookies.pass === undefined){
			console.log('mustlogin');
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
	// attempt automatic login //
			console.log('essaieautologin');
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o !== null){
					req.session.user = o;
					res.redirect('/home');
					
				}	else{
					console.log('askloginfo');
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	
	app.post('/', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
				console.log('send 400');
			}	else{
				req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
			//	console.log('send 200');
			//	console.log(o);
				res.send(o, 200);
			}
		});
	});
	
// logged-in user homepage //
	
	app.get('/home', function(req, res) {
		console.log('get home');
		if(req.session.user === null){
	// if user is not logged-in redirect back to login page //
	console.log('notlogedin');
			res.redirect('/');
		}	else{
			console.log('loginok');
			
			
			res.render('home', {
				title : 'Control Panel',
				countries : CT,
				udata : req.session.user
			});
		}
	});
	
	app.post('/home', function(req, res){
			console.log('post /home');
		if (req.param('user') !== undefined) {
			AM.updateAccount({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user !== undefined && req.cookies.pass !== undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
					res.redirect("home");
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	

    
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		console.log('get signup');
		res.render('signup', {  title: 'Signup', countries : CT });
	});
	
	app.post('/signup', function(req, res){
		AM.addNewAccount({
		    name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country')
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		});
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		});
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		});
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
});
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });
	
	



};