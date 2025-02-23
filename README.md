[![Build and Lint](https://github.com/brian-su/homebridge-iKettle/actions/workflows/build.yml/badge.svg)](https://github.com/brian-su/homebridge-iKettle/actions/workflows/build.yml)
[![npm](https://img.shields.io/npm/v/homebridge-iKettle.svg)](https://www.npmjs.com/package/homebridge-iKettle)
[![npm](https://img.shields.io/npm/dt/homebridge-iKettle.svg)](https://www.npmjs.com/package/homebridge-iKettle)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

# Homebridge iKettle

## What does it do?

If you too are annoyed by the flaky Siri Shortcuts integration of your iKettle then this is plugin for you!

Given that Homekit has no Kettle device type the plugin exposes the kettle as a thermostat. Humidity level is water level, temperature and heating mode are as you'd expect.

You may want to put the device in a separate room of it's own, especially if you have existing temperature and humidity sensors as the kettle will register these to whatever room you put it in and having Siri tell you the temperature of your kitchen ranges from 20 - 100 degrees isn't very helpful.

Once installed you should have fast, not flaky control over your kettle. Additionally as the settings are exposed into homekit you can now do things like convert a scene to a shortcut and have it check the water level before turning the kettle on.

## Installation

Either search via the Homebridge config for homebridge-ikettle

```
npm install homebridge-ikettle -g
```

Once installed update the config and reboot your homebridge. The plugin will handle the rest.

## Caveats

I only have 1 v3 iKettle. So that's all I've tested this with. I _think_ it should work if you have multiple v3 Kettles but I make no promises about a v2 or v1 iKettle.

Currently the plugin specifically looks for the device model 'SMKET01', partly to stop it trying to pick up and interact incorrectly with a coffee machine, if you want to try your v1/v2 iKettle open up an issue on the repo and I'll see what I can do.
