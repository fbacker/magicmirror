var Calendar = function (settings) {

    this.name = "Calendar";
    this.settings = settings;
    this.data = new Array();
    this.elements = {
        container: ".calendars",
        day: ".day"
    };

    BRAGI.log(this.name, "Constructor Settings: %o", settings);

    // load from calendar files
    setInterval(function () {
        this.update();
    }.bind(this), this.settings.intervalExternal);

    // just update visuals
    setInterval(function () {
        this.updateVisuals();
    }.bind(this), this.settings.interval);

    this.update();
};

Calendar.prototype.update = function() {
    // Update all calendars
    BRAGI.log(this.name, "Update");

    this.updateItemIndex = 0;
    this.updateItem();
};

Calendar.prototype.updateItem = function(){

    if(this.updateItemIndex >= this.settings.list.length){
        BRAGI.log(this.name, "Update Complete");
        return;
    }

    // Get item to update
    var item = this.settings.list[this.updateItemIndex];
    this.updateItemIndex++;

    BRAGI.log(this.name+":"+item.id, "Load: %o", item);
    var self = this;
    $.get('controllers/load-gzip.php?url='+encodeURIComponent(item.uri))
        .success(function(data) {
            self.parseItem(item,data);
        }).fail(function(){
            new Notification('Calendar, Can\'t access server. Calendar id '+ item.id);
            self.updateItem();
        });
};

