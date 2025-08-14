# Changelog

## [3.0.0](https://github.com/cprecioso/todone/compare/github-action-v2.0.1...github-action-v3.0.0) (2025-08-14)


### ⚠ BREAKING CHANGES

* change options
* upgrade to node 24
* refactor issue data
* change result typings
* improve File's types

### Features

* add issue reconciliation ([15cbb0a](https://github.com/cprecioso/todone/commit/15cbb0ad83c5590b295936113d7947bbfe27ef56))
* add keyword option ([2438de7](https://github.com/cprecioso/todone/commit/2438de7da3066b15f4563cff472dd3c149d1a43e))
* add URLs to github logs ([81e46b8](https://github.com/cprecioso/todone/commit/81e46b88142ac4c51c406f0949354f20b4632b6b))
* better formatting of dates ([fe2fda3](https://github.com/cprecioso/todone/commit/fe2fda3bea2e05ad670fdd45f1e16ad4c34ba5c5))
* better urls in summary ([a428d2d](https://github.com/cprecioso/todone/commit/a428d2db463442aeeadc01b580ff38eab52c9154))
* change options ([30a4c98](https://github.com/cprecioso/todone/commit/30a4c9870067b1b52ff89382b788de66115665b5))
* change result typings ([de6f67a](https://github.com/cprecioso/todone/commit/de6f67a3c799e44297d9466cae28ad95ded5d383))
* fix github urls in issues ([1faf324](https://github.com/cprecioso/todone/commit/1faf32457f34f0104c83fa7b20c305f5ec0cca03))
* improve created issue for GitHub URLs ([2256429](https://github.com/cprecioso/todone/commit/2256429b02afc5cfe3df96fd8c5f2adbc6a9a6c3))
* log created issue number ([7117af6](https://github.com/cprecioso/todone/commit/7117af67dfbfa265b0d5b638e6b3ffc115f6a0c5))
* make File generic ([876c97a](https://github.com/cprecioso/todone/commit/876c97a7d2bc840564c9dafbda049eae169dd256))
* refactor issue data ([9b88537](https://github.com/cprecioso/todone/commit/9b88537c19a4cb0c0340e65d2f2efbae59e1b33d))
* safe MD output ([7b199aa](https://github.com/cprecioso/todone/commit/7b199aac67961660703d68fb02da448293843016))
* support GMF markdown ([eb31d49](https://github.com/cprecioso/todone/commit/eb31d49fbfcfae34650e035c2a6bd4894afb0c74))
* support other instances of github ([2b70264](https://github.com/cprecioso/todone/commit/2b70264744379f3f47f5c6a8a7d112c6b3e2e45b))
* upgrade to node 24 ([ab81303](https://github.com/cprecioso/todone/commit/ab81303ed712570b64d54394a0442395abf7b827))


### Bug Fixes

* add spacing to comments ([7826a86](https://github.com/cprecioso/todone/commit/7826a861c7b9d284d88251363bc69c689d490cd8))
* always add prefix ([613f58c](https://github.com/cprecioso/todone/commit/613f58caa3e337ca29388314710b5b0ad498fac7))
* change default option ([ec10c6e](https://github.com/cprecioso/todone/commit/ec10c6ee68a92908c37ffd757ed5f88f1f1940a6))
* correctly create links for summary ([b3292d5](https://github.com/cprecioso/todone/commit/b3292d52f1e67c6a78ad05bc4ccb89e1a2ffdb52))
* do not match directories ([ed38fd9](https://github.com/cprecioso/todone/commit/ed38fd9b1b9f661a7ae165dfb3365e442ca650e4))
* fix typo ([c827667](https://github.com/cprecioso/todone/commit/c827667ec71ca1c15d64dc237f0afe0c5e086728))
* fix urls ([ab08bfc](https://github.com/cprecioso/todone/commit/ab08bfc8a685f6953190a95b19e2c6692092ccf5))
* turn to info ([496e093](https://github.com/cprecioso/todone/commit/496e0930fbfd56e8fa62781fb6717f78acf33434))
* typo ([69f54ee](https://github.com/cprecioso/todone/commit/69f54ee74ae3ca146c931c7ad3da8787b8d79b77))
* update github logger ([9fae6ce](https://github.com/cprecioso/todone/commit/9fae6ce9d8925623ab5951cc1e0b8d312ab9cb15))


### Performance Improvements

* use native iterable handling ([7f1e14a](https://github.com/cprecioso/todone/commit/7f1e14acaf0b4ac70f08b7a4f6f872c087c6321b))


### Code Refactoring

* improve File's types ([f2de18e](https://github.com/cprecioso/todone/commit/f2de18e8193cafae271433a088cb681e19ef0072))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @todone/core bumped to 0.7.0
    * @todone/default-plugins bumped to 2.0.0
    * @todone/internal-util bumped to 0.4.0
    * @todone/plugin bumped to 0.3.4
    * @todone/types bumped to 0.8.0
  * devDependencies
    * @todone/internal-build bumped to 2.0.0

## [2.0.1](https://github.com/cprecioso/todone/compare/github-action-v2.0.0...github-action-v2.0.1) (2025-08-03)


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

## [2.0.0](https://github.com/cprecioso/todone/compare/github-action-v1.0.0...github-action-v2.0.0) (2025-08-03)


### ⚠ BREAKING CHANGES

* upgrade support to node 22

### Features

* allow empty globs version ([2c42ff8](https://github.com/cprecioso/todone/commit/2c42ff88e9e030d9d62be17607821e7d06993c8d))
* upgrade support to node 22 ([e80077d](https://github.com/cprecioso/todone/commit/e80077da736a61a535adaf37de3bab0bf13fdc0e))
* use node24 in the action ([7ee7269](https://github.com/cprecioso/todone/commit/7ee72693e05ef75dafef784088c530505c7f00b7))


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

## 1.0.0 (2025-07-22)


### Features

* implement github issue reconciling ([01e768d](https://github.com/cprecioso/todone/commit/01e768d2581813fa4e8f31c7df06ff360178e997))
* initial github action creation ([dae015b](https://github.com/cprecioso/todone/commit/dae015b51f0d8750e52c9201cd3009f2ba75a5fb))
* migrate to node 20 ([f016ec9](https://github.com/cprecioso/todone/commit/f016ec96a55e67a4b0b1625be7fed3dbd65f680c))
* new package ([0e6a866](https://github.com/cprecioso/todone/commit/0e6a866ed625866c9d9f4e895db02823981e2741))


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
