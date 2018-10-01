# be

Set of scripts for building electron.

## Usage

Bootstrap:

```
./bootstrap.js [--skip-gclient] [--args=""] [--target-arch=x64] [--verbose]
```

Build:

```
./build.js [configuration] [--verbose]
```

Run tests:

```
./test.js [configuration] [-arbitrary-args-passed-to-spec...]
```

## Configuration names

This project uses following convention for configuration names.

* `Default` maps to `electron/build/args/testing.gn`.
* `Release` maps to `electron/build/args/release.gn`.
* `Debug` maps to `electron/build/args/debug.gn`.
* For `x64` target, there is no suffix to configuration name.
* For other targets, the configuration name has `_` and target name as suffix,
  for example `Default_x86`.

## Development conventions

* No `package.json` or `npm install`.
* Put third party modules as single file under `lib`.

## License

Public domain.
