#!/usr/bin/env node

import inquirer from 'inquirer';
import _ from 'lodash';
import { promisify } from 'util';

const exec = promisify(require('child_process').exec);

let list;
let deviceparam = '';
const simbootParams = require('optimist').argv;

class BootSimulator {
  constructor() {
    this.deviceInfo = [];
    this.iOSDevices = [];
    if(simbootParams.d){
      deviceparam = simbootParams.d;
    }
  }

  async listSimulators() {
    const { stdout } = await exec('xcrun simctl list --json devices');
    this.list = await stdout;
    this.json = await JSON.parse(this.list);
    return this.json.devices;
  }

  async findUDIDOfSim(name, version) {
    await _.find(list, (key, value) => {
      if (value === version) {
        _.filter(key, obj => {
          if (obj.name === name) {
            this.udid = obj.udid;
          }
        });
      }
    });
    return this.udid;
  }

  async filterOnlyiOSSimulators() {
    let device;
    list = await this.listSimulators();
    await _.map(list, (key, value) => {
      if (value.startsWith('iOS')) {
        _.forEach(key, values => {
          if(values.name.replace(/ /g,'').toUpperCase().includes(deviceparam.replace(/ /g,'').toUpperCase()))
            this.deviceInfo.push(`${values.name}-${value}`);
        });
      }
    });
    if(this.deviceInfo.length<1){
      console.log(`No device matches with provided device name`);
      device = '';
    }
    else if(this.deviceInfo.length > 1){
      const answer = await inquirer.prompt({
        type: 'list',
        name: 'Device',
        message: 'Select Simulator 📱 to boot?',
        pageSize: 15,
        choices: this.deviceInfo,
     });
      device = await _.split(answer.Device, '-');
    }
    else{
      device = await _.split(this.deviceInfo[0], '-');
    }

    const udid = await getAllSimulator.findUDIDOfSim(device[0], device[1]);
    if(udid){
      console.log(`Booting ${device[0]} with ${device[1]}`);
      await exec(`xcrun simctl boot  ${udid}`);
      await exec(`open -a Simulator --args -CurrentDeviceUDID ${udid}`);
    }
  }
}

const getAllSimulator = new BootSimulator();
getAllSimulator.filterOnlyiOSSimulators();
