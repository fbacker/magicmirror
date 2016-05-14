<?php
header('Content-type: text/plain; charset=UTF-8');
  include "functions/gzip.php";
	$url = $_GET["url"];
	echo get_url($url);
?>
