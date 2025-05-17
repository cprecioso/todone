export enum UrlFlags {
  Full = "full",
  NoPrefix = "no-prefix",
  NoPolyfill = "no-polyfill",
  IgnoreDisabled = "ignore-disabled",
}

export enum CaniuseFlags {
  Supported = "y",
  Partial = "a",
  NotSupported = "n",
  SupportedWithPolyfill = "p",
  Unknown = "u",
  SupportedWithPrefix = "x",
  Disabled = "d",
}