Calendar.prototype.parseItem = function(calendarItem, iCalendarData){

    if(iCalendarData.substr(0,6)!="BEGIN:"){
        new Notification('Calendar, Response issue. Calendar id '+ calendarItem.id);
        this.updateItem();
        return;
    }

    var items = new Array();
    var now = moment();

    var jcalData = ICAL.parse(iCalendarData);
    var vcalendar = new ICAL.Component(jcalData);
    var events = vcalendar.getAllSubcomponents();

    BRAGI.log(this.name+":"+calendarItem.id, "Parse loaded events: %d", events.length);

    for(var i = 0; i < events.length; i++) {
        var event = events[i];
        //@param {icaltime}
        var eDate = event.getFirstPropertyValue('dtstart');
        var eTitle = event.getFirstPropertyValue('summary');
        var eLocation = event.getFirstPropertyValue('location');
        var eUid = event.getFirstPropertyValue('uid');
        //@param {icalrecur}
        var eRule = event.getFirstPropertyValue('rrule');
        if(eLocation==null||eLocation=="")
            eLocation = null;

        if(eDate !== null && eTitle !== null && eUid !== null){

            // Something to go on.
            if(eUid.indexOf("@") !== -1 )
                eUid = eUid.substr(0,eUid.indexOf("@"));

            var itemDate = moment(eDate.toJSDate());
            var dateList = new Array();
            dateList.push(itemDate);

            // There's a rrule, lets get future events
            if(eRule!==null){
                var itemRule = eRule.toString();

                // We need to rewrite to another string format
                var regRule = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/g;
                var regResult;
                do {
                    regResult = regRule.exec(itemRule);
                    if (regResult) {
                        var regDate = moment({
                            year: (regResult[1]), month: (regResult[2]-1), day: (regResult[3]),
                            hour: (regResult[4]), minutes: (regResult[5]), seconds: (regResult[6])
                        });
                        itemRule = itemRule.replace(regResult[0],regDate.format("YYYYMMDDTHHmmss")+"Z"); // replace date with new format
                    }
                } while (regResult);

                // Create RRule
                var rOptions = RRule.parseString(itemRule);
                rOptions.dtstart = itemDate.toDate();
                var rrule = new RRule(rOptions);

                // Only look from now and forward x dates
                var ruleDateTo = new Date();
                ruleDateTo.setDate(ruleDateTo.getDate() + this.settings.maximumDaysForward);
                var ruleList = rrule.between(new Date(), ruleDateTo);
                for(var j = 0; j < ruleList.length; j++){
                    var ritem = ruleList[j];
                    dateList.push(moment(ritem.getTime()));
                }
            }

            // Go thru all timestamps for this event
            for(var j = 0; j < dateList.length; j++){
                var itemDate = dateList[j];
                var duration = moment.duration(itemDate.diff(now));
                var secs = duration.asSeconds();
                if( secs > 0 ) { // this is in the future
                    var days = duration.asDays();
                    if (days <= this.settings.maximumDaysForward) { // is in our days limit

                        // We are interested
                        var itemVO = {
                            guid: eUid+"-"+j,
                            date: itemDate,
                            title: eTitle,
                            location: eLocation,
                            locationTravelTime: null,
                            isMoved: false,
                            isNew: false,
                            isRemoved: false,
                            symbol: calendarItem.symbol,
                            id: calendarItem.id
                        };
                        items.push(itemVO);

                        // Load travel info
                        var hours = duration.asHours();
                        if( itemVO.location !== null && hours <= this.settings.hoursLeftLocation){
                            this.loadLocationTime(calendarItem, itemVO);
                        }
                    }
                }
            }

        }
    }


    // compare to current list and set some flags that we use for print visuals
    var currentList = this.data;
    for(var i = 0; i < currentList.length; i++){
        var itemCurrent = currentList[i];
        var didFind = false;
        for(var j = 0; j < items.length; j++){
            var itemLoaded = items[j];
            if(itemCurrent.guid === itemLoaded.guid){
                // We already have this item
                didFind = true;
                var isMoved = (itemCurrent.date.unix()!==itemLoaded.date.unix());
                itemCurrent = itemLoaded;
                itemCurrent.isMoved = isMoved;
                currentList[i] = itemCurrent;
                break;
            }
        }
        // we have a item to remove, outside date
        var duration = moment.duration(itemCurrent.date.diff(now));
        var secs = duration.asSeconds();
        if(secs<=0){
            itemCurrent.isRemoved = true;
        }
    }
    // Make sure we have added the new items
    for(var j = 0; j < items.length; j++){
        var itemLoaded = items[j];
        var didFind = false;
        for(var i = 0; i < currentList.length; i++){
            var itemCurrent = currentList[i];
            if(itemLoaded.guid === itemCurrent.guid){
                didFind = true;
                break;
            }
        }
        if(!didFind){
            itemLoaded.isNew = true;
            currentList.push(itemLoaded);
        }
    }

    // Sort
    currentList.sort(function (a, b) {
        return a.date.unix() - b.date.unix()
    });

    // remove duplicates && save list
    this.data = _.uniq(currentList, function(item, key, a) {
        return item.title.toString();
    });

    BRAGI.log(this.name+":"+calendarItem.id, "Updated completed, num of items: %d total", currentList.length);
    this.updateVisuals();
    this.updateItem();
};

Calendar.prototype.loadLocationTime = function(calendarItem, item){
    console.log("grab");
    var self = this;
    var call = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCUFKkFelBfdZl65WCOIhhO-hD2ThWwNHo&address=Norra%20%C3%84lvsborgs%20L%C3%A4nssjukhus%2C%20L%C3%A4rketorpsv%C3%A4gen%2C%20461%2073%20Trollh%C3%A4ttan%2C%20Sweden";
    $.getJSON(call).success(function(data){
        console.log("dios");
        if(data!=null){
            if(data.length==0){
                // no results
                new Notification('Calendar, Can\'t get directions to location '+ item.location);
            }
            else{
                var loc = data.results[0].geometry.location;
                self.loadLocationTime2(calendarItem, item,loc);
            }
        }
        else{
            // no data
            new Notification('Calendar, Can\'t get directions to location '+ item.location);
        }
    }).fail(function(){
        console.log("asdsa");
    });

    /*
    var unixSeconds = item.date.unix();
    var apiKey = "AIzaSyCUFKkFelBfdZl65WCOIhhO-hD2ThWwNHo";
    var apiURI = "https://maps.googleapis.com/maps/api/directions/json?";
    var parameters = "origin=57.99583,11.68745&destination="+encodeURIComponent(item.location)+"&key="+encodeURIComponent(apiKey)+"&mode=driving&alternatives=false&units=metric&departure_time="+unixSeconds+"&traffic_model=best_guess";
    var uri = apiURI + parameters;
    $.getJSON({url:uri,
        type: "GET",
        crossDomain:true,
        dataType: 'json',
        cache: false,
        success: function(success){
            console.log(success);
        }
    });
    */
        /*
        .success(function(data) {
            console.log("dios");
        }).fail(function(jqXHR, textStatus, errorThrown){
            new Notification('Calendar, Can\'t get directions to location '+ item.location);

        });*/
};

