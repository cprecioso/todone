# todone

## [2.0.0](https://github.com/todone-run/todone/compare/todone-v1.0.1...todone-v2.0.0) (2026-07-18)


### ⚠ BREAKING CHANGES

* allow pattern keywords and colons ([#83](https://github.com/todone-run/todone/issues/83))
* improve glob configuration, exclude .git by default ([#63](https://github.com/todone-run/todone/issues/63))
* rework plugins ([#62](https://github.com/todone-run/todone/issues/62))
* move unhandledUrls option from config to CLI reporter ([#61](https://github.com/todone-run/todone/issues/61))
* merge plugins and reporters into a single Plugin type ([#59](https://github.com/todone-run/todone/issues/59))
* correct JSON reporting
* allow multiple reporters ([#54](https://github.com/todone-run/todone/issues/54))
* improve reporter settings ([#51](https://github.com/todone-run/todone/issues/51))
* redesign plugin system around pre-initialized plugin objects ([#49](https://github.com/todone-run/todone/issues/49))
* migrate back off Effect ([#48](https://github.com/todone-run/todone/issues/48))
* allow importing plugins with a specific name
* rework plugin types
* rework plugin loading
* merge core and types into main package
* simplify plugin types
* upgrade globby
* remove RunnerMatch
* migrate to Effect
* upgrade to node 24
* change result typings
* improve File's types

### Features

* add defineConfig export ([64b09db](https://github.com/todone-run/todone/commit/64b09db02e75aa2911dcab3e827b0d0c125bd727))
* add more information to the JSON schema ([922beff](https://github.com/todone-run/todone/commit/922beff11200d561c8fbdca262a06ab0ad4f978d))
* allow importing plugins with a specific name ([4cbb94e](https://github.com/todone-run/todone/commit/4cbb94ec0df78b15ce32136a4dc918382edcc25e))
* allow multiple reporters ([#54](https://github.com/todone-run/todone/issues/54)) ([e3f1c3a](https://github.com/todone-run/todone/commit/e3f1c3ae2b63e3d65db0281592a4103f0d87d29d))
* allow pattern keywords and colons ([#83](https://github.com/todone-run/todone/issues/83)) ([3ebc6f0](https://github.com/todone-run/todone/commit/3ebc6f0c4d917c1c9b04d0a8a0282085b570464f))
* better error logging ([533da11](https://github.com/todone-run/todone/commit/533da115dae0abedf789c38e1a2f128fe0e1ec74))
* change result typings ([de6f67a](https://github.com/todone-run/todone/commit/de6f67a3c799e44297d9466cae28ad95ded5d383))
* create json schema for config ([1ef1308](https://github.com/todone-run/todone/commit/1ef1308031eccaa348cc8ba3f5ebae384815d26a))
* don't type  in the JS config ([8aedc41](https://github.com/todone-run/todone/commit/8aedc412833b437bcaefc4b50d78ba808fe52912))
* go into dot files ([6d0d9e1](https://github.com/todone-run/todone/commit/6d0d9e186a5bfbffcb6f926ec331e2c759f0c3ff))
* import config with jiti ([2945eaa](https://github.com/todone-run/todone/commit/2945eaa0d53c969787660f4fe5b578fcfcc3cc6b))
* improve glob configuration, exclude .git by default ([#63](https://github.com/todone-run/todone/issues/63)) ([721f9e8](https://github.com/todone-run/todone/commit/721f9e84b029a364252d4bf4a7f349e897a85cf8))
* make File generic ([876c97a](https://github.com/todone-run/todone/commit/876c97a7d2bc840564c9dafbda049eae169dd256))
* merge core and types into main package ([8e4d745](https://github.com/todone-run/todone/commit/8e4d745ebe6dca28a8c7995d64690c6666356f94))
* merge plugins and reporters into a single Plugin type ([#59](https://github.com/todone-run/todone/issues/59)) ([9d12ac5](https://github.com/todone-run/todone/commit/9d12ac5161e781917d7a0137c48c9d146497ee24))
* migrate back off Effect ([#48](https://github.com/todone-run/todone/issues/48)) ([dfa317c](https://github.com/todone-run/todone/commit/dfa317c0799a086652be57f96e12654fb1fe30cf))
* redesign plugin system around pre-initialized plugin objects ([#49](https://github.com/todone-run/todone/issues/49)) ([8a15dcd](https://github.com/todone-run/todone/commit/8a15dcd57ad308d8826a6aefdf32f2e9c5e908ed))
* remove unneeded dotenv ([f3ed392](https://github.com/todone-run/todone/commit/f3ed39210b46cae9309aaa495e5ad1497151b285))
* rework plugin loading ([dcca7a9](https://github.com/todone-run/todone/commit/dcca7a9773a8b58b85e7b69931c9ea90f21b221d))
* upgrade to node 24 ([ab81303](https://github.com/todone-run/todone/commit/ab81303ed712570b64d54394a0442395abf7b827))
* use workspace:^ ranges ([4a517ac](https://github.com/todone-run/todone/commit/4a517ac0c90e45585032ba521600b1222c5fbb62))


### Bug Fixes

* allow empty configs ([a716b19](https://github.com/todone-run/todone/commit/a716b19eb1ea6bdad03335f2ec8cc672c42dc286))
* correct JSON reporting ([255e357](https://github.com/todone-run/todone/commit/255e3570670db02d17a73f8d337d66f8eefdbfd3))
* correctly set paths for a File ([3d1c5f4](https://github.com/todone-run/todone/commit/3d1c5f47d5c6bc81dd2daa332d88e6c95f710b0e))
* fix types ([057eb82](https://github.com/todone-run/todone/commit/057eb8209290968cc6bd8dd6c5e6faf7813f8f04))
* improve reporter settings ([#51](https://github.com/todone-run/todone/issues/51)) ([48b70aa](https://github.com/todone-run/todone/commit/48b70aaf6d820dddd90514c7d514be7756e9c7bc))
* move to scoped effects for `OutputMode`s ([508fce1](https://github.com/todone-run/todone/commit/508fce168a28f14933c5d10029c2d5b3357b0b2b))
* move unhandledUrls option from config to CLI reporter ([#61](https://github.com/todone-run/todone/issues/61)) ([687fe8b](https://github.com/todone-run/todone/commit/687fe8be3b6a6e8e336d148cb907fe5435157ad9))
* print summary after analysis ([388509c](https://github.com/todone-run/todone/commit/388509cff5e2702a0eb486864f4c59b4f2d4f4c1))
* remove leftover call ([726b410](https://github.com/todone-run/todone/commit/726b41046fe1e626b401e00c0c711cb3253cac53))
* rework plugin types ([b1aad1f](https://github.com/todone-run/todone/commit/b1aad1f3e13533d22f5c8911dde24b54e4973abf))
* rework plugins ([#62](https://github.com/todone-run/todone/issues/62)) ([94308d1](https://github.com/todone-run/todone/commit/94308d13769257514c5ed600ac3b97f675c056a9))
* update package URLs ([#76](https://github.com/todone-run/todone/issues/76)) ([4dac6a1](https://github.com/todone-run/todone/commit/4dac6a19a0f0a684793066c36358a538aae7014f))
* use Node HTTP client ([040aa8b](https://github.com/todone-run/todone/commit/040aa8b3dbc497d4812cf6f181becf326bace2c0))


### Performance Improvements

* reorganize LocalFile ([833ada6](https://github.com/todone-run/todone/commit/833ada601b3337fd6914a1b4a4a872c6898fe144))
* use node.js streams ([#82](https://github.com/todone-run/todone/issues/82)) ([138885e](https://github.com/todone-run/todone/commit/138885e8505d2ddf36298df4bca2e0e75ef7b72d))


### Miscellaneous Chores

* simplify plugin types ([7c411ba](https://github.com/todone-run/todone/commit/7c411ba947f08a788336cf774cd00d9f0c1ff1af))
* upgrade globby ([11f1a97](https://github.com/todone-run/todone/commit/11f1a97efc8317eba0ae6f8f62372cb50ea68af3))


### Code Refactoring

* improve File's types ([f2de18e](https://github.com/todone-run/todone/commit/f2de18e8193cafae271433a088cb681e19ef0072))
* migrate to Effect ([8844e25](https://github.com/todone-run/todone/commit/8844e2515fcf3b3f49b3880bef151f32b10bca84))
* remove RunnerMatch ([96ce549](https://github.com/todone-run/todone/commit/96ce549f17ee6433e2f0e32a233ef0fa93bc3368))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @todone/internal-build bumped to 2.0.0

## [1.0.1](https://github.com/cprecioso/todone/compare/todone-v1.0.0...todone-v1.0.1) (2025-08-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @todone/core bumped to 0.6.4
    * @todone/default-plugins bumped to 1.0.1
    * @todone/internal-util bumped to 0.3.2
    * @todone/plugin bumped to 0.3.3
    * @todone/types bumped to 0.7.2
  * devDependencies
    * @todone/internal-build bumped to 1.0.1

## [1.0.0](https://github.com/cprecioso/todone/compare/todone-v0.11.0...todone-v1.0.0) (2025-08-03)


### ⚠ BREAKING CHANGES

* upgrade support to node 22

### Features

* upgrade support to node 22 ([e80077d](https://github.com/cprecioso/todone/commit/e80077da736a61a535adaf37de3bab0bf13fdc0e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @todone/core bumped to 0.6.3
    * @todone/default-plugins bumped to 1.0.0
    * @todone/internal-util bumped to 0.3.1
    * @todone/plugin bumped to 0.3.2
    * @todone/types bumped to 0.7.1
  * devDependencies
    * @todone/internal-build bumped to 1.0.0

## [0.11.0](https://github.com/cprecioso/todone/compare/todone-v0.10.0...todone-v0.11.0) (2025-07-22)


### Features

* migrate to node 20 ([f016ec9](https://github.com/cprecioso/todone/commit/f016ec96a55e67a4b0b1625be7fed3dbd65f680c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @todone/core bumped to 0.6.2
    * @todone/default-plugins bumped to 0.6.0
    * @todone/internal-util bumped to 0.3.0
    * @todone/plugin bumped to 0.3.1
    * @todone/types bumped to 0.7.0
  * devDependencies
    * @todone/internal-build bumped to 0.3.0

## [0.10.0](https://github.com/cprecioso/todone/compare/todone@0.9.1...todone-v0.10.0) (2025-05-27)


### Features

* rename instancing functions ([c1b1dc8](https://github.com/cprecioso/todone/commit/c1b1dc8d1c0c3dbaa077bfe2266f53f2f4b45857))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @todone/default-plugins bumped to 0.5.2
    * @todone/plugin bumped to 0.3.0

## 0.9.1

### Patch Changes

- ddebfb7: Final CI
- Updated dependencies [ddebfb7]
  - @todone/core@0.6.1
  - @todone/default-plugins@0.5.1
  - @todone/internal-util@0.2.1
  - @todone/plugin@0.2.1
  - @todone/types@0.6.1

## 0.9.0

### Minor Changes

- e439883: New implementation

### Patch Changes

- Updated dependencies [e439883]
  - @todone/core@0.6.0
  - @todone/default-plugins@0.5.0
  - @todone/internal-util@0.2.0
  - @todone/plugin@0.2.0
  - @todone/types@0.6.0
