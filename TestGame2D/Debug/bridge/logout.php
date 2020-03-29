<?php
	session_start();
	$url = $_SESSION['previous_location'];

	session_destroy();
	header("Location: " . $url);
	exit();
?>