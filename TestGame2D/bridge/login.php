<?php
	session_start();
	$url = $_SESSION['previous_location'];
	$_SESSION['username'] = $_POST['username'];
	
	header("Location: " . $url);
	exit();
?>