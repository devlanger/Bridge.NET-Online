<!DOCTYPE html>

<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8" />
    <title>TestGame2D</title>

	<script src="config.js"></script>
    <script src="bridge.js"></script>
    <script src="bridge.console.js"></script>
    <script src="bridge.meta.js"></script>
    <script src="newtonsoft.json.js"></script>
    <script src="TestGame2D.js"></script>
    <script src="TestGame2D.meta.js"></script>

</head>
<style>

*
{
	margin: 0;
	padding: 0;
}
	#gameContainer
	{
        width: 100%;
		height: 100%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		overflow: hidden;
	}

    #canvas
    {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.gameui
	{
		position: relative;
		z-order: 1;
	}

	.profilebox
    {
        position: absolute;
		background: gray;
		left: 0;
        border: 1px solid black;
        height: 100%;
        width: 200px;
    }

	#loginform
	{
		position: absolute;

top: 50%;

left: 50%;

transform: translate(-50%, -50%);
width: 150px;
	}

    .chatbox
    {
        position: absolute;
		right: 0;
		background: gray;
        border: 1px solid black;
        height: 100%;
        width: 200px;
    }

	.topbox
    {
        position: absolute;
		left: 50%;
transform: translate(-50%, 0);
		background: gray;
        border: 1px solid black;
        height: 100px;
        width: 100%;
    }

	.bottombox
	{
        position: absolute;
		bottom: 0;
		left: 50%;
		
transform: translate(-50%, 0);
		background: gray;
        border: 1px solid black;
        width: calc(100%);
        height: 200px;
	}

    .textfield
    {
        position: absolute;
        bottom: 0;
    }
</style>
<body>
<?php
// Start the session
session_start();
$_SESSION['previous_location'] = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
?>
<?php if(!isset($_SESSION['username']))
{?>
    <form id="loginform" action="login.php" method="POST">
        <label for="username">Username</label>
        <input type="text" id="username" name="username">

        <label for="password">Password</label>
        <input type="text" id="password" name="password">

		<input type="submit" value="login">
    </form>
	<?php } else { ?>

	<div id="gameContainer">
		<canvas id="canvas" width="250" height="320"
				style="border:1px solid #993300;">
		</canvas>
	
		
	</div>

	<div class="profilebox">
		<div class="gameui">
			<form action="logout.php" method="POST">
				<input type="submit" value="logout">
			</form>
		</div>
	</div>

	<div class="topbox">
	</div>

	<div class="bottombox">
	</div>

    <div class="chatbox">
        <p id="chatbox-field">
            Welcome to Chatbox! <br>
        </p>
        
        <div class="textfield">
            <input type="text" id="chatbox-text" name="fname" value="" placeholder="Enter message..."><br>
            <button onclick="SendMessage()">Click me</button>
        </div>
    </div>
	
    <script src="chat.js"></script>
	<?php }?>
</body>
</html>