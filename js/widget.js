var Notification = function(message){

    noty({
        layout: 'center',
        timeout: 20000,
        theme: 'relax',
        text: message,
        animation: {
            open: 'animated flipInX', // Animate.css class names
            close: 'animated flipOutX', // Animate.css class names
            easing: 'swing', // easing
            speed: 500 // opening & closing animation speed
        }
    });

};


var Display = function(){};
Display.swapText = function(element,value){
    if( element.text() !== value ){
        element.animate({opacity: 0}, 1000, 'linear', function(){
            element.text(value);
            element.animate({opacity: 1}); //FadeIn again
        });
    }
};
Display.swapHTML = function(element,value){
    if( element.html() !== value ){
        element.animate({opacity: 0}, 1000, 'linear', function(){
            element.html(value);
            element.animate({opacity: 1}); //FadeIn again
        });
    }
};
Display.swapIcon = function(element,value){
    if(!element.hasClass(value)){
        element.animate({opacity: 0}, 1000, 'linear', function(){
            element.removeClass().addClass(value);
            element.animate({opacity: 1}); //FadeIn again
        });
    }
};