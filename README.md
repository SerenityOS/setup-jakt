# setup-jakt

This action sets up a Jakt environment for use in actions.

## V1

- Adds the Jakt binary path to `PATH`, so the compiler is available as both `$JAKT_COMPILER` and `jakt`
- Registers the path to the Jakt runtime as `$JAKT_RUNTIME`, this is necessary for compilation (pass as `-R $JAKT_RUNTIME`)
- Installs Jakt's CMake module and adds it to `CMAKE_PREFIX_PATH`

The action will attempt to pull and build the latest available revision of Jakt from [SerenityOS/jakt](https://github.com/SerenityOS/jakt), but also accepts an optional revision (commit hash or "main") to install instead.

The produced Jakt installation can be cached for future reuse by passing in `cache: true` (see example usage).


## Example Usage

Downloading and installing the latest available commit, without caching the built compiler binary:
```yaml
steps:
  - uses: SerenityOS/setup-jakt@v1
  - run: jakt -h
```

Downloading and installing a specific commit, caching the built compiler binary:
```yaml
steps:
  - uses: SerenityOS/setup-jakt@v1
    with:
      cache: true
      revision: afcffe
  - run: jakt -h
```
