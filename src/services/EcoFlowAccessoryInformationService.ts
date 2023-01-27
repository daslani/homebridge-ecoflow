import {AccessoryConfig, HAP, Logging, Service as HService} from 'homebridge';
import {EcoFlowRiver} from '../data-source/EcoFlowRiver';
import {Service, ServiceConstructor} from './Service';

export const EcoFlowAccessoryInformationService: ServiceConstructor = class EcoFlowAccessoryInformationService implements Service {
  private readonly service: HService;
  private readonly name: string;
  private readonly log: Logging;
  private readonly ecoFlowApi: EcoFlowRiver;

  constructor(logger: Logging, config: AccessoryConfig, hap: HAP) {
    this.log = logger;

    // extract name from config
    this.name = config.name;

    // initialize EcoFlow API
    this.ecoFlowApi = new EcoFlowRiver(config, this.log);

    // create a new Accessory Information service
    this.service = new hap.Service.AccessoryInformation(
      'EcoFlow Battery Accessory Information',
    );

    this.service.setCharacteristic(hap.Characteristic.Identify, this.handleIdentitySet());

    this.service.getCharacteristic(hap.Characteristic.Manufacturer)
      .onGet(this.handleManufacturerGet.bind(this));

    this.service.getCharacteristic(hap.Characteristic.Model)
      .onGet(this.handleModelGet.bind(this));

    this.service.getCharacteristic(hap.Characteristic.Name)
      .onGet(this.handleNameGet.bind(this));

    this.service.getCharacteristic(hap.Characteristic.SerialNumber)
      .onGet(this.handleSerialNumberGet.bind(this));

    this.service.getCharacteristic(hap.Characteristic.FirmwareRevision)
      .onGet(this.handleFirmwareRevisionGet.bind(this));
  }


  /**
   * Handle requests to get the current device associated to the "Identity" true
   */
  handleIdentitySet() {
    this.log.info('Identify requested.', this.ecoFlowApi.context.serialNumber);
    return true;
  }

  /**
   * Handle requests to get the current value of the "Status Low Battery" characteristic
   */
  handleManufacturerGet() {
    this.log.debug('Triggered GET Manufacturer');

    // set this to a valid value for Manufacturer
    return this.ecoFlowApi.manufacturer;
  }

  /**
   * Handle requests to get the current value of the "Status Low Battery" characteristic
   */
  handleModelGet() {
    this.log.debug('Triggered GET Model');

    // set this to a valid value for Model
    return this.ecoFlowApi.name;
  }

  /**
   * Handle requests to get the current value of the "Status Low Battery" characteristic
   */
  handleNameGet() {
    this.log.debug('Triggered GET Name');

    // set this to a valid value for Name
    return this.name;
  }

  /**
   * Handle requests to get the current value of the "Status Low Battery" characteristic
   */
  handleSerialNumberGet() {
    this.log.debug('Triggered GET Serial Number');

    // set this to a valid value for SerialNumber
    return this.ecoFlowApi.context.serialNumber;
  }

  /**
   * Handle requests to get the current value of the "Status Low Battery" characteristic
   */
  handleFirmwareRevisionGet() {
    this.log.debug('Triggered GET FirmwareRevision');

    // set this to a valid value for FirmwareRevision
    return this.ecoFlowApi.context.firmwareVersion;
  }

  getService(): HService {
    return this.service;
  }
};
