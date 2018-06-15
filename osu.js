// for optimizations and debugging
'use strict';

const osu_URLS = {base: 'https://osu.ppy.sh/', url: ['/api/get_user_best?k=<key>&u=<ign>']};

function osuSearch(data) {
  // localize data
  let player = {stats: data[0], key: data.key};
  // set list (before timeout)
  retrieveMaps(osu_URLS.url[0], player, 'maps');
  // after reqs are recieved
  setTimeout(function() {
    // setup window
    initializeWindow();
    // set icon
    $('#playerIcon').attr('src', '/images/avatar_osu.png');
    // fill table
    updateView(player, osuTable);
    loadView();
  }, 500);
}

function retrieveMaps(url, data, prop) {
  // create req and url
  let request = new XMLHttpRequest();
  url = osu_URLS.base + url.replace('<key>', data.key).replace('<ign>', data.stats.username);
  // setup request
  request.open('GET', url, true);
  request.setRequestHeader('Access-Control-Allow-Origin', '*');
  // upon success
  request.onreadystatechange = function() {
    // if request is ready and successful
    requestHandler(this, function() {
      // save data
      data[prop] = JSON.parse(request.responseText).slice(0, 4);
    });
  };
  request.send();
}

function osuTable(data) {
  // table information
  const headerData = [{header: 'USER:', index: [0, 1, 2]}, {header: '1ST TOP SCORE:', property: ['maps', '0'], index: [3, 4]},
  {header: '2ND TOP SCORE:', property: ['maps', '1'], index: [3, 4]}];
  const tableCells = [[{title: 'Level:', key: 'level'}, {title: 'Total Score:', key: 'total_score'}, {title: 'Ranked Score:', key: 'ranked_score'},
  {title: 'Plays:', key: 'playcount'}, {title: 'Accuracy:', key: 'accuracy'}],

  [{title: 'Rank A:', key: 'count_rank_a'}, {title: 'Rank S:', key: 'count_rank_s'}, {title: 'Hidden S:', key: 'count_rank_sh'},
  {title: 'Rank SS:', key: 'count_rank_ss'}, {title: 'Hidden SS:', key: 'count_rank_ssh'}],

  [{title: 'PP Rank:', key: 'pp_rank'}, {title: 'Country Rank:', key: 'pp_country_rank'}, {title: '50 Count:', key: 'count50'},
  {title: '100 Count:', key: 'count100'}, {title: '300 Count:', key: 'count300'}],

  [{title: 'Beatmap ID:', key: 'beatmap_id'}, {title: 'Date:', key: 'date'}, {title: 'Score:', key: 'score'},
  {title: 'Rank:', key: 'rank'}, {title: 'PP:', key: 'pp'}],

  [{title: 'Maximum Combo:', key: 'maxcombo'}, {title: '50 Count:', key: 'count50'}, {title: '100 Count:', key: 'count100'},
  {title: '300 Count:', key: 'count300'}, {title: 'Perfect:', key: 'perfect'}]];
  // initialize table styling
  let cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': '120%', 'font-size': '9pt'}];
  let headerStyle = {'line-height': '105%'};
  // setup display
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
}
