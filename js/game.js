
var canvas, stage, ironMan, beam, shot, shotX, txt, beamSprite,paustxt, pausBox, loadTXT, leveltxt;
var paused = false
var score=0;
var teller=0;
var timer=12000;
var timerTxt=120;
var beamSpeed=17;
var enemySpeed = 1;
var enemies = new Array();
var terugkeer=false;
var yTerugkeer=false;
var enemiesKilled=0;
var level=1;
var shotShound;

var KEYCODE_SPACE = 32;
var KEYCODE_ESCAPE = 27;

function init() {    
	
	stage = new createjs.Stage(document.getElementById("canvas"));
	
	//////////////////////////////////
	//			Preloader			//
	//////////////////////////////////	
	var manifest = [
		{src:"shot.mp3" , id:"shot" },  
		{src:"background.mp3" , id:"bgM" },
		{src:"iron-sprite.png" , id:"iS" },
		{src:"backgrounds/1.jpg" , id:"bg" },
		{src:"backgrounds/2.jpg" , id:"bg2" },
		{src:"backgrounds/3.jpg" , id:"bg3" },
		{src:"backgrounds/4.jpg" , id:"bg4" },
		{src:"backgrounds/5.jpg" , id:"bg5" },
		{src:"backgrounds/6.jpg" , id:"bg6" },
		{src:"backgrounds/7.jpg" , id:"bg7" },
		{src:"backgrounds/8.jpg" , id:"bg8" },
		{src:"backgrounds/9.jpg" , id:"bg9" },
		{src:"backgrounds/10.jpg" , id:"bg10" },
		{src:"backgrounds/11.jpg" , id:"bg11" },
	];
		
	var loader = new createjs.PreloadJS(false);
	loader.installPlugin(createjs.SoundJS);   //Voor geluid te kunnen preloaden
	loader.onProgress = handleProgress;
	loader.onComplete =  handleLoaded;
	loader.loadManifest(manifest);
    
}

function prepStage(){

	
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addListener(window);
	
	document.onmousedown=handleMouseDown;
	document.onmouseup=handleMouseUp;
	document.onkeydown = handleKeyDown;
	
}

function handleProgress(e) 
{ 
		
		
		$('#load').empty();
		if(e.loaded<1){
			$('#load').append(Math.round(e.loaded*100) + "%");
			console.log(Math.round(e.loaded*100)+"% loaded");
		
		
		//console.log(e.loaded);
	
}
}

function handleLoaded(e){
	
	//console.log(e);
	
	prepStage();
	
	startGame();
	
	$("canvas").css('background',"url('backgrounds/1.jpg')");	
}

function tick()
{
    ironMan.x = stage.mouseX;
    
    ////////////Locatie Schot////////////////////
    if(shot){
    	if(beam.y >= 0){
	    	beam.x = shotX;
	    	beam.y = beam.y-beamSpeed;
	    	
	    	//console.log("Beam Y = "+beam.y);
    	}
    	else{
    		shot = false;
	    	//stage.removeChild(beam);
    	}
    	
    }else{
    
    beam.x = ironMan.x+45;
    beam.y=415;
    
    }
    ////////////////////////////////////////////
    
    //// Vijanden Animeren ////
    animateEnemies();
    
    //// kijken of ze naar links/rechts - boven/onder moeten gaan ////
    checkTerugkeer();
    
    //// De magie voor als de vijanden botsen met de kogels ////
    checkCollision();
    
    ////////////////////Voor een nieuw Level te starten////////////////////////
    if(enemiesKilled == 20){
    	endOfLevel();	
    }
    
    timer--;
    teller++;
    
    if(timer <= 0){
	    gameOver();
    }
    
    if(level>10){
	    gameOver();
    }
    
    updateTimer();
    
    ////////////////////////////////////////////////////////////////////////
    
    stage.update();
    
    if(teller==1){
	//Om de achtergrondmuziek te laten spelen...
	return createjs.SoundJS.play("bgM", true,false,0,true,.8,0);
	
    }

}

