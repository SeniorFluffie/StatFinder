// for optimizations and debugging
'use strict';

function fortniteSearch(data) {
  // check for errors
  if(data.error !== undefined)
    alert('Player not found!');
  else {
    // setup window / icon / table
    initializeWindow();
    // set icon
    $('#playerIcon').attr('src', '/images/avatar_fortnite.png');
    // setup table
    fortniteTable(data);
  }
}

function fortniteTable(data) {
  // table information
  const headerData = [{header: 'OVERALL:', property: ['lifeTimeStats'], index: [0]}, {header: 'SOLO:', index: [1], property: ['stats', 'p2']},
  {header: 'DUO:', index: [2], property: ['stats', 'p10']}, {header: 'SQUADS:', index: [3], property: ['stats', 'p9']}];

  const tableCells = [
  [{title: 'Wins:', key: 8}, {title: 'Win %:', key: 9}, {title: 'Kills:', key: 10}, {title: 'KD:', key: 11},
  {title: 'Matches:', key: 7}, {title: 'Top 3:', key: 2}, {title: 'Top 12:', key: 4}, {title: 'Top 25:', key: 5}],

  [{title: 'Top 1:', key: 'top1'}, {title: 'Win %:', key: 'winRatio'}, {title: 'Kills:', key: 'kills'}, {title: 'KD:', key: 'kd'},
  {title: 'KPG:', key: 'kpg'}, {title: 'Matches:', key: 'matches'}, {title: 'Top 10:', key: 'top10'}, {title: 'Top 25:', key: 'top25'}],

  [{title: 'Top 1:', key: 'top1'}, {title: 'Win %:', key: 'winRatio'}, {title: 'Kills:', key: 'kills'}, {title: 'KD:', key: 'kd'},
  {title: 'KPG:', key: 'kpg'}, {title: 'Matches:', key: 'matches'}, {title: 'Top 5:', key: 'top5'}, {title: 'Top 12:', key: 'top12'}],

  [{title: 'Top 1:', key: 'top1'}, {title: 'Win %:', key: 'winRatio'}, {title: 'Kills:', key: 'kills'}, {title: 'KD:', key: 'kd'},
  {title: 'KPG:', key: 'kpg'}, {title: 'Matches:', key: 'matches'}, {title: 'Top 3:', key: 'top3'}, {title: 'Top 6:', key: 'top6'}]];
  // initialize table styling
  let headerStyle = {'line-height': '150%'};
  let cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': '140%'}];
  // setup display
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
}
