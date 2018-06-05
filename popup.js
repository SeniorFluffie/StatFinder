// for optimizations and debugging
'use strict';

const API_KEYS = [
  {game: 'fortnite', key: '428d3a9d-9dba-4686-a5b7-0aabcc2c83c5', url: 'https://api.fortnitetracker.com/v1/profile/<sys>/<ign>', pcOnly: false, regions: false},
  {game: 'league', key: 'RGAPI-0ff79719-f54c-48c8-9402-fdd2f19b4fff', url: 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/<ign>?api_key=<key>', pcOnly: true, regions: false},
  {game: 'pubg', key: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJmNjE5MDg4MC0zYTNkLTAxMzYtMDAyYi0wYWY1M2JmOGE5MzMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTI2MzY4NjUzLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6InN0YXRmaW5kZXIifQ.LFPtLYDerMSZiDjH_DQoqTSV7TChfkvdZFkaYR_Oxxg', url : 'https://api.playbattlegrounds.com/shards/pc-na/players/<ign>', pcOnly: true, regions: true},
  {game: 'csgo', key: '2F0D06A2DD606DD12F2A27EEE173826A', url: '', pcOnly: true, regions: true},
  {game: 'dota', key: '2F0D06A2DD606DD12F2A27EEE173826A', url: '', pcOnly: true, regions: true},
  {game: 'overwatch', key: '', url: '', pcOnly: false, regions: true},
  {game: 'osu', key: '7460bfcb582e755d640beef05016060ac8d9c87a', url: 'https://osu.ppy.sh/api/get_user?k=<key>&u=<ign>', pcOnly: true, regions: false},
]

const SYSTEM_TAGS = [
  'pc', 'psn', 'xb1'
];

window.onload = function() {
  // player search
  let searchButton = $('#searchButton')[0];
  // when the search button is pressed
  searchButton.onclick = function(element) {
    // stop default post req
    element.preventDefault();
    // localize lookup data
    let searchBar = $('#searchBar')[0];
    // save player name
    let IGN = searchBar.value;
    // if no name in field
    if(IGN === '')
      alert('Please enter a valid In-Game-Name!');
    // else clear field and search
    else {
      search(IGN);
    }
  };
}

// initial game lookup function
function search(IGN) {
  // play sound (and forward start time)
  let buttonPress = $('#searchSound')[0];
  buttonPress.currentTime = 0.1;
  buttonPress.play();
  // create index flag
  let gameIndex = 0;
  // localize game buttons
  let gameButtons = $('.gameButton').not('.systemButton');
  // iterate through only game buttons
  gameButtons.each(function() {
    // if active, break loop
    if($(this).hasClass('active'))
      return false;
    // increment index
    gameIndex++;
  });
  // if a game is selected
  if(gameIndex < gameButtons.length) {
    // add index property
    API_KEYS[gameIndex].gameID = gameIndex;
    // request data from the specific game (uses callback function as a closure)
    requestData(IGN, API_KEYS[gameIndex]);
  }
  // else display alert
  else
    alert('Please select a game to search stats for!');
}

function requestData(IGN, gameData) {
  // store copy of search (for refresh button)
  recentSearch = {IGN: IGN, gameData: gameData};
  // localize the url
  let url;
  // set url for single-platform
  if(gameData.pcOnly)
    url = gameData.url.replace('<ign>', IGN).replace('<key>', gameData.key);
  // else specify platform
  else {
    // get system select buttons
    let systemButtons = $('.systemButton');
    // iterate through all button elements
    for(var j = 0; j < systemButtons.length; j++) {
      // if there is no system selected
      if(!$(systemButtons[j]).hasClass('active') && j === systemButtons.length - 1)
        alert('Please select a console you would like to search the stats for!');
      // else stop on the active button
      else if($(systemButtons[j]).hasClass('active')) {
        // set url
        url = gameData.url.replace('<sys>', SYSTEM_TAGS[j]).replace('<ign>', IGN).replace('<key>', gameData.key);
        break;
      }
    }
  }
  // create XML request
  let request = new XMLHttpRequest();
  // open asynchronous get request
  request.open('GET', url, true);
  // specific game options
  if(gameData.game === 'fortnite')
    request.setRequestHeader('TRN-Api-Key', gameData.key);
  else if(gameData.game === 'pubg') {
    request.setRequestHeader("Accept", "application/vnd.api+json");
    request.setRequestHeader("Authorization", "Bearer <key>".replace("<key>", gameData.key));
  }
  else if(gameData.game === 'osu')
    request.setRequestHeader('Access-Control-Allow-Origin', '*');
  // instructions for when the message is recieved
  request.onreadystatechange = function() {
    // request closure
    let req = this;
    // handle status codes
    requestHandler({status: req.status, readyState: req.readyState, responseText: req.responseText}, function () {
      // parse the data
      let data = JSON.parse(req.responseText);
      // add response
      data.key = gameData.key
      // update window
      updatePopup(data, gameData.gameID);
    });
  }
  // send get request
  request.send();
}

function requestHandler(request, success) {
  if(request.readyState === 4) {
    // if success
    if(request.status === 200) {
      console.log('Code 200! Request Successful!');
      // run function
      success();
    }
    // else display the error code
    else if(status === 400)
    alert('Error 400! Bad Search Request!');
    else if(status === 401)
    alert('Error 401! Unauthorized Request!');
    else if(status === 403)
    alert('Error 403! Forbidden Request!');
    else if(status === 404)
    alert('Error 404! Request Not Found!');
    else if(status === 500)
    alert('Error 500! Internal Server Error!');
    else if( status === 503)
    alert('Error 503! Service Unavailable!');
  }
}

function updatePopup(data, gameID) {
  // switch case to determine search
  switch(gameID) {
    case 0:
    fortniteSearch(data);
    break;
    case 1:
    leagueSearch(data);
    break;
    case 2:
    pubgSearch(data);
    break;
    case 3:
    console.log('Begin CS:GO Search');
    break;
    case 4:
    console.log('Begin Dota 2 Search');
    break;
    case 5:
    console.log('Begin Overwatch Search');
    break;
    case 6:
    osuSearch(data);
    break;
  }
}

function initializeWindow() {
  // set player name and image
  $('#playerName').val($('#searchBar')[0].value);
  // clear name field
  $('#searchBar')[0].value = '';
  // show stats
  $('#statDisplay').fadeIn(500);
  // create table (clear pre-existing)
  $('#statTable').remove();
  var statTable = $('<table>', {'id': 'statTable', 'name': 'statTable', 'class': 'statTable', 'rules': 'all'});
  // add table to div then to window
  $('#statDisplay').append($('#tableDiv').append(statTable));
  // hide game window
  $('#gameSelect').css('display', 'none');
  // set boolean
  gameMenu = false;
}
