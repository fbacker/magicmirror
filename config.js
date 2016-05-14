var config = {

    lang: 'en-gb',

    // Version check, is there a newer version from git
    versionChecker: {
        interval: 1000 * 60 * 5, // 5 minutes
        forceReload: true
    },

    clock: {
        country: 'en-gb',
        interval: 1000,
        useTransitions: true,
        showWeek: true
    },

    calendar:{
        interval: 1000 * 60 * 1, // every 1 min
        intervalExternal: 1000 * 60 * 30, // every 30 min
        apiKey: "AIzaSyCUFKkFelBfdZl65WCOIhhO-hD2ThWwNHo",
        home: "Rödvägen 64, 47198 Fagerfjäll",
        maximumEntries: 10, // Total Maximum Entries
        maximumDaysForward: 7, // How many days ahead to show
        hoursLeftLocation: 48, // Time until event, load travel time
        displaySymbol: true,
        defaultSymbol: 'calendar', // Fontawsome Symbol see http://fontawesome.io/cheatsheet/
        list: [

            {
                title: "Birthdays",
                id: "birthdays",
                symbol: 'fa-birthday-cake',
                uri: "http://www.facebook.com/ical/b.php?uid=785023241&key=AQAO8oa_0Ph6H3bc"
            },
            {
                title: "Fredrick Calender",
                id: "fredrick",
                symbol: 'fa-calendar-plus-o',
                uri: "https://calendar.google.com/calendar/ical/fredrick.backer@gmail.com/private-91f684c1ecc516001a722d48b587fb22/basic.ics"
            },
            {
                title: "Weekdays",
                id: "weekdays",
                symbol: 'fa-thumbs-o-up',
                uri: "https://calendar.google.com/calendar/ical/en.swedish%23holiday%40group.v.calendar.google.com/public/basic.ics"
            },


        ]
    },

    weather: {
        intervalExternal: 1000 * 60 * 30, // every 30 min
        apiKey: "11c934cb6b1a64dcbf3237910a246521",
        apiVersion: "2.5",
        location: "lat=57.9963920&lon=11.6846750",
        numberOfDaysMax: 0, // not including today
        sun: {
            icon: {
                sunrise: "wi-sunrise",
                sunset: "wi-sunset"
            }
        },
        wind: {
            icon: "wi wi-wind towards-{0}-deg",
            angles: [0,23,45,68,90,113,135,158,180,203,225,248,270,293,313,336,/* safe if closest value goes over*/360,383,405]
        },

        conditions: [
            // http://openweathermap.org/weather-conditions
            // https://erikflowers.github.io/weather-icons/
            { id:0,icon:{day:"d1",night:"d1"},description:"unknown" },
            // Thunder
            { id:200,icon:{day:"d1",night:"d1"},description:"thunderstorm with light rain" },
            { id:201,icon:{day:"d1",night:"d1"},description:"thunderstorm with rain" },
            { id:202,icon:{day:"d1",night:"d1"},description:"thunderstorm with heavy rain" },
            { id:210,icon:{day:"d1",night:"d1"},description:"light thunderstorm" },
            { id:211,icon:{day:"d1",night:"d1"},description:"thunderstorm" },
            { id:212,icon:{day:"d1",night:"d1"},description:"heavy thunderstorm" },
            { id:221,icon:{day:"d1",night:"d1"},description:"ragged thunderstorm" },
            { id:230,icon:{day:"d1",night:"d1"},description:"thunderstorm with light drizzle" },
            { id:231,icon:{day:"d1",night:"d1"},description:"thunderstorm with drizzle" },
            { id:232,icon:{day:"d1",night:"d1"},description:"thunderstorm with heavy drizzle" },

            // Drizzle
            { id:300,icon:{day:"wi-day-rain",night:"wi-night-alt-rain"},description:"light intensity drizzle" },
            { id:301,icon:{day:"wi-day-sleet",night:"wi-night-sleet"},description:"drizzle" },
            { id:302,icon:{day:"wi-day-rain",night:"wi-night-alt-rain"},description:"heavy intensity drizzle" },
            { id:310,icon:{day:"wi-day-rain",night:"wi-night-alt-rain"},description:"light intensity drizzle rain" },
            { id:311,icon:{day:"d1",night:"d1"},description:"drizzle rain" },
            { id:312,icon:{day:"d1",night:"d1"},description:"heavy intensity drizzle rain" },
            { id:313,icon:{day:"d1",night:"d1"},description:"shower rain and drizzle" },
            { id:314,icon:{day:"d1",night:"d1"},description:"heavy shower rain and drizzle" },
            { id:321,icon:{day:"d1",night:"d1"},description:"shower drizzle" },

            // Rain
            { id:500,icon:{day:"d1",night:"d1"},description:"light rain" },
            { id:501,icon:{day:"d1",night:"d1"},description:"moderate rain" },
            { id:502,icon:{day:"d1",night:"d1"},description:"heavy intensity rain" },
            { id:503,icon:{day:"d1",night:"d1"},description:"very heavy rain" },
            { id:504,icon:{day:"d1",night:"d1"},description:"extreme rain" },
            { id:511,icon:{day:"d1",night:"d1"},description:"freezing rain" },
            { id:520,icon:{day:"d1",night:"d1"},description:"light intensity shower rain" },
            { id:521,icon:{day:"d1",night:"d1"},description:"shower rain" },
            { id:522,icon:{day:"d1",night:"d1"},description:"heavy intensity shower rain" },
            { id:531,icon:{day:"d1",night:"d1"},description:"ragged shower rain" },

            // Snow
            { id:600,icon:{day:"d1",night:"d1"},description:"light snow" },
            { id:601,icon:{day:"d1",night:"d1"},description:"snow" },
            { id:602,icon:{day:"d1",night:"d1"},description:"heavy snow" },
            { id:611,icon:{day:"d1",night:"d1"},description:"sleet" },
            { id:612,icon:{day:"d1",night:"d1"},description:"shower sleet" },
            { id:615,icon:{day:"d1",night:"d1"},description:"light rain and snow" },
            { id:616,icon:{day:"d1",night:"d1"},description:"rain and snow" },
            { id:620,icon:{day:"d1",night:"d1"},description:"light shower snow" },
            { id:621,icon:{day:"d1",night:"d1"},description:"shower snow" },
            { id:622,icon:{day:"d1",night:"d1"},description:"heavy shower snow" },

            // Atmosphere
            { id:701,icon:{day:"wi-day-fog",night:"wi-night-fog"},description:"mist" },
            { id:711,icon:{day:"d1",night:"d1"},description:"smoke" },
            { id:721,icon:{day:"d1",night:"d1"},description:"haze" },
            { id:731,icon:{day:"d1",night:"d1"},description:"sand, dust whirls" },
            { id:741,icon:{day:"d1",night:"d1"},description:"fog" },
            { id:751,icon:{day:"d1",night:"d1"},description:"sand" },
            { id:761,icon:{day:"d1",night:"d1"},description:"dust" },
            { id:762,icon:{day:"d1",night:"d1"},description:"volcanic ash" },
            { id:771,icon:{day:"d1",night:"d1"},description:"squalls" },
            { id:781,icon:{day:"d1",night:"d1"},description:"tornado" },

            // Clear
            { id:800,icon:{day:"d1",night:"d1"},description:"clear sky" },

            // Clouds
            { id:801,icon:{day:"d1",night:"d1"},description:"few clouds" },
            { id:802,icon:{day:"d1",night:"d1"},description:"scattered clouds" },
            { id:803,icon:{day:"wi-cloudy",night:"d1"},description:"broken clouds" },
            { id:804,icon:{day:"wi-day-rain",night:"d1"},description:"overcast clouds" },

            // Extreme
            { id:900,icon:{day:"d1",night:"d1"},description:"tornado" },
            { id:901,icon:{day:"d1",night:"d1"},description:"tropical storm" },
            { id:902,icon:{day:"d1",night:"d1"},description:"hurricane" },
            { id:903,icon:{day:"d1",night:"d1"},description:"cold" },
            { id:904,icon:{day:"d1",night:"d1"},description:"hot" },
            { id:905,icon:{day:"d1",night:"d1"},description:"windy" },
            { id:906,icon:{day:"d1",night:"d1"},description:"hail" },

            // Additional
            { id:951,icon:{day:"d1",night:"d1"},description:"calm" },
            { id:952,icon:{day:"d1",night:"d1"},description:"light breeze" },
            { id:953,icon:{day:"d1",night:"d1"},description:"gentle breeze" },
            { id:954,icon:{day:"d1",night:"d1"},description:"moderate breeze" },
            { id:955,icon:{day:"d1",night:"d1"},description:"fresh breeze" },
            { id:956,icon:{day:"d1",night:"d1"},description:"strong breeze" },
            { id:957,icon:{day:"d1",night:"d1"},description:"high wind, near gale" },
            { id:958,icon:{day:"d1",night:"d1"},description:"gale" },
            { id:959,icon:{day:"d1",night:"d1"},description:"severe gale" },
            { id:960,icon:{day:"d1",night:"d1"},description:"storm" },
            { id:961,icon:{day:"d1",night:"d1"},description:"violent storm" },
            { id:962,icon:{day:"d1",night:"d1"},description:"hurricane" },
        ]
    }



    /*
    compliments: {
        interval: 30000,
        fadeInterval: 4000,
        morning: [
            'Good morning, handsome!',
            'Enjoy your day!',
            'How was your sleep?'
        ],
        afternoon: [
            'Hello, beauty!',
            'You look sexy!',
            'Looking good today!'
        ],
        evening: [
            'Wow, you look hot!',
            'You look nice!',
            'Hi, sexy!'
        ]
    },
    */
}
