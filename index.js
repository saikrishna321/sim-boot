#!/usr/bin/env node

import inquirer from 'inquirer';
import _ from 'lodash';
import { promisify } from 'util';

const exec = promisify(require('child_process').exec);

let list;
let dev='';

class BootSimulator {
  constructor() {
    this.deviceInfo = [];
    this.iOSDevices = [];
  }

  async listSimulators() {
    let json;
    const { stdout } = await exec('xcrun simctl list --json devices');
    this.list = await stdout;
    this.json = await JSON.parse(list);
    return json.devices;
  }

  async findUDIDOfSim(name, version) {
    let udid;
    await _.find(list, (key, value) => {
      if (value === version) {
        _.filter(key, obj => {
          if (obj.name === name) {
            this.udid = obj.udid;
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

          if(values.name.replace(/ /g,'').toUpperCase().includes(dev.replace(/ /g,'').toUpperCase()))
          this.deviceInfo.push(`${values.name} - ${value}`);
        });
      }
    });
    const answer = await inquirer.prompt({
      type: 'list',
      name: 'Device',
      message: 'Select Simulator 📱 to boot?',
      pageSize: 15,
      choices: this.deviceInfo,
    });
    const device = await _.split(answer.Device, '-');
    const udid = await this.findUDIDOfSim(device[0], device[1]);
    await exec(`xcrun simctl boot ${udid}`);
  }
}

const getAllSimulator = new BootSimulator();
getAllSimulator.filterOnlyiOSSimulators();
