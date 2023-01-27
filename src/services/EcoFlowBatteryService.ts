import {AccessoryConfig, CharacteristicEventTypes, HAP, Logging, Service as HService} from 'homebridge';
import {EcoFlowRiver} from '../data-source/EcoFlowRiver';
import {Service, ServiceConstructor} from './Service';

export const EcoFlowBatteryService: ServiceConstructor = class EcoFlowBatteryService implements Service {
  private readonly service: HService;
  private readonly log: Logging;
  private readonly ecoFlowApi: EcoFlowRiver;
  private readonly hap: HAP;

  constructor(logger: Logging, config: AccessoryConfig, hap: HAP) {
    this.log = logger;
    this.hap = hap;

    // initialize EcoFlow API
    this.ecoFlowApi = new EcoFlowRiver(config, this.log);

    this.service = new hap.Service.Battery(
      'EcoFlow Battery',
      'battery',
    );


    // create handlers for required characteristics
    this.service.getCharacteristic(hap.Characteristic.StatusLowBattery)
      .on(CharacteristicEventTypes.GET, this.handleStatusLowBatteryGet.bind(this));

    // create handlers for required characteristics
    this.service.getCharacteristic(hap.Characteristic.BatteryLevel)
      .on(CharacteristicEventTypes.GET, this.handleStatusBatteryGet.bind(this));

    // create handlers for required characteristics
    this.service.getCharacteristic(hap.Characteristic.ChargingState)
      .on(CharacteristicEventTypes.GET, this.handleStatusChargingStateGet.bind(this));
  }

  /**
   * Handle requests to get the current value of the "Status Low Battery" characteristic
   */
  handleStatusLowBatteryGet(callback) {
    // set this to a valid value for StatusLowBattery
    this.log.debug('Triggered GET StatusLowBattery');

    this.ecoFlowApi.isLowBattery().then((statusLowBattery) => {
      if (statusLowBattery) {
        callback(null, this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
      } else {
        callback(null, this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
      }
    });
  }

  /**
   * Handle requests to get the current value of the "Status Charging State" characteristic
   */
  handleStatusChargingStateGet(callback) {
    // set this to a valid value for StatusChargingState
    this.log.debug('Triggered GET StatusChargingState:');

    this.ecoFlowApi.isBatteryCharging().then((value) => callback(null, value));
  }

  /**
   * Handle requests to get the current value of the "Status Low Battery" characteristic
   */
  handleStatusBatteryGet(callback) {
    // set this to a valid value for StatusBattery
    this.log.debug('Triggered GET StatusBattery');

    this.ecoFlowApi.getSoc().then((value) => callback(null, value));
  }

  getService(): HService {
    return this.service;
  }
};
