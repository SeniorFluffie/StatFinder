// for optimizations and debugging
'use strict';

const API_KEYS = [
  {game: 'fortnite', key: '428d3a9d-9dba-4686-a5b7-0aabcc2c83c5', url: 'https://api.fortnitetracker.com/v1/profile/<sys>/<ign>', oneSystem: false, regions: false, oneView: true},
  {game: 'league', key: 'RGAPI-ba0cc2bb-4cf7-4242-9f28-2ff2494edda0', url: 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/<ign>?api_key=<key>', oneSystem: true, regions: false, oneView: true},
  {game: 'pubg', key: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJmNjE5MDg4MC0zYTNkLTAxMzYtMDAyYi0wYWY1M2JmOGE5MzMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTI2MzY4NjUzLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6InN0YXRmaW5kZXIifQ.LFPtLYDerMSZiDjH_DQoqTSV7TChfkvdZFkaYR_Oxxg', url : 'https://api.playbattlegrounds.com/shards/pc-na/players?filter[playerNames]=<ign>', oneSystem: true, regions: true, oneView: true},
  {game: 'csgo', key: '', url: '', oneSystem: true, regions: true, oneView: true},
  {game: 'dota', key: '2F0D06A2DD606DD12F2A27EEE173826A', url: '', oneSystem: true, regions: true, oneView: true},
  {game: 'overwatch', key: '', url: 'https://ow-api.com/v1/stats/<sys>/us/<ign>/complete', oneSystem: false, regions: true, oneView: false},
  {game: 'osu', key: '7460bfcb582e755d640beef05016060ac8d9c87a', url: 'https://osu.ppy.sh/api/get_user?k=<key>&u=<ign>', oneSystem: true, regions: false, oneView: true},
  {game: 'halo', key: '', url: '', oneSystem: true, regions: false, oneView: true}
];

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
    IGN === '' ? alert('Please enter a valid In-Game-Name!') : search(IGN);
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
    // request data from the specific game
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
  if(gameData.oneSystem)
    url = gameData.url.replace('<ign>', IGN).replace('<key>', gameData.key);
  // else specify platform
  else {
    // get system select buttons
    let systemButtons = $('.systemButton');
    // iterate through all button elements
    for(var j = 0; j < systemButtons.length; j++) {
      // if there is no system selected
      if(!$(systemButtons[j]).hasClass('active') && j === systemButtons.length - 1)
        alert('Please select a system you would like to search the stats for!');
      // else stop on the active button
      else if($(systemButtons[j]).hasClass('active')) {
        // convert to readable url
        if(gameData.game === 'overwatch')
          IGN = IGN.replace('#', '-');
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
    // handle status codes
    requestHandler(this, function () {
      // parse the data
      let data = JSON.parse(request.responseText);
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
    overwatchSearch(data);
    break;
    case 6:
    osuSearch(data);
    break;
  }
}

function initializeWindow() {
  // set player name and image
  $('#playerName').val(recentSearch.IGN);
  // clear name field
  $('#searchBar')[0].value = '';
  // add view switch (if game has it)
  recentSearch.gameData.oneView ? $('#viewSwitch').css('display', 'none') : $('#viewSwitch').css('display', 'inline');
  // show stats
  $('#statDisplay').fadeIn(500);
  // clear table
  $('#tableDiv').empty();
  // hide game window
  $('#gameSelect').css('display', 'none');
  // set boolean
  gameMenu = false;
}

function propertySearch(object, prop) {
  // base case
  if(object.hasOwnProperty(prop) || object[prop] !== undefined)
  	return object[prop];
  // else iterate through all properties
  for(let subKey in object) {
    // skip iteration if wrong conditions
    if(typeof object[subKey] !== 'object' || !object.hasOwnProperty(subKey))
    	continue;
    // recursively call search
    let match = propertySearch(object[subKey], prop);
    // return result (if valid)
    if(match != undefined && !(match instanceof Object))
      return match;
  }
  return null;
}

function createTable(data, tableData, style) {
  // localize elements
  let headerData = tableData[0];
  let cellData = tableData[1];
  let headerStyle = style[0];
  let cellStyle = style[1];
  // get table widths
  let tableWidth = [];
  for(let rows = 0; rows < headerData.length; rows++)
    tableWidth[rows] = cellData[headerData[rows].index[0]].length;
  // retrieve table
  var statTable = $('<table>', {'id': 'statTable', 'class': 'statTable', 'rules': 'all'});
  // add table to div then to window
  $('#statDisplay').append($('#tableDiv').append(statTable));
  // iterate through headers
  for(let i = 0; i < headerData.length; i++) {
    // create header
    createHeaderRow(statTable, headerData[i].header, tableWidth[i], headerStyle);
    // further the data path
    let property = data;
    if(headerData[i].property && headerData[i].counter === undefined)
      for(let path of headerData[i].property)
        property = property[path];
    // iterate through indices (rows)
    for(let j = 0; j < headerData[i].index.length; j++) {
      let header = headerData[i];
      // increment each row for its own data
      if(header.counter !== undefined)
        property = data[header.property[header.counter++]];
      // create table row (dependant on path)
      let row = cellData[header.index[j]];
      // to switch data mid row
      if(header.increment !== undefined)
        row.increment = header.increment;
      property ? createTableRow(statTable, row, property, cellStyle)
      : createTableRow(statTable, row, data, cellStyle);
    }
  }
}

function createHeaderRow(table, header, span, css) {
  // create header text
  let headerText = $('<th>', {align: 'center', colspan: span}).text(header);
  let headerRow = $('<tr>', {class: 'tableHeader'}).css(css);
  // append header to table
  table.append((headerRow.append(headerText)));
}

function createTableRow(table, data, property, css) {
  // row to be added
  let tableRow = $('<tr>');
  // iterate through each cell
  for(let i = 0; i < data.length; i++) {
    let cellTitle, cellValue, text;
    // increment data
    if(data[i].increment)
      ++data.increment;
    // switch data mid row or regular text
    data.increment != undefined ? text = propertySearch(property[data.increment], data[i].key)
    : text = propertySearch(property, data[i].key);
    // cell to be added
    if(data[i].img === undefined) {
      // regular cell
      cellTitle = $('<span>').css(css[0]).text(data[i].title);
      // round number (number case and string case)
      if((typeof text === 'number' && text !== 0) ||
      (typeof text === 'string' && !text.search(/^\d*\.?\d+$/)))
        text = Math.round(text * 100) / 100;
      // otherwise use preset display values
      else if(text.displayValue !== undefined || text.value !== undefined)
        text.displayValue ? text = text.displayValue : text = text.value;
      cellValue = $('<span>').css(css[1]).text(text);
    } else {
      // image cell
      cellTitle = $('<span>').text(data[i].title).css(css[0]);
      cellValue = $('<img>', {src: text, class: 'champIcon'});
    }
    // combine elements to cell
    let tableCell = $('<td>').css(css[2]).append(cellTitle).append(cellValue);
    // add cell to row to table
    tableRow.append(tableCell);
  }
  // add table row to table
  table.append(tableRow);
}
