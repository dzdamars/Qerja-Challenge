var Word = Backbone.Model.extend({
	move: function() {
		this.set({y:this.get('y') + this.get('speed')});
	}
});

var Words = Backbone.Collection.extend({
	model:Word
});

var Score = 0;

var typeRight = 0;

var WordView = Backbone.View.extend({
	initialize: function() {
		$(this.el).css({position:'absolute'});
		var string = this.model.get('string');
		var letter_width = 25;
		var word_width = string.length * letter_width;
        var self = this;
        
        //resize
        $(window).on('resize',function(){
            if(self.model.get('x') + word_width > $(window).width()) {
                self.model.set({x:$(window).width() - word_width});
            }
            
            self.render();
        })
        
		if(this.model.get('x') + word_width > $(window).width()) {
			this.model.set({x:$(window).width() - word_width});
		}
        
		for(var i = 0;i < string.length;i++) {
			$(this.el)
				.append($('<div>')
					.css({
						width:letter_width+'px',
						padding:'5px 2px',
						'border-radius':'4px',
						'background-color':'#fff',
						border:'1px solid #ccc',
						'text-align':'center',
						float:'left'
					})
					.text(string.charAt(i).toUpperCase()));
		}
		
		this.listenTo(this.model, 'remove', this.remove);
       
		this.render();
	},
	
	render:function() {
		$(this.el).css({
			top:this.model.get('y') + 'px',
			left:this.model.get('x') + 'px'
		});
		var highlight = this.model.get('highlight');
		$(this.el).addClass('wordbox').find('div').each(function(index,element) {
			if(index < highlight) {
				$(element).css({'font-weight':'bolder','background-color':'#aaa',color:'#fff'});
			} else {
				$(element).css({'font-weight':'normal','background-color':'#fff',color:'#000'});
			}
		});
	}
});

var TyperView = Backbone.View.extend({
	initialize: function() {
		var wrapper = $('<div>')
            .addClass('container-fluid wrapper')
			.css({
				position:'fixed',
				top:'0',
				left:'0',
				width:'100%',
				height:'100%'
			});
        
		this.wrapper = wrapper;
		
		var self = this;
		var text_input = $('<input>')
			.addClass('form-control')
			.keyup(function() {
				var words = self.model.get('words');
				for(var i = 0;i < words.length;i++) {
					var word = words.at(i);
					var typed_string = $(this).val();
					var string = word.get('string');
					if(string.toLowerCase().indexOf(typed_string.toLowerCase()) == 0) {
						word.set({highlight:typed_string.length});
                        typeRight = word.get('highlight');
						if(typed_string.length == string.length) {
							$(this).val('');
                            Score++;
                            $('.score-box').text(Score);
						}
					}
                    else {
				        word.set({highlight:0});
					}
				}
                
                //minus 1 setiap kesalahan kata
                if(typed_string.length > typeRight)
                {
                    Score--;
                    $('.score-box').text(Score);
                }
			});
        
        var score_box = $('<div>')
            .css({
                'margin-top':'-72px',
                'text-align':'center'
            })
            .html('<span style="font-size:20px;font-weight:bolder;">Score : <strong class="score-box" style="color:red;">'+Score+'</strong></span>');
        
        var button_group = $('<div>')
        	.addClass('btn-group')
            .attr('role','group');
        
        var start_button = $('<button>')
            .text('Start')
            .addClass('btn btn-primary start')
            .css({
                'margin-top':'40px',
                'margin-left':'10px',
                'padding':'8px 29px'
            });
        
        var stop_button = $('<button>')
            .text('Stop')
            .addClass('btn btn-danger stop')
            .css({
                'margin-top':'40px',
                'margin-left':'5px',
                'padding':'8px 29px'
            });
        
        var pause_button = $('<button>')
            .text('Pause')
            .addClass('btn btn-warning pause')
            .css({
                'margin-top':'40px',
                'margin-left':'5px',
                'padding':'8px 29px'
            });
        
        var resume_button = $('<button>')
            .text('Resume')
            .addClass('btn btn-success resume')
            .css({
                'margin-top':'40px',
                'margin-left':'5px',
                'padding':'8px 29px'
            });
        
        
        var row = $('<div>')
            .addClass('row')
            .append(
                $('<div>')
                .addClass('col-md-12 navbar-fixed-bottom')
                .css({
                    'margin-bottom':'10px',
                    width:'80%',
                    margin:'0 auto 10px auto'
                })
                .append(
                    $('<form>')
                    .attr({
                        role:'form'
                    })
                    .submit(function() {
                        return false;
                    })
                    .append(text_input)
                )
            );
		
		$(this.el)
			.append(
                    wrapper.append(
                        row
                    )
               );
        
        $(this.el).append(
            button_group
            .append(start_button)
            .append(stop_button)
            .append(pause_button)
            .append(resume_button)
        )
        
        $(this.el).append(score_box);
		
		text_input.css({left:((wrapper.width() - text_input.width()) / 2) + 'px'});
		text_input.focus();
		
		this.listenTo(this.model, 'change', this.render);
	},
	
	render: function() {
		var model = this.model;
		var words = model.get('words');
		
		for(var i = 0;i < words.length;i++) {
			var word = words.at(i);
			if(!word.get('view')) {
				var word_view_wrapper = $('<div>');
				this.wrapper.append(word_view_wrapper);
				word.set({
					view:new WordView({
						model: word,
						el: word_view_wrapper
					})
				});
			} else {
				word.get('view').render();
			}
		}
	}
});

