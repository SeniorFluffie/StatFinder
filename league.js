// for optimizations and debugging
'use strict';

const league_URLS = {base: 'https://na1.api.riotgames.com',
url: ['/lol/champion-mastery/v3/scores/by-summoner/<id>',
'/lol/champion-mastery/v3/champion-masteries/by-summoner/<id>',
'/lol/league/v3/positions/by-summoner/<id>']};

const realmData = {version: '8.11.1', championLoaded: false };

function setChampionList() {
  if(!realmData.championLoaded) {
    // create req and url
    let request = new XMLHttpRequest();
    let url = 'http://ddragon.leagueoflegends.com/cdn/<ver>/data/en_US/champion.json'.replace('<ver>', realmData.version);
    request.open('GET', url, true);
    // upon success
    request.onreadystatechange = function() {
      // if request is ready and successful
      requestHandler(this, function () {
        // save data
        realmData.championData = JSON.parse(request.responseText).data;
        // update flag
        realmData.championLoaded = true;
      });
    };
    request.send();
  }
}

function leagueSearch(data) {
  // store initial search
  let player = {id: data.id, iconID: data.profileIconId, level: data.summonerLevel};
  // iterate through all http requests
  for(let i = 0; i < league_URLS.url.length; i++) {
    // swap out url tag
    let url = league_URLS.base.concat(league_URLS.url[i].replace('<id>', player.id).concat('?api_key=' + data.key));
    // create XML request
    let request = new XMLHttpRequest();
    // open asynchronous get request
    request.open('GET', url, true);
    // instructions for when the message is recieved
    request.onreadystatechange = function() {
      // handle request
      requestHandler(this, function () {
        // parse data
        let data = JSON.parse(request.responseText);
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
          leagueData = {leagueName: 'N/A', tier: 'UNRANKED', rank: 'N/A', leaguePoints: '0', rankedWins: '0', rankedLosses: '0'};
          else
          leagueData = {leagueName: data.leagueName, tier: data.tier, rank: data.rank, leaguePoints: data.leaguePoints, rankedWins: data.wins, rankedLosses: data.losses};
          // add requested properties to new object
          for (var newAttr in leagueData)
            player[newAttr] = leagueData[newAttr];
          break;
        }
      });
    };
    request.send();
  }
  // set list (before timeout)
  setChampionList();
  // after reqs are recieved
  setTimeout(function() {
    // setup window
    initializeWindow();
    // fill table
    leagueTable(player);
  }, 500);
}

function leagueTable(data) {
  // table information
  const tableHeaders = ['SUMMONER', 'RANKED', 'MASTERY', 'MASTERY'];
  const cellHeaders = [['Summoner ID', 'Level', 'Total Mastery'], ['League', 'Tier', 'Rank', 'LP', 'Wins', 'Losses'], ['', 'Name', 'Level', 'Points', '', 'Name', 'Level', 'Points'], ['', 'Name', 'Level', 'Points', '', 'Name', 'Level', 'Points']];
  const cellData = [{stats: ['id', 'level', 'masteryLevel']}, {stats: ['leagueName', 'tier', 'rank', 'leaguePoints', 'rankedWins', 'rankedLosses']},
  {category: 'championMastery', stats: ['', 'championId', 'championLevel', 'championPoints', '', 'championId', 'championLevel', 'championPoints']},
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
    let tableRow = $('<tr>').attr("width", "480px");
    // iterate through stats
    for(let j = 0; j < cellHeaders[i].length; j++) {
      // cell to be added
      let tableCell, cellKey, cellValue;
      // if there is no category (use different data)
      if(cellData[i].category === undefined) {
        // cell key (bolded) and cell value (not bolded)
        cellKey = $('<strong>').css('display', 'block').text(cellHeaders[i][j] + ':');
        cellValue = $('<span>').text(data[cellData[i].stats[j]]);
      }
      else {
        // localize data
        let masteryData = data[cellData[i].category];
        // add key to cell
        if(cellHeaders[i][j] !== '')
          cellKey = $('<strong>').css('display', 'block').text(cellHeaders[i][j] + ':');
        // display image every first cell
        if(j % 4 === 0) {
          // increment champion number
          champNum++;
          // localize champion data
          let champID = masteryData[champNum][cellData[i].stats[j+1]];
          // find matching champ to ID
          let champ = Object.values(realmData.championData).find(function (obj) {
            return obj.key == champID;
          });
          // set url
          let url = 'http://ddragon.leagueoflegends.com/cdn/<ver>/img/champion/'.replace('<ver>', realmData.version) + champ.id + '.png';
          // update cell
          cellValue = $('<img>', {src: url, class: 'champIcon', title: champ.name});
          // modify property
          masteryData[champNum][cellData[i].stats[j+1]] = champ.name;
        }
        else
          cellValue = $('<span>').text(masteryData[champNum][cellData[i].stats[j]]);
      }
      // append values to cell
      tableCell = $('<td>').css('padding', '1').append(cellKey).append(cellValue);
      // add cell to row
      tableRow.append(tableCell);
    }
    // add table row to table
    statTable.append(tableRow);
  }
}
