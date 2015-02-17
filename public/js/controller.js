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

//validate email
var validateEmail = function(e)
{
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(e);
}

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
    if(validateEmail($('#update_email').val()) === true){
        $.ajax({
            url: "/settings/user",
            type: "POST",
            data: {name: $('#update_name').val(),email: $('#update_email').val(),pass: $('#update_pass').val()},
            success: function(results){

                    window.location.href = '/app'
            },
            error: function(results){
                if(results.responseText){
                    error_node(results.responseText);   
                } else {
                    error_node('there was some error');   
                }
            }
        });
    } else {
        error_node('Enter a valid email!');
    }
});

//new tab
function OpenInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}



$(document).on('click', ' .post-extras', function(e){
    e.stopPropagation();
    if($(this).parent().find('.post-extra-menu-holder').is(':visible') === true){
        $('.post-extra-menu-holder').hide();
    } else {
        $('.post-extra-menu-holder').hide();
        $(this).parent().find('.post-extra-menu-holder').show();
    }
});

$(document).on('click', ' .post-extra-menu-holder', function(e){
    e.stopPropagation();
});

$(document).on('click', ' .more-stuff', function(e){
    $('.orbs').toggle();
});

$(document).on('click', ' #orb_whatisthis, #item_whatisthis .modal-quit', function(e){
    $('#item_whatisthis').toggle();
});


 

