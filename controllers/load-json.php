<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

header('Content-type: application/json; charset=UTF-8');
$url = $_GET["url"];

$curl = curl_init();
//curl_setopt($curl, CURLOPT_URL, urlencode($url));
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible;)");
curl_setopt($curl, CURLOPT_HEADER, 0);
curl_setopt($curl, CURLOPT_VERBOSE, 0);

$auth = curl_exec($curl);
curl_close($curl);
if($auth)
{
    echo $auth;
}

?>
