import * as vscode from 'vscode';

const PLUGIN_NAME = '@styled/typescript-styled-plugin';
const SECTION = 'styledPluginConfig';

/** The subset of the built-in TypeScript extension's API this extension uses. */
interface TypeScriptApi {
  configurePlugin(pluginId: string, configuration: unknown): void;
}

type PluginConfig = { [key: string]: unknown };

/**
 * Builds the plugin config from settings the user set explicitly, so unset
 * options keep the plugin's own defaults rather than this extension's copies.
 */
function buildPluginConfig(extension: vscode.Extension<unknown>): PluginConfig {
  const config = vscode.workspace.getConfiguration(SECTION);
  const properties: Record<string, unknown> =
    extension.packageJSON.contributes.configuration.properties ?? {};
  const keys = Object.keys(properties).map((key) => key.slice(SECTION.length + 1));

  const pluginConfig: PluginConfig = {};
  for (const key of keys) {
    if (key === 'enabled') continue;
    const inspected = config.inspect(key);
    const value = inspected?.workspaceFolderValue ?? inspected?.workspaceValue ?? inspected?.globalValue;
    if (value === undefined) continue;

    const path = key.split('.');
    let target = pluginConfig;
    for (const part of path.slice(0, -1)) {
      target = (target[part] ??= {}) as PluginConfig;
    }
    target[path[path.length - 1]] = value;
  }
  return pluginConfig;
}

async function getTypeScriptApi(): Promise<TypeScriptApi | undefined> {
  const ts = vscode.extensions.getExtension<{ getAPI?(version: 0): TypeScriptApi | undefined }>(
    'vscode.typescript-language-features',
  );
  if (!ts) return undefined;
  const exports = await ts.activate();
  return exports?.getAPI?.(0);
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const api = await getTypeScriptApi();
  if (!api) {
    vscode.window.showWarningMessage('Styled Plugin Config: the built-in TypeScript extension API is not available.');
    return;
  }

  const push = () => {
    // configurePlugin replaces the plugin's whole config, including what tsconfig set.
    if (!vscode.workspace.getConfiguration(SECTION).get<boolean>('enabled')) return;
    api.configurePlugin(PLUGIN_NAME, buildPluginConfig(context.extension));
  };

  push();
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(SECTION)) push();
    }),
    vscode.commands.registerCommand(`${SECTION}.openSettings`, () =>
      vscode.commands.executeCommand('workbench.action.openSettings', `@ext:${context.extension.id}`),
    ),
  );
}

export function deactivate(): void {}
