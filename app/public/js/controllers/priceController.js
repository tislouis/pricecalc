function PriceController()
{
    
 //    bind event listeners to button clicks //
	var that = this;
	

	$('#btnScraping').click(function(){ that.calculPrix(); });
	$('#btnSubmit').click(function(){ that.saveProduct(); });   
    
    this.calculPrix = function()
	{
      
		$.ajax({
		    
			url: "/test4",
			type: "POST",
			data: { produit: $('#search').val(),
			       site: $('[name="selectedWebsite"]:checked').val()
			}
			,
			success: function(){
			    
			   
			window.location.href = '/test4';
		
	
			
	},
	
	error: function()
	{
	  //  console.log('erreur');
	 
	    
	}
	});
	};
	
 this.saveProduct = function()
 {
     $.ajax(
         
         {
             url: "/productSaved",
             type: "POST",
             data: 
             {
                 price: $('#price').val(),
                 url: $('#url').val(),
                 product: $('#product').val(),
                 website: $('#website').val()
                 
             }
             ,
             success: function(){
                 
                 window.location.href = '/productSaved';
             },
             
             
             error: function()
             {
                 
                 
             }
             
         });
     
     
 };
	       
	        
	    
	    
	}

