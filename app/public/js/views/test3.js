$(document).ready(function(){

	var pc = new PriceController();

	$('#test3-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (pc.validateForm() == false){
				return false;
			} 	else{
			
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success');console.log('success');
		},
		error : function(e){
		console.log('erreur');
		}
	});
		
		});
