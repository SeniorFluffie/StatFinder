// for optimizations and debugging
'use strict';

const API_KEYS = [
  {game: "fortnite", key: "428d3a9d-9dba-4686-a5b7-0aabcc2c83c5", url: "https://api.fortnitetracker.com/v1/profile/<sys>/<ign>", pcOnly: false},
  {game: "league", key: "RGAPI-fc7ddd85-7e61-49cc-b004-ca0d25b25ee4", url: 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/<ign>?api_key=<key>', pcOnly: true},
  {game: "pubg", key: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJmNjE5MDg4MC0zYTNkLTAxMzYtMDAyYi0wYWY1M2JmOGE5MzMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTI2MzY4NjUzLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6InN0YXRmaW5kZXIiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.cSLVmj7wXePurD9HrEPbPXtFD5LS5uo_aftdzGNgbrY", url : "", pcOnly: true},
  {game: "csgo", key: "2F0D06A2DD606DD12F2A27EEE173826A", url: "", pcOnly: true},
  {game: "dota", key: "2F0D06A2DD606DD12F2A27EEE173826A", url: "", pcOnly: true},
  {game: "overwatch", key: "", url: "", pcOnly: false},
  {game: "osu", key: "7460bfcb582e755d640beef05016060ac8d9c87a", url: "", pcOnly: true},
]

const SYSTEM_TAGS = [
  "pc", "psn", "xb1"
];

window.onload = function() {
  // player search
  let searchButton = document.getElementById('searchButton');
  // when the search button is pressed
  searchButton.onclick = function(element) {
    // stop default post req
    element.preventDefault();
    // localize lookup data
    let searchBar = document.getElementById('searchBar');
    // save player name
    let IGN = searchBar.value;
    // if no name in field
    if(IGN === "") {
      alert("Please enter a valid In-Game-Name!");
    }
    // else clear field and search
    else {
      searchBar.value = "";
      search(IGN);
    }
  };
}

// initial game lookup function
function search(IGN) {
  // localize the button grid
  let gameButtons = document.getElementsByClassName("gameButton");
  // iterate through all button elements
  for(var i = 0; i < gameButtons.length; i++)
  // stop on the active button
  if($(gameButtons[i]).hasClass('active'))
  // quit loop
  break;
  // add index property
  API_KEYS[i].gameID = i;
  // request data from the specific game (uses callback function as a closure)
  requestData(IGN, API_KEYS[i]);
}

function requestData(IGN, gameData) {
  // localize the url
  let url;
  // set url for single-platform
  if(gameData.pcOnly)
  url = gameData.url.replace("<ign>", IGN).replace("<key>", gameData.key);
  // else specify platform
  else {
    // get system select buttons
    let systemButtons = document.getElementsByName("systemButton");
    // iterate through all button elements
    for(var j = 0; j < systemButtons.length; j++) {
      // if there is no system selected
      if(!$(systemButtons[j]).hasClass('active') && j === systemButtons.length - 1)
      alert("Please select a console you would like to search the stats for!");
      // else stop on the active button
      else if($(systemButtons[j]).hasClass('active')) {
        url = gameData.url.replace("<sys>", SYSTEM_TAGS[j]).replace("<ign>", IGN).replace("<key>", gameData.key);
        console.log("sys is " + SYSTEM_TAGS[j]);
        break;
      }
    }
  }
  // create XML request
  let request = new XMLHttpRequest();
  // open asynchronous get request
  request.open('GET', url, true);
  // specific game options
  if(gameData.game === "fortnite")
  request.setRequestHeader("TRN-Api-Key", gameData.key);
  // instructions for when the message is recieved
  request.onreadystatechange = function() {
    // if request is valid, update window
    if(this.readyState == 4 && this.status == 200) {
      console.log("Code 200! Request Successful!");
      updatePopup(this.responseText, gameData.gameID);
    }
    // else display the error code
    else if(this.readyState == 4 && this.status == 400)
    console.log("Error 400! Bad Search Request!");
    else if(this.readyState == 4 && this.status == 401)
    console.log("Error 401! Unauthorized Request!");
    else if(this.readyState == 4 && this.status == 403)
    console.log("Error 403! Forbidden Request!");
    else if(this.readyState == 4 && this.status == 404)
    console.log("Error 404! Request Not Found!");
    else if(this.readyState == 4 && this.status == 500)
    console.log("Error 500! Internal Server Error!");
    else if(this.readyState == 4 && this.status == 503)
    console.log("Error 503! Service Unavailable!");
  }
  // send get request
  request.send();
}

function updatePopup(data, gameID) {
  console.log(data);
  // switch case to determine search
  switch(gameID) {
    case 0:
    fortniteSearch();
    break;
    case 1:
    leagueSearch(data);
    break;
    case 2:
    console.log("Begin PUBG Search");
    break;
    case 3:
    console.log("Begin CS:GO Search");
    break;
    case 4:
    console.log("Begin Dota 2 Search");
    break;
    case 5:
    console.log("Begin Overwatch Search");
    break;
    case 6:
    console.log("Begin osu! Search");
    break;
  }
}

function fortniteSearch(data) {

}

function leagueSearch(data) {

}
