import { Accessory, Service, Characteristic, uuid, Camera } from 'hap-nodejs';
import { spawn } from 'child_process';
import shell from 'shelljs';
import * as fs from 'fs';
import * as temp from 'temp';
import config from '../config.json';

const debug = require('debug')('controller:camera');

const snapshotFileName = temp.path({ suffix: '.jpg' });

Camera.prototype.handleSnapshotRequest = function(request, callback) {
    let rotation = '';

    if (config.camera.snapshot.rotation) {
      switch(config.camera.snapshot.rotation) {
        case 90:
          rotation = '-rot 90';
          break;
        case 180:
          rotation = '-vf -hf';
          break;
        case 270:
          rotation = '-rot 270';
          break;
      }
    }

    const raspistill = `raspistill ${rotation} -w ${request.width} -h ${request.height} -t 10 -o ${snapshotFileName}`;
    debug(raspistill);

    shell.exec(raspistill, function(code, stdout, stderr) {
        let snapshot;
        if (code === 0) {
          snapshot = fs.readFileSync(snapshotFileName);
        }
        callback(stderr, snapshot);
    });
}

Camera.prototype.handleStreamRequest = function(request) {
  // Invoked when iOS device asks stream to start/stop/reconfigure
  const sessionID = request['sessionID'];
  const requestType = request['type'];
  if (sessionID) {
    let sessionIdentifier = uuid.unparse(sessionID);

    if (requestType == 'start') {
      const sessionInfo = this.pendingSessions[sessionIdentifier];
      if (sessionInfo) {
        let width = config.camera.stream.width;
        let height = config.camera.stream.height;
        const fps = config.camera.stream.fps;
        const bitrate = config.camera.stream.bitrate;

        let targetAddress = sessionInfo['address'];
        let targetVideoPort = sessionInfo['video_port'];
        let videoKey = sessionInfo['video_srtp'];

	let rotation = '';

        if (config.camera.stream.rotation) {
          switch(config.camera.stream.rotation) {
            case 90:
              rotation = ',transpose=1';
              break;
            case 180:
              rotation = ',transpose=2,transpose=2';
              break;
            case 270:
              rotation = ',transpose=2';
              break;
          }
        }

        const streamOptions = [
          '-f', 'video4linux2',
          '-i', '/dev/video0',
          '-s', `${width}:${height}`,
          '-threads', 'auto',
          '-vcodec', 'h264',
          '-an',
          '-pix_fmt', 'yuv420p',
          '-f', 'rawvideo',
          '-tune', 'zerolatency',
          '-vf', `scale=w=${width}:h=${height}${rotation}`,
          '-b:v', `${bitrate}k`,
          '-bufsize', `${2 * bitrate}k`,
          '-payload_type', '99',
          '-ssrc', '1',
          '-f', 'rtp',
          '-srtp_out_suite', 'AES_CM_128_HMAC_SHA1_80',
          '-srtp_out_params', videoKey.toString('base64'),
          `srtp://${targetAddress}:${targetVideoPort}?rtcpport=${targetVideoPort}&localrtcpport=${targetVideoPort}&pkt_size=1378`
        ];

	debug(`start stream: avconv ${streamOptions.join(' ')}`);
        let ffmpeg = spawn('avconv', streamOptions, {env: process.env});
        this.ongoingSessions[sessionIdentifier] = ffmpeg;
      }

      delete this.pendingSessions[sessionIdentifier];
    } else if (requestType == 'stop') {
      const ffmpegProcess = this.ongoingSessions[sessionIdentifier];
      if (ffmpegProcess) {
	debug('stop stream');
        ffmpegProcess.kill('SIGKILL');
      }

      delete this.ongoingSessions[sessionIdentifier];
    }
  }
}

export default Camera;

