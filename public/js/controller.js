/*

Copyright (c) 2013-2015 HubYard

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

//error module
var error_node = function(text){
    $('.error_message').addClass('visible');
    $('.error_message-text').html(text);
     setTimeout(
        function(){
            $('.error_message').removeClass('visible');
        }, 5000)
}



//save settings
$(document).on('click', '.save-settings-user', function () {
    $.ajax({
		url: "/settings/user",
		type: "POST",
		data: {name: $('#update_name').val(),email: $('#update_email').val(),pass: $('#update_pass').val()},
		success: function(results){

				window.location.href = '/app'
		},
		error: function(){
			error_node('There was an error <br><br> Please reload the page.');
		}
	});
});

//new tab
function OpenInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}



$(document).on('click', ' .post-extras', function(e){
    e.stopPropagation();
    $(this).parent().find('.post-extra-menu-holder').toggle();
});

$(document).on('click', ' .post-extra-menu-holder', function(e){
    e.stopPropagation();
});


//redir
$(document).on('click', '.redir', function (e) {
    if($(this).parent().parent().parent().find('.stream-header').find('.side-options').find('.change-view').data('type') !== 'reader'){
        OpenInNewTab($(this).data('href'));
    }
});



//check size
var checkval = function(num){
	if(isNaN(num) === false){
		if(num >= 1000000000){
			num = num/1000000000 + 'B'
		}else if(num >= 1000000){
			num = num/1000000 + 'M'
		} else if(num >= 1000){
			num = num/1000 + 'K'
		}
	} 
	return num;
}

var session = {};

Stripe.setPublishableKey('publish key');

var approvecard = function(callback){
    $('.payment-errors').hide();
    $('.post-card:visible').find('button').prop('disabled', true);
    Stripe.card.createToken({
      number: $('.card-number:visible').val(),
      cvc: $('.card-cvc:visible').val(),
      exp_month: $('.card-expiry-month:visible').val(),
      exp_year: $('.card-expiry-year:visible').val()
    }, function(status, response){
        
          var $form = $('.post-card:visible');
        
          if (response.error) {
            // Show the errors on the form
            $('.payment-errors').show();
            $('.payment-errors').text(response.error.message);
            $form.find('button').prop('disabled', false);
          } else {
            // response contains id and card, which contains additional card details
            var token = response.id;
            var last4oncard = $('.card-number:visible').val().substr($('.card-number:visible').length - 4);
              
            // Insert the token into the form so it gets submitted to the server
            callback({token:token, last4oncard:last4oncard});
          }
    });
}


//update card part 1
$(document).on('click', '.edit-billing, .update-card-container .x', function(e){
    $('button.save-billing').text('Update Credit Card');
    $('.upgrade-header').text('Update your credit card!');
    $('.final-purchase').text('This will replace your current card for charging.');
    $('.save-billing').data('go', 'normal');
    $('.overlay-update-card').toggle();
});

//update card part 2
$(document).on('click', '.save-billing', function(e){
    var that = this;
    approvecard(function(results){

        $.ajax({
            url: "/card",
            type: "POST",
            data: {card:results.token, last4oncard:results.last4oncard},
            success: function(data) {
                window.location.href = "/app";
            },
            error:function(data){
                alert('An error happened');   
            }
        });
    })
});


//leave upgrade
$(document).on('click', '.leave-upgrade.x', function(){
    $(this).parent().parent().hide();
});

//leave upgrade alert
$(document).on('click', '.upgrade-alert .x', function(){
    $(this).parent().hide();
});

/*

How payment will go

>click on upgrade
>check if card_token is there
>if not, ask for card
>updates card
>goes to payment


*/
//go to type of billing
$(document).on('click', '.upgrade-toggle-option', function(){
    $('.upgrade-monthly, .upgrade-yearly').hide();
    $('.upgrade-toggle-option').removeClass('selected');
    if($(this).html() === 'Monthly Billing'){
        $(this).addClass('selected');
        $('.upgrade-monthly').show();
        
    } else {
        $(this).addClass('selected');
        $('.upgrade-yearly').show();
    }
});



//new upgrade
$(document).on('click', '.upgrade-done', function(){
    session.type = $(this).data('type');
    if($('.edit-billing').data('card') === undefined && session.type !== 'enthusiast'){
        $('.save-billing').data('go', 'notnormal');
        $('.upgrade-header').text("Sweet, we'll need your payment information too!");
        $('.final-purchase').text('You will be charged ' + $(this).data('payment'));
        $('button.save-billing').text('Secure Purchase with Stripe');
        $('.overlay-update-card').show();
    } else {
        $.ajax({
            url: "/order",
            type: "POST",
            data: {type:session.type},
            success: function(data) {
                window.location.href = "/app";
            },
            error:function(data){
                alert('An error happened');   
            }
        });
    }
});

//goto upgrade
$(document).on('click', '.upgrade-user', function(){
    $('.upgrade-overlay').show();
});


