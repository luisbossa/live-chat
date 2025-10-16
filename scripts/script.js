//-----window.load start here

// Animate loader off screen
$(window).on('load', function () {
	"use strict";
    $('.skeleton').removeClass('skeleton');
    $('.layer').removeClass('layer');
 });   

//---- document ready start here--
jQuery(document).ready(function($) {
	
	"use strict";
	
/*--- custom scroll ---*/
$(".friendz-list, .calls-details, .groups, .users-status > ul, .doc-files, .bidu-chat, .drops-menu, .settings-popup, .public-list").mCustomScrollbar({
	autoHideScrollbar:true,
	theme:"dark"
});	
	
//--- emojies plugin
if ($.isFunction($.fn.emojioneArea)) {	
	$("#emojionearea1").emojioneArea({
		pickerPosition: "top",
		filtersPosition: "bottom",
		inline: true,
		search: false,
		tonesStyle: "bullet"
	  });
}
		
// upload media menu	
	$('.upload-media > span').on('click', function () {
		$('.upload-items').toggleClass('active');
		return false;
	});
	$('html,body').on('click', function () {
		$('.upload-items').removeClass('active');
	});
	
// send stickers	
	$('.toggle-sticker > span').on('click', function () {
		$('.sticker-sub-contain').toggleClass('active');
		return false;
	});
	$('html,body').on('click', function () {
		$('.sticker-sub-contain').removeClass('active');
	});	
	
// dark mode	
	$('.night-mode').on('click', function () {
		$(this).children().toggleClass('active');
		$('body').toggleClass('dark-theme');
	});
	
// search messages active popup	
	$('.search-mesg').on('click', function () {
		$('.searchinchat').toggleClass('active');
	});
	
// Stories slide show
	$('.story-user').on('click', function () {
		$('.stories-wraper').addClass('active');
	});
		$('.close-story').on('click', function () {
		$('.stories-wraper').removeClass('active');
	});		
	
//--- bootstrap tooltip and popover	
	if ($.isFunction($.fn.tooltip)) {
		$(function () {
	  		$('[data-toggle="tooltip"]').tooltip();
		});
	}
	 if ($.isFunction($.fn.popover)) {
		$(function () {
			$('[data-toggle="popover"]').popover();
		});	
	}
	
// Responsive class adding on width
	if($(window).width() < 990) {
		$(".bidu-area").children().addClass("resp");
	}

// responsive chat area	
	$('.friendz-meta').on('click', function () {
		$('.bidu-chat-area.resp').addClass('active');
	});
	$('.close-chat').on('click', function () {
		$('.bidu-chat-area.resp').removeClass('active');
	});
	
// responsive info area
	$('.bidu-admin > figure').on('click', function () {
		$('.info-area').addClass('active');
	});
	$('.close-area').on('click', function () {
		$('.info-area').removeClass('active');
	});	
	
 // popup //
	  /*$(".share-to").on("click", function(){
	     $(".share-wraper").addClass('active');
		  return false;
	  });

	  $('.close-btn').on("click",function(){
		  $(".share-wraper").removeClass('active');
	  });*/
	
// unread message
	/*$('.watchlist > li').on('click', function () {
		$(this).removeClass('unread');
		$(this).addClass('active').siblings().removeClass('active');
		return false;
	});*/

// light gallery
	if ($.isFunction($.fn.lightGallery)) {	
		$("#lightgallery").lightGallery();
		$("#lightgallery2").lightGallery();
	}


//chosen select plugin
	if ($.isFunction($.fn.chosen)) {
		/*$("select").chosen();*/
		$(".disable-search").chosen({disable_search_threshold: 10});
	}

// gif image play plugin
	if ($.isFunction($.fn.jqGifPreview)) {
		$(".gif").jqGifPreview();
	}
	
// calling timer	
var timer = new Timer();
timer.start();
	timer.addEventListener('secondsUpdated', function(e) {
		$('#basicUsage').html(timer.getTimeValues().toString());
		$('#basicUsage2').html(timer.getTimeValues().toString());
	});
	
//===== Search Filter =====//
	(function ($) {
	// custom css expression for a case-insensitive contains()
	jQuery.expr[':'].Contains = function(a,i,m){
	  return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
	};

	function listFilter(searchDir, list) { 
	  var form = $("<form>").attr({"class":"filterform","action":"#"}),
	  input = $("<input>").attr({"class":"filterinput","type":"text","placeholder":"Search Contacts..."});
	  $(form).append(input).appendTo(searchDir);

	  $(input)
	  .change( function () {
		var filter = $(this).val();
		if(filter) {
		  $(list).find("li:not(:Contains(" + filter + "))").slideUp();
		  $(list).find("li:Contains(" + filter + ")").slideDown();
		} else {
		  $(list).find("li").slideDown();
		}
		return false;
	  })
	  .keyup( function () {
		$(this).change();
	  });
	}

//search friends widget
	$(function () {
	  listFilter($("#searchDir"), $("#people-list"));
	});
	}(jQuery));	
	
// audio video player post	
new Plyr(".video-player")
new Plyr(".audio-player")	
	
});//document ready end




	





