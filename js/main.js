
const videos = [
  {
    id: 'M0bIbOYKITM',
    title: 'Col Des Tentes, French Pyrenees (Bike the World)',
    minTime: 30, maxTime: 3600,
  },
  {
    id: '07hTCBH8goQ',
    title: ' Picos de Europa - mountains of Cantabria, Spain (Bike the World)',
    minTime: 30, maxTime: 3600,
  },
  {
    id: 'dCjt9eptadI',
    title: 'Cotswalds UK, Sunset 30min',
    minTime: 80, maxTime: 600, // total time only 30 min
  },
  {
    id: 'ILqmM_ot36U',
    title: 'Great Coastal Road, NZ',
    minTime: 80, maxTime: 4800, // total time only 30 min
  },
  {
    id: 'XvOUQOK69TA',
    title: 'Hill Towns and Villages of Luberon (Provence)',
    minTime: 30, maxTime: 3500, // total time only 30 min
  },

];

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

const minInterval = 1500;
const maxInterval = 6000; //10000;

// const NOTIFICATION_TIMEOUT_MS = 8000;

// const timerActive = false;
// let interval = 0;
let videoStopped = false;
let timerID = null;

let notificationTimeoutID = null;

// originally in ble.js until handleNotifications() moved here
let rotationInterval = 0;    // actual reading
let lastRotationUpdate = 0;  // timer

const speedBox = document.querySelector('#a');
const intervalBox = document.querySelector('#b');
const overlay = document.querySelector('#overlay');

const urlParams = new URLSearchParams(window.location.search);

const debug = urlParams.get('debug');
const videoIndex = urlParams.get('v') || Math.floor( Math.random() * videos.length );

const video = videos[ videoIndex ];

console.log('debug', debug);
console.log('videoIndex', videoIndex, video);

// const debug = urlParams.get('debug');


if( debug ){
  document.querySelector('.slidecontainer').style.display = 'inline-block';
  console.log('DEBUG');
}

const timeoutSlowDown = () => {
  const nextTimeout = rotationInterval * 0.75;
  rotationInterval *= 1.5; // update globally, slow down more quickly
  updatePlaybackRate( rotationInterval );
  console.log( 'timeoutSlowDown:', rotationInterval, 'next:', nextTimeout  );

  clearTimeout( notificationTimeoutID ); // just in case?
  notificationTimeoutID = setTimeout( timeoutSlowDown, nextTimeout );
};


const handleNotifications = (event, fakeData=null) => {
  console.log('handleNotifications', {event, fakeData});

  /*
  // let value = event.target.value;
  // let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  // for (let i = 0; i < value.byteLength; i++) {
  //   a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  // }
  // console.log('> ' + a.join(' '));
  // let decoder = new TextDecoder('utf-8');
  // console.log('Notified: ', decoder.decode(value));
  // console.log(event.target.value, value.getUint32(0) );
*/

  const date = new Date();
  const now = date.getTime();
  const timeSinceLastUpdate = now - lastRotationUpdate;
  lastRotationUpdate = now;

  // Ignore updates that take longer than 10s
  if( !fakeData && timeSinceLastUpdate > 10000 ){
    console.log(`(ignoring ${timeSinceLastUpdate})`);
    return;  // ignore!
  }

  if( fakeData ){
    rotationInterval = fakeData; // for testing
    clearTimeout( timerID );
    timerID = setTimeout( () => handleNotifications( {}, fakeData ), fakeData ); // next timer
  } else {
    // get real sensor data
    const value = event.target.value.getUint32(0, true);

    if( value < minInterval/2 ){
      return; //ignore intervals which are too small (bad data)
    }

    rotationInterval = event.target.value.getUint32(0, true);
    // ^ 2nd arg 'true' means BIG-ENDIAN value
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint32
  }


  updatePlaybackRate( rotationInterval ); // actually change the video rate

  const ts = '[' + date.toJSON().substr(11, 8) + ']';
  console.log(`%c ${ts} Notify`, 'color: green; font-weight: bold;', rotationInterval);

  // Deal with excess wait timeouts
  clearTimeout( notificationTimeoutID );
  notificationTimeoutID = setTimeout( timeoutSlowDown, rotationInterval * 1.5 );

} // handleNotifications()


const updatePlaybackRate = interval => {

  const rate = mapRange(interval, minInterval, maxInterval, 2, 0 );
  console.log('updatePlaybackRate:', {interval, rate});

  if( rate < 0.1 ){
    player.pauseVideo(); // stop video when rate is too low
  } else {
    // if(player.getPlayerState() === 5)
    player.playVideo().setPlaybackRate( rate );
    console.log('updatePlaybackRate SET', rate);
  }

  speedBox.innerHTML  =  'speed: ' + rate.toFixed(2);
}; // updatePlaybackRate()


const mapRange = (v, inMin, inMax, y, z, clamp=true) => {
  if( clamp ){
    v = Math.min(v, inMax); // clamp max
    v = Math.max(v, inMin); // clamp min
  }
  const norm = (v - inMin) / parseFloat(inMax - inMin)
  return norm * (z - y) + y
};

// min speed: 0.25
// max speed: 2

const randStart = video.minTime + parseInt( video.maxTime * Math.random() );
console.log({ randStart });

// 2. This code loads the IFrame Player API code asynchronously.
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: video.id,
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
      'onReady':  () => {
        player.mute();
      },
      // 'onPlaybackRateChange': () => {},
      'onStateChange': (ev) => {
        overlay.className = (ev.data === YT.PlayerState.PLAYING) ? '' : 'flash';
      }
    }
  });
}

document.querySelector('#interval').addEventListener('change', e => {
  // const factor = e.target.value/1000.0;

  const interval = parseInt(mapRange(e.target.value, 1, 1000, minInterval, maxInterval)); // 200, 2000

  // TESTING: call BT update method after fake interval:
  clearTimeout( timerID );
  timerID = setTimeout( () => {
    handleNotifications( {}, interval );
  });

  console.log( 'interval', interval);
  intervalBox.innerHTML  =  'interval: ' + parseInt(interval);
  // speedBox.innerHTML  =  'speed: ' + rate.toFixed(2);

});

document.querySelector('#speed').addEventListener('change', e => {
  const factor = e.target.value/1000.0;  // normalised value
  const rate = 0.2 + ((2 - 0.2) * factor);

  if( rate < 0.25 ){
    player.pauseVideo();
  } else {
    player.playVideo();
    player.setPlaybackRate( rate );
  }

  // console.log( rate );
  speedBox.innerHTML  =  'speed: ' + rate.toFixed(2);
});