Calendar.prototype.loadLocationTime2 = function(calendarItem, item, location){
    console.log("grab time");
    var self = this;
    var unixSeconds = item.date.unix();
    var apiKey = "AIzaSyCUFKkFelBfdZl65WCOIhhO-hD2ThWwNHo";
    var apiURI = "https://maps.googleapis.com/maps/api/directions/json?";
    var parameters = "origin=57.99583,11.68745&destination="+location.lat+","+location.lng+"&key="+encodeURIComponent(apiKey)+"&mode=driving&alternatives=false&units=metric&departure_time="+unixSeconds+"&traffic_model=best_guess";
    var uri = encodeURIComponent( apiURI + parameters );
    $.getJSON({
        url: "controllers/load-json.php?url="+uri,
        type: "GET",
        crossDomain:true,
        dataType: 'json',
        cache: false
    }).success(function(data) {
        console.log("dios");
        if( data.routes.length != 0 && data.routes[0].legs.length != 0 ){
            var time = data.routes[0].legs[0].duration_in_traffic.value; // seconds
            self.loadLocationTime3(calendarItem,item,time);
        }
    }).fail(function(jqXHR, textStatus, errorThrown){
        new Notification('Calendar, Can\'t get directions to location '+ item.location);

    });

};

Calendar.prototype.loadLocationTime3 = function(calendarItem,item,time){

    for(var i = 0; i < this.data.length; i++){
        if(this.data[i].guid==item.guid){
            this.data[i].locationTravelTime = time.toString().toDistanceTime();
            break;
        }
    }
    this.updateVisuals();
};