//accept payment
/*var handler = StripeCheckout.configure({
    key: 'pk_test_aiA0cpAE2UUCXpR5s9uSETf6',
    token: function(token) {
    
        $.ajax({
            url: "/order",
            type: "POST",
            data: {type:session.type, card:token.id},
            success: function(data) {
                window.location.href = "/app";
            },
            error:function(data){
                alert('An error happened');   
            }
        });
    }
  });*/


$(window).on('popstate', function() {
    handler.close();
  });


//create canvas
$(document).on('click', '.create-new-canvas', function(){
    $.ajax({
		url: "/canvas/new",
		type: "POST",
		data: {name:$('#new_canvas_name').val()},
		success: function(results){
            if(results === 'nope'){
                window.location.href = '/app?upgrade=true'
            } else {
				window.location.href = '/app'
            }
			
		},
		error: function(){
			error_node('There was an error <br><br> Please reload the page.');
		}
	});
});

//save canvas
$(document).on('click', '.save-current-canvas', function (){
    $.ajax({
		url: "/canvas/save",
		type: "POST",
		data: {name:$('.update_canvas_name:visible').val(), id:$(this).data('id')},
		success: function(results){
            window.location.href = '/app'
		},
		error: function(){
			error_node('There was an error <br><br> Please reload the page.');
		}
	});
});

//outer HTML
jQuery.fn.outerHTML = function(s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};

//delete canvas
$(document).on('click', '.delete-current-canvas', function(){
    $.ajax({
		url: "/canvas/delete",
		type: "POST",
		data: {id:$(this).data('id')},
		success: function(results){
				window.location.href = '/app';
			
		},
		error: function(){
			error_node('There was an error <br><br> Please reload the page.');
		}
	});
});

//delete network
$(document).on('click', '.delete-current-network', function(){
    $.ajax({
		url: "/network/delete",
		type: "POST",
		data: {id:$(this).data('id')},
		success: function(results){
				window.location.href = '/app'
			
		},
		error: function(){
			error_node('There was an error <br><br> Please reload the page.');
		}
	});
});

//add a new member to canvas
$(document).on("keypress", ".add-new-member", function(e){
    var that = this;
	if (e.keyCode == 13) {
		$.ajax({
            url: "/canvas/add/user",
            type: "POST",
            data: {email:$(this).val(), id:$(this).data('id')},
            success: function(results){
                if(typeof results === 'string'){
                    $('.error-block').addClass('visible');
                    $('.error-block').text(results)
                } else {
                    $('.error-block').addClass('visible');
                    $('.error-block').text('Added!')
                    var html = '';
                    html += '<div class="member-block">'
                    html += '<div class="member-text">' + results.email + '</div>'
                    html += '<div class="member-remove" data-id="' + results.id + '">x</div>'
                    html += '<div class="clear"></div>'
                    html += '</div>'
                    $(that).parent().parent().find('.settings-block').append(html);
                    setTimeout(
                    function(){
                        $('.error-block').removeClass('visible');
                    }, 2000)
                }   
            },
            error: function(){
                error_node('There was an error <br><br> Please reload the page.');
            }
        });
	} 
});

//add a new member to canvas
$(document).on("click", ".member-remove", function(e){
    var that = this;
    $.ajax({
        url: "/canvas/delete/user",
        type: "POST",
        data: {user_id:$(this).data('id'), id:$(this).parent().data('id')},
        success: function(results){
            $('.error-block').addClass('visible');
            $('.error-block').text('Removed!') 
            setTimeout(
            function(){
                $('.error-block').removeClass('visible');
            }, 2000)
            $(that).parent().remove();
        },
        error: function(){
            error_node('There was an error <br><br> Please reload the page.');
        }
    });
});

//create a new stream
$(document).on('click', '.add-new-rss-link, .news-option', function(){
    if($('.switch-canvas.selected').data('id') !== undefined){
        var query = $(this).parent().find('input').val() || $(this).data('url');
        var user = $(this).html();
        if(user === 'Add New Stream'){
            user = 'Custom RSS';   
        }
        $.ajax({
            url: "/stream/new",
            type: "POST",
            data: {service:'RSS', type:'RSS', id:$('.switch-canvas.selected').data('id'), user:user, network_id:'RSS', query:query},
            success: function(results){
                if(results === 'nope'){
                    window.location.href = '/app?upgrade=true'
                } else {
                    window.location.href = '/app'
                }
            },
            error: function(){
                error_node('There was an error <br><br> Please reload the page.');
            }
        });
    } else {
        error_node('Please create a canvas or select an existing canvas first!');
        $('.overlay-new-canvas').show();
        $('.overlay-new-newsorrss').hide();
        
    }
});

