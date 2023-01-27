import {
  Service as HService,
  API,
  AccessoryPlugin,
  Logging,
  AccessoryConfig,
} from 'homebridge';
import {EcoFlowBatteryService} from './services/EcoFlowBatteryService';
import {EcoFlowAccessoryInformationService} from './services/EcoFlowAccessoryInformationService';
import {Service} from './services/Service';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class EcoFlowAccessory implements AccessoryPlugin {
  private services: {[key: string]: Service} = {};

  constructor(logger: Logging, config: AccessoryConfig, api: API) {
    this.services.accessoryInformation = new EcoFlowAccessoryInformationService(logger, config, api.hap);
    this.services.battery = new EcoFlowBatteryService(logger, config, api.hap);
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): HService[] {
    return Object.keys(this.services).map((key) => this.services[key].getService());
  }

  identify() {
    return this.services[0];
  }
}
