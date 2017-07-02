import gpio from 'rpi-gpio';
import config from '../config.json';
const debug = require('debug')('controller:switch');

const togglePin = config.door.pins.toggle;

gpio.setMode(gpio.MODE_RPI);

const timeout = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const toggle = async () => {
  try {
    // initial unexport the pin
    debug(`unexport GPIO pin ${togglePin}`);
    const initialUnexportError = await gpio.unexportPin(togglePin);
  } catch (errors) {
    // do nothing
  }

  try {
    // setup
    debug(`setup GPIO pin ${togglePin}`);
    const setupError = await gpio.setup(togglePin, gpio.DIR_OUT);

    // toggle on
    debug('toggle button on');
    const toggleOnError = await gpio.write(togglePin, 1);

    // timeout: 500 ms
    debug('timeout 500 ms');
    await timeout(500);

    // toggle off
    debug('toggle button off');
    const toggleOffError = await gpio.write(togglePin, 0);

    // timeout: 1000 ms
    debug('timeout 1000 ms');
    await timeout(1000);

    // unexport the pin
    debug(`unexport GPIO pin ${togglePin}`);
    const unexportError = await gpio.unexportPin(togglePin);
  } catch (errors) {
    console.error(errors);
    debug(`unexport GPIO pin ${togglePin}`);
    const unexportError = await gpio.unexportPin(togglePin);
  }
}

export default { toggle }

