
// document.getElementById('button').addEventListener('click', () => {

// Auto reconnect?
// https://googlechrome.github.io/samples/web-bluetooth/automatic-reconnect.html

let bluetoothDevice = null;

document.addEventListener('keypress', () => {

const serviceUuid = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const characteristicUuid = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';


function handleNotifications(event) {
  let value = event.target.value;
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
  // console.log(event.target.value,
  //   value.getUint8(0),
  //   value.getUint16(0),
  //   value.getUint32(0),
  //   value.getInt8(0),
  //   value.getInt16(0),
  //   value.getInt32(0),
  // );
  // debugger;

  // 2nd arg 'true' means BIG-ENDIAN value
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint32
  console.log('%cNOTIFICATION', 'color: green; font-weight: bold;');
  console.log(value.getUint32(0, true));
}

function handleDisconnect( event ){
  console.log('%cDISCONNECT', 'color: red; font-weight: bold;', event );
}

console.log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
    // filters: [{services: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b' ]}]
  }).then(device => {
    console.log('Connecting to GATT Server...');
    device.addEventListener( 'gattserverdisconnected', handleDisconnect );
    return device.gatt.connect();
  })
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
      myCharacteristic.addEventListener('characteristicvaluechanged',
          handleNotifications);
    });
  })
  .catch(error => {
    console.log('Argh! ' + error);
  });

});
