import {BodyInit, default as fetch, Headers, RequestInit, Response} from 'node-fetch';
import {AccessoryConfig, Logger} from 'homebridge';
import * as crypto from 'crypto';
import {MemoryCache} from './MemoryCache';

const ECOFLOW_ENDPOINT = 'https://api.ecoflow.com';
const ECOFLOW_CACHE_TIMEOUT = 30;
const ECOFLOW_LOW_BATTERY_THRESHOLD = 30;

const commands: { [key: string]: [string, [string, string[]]] } = {
  ECOFLOW_GET_DEVICE_QUERY: ['GET', [
    '/iot-service/open/api/device/queryDeviceQuota?sn={{serialNumber}}',
    ['serialNumber'],
  ]],
};

const cache = new MemoryCache({ttl: ECOFLOW_CACHE_TIMEOUT});

export class EcoFlowRiver {
  name = 'EcoFlow River Pro';
  manufacturer = 'EcoFlow';

  public readonly context: {
    serialNumber: string;
    appKey: string;
    secretKey: string;
    firmwareVersion: string;
  };

  private log;

  constructor(config: AccessoryConfig, log: Logger) {
    const {serialNumber, appKey, secretKey, firmwareVersion} = config;

    this.log = log;
    this.context = {
      serialNumber,
      appKey,
      secretKey,
      firmwareVersion,
    };
  }

  async getSoc() {
    const {data} = await this._makeCall(commands.ECOFLOW_GET_DEVICE_QUERY);

    return data.soc;
  }

  async isLowBattery() {
    const {data} = await this._makeCall(commands.ECOFLOW_GET_DEVICE_QUERY);

    return data.soc < ECOFLOW_LOW_BATTERY_THRESHOLD;
  }

  async isBatteryCharging() {
    const {data} = await this._makeCall(commands.ECOFLOW_GET_DEVICE_QUERY);
    const {wattsOutSum, wattsInSum} = data;

    return wattsOutSum < wattsInSum;
  }

  private async _makeCall(command: [string, [string, string[]]], data?: BodyInit, cached = true) {
    const method = command[0];
    const templatePath = command[1];

    const replaceSub = (path: string, substitutes: string[]) => {
      substitutes.forEach((substitute) => {
        const replacement = (data && data[substitute]) || this.context[substitute] || undefined;
        path = path.replace(`${replacement ? '{{' + substitute + '}}' : ''}`, replacement);
      });

      return path;
    };

    const cacheResponse = async (key: string, response: Response) => {
      await cache.set(key, await response.json());

      return cache.get(key);
    };

    const generateHash = (str: string) => crypto.createHash('sha256').update(str).digest('base64');

    const url = new URL([ECOFLOW_ENDPOINT, replaceSub(...templatePath)].join(''));
    const cacheKey = generateHash(`${url}:${method}`);

    const cachedResponse = cached && cache.get(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    const options: RequestInit = {
      method,
      body: data,
      headers: new Headers({
        appKey: this.context.appKey,
        secretKey: this.context.secretKey,
        'Content-Type': 'application/json',
      }),
    };

    try {
      const res = await fetch(url, options);

      this.log.debug('STATUS: ' + res.status);
      this.log.debug('HEADERS: ' + JSON.stringify(res.headers));

      return cacheResponse(cacheKey, res);
    } catch (e) {
      if (e instanceof Error) {
        this.log.error('Problem with request: ' + e.message);
      } else {
        throw e;
      }
    }
  }
}
