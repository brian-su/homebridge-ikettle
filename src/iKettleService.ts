import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { getDatabase, ref, get, child, push, onValue } from 'firebase/database';
import { UserModel } from './models/userModel';
import { NetworkModel } from './models/networkModel';
import { DeviceModel } from './models/deviceModel';
import { CommandModel } from './models/commandModel';
import { Observable } from 'rxjs';
import { PlatformConfig } from 'homebridge';
import { SUPPORTED_DEVICES } from './models/constants.js';

export class iKettleService {
    private app: FirebaseApp;
    private static instance: iKettleService;
    private userCredential: UserCredential | undefined;

    constructor() {
        const firebaseConfig: FirebaseOptions = {
            apiKey: 'AIzaSyD0IOPaFj2zkMs5_rStrSRQ-m02bLwj88c',
            authDomain: 'smarter-live.firebaseapp.com',
            databaseURL: 'https://smarter-live.firebaseio.com',
            projectId: 'smarter-live',
            storageBucket: 'smarter-live.appspot.com',
            messagingSenderId: '41919779740'
        };

        this.app = initializeApp(firebaseConfig);
    }

    // TODO: Unsure if this is the best way to got about things
    static getInstance(): iKettleService {
        if (!iKettleService.instance) {
            iKettleService.instance = new iKettleService();
        }
        return iKettleService.instance;
    }

    public connect(config: PlatformConfig): Observable<DeviceModel> {
        return new Observable<DeviceModel>((subscriber) => {
            (async () => {
                try {
                    const auth = getAuth(this.app);

                    this.userCredential = await signInWithEmailAndPassword(auth, config.email, config.password);
                    const user = await this.getUser(this.userCredential.user.uid);

                    for (const networkId in user.networks_index) {
                        const network = await this.getNetwork(networkId);
                        for (const [deviceId, deviceName] of Object.entries(network.associated_devices)) {
                            const deviceModel = await this.getDevice(deviceId);
                            if (SUPPORTED_DEVICES.includes(deviceModel.status.device_model)) {
                                deviceModel.id = deviceId;
                                deviceModel.name = deviceName;
                                subscriber.next(deviceModel);
                            }
                        }
                    }

                    subscriber.complete();
                } catch (error) {
                    subscriber.error(error);
                }
            })();
        });
    }

    private async getUser(userId: string): Promise<UserModel> {
        const dbRef = ref(getDatabase());
        try {
            const userSnapshot = await get(child(dbRef, `users/${userId}`));
            if (userSnapshot.exists()) {
                return userSnapshot.val();
            }
        } catch (error) {
            console.error(error);
        }

        throw new Error("Couldn't find user details");
    }

    private async getNetwork(networkId: string): Promise<NetworkModel> {
        const dbRef = ref(getDatabase());
        try {
            const networkSnapshot = await get(child(dbRef, `networks/${networkId}`));
            if (networkSnapshot.exists()) {
                return networkSnapshot.val();
            }
        } catch (error) {
            console.error(error);
        }

        throw new Error("Couldn't find network details");
    }

    public async getDevice(deviceId: string): Promise<DeviceModel> {
        const dbRef = ref(getDatabase());
        try {
            const networkSnapshot = await get(child(dbRef, `devices/${deviceId}`));
            if (networkSnapshot.exists()) {
                return networkSnapshot.val();
            }
        } catch (error) {
            console.error(error);
        }

        throw new Error("Couldn't find device details");
    }

    public watchDevice(deviceId: string) {
        console.log('watching device');
        const dbRef = ref(getDatabase(), `devices/${deviceId}`);

        onValue(dbRef, (snapshot) => {
            const data: DeviceModel = snapshot.val();

            console.log(data.status);
        });
    }

    public async startBoil(userId: string, deviceId: string) {
        const data = { user_id: userId, value: true } as CommandModel;
        await this.sendCommand(deviceId, 'start_boil', data);
    }

    public async stopBoil(userId: string, deviceId: string) {
        const data = { user_id: userId, value: true } as CommandModel;
        await this.sendCommand(deviceId, 'stop_boil', data);
    }

    public async setBoilTemp(userId: string, deviceId: string, temp: number) {
        const data = { user_id: userId, value: temp } as CommandModel;
        await this.sendCommand(deviceId, 'set_boil_temperature', data);
    }

    public async setManualBoilTemp(userId: string, deviceId: string, temp: number) {
        const data = { user_id: userId, value: temp } as CommandModel;
        await this.sendCommand(deviceId, 'set_manual_boil_temperature', data);
    }

    private async sendCommand(deviceId: string, command: string, commandData: CommandModel) {
        this.authenticate();
        const db = getDatabase(this.app);

        console.log(`Sending command: ${JSON.stringify(commandData)}`);

        try {
            const commandRef = ref(db, `devices/${deviceId}/commands/${command}`);
            await push(commandRef, commandData);
        } catch (error) {
            console.error('Error sending command:', error);
        }
    }

    private async authenticate() {
        const tokenExpiry = new Date((this.userCredential as any).user.stsTokenManager.expirationTime);

        await this.userCredential?.user.getIdToken(true);
        return;

        if (tokenExpiry <= new Date()) {
            await this.userCredential?.user.getIdToken(true);
        }
    }
}
