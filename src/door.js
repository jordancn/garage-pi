import Switch from './switch';

const debug = require('debug')('controller:door');

const door = {
  opened: false,

  openDoor: function() {
    debug('openDoor');

    Switch.toggle();

    door.opened = true;
  },

  closeDoor: function () {
    debug('closeDoor');

    Switch.toggle();

    door.opened = false;
  },

  identify: function () {
    debug('identify');
  },

  doorStatus: function () {
    debug('doorStatus');
  },

  isDoorOpened: function () {
    debug('isDoorOpened', door.opened);

    return door.opened;
  }
};

export default door;
