export interface DeviceModel {
    id: string;
    userId: string;
    name: string;
    commands: Commands;
    settings: Settings;
    status: Status;
}

export interface Commands {
    add_alarm: CommandState;
    calibrate_weight_sensor: CommandState;
    change_alarm: CommandState;
    remove_alarm: CommandState;
    reset_settings: CommandState;
    resync_database: CommandState;
    send_notification: CommandState;
    send_ping: CommandState;
    server_restart: CommandState;
    set_boil_temperature: CommandState;
    set_formula_mode_enable: CommandState;
    set_formula_mode_temperature: CommandState;
    set_handle_right_side: CommandState;
    set_keep_warm_time: CommandState;
    set_manual_boil_temperature: CommandState;
    set_manual_formula_mode_enable: CommandState;
    set_manual_formula_mode_temperature: CommandState;
    set_manual_keep_warm_time: CommandState;
    set_options: CommandState;
    set_region: CommandState;
    set_user: CommandState;
    start_auto_boil: CommandState;
    start_boil: CommandState;
    stats_update: CommandState;
    stop_boil: CommandState;
    turn_off_wifi: CommandState;
}

export interface CommandState {
    example: any;
}

export interface Settings {
    network: string;
    network_ssid: string;
}

export interface Status {
    agent_options: number[];
    alarm_failed: number;
    boil_temperature: number;
    boiled_keeping_warm: number;
    boiling_finished: Boiling;
    boiling_started: Boiling;
    calibrated: boolean;
    calibration_state: number;
    cooled_keeping_warm: number;
    cooling_finished: number;
    device_model: string;
    firmware_version: string;
    first_used: string;
    formula_mode_enable: boolean;
    formula_mode_temperature: number;
    formula_mode_temperature_reached: boolean;
    handle_right_side: boolean;
    imp_updated: number;
    keep_warm_finished: number;
    keep_warm_time: number;
    keep_warm_time_remaining: number;
    kettle_is_present: boolean;
    last_imp_update: number;
    last_used: string;
    last_user_type: string;
    manual_boil_temperature: number;
    manual_formula_mode_enable: boolean;
    manual_formula_mode_temperature: number;
    manual_keep_warm_time: number;
    online_state: string;
    options: string;
    ping_count: number;
    region: number;
    rssi: number;
    ssid: string;
    state: string;
    target_temperature: number;
    variant: string;
    water_level: number;
    water_temperature: number;
}

export interface Boiling {
    heating: boolean;
    temperature: number;
    ts: number;
}
