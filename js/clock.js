/**
 * Display a clock
 * @param settings
 * @constructor
 */
var Clock = function (settings) {
    this.name = "Clock";
    this.settings = settings;
    this.elements = {
        date: ".date",
        time: ".time",
        week: ".clock > .week",
        timeHours: ".hours",
        timeMinutes: ".minutes"
    };

    BRAGI.log(this.name, "Constructor Settings: %o", settings);

    // Set country locale
    var failedToSetLocale = (moment.locale()!==this.settings.country);
    if(failedToSetLocale) // notify that locale isn't loaded
        BRAGI.error(this.name, "Failed to set locale '%s', now using '%s'. Make sure moment locale file is loaded in index.php", this.settings.country, moment.locale());

    // set first time offset to tick will work at first run
    this.lastNow = moment().subtract(7, 'days').subtract(7, 'minutes').subtract(7, 'hours'); // Get current date


    setInterval(function () {
        this.tick();
    }.bind(this), this.settings.interval);
    this.tick();
};

Clock.prototype.tick = function(){
    var now = moment(); // Get current date

    if( this.hasChangedDate(this.lastNow, now) ){
        this.updateText(this.elements.date, now.format('[<span class="day">]dddd,[</span> <span class="fulldate">]Do MMMM YYYY[</span>]'));
        if(this.settings.showWeek)
            this.updateText(this.elements.week, now.format('[week ]ww'));
    }

    if( this.lastNow.hours() !== now.hours() ) // Update minutes
        this.updateText(this.elements.timeHours, now.format('HH'));

    if( this.lastNow.minutes() !== now.minutes() ) // Update minutes
        this.updateText(this.elements.timeMinutes, now.format('mm'));


    this.lastNow = now;
};

Clock.prototype.updateText = function(element,value){
    if(this.settings.useTransitions){
        $(element).fadeOut( "slow", function() {
            $(element).html(value);
            $(element).fadeIn( "slow", function() {});
        });
    }
    else{
        $(e).html(value);
    }
};

Clock.prototype.hasChangedDate = function(lastDate, currentDate){
    return ( lastDate.date() !== currentDate.date() ||
            lastDate.month() !== currentDate.month() ||
            lastDate.year() !== currentDate.year() );
};
Clock.prototype.hasChangedTime = function(lastDate, currentDate){
    return (
        lastDate.minutes() !== currentDate.minutes() ||
        lastDate.hours() !== currentDate.hours() );
};