//create a new stream
$(document).on('click', '.new-stream', function(){
    if($('.switch-canvas.selected').data('id') !== undefined){
        var query = $(this).parent().find('input').val() || undefined;
        $.ajax({
            url: "/stream/new",
            type: "POST",
            data: {service:$(this).data('service'), type:$(this).data('type'), id:$('.switch-canvas.selected').data('id'), user:$(this).data('user'), network_id:$(this).data('network_id'), query:query},
            success: function(results){
                    window.location.href = '/app'

            },
            error: function(){
                error_node('There was an error <br><br> Please reload the page.');
            }
        });
    } else {
        $('.overlay-networks').hide();
        error_node('Please create a canvas or select an existing canvas first!');
        $('.overlay-new-canvas').show();
    }
});



//remove a  stream
$(document).on('click', '.remove-stream', function(){
    $.ajax({
		url: "/stream/delete",
		type: "POST",
		data: {stream_id:$(this).data('id'), service:$(this).data('service'), id:$('.switch-canvas.selected').data('id')},
		success: function(results){
            $('#' + results.id).remove();
		},
		error: function(){
			error_node('There was an error <br><br> Please reload the page.');
		}
	});
});

//change the stream appearance
$(document).on('click', '.change-view', function(){
    var type = $(this).data('type');
    var newtype = 'default';
    if(type === 'default'){
       newtype = 'images';    
    } else if(type === 'images'){
        newtype = 'reader';
    } else if(type === 'reader'){
        newtype = 'default';
    }
    $('#' + $(this).data('id')).removeClass('setup-' + type);
    $('#' + $(this).data('id')).addClass('setup-' + newtype);
    $(this).data('type', newtype);
    $.ajax({
		url: "/stream/appearance",
		type: "POST",
		data: {stream_id:$(this).data('id'), change:newtype, service:$(this).data('service'), id:$('.switch-canvas.selected').data('id')},
		success: function(){
            //
		},
		error: function(){
			error_node('There was an error <br><br> Please reload the page.');
		}
	});
});

//open save settings

$(document).on('click', '.account-settings', function(){
    $('.overlay-setting-options').hide();
    $('.overlay-settings').toggle();
    
});

$(document).on('click', '.open-setting-options', function(){
    $('.overlay-settings').hide();
    $('.overlay-setting-options').toggle();
    
});





$(document).on('click', '.minimize-width', function(){
    $('sidebar').animate({width:'toggle'});
    if($('.canvas').width() === ($(window).width() - 315)){
        $('.canvas').animate({left:60})
        $('.canvas').css('width', 'calc(100% - 60px)');
     } else {
        $('.canvas').animate({left:315})
        $('.canvas').css('width', 'calc(100% - 315px)');
     }
});


$(document).on('click', '.add-new-canvas, .no-tutorial', function(){
    $('.overlay-new-canvas').toggle();
});



//tutorial
$(document).on('click', '.tutoral-next', function(e){
    if($(this).data('next') !== 'done'){
        $(this).parent().parent('.tutorial_object').hide();
         $('.tutorial_' + $(this).data('next')).show();
    } else {
        $('.tutorial_object').hide();
        $('.overlay-new-canvas').show();
    }
   
    
});


$(document).on('click', '.partition-settings', function(e){
    if($(this).parent().find('.overlay').find('.overlay-arrow').is(':visible') === true){
        
        $('.overlay').hide();
        $(this).parent().find('.overlay').show();
    } else {
        $('.overlay').hide();
    }
    $(this).parent().find('.overlay').toggle();
});




$(document).on('click', '.add-new-network', function(e){
  
    $('.overlay-new-network').toggle();
});

$(document).on('click', '.add-new-newsorrss', function(e){
  
    $('.overlay-new-newsorrss').toggle();
});

$(document).on('click', '.post-comment', function(e){
    var stream_id = $(this).parent().parent().parent().parent().parent().parent().parent().data('id');
    $('#comment_' + stream_id).animate({width:'toggle'});
    $('.stream-content-comment-content').html($(this).parent().parent().parent().parent().outerHTML());
    if($(this).data('service') === 'twitter'){
        $('.stream-content-comment-input textarea').val($(this).parent().parent().parent().find('.post-header').find('.post-header-username').text() + ' ');
    }
});


$(document).on('keyup', '.stream-content-comment-input textarea', function(e){
    $('#comment_chars').text(encodeURI($('.stream-content-comment-input textarea').val()).replace(/%20/g, ' ').length);
});

$(document).on('click', '.stream-content-return', function(e){
    $(this).parent().parent().animate({width:'toggle'});
});

