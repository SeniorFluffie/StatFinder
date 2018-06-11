// for optimizations and debugging
'use strict';

const league_URLS = {base: 'https://na1.api.riotgames.com',
url: ['/lol/champion-mastery/v3/scores/by-summoner/<id>',
'/lol/champion-mastery/v3/champion-masteries/by-summoner/<id>',
'/lol/league/v3/positions/by-summoner/<id>']};

const realmData = {version: '8.11.1', championLoaded: false};

function simplifyLeague(data) {
  // iterate through array
  for(let topChamp of data.championMastery) {
    // return champ with the desired id
    let champ = Object.values(realmData.championData).find(function (obj) {
      return obj.key == topChamp.championId;
    });
    // localize src and name
    topChamp.champImage = 'http://ddragon.leagueoflegends.com/cdn/<ver>/img/champion/'.replace('<ver>', champ.version) + champ.image.full;
    topChamp.champName = champ.name;
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
          player.championMastery = data.slice(0, 4);
          break;
          case 2:
          // as req differs
          data = data[0];
          // save desired fields in object
          data === undefined ? player.rankedStats = {leagueName: 'N/A', tier: 'UNRANKED', rank: 'N/A', leaguePoints: '0', wins: '0', losses: '0'}
          : player.rankedStats = data;
          break;
        }
      });
    };
    request.send();
  }
  // set list (before timeout)
  getChampionList();
  // after reqs are recieved
  setTimeout(function() {
    // setup window
    initializeWindow();
    // prepare data
    simplifyLeague(player);
    // fill table
    leagueTable(player);
  }, 700);
}

function getChampionList() {
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

function leagueTable(data) {
  // table information
  const headerData = [{header: 'SUMMONER', index: [0]}, {header: 'RANKED', property: ['rankedStats'], index: [1]},
  {header: 'MASTERY', property: ['championMastery'], index: [2], increment: -1}, {header: 'MASTERY', property: ['championMastery'], index: [2], increment: 1}];
  const tableCells = [[{title: 'Summoner ID', key: 'id'}, {title: 'Level', key: 'level'}, {title: 'Total Mastery', key: 'masteryLevel'}],

  [{title: 'League', key: 'leagueName'}, {title: 'Tier', key: 'tier'}, {title: 'Rank', key: 'rank'}, {title: 'LP', key: 'leaguePoints'},
  {title: 'Wins', key: 'wins'}, {title: 'Losses', key: 'losses'}],

  [{title: '', key: 'champImage', img: true, increment: true}, {title: 'Name', key: 'champName'}, {title: 'Level', key: 'championLevel'}, {title: 'Points', key: 'championPoints'},
  {title: '', key: 'champImage', img: true, increment: true}, {title: 'Name', key: 'champName'}, {title: 'Level', key: 'championLevel'}, {title: 'Points', key: 'championPoints'}]];
  // initialize table styling
  let cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': '155%', 'font-size': '9pt'}];
  let headerStyle = {'line-height': '150%'};
  // set icon
  $('#playerIcon').attr('src', 'http://ddragon.leagueoflegends.com/cdn/<ver>/img/profileicon/<iconID>.png'.replace('<ver>', realmData.version).replace('<iconID>', data.iconID));
  // setup display
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
}
