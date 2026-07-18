# @todone/plugin-caniuse

## [2.0.0](https://github.com/todone-run/todone/compare/plugin-caniuse-v1.0.1...plugin-caniuse-v2.0.0) (2026-07-18)


### ⚠ BREAKING CHANGES

* redesign plugin system around pre-initialized plugin objects ([#49](https://github.com/todone-run/todone/issues/49))
* migrate back off Effect ([#48](https://github.com/todone-run/todone/issues/48))
* rework plugin types
* rework plugin loading
* merge core and types into main package
* rework plugin system
* simplify plugin types
* migrate to Effect
* upgrade to node 24
* browserslist now uses explicit config instead of checking the file
* improve File's types

### Features

* browserslist now uses explicit config instead of checking the file ([d0e69ab](https://github.com/todone-run/todone/commit/d0e69ab38aa7cd0a38857fd132f5d52acf11505d))
* merge core and types into main package ([8e4d745](https://github.com/todone-run/todone/commit/8e4d745ebe6dca28a8c7995d64690c6666356f94))
* migrate back off Effect ([#48](https://github.com/todone-run/todone/issues/48)) ([dfa317c](https://github.com/todone-run/todone/commit/dfa317c0799a086652be57f96e12654fb1fe30cf))
* redesign plugin system around pre-initialized plugin objects ([#49](https://github.com/todone-run/todone/issues/49)) ([8a15dcd](https://github.com/todone-run/todone/commit/8a15dcd57ad308d8826a6aefdf32f2e9c5e908ed))
* rework plugin loading ([dcca7a9](https://github.com/todone-run/todone/commit/dcca7a9773a8b58b85e7b69931c9ea90f21b221d))
* upgrade to node 24 ([ab81303](https://github.com/todone-run/todone/commit/ab81303ed712570b64d54394a0442395abf7b827))
* use native URLPattern ([17894f4](https://github.com/todone-run/todone/commit/17894f49d30b8325cc57c02f49fe163c6a6c59d8))
* use workspace:^ ranges ([4a517ac](https://github.com/todone-run/todone/commit/4a517ac0c90e45585032ba521600b1222c5fbb62))


### Bug Fixes

* rework plugin types ([b1aad1f](https://github.com/todone-run/todone/commit/b1aad1f3e13533d22f5c8911dde24b54e4973abf))
* update package URLs ([#76](https://github.com/todone-run/todone/issues/76)) ([4dac6a1](https://github.com/todone-run/todone/commit/4dac6a19a0f0a684793066c36358a538aae7014f))


### Miscellaneous Chores

* rework plugin system ([21201c6](https://github.com/todone-run/todone/commit/21201c6371e624920820a463fc8a37f594df8be0))
* simplify plugin types ([7c411ba](https://github.com/todone-run/todone/commit/7c411ba947f08a788336cf774cd00d9f0c1ff1af))


### Code Refactoring

* improve File's types ([f2de18e](https://github.com/todone-run/todone/commit/f2de18e8193cafae271433a088cb681e19ef0072))
* migrate to Effect ([8844e25](https://github.com/todone-run/todone/commit/8844e2515fcf3b3f49b3880bef151f32b10bca84))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @todone/internal-build bumped to 2.0.0
    * todone bumped to 2.0.0
  * peerDependencies
    * todone bumped to 2.0.0

## [1.0.1](https://github.com/cprecioso/todone/compare/plugin-caniuse-v1.0.0...plugin-caniuse-v1.0.1) (2025-08-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @todone/internal-urlpattern bumped to 1.1.4
    * @todone/plugin bumped to 0.3.3
  * devDependencies
    * @todone/internal-build bumped to 1.0.1
    * @todone/types bumped to 0.7.2

## [1.0.0](https://github.com/cprecioso/todone/compare/plugin-caniuse-v0.4.0...plugin-caniuse-v1.0.0) (2025-08-03)


### ⚠ BREAKING CHANGES

* upgrade support to node 22

### Features

* upgrade support to node 22 ([e80077d](https://github.com/cprecioso/todone/commit/e80077da736a61a535adaf37de3bab0bf13fdc0e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @todone/internal-urlpattern bumped to 1.1.3
    * @todone/plugin bumped to 0.3.2
  * devDependencies
    * @todone/internal-build bumped to 1.0.0
    * @todone/types bumped to 0.7.1

## [0.4.0](https://github.com/cprecioso/todone/compare/plugin-caniuse-v0.3.2...plugin-caniuse-v0.4.0) (2025-07-22)


### Features

* add names to plugin matches ([afc821d](https://github.com/cprecioso/todone/commit/afc821df99b3aa4c260adad0eb26291f395159e0))
* migrate to node 20 ([f016ec9](https://github.com/cprecioso/todone/commit/f016ec96a55e67a4b0b1625be7fed3dbd65f680c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @todone/internal-urlpattern bumped to 1.1.2
    * @todone/plugin bumped to 0.3.1
  * devDependencies
    * @todone/internal-build bumped to 0.3.0
    * @todone/types bumped to 0.7.0

## [0.3.2](https://github.com/cprecioso/todone/compare/plugin-caniuse-v0.3.1...plugin-caniuse-v0.3.2) (2025-05-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @todone/plugin bumped to 0.3.0

## 0.3.1

### Patch Changes

- ddebfb7: Final CI
- Updated dependencies [ddebfb7]
  - @todone/internal-urlpattern@1.1.1
  - @todone/plugin@0.2.1

## 0.3.0

### Minor Changes

- e439883: New implementation

### Patch Changes

- Updated dependencies [e439883]
  - @todone/internal-urlpattern@1.1.0
  - @todone/plugin@0.2.0
