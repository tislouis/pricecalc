$(document).ready(function(){

	var pc = new PriceController();

	$('#productSaved-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
		
			
				return true;
			
		},
		success	: function(responseText, status, xhr, $form){
		 window.location.href = '/home';
		},
		error : function(e){
		console.log('erreur');
		}
	});
		
		});