

var Weather = function (settings) {

    this.name = "Weather";
    this.isDay = false;
    this.settings = settings;
    this.elements = {
        forecast: ".forecast",
        wind: ".wind",
        sun: ".sun",
        temperature: ".temperature",
        day: ".day",
        detailed: ".detailed",
        week: ".forecast > .week"
    };

    BRAGI.log(this.name, "Constructor Settings: %o", settings);

    setInterval(function () {
        this.update();
    }.bind(this), this.settings.intervalExternal);
    this.update();
};



Weather.prototype.update = function() {
    BRAGI.log(this.name, "Update, get weather");
    if(this.isUpdating)
        return;
    this.updateItemIndex = 0;
    this.isUpdating = true;
    this.updateItem();
};

Weather.prototype.updateItem = function() {

    if(this.updateItemIndex >= 2){
        BRAGI.log(this.name, "Update Complete");
        this.isUpdating = false;
        return;
    }
    this.updateItemIndex++;
    var isForecast = (this.updateItemIndex!=1);

    var self = this;
    var method = (isForecast) ? "forecast" : "weather";
    var uri = "http://api.openweathermap.org/data/"+this.settings.apiVersion+"/"+method+"?appid="+this.settings.apiKey+"&"+this.settings.location+"&mode=json&units=metric";
    BRAGI.log(this.name, "Update isForecast '%s', uri '%s'",isForecast, uri);
    $.getJSON(uri)
        .success(function(data) {
            self.parse(isForecast,data);
        }).fail(function(){
            new Notification('Weather, Can\'t access server.');
        });;
};

Weather.prototype.parse = function(isForecast,data) {

    BRAGI.log(this.name, "Parse '%o' results", data);
    var list = new Array();

    if(data.list==null)
        data.list = [data];
    for(var i = 0; i < data.list.length; i++){
        var raw = data.list[i];
        var item = {
            date: moment(raw.dt_txt),
            humidity: raw.main.humidity,
            pressure: raw.main.pressure,
            temperature: raw.main.temp,
            icon: null,
            code: null,
            description: null,
            clouds: raw.clouds.all, // cloud %
            windSpeed: raw.wind.speed,
            windDirection: raw.wind.deg,
            snow3: null,
            rain3: null,
            sunrise: null,
            sunset: null,
            isForecast: isForecast
        };

        if(raw.snow!=null)
            item.snow3 = raw.snow["3h"]; // rain last 3hours
        if(raw.rain!=null)
            item.rain3 = raw.rain["3h"]; // rain last 3hours
        if(raw.sys!=null){
            if(raw.sys.sunrise!=null)
                item.sunrise = moment(raw.sys.sunrise,"X");
            if(raw.sys.sunset!=null)
                item.sunset = moment(raw.sys.sunset,"X");
        }

        if(raw.weather.length>0){
            var rawWeather = raw.weather[0];
            item.code = rawWeather.id;
            var confItem = _.find(this.settings.conditions, function(lookupItem) {
                return lookupItem.id == item.code;
            });
            if(confItem==null) { // choose a default
                confItem = _.find(this.settings.conditions, function(lookupItem) {
                    return lookupItem.id == 962;
                });
            }


            item.description = confItem.description;
            item.icon = confItem.icon;

        }

        list.push(item);
    }

    // Sort so we get closest first
    list.sort(function (a, b) {
        return a.date.unix() - b.date.unix()
    });

    this.list = list;
    this.updateItem();
    this.updateVisuals();
};