//@TODO run on clock tick
Calendar.prototype.updateVisuals = function(){
    var list = this.data;
    if(list.length===0){
        return;
    }

    var now = moment().hour(0).minute(0).second(0);
    var dayTitles = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    for(var i = 0; i < list.length; i++){

        var item = list[i];

        var duration = moment.duration(item.date.diff(now));
        var days = Math.floor( duration.asDays() );

        var divGroup = $(this.elements.container+" > "+this.elements.day+days);
        // Create group if not exists
        if(divGroup.length==0){
            var dayTitle = "Today";
            if(days==1){
                dayTitle = "Tomorrow";
            }
            else if(days>1){
                dayTitle = dayTitles[item.date.day()];
            }
            $(this.elements.container).append( '<ul class="'+(this.elements.day.substr(1)+days)+'"><lh class="dimmed xxsmall">'+dayTitle+'</lh></ul>' );
            divGroup = $(this.elements.container+" > "+this.elements.day+days);
        }

        var id = "c"+item.guid;
        var time = (item.date.hour()==0&&item.date.minutes()==0) ? "All day" : item.date.format("HH:mm");
        if(item.id=="birthdays") time = "";
        var content = '<span class="title">'+item.title+'</span><span class="time dimmed">'+time+'</span>';
        if(item.location!=null && item.locationTravelTime != null){
            content += '<div class="travel dimmed">Travel estimated: '+item.locationTravelTime+'</div>';
        }

        var nodeElement = $(this.elements.container+" > "+this.elements.day+days+" > #"+ id);
        if(nodeElement==null||nodeElement.length!=1){

            // Create new item
            var node = "<li id='"+id+"' class='xxsmall'><i class='fa "+item.symbol+"'></i><span class='content'>"+ content +"</span></li>";
            var childNode = divGroup.append(node);
            childNode.hide();
            childNode.fadeIn(500);

        }
        else {

            // update existing
            var childNode = nodeElement.find(".content");
            Display.swapHTML(childNode, content);

        }


/*

        var condition = this.getConditionItem(item.code);
        var icon = (this.isDay) ? condition.icon.day : condition.icon.night;
        var content = item.date.format("HH:mm")+' '+ item.description + " " + Math.round(item.temperature);
        if(item.rain3!=null&&item.rain3>0)
            content += "("+item.rain3.toFixed(1)+"mm)";
        if(item.snow3!=null&&item.snow3>0)
            content += " ("+item.snow3.toFixed(1)+"mm)";
        divGroup.append("<li id='"+id+"' class='xxsmall'><i class='wi "+icon+"'></i><span class='content'>"+ content +"</span></li>");
        */
    }


/*
    var divElement = $("#calendar-"+calendarItem.id+" > .content");
    if(divElement.length==0){
        // first time create
        var node = '<div id="calendar-'+calendarItem.id+'" class="'+this.elements.group.substr(1)+' "><div class="title xsmall">'+calendarItem.title+'</div><div class="content"></div></div>';
        var div = $(this.elements.container).append(node);
        div.hide();
        div.fadeIn();
        divElement = $("#calendar-"+calendarItem.id+" > .content"); // re-grab
    }

    for(var j = 0; j < list.length; j++){
        var item = list[j];
        var prev = (i===0) ? null : list[j-1];
        this.updateVisualsItem(calendarItem, divElement, item, prev);
    }
*/
};

Calendar.prototype.updateVisualsItem = function(calendarItem, divElement, item, itemPrev){

    var content = '<span class="title">'+item.title+'</span><span class="time dimmed">'+item.date.fromNow()+'</span>';
    if(item.location!=null&&item.location!='' && item.locationTravelTime != ''){
        content += '<div class="travel dimmed">travel time '+item.locationTravelTime+'</div>';
    }

    var node = '<div id="'+item.guid+'"><i class="fa '+calendarItem.symbol+'" ></i><span class=".content">'+content+'</span></div>';


    if(item.isNew){

        // Create a new item
        item.isNew = false;
        var childDiv;
        if(itemPrev==null){ // first in list
            childDiv = divElement.prepend(node);
        }
        else { // insert in correct position
            var preDiv = $("#"+itemPrev.guid);
            childDiv = preDiv.after(node);
        }
        childDiv.hide();
        childDiv.fadeIn("slow");
    }
    else if( item.isRemoved ){

        // Delete an item
        var childDiv = $("#"+item.guid);
        childDiv.fadeOut("slow", function() {
            childDiv.remove();
        });

    }
    else if( item.isMoved ) {

        // change and move position
        item.isMoved = false;
        var childDiv = $("#"+item.guid);
        childDiv.fadeOut("slow", function(){

            // remove old
            childDiv.remove();

            // move position
            if(itemPrev==null){ // first in list
                divElement.prepend(node);
            }
            else { // insert in correct position
                var preDiv = $("#"+itemPrev.guid);
                preDiv.after(node);
            }
            childDiv = $("#"+item.guid);
            childDiv.hide();
            childDiv.fadeIn("slow");


        });

    }
    else {

        // Update item
        var childDiv = $("#"+item.guid+" > span");
        if( childDiv.html() !== content ){
            childDiv.animate({opacity: 0}, 1000, 'linear', function(){
                childDiv.html(content);
                childDiv.animate({opacity: 1}); //FadeIn again

            });
        }

    }
};