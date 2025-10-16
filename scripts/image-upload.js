jQuery(document).ready(function($) {
	
	"use strict";
	
	function readURL(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				$('#imagePreview, #imagePreview1').css('background-image', 'url('+e.target.result +')');
				$('#imagePreview, #imagePreview1').hide();
				$('#imagePreview, #imagePreview1').fadeIn(650);
			};
			reader.readAsDataURL(input.files[0]);
		}
	}
	$("#imageUpload, #imageUpload1").change(function() {
		readURL(this);
	});

	function readURL(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				$('#imagePreview, #imagePreview2').css('background-image', 'url('+e.target.result +')');
				$('#imagePreview, #imagePreview2').hide();
				$('#imagePreview, #imagePreview2').fadeIn(650);
			};
			reader.readAsDataURL(input.files[0]);
		}
	}
	$("#imageUpload, #imageUpload2").change(function() {
		readURL(this);
	});
	
});	