Weather.prototype.updateVisuals = function(){

    $(this.elements.detailed).empty();
    var dayTitles = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    for(var i = 0; i < this.list.length; i++){
        var item = this.list[i];

        if( item.isForecast ){
            // list an item
            var now = moment().hour(0).minute(0).second(0);
            var duration = moment.duration(item.date.diff(now));
            var days = Math.floor( duration.asDays() );

            // show short week summary
            if(days>0 && days <= 4){
                if(item.date.hour()==12){
                    Display.swapText($(this.elements.week+" > "+this.elements.day+days +" > .name"), dayTitles[item.date.day()].substr(0,2));
                    Display.swapText($(this.elements.week+" > "+this.elements.day+days +" > .day"), Math.round(item.temperature));
                }
                else if(item.date.hour()==0){
                    Display.swapText($(this.elements.week+" > "+this.elements.day+days +" > .night"), Math.round(item.temperature));
                }
            }



            if( days <= this.settings.numberOfDaysMax) {

                var divGroup = $(this.elements.detailed+" > "+this.elements.day+days);

                // Create group if not exists
                if(divGroup.length==0){
                    var dayTitle = "Today";
                    if(days==1){
                        dayTitle = "Tomorrow";
                    }
                    else if(days>1){
                        dayTitle = dayTitles[item.date.day()];
                    }
                    $(this.elements.detailed).append( '<ul class="'+(this.elements.day.substr(1)+days)+'"><lh class="dimmed xxsmall" style="float:right;">'+dayTitle+'</lh></ul>' );
                    divGroup = $(this.elements.detailed+" > "+this.elements.day+days);
                }

                var id = "w"+item.date.format("X");
                var condition = this.getConditionItem(item.code);
                var icon = (this.isDay) ? condition.icon.day : condition.icon.night;
                var content = item.date.format("HH:mm")+' '+ item.description + ' <span class="temp">' + Math.round(item.temperature) + '</span>';
                if(item.rain3!=null&&item.rain3>=0.1)
                    content += " ("+item.rain3.toFixed(1)+"mm)";
                if(item.snow3!=null&&item.snow3>0)
                    content += " ("+item.snow3.toFixed(1)+"mm)";
                divGroup.append("<li id='"+id+"' class='xxsmall'><i class='wi "+icon+"'></i><span class='content'>"+ content +"</span></li>");
            }
        }
        else {

            // CURRENT WEATHER

            // Is day or night, based on sunrise / sunset
            this.isDay = this.getIsDaylight(item.sunrise,item.sunset);
            BRAGI.log(this.name+":Now", "Show results for now, isDay '%s'", item, this.isDay);


            // Wind
            var degrees = this.getClosest(item.windDirection,this.settings.wind.angles);
            if(degrees>=360) degrees -= 360;
            var windIcon = this.settings.wind.icon.replace("{0}",degrees);
            Display.swapText($(this.elements.wind+" > .content"), item.windSpeed.toFixed(1));
            Display.swapIcon($(this.elements.wind+" > i"), windIcon);
            BRAGI.log(this.name+":Now", "Wind: '%d', Degrees: '%d', Icon '%s'", item.windSpeed, degrees, windIcon);


            // Sunset - Sunrise
            var sunIcon = (this.isDay) ? this.settings.sun.icon.sunset : this.settings.sun.icon.sunrise;
            var sunTime = (this.isDay) ? item.sunset.format("HH:mm") : item.sunrise.format("HH:mm");
            Display.swapText($(this.elements.sun+" > .content"), sunTime );
            Display.swapIcon($(this.elements.sun+" > i"), "wi "+sunIcon);
            BRAGI.log(this.name+":Now", "Sunrise: '%s', Sunset: '%s'", item.sunrise.format("HH:mm"), item.sunset.format("HH:mm"));


            // temperature and condition
            var condition = this.getConditionItem(item.code);
            var icon = (this.isDay) ? condition.icon.day : condition.icon.night;
            var description = condition.description;
            if(item.rain3!=null)
                description = "Rain "+Math.round(item.rain3)+"mm, "+ description;
            if(item.snow3!=null)
                description = "Snow "+Math.round(item.snow3)+"mm, "+ description;
            Display.swapIcon($(this.elements.temperature+" > i"),"wi "+icon);
            Display.swapText($(this.elements.temperature+" > .content"), item.temperature.toFixed(1) );
            Display.swapText($(this.elements.temperature+" > .description"), description );


        }

    }

};


Weather.prototype.getIsDaylight = function(sunrise,sunset){
    var now = moment();
    if( now.hour() > sunrise.hour() && now.hour() < sunset.hour() )
        return true;
    else if( now.hour() == sunrise.hour() && now.minute() > sunrise.minute() && now.hour() < sunset.hour() )
        return true;
    else if( now.hour() == sunset.hour() && now.minute() < sunset.minute() && now.hour() > sunrise.hour() )
        return true;
    return false;
};

Weather.prototype.getConditionItem = function(code) {
    var item = _.find(this.settings.conditions, function(lookupItem) {
        return lookupItem.id == code;
    });
    if(item==null) item = this.settings.conditions[0];
    return item;
};
Weather.prototype.getClosest = function(number, array) {
    var current = array[0];
    var difference = Math.abs(number - current);
    var index = array.length;
    while (index--) {
        var newDifference = Math.abs(number - array[index]);
        if (newDifference < difference) {
            difference = newDifference;
            current = array[index];
        }
    }
    return current;
};