$(document).on('click', '.post-header', function(e){
    var that = this;
    var user_id = $(this).data('user_id');
    var network_id = $(this).parent().parent().data('network_id');
    var stream_id = $(this).parent().parent().parent().parent().parent().data('id');
    var type = $(this).data('type');

    if(network_id !== 'RSS'){
        $('#user_' + stream_id).animate({width:'toggle'});
        $('.stream-content-user-stats').html('');
        $('.stream-content-user-picture').html('LOADING CONTENT!!');
        $('.stream-content-user-name').html('');
        $('.stream-content-user-details').html('');

        $.ajax({
            url: "/post/details",
            type: "POST",
            data: {user_id:user_id, network_id:network_id, type:type},
            success: function(results){
                var service = results.service;

                var results = results.data;
                var o = {};

                if(service === 'twitter'){
                    o.picture = results.profile_image_url;
                    o.name = results.name;
                    o.username = '@' + results.screen_name
                    o.bio = results.description || "A twitter user"
                    o.url = results.url || "http://twitter.com/" + o.username
                    o.real = "http://twitter.com/" + o.username;
                    o.stats = [];
                    o.stats[0] = {count:results.followers_count, name:'followers'}
                    o.stats[1] = {count:results.friends_count, name:'following'};
                } else if(service === 'instagram'){
                    o.picture = results.profile_picture;
                    o.name = results.full_name;
                    o.username = '@' + results.username
                    o.bio = results.bio || "A instagram user"
                    o.url = results.website || "http://instagram.com/" + results.username
                    o.real = "http://instagram.com/" + o.username;
                    o.stats = [];
                    o.stats[0] = {count:results.counts.followed_by, name:'followers'}
                    o.stats[1] = {count:results.counts.follows, name:'following'};
                } else if(service === 'product hunt'){
                    o.picture = results.image_url.original;
                    o.name = results.name;
                    o.username = '@' + results.username
                    o.bio = results.bio || "A Product Hunt User"
                    o.url = results.website || "http://producthunt.com/" + results.username
                    o.real = "http://producthunt.com/" + o.username;
                    o.stats = [];
                    o.stats[0] = {count:results.votes_count, name:'upvotes'}
                    o.stats[1] = {count:results.maker_of_count, name:'created'};
                    o.stats[2] = {count:results.posts_count, name:'submitted'};
                    o.stats[3] = {count:results.followers_count, name:'followers'};
                    o.stats[4] = {count:results.followings_count, name:'following'};
                } else if(service === 'dribbble'){

                    o.picture = results.avatar_url;
                    o.name = results.name;
                    o.username = '@' + results.username
                    o.bio = results.bio || "A Dribbble User"
                    o.url = results.links.web || "http://dribbble.com/" + results.username
                    o.real = "http://dribbble.com/" + o.username;
                    o.stats = [];
                    o.stats[0] = {count:results.buckets_count, name:'buckets'}
                    o.stats[1] = {count:results.shots_count, name:'shots'};
                    o.stats[2] = {count:results.projects_count, name:'projects'};
                    o.stats[3] = {count:results.followers_count, name:'followers'};
                    o.stats[4] = {count:results.followings_count, name:'following'};
                }

                $('.stream-content-user-picture').html("<img src='" + o.picture + "'>");
                $('.stream-content-user-name').html("<a class='post-header-user'>" + o.name + "</a> <a class='post-header-username'>" + o.username + "</a>");
                ///<a target='_blank' style='font-size:12px' href='"+ o.real + "'>(Original Webpage)</a>
                $('.stream-content-user-details').html(o.bio + '<div style="margin:5px 0px;">' + linkify(o.url) + '</div>');

                for(var i = 0; i < o.stats.length; i++){
                    $('.stream-content-user-stats').append("<div class='stats-box'>"  +o.stats[i].name + " <div class='user-stats' > " + checkval(o.stats[i].count) + "</div></div>");   
                    if(i === o.stats.length - 1){
                        $('.stream-content-user-stats').append("<div class='clear'></div>")
                    }
                }

            },
            error: function(){

            }
        });
    }
});

$(document).on('click', '.switch-canvas .partition-icon, .switch-canvas .partition-text', function(e){
    $.ajax({
		url: "/canvas/switch",
		type: "POST",
		data: {id:$(this).parent().index()},
		success: function(results){
            window.location.href = '/app'
		},
		error: function(){
			error_node('There was an error <br><br> Please reload the page.');
		}
	});
});

$(document).on('click', '.delete-account', function(e){
    $.ajax({
		url: "/delete/account",
		type: "POST",
		success: function(results){
            alert('Bye Bye... :(');
            window.location.href = '/'
		},
		error: function(){
			error_node('There was an error <br><br> Please reload the page.');
		}
	});
});

$(document).on('click', '.post-actions .post-action, .stream-comment-post .post-action', function(e){
    var that = this;
    var post_id = $(this).parent().parent().parent().parent().data('post_id');
    var post_id_additional = $(this).parent().parent().parent().parent().data('post_id_additional') || '';
    var network_id = $(this).parent().parent().parent().parent().data('network_id');
    var type = $(this).data('type');
    var text = undefined;
    if(type === 'comment'){
        text = encodeURI($('.stream-content-comment-input textarea').val()).replace(/%20/g, ' ');
        network_id = $('.stream-content-comment-content .post').data('network_id');
        post_id = $('.stream-content-comment-content .post').data('post_id');
    }

    $.ajax({
		url: "/post/action",
		type: "POST",
		data: {post_id:post_id, network_id:network_id, type:type, text:text, post_id_additional:post_id_additional},
		success: function(results){
            var type = results.type;
            $(that).data('type', type);
            if(type === 'unheart'){
                $(that).css('color', '#F26D7D');
            } else if(type === 'heart'){
                $(that).css('color', '#B6B6B6');
            } else if(type === 'retweet'){
                $(that).css('color', '#297848');
            } else if(type === 'comment'){
                $(that).css('background', '#597287');
                $(that).text('Posted!')
            }
            
		},
		error: function(){
			
		}
	});
});


