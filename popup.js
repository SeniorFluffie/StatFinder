// for optimizations and debugging
'use strict';

const API_KEYS = [
  {game: 'fortnite', key: '428d3a9d-9dba-4686-a5b7-0aabcc2c83c5', url: 'https://api.fortnitetracker.com/v1/profile/<sys>/<ign>', pcOnly: false, regions: false},
  {game: 'league', key: 'RGAPI-fc7ddd85-7e61-49cc-b004-ca0d25b25ee4', url: 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/<ign>?api_key=<key>', pcOnly: true, regions: true},
  {game: 'pubg', key: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJmNjE5MDg4MC0zYTNkLTAxMzYtMDAyYi0wYWY1M2JmOGE5MzMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTI2MzY4NjUzLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6InN0YXRmaW5kZXIiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.cSLVmj7wXePurD9HrEPbPXtFD5LS5uo_aftdzGNgbrY', url : 'https://api.playbattlegrounds.com/shards/pc-na', pcOnly: true, regions: true},
  {game: 'csgo', key: '2F0D06A2DD606DD12F2A27EEE173826A', url: '', pcOnly: true, regions: true},
  {game: 'dota', key: '2F0D06A2DD606DD12F2A27EEE173826A', url: '', pcOnly: true, regions: true},
  {game: 'overwatch', key: '', url: '', pcOnly: false, regions: true},
  {game: 'osu', key: '7460bfcb582e755d640beef05016060ac8d9c87a', url: '', pcOnly: true, regions: false},
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
      searchBar.value = '';
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
  // store copy of search
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
  else if(gameData.game === 'pubg')
    request.setRequestHeader('Authorization', 'Bearer ' + gameData.key);
  // instructions for when the message is recieved
  request.onreadystatechange = function() {
    // if request is valid, update window
    if(this.readyState == 4 && this.status == 200) {
      console.log('Code 200! Request Successful!');
      // parse the data
      let data = JSON.parse(this.responseText);
      // modify response
      data.IGN = IGN;
      // update window
      updatePopup(data, gameData.gameID);
    }
    // else display the error code
    else if(this.readyState == 4 && this.status == 400)
    alert('Error 400! Bad Search Request!');
    else if(this.readyState == 4 && this.status == 401)
    alert('Error 401! Unauthorized Request!');
    else if(this.readyState == 4 && this.status == 403)
    alert('Error 403! Forbidden Request!');
    else if(this.readyState == 4 && this.status == 404)
    alert('Error 404! Request Not Found!');
    else if(this.readyState == 4 && this.status == 500)
    alert('Error 500! Internal Server Error!');
    else if(this.readyState == 4 && this.status == 503)
    alert('Error 503! Service Unavailable!');
  }
  // send get request
  request.send();
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
    console.log('Begin osu! Search');
    break;
  }
}

function fortniteSearch(data) {
  // data to retrieve data / construct table
  const tableHeaders = [
  {category: 'lifeTimeStats', stats: [8, 9, 10, 11, 7, 2, 4, 5]},
  {category: 'stats', subcategory: 'p2', stats: ['top1', 'winRatio', 'kills', 'kd', 'kpg', 'matches', 'top10', 'top25']},
  {category: 'stats', subcategory: 'p10', stats: ['top1', 'winRatio', 'kills', 'kd', 'kpg', 'matches', 'top5', 'top12']},
  {category: 'stats', subcategory: 'p9', stats: ['top1', 'winRatio', 'kills', 'kd', 'kpg', 'matches', 'top3', 'top6']}];
  // cell labels and flag
  const gameModes = ['OVERALL:', 'SOLO:', 'DUO:', 'SQUADS:'];
  // check for errors
  if(data.error !== undefined)
    alert('Player not found!');
  else {
    // set player name and image
    $('#playerName').val(data.IGN);
    $('#playerIcon').attr('src', '/images/avatar_fortnite.png');
    // show stats
    $('#statDisplay').fadeIn(500);
    // create table (clear pre-existing)
    $('#statTable').remove();
    var statTable = $('<table>', {'id': 'statTable', 'name': 'statTable', 'class': 'statTable'});
    // iterate through the table
    for(let i = 0; i < tableHeaders.length; i++) {
      // create header text
      let headerText = $('<th>', {align: 'center', colspan: '8'}).text(gameModes[i]);
      let headerRow = $('<tr>', {class: 'tableHeader'}).append(headerText);
      // append header to table
      statTable.append(headerRow);
      // row to be added
      let tableRow = $('<tr>');
      // iterate through stats
      for(let j = 0; j < tableHeaders[i].stats.length; j++) {
        // cell to be added
        let tableCell, cellKey, cellValue;
        // if there is no sub-category (use different data)
        if(tableHeaders[i].subcategory === undefined) {
          // cell key (bolded) and cell value (not bolded)
          cellKey = $('<span>').css('font-weight', 'bold').css('display', 'block').text(data[tableHeaders[i].category][tableHeaders[i].stats[j]].key + ':');
          cellValue = $('<span>').css('font-weight', 'normal').text(data[tableHeaders[i].category][tableHeaders[i].stats[j]].value);
        }
        else {
          // cell key (bolded) and cell value (not bolded)
          cellKey = $('<span>').css('font-weight', 'bold').css('display', 'block').text(data[tableHeaders[i].category][tableHeaders[i].subcategory][tableHeaders[i].stats[j]].label + ':');
          cellValue = $('<span>').css('font-weight', 'normal').text(data[tableHeaders[i].category][tableHeaders[i].subcategory][tableHeaders[i].stats[j]].value);
        }
        // append values to cell
        tableCell = $('<td>').append(cellKey).append(cellValue);
        // add cell to row
        tableRow.append(tableCell);
        }
        // add table row to table
        statTable.append(tableRow);
    }
    // add table to window
    $('#statDisplay').append(statTable);
    // hide game window
    $('#gameSelect').css('display', 'none');
  }
}

function leagueSearch(data) {

}

function pubgSearch(data) {
}