function startGame()
{	
	//handlePause();
	
	var ironSprite = new createjs.SpriteSheet({
			images: ["iron-sprite.png"],
			frames: {width:200, height:200, count:2,regX:100,regY:100},
	})
	
	beamSprite = new createjs.SpriteSheet({
			images: ["iron-sprite.png"],
			frames: {width:100, height:100, count:16,regX:50,regY:100},
			animations: {
				travel:	{
					frames: [9,11],
					frequency:5
					},
				hulk: {
					frames: [12,13],
					frequency: 30
					},
				loki: {
					frames: [14,15],
					frequency: 20
					} 
				}
	})
	
	ironMan= new createjs.BitmapAnimation(ironSprite);
			ironMan.x=350;
			ironMan.y=430;
			ironMan.gotoAndStop(0);
			ironMan.scaleX=ironMan.scaleY=0.7;
			stage.addChild(ironMan);
	
			
	beam= new createjs.BitmapAnimation(beamSprite);
			beam.x=ironMan.x+45;
			beam.y=415;
			beam.gotoAndPlay("travel");
			beam.scaleX=beam.scaleY=0.9;
			stage.addChild(beam);

	var ScBg = new createjs.Shape();  //BG Score
	ScBg.graphics.setStrokeStyle(1).beginStroke("#000").beginFill("#FFF").drawRect(8,8,100,20);
	stage.addChild(ScBg);
	
	var tmrBg = new createjs.Shape(); //BG Timer
	tmrBg.graphics.setStrokeStyle(1).beginStroke("#FFF").beginFill("#000").drawRect(790,8,100,20);
	stage.addChild(tmrBg);
	
	var lvlBG = new createjs.Shape();  //BG Score
	lvlBG.graphics.setStrokeStyle(1).beginStroke("#FFF").beginFill("#000").drawRect(720,8,70,20);
	stage.addChild(lvlBG);

	
	
	txt = new createjs.Text("Score: ", "15px Helvetica", "#000");
	txt.y = 10;
	txt.x=10;
	stage.addChild(txt);
	

	addEnemies ();
	updateScore();
	
	createjs.Touch.enable(stage,true,false);

}

//////////////////  Mouse Handlers//////////////////////

function handleMouseDown() 
{
	ironMan.gotoAndStop(1);
	stage.addChild(beam);
	shot=true;
	score--;
	updateScore();
	beam.x=ironMan.x+45;
	shotX = beam.x;
	beam.y=415;
	
	//static SoundInstance play ( value , interrupt , delay , offset , loop , volume , pan )
	return createjs.SoundJS.play("shot", true,false,0,0,1,0);

}

function handleMouseUp() 
{
	ironMan.gotoAndStop(0);
	
	if(beam.y <= 0){
	shot=false;
	}
	//stage.removeChild(beam);

}
/////////////////////////////////////////////////////

//////////////////  KEY Handlers//////////////////////

function handleKeyDown(e) { 
	if(!e) {var e = window.event;}
	switch(e.keyCode)
	{
		case KEYCODE_ESCAPE:
			handlePause();
			break;
		case KEYCODE_SPACE:
			handlePause();
			break;
	}
}

////////////////////////////////////////////////////
function endOfLevel() {
	
	removeEnemies();
	    addEnemies();
	    enemiesKilled=0;
	    shot = false;
	    
	    level++;
	    beamSpeed = beamSpeed-1;
	    handlePause();
	    stage.removeChild(paustxt);
	    stage.removeChild(pausBox);
	    
	    score = score+ Math.round(timer/100);
	    updateScore();
	    
	    timer=12000; 
	    
	    pausBox = new createjs.Shape();
		pausBox.graphics.setStrokeStyle(1).beginStroke("#FFF").beginLinearGradientFill(["#6B758B","#131C3C"], [0, 1] , 400, 200, 400, 275)
		.drawRoundRect(240,200,400,120, 10);
		stage.addChild(pausBox);
	    
	    var levelEndText=level-1;
	    paustxt = new createjs.Text("Level "+levelEndText+"      Score: " + score+"              Press Space to continue", "30px Helvetica", "#FFF");
		paustxt.y = 230;
		paustxt.x=280;
		paustxt.lineWidth = 400;
		stage.addChild(paustxt);
		
		switchLevelBackground(level);
}

function handlePause() {
	
	if(!paused){
		paused=true;
		createjs.Ticker.setPaused(true);
		//console.log("paused");
			
			pausBox = new createjs.Shape();
			pausBox.graphics.setStrokeStyle(1).beginStroke("#FFF").beginLinearGradientFill(["#6B758B","#131C3C"], [0, 1] , 400, 200, 400, 275)
			.drawRoundRect(375,200,150,75, 10);
			stage.addChild(pausBox);
	
			paustxt = new createjs.Text("PAUSE ", "30px Helvetica", "#FFF");
			paustxt.y = 220;
			paustxt.x=400;
			stage.addChild(paustxt);
			
			stage.update();
			
			createjs.SoundJS.pause("bgM");
			createjs.SoundJS.setVolume ( 0 , "shot" );
		
	}else{
		paused=false;
		createjs.Ticker.setPaused(false);
		//console.log("not paused");
		
		stage.removeChild(pausBox);
		stage.removeChild(paustxt);
		stage.update();
		
		createjs.SoundJS.resume("bgM");
		
	}
	
	
}

function addEnemies () { 
	
	///////////Hulks///////////////
	for (var i=0 ; i < 10; i++){
		
		enemies[i] = new createjs.BitmapAnimation(beamSprite);
			enemies[i].x=100+80*i;
			enemies[i].y=100;
			enemies[i].gotoAndPlay("hulk");
			enemies[i].scaleX=enemies[i].scaleY=0.6;
			stage.addChild(enemies[i]);
		
	}
	///////////Loki's///////////////
	for (var i=10 ; i < 20; i++){
		
		enemies[i] = new createjs.BitmapAnimation(beamSprite);
			enemies[i].x=-700+80*i;
			enemies[i].y=200;
			enemies[i].gotoAndPlay("loki");
			enemies[i].scaleX=enemies[i].scaleY=0.6;
			stage.addChild(enemies[i]);
		
	}


}