//turn text 2 links
function linkify(text) {  
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
    return text.replace(urlRegex, function(url) {  
            return '<a target="_blank" href="' + url + '">' + url + '</a>';  
        })  
}

var projectpost = function(data, service, network_id){   
    var post = "<div class='post' data-service='" + service + "' data-network_id='"+ network_id + "' data-post_id='"+ data.id + "' ";
    
    if(data.id_m){
        post += "data-post_id_additional='" + data.id_m + "' ";
    }
    
    post += ">";
    if(data.user.picture){
        post += "<div class='post-left'><img class='post-user-picture' src='" + data.user.picture + "'></div>";
        post += "<div class='post-right'>";
    } else {
        post += "<div>";
    }
    
    post += "<div class='post-header' data-type='user' data-user_id='" + data.user.id + "'><a class='post-header-user'>" + data.user.name + "</a> <a class='post-header-username'>" + data.user.username + "</a></div>";
    
    
    post += "<div class='post-content'><div class='post-content-text'>" + data.text + "</div>";
    if(data.specialtext){
        post += "<div class='post-content'><div class='special-text post-content-text'>" + data.specialtext + "</div>";
    }
    
    if(data.video){
        post += "<div class='post-content-image'>"
        post += "<video controls src='" + data.video +"'>";
        post += "</div>"
    }
    if(data.embed){
        post += "<div class='post-content-image'>"
        post += data.embed;
        post += "</div>" 
    }
    if(data.specialpicture){
        post += "<img class='reader-close' src='" + data.specialpicture +"'>";
    }
    if(data.picture){
        post += "<div class='post-content-image'>"
        if(data.imageurl){
            post += "<a target='_blank' href='"+data.imageurl+"'>"; 
            post += "<img src='" + data.picture +"'>";
            post += "</a>";
        } else {
            post += "<img  src='" + data.picture +"'>";
        }
        post += "</div>"
    } else if(data.photoset){
        post += "<div class='post-content-image'>"
            $.each( data.photoset, function( x, e ) {  
                post += "<img src='" + data.photoset[x] +"'>";
            })
        post += "</div>"
    }
    post += "<div class='post-actions'>";
    
    for(var i = 0; i < data.actions.length; i++){
        post += "<a class='icon-" + data.actions[i] + " post-action' data-type='" + data.actions[i] + "'></a>"
        if( i === (data.actions.length -1)){
            if(data.comment){
               post += "<a class='icon-reply post-comment' data-service='" + service + "'></a>" 
            }
            
            post += "<a class='icon-dot-3 post-extras'></a>" 
            post += "<div class='post-extra-menu-holder'><div class='post-extra-menu-arrow'></div><div class='post-extra-menu'>"
            post += "<a href='" + data.url + "' target='_blank'><div class='post-extra-menu-item'>Original Post</div></a>"
            post += "<a href='mailto:?body=" + data.url + "'><div class='post-extra-menu-item'>Email Post</div></a>"
            post += "</div>"
            post += "</div></div></div></div><div class='clear'></div></div>"
            return post;
        }
    }
}

