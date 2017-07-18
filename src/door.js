import Switch from './switch';
import Sensor from './sensor';

const debug = require('debug')('controller:door');

const door = {
  openDoor: async function() {
    debug('openDoor');

    Switch.toggle();
  },

  closeDoor: async function () {
    debug('closeDoor');

    Switch.toggle();
  },

  identify: function () {
    debug('identify');
  },

  isDoorOpened: async function () {
    debug('isDoorOpened');

    const closed = await Sensor.isDoorClosed();

    debug('isDoorOpened', !closed);

    return !closed;
  }
};

export default door;
