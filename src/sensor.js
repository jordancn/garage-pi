import gpio from 'rpi-gpio';
import config from '../config.json';
const debug = require('debug')('controller:sensor');

const closedPin = config.door.pins.closed;

// gpio.setMode(gpio.MODE_RPI);

// debug('sensor setup');

// let status = false;

// gpio.on('change', function(channel, value) {
// 	debug('Channel ' + channel + ' value is now ' + value);

//   if (channel === closedPin) {
//   	debug('Door value is ' + value);
//     status = value;
//   }
// });
// gpio.setup(config.door.pins.closed, gpio.DIR_IN, gpio.EDGE_BOTH);


// const isDoorClosed = async () => {
//   let closedStatus = false;

//   // try {
//   //   // initial unexport the pin
//   //   debug(`unexport GPIO pin ${closedPin}`);
//   //   const initialUnexportError = await gpio.unexportPin(closedPin);
//   // } catch (errors) {
//   //   // do nothing
//   // }

//   // try {
//     // setup
//     debug(`setup GPIO pin ${closedPin}`);
//     const setupError = await gpio.setup(closedPin, gpio.DIR_IN, readInput);

//     function readInput() {
//       gpio.read(7, function(err, value) {
//           console.log('The value is ' + value);
//       });
//     }

//     // // read status
//     // debug('read status');
//     // status = gpio.read(closedPin, (error, status) => {
//     //   debug('closed status:', status);
//     //   closedStatus = status;
//     // });

//   //   // unexport the pin
//   //   debug(`unexport GPIO pin ${closedPin}`);
//   //   const unexportError = await gpio.unexportPin(closedPin);
//   // } catch (errors) {
//   //   console.error(errors);
//   //   debug(`unexport GPIO pin ${closedPin}`);
//   //   const unexportError = await gpio.unexportPin(closedPin);
//   // }

//   return closedStatus;
// }


var _ = require('lodash');

// var gpio = require('rpi-gpio');

gpio.setMode(gpio.MODE_RPI);

const readValue = () => {
  return new Promise((fulfill) => {
    gpio.setup(config.door.pins.closed, gpio.DIR_IN, function () {
      gpio.read(config.door.pins.closed, function(err, value) {
        debug('readValue', value);

        fulfill(value);
      });
    });
  });
}

const isDoorClosed = async () => {
  const status = await readValue();

  debug('isDoorClosed', status);

  return status;
}

export default { isDoorClosed };
