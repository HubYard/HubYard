var types = ['Instagram', 'Coinbase', 'Google Analytics', 'Product Hunt', 'Twitter', 'Mattermark', 'YouTube', 'IMDB', 'DataFox', 'Your']
var tyto = 0;

$(document).ready(function(){
	

});

$(document).on('click', '.modal-information-container-close', function(){
	$($(this).data('hide')).fadeOut();
});

$(document).on('click', '.plot-insta', function(){
    $(this).fadeOut();
	$('.plot-signup').slideDown();
});


$(document).on('click', '#learn', function(){
	$("html, body").animate({ scrollTop: "460px" });
});


$(document).on('click', '.forgot-pw', function(){
    $('.forgot-password').toggle();
});

$(document).on('click', '.nevermind-password', function(){
    $(this).parent().toggle();
});



$(document).on('click', '.forgot-password-submit', function(){
    if($('.forgot-password-container input').val() !== ''){
        $.ajax({
            url: "/lost-password",
            type: "POST",
            data: {email:$('.forgot-password-container input').val()},
            success: function(results){
                alert('Success! Check your Email for your recovery link');   
            },
            error: function(){
                alert("Your email doesn't seem to exit. If you created an account before 2015, it was deleted in the upgrade, sorry :(");
            }
        });   
    } else {
        alert('Enter an Email!');   
    }
});

$(document).on('click', '.new-password-submit', function(){
    if($('.forgot-password-container input').val() !== ''){
        $.ajax({
            url: "/reset-password",
            type: "POST",
            data: {pass:$('.forgot-password-container input').val()},
            success: function(results){
                alert('Success! Redirecting You Home!');   
                window.location.href = '/'
            },
            error: function(){
                alert("Something went wrong");
            }
        });   
    } else {
        alert("You didn't enter a new password");   
    }
});




$(document).mouseup(function (e){
    var container = $(".modal-information-container, .request-container, .home-header-menu-item");

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $('.modal-information-container, .request-container').fadeOut();
    }
});



//login

var login = function(){
	$('.login-alert').html('');
	$('.login-alert').hide();
	$('#submit').val('Signing in...');
	$.ajax({
		url: "/login",
		type: "POST",
		data: {email:$('#email').val(),pass:$('#pass').val()},
		success: function(results){
			if(results != 'OK'){	
				$('#submit').val('Sign In');
				$('.login-alert').html(results);
				$('.login-alert').fadeIn();
			} else {
				window.location.href = '/app'
			}
		},
		error: function(){
			alert('There was an error <br><br> Please reload the page.', false);
		}
	});
}

var signup = function(){
	$('.login-alert').html('');
	$('.login-alert').hide();
	$('#submit2').val('Signing up...');
	$.ajax({
		url: "/signup",
		type: "POST",
		data: {name:$('#name').val(),email:$('#email').val(),pass:$('#pass').val()},
		success: function(results){
			if(results != 'OK'){
				$('#submit2').val('Sign Up');
				$('.login-alert').html(results);
				$('.login-alert').fadeIn();
			} else {
				window.location.href = '/app'
			}
		},
		error: function(){
			alert('There was an error <br><br> Please reload the page.', false);
		}
	});
}

$(document).on("keypress", ".login-input", function(e){
	if (e.keyCode == 13) {
		login()
	} 
});
				

$(document).on('click', '#submit', function(){
	login()
});

$(document).on("keypress", ".signup-input", function(e){
	if (e.keyCode == 13) {
		signup()
	} 
});
				

$(document).on('click', '#submit2', function(){
	signup()
});

