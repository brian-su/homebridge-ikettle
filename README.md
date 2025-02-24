[![Build and Lint](https://github.com/brian-su/homebridge-iKettle/actions/workflows/build.yml/badge.svg)](https://github.com/brian-su/homebridge-iKettle/actions/workflows/build.yml)
[![npm](https://img.shields.io/npm/v/homebridge-ikettle.svg)](https://www.npmjs.com/package/homebridge-ikettle)
[![npm](https://img.shields.io/npm/dt/homebridge-ikettle.svg)](https://www.npmjs.com/package/homebridge-ikettle)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

# Homebridge iKettle

## Turn your iKettle into a HomeKit device! 🫖

Fed up with flaky Siri Shortcut integration for your iKettle? This plugin sorts that right out! It lets you control your kettle directly through HomeKit - properly reliable this time, in theory!

## How it works

Since HomeKit hasn't got a proper kettle device type, this plugin exposes the kettle as a thermostat to HomeKit:

- Water level shows up as humidity
- Temperature and heating controls work as you'd expect

**Handy tip:** If you have existing thermostats/humidity sensors, put your kettle in its own room in HomeKit. Otherwise, as the kettle reports its temperature and water level as room readings, Siri will report your Kitchen temp as 100C.

## Installation

Two ways to get it sorted:

1. Search for "homebridge-ikettle" in your Homebridge config UI
2. Or pop this in your terminal:

```
npm install -g --omit=dev homebridge-ikettle
```

Once installed, just update your config either via the UI or use the below and restart Homebridge. The plugin handles the rest!

```json
{
    "email": "example@example.com",
    "password": "XXXXXXXX",
    "platform": "iKettle"
}
```

## Worth noting

- Only properly tested with iKettle v3 (Model: SMKET01)
- Might work with multiple v3 kettles (though not tested)
- Only does Celsius
- Specifically looks for model 'SMKET01' to avoid any bother with coffee machines
- Got an earlier version (v1/v2)? Pop an issue on GitHub and I'll have a look!

## Thanks

Massive thanks to [kbirger](https://github.com/kbirger/smarter-kettle-client) for their Python client, it was a great base for getting this Node/HomeKit version up and running! 🙌
