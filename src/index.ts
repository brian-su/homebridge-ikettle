import type { API } from 'homebridge';

import { IKettlePlatform } from './platform.js';
import { PLATFORM_NAME } from './models/constants.js';

/**
 * This method registers the platform with Homebridge
 */
export default (api: API) => {
    api.registerPlatform(PLATFORM_NAME, IKettlePlatform);
};
