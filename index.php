<html>
<head>
	<title>Magic Mirror</title>
    <link rel="stylesheet" type="text/css" href="css/main.css">
	<link rel="stylesheet" type="text/css" href="bower_components/weather-icons/css/weather-icons.min.css">
    <link rel="stylesheet" type="text/css" href="bower_components/weather-icons/css/weather-icons-wind.min.css">
	<link rel="stylesheet" type="text/css" href="bower_components/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="bower_components/animate.css/animate.min.css">
	<script type="text/javascript">
		var gitHash = '<?php echo trim(`git rev-parse HEAD`) ?>';
	</script>
	<meta name="google" value="notranslate" />
	<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
</head>
<body>

<div>

    <div class="top left">
        <!-- clock -->
        <div class="clock">
            <div class="date small dimmed">----, ---------</div>
            <div class="time">
                <span class="hours">00</span><span class="animated infinite hinge">:</span><span class="minutes">00</span>
            </div>
            <div class="week xxsmall dimmed"></div>
        </div>

        <!-- calendars -->
        <div class="calendars xxsmall"></div>
    </div>

	<div class="top right">

        <div class="weather">
            <div class="windsun small dimmed">
                <div class="sun"><i class="wi"></i> <span class="content">---</span></div>
                <div class="wind"><i class="wi"></i> <span class="content">---</span></div>
            </div>
            <div class="temperature">
                <div class="xxsmall dimmed description">---</div>
                <i ></i> <span class="content">--</span>
            </div>
            <div class="forecast">
                <div class="week xsmall">
                    <div class="day1"><span class="name dimmed">--</span><span class="day">-</span><span class="night">-</span></div>
                    <div class="day2"><span class="name dimmed">--</span><span class="day">-</span><span class="night">-</span></div>
                    <div class="day3"><span class="name dimmed">--</span><span class="day">-</span><span class="night">-</span></div>
                    <div class="day4"><span class="name dimmed">--</span><span class="day">-</span><span class="night">-</span></div>
                </div>
                <div class="detailed">

                </div>
            </div>
        </div>
    </div>

	<div class="center-ver center-hor"></div>
	<div class="lower-third center-hor">
        <div class="compliment light"></div>
    </div>
	<div class="bottom center-hor">
        <div class="news medium"></div>
    </div>

</div>

    <script src="bower_components/jquery/dist/jquery.min.js"></script>
    <script src="bower_components/jquery-rss/dist/jquery.rss.min.js"></script>
    <script src="bower_components/moment/min/moment.min.js"></script>
    <script src="bower_components/moment/locale/en-gb.js"></script>
    <script src="bower_components/ical.js/build/ical.js"></script>
    <script src="bower_components/rrule/lib/rrule.js"></script>
    <script src="bower_components/chance/dist/chance.min.js"></script>
    <script src="bower_components/underscore/underscore-min.js"></script>
    <script src="bower_components/bragi-browser/dist/bragi.min.js"></script>
    <script src="bower_components/noty/js/noty/packaged/jquery.noty.packaged.min.js"></script>

    <!--
<script src="js/ical_parser.js"></script>
<script src="js/config.js"></script>
<script src="js/rrule.js"></script>

<script src="js/calendar/calendar.js"></script>
<script src="js/compliments/compliments.js"></script>
<script src="js/weather/weather.js"></script>
<script src="js/news/news.js"></script>
    -->
    <script src="js/widget.js"></script>
    <script src="js/checkVersion.js"></script>
    <script src="js/clock.js"></script>
    <script src="js/calendar.js"></script>
    <script src="js/weather.js"></script>


    <script src="config.js"></script>
    <script src="js/main.js?nocache=<?php echo md5(microtime()) ?>"></script>
<!-- <script src="js/socket.io.min.js"></script> -->
<?php  include(dirname(__FILE__).'/controllers/modules.php');?>
</body>
</html>
