# TypeScript Styled Plugin Config

This plugin was intended as a complement to the [vscode-styled-components](https://marketplace.visualstudio.com/items?itemName=styled-components.vscode-styled-components) extension.

It sends settings to `@styled/typescript-styled-plugin` (bundled with `vscode-styled-components`) through the TypeScript extension's
`configurePlugin` API, so you do not need a `plugins` entry in `tsconfig` and can keep your configuration local.

Options mirror the [plugin README](https://github.com/microsoft/typescript-styled-plugin#configuration).
`lint.unknownAtRules` is extra: the plugin passes `lint` straight to `vscode-css-languageservice`, which supports it.

Only settings you set explicitly are sent. Unset options use the plugin's defaults.
The sent config replaces any `tsconfig` plugin config.

## Contributing

If you'd like to raise an [issue](https://github.com/jvdl/vscode-typescript-styled-plugin-config/issues) or
[pull request](https://github.com/jvdl/vscode-typescript-styled-plugin-config/pulls?q=sort%3Aupdated-desc+is%3Apr+state%3Aopen+),
feel free to do so, though if you raise a PR, I'd appreciate either an issue or a detailed description.

### Build

```bash
npx --yes @vscode/vsce package --allow-missing-repository
code --install-extension vscode-styled-plugin-config-0.1.0.vsix
```

Open the settings with the command **Styled Plugin Config: Open Settings**.

## Example (`settings.json`)

```json
"tsStyledPluginConfig.lint.validProperties": ["container-name", "container-type"],
"tsStyledPluginConfig.lint.unknownAtRules": "ignore"
```
