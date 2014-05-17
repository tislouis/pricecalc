var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'node-login';
var mongodb     = require('mongodb');
/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
	db.open(function(e, d){
	if (e) {
		console.log(e);
	}	else{
		console.log('connected to database :: ' + dbName);
	}
});

var lps = db.collection('lastProductSearch');
var pt = db.collection('productTracked');
var accounts = db.collection('accounts');

exports.addTempPrice = function(newData, produit, callback)
{
    var request = require('request');
    var cheerio = require('cheerio');

//prendre valeur du form

      console.log(newData.url);
request(produit, function (err, resp, body){
    if(!err && resp.statusCode == 200){
        var $ = cheerio.load(body);
        console.log(body);
        var temp;
        var temp2;
        if(newData.website=='Amazon')
        {
         temp = $('b.priceLarge', '#actualPriceValue').text();
         temp = temp.substr(5);
         if(temp==='') temp=$('span.a-size-medium a-color-price' , '#priceblock_saleprice').text().substr(5);
        
        
         temp2 = $('#btAsinTitle').text();
         if(temp2 === '') temp2= $('span.a-size-large' , '#productTitle').text();
         console.log(temp2);
        }
        else if(newData.website=='FutureShop')
        {
        
           console.log("Debut ScrapingFutureShop");
            
            temp= $('span.dollars', 'div.container').text();
             temp+= '.' + $('span.cents', 'div.container').text();
            console.log(temp);
            
            temp2 = $('#ctl00_CC_ctl00_PD_lblProductTitle').text();
            
            
        }
        
        
        temp2= temp2.trim();
   
        console.log(newData.user);
        
       	lps.findOne({user:newData.user}, function(e, o) {
		if (o){ 
		    
		    console.log('update');
		    o.product = temp2;
		    o.price = temp;
		    o.url = produit;
		    o.website= newData.website;
		   lps.save(o, {safe: true}, function(err) {
					if (err) callback(err);
					else callback(null, o);
				});
		}
				
				else {
		    
		    console.log('new');
        newData.product = temp2;
        console.log(newData.product);
        newData.price = temp;
        newData.url = produit;
    lps.save(newData, {safe: true}, function(err) {
					if (err) callback(err);
					else callback(null, newData);
				});
				
				}
}
);
}});
};

exports.getTempPrice = function(user, callback)

{
  lps.findOne({user:user}, function(e, o){ callback(o); });
    
    
};


exports.addPriceTracked= function(newData, callback)
{
   
   
   
    pt.save(newData, {safe: true}, function(err) {
					if (err) callback(err);
					else callback(null, newData);
				});
};


exports.updatePriceTracked= function(product, callback)
{
    
    
    console.log('updatePriceTracked ' +product.currentPrice);
       pt.save(product, {safe: true}, function(err) {
					if (err) callback(err);
					else callback(null, product);
				});
};



exports.getPriceTracked = function(user,callback)

{
    
    pt.findOne ( {user:user}, function(e,o) { callback(o);});
};


exports.getTrackedProducts = function(user,callback)

{
    console.log("Je regarde ta liste de produits sauvegardes, attend");
    console.log("l'usager user cest :"+user);
    //trouve et retourne correctement un document bien formate (louis,http,prix,nom,site) 
    //pt.findOne ( {username:user}, {},function(e,o) {callback(o);});
    
    
    //pt.find( {username:user}, {},function(e,o) {callback(o);});
    pt.find( {username:user} ).toArray(function(err, o) {
        
        console.log(o[0]);
        console.log(o.length);
                 callback(o);
    });
   
};


exports.ScrapingAmazon = function(product)
{
	/* On va verifier le prix de TOUT les produits de la BD et les mettre a jour,
	currentPrice sera ainsi mis a jour mais seulement pour le site Amazon pour le moment
	*/
    var request = require('request');
    var cheerio = require('cheerio');
    
    
    request(product.url, function (err, resp, body)
    {
        
        var $ = cheerio.load(body);
    
        
       var temp= $('b.priceLarge', '#actualPriceValue').text().substr(5);
       //console.log('prix donne par priceLarge: '+ temp);
       if(temp==='') $('span.a-size-medium a-color-price' , '#priceblock_saleprice').text().substr(5);
     var email;
      accounts.findOne({name:product.username},function(e,o) 
     
     {
        
         email= o.email;
    
         
         
    
    
    //console.log('Email ScrapingAmazon' +email);
       if(temp < product.currentPrice) exports.yougotmail(email, temp, product, 
       function(e,o){});
       
       
     });
       
       product.currentPrice= temp;
      //console.log('Scraping Amazon pour: ' + product);
       exports.updatePriceTracked(product, function (e, o)
       
       {
           if(e) console.log(e);
           else ;
           
           
       }
       );
        
    });
};

exports.ScrapingFutureShop = function(product)
{
	/* On va verifier le prix de TOUT les produits de la BD et les mettre a jour,
	currentPrice sera ainsi mis a jour mais seulement pour le site Amazon pour le moment
	*/
    var request = require('request');
    var cheerio = require('cheerio');
    
    
    request(product.url, function (err, resp, body)
    {
        
        var $ = cheerio.load(body);
    
        
        var temp= $('span.dollars', 'div.container').text();
       temp+= '.' + $('span.cents', 'div.container').text();
       console.log(temp);
       if(temp < product.currentPrice) exports.yougotmail(accounts.findOne({name:product.username}, temp, product, function(e,o)
       {}
       ),function(e,o){});
       
       
       
       
       product.currentPrice= temp;
      console.log('Scraping FutureShop pour: ' + product);
       exports.updatePriceTracked(product, function (e, o)
       
       {
           if(e) console.log(e);
           else ;
           
           
       }
       );
        
    });
};


exports.updateProductTracked = function()
{
    
    //toute la bd dans un tableau
    pt.find ( {}).toArray(function(err,o) {
    
   
   //pou chacune des entrees
    for(var i=0; i<o.length; i++)
    {
    //  console.log(o[i]); 
      console.log('o[i]: '+o[i]);
      if(o[i]) 
      
      {
       
     if(o[i].website == 'Amazon') exports.ScrapingAmazon(o[i]);
     else if(o[i].website == 'FutureShop') exports.ScrapingFutureShop(o[i]);
      
      }
     
    
    }
    console.log('fin du for');
    });
    
};

exports.delete = function(productId, callback){
        console.log("Je suis dans pc delete");
        console.log("l'id est" +productId);
        console.log("productId");
        pt.remove( {_id: new mongodb.ObjectID(productId)} , function(err, o) {
        console.log(o);
        console.log(err);
        callback(o);
    });
};

exports.yougotmail = function(email, nouveauPrix, product, callback){
        console.log("c'est pour bientot");
        console.log("l'email est" + email);
        
        var nodemailer = require("nodemailer");
// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Hotmail",
    auth: {
        user: "tis_louis@hotmail.com",
        pass: "lolanael11"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: "Louis-P <tis_louis@hotmail.com>", // sender address
    to: email, // list of receivers
    subject: "Baisse de prix pour un article suivi ", // Subject line
    text: "Le prix de l'article: " + product.name + " est maintenant à: " + nouveauPrix  , // plaintext body
    html: "<b>Hello world </b>" // html body
};

// send mail with defined transport object
smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message envoye youpi: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    smtpTransport.close(); // shut down the connection pool, no more messages
});

callback();
};
//Scheduler, arrive ici via setInterval dans app.js
exports.scheduler = function()
{
	console.log("setInterval: It's been about 10 seconds!");

	this.updateProductTracked();
	
};


