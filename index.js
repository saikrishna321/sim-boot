#!/usr/bin/env node

import inquirer from 'inquirer';
import _ from 'lodash';
import { promisify } from 'util';
const exec = promisify(require('child_process').exec);

let list;

class BootSimulator {
  constructor() {
    this.deviceInfo = [];
    this.iOSDevices = [];
  }

  async listSimulators() {
    const { stdout } = await exec('xcrun simctl list --json devices');
    const list = await stdout;
    var json = await JSON.parse(list);
    return json.devices;
  }

  async findUDIDOfSim(name, version) {
    let udid;
    await _.find(list, (key, value) => {
      if (value === version) {
        _.filter(key, obj => {
          if (obj.name === name) {
            udid = obj.udid;
          }
        });
      }
    });
    return udid;
  }

  async filterOnlyiOSSimulators() {
    list = await this.listSimulators();
    await _.map(list, (key, value) => {
      if (value.startsWith('iOS')) {
        _.forEach(key, values => {
          this.deviceInfo.push(values.name + '-' + value);
        });
      }
    });
    const answer = await inquirer.prompt({
      type: 'list',
      name: 'Device',
      message: 'Select Simulator 📱 to boot?',
      pageSize: 15,
      choices: this.deviceInfo
    });
    let device = await _.split(answer.Device, '-');
    let udid = await getAllSimulator.findUDIDOfSim(device[0], device[1]);
    await exec('xcrun simctl boot ' + udid);
  }
}

let getAllSimulator = new BootSimulator();
getAllSimulator.filterOnlyiOSSimulators();