var pushposts = function(results){
    switch(results.service) {
        case 'twitter': 
            var d = {};
            
            if(results.data.statuses){
                
              d = results.data.statuses;
            } else {
             d = results.data;
            }
            if(d.length){
                for(var i = 0; i < d.length; i++){
                    var o = d[i];
                    var data = {};
                    data.user = {};
                    data.user.name = o.user.name;
                    data.user.id = o.user.id;
                    data.id = o.id_str;
                    data.user.picture = o.user.profile_image_url;
                    data.user.username = '@' + o.user.screen_name;
                    data.text = linkify(o.text);
                    data.url = 'http://twitter.com/a/status/' + o.id_str;
                    data.comment = true;
                    if(o.entities !== undefined && o.entities.media !== undefined && o.entities.media[0].media_url){

                        if(o.entities.media.length === 1){
                            data.picture = o.entities.media[0].media_url;
                        } else {
                            $.each( o.entities.media, function( x, e ) {  
                                if(o.entities.media[x].media_url){
                                    data.photoset[x] =  o.entities.media[x].media_url
                                }; 
                            });
                        }
                    }
                    data.actions = ['heart', 'retweet']
                    $('#' + results.id + " .stream-content .stream-content-layer").append(projectpost(data, results.service, results.network_id));
                    $('#' + results.id).data('pageation_id', o.id_str);
                    if(i === (d.length - 1)){
                        $('#' + results.id + " .stream-content .stream-content-layer").append('<div class="clear"></div>');
                        $('#' + results.id + " .stream-content").data('active', 'no');
                    }
                };
            } else {
                 $('#' + results.id + " .stream-content .stream-content-layer").html("<div class='error-something'>Something went wrong, you probably exceeded your rate limit. <br><br> This means that you're refreshing too much, wait around 5 minutes to see this feed again. <br><br> <b> Sorry ! </b></div>");
            }
        break;
        case 'tumblr': 
            var d = {};
            
            if(results.data.response){
                d = results.data.response.posts;
            } else {
                d = results.data.posts;
            }
       
            for(var i = 0; i < d.length; i++){
                
                var o = d[i];
                if(o.type !== 'chat'){
                var data = {};
                data.user = {};
                data.user.name = o.blog_name;
                data.user.id = o.blog_name + '.tumblr.com';
                data.id = o.id;
                data.id_m = o.reblog_key;
                data.user.username = o.blog_name;
                if(o.type === 'text'){
                    if(o.title){
                        data.text = "<a style='font-weight:bold'>" + o.title + "</a> <br> " + o.body;
                    } else {
                        data.text = o.body;
                    }
                } else if(o.type === 'photo') {
                    data.text = o.caption || '';
                    data.photoset = [];
                    $.each( o.photos, function( x, e ) {  
                        data.photoset[x] = o.photos[x].alt_sizes[0].url; 
                    });
                } else if(o.type === 'video'){
                    data.text = o.caption || '';
                   data.video =  o.video_url;
                } else if(o.type === 'audio'){
                    data.text = o.caption || '';
                   data.embed =  o.player;
                } else if(o.type === 'quote'){
                   data.text = "<a href='"+ o.source_url + "' style='font-weight:bold'>" + o.source_title + "</a> <br> " +  o.text;
                } else if(o.type === 'link'){
                   data.text = "<a href='"+ o.url + "' style='font-weight:bold'>" + o.title + "</a> <br> " +  o.description;
                }  else if(o.type === 'answer'){
                   data.text = "<a style='font-weight:bold'>" + o.question + "</a> <br> " +  o.answer;
                }
                data.url = o.post_url;
                data.comment = true;
                data.actions = ['heart', 'retweet', 'back-in-time']
                $('#' + results.id + " .stream-content .stream-content-layer").append(projectpost(data, results.service, results.network_id));
                $('#' + results.id).data('pageation_id', o.id_str);
                
                }
                if(i === (d.length - 1)){
                    $('#' + results.id + " .stream-content .stream-content-layer").append('<div class="clear"></div>');
                    if($('#' + results.id).data('pageation_id')){
                        $('#' + results.id).data('pageation_id', ($('#' + results.id).data('pageation_id') + 19));
                    } else {
                        $('#' + results.id).data('pageation_id', 19)
                    }
                    $('#' + results.id + " .stream-content").data('active', 'no');
                }
            };
        break;
        case 'instagram': 
            var d = {};
            d = results.data;

            for(var i = 0; i < d.length; i++){
                var o = d[i];
                var data = {};
                data.user = {};
                data.user.name = o.user.username;
                data.user.id = o.user.id;
                data.id = o.id;
                
                data.url = o.link;
                data.user.picture = o.user.profile_picture;
                data.user.username = '@' +  o.user.full_name;
                if(o.caption){
                    data.text = linkify(o.caption.text) || '';
                } else {
                    data.text = '';
                }
                data.comment = false;
                if(o.videos !== undefined && o.videos.standard_resolution !== undefined){
                   data.video =  o.videos.standard_resolution.url;
                } else if(o.images !== undefined && o.images.standard_resolution !== undefined){
                    data.picture = o.images.standard_resolution.url;
                }
                data.actions = ['heart']
                
                $('#' + results.id + " .stream-content .stream-content-layer").append(projectpost(data, results.service, results.network_id));
                $('#' + results.id).data('pageation_id', o.id);
               

                if(i === (d.length - 1)){
                    $('#' + results.id + " .stream-content .stream-content-layer").append('<div class="clear"></div>');
                    $('#' + results.id + " .stream-content").data('active', 'no');
                }
            };
        break;
        case 'product hunt': 
            var d = {};
            d = results.data.posts;
  
            for(var i = 0; i < d.length; i++){
                var o = d[i];
                var data = {};
                data.user = {};
                data.user.name = o.name;
                data.user.id = o.user.id;
                data.id = o.id;
                data.url = o.discussion_url;
                data.user.username = ' via ' +  o.user.name;
                data.text = o.tagline;
                data.comment = false;
                
    
                if(o.screenshot_url !== undefined ){
                    data.picture = o.screenshot_url['850px'];
                    data.imageurl = o.redirect_url;
                }
                data.actions = ['']
                
                $('#' + results.id + " .stream-content .stream-content-layer").append(projectpost(data, results.service, results.network_id));
                
               

                if(i === (d.length - 1)){
                    $('#' + results.id + " .stream-content .stream-content-layer").append('<div class="clear"></div>');
                    if($('#' + results.id).data('pageation_id')){
                        $('#' + results.id).data('pageation_id', ($('#' + results.id).data('pageation_id') + 1));
                    } else {
                        $('#' + results.id).data('pageation_id', 1)
                    }
                    $('#' + results.id + " .stream-content").data('active', 'no');
                }
            };
        break;
        case 'facebook page': 
            var d = {};
            d = results.data.data;
            
            for(var i = 0; i < d.length; i++){
                
                var o = d[i];
               
                    var data = {};
                    data.user = {};
                    data.user.name = o.from.name;
                    data.user.id = o.from.id;
                    data.id = o.id;
                    data.url = o.id.split('_')[1];
                    data.user.username = '';
                    data.text = o.story || o.message || '';
                    if(o.actions !== undefined && o.actions[0] !== undefined && o.actions[0].name === 'Comment'){
                        data.comment = true;
                    } else {
                        data.comment = false;
                    }
                    if(o.actions !== undefined && o.actions[1] !== undefined && o.actions[1].name === 'Like'){
                        data.actions = ['heart']
                    } else if(o.actions !== undefined && o.actions[0] !== undefined && o.actions[0].name === 'Like'){
                        data.actions = ['heart']
                    } else {
                        data.actions = ['']
                    }
                    

                    if(o.picture !== undefined ){
                        data.embed = '<img style="width:130px" src="' + o.picture + '">';
                    }
                    

                    $('#' + results.id + " .stream-content .stream-content-layer").append(projectpost(data, results.service, results.network_id));



                    if(i === (d.length - 1)){
                        $('#' + results.id + " .stream-content .stream-content-layer").append('<div class="clear"></div>');
                        $('#' + results.id).data('pageation_id', results.data.paging.next)
                        $('#' + results.id + " .stream-content").data('active', 'no');
                    }
            };
        break;
        case 'dribbble': 
            var d = {};

            d = results.data;
            
            for(var i = 0; i < d.length; i++){
                var o = d[i];
                var data = {};
                data.user = {};
                data.user.name = o.title;
                data.user.id = o.user.id;
                data.id = o.id;
                data.url = o.html_url;
                data.user.username = ' by ' +  o.user.name;
                data.text = o.description || '';
                data.comment = false;
                
    
                if(o.images !== undefined ){
                    data.picture = o.images.normal;
                    data.imageurl = o.html_url;
                }
                data.actions = ['heart']
                
                $('#' + results.id + " .stream-content .stream-content-layer").append(projectpost(data, results.service, results.network_id));
                
               

                if(i === (d.length - 1)){
                    $('#' + results.id + " .stream-content .stream-content-layer").append('<div class="clear"></div>');
                    if($('#' + results.id).data('pageation_id')){
                       $('#' + results.id).data('pageation_id', moment(moment($('#' + results.id).data('pageation_id'), 'YYYY-MM-DD').subtract(1, 'days')).format('YYYY-MM-DD'));
                    } else {
                       $('#' + results.id).data('pageation_id', moment(moment().subtract(1, 'days')).format('YYYY-MM-DD'));
                    }
                    
                    $('#' + results.id + " .stream-content").data('active', 'no');
                }
            };
        break;
        case 'RSS': 
            var d = {};
            $('#' + results.id + " .stream-header .stream-title a:eq(0)").html(results.data.title);
            $('#' + results.id + " .stream-header .stream-title .subdata").css('text-transform', 'none');
            d = results.data.entries;
            
            for(var i = 0; i < d.length; i++){
                var o = d[i];
                var data = {};
                data.user = {};
                data.user.name = o.author;
                data.user.id = '';
                data.id = o.author;
                data.url = o.link;
                data.user.username = ''
                
                data.disableauthor = true;
                
                data.text = '';
                if(o.title){
                    data.text = o.title 
                }
                if(o.content){
                data.specialtext = o.content;
                } else if(o.contentSnippet){
                data.specialtext = o.contentSnippet;
                }
                
                if(o.content){
                    var s = o.content;
                    var m = s.match(/src="(.*?)"/);
                    if(m && m[0]){
                    data.specialpicture = m[0].toString().replace(/src="/g,"").replace(/"/g,"")
                    }
                }
                
                data.comment = false;
                
    

                data.actions = ['']
                
                $('#' + results.id + " .stream-content .stream-content-layer").append('<div class="redir" data-href="' + data.url + '">' + projectpost(data, results.service, results.network_id) + '</div>');
                
               

                if(i === (d.length - 1)){
                    $('#' + results.id + " .stream-content .stream-content-layer").append('<div class="clear"></div>');
                    $('#' + results.id + " .stream-content").data('active', 'yes');
                }
            };
        break;
        }
    
}


