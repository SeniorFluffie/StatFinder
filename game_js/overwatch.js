// for optimizations and debugging
'use strict';

let overwatchCounter = {value: 0, mod: 2};

function overwatchSearch(data) {
  setTimeout(function() {
  // setup window
  $('#playerIcon').prop('src', data.data.icon);
  // prepare data
  localizeHeroes(data.data);
  simplifyOverwatch(data.data);
  // setup window
  updateView(data.data, overwatchTable, overwatchCounter);
  initializeWindow();
  // create tables
  loadView(false);
  }, 2000);
}

function localizeHeroes(data) {
  // get hero data
  let topHeroes = data.competitiveStats.topHeroes;
  // save name to each object
  for(let i in topHeroes)
    topHeroes[i].name = i;
  // turn data into array, then sort it
  topHeroes = Object.keys(topHeroes).map(i => topHeroes[i]);
  topHeroes.sort(compareTime);
  // take top few indices
  let heroesDisplayed = 3;
  data.topHeroes = topHeroes.slice(0, heroesDisplayed);
}

function compareTime(a, b) {
  // strip all non-numerics
  let aTime = Number(a.timePlayed.replace(/\D/g,''));
  let bTime = Number(b.timePlayed.replace(/\D/g,''));
  // automatically priotize hours
  if(a.timePlayed.includes('hours') && b.timePlayed.includes('minutes'))
    return -1;
  // automatically de-rank minutes
  else if(a.timePlayed.includes('minutes') && b.timePlayed.includes('hours'))
    return 1;
  // compare by name, if requestHandler
  else if(aTime === bTime)
    return a.name > b.name ? 1 : ((b.name > a.name) ? -1 : 0);
  // compare regularly
  else
    return bTime - aTime;
}

function simplifyOverwatch(data) {
  const props = ['competitiveStats', 'quickPlayStats'];
  // iterate each set of stats
  for(let path of props) {
    // delete un-used interfering properties
    delete data[path].topHeroes;
    delete data[path].careerStats.allHeroes.average;
    delete data[path].careerStats.allHeroes.deaths;
  }
}

function overwatchTable(data, tableNum) {
  // add tables
  addOverwatchCareer(data, tableNum);
  addOverwatchStats(data, tableNum);
}

function addOverwatchCareer(data, tableNum) {
  console.log(data);
  // intialize variables
  let headerData, tableCells, headerStyle, cellStyle;
  // if quickplay table
  if(tableNum === 0)  {
    headerData = [{header: ['CAREER STATS'], index: [0]}];
    tableCells = [[{title: '', key: 'levelIcon', img: true}, {title: 'Level', key: 'level'}]];
    // incase of no prestige
    if(data.prestigeIcon !== '')
      tableCells[0].push({title: '', key: 'prestigeIcon', img: true}, {title: 'Prestige', key: 'prestige'});
    // incase of no rating
    if(data.ratingIcon !== '')
      tableCells[0].push({title: '', key: 'ratingIcon', img: true}, {title: 'Rating', key: 'rating'});
    // incase of no rating
    if(data.endorsementIcon !== '')
      tableCells[0].push({title: '', key: 'endorsementIcon', img: true}, {title: 'Endorse', key: 'endorsement'});
    // incase of no rank
    if(data.ratingName === '' && data.rating === '')
      tableCells[0].push({title: 'Rank', key: 'N/A'}, {title: 'Value', key: 'N/A'});
    headerStyle = {'line-height': '105%'};
    cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': '130%', 'font-size': '10pt'}];
  }
  // else competitive table
  else if(tableNum === 1) {
    // table information
    headerData = [{header: ['TOP COMPETITIVE STATS'], property: ['topHeroes'], index: [0, 0, 0], increment: -1}];
    tableCells = [[{title: 'Name', key: 'name', increment: true}, {title: 'Played', key: 'timePlayed'}, {title: 'Wins', key: 'gamesWon'}, {title: 'Win %', key: 'winPercentage'},
    {title: 'Elims Per Life', key: 'eliminationsPerLife'}, {title: 'Weapon Acc', key: 'weaponAccuracy'}, {title: 'Obj Kills', key: 'objectiveKillsAvg'}]];
    headerStyle = {'line-height': '100%'};
    cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': '115%', 'font-size': '8pt'}];
  }
  // setup display
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
}

function addOverwatchStats(data, headerNum) {
  // table information
  let headerData;
  headerNum === 0 ? headerData = [{header: 'QUICKPLAY STATS', property: ['quickPlayStats'], index: [0, 1, 2, 3, 4]}]
  : headerData = [{header: 'COMPETITIVE STATS', property: ['competitiveStats'], index: [0, 1, 2, 3, 4]}];

  const tableCells = [[{title: 'Games', key: 'gamesPlayed'}, {title: 'Wins', key: 'gamesWon'}, {title: 'Played', key: 'timePlayed'}, {title: 'Cards', key: 'cards'},
  {title: 'Medals', key: 'medals'}, {title: 'Gold', key: 'medalsGold'}, {title: 'Silver', key: 'medalsSilver'}],

  [{title: 'Elims', key: 'eliminations'}, {title: 'Final Blows', key: 'finalBlows'}, {title: 'Solo Kills', key: 'soloKills'}, {title: 'Deaths', key: 'deaths'},
  {title: 'Obj Kills', key: 'objectiveKills'}, {title: 'Obj Time', key: 'objectiveTime'}, {title: 'Multi-Kills', key: 'multikills'}],

  [{title: 'Dmg', key: 'damageDone'}, {title: 'Hero Dmg', key: 'heroDamageDone'}, {title: 'Shield Dmg', key: 'barrierDamageDone'},
  {title: 'Fire', key: 'timeSpentOnFire'}, {title: 'Healing', key: 'healingDone'}, {title: 'Def Assists', key: 'defensiveAssists'},
  {title: 'Off Assists', key: 'offensiveAssists'}],

  [{title: 'Most Elims', key: 'eliminationsMostInGame'}, {title: 'Most FB', key: 'finalBlowsMostInGame'}, {title: 'Most SK', key: 'soloKillsMostInGame'},
  {title: 'Longest Fire', key: 'timeSpentOnFireMostInGame'}, {title: 'Most OK', key: 'objectiveKillsMostInGame'},
  {title: 'Most OT', key: 'objectiveTimeMostInGame'}, {title: 'Largest MK', key: 'multikillsBest'}],

  [{title: 'Most Dmg', key: 'allDamageDoneMostInGame'}, {title: 'Most HD', key: 'heroDamageDoneMostInGame'}, {title: 'Most SD', key: 'barrierDamageDoneMostInGame'},
  {title: 'Best Streak', key: 'killsStreakBest'}, {title: 'Most Healing', key: 'healingDoneMostInGame'}, {title: 'Most DA', key: 'defensiveAssistsMostInGame'},
  {title: 'Most OA', key: 'offensiveAssistsMostInGame'}]];

  // initialize table styling
  let headerStyle = {'line-height': '105%'};
  let fontSize, lineHeight;
  headerNum === 1 ? fontSize = '8pt' : fontSize = '9pt';
  headerNum === 1 ? lineHeight = '115%' : lineHeight = '125%';
  let cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': lineHeight, 'font-size': fontSize}];

  // setup display
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
}
