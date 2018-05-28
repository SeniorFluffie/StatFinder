// for optimizations and debugging
'use strict';

const league_URLS = ['/lol/champion-mastery/v3/scores/by-summoner/<id>',
'/lol/champion-mastery/v3/champion-masteries/by-summoner/<id>',
'/lol/league/v3/positions/by-summoner/<id>'];

const realmData = {version: '8.10.1'};

function leagueSearch(data) {
  // promise counter
  let domain = 'https://na1.api.riotgames.com';
  // store initial search
  let player = {id: data.id, iconID: data.profileIconId, level: data.summonerLevel};
  // iterate through all http requests
  for(let i = 0; i < league_URLS.length; i++) {
    // swap out url tag
    let url = domain.concat(league_URLS[i].replace('<id>', player.id).concat('?api_key=' + data.key));
    // create XML request
    let request = new XMLHttpRequest();
    // open asynchronous get request
    request.open('GET', url, true);
    // instructions for when the message is recieved
    request.onreadystatechange = function() {
      // request closure
      let req = this;
      // handle request
      requestHandler({status: req.status, readyState: req.readyState, responseText: req.responseText}, function () {
        // parse data
        let data = JSON.parse(req.responseText);
        switch(i) {
          case 0:
          player.masteryLevel = data;
          break;
          case 1:
          player.championMastery = data.slice(0, 5);
          break;
          case 2:
          // as req differs
          data = data[0];
          // save desired fields in object
          let leagueData;
          // if no rank
          if(data === undefined)
          leagueData = {leagueName: "N/A", tier: "UNRANKED", rank: "N/A", leaguePoints: "0", rankedWins: "0", rankedLosses: "0"};
          else
          leagueData = {leagueName: data.leagueName, tier: data.tier, rank: data.rank, leaguePoints: data.leaguePoints, rankedWins: data.wins, rankedLosses: data.losses};
          // add requested properties to new object
          for (var newAttr in leagueData)
          player[newAttr] = leagueData[newAttr];
          break;
        }
      });
    };
    // send get request
    request.send();
  }
  // after reqs are recieved
  setTimeout(function() {
    // setup window
    initializeWindow(data.IGN);
    // fill table
    leagueTable(player);
  }, 500);
}

// TODO: Add in Champion Images, Request Champion Name Using ID from ddragon
//http://ddragon.leagueoflegends.com/cdn/<ver>/img/champion/<id>.png
//http://ddragon.leagueoflegends.com/cdn/<ver>/data/en_US/champion.json

function leagueTable(data) {
  // table header data
  const tableHeaders = ['SUMMONER', 'RANKED', 'MASTERY'];
  // cell data
  const cellHeaders = [['Summoner ID', 'Level', 'Total Mastery'], ['Tier', 'Rank', 'LP', 'Wins', 'Losses'], ['', 'Name', 'Level', 'Points', '', 'Name', 'Level', 'Points']];
  const cellData = [{stats: ['id', 'level', 'masteryLevel']}, {stats: ['tier', 'rank', 'leaguePoints', 'rankedWins', 'rankedLosses']},
  {category: 'championMastery', stats: ['', 'championId', 'championLevel', 'championPoints', '', 'championId', 'championLevel', 'championPoints']}];
  // set icon
  $('#playerIcon').attr('src', 'http://ddragon.leagueoflegends.com/cdn/<ver>/img/profileicon/<iconID>.png'.replace('<ver>', realmData.version).replace('<iconID>', data.iconID));
  // retrieve table
  var statTable = $('#statTable');
  // counter for champ display
  let champNum = -1;
  // iterate through the table
  for(let i = 0; i < tableHeaders.length; i++) {
    // create header text
    let headerText = $('<th>', {align: 'center', colspan: cellHeaders[i].length}).text(tableHeaders[i]);
    let headerRow = $('<tr>', {class: 'tableHeader'}).append(headerText);
    // append header to table
    statTable.append(headerRow);
    // row to be added
    let tableRow = $('<tr>');
    // iterate through stats
    for(let j = 0; j < cellHeaders[i].length; j++) {
      // cell to be added
      let tableCell, cellKey, cellValue;
      // if there is no category (use different data)
      if(cellData[i].category === undefined) {
        // cell key (bolded) and cell value (not bolded)
        cellKey = $('<span>').css('font-weight', 'bold').css('display', 'block').text(cellHeaders[i][j] + ':');
        cellValue = $('<span>').css('font-weight', 'normal').text(data[cellData[i].stats[j]]);
      }
      else {
        // localize data
        let championData = data[cellData[i].category];
        // add key to cell
        if(cellHeaders[i][j] !== '')
          cellKey = $('<span>').css('font-weight', 'bold').css('display', 'block').text(cellHeaders[i][j] + ':');
        // display image every first cell
        if(j % 4 === 0) {
          cellValue = $('<img>', {src: 'http://ddragon.leagueoflegends.com/cdn/7.5.2/img/champion/Warwick.png', class: 'champIcon', title: 'Warwick'});
          champNum++;
        }
        else
          cellValue = $('<span>').css('font-weight', 'normal').text(championData[champNum][cellData[i].stats[j]]);
      }
      // append values to cell
      tableCell = $('<td>').append(cellKey).append(cellValue);
      // add cell to row
      tableRow.append(tableCell);
    }
    // add table row to table
    statTable.append(tableRow);
  }
}
