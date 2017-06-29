import door from './door';

const debug = require('debug')('controller:garage');

const garage = {
  opened: false,

  openDoor: function() {
    debug('openDoor');

    door.toggle();

    garage.opened = true;
  },

  closeDoor: function () {
    debug('closeDoor');

    door.toggle();

    garage.opened = false;
  },

  identify: function () {
    debug('identify');
  },

  doorStatus: function () {
    debug('doorStatus');
  },

  isDoorOpened: function () {
    debug('isDoorOpened', garage.opened);

    return garage.opened;
  }
};

export default garage;
