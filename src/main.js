import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import storage from 'node-persist';
import doorController from './door';
import config from '../config.json';
import Camera from './camera';
const debug = require('debug')('controller:main');

storage.initSync();

debug(`accessory name: ${config.door.accessory.name}`);
debug(`accessory username: ${config.door.accessory.username}`);
debug(`accessory pincode: ${config.door.accessory.pincode}`);
debug(`accessory port: ${config.door.accessory.port}`);

debug(`camera name: ${config.camera.accessory.name}`);
debug(`camera username: ${config.camera.accessory.username}`);
debug(`camera pincode: ${config.camera.accessory.pincode}`);
debug(`camera port: ${config.camera.accessory.port}`);

const doorUUID = uuid.generate(`hap-nodejs:accessories:${config.door.accessory.name}`);
const doorAccessory = exports.accessory = new Accessory(config.door.accessory.name, doorUUID);


const cameraSource = new Camera();

const cameraUUID = uuid.generate(`hap-nodejs:accessories:${config.camera.accessory.name}`);
const cameraAccessory = exports.camera = new Accessory(config.camera.accessory.name, cameraUUID);

// doorAccessory.pincode = config.door.accessory.pincode;
// doorAccessory.username = config.door.accessory.username;

// cameraAccessory.pincode = config.camera.accessory.pincode;
// cameraAccessory.username = config.camera.accessory.username;

// Garage Accessory

doorAccessory
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, 'Manufacturer')
  .setCharacteristic(Characteristic.Model, 'Model')
  .setCharacteristic(Characteristic.SerialNumber, 'Serial Number');

doorAccessory.on('identify', function (paired, callback) {
  doorController.identify();

  callback();
});

doorAccessory
  .addService(Service.GarageDoorOpener, 'Garage Door')
  .setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED) // force initial state to CLOSED
  .getCharacteristic(Characteristic.TargetDoorState)
  .on('set', function(value, callback) {

    if (value == Characteristic.TargetDoorState.CLOSED) {
      doorController.openDoor();

      callback();

      doorAccessory
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
    }
    else if (value == Characteristic.TargetDoorState.OPEN) {
      doorController.closeDoor();

      callback();

      doorAccessory
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
    }
  });


doorAccessory
  .getService(Service.GarageDoorOpener)
  .getCharacteristic(Characteristic.CurrentDoorState)
  .on('get', function(callback) {

    let err = null;

    doorController.doorStatus();

    if (doorController.isDoorOpened) {
      callback(err, Characteristic.CurrentDoorState.OPEN);
    } else {
      callback(err, Characteristic.CurrentDoorState.CLOSED);
    }
  });


cameraAccessory.configureCameraSource(cameraSource);

cameraAccessory.identify, (paired, callback) => {
  console.log('Node Camera Identify');
  callback();
}

debug('publish door accessory');
doorAccessory.publish({
  port: config.door.accessory.port,
  username: config.door.accessory.username,
  pincode: config.door.accessory.pincode,
  category: Accessory.Categories.GARAGE_DOOR_OPENER,
});


debug('publish camera accessory');
cameraAccessory.publish({
  port: config.camera.accessory.port,
  username: config.camera.accessory.username,
  pincode: config.camera.accessory.pincode,
  category: Accessory.Categories.CAMERA,
});

