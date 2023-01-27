import {API} from 'homebridge';

import { PLUGIN_NAME } from './settings';
import { EcoFlowAccessory } from './EcoFlowAccessory';

/**
 * This method registers the accessory with Homebridge
 */
export default function (api: API) {
  api.registerAccessory(PLUGIN_NAME, EcoFlowAccessory);
}
