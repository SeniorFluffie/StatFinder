// for optimizations and debugging
'use strict';

function fortniteSearch(data) {
  // set icon
  $('#playerIcon').prop('src', '/images/avatar_fortnite.png');
  // simplify data
  simplifyFortnite(data.data);
  // setup window
  updateView(data.data, fortniteTable);
  initializeWindow();
  // create table
  loadView();
}

function simplifyFortnite(data) {
  // initialize stats
  let stats = ['curr_p2', 'curr_p9', 'curr_p10'];
  for(let stat of stats)
    if(data['stats'][stat] !== undefined)
      data['stats'][stat]['winRatio']['value'] += '%';
}

function fortniteTable(data) {
  // table information
  const headerData = [{header: 'OVERALL', property: ['lifeTimeStats'], index: [0]}, {header: 'SOLO', index: [1], property: ['stats', 'curr_p2']},
  {header: 'DUO', index: [2], property: ['stats', 'curr_p10']}, {header: 'SQUADS', index: [3], property: ['stats', 'curr_p9']}];

  const tableCells = [
  [{title: 'Wins', key: 8}, {title: 'Win %', key: 9}, {title: 'Kills', key: 10}, {title: 'KD', key: 11},
  {title: 'Matches', key: 7}, {title: 'Top 3', key: 2}, {title: 'Top 12', key: 4}, {title: 'Top 25', key: 5}],

  [{title: 'Top 1', key: 'top1'}, {title: 'Win %', key: 'winRatio'}, {title: 'Kills', key: 'kills'}, {title: 'KD', key: 'kd'},
  {title: 'Matches', key: 'matches'}, {title: 'KPG', key: 'kpg'}, {title: 'Top 10', key: 'top10'}, {title: 'Top 25', key: 'top25'}],

  [{title: 'Top 1', key: 'top1'}, {title: 'Win %', key: 'winRatio'}, {title: 'Kills', key: 'kills'}, {title: 'KD', key: 'kd'},
  {title: 'Matches', key: 'matches'}, {title: 'KPG', key: 'kpg'}, {title: 'Top 5', key: 'top5'}, {title: 'Top 12', key: 'top12'}],

  [{title: 'Top 1', key: 'top1'}, {title: 'Win %', key: 'winRatio'}, {title: 'Kills', key: 'kills'}, {title: 'KD', key: 'kd'},
  {title: 'Matches', key: 'matches'}, {title: 'KPG', key: 'kpg'}, {title: 'Top 3', key: 'top3'}, {title: 'Top 6', key: 'top6'}]];

  // initialize table styling
  let headerStyle = {'line-height': '150%'};
  let cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': '140%'}];

  // setup display
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
}