//start operations get posts
var getposts = function(){
    $('.stream-content-layer').html('')
    for(var i = 0; i < $('.canvas.selected .stream').length; i++){
        $.ajax({
            url: "/stream/collect",
            type: "POST",
            data: {service:$('.canvas.selected .stream:eq(' + i + ')').data('service'), type:$('.canvas.selected .stream:eq(' + i + ')').data('type'), network_id:$('.canvas.selected .stream:eq(' + i + ')').data('network_id'), query:$('.canvas.selected .stream:eq(' + i + ')').data('query'), id:$('.canvas.selected .stream:eq(' + i + ')').data('id')},
            success: function(results){
                
                pushposts(results);
            },
            error: function(){
                error_node('There was an error <br><br> Please reload the page.');
            }
        });
    }    
}

$(document).on('click', '.reset-stream', function(){
    var id = $(this).data('id');
    $.ajax({
        url: "/stream/collect",
        type: "POST",
        data: {service:$('#' + id).data('service'), type:$('#' + id).data('type'), network_id:$('#' + id).data('network_id'), query:$('#' + id).data('query'), id:$('#' + id).data('id')},
        success: function(results){
            $('#' + id +' .stream-content .stream-content-layer').html('')
            pushposts(results);
        },
        error: function(){
            error_node('There was an error <br><br> Please reload the page.');
        }
    });
    
});




