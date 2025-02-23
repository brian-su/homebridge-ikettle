import type { API, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service } from 'homebridge';

import { iKettlePlatformAccessory } from './platformAccessory.js';
import { iKettleService } from './iKettleService.js';
import { PLUGIN_NAME, PLATFORM_NAME } from './models/constants.js';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class IKettlePlatform implements DynamicPlatformPlugin {
    public readonly Service: typeof Service;
    public readonly Characteristic: typeof Characteristic;

    // this is used to track restored cached accessories
    public readonly accessories: Map<string, PlatformAccessory> = new Map();
    public readonly discoveredCacheUUIDs: string[] = [];

    // private app: FirebaseApp;

    constructor(
        public readonly log: Logging,
        public readonly config: PlatformConfig,
        public readonly api: API
    ) {
        this.Service = api.hap.Service;
        this.Characteristic = api.hap.Characteristic;

        this.log.debug('Finished initializing platform:', this.config.name);

        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on('didFinishLaunching', () => {
            log.debug('Executed didFinishLaunching callback');
            // run the method to discover / register your devices as accessories
            this.discoverDevices();
        });
    }

    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to set up event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: PlatformAccessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);

        // add the restored accessory to the accessories cache, so we can track if it has already been registered
        this.accessories.set(accessory.UUID, accessory);
    }

    discoverDevices() {
        const iKettle = iKettleService.getInstance();

        this.log.info('GETTING DEVICES');

        iKettle.connect(this.config).subscribe({
            next: (deviceModel) => {
                this.log.info(`Got Device: ${deviceModel.id}`);
                const accessory = new this.api.platformAccessory(deviceModel.name, deviceModel.id);
                accessory.context.device = deviceModel;
                new iKettlePlatformAccessory(this, accessory);
                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            },
            error: (error) => {},
            complete: () => {}
        });

        // // loop over the discovered devices and register each one if it has not already been registered
        // for (const device of exampleDevices) {
        //     const uuid = this.api.hap.uuid.generate(device.exampleUniqueId);

        //     // see if an accessory with the same uuid has already been registered and restored from
        //     // the cached devices we stored in the `configureAccessory` method above
        //     const existingAccessory = this.accessories.get(uuid);

        //     if (existingAccessory) {
        //         // the accessory already exists
        //         this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        //         new ExamplePlatformAccessory(this, existingAccessory);
        //     } else {
        //         // the accessory does not yet exist, so we need to create it
        //         this.log.info('Adding new accessory:', device.exampleDisplayName);

        //         // create a new accessory
        //         const accessory = new this.api.platformAccessory(device.exampleDisplayName, uuid);

        //         // store a copy of the device object in the `accessory.context`
        //         // the `context` property can be used to store any data about the accessory you may need
        //         accessory.context.device = device;

        //         // create the accessory handler for the newly create accessory
        //         // this is imported from `platformAccessory.ts`
        //         new ExamplePlatformAccessory(this, accessory);

        //         // link the accessory to your platform
        //         this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        //     }

        //     // push into discoveredCacheUUIDs
        //     this.discoveredCacheUUIDs.push(uuid);
        // }

        // for (const [uuid, accessory] of this.accessories) {
        //     if (!this.discoveredCacheUUIDs.includes(uuid)) {
        //         this.log.info('Removing existing accessory from cache:', accessory.displayName);
        //         this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        //     }
        // }
    }
}