function switchLevelBackground(level){
			
				$("canvas").css('background-image',"url('backgrounds/"+level+".jpg')");

}

function removeEnemies() {
	for (var i=0 ; i < 20; i++){
		
		stage.removeChild(enemies[i]);
		//enemies[i] = 0;
	}
}

function animateEnemies() {
	
	for (var i=0 ; i < 20; i++){
		if(terugkeer){
			enemies[i].x = enemies[i].x - enemySpeed;
		}else{
			enemies[i].x = enemies[i].x + enemySpeed;
		}
		
	/////// Math.round: zien of ik kan afronden achter de komma /////////
		if(yTerugkeer){
			enemies[i].y += Math.round(Math.random(-1,1));
		}
		else{
			enemies[i].y -= Math.round(Math.random(-1,1));
		}
	//COLISSION TEST VERFIJNEN VOOR ACHTER DE KOMMA TE TESTEN
		
		
	///////////////////////////////////////
	//			TWEENJS					 //
	///////////////////////////////////////
	//	
	//	createjs.Tween
	//	.get(enemies[i],{loop:true})
	//	//.wait(1000)
	//	.to({y:enemies[i].y+10,x:enemies[i].x},1000,createjs.Ease.getElasticIn(3,0.3))
	//	//.wait(1500)
	//	.to({y:enemies[i].y-10,x:enemies[i].x},1000,createjs.Ease.getElasticOut(01,0.3));
	//
	//als ik dit probeer begin vertragen de fps enorm//
	
	
	}
	
}

function checkTerugkeer() {
	
	for (var i=0 ; i < 20; i++){
		//////////////  X  ////////////////
		if(enemies[i].x >= 880){
		
			terugkeer = true;
		}
		if(enemies[i].x <= 20){
		
			terugkeer = false;
		}
		
		//////////////  Y  ////////////////
		if(enemies[i].y >= 250){
		
			yTerugkeer = false;
		}
		if(enemies[i].y <= 80){
		
			yTerugkeer = true;
		}
	}
	
	
}

function updateScore() {
	
	stage.removeChild(txt);
	
	txt = new createjs.Text("Score: "+score, "15px Helvetica Neue", "#000");
	txt.y = 10;
	txt.x=10;
	stage.addChild(txt);
	
	stage.removeChild(leveltxt);
	
	leveltxt = new createjs.Text("level "+level, "15px Helvetica Neue", "#FFF");
	leveltxt.y = 10;
	leveltxt.x=730;
	stage.addChild(leveltxt);
}

function updateTimer() {
	
	stage.removeChild(timerTxt);
	
	timerTxt = new createjs.Text("Timer: "+ Math.round(timer/100), "15px Helvetica Neue", "#FFF");
	timerTxt.y = 10;
	timerTxt.x=800;
	stage.addChild(timerTxt);
}

////////////////////Where the magic happens////////////////////////
function checkCollision() {

	for (var i=0 ; i < 20; i++){
			//console.log(i);
			/*
		for(var marge = 0; marge < 16; marge++){
		for(var margeY = 0; margeY < 14; margeY++){
			if(enemies[i].x == beam.x+marge && enemies[i].y == beam.y+margeY ){ //Positive x-marge
				
				stage.removeChild(enemies[i]);
				enemies[i]= 0;
				
				collision();
			}
			if(enemies[i].x == beam.x-marge && enemies[i].y == beam.y-margeY ){ //negatieve x-marge
				stage.removeChild(enemies[i]);
				enemies[i]= 0;
				
				collision();		
			}
		}	
		}*/
		var marge=15;
		if(enemies[i].x<beam.x+marge && enemies[i].x > beam.x-marge && enemies[i].y<beam.y+marge && enemies[i].y > beam.y-marge){
			stage.removeChild(enemies[i]);
			enemies[i]=0;
			
			collision();
		}
	}
	
}

function collision() {
	
	console.log("boem!");
	score = score + 10;
	enemiesKilled++;

	updateScore();
	shot = false;
	
}

function gameOver() {
	
	paused=false;
	handlePause();
	
	stage.removeAllChildren();
	
	pausBox = new createjs.Shape();
	pausBox.graphics.setStrokeStyle(1).beginStroke("#FFF").beginLinearGradientFill(["#6B758B","#131C3C"], [0, 1] , 400, 200, 400, 275)
	.drawRoundRect(240,200,400,160, 10);
	stage.addChild(pausBox);
	    
	paustxt = new createjs.Text("GAME OVER                   Press Space to start over  Final Score:"+score, "30px Helvetica", "#FFF");
	paustxt.y = 230;
	paustxt.x=280;
	paustxt.lineWidth = 400;
	stage.addChild(paustxt);
	
	
	score=0;
	teller=0;
	timer=12000;
 	timerTxt=120;
 	beamSpeed=17;
 	enemySpeed = 1;
 	enemies = new Array();
 	terugkeer=false;
 	enemiesKilled=0;
 	level=1;
	
	
	
	
	startGame();
}






/////