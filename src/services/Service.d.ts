import {AccessoryConfig, HAP, Logging, Service as HService} from 'homebridge';

interface ServiceConstructor {
  new(logger: Logging, config: AccessoryConfig, hap: HAP): Service;
}

interface Service {
  getService(): HService;
}
