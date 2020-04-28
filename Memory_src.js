/**
 * 
 */
var startTijd, totaalTijd = 0, aantalTijden = 0;
// StartTijd is de tijd dat het huidige spel begonnen is. 
// Totaaltijd is de som van de tijd van alle gespeelde spelletjes, aantaltijden is het aantal spelletjes 
var firstCard, secondCard;
// De eerste en tweede kaart die zijn omgedraaid.
var karakter;
// Het teken dat op de achterkant van de kaart getoond wordt
var intervalID,tijdID;
// De ID's voor de timeouts voor het terugdraaien van de kaarten en het bijwerken van de tijdweergave

var numberOfCards;
// Aantal kaarten op het bord
var numberOfCardsLeft;
// Aantal kaarten dat nog op het bord ligt
var beginwidth;
//begingrootte van balk
var topScores = [
                 {name:"Barack Obama", time:200},
                 {name:"Bernie Sanders", time:300},
                 {name:"Hillary Clinton", time:400},
                 {name:"Jeb Bush", time:500},
                 {name:"Donald Trump", time:600}
                 ]


function initGame(size) {
	initVars(size);
	vulSpeelveld(size);
	showScores();
	resetBar();
}


function initVars(size){

	// Initialiseer alle benodigde variabelen en de velden op het scherm
	e=document.getElementById("character");
	karakter=e.options[e.selectedIndex].value;
	numberOfCards=size*size;
	numberOfCardsLeft=size*size;
	startTijd=0;
	setTijden();
}

function vulSpeelveld(size){
	//remove old nodes if there are any
	const el=document.getElementById("speelveld");
	let child=el.lastElementChild;
	while (child){
		el.removeChild(child);
		child=el.lastElementChild;
	}



	// Bouw de size x size table speelveld op. Elk <td> element van de tabel
	// moet een karakter toegewezen worden. Hiervoor kan de nextletter functie
	// gebruikt worden. Ook moet de eventlistener cardClicked aan de cell gekoppeld worden
	// en de opmaak juist gezet worden.
	const pick_letter=nextLetter(size);
	for (let i=0;i<size;i++){
		const tr=document.createElement("tr");

		for (let j=0;j<size;j++){
			const td=document.createElement("td");
			td.setAttribute("val",pick_letter());
			td.setAttribute("id","inactive");
			toggleCard(td);
			
			
			
			td.onclick=function () {
				cardClicked(td);
			};
			td.onmouseover=function(){
				if(td.getAttribute("id")!="inactive"){
					td.style.cursor="default";
				} else{
					td.style.cursor="pointer";
				}
			}
			tr.appendChild(td);
		}
		document.getElementById("speelveld").appendChild(tr);
	}


}

function showScores(){
	//remove scores from screen
	const el=document.getElementById("topscores");
	let child=el.lastElementChild;
	while (child){
		el.removeChild(child);
		child=el.lastElementChild;
	}
	// Vul het topscore lijstje op het scherm.
	for(const score of topScores){
		const li=document.createElement("li");
		li.innerHTML=`naam: ${score.name},  tijd: ${score.time}s`;
		el.appendChild(li);
	}
	
}

function setTijden(){
	// bereken de verlopen tijd, de gemiddlede tijd en het verschil tussen
	// de huidige speeltijd en de gemiddelde tijd en vul de elementen in de HTML.
		if(startTijd!=0) {
			document.getElementById("tijd").innerHTML = Math.floor(getSeconds() - startTijd);
			document.getElementById("gemiddeld").innerHTML=getAverage()+"s (+"+ getAddedAverage()+"s)";
		} else {
			document.getElementById("tijd").innerHTML=0;
			document.getElementById("gemiddeld").innerHTML=getAverage()+"s (+0s)";
		}
	// Vul ook het aantal gevonden kaarten


}

function getSeconds(){
	// Een functie om de Systeemtijd in seconden in plaats van miliseconden 
	// op te halen. Altijd handig.
	return Date.now()/1000;
}
function resetBar(){
	//functie om de balk te vullen boven het spel
	document.getElementById("timeLeft").style.width=beginwidth+"px";
		if(intervalID !=undefined){
		clearInterval(intervalID);
	}
}
var nextLetter = function(size){
	var letterArray = "AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRSSTTUUVVWWXXYYZZ".substring(0,size*size).split('');
	var idx=0;
	letterArray=shuffle(letterArray);
	return function() {
		var letter = letterArray[idx++]; 
		return letter;
	}
} 

function cardClicked(card) {
	if(card.getAttribute("id")=="inactive"){
	checkStarttijd();
	checkDerdeKaart();
	var draaiKaartOm = turnCard(card);
	if (draaiKaartOm==2){
		checkKaarten();
		}
	}
}

function checkStarttijd(){
	// Controleer of de startijd van het spel gezet is, i.e. het spel al gestart was.
	// Als dat niet zo is doe dat nu, en start de timeOut voor het bijhouden van de tijd.

	if(startTijd==0){
		startTijd=Date.now()/1000;
		tijdBijhouden();
	}
}