$(document).ready(function(){
    getposts();   
    
    //sortable
    $( ".canvas.selected" ).sortable({      
        items: ".stream",      
        handle: ".stream-header", 
        update:function(){
            var ids = [];
            $('.canvas.selected .stream').each(function(){
                 ids[ids.length] = $(this).data('id');
                
            });
            
            $.ajax({
                url: "/stream/saveposition",
                type: "POST",
                data: { id:$('.canvas:visible').data('id'), ids:ids.toString()},
                success: function(results){
                    
                },
                error: function(){
                    error_node('There was an error <br><br> Please reload the page.');
                }
            });
        }   
    });
    
    var refreshpage = setInterval(function(){
       getposts();
     }, 250000);

    $('.stream-content').scroll(function(){
        clearInterval(refreshpage);
        refreshpage = setInterval(function(){
               getposts();
         }, 250000);
     });
    
    $('.stream-content').scroll(function(){
       if($(this).scrollTop() + $(this).height() > $(this).find('.stream-content-layer').height() - 100) {
           if($(this).data('active') !== 'yes'){
                $(this).data('active', 'yes');
                $.ajax({
                    url: "/stream/collect",
                    type: "POST",
                    data: {service:$(this).parent().data('service'), type:$(this).parent().data('type'), network_id:$(this).parent().data('network_id'), query:$(this).parent().data('query'), id:$(this).parent().data('id'), pageation_id:$(this).parent().data('pageation_id')},
                    success: function(results){
                        pushposts(results);
                    },
                    error: function(){
                        error_node('There was an error <br><br> Please reload the page.');
                    }
                });
           }
       }
    });
    
    
    
    
    

    
    
    
    /*$('.canvas:visible').sortable({
        handle: '.stream-header',
        items: '.stream'
    }).bind('sortupdate', function(e, ui) {
        var ids = [];
        $('.canvas.selected .stream').each(function(){
             ids[ids.length] = $(this).data('id');
        });
        $.ajax({
            url: "/stream/saveposition",
            type: "POST",
            data: {ids:ids, id:$('.canvas:visible').data('id')},
            success: function(results){
                //
            },
            error: function(){
                error_node('There was an error <br><br> Please reload the page.');
            }
        });
        
    });*/
    
});

//when user leaves something
$(document).mouseup(function (e){
    var container = $(".add-new-network, .overlay-new-network");

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $('.overlay-new-network').hide();
    }
});

//when user leaves something
$(document).mouseup(function (e){
    var container = $(".add-new-newsorrss, .overlay-new-newsorrss");

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $('.overlay-new-newsorrss').hide();
    }
});

//when user leaves something
$(document).mouseup(function (e){
    var container = $(".add-new-canvas, .overlay-new-canvas");

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $('.overlay-new-canvas').hide();
    }
});

$(document).mouseup(function (e){
    var container = $(".header-option-button, .overlay-setting-options");

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $('.overlay-setting-options').hide();
    }
});

//when user leaves something
$(document).mouseup(function (e){
    var container = $(".switch-canvas .partition-settings, .overlay-canvas");
    
    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $('.overlay-canvas').hide();
    }
});

$(document).mouseup(function (e){
    var container = $(".account-item .partition-settings, .overlay-networks");
    
    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $('.overlay-networks').hide();
    }
});

$(document).mouseup(function (e){
    var container = $(".switch-canvas .partition-settings, .overlay-canvas");
    
    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $('.overlay-canvas').hide();
    }
});


//explode image
$(document).on('click', '.post-content-image img, .post-content img', function(){
    if($(this).parent('a').attr('href') !== undefined){
    } else {
        $('.exploded-image-container').animate({opacity:'show'});
        $('.exploded-image').attr('src', $(this).attr('src'));
    }
});

$(document).mouseup(function (e){
    var container = $(".exploded-image");
    
    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $('.exploded-image-container').animate({opacity:'hide'});
    }
});

