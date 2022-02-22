/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  let showObjectsArray = [];
  let apiRequest = await axios.get(
    `http://api.tvmaze.com/search/shows?q=${query}`
  );

  //construct object with data pulled from api request
  for (let showData of apiRequest.data) {
    let showObject = {
      id: showData.show.id,
      name: showData.show.name,
      summary: showData.show.summary,
      image: showData.show.image,
    };
    showObjectsArray.push(showObject);
  }
  return showObjectsArray;
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $('#shows-list');
  $showsList.empty();

  //for each show object, construct html card
  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
           </div>
           <button class="episode-button" data-show-id="${show.id}">Show Episodes</button>
         </div>
       </div>
      `
    );
    //add card to dom
    $showsList.append($item);

    //if the show has an image availible, add it to card
    if (show.image !== null) {
      $(`.card[data-show-id="${show.id}"] div.card-body`).append(
        $(`<img class="card-img-top" src="${show.image.medium}">`)
      );
    }
  }
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$('#search-form').on('submit', async function handleSearch(evt) {
  evt.preventDefault();

  let query = $('#search-query').val();
  if (!query) return;

  $('#episodes-area').hide();

  let shows = await searchShows(query);

  populateShows(shows);
});

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  //get request
  let episodeObjectsArray = [];
  let episodeRequest = await axios.get(
    `http://api.tvmaze.com/shows/${id}/episodes`
  );
  //construct object for each show
  for (let episodeData of episodeRequest.data) {
    let episodeObject = {
      id: episodeData.id,
      name: episodeData.name,
      season: episodeData.season,
      number: episodeData.number,
    };
    episodeObjectsArray.push(episodeObject);
  }
  return episodeObjectsArray;
}

function populateEpisodes(episodesArray) {
  //for each episode object, add an formatted li to display properties
  for (episode of episodesArray) {
    $('#episodes-list').append(
      $(
        `<li data-episode-id="${episode.id}">Season ${episode.season}, Episode ${episode.number}, ${episode.name}</li>`
      )
    );
  }
  //reveal the episodes-area section
  $('#episodes-area').css('display', 'block');
}

//add click event on any button with class episode-button
$('.container').on('click', '.episode-button', async function (evt) {
  //clear episode list
  $('#episodes-list').empty();

  //get show id from targeted button
  let id = $(evt.target).data('show-id');
  //wait for episode list request
  let episodeObjects = await getEpisodes(id);
  //change episode list title
  $('h2').text(`${$(`.card[data-show-id=${id}] h5`).html()} Episodes`);
  //add episodes to the DOM
  populateEpisodes(episodeObjects);
});
