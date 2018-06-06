// for optimizations and debugging
'use strict';

const player = {};
const pubg_URLS = {base: 'https://api.playbattlegrounds.com/shards/pc-na',
url: ['/seasons', '/players/<id>/seasons/<season>']};

function pubgSearch(data) {
  // save player data
  player.id = data.data[0].id;
  player.key = data.key;
  // retrieve current season
  retrieveStats(pubg_URLS.url[0], player, 'season');
  // retrieve seasonal data (using the retrieved data)
  setTimeout(function() {
    retrieveStats(pubg_URLS.url[1], player, 'stats');
  }, 500);
  // after reqs are recieved
  setTimeout(function() {
    // setup window
    initializeWindow();
    // set icon
    $('#playerIcon').attr('src', '/images/icon_pubg.png');
    // fill table
    pubgTable(player);
  }, 1000);
}

function retrieveStats(url, data, prop) {
  // set url
  url = pubg_URLS.base + url;
  // if player stats override
  if(url.includes('<id>') || url.includes('<season>'))
    url = url.replace('<id>', player.id).replace('<season>', player.season.id);
  // create req and url
  let request = new XMLHttpRequest();
  // setup request
  request.open('GET', url, true);
  request.setRequestHeader("Accept", "application/vnd.api+json");
  request.setRequestHeader("Authorization", "Bearer <key>".replace("<key>", player.key));
  // upon success
  request.onreadystatechange = function() {
    // if request is ready and successful
    requestHandler(this, function() {
      // localize data
      let tempData = JSON.parse(request.responseText).data;
      data[prop] = tempData[tempData.length - 1] || tempData.attributes.gameModeStats;
    });
  };
  request.send();
}

function pubgTable(data) {
  // table information
  const tableCells = [{title: ['Wins:', 'Games:', 'Top10:', 'Kills:', 'Headshots:', 'Assists:', 'Damage:', 'Max Kills', 'Longest Kill:', 'Survival:'],
    key: ['wins', 'roundsPlayed', 'top10s', 'kills', 'headshotKills', 'assists', 'damageDealt', 'roundMostKills', 'longestKill', 'longestTimeSurvived']}];
  const cellHeader = {index: [[0, 0], [0, 0], [0, 0]], category: ['solo', 'solo-fpp', 'duo', 'duo-fpp', 'squad', 'squad-fpp'],
    header: ['SOLO & SOLO-FIRST-PERSON:', 'DUO & DUO-FIRST-PERSON:', 'SQUAD & SQUAD-FIRST-PERSON:'], headCounter: 0, rowCounter: 0};
  // retrieve table
  var statTable = $('#statTable');
  // iterate through the table
  for(let i = 0; i < cellHeader.index.length; i++) {
    for(let j = 0; j < cellHeader.index[i].length; j++) {
      if(j === 0) {
        // create header text
        let headerText = $('<th>', {align: 'center', colspan: tableCells[cellHeader.index[i][j]].title.length}).text(cellHeader.header[cellHeader.headCounter++]);
        let headerRow = $('<tr>', {class: 'tableHeader'}).append(headerText);
        // append header to table
        statTable.append(headerRow);
      }
      // row to be added
      let tableRow = $('<tr>');
      // iterate through stats
      for(let k = 0; k < tableCells[cellHeader.index[i][j]].title.length; k++) {
        // cell to be added
        let tableCell, cellTitle, cellValue;
        // cell key (bolded) and cell value (not bolded)
        cellTitle = $('<span>').css({'font-weight': 'bold', 'display': 'block', 'font-size': '8pt'}).text(tableCells[cellHeader.index[i][j]].title[k]);
        cellValue = $('<span>').css({'font-weight': 'normal', 'font-size': '9pt'}).text(Math.round(data.stats[cellHeader.category[cellHeader.rowCounter]][tableCells[cellHeader.index[i][j]].key[k]] * 100) / 100);
        // append values to cell
        tableCell = $('<td>').append(cellTitle).append(cellValue).css({'line-height': '100%'});
        // add cell to row
        tableRow.append(tableCell);
      }
      // add table row to table
      statTable.append(tableRow);
      // increment category counter
      cellHeader.rowCounter++;
    }
  }
}
