import type { CharacteristicValue, Logger, PlatformAccessory, Service } from 'homebridge';

import type { IKettlePlatform } from './platform.js';
import { DeviceModel } from './models/deviceModel.js';
import { iKettleService } from './iKettleService.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class iKettlePlatformAccessory {
    private deviceId: string;
    private userId: string;

    private deviceDetails: DeviceModel;
    private log: Logger;
    private kettleManager: iKettleService;

    private readonly heaterService: Service;

    constructor(
        private readonly platform: IKettlePlatform,
        private readonly accessory: PlatformAccessory
    ) {
        this.log = platform.log;
        this.deviceDetails = this.accessory.context.device;

        this.deviceId = this.deviceDetails.id;
        this.userId = this.deviceDetails.id;

        this.kettleManager = iKettleService.getInstance(this.log);
        this.watchKettle();

        accessory
            .getService(platform.Service.AccessoryInformation)!
            .setCharacteristic(platform.Characteristic.Manufacturer, 'Smarter.Am')
            .setCharacteristic(platform.Characteristic.Model, this.deviceDetails.name)
            .setCharacteristic(platform.Characteristic.SerialNumber, this.deviceDetails.status.device_model)
            .setCharacteristic(platform.Characteristic.FirmwareRevision, this.deviceDetails.status.firmware_version);

        this.heaterService =
            this.accessory.getService(this.deviceDetails.name) ||
            this.accessory.addService(this.platform.Service.Thermostat, this.deviceDetails.name, this.deviceId);

        this.heaterService
            .getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
            .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));

        this.heaterService
            .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
            .setProps({ minValue: 0, maxValue: 1, validValues: [0, 1] })
            .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
            .onSet(this.handleTargetHeatingCoolingStateSet.bind(this));

        this.heaterService.getCharacteristic(this.platform.Characteristic.CurrentTemperature).onGet(this.handleCurrentTemperatureGet.bind(this));

        this.heaterService
            .getCharacteristic(this.platform.Characteristic.TargetTemperature)
            .setProps({ minValue: 0, maxValue: 100, minStep: 5 })
            .onGet(this.handleTargetTemperatureGet.bind(this))
            .onSet(this.handleTargetTemperatureSet.bind(this));

        this.heaterService
            .getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
            .onGet(this.handleTemperatureDisplayUnitsGet.bind(this))
            .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));

        this.heaterService.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity).onGet(this.getWaterLevel.bind(this));
    }

    private async handleCurrentHeatingCoolingStateGet() {
        this.log.debug('Triggered GET CurrentHeatingCoolingState');

        if (this.deviceDetails.status.state === 'Idle') {
            return this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
        }

        if (this.deviceDetails.status.state === 'Boiling') {
            return this.platform.Characteristic.CurrentHeatingCoolingState.HEAT;
        }

        this.log.error('Unknown kettle state', this.deviceDetails.status.state);
        return this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
    }

    private async handleTargetHeatingCoolingStateGet() {
        this.log.debug('Triggered GET TargetHeatingCoolingState');

        if (this.deviceDetails.status.state === 'Idle') {
            return this.platform.Characteristic.TargetHeatingCoolingState.OFF;
        }

        if (this.deviceDetails.status.state === 'Boiling') {
            return this.platform.Characteristic.TargetHeatingCoolingState.HEAT;
        }

        this.log.error('Unknown kettle state', this.deviceDetails.status.state);
        return this.platform.Characteristic.TargetHeatingCoolingState.OFF;
    }

    private async handleTargetHeatingCoolingStateSet(value: CharacteristicValue) {
        this.log.debug('Triggered SET TargetHeatingCoolingState:', value);

        if (value == this.platform.Characteristic.TargetHeatingCoolingState.HEAT) {
            this.log.info('Boiling kettle');
            this.kettleManager.startBoil(this.userId, this.deviceId);
            return;
        }

        if (value == this.platform.Characteristic.TargetHeatingCoolingState.OFF) {
            this.log.info('Stopping  kettle');
            this.kettleManager.stopBoil(this.userId, this.deviceId);
            return;
        }

        this.log.error('Invalid heating state, please use only off/heat');
        this.handleTargetHeatingCoolingStateGet();
    }

    private async handleCurrentTemperatureGet() {
        this.log.debug('Triggered GET CurrentTemperature');

        const currentValue = this.deviceDetails.status.water_temperature;
        return currentValue;
    }

    public async handleTargetTemperatureGet() {
        this.log.debug('Triggered GET TargetTemperature');
        return this.deviceDetails.status.boil_temperature;
    }

    public async handleTargetTemperatureSet(value: CharacteristicValue) {
        const parsedValue = value as number;
        this.log.debug(`Setting target temperature: ${parsedValue}°C`);

        await this.kettleManager.setBoilTemp(this.userId, this.deviceId, parsedValue);
    }

    public async handleTemperatureDisplayUnitsGet() {
        // this.log.debug('Triggered GET TemperatureDisplayUnits');
        return this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS;
    }

    public async handleTemperatureDisplayUnitsSet(value: CharacteristicValue) {
        // this.log.debug('Triggered SET TemperatureDisplayUnits:', value);
    }

    private async getWaterLevel() {
        return this.deviceDetails.status.water_level;
    }

    private watchKettle() {
        this.kettleManager.watchDevice(this.deviceId).subscribe({
            next: (update) => {
                this.log.debug('Device update received', {
                    id: this.deviceId,
                    state: update.status.state,
                    waterTemp: update.status.water_temperature,
                    waterLevel: update.status.water_level,
                    boilingTemp: update.status.boil_temperature
                });
                this.deviceDetails = update;
                this.updateHomeKit();
            },
            error: (error) => {
                this.log.error('Device details failed to update', error);
            },
            complete: () => {
                this.log.info(`Stopped watching for updates on ${this.deviceId} - ${this.deviceDetails.name}`);
            }
        });
    }

    private updateHomeKit() {
        this.heaterService
            .getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
            .updateValue(this.getCurrentHeatingCoolingState(this.deviceDetails));

        this.heaterService
            .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
            .updateValue(this.getTargetHeatingCoolingState(this.deviceDetails));

        this.heaterService
            .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .updateValue(this.deviceDetails.status.water_temperature);

        this.heaterService.getCharacteristic(this.platform.Characteristic.TargetTemperature).updateValue(this.deviceDetails.status.boil_temperature);
    }

    private getCurrentHeatingCoolingState(newState: DeviceModel) {
        return newState.status.state === 'Boiling'
            ? this.platform.Characteristic.CurrentHeatingCoolingState.HEAT
            : this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
    }

    private getTargetHeatingCoolingState(newState: DeviceModel) {
        return newState.status.state === 'Boiling'
            ? this.platform.Characteristic.TargetHeatingCoolingState.HEAT
            : this.platform.Characteristic.TargetHeatingCoolingState.OFF;
    }
}
