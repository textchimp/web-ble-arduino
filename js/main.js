
// FASTEST: 1000 ms between pedals
// SLOWEST: 6500 ms (6000?)
// average:
//   2000 probably JB fastest,
//   2500 leisurely,
//   3000 slow,
//   5000 hard to maintain

// Set timeout after each update -
// if wait more than 6s, stop video?

// function mapLinear ( x, a1, a2, b1, b2 ) {
//     return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
// }

const updatePlaybackRate = interval => {

  const minInterval = 1500;
  const maxInterval = 10000;

  const rate = mapRange(interval, minInterval, maxInterval, 2, 0 );
  console.log('UPDATING!', interval, rate);


  // player.setPlaybackRate( rate );
  if( rate < 0.1 ){
    player.pauseVideo();
  } else {
    player.playVideo();
    player.setPlaybackRate( rate );
  }
};

const mapRange = (v, inMin, inMax, y, z, clamp=true) => {
if( clamp ){
  v = Math.min(v, inMax); // clamp max
  v = Math.max(v, inMin); // clamp min
}
const norm = (v - inMin) / parseFloat(inMax - inMin)
return norm * (z - y) + y
};

// player.setPlaybackRate(1) // etc

// min speed: 0.25
// max speed: 2

const randStart = parseInt( 3600 * Math.random() );
console.log({ randStart });

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: 'M0bIbOYKITM',
    // playerVars: { 'autoplay': 1, 'controls': 0 },
    playerVars: {
     // 'autoplay': 1,
     'controls': 1,
     'rel' : 0,
     'fs' : 0,
     start: randStart
     // 't': randStart + 's'
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
       // 'onPlaybackRateChange': onRateChange
    }
  });
}

document.querySelector('#interval').addEventListener('change', e => {
  // const factor = e.target.value/1000.0;
  interval = mapRange(e.target.value, 1, 1000, 200, 2000);
  const rate = mapRange(interval, 200, 2000, 2, 0);

  // player.setPlaybackRate( rate );
  if( rate < 0.1 ){
    player.pauseVideo();
  } else {
    player.playVideo();
    player.setPlaybackRate( rate );
  }

  console.log( 'interval, rate = ' + interval + ' ' + rate );
});

document.querySelector('#speed').addEventListener('change', e => {
  const factor = e.target.value/1000.0;
  const rate = 0.2 + ((2 - 0.2) * factor);
  if( rate < 0.25 ){
    player.pauseVideo();
  } else {
    player.playVideo();
    player.setPlaybackRate( rate );
  }
  // console.log( rate );
});

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  // event.target.playVideo();
  // player.seekTo( rate );
  // player.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  // if (event.data == YT.PlayerState.PLAYING && !done) {
  //   setTimeout(stopVideo, 6000);
  //   done = true;
  // }
}
function stopVideo() {
  player.stopVideo();
}