function checkDerdeKaart(){
	// Controleer of het de derde kaart is die wordt aangeklikt.
	// Als dit zo is kunnen de geopende kaarten gedeactiveerd (gesloten) worden.
	if(firstCard!=undefined && secondCard != undefined){
		deactivateCards();
		resetBar();
		
	}
}

function turnCard(card){
	
	// Draai de kaart om. Dit kan alleen als de kaart nog niet geopend of gevonden is.
	// Geef ook aan hoeveel kaarten er nu zijn omgedraaid en return dit zodat in de 
	// cardClicked functie de checkKaarten functie kan worden aangeroepen als dat nodig is.
	
	toggleCard(card);
	if(firstCard==undefined){
		firstCard=card;
		return 1;
	} 
	else if(secondCard==undefined){
		secondCard=card;
		return 2;
	}
	
}

function deactivateCards() { 
	// Functie om de twee omgedraaide kaarten weer terug te draaien
	toggleCard(firstCard);
	toggleCard(secondCard);
	
	firstCard=undefined;
	secondCard=undefined;
}

function toggleCard(element) {
	// Draai de kaart om, als de letter getoond wordt, toon dan de achterkant en 
	// vice versa. switch dus van active naar inactive of omgekeerd.
	if(element.innerHTML==karakter){
		element.innerHTML=element.getAttribute("val");
		element.style.backgroundColor="#"+document.getElementById("valueactive").getAttribute("value");
		element.setAttribute("id","active");
		
	} else {
		element.innerHTML=karakter;
		element.style.backgroundColor="#"+document.getElementById("valueinactive").getAttribute("value");
		element.setAttribute("id","inactive");
	}
	
}

function checkKaarten(){
	// Kijk of de beide kaarten gelijk zijn. Als dit zo is moet het aantal gevonden paren 
	// opgehord worden, het aantal resterende kaarten kleiner worden en ervoor  
	// gezorgd worden dat er niet meer op de kaarten geklikt kan worden. De kaarten
	// zijn nu found.
	// Als de kaarten niet gelijk zijn moet de timer gaan lopen van de toontijd, en 
	// de timeleft geanimeerd worden zodat deze laat zien hoeveel tijd er nog is.
	if(firstCard.getAttribute("val")==secondCard.getAttribute("val")){
		numberOfCardsLeft-=2;
		firstCard.style.backgroundColor="#"+document.getElementById("valuefound").getAttribute("value");
		secondCard.style.backgroundColor="#"+document.getElementById("valuefound").getAttribute("value");
		document.getElementById("gevonden").innerHTML=(numberOfCards-numberOfCardsLeft)/2;
		firstCard=undefined;
		secondCard=undefined;
	} else{
	const seconds=5;
	
	
	let count=seconds;
	intervalID=setInterval(function(){
		const currentwidth=document.getElementById("timeLeft").offsetWidth;
		document.getElementById("timeLeft").style.width=(currentwidth-(beginwidth/seconds))+"px";
		count--;
		if(count==0){
			resetBar();
			deactivateCards();
			
		}
	},1000);	
		
	}
}

// De functie tijdBijhouden moet elke halve seconde uitgevoerd worden om te controleren of 
// het spel klaar is en de informatie op het scherm te verversen.
function tijdBijhouden(){
	if (numberOfCardsLeft==0) {
		endGame();
	}
	else{
		setTijden();
	// Roep hier deze functie over 500 miliseconden opnieuw aan
		setTimeout(tijdBijhouden,500);

	}
}

function endGame(){
	// Bepaal de speeltijd, chekc topscores en doe de overige
	// administratie.
	const speeltijd=Math.floor(getSeconds()-startTijd);
	totaalTijd+=speeltijd;
	aantalTijden+=1;
    document.getElementById("gemiddeld").innerHTML=getAverage()+"s (+0s)";
	updateTopScores(speeltijd);
	showScores();
}
function getAverage(){
	if (aantalTijden==0){
		return 0;
	} else{
		return Math.floor(totaalTijd/aantalTijden);
	}
}
function getAddedAverage(){
	if(aantalTijden==0){
		return Math.floor(getSeconds() - startTijd);
	} else{
		return Math.floor(((getSeconds() - startTijd)+totaalTijd)/(aantalTijden+1));
		
		
	}
}
function updateTopScores(speelTijd){
	// Voeg de aangeleverde speeltijd toe aal de lijst met topscores
		// Vul het topscore lijstje op het scherm.
		let name=prompt("You have won! Please enter your name");
	for(const score of topScores){
		if(speelTijd<score.time){
			score.name=name;
			score.time=speelTijd;
			break;
		}
	}
	
}

// Deze functie ververst de kleuren van de kaarten van het type dat wordt meegegeven.
function setColor(stylesheetId) {
	var valueLocation = '#value'+stylesheetId.substring(3);
	var color = $(valueLocation).val();
	$(stylesheetId).css('background-color', '#'+color );
  }

// knuth array shuffle
// from https://bost.ocks.org/mike/shuffle/ 
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

$(document).ready(function(){
    $("#opnieuw").click(function(){
        initGame($("#size").val());
    });
});



