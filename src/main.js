import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import storage from 'node-persist';
import garageController from './garage';
import config from '../config.json';
const debug = require('debug')('controller:main');

if (!config.accessory.username) {
  throw new Error(`Username not found on accessory '${garageAccessory.displayName}'. Core.js requires all accessories to define a unique 'username' property.`);
}

if (!config.accessory.pincode) {
  throw new Error(`Pincode not found on accessory '${garageAccessory.displayName}'. Core.js requires all accessories to define a 'pincode' property.`);
}

debug(`accessory name: ${config.accessory.name}`);
debug(`accessory username: ${config.accessory.username}`);
debug(`accessory pincode: ${config.accessory.pincode}`);
debug(`accessory port: ${config.accessory.port}`);

var garageUUID = uuid.generate(`hap-nodejs:accessories:${config.accessory.name}`);
var garageAccessory = exports.accessory = new Accessory(config.accessory.name, garageUUID);

garageAccessory.username = config.accessory.username;
garageAccessory.pincode = config.accessory.pincode;

garageAccessory
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, config.opener.manufacturer)
  .setCharacteristic(Characteristic.Model, config.opener.model)
  .setCharacteristic(Characteristic.SerialNumber, config.opener.serialNumber);

garageAccessory.on('identify', function (paired, callback) {
  garageController.identify();

  callback();
});

garageAccessory
  .addService(Service.GarageDoorOpener, 'Garage Door')
  .setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED) // force initial state to CLOSED
  .getCharacteristic(Characteristic.TargetDoorState)
  .on('set', function(value, callback) {

    if (value == Characteristic.TargetDoorState.CLOSED) {
      garageController.openDoor();

      callback();

      garageAccessory
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
    }
    else if (value == Characteristic.TargetDoorState.OPEN) {
      garageController.closeDoor();

      callback();

      garageAccessory
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
    }
  });


garageAccessory
  .getService(Service.GarageDoorOpener)
  .getCharacteristic(Characteristic.CurrentDoorState)
  .on('get', function(callback) {

    var err = null;

    garageController.doorStatus();

    if (garageController.isDoorOpened) {
      callback(err, Characteristic.CurrentDoorState.OPEN);
    } else {
      callback(err, Characteristic.CurrentDoorState.CLOSED);
    }
  });


storage.initSync();

debug('publish');
garageAccessory.publish({
  port: config.accessory.port,
  username: config.accessory.username,
  pincode: config.accessory.pincode,
  category: Accessory.Categories.GARAGE_DOOR_OPENER,
});