var objek;

var Typer = Backbone.Model.extend({
	defaults:{
		max_num_words:10,
		min_distance_between_words:50,
		words:new Words(),
		min_speed:1,
		max_speed:5,
	},
	
	initialize: function() {
		new TyperView({
			model: this,
			el: $(document.body)
		});
	},

	start: function() {
		var animation_delay = 50; // question no 2
		var self = this;
		objek = setInterval(function() {
			self.iterate();
		},animation_delay);
	},
    
	start: function() {
		var animation_delay = 50; // question no 2
		var self = this;
		objek = setInterval(function() {
			self.iterate();
		},animation_delay);
		$('.form-control').attr('disabled', false);
	},
    
    stop:function(){
        var self = this;
        var dissapear_delay = 50;
        clearInterval(objek);
        $('.wrapper .wordbox').fadeOut(dissapear_delay,function(){
            $(this).remove();
        });
        $('.form-control').attr('disabled', true);
    },
    
    pause:function(){
      var self = this;
       clearInterval(objek);
       $('.form-control').attr('disabled', true);
    },
    
	iterate: function() {
		var words = this.get('words');
        
		if(words.length < this.get('max_num_words')) {
			var top_most_word = undefined;
			for(var i = 0;i < words.length;i++) {
				var word = words.at(i);
				if(!top_most_word) {
					top_most_word = word;
				} else if(word.get('y') < top_most_word.get('y')) {
					top_most_word = word;
				}
			}
			
			if(!top_most_word || top_most_word.get('y') > this.get('min_distance_between_words')) {
				var random_company_name_index = this.random_number_from_interval(0,company_names.length - 1);
				var string = company_names[random_company_name_index];
				var filtered_string = '';
				for(var j = 0;j < string.length;j++) {
					if(/^[a-zA-Z()]+$/.test(string.charAt(j))) {
						filtered_string += string.charAt(j);
					}
				}
				
				var word = new Word({
					x:this.random_number_from_interval(0,$(window).width()),
					y:0,
					string:filtered_string,
					speed:this.random_number_from_interval(this.get('min_speed'),this.get('max_speed'))
				});
				words.add(word);
			}
		}
		
		var words_to_be_removed = [];
		for(var i = 0;i < words.length;i++) {
			var word = words.at(i);
			word.move();
			
			if(word.get('y') > $(window).height() || word.get('move_next_iteration')) {
				words_to_be_removed.push(word);
			}
			
			if(word.get('highlight') && word.get('string').length == word.get('highlight')) {
				word.set({move_next_iteration:true});
			}
		}
        
		for(var i = 0;i < words_to_be_removed.length;i++) {
			words.remove(words_to_be_removed[i]);
		}
		
		this.trigger('change');
	},
	
	random_number_from_interval: function(min,max) {
	    return Math.floor(Math.random()*(max-min+1)+min);
	}
});