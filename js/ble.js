
// document.getElementById('button').addEventListener('click', () => {

// Auto reconnect?
// https://googlechrome.github.io/samples/web-bluetooth/automatic-reconnect.html

let bluetoothDevice = null;

// document.addEventListener('keypress',
const initBLE = () => {

const serviceUuid = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const characteristicUuid = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';


// function handleNotifications(event) {
//   let value = event.target.value;
//   // let a = [];
//   // Convert raw data bytes to hex values just for the sake of showing something.
//   // In the "real" world, you'd use data.getUint8, data.getUint16 or even
//   // TextDecoder to process raw data bytes.
//   // for (let i = 0; i < value.byteLength; i++) {
//   //   a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
//   // }
//   // console.log('> ' + a.join(' '));
//   // let decoder = new TextDecoder('utf-8');
//   // console.log('Notified: ', decoder.decode(value));
//   // console.log(event.target.value,
//   //   value.getUint8(0),
//   //   value.getUint16(0),
//   //   value.getUint32(0),
//   //   value.getInt8(0),
//   //   value.getInt16(0),
//   //   value.getInt32(0),
//   // );
//   // debugger;
//
//
//   const date = new Date();
//   const now = date.getTime();
//   const timeSinceLastUpdate = now - lastRotationUpdate;
//   lastRotationUpdate = now;
//
//   // Ignore updates that take longer than 10s
//   if( timeSinceLastUpdate > 10000 ){
//     console.log(`(ignoring ${timeSinceLastUpdate})`);
//
//     // stop video?
//     // rotationInterval = 20000;
//
//     return;  // ignore!
//   }
//
//   rotationInterval = value.getUint32(0, true);
//   // ^ 2nd arg 'true' means BIG-ENDIAN value
//   // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint32
//
//   // Call the function in main.js to actually change the video rate
//   updatePlaybackRate( rotationInterval );
//
//   const ts = '[' + date.toJSON().substr(11, 8) + ']';
//   console.log(`%c ${ts} Notify`, 'color: green; font-weight: bold;', rotationInterval);
//
// }
//

function connect(){

  exponentialBackoff(100 /* max retries */, 2 /* seconds delay */,
    function toTry() {
      time('Connecting to Bluetooth Device... ');
      return bluetoothDevice.gatt.connect()
        .then(server => {
          console.log('Getting Service...');
          // Freezing here???????
          return server.getPrimaryService(serviceUuid);
        })
        .then(service => {
          console.log('Getting Characteristic...');
          return service.getCharacteristic(characteristicUuid);
        })
        .then(characteristic => {
          myCharacteristic = characteristic;
          return myCharacteristic.startNotifications().then(_ => {
            console.log('%c> Notifications started', 'color: blue; font-weight: bold;');
            // myCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
            myCharacteristic.oncharacteristicvaluechanged =  handleNotifications;
          });
        })
        // .catch(error => {
        //   console.log('Argh! ' + error);
        // });


    },
    function success() {
      // log('> Bluetooth Device connected. Try disconnect it now.');

    },
    function fail() {
      time('Failed to reconnect.');
    });


}

function handleDisconnect( event ){
  console.log('%cDISCONNECT', 'color: red; font-weight: bold;', event );
  connect(); // try to reconnect periodically!
}

console.log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
    // filters: [{services: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b' ]}]
  }).then(device => {
    bluetoothDevice = device;
    console.log('Connecting to GATT Server...');
    device.addEventListener( 'gattserverdisconnected', handleDisconnect );
    connect();
  })
  .catch(error => {
    console.log('Initial connect error: ' + error);
  });


};

/* Utils */

// This function keeps calling "toTry" until promise resolves or has
// retried "max" number of times. First retry has a delay of "delay" seconds.
// "success" is called upon success.
function exponentialBackoff(max, delay, toTry, success, fail) {
  toTry().then(result => success(result))
  .catch(_ => {
    if (max === 0) {
      return fail();
    }
    time('Retrying in ' + delay + 's... (' + max + ' tries left)');
    setTimeout(function() {
      exponentialBackoff(--max, delay * 2, toTry, success, fail);
    }, delay * 1000);
  });
}

function time(text) {
  console.log('[' + new Date().toJSON().substr(11, 8) + '] ' + text);
}


document.addEventListener('touchstart', function(e) {
  if( e.touches.length === 3 ){
    initBLE();
  }
}, false);

// document.querySelector('#button').addEventListener('click', initBLE);