//redir
$(document).on('click', '.redir', function (e) {
    e.stopPropagation();
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

Stripe.setPublishableKey('');

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
    if(validateEmail($('#confirm_email').val()) === true){
        $('button.save-billing').text('Update Credit Card');
        $('.upgrade-header').text('Update your credit card!');
        $('.final-purchase').text('This will replace your current card for charging.');
        $('.save-billing').data('go', 'normal');
        $('.overlay-update-card').toggle();
    } else {
        $('#item_noemail').show();
    }
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

$(document).on('click', '.button-nevermind', function(){
    session.type = undefined;
    $('.upgrade-finish-overlay').hide();
});

//new upgrade
$(document).on('click', '.upgrade-done', function(){
    session.type = $(this).data('type');
    $('.purchase-final').text($(this).data('payment'));
    $('.upgrade-finish-overlay').show();
});

//upgrade final
$(document).on('click', '.upgrade-finish', function(){
    if($('.edit-billing').data('card') === undefined && session.type !== 'enthusiast'){
        $('.save-billing').data('go', 'notnormal');
        $('.upgrade-header').text("Sweet, we'll need your payment information too!");
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
    if(validateEmail($('#confirm_email').val()) === true){
        $('.upgrade-overlay').show();
    } else {
        $('#item_noemail').show();
    }
});

$(document).on('click', '#item_noemail .modal-quit', function(e){
    $('#item_noemail').hide();
});



//accept payment
/*var handler = StripeCheckout.configure({
    key: '',
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


var newstream = function(data){
        data.type = data.type || '';
        data.query = data.query || '';
    var html = '';
        html += '<div data-id="'+ data.id +'" id="'+data.id +'" data-service="'+data.service +'" data-network_id="'+data.network_id +'" data-type="'+data.type +'" data-query="'+data.query +'" class="stream setup-default">'
        html += '<div class="stream-header">'
        html += '<div class="stream-title">'
        html += '<a style="font-weight:bold">@'+data.user +'</a> <a class="subdata">'+data.service +' '
        if(data.query !== ''){
        html += data.query
        } else {
        html += data.type.replace(/_/g," "); 
        }
        html += '</a></div>'
        html += '<div class="side-options"><a data-id="'+data.id +'" data-service="'+data.service +'" data-type="'+data.type +'" class="change-view icon-eye"></a><a data-id="'+data.id +'" data-service="'+data.service +'" class="reset-stream icon-ccw"><a data-id="'+data.id +'" data-service="'+data.service +'" class="remove-stream icon-cancel"></a></div>'
        html += '</div>'
        html += '<div id="comment_'+data.id +'" class="stream-content-comment">'
        html += '<div class="stream-layer">'
        html += '<div>'
        html += '<div class="stream-content-return icon-right-open">Return</div>'
        html += '</div>'
        html += '<div class="stream-content-comment-content-full">'
        html += '<div class="stream-content-comment-content"></div>'
        html += '<div class="stream-content-comment-input">'
        html += '<textarea placeholder="Respond to this user!"></textarea>'
        html += '</div>'
        html += '<div class="stream-content-comment-footer">'
        html += '<div class="stream-comment-characters"><a id="comment_chars">0</a> Characters</div>'
        html += '<div class="stream-comment-post">'
        html += '<div data-type="comment" class="button-line overlay-block-button post-action">Post</div>'
html += '</div>'
        html += '<div class="clear"></div>'
        html += '<div class="stream-content-comments" id="comments_' + data.id + '">';
        html += '</div>'
        html += '</div>'
        html += '</div>'
        html += '</div>'
        html += '</div>'
        html += '<div id="user_'+data.id +'" class="stream-content-user">'
        html += '<div class="stream-layer">'
        html += '<div class="stream-user">'
        html += '<div class="stream-content-return icon-right-open">Return</div>'
        html += '<div class="stream-content-head">'
        html += '<div class="stream-content-user-picture"></div>'
        html += '<div class="stream-content-user-name"></div>'
        html += '<div class="clear"></div>'
        html += '</div>'
        html += '<div class="stream-content-user-details"></div>'
        html += '<div class="stream-content-user-stats"></div>'
        html += '<div class="width-burn"></div>'
        html += '</div>';
        html += '<div id="user_own_'+data.id +'" class="stream-user-content-feed">'
        html += '<div class="stream-content">'
        html += '<div class="stream-content-layer"> </div>'
        html += '</div>'
        html += '</div>'
        html += '</div>'
        html += '</div>'
        html += '<div class="stream-content">'
        html += '<div class="stream-content-layer"> </div>'
        html += '</div>'
        html += '</div>'
        
        $('.canvas').append(html);
        checkscroll('#' + data.id + '  > .stream-content');
        reset_stream(data.id);
        $('.overlay-new-newsorrss, .overlay-networks').css('display', 'none');
}

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
                    newstream(results);
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
                newstream(results);

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

    $('.overlay-settings').toggle();
    
});

$(document).on('click', '.open-setting-options', function(){
    $('.overlay-settings').hide();
    $('.overlay-setting-options').toggle();
    
});





$(document).on('click', '.minimize-width', function(){
    $('sidebar').animate({width:'toggle'});
    if($('.canvas').width() === ($(window).width() - 315)){
        $('.canvas, .publish-default-state .publish-container').animate({left:60})
        $('.canvas').css('width', 'calc(100% - 60px)');
     } else {
        $('.canvas').animate({left:315})
        $('.publish-default-state .publish-container').animate({left:312})
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


var reload_comments = function(user_id, network_id, stream_id){
    var type = 'comments';
    $.ajax({
        url: "/post/details",
        type: "POST",
        data: {user_id:user_id, network_id:network_id, type:type, stream_id:stream_id},
        success: function(results){
            if(results.stream_id.indexOf('comments') === -1){
            results.id = 'comments_' + results.stream_id;
            } else {
                results.id = results.stream_id
            }
            $('#' + results.id).html('<div class="stream-content"><div class="stream-content-layer"></div></div>');
            results.service = 'facebook page'
            pushposts(results);
        },
        error: function(){
            error_node('There was an error <br><br> Please reload the page.');
        }
    });   
}




$(document).on('click', '.post-comment', function(e){
    var stream_id = $(this).parent().parent().parent().parent().parent().parent().parent().data('id');
    $('#comment_' + stream_id).animate({width:'toggle'});
    $('.stream-content-comment-content').html($(this).parent().parent().parent().parent().outerHTML());
    if($(this).data('service') === 'twitter'){
        $('.stream-content-comment-input textarea').val($(this).parent().parent().parent().find('.post-header').find('.post-header-username').text() + ' ');
    } else if($(this).data('service') === 'facebook page'){
        var user_id = $(this).parent().parent().parent().parent().data('post_id');
        var network_id = $(this).parent().parent().parent().parent().parent().parent().parent().data('network_id');
        var stream_id = $(this).parent().parent().parent().parent().parent().parent().parent().data('id');
        reload_comments(user_id, network_id, stream_id);
    }
});


$(document).on('keyup', '.stream-content-comment-input textarea', function(e){
    $('#comment_chars').text(encodeURI($(this).parent().parent().parent().find('.stream-content-comment-input').find('textarea').val()).replace(/%20/g, ' ').length);
});

$(document).on('keyup', 'textarea', function(e){
    $(this).height(30);
    $(this).height(this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth")));
});

$(document).on('click', '.stream-content-return', function(e){
    $(this).parent().parent().parent().animate({width:'toggle'});
});

$(document).on('click', '.post-reply', function(e){
    $(this).parent().find('.reply-to-comment').toggle();
});


var getUser = function(that, user_id, network_id, stream_id, type){
    if(network_id !== 'RSS'){
        if($('#user_' + stream_id).is(':hidden')){
            $('#user_' + stream_id).animate({width:'toggle'});
        }
        $('.stream-content-user-stats').html('');
        $('.stream-content-user-picture').html('LOADING CONTENT!!');
        $('.stream-content-user-name').html('');
        $('.stream-content-user-details').html('');

        $.ajax({
            url: "/post/details",
            type: "POST",
            data: {user_id:user_id, network_id:network_id, type:type, stream_id:stream_id},
            success: function(results){
                var service = results.service;
                var stream_id = results.stream_id;
                var network_id = results.network_id;
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
                 
                    $.ajax({
                        url: "/stream/collect",
                        type: "POST",
                        data: {service:'twitter', type:'user_search_feed', network_id:network_id, query:results.screen_name, id:stream_id},
                        success: function(results){
                                $('#user_own_' + results.id + ' > .stream-content > .stream-content-layer').html('');
                                $('#user_own_' + results.id + ' > .stream-content').css('height', 'calc(100% - ' + $('#user_' + results.id + ' .stream-user').height() + 'px)');
                                $('#user_own_' + results.id + ' > .stream-content').data('active', 'yes');
                                results.id = 'user_own_' + results.id;
                                pushposts(results);
                        },
                        error: function(){
                            error_node('There was an error <br><br> Please reload the page.');
                        }
                    });
                } else if(service === 'tumblr'){
                    if(results.response && results.response.blog){
                    results = results.response.blog;
                    o.picture = 'http://api.tumblr.com/v2/blog/' + results.name + '.tumblr.com/avatar/512';
                    o.name = results.title;
                    o.username = results.name + '.tumblr.com'
                    o.bio = results.description || "A tumblr user"
                    o.url = results.url || "http://" + results.name + '.tumblr.com'
                    o.real = "http://" + results.name + '.tumblr.com'
                    o.stats = [];
                    o.stats[0] = {count:results.posts, name:'posts'}
                    o.stats[1] = {count:results.likes, name:'likes'};
                        
                    $.ajax({
                        url: "/stream/collect",
                        type: "POST",
                        data: {service:'tumblr', type:'user_search_feed', network_id:network_id, query:results.name, id:stream_id},
                        success: function(results){
                                $('#user_own_' + results.id + ' > .stream-content > .stream-content-layer').html('');
                                $('#user_own_' + results.id + ' > .stream-content').css('height', 'calc(100% - ' + $('#user_' + results.id + ' .stream-user').height() + 'px)');
                                $('#user_own_' + results.id + ' > .stream-content').data('active', 'yes');
                                results.id = 'user_own_' + results.id;
                                pushposts(results);
                        },
                        error: function(){
                            error_node('There was an error <br><br> Please reload the page.');
                        }
                    });
                    }
                } else if(service === 'facebook page'){
                    o.picture = 'https://graph.facebook.com/v2.2/' + results.id + '/picture';
                    o.name = results.name;
                    o.username = results.name
                    o.bio = "A facebook user"
                    o.url = results.link || ""
                    o.real = "http://facebook.com/" + results.id; 
                    o.stats = [];
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
                    $.ajax({
                        url: "/stream/collect",
                        type: "POST",
                        data: {service:'instagram', type:'user_search_feed', network_id:network_id, query:results.username, id:stream_id},
                        success: function(results){
                                $('#user_own_' + results.id + ' > .stream-content > .stream-content-layer').html('');
                                $('#user_own_' + results.id + ' > .stream-content').css('height', 'calc(100% - ' + $('#user_' + results.id + ' .stream-user').height() + 'px)');
                                $('#user_own_' + results.id + ' > .stream-content').data('active', 'yes');
                                results.id = 'user_own_' + results.id;
                                pushposts(results);
                        },
                        error: function(){
                            error_node('There was an error <br><br> Please reload the page.');
                        }
                    });
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
                error_node('There was an error <br><br> Please reload the page.');
            }
        });
    }
}

var createAtUsers = function(text, type){
    var output,
        regex   = /(^|[^@\w])@(\w{1,15})\b/g,
        replace = '$1<a class="at-user" data-type="' + type + '" data-user_id="$2">@$2</a>';
    return text.replace( regex, replace );
}

$(document).on('click', '.at-user', function(e){
    var that = this;
    var user_id = $(this).data('user_id');
    var network_id = $(this).parent().parent().parent().parent().data('network_id') ;
    var stream_id = $(this).parent().parent().parent().parent().parent().parent().parent().data('id') || $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().data('id');
    var type = $(this).data('type');
    getUser(that, user_id, network_id, stream_id, 'user_name');
    
});

$(document).on('click', '.post-header', function(e){
    var that = this;
    var user_id = $(this).data('user_id');
    var network_id = $(this).parent().parent().data('network_id');
    var stream_id = $(this).parent().parent().parent().parent().parent().data('id');
    getUser(that, user_id, network_id, stream_id, 'user');
    
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


$(document).on("keypress", ".reply-to-comment", function(e){
    if (e.keyCode == 13) {
        text = encodeURI($(this).val()).replace(/%20/g, ' ');
        network_id = $(this).data('network_id');
        post_id = $(this).data('post_id');
        $.ajax({
            url: "/post/action",
            type: "POST",
            data: {post_id:post_id, network_id:network_id, type:'comment', text:text, post_id_additional:''},
            success: function(results){
              
            },
            error: function(){

            }
        });
    }
});


$(document).on("click", ".add-email-tool", function(e){
    var email = $('.email-item-add').val();
    if (validateEmail(email) === true) {
        $.ajax({
            url: "/email/add",
            type: "POST",
            data: {email:email},
            success: function(results){
                $('.email-overcheck').hide();
                $('#update_email').val(email);
            },
            error: function(results){
                
                if(results.responseText){
                    error_node(results.responseText);   
                } else {
                    error_node('there was some error');   
                }
            }
        });
    } else {
        error_node("This isn't a valid email");   
    }
});



$(document).on('click', '.post-actions .post-action, .stream-comment-post .post-action', function(e){
    var that = this;
    var post_id = $(this).parent().parent().parent().parent().data('post_id');
    var post_id_additional = $(this).parent().parent().parent().parent().data('post_id_additional') || '';
    var network_id = $(this).parent().parent().parent().parent().data('network_id');
    var type = $(this).data('type');
    var text = undefined;
    if(type === 'comment'){
        text = encodeURI($(this).parent().parent().parent().find('.stream-content-comment-input').find('textarea').val()).replace(/%20/g, ' ');
        network_id = $(this).parent().parent().parent().parent().parent().parent().data('network_id');
        
        post_id = $(this).parent().parent().parent().find('.stream-content-comment-content').find('.post').data('post_id');
        post_id_additional = $(this).parent().parent().parent().find('.stream-content-comments').attr('id');
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
                
                if(results.service === 'facebook page'){
                    reload_comments(results.user_id, results.network_id, results.stream_id);   
                }
            }
            
		},
		error: function(){
			
		}
	});
});

//open stuff in new tabs
var externalLinks = function() {
  for(var c = document.getElementsByTagName("a"), a = 0;a < c.length;a++) {
    var b = c[a];
    b.getAttribute("href") && b.hostname !== location.hostname && (b.target = "_blank")
  }
}

//turn text 2 links
function linkify(text) {  
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
    return text.replace(urlRegex, function(url) {  
            return '<a target="_blank" href="' + url + '">' + url + '</a>';  
        })  
}

var projectpost = function(data, service, network_id, special){   
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
               
            } else if(data.reply){
                if(data.allowreplies === true){
                post += "<a class='icon-reply post-reply'></a>"
                }
                post += "<textarea class='reply-to-comment' data-service='" + service + "' data-post_id='" + data.id + "' data-network_id='" + network_id + "' placeholder='press enter to reply'></textarea>"

                
            }
            
            
            
            if(special && special.nodots){
            } else {
                post += "<a class='icon-dot-3 post-extras'></a>" 
                post += "<div class='post-extra-menu-holder'><div class='post-extra-menu-arrow'></div><div class='post-extra-menu'>"
                post += "<a href='" + data.url + "' target='_blank'><div class='post-extra-menu-item'>Original Post</div></a>"
                post += "<a href='mailto:?body=" + data.url + "'><div class='post-extra-menu-item'>Email Post</div></a>"
                post += "</div></div>"
            }
            if(data.reply){
                post += '</div>';
                post += '<div class="stream-content-comments nostuff" id="commentxs_' + data.id + '">';
                post += '<div class="stream-content"><div class="stream-content-layer"></div></div>';
                post += '</div>';
            } else {
                post += '</div>';
            }
            
            post += "</div></div><div class='clear'></div></div>"
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
                    if(emojione){
                        data.text = emojione.toImage(createAtUsers(linkify(o.text), 'twitter'));
                    } else {
                        data.text = createAtUsers(linkify(o.text), 'twitter');
                    }
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
                    $('#' + results.id + " > .stream-content .stream-content-layer").append(projectpost(data, results.service, results.network_id));
                    $('#' + results.id).data('pageation_id', o.id_str);
                    if(i === (d.length - 1)){
                        $('#' + results.id + " > .stream-content .stream-content-layer").append('<div class="clear"></div>');
                        $('#' + results.id + " .stream-content").data('active', 'no');
                    }
                };
            } else {
                 $('#' + results.id + " > .stream-content .stream-content-layer").html("<div class='error-something'>Something went wrong, you probably exceeded your rate limit. <br><br> This means that you're refreshing too much, wait around 5 minutes to see this feed again. <br><br> <b> Sorry ! </b></div>");
            }
        break;
        case 'tumblr': 
            var d = {};
            
             
            if(results.data.response && results.data.response.posts){
                d = results.data.response.posts;
            } else if(results.data.response){
                d = results.data.response;
            } else {
                d = results.data.posts;
            }
       
            for(var i = 0; i < d.length; i++){
                
                var o = d[i];
                if(o.type !== 'chat'){
                var data = {};
                data.user = {};
                data.user.name = o.blog_name;
                data.user.picture = "http://api.tumblr.com/v2/blog/" + o.blog_name +".tumblr.com/avatar";
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
                $('#' + results.id + " > .stream-content .stream-content-layer").append(projectpost(data, results.service, results.network_id));
                $('#' + results.id).data('pageation_id', o.id_str);
                
                }
                if(i === (d.length - 1)){
                    $('#' + results.id + " > .stream-content .stream-content-layer").append('<div class="clear"></div>');
                   
                    if(results.type !== 'search_feed'){
                        
                        if($('#' + results.id).data('pageation_id')){
                            
                            $('#' + results.id).data('pageation_id', ($('#' + results.id).data('pageation_id') + 19));
                        } else {
                            $('#' + results.id).data('pageation_id', 19)
                        }
                    } else {
                        $('#' + results.id).data('pageation_id', o.timestamp)
                    }
                    $('#' + results.id + " .stream-content").data('active', 'no');
                    externalLinks();
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
                    if(emojione){
                        data.text = emojione.toImage(data.text);
                    }
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
                
                $('#' + results.id + " > .stream-content .stream-content-layer").append(projectpost(data, results.service, results.network_id));
                $('#' + results.id).data('pageation_id', o.id);
               

                if(i === (d.length - 1)){
                    $('#' + results.id + " > .stream-content .stream-content-layer").append('<div class="clear"></div>');
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
                
                $('#' + results.id + " > .stream-content .stream-content-layer").append(projectpost(data, results.service, results.network_id));
                
               

                if(i === (d.length - 1)){
                    $('#' + results.id + " > .stream-content .stream-content-layer").append('<div class="clear"></div>');
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
                    data.user.picture = "https://graph.facebook.com/v2.2/" + o.from.id +"/picture";
                    data.url = 'http://facebook.com/' + o.id.split('_')[1];
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
                        data.embed = '<img data-facebook="' + o.object_id + '" style="width:130px" src="' + o.picture + '">';
                    }
                    
                    var special = {};

                    if(results.id.indexOf('comments') !== -1){
                        special.nodots = true;
                        data.actions = ['heart']
                        data.reply = true;
                        data.allowreplies = true;
                        if(o.comments){
                            data.replies = o.comments
                        }
                        
                    } else if(results.id.indexOf('commentxs') !== -1){
                        special.nodots = true;
                        data.actions = ['heart']
                    }
                    
                    $('#' + results.id + " > .stream-content > .stream-content-layer").append(projectpost(data, results.service, results.network_id, special));
                    
                    if(o.comments){
                        
                        pushposts({data:o.comments, id:"commentxs_" + data.id , network_id:results.network_id, service:results.service});
                    }
                
                    if(i === (d.length - 1)){
                        
                        $('#' + results.id + " > .stream-content .stream-content-layer").append('<div class="clear"></div>');
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
                
                $('#' + results.id + " > .stream-content .stream-content-layer").append(projectpost(data, results.service, results.network_id));
                
               

                if(i === (d.length - 1)){
                    $('#' + results.id + " > .stream-content .stream-content-layer").append('<div class="clear"></div>');
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
                
                $('#' + results.id + " > .stream-content .stream-content-layer").append('<div class="redir" data-href="' + data.url + '">' + projectpost(data, results.service, results.network_id) + '</div>');
                
               

                if(i === (d.length - 1)){
                    $('#' + results.id + " > .stream-content .stream-content-layer").append('<div class="clear"></div>');
                    $('#' + results.id + " .stream-content").data('active', 'yes');
                    externalLinks();
                }
            };
        break;
        }
    
}


//start operations get posts
var getposts = function(){
    $('.stream').removeData('pageation_id')
    $('.stream > .stream-content .stream-content-layer').html('')
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

var reset_stream = function(id){
 
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
}

$(document).on('click', '.reset-stream', function(){
    var id = $(this).data('id');
    reset_stream(id);
});

var checkscroll = function(who){
    $(who).scroll(function(){
        if($(this).scrollTop() + $(this).height() > $(this).find('.stream-content-layer').height() - 200) {
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
}


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

    $('.stream  > .stream-content').scroll(function(){
        clearInterval(refreshpage);
        refreshpage = setInterval(function(){
                
               getposts();
         }, 250000);
     });
    
    checkscroll('.stream  > .stream-content');
    
    
    //fix posting

  
    if($('.select-to-post').length === 0){
           $('.publish-overlay-to-networks .partition-data').text('You have no supported networks connected, we only support Twitter and Facebook Pages right now!')
    }
    
    
    
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


$(document).on('keyup', '.publish-container textarea', function(e){
    var length = $(this).val().length;
    $('.publish-container .character-count').text(length);
    if(length !== 0){
        checkReadyToPost();
        $('.publish-states').removeClass('publish-default-state');
        $('.publish-states').addClass('publish-advanced-state');
    } else {
        $('.publish-error, .publish-image-preview').hide();
        $('#upload_file').val('');
        
        $('.publish-states').addClass('publish-default-state');
        $('.publish-states').removeClass('publish-advanced-state');
        $('.publish-container textarea').height(15);
    }
});

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#image_preview').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

var CheckFileName = function(){
    var fileName = document.getElementById("upload_file").value
    if (fileName == "") {
        alert("Browse to upload a valid File with png/jpg/gif extension");
        return false;
    }
    else if (fileName.split(".")[1].toUpperCase() == "PNG" || fileName.split(".")[1].toUpperCase() == "JPG" || fileName.split(".")[1].toUpperCase() == "GIF")
        return true;
    else {
        alert("File with " + fileName.split(".")[1] + " is invalid. Upload a validfile with png extensions");
        return false;
    }
}

var checkReadyToPost = function(){
    if($('.post-locations').length > 0 && $('.publish-container textarea').val().length > 0){
        $('.publish-button').removeAttr('disabled');
        $('.publish-error').hide()
    } else {
        $('.publish-button').attr('disabled', 'disabled');
    }
}


$(document).on('mouseenter', '.complete-publish', function(e){
    
    if($('.post-locations').length > 0 && $('.publish-container textarea').val().length > 0){
        
        $('.publish-error').hide()
    } else {
        $('.publish-error').show();
        if($('.post-locations').length === 0){
            $('.publish-error').text("You haven't selected a network.")
        } else {
            $('.publish-error').text("You need to enter some text.")
        }
    }
})



$(document).on('change', '#upload_file', function(){
    
    
    
    if(CheckFileName() === true){
        readURL(this);
        $('.publish-image-preview').show();
    } else {
        $('#image_preview').val('')   
    }
    
    
})

$(document).on('click', '.image-preview-remove', function(){
    $('#image_preview').removeAttr('src');
    $('#image_preview').val('')   
    $('.publish-image-preview').hide();
})

/*post work*/
$(document).on('click', '.select-to-post', function(){
    if($(this).hasClass('selected')){
        $('#post_location_' + $(this).data('id')).remove();
         $('.post-location-count').val($('.post-locations').length)  
        $(this).removeClass('selected');
    } else {
        $(this).addClass('selected');
        var html = '';
        html += '<input class="post-locations" id="post_location_' + $(this).data('id') + '" name="network_' + $('.post-locations').length + '" value="' + $(this).data('id') + '">';
        $('.publish-hidden-locations').append(html);
        $('.post-location-count').val($('.post-locations').length)  
    }
});
  
$(document).on('keyup', '.publish-container textarea', function(e){
   checkReadyToPost();
});

$(document).on('click', '.select-to-post', function(){
   checkReadyToPost();
})

  
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

$(document).mouseup(function (e){
    var container = $(".post-extras, .post-extra-menu-holder");
    
    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $('.post-extra-menu-holder').hide();
    }
});



//explode image
$(document).on('click', '.post-content-image img, .post-content img', function(){
    if($(this).data('facebook')){
        
        $.ajax({
            url: "https://graph.facebook.com/"+$(this).data('facebook')+"?fields=images.source",
            type: "GET",
            success: function(results){
                $('.exploded-image-container').animate({opacity:'show'});
                $('.exploded-image').attr('src', results.images[0].source);
            },
            error: function(){
                error_node('There was an error <br><br> Please reload the page.');
            }
        });
        
    } else {
        if($(this).parent('a').attr('href') !== undefined){
        } else {
            $('.exploded-image-container').animate({opacity:'show'});
            $('.exploded-image').attr('src', $(this).attr('src'));
        }
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



