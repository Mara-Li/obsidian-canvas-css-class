import {App, PluginSettingTab, Setting} from "obsidian";

import {t} from "./i18n";
import {AppendMode, CanvasClass} from "./interface";
import CanvasCSS from "./main";
import { ListClasses } from "./modals/display-list";
import { CanvasClassSuggester } from "./modals/inputSuggest";
import { reloadCanvas, removeListFromDOM} from "./utils";

export class CanvasCssSettingsTabs extends PluginSettingTab {
	plugin: CanvasCSS;

	constructor(app: App, plugin: CanvasCSS) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl("h1", {text: t("settings.title") as string});
		
		if (this.plugin.settings.canvasAdded.length=== 0) {
			containerEl.createEl("p", {text: t("settings.noClassAdded") as string});
			containerEl.createEl("p", {text: t("settings.useCommandsInfo") as string});
		}
		
		new Setting(containerEl)
			.setName(t("settings.console.title") as string)
			.setDesc(t("settings.console.desc") as string)
			.addDropdown((dropdown) => {
				dropdown
					.addOption("none", t("settings.console.options.none") as string)
					.addOption("error", t("settings.console.options.error") as string)
					.addOption("warn", t("settings.console.options.warn") as string)
					.addOption("log", t("settings.console.options.log") as string)
					.addOption("notice", t("settings.console.options.notice") as string)
					.setValue(this.plugin.settings.logLevel)
					.onChange(async (value) => {
						this.plugin.settings.logLevel = value;
						await this.plugin.saveSettings();
					});
			});
		
		new Setting(containerEl)
			.setName(t("settings.appendMode.default.title") as string)
			.setDesc(t("settings.appendMode.default.desc") as string)
			.addDropdown((dropdown) => {
				dropdown
					.addOption(AppendMode.workspaceLeaf, t("settings.appendMode.options.workspaceLeaf") as string)
					.addOption(AppendMode.body, t("settings.appendMode.options.body") as string)
					.setValue(this.plugin.settings.defaultAppendMode)
					.onChange(async (value) => {
						this.plugin.settings.defaultAppendMode = value as AppendMode;
						const canvasToReload = this.plugin.getLeafOfCanvasNotInSettings();
						for (const canvas of canvasToReload) {
							// @ts-ignore
							reloadCanvas(canvas.view.file.path, value, this.plugin.settings, canvas);
						}
						await this.plugin.saveSettings();
					});
			});
				
		new Setting(containerEl)
			.addButton(cb => cb
				.setButtonText(t("settings.newCanvas.addNewCanvas") as string)
				.onClick(async () => {
					const newCanvas: CanvasClass = {
						canvasPath: "",
						canvasClass: [],
						appendMode: this.plugin.settings.defaultAppendMode
					};
					this.plugin.settings.canvasAdded.push(newCanvas);
					await this.plugin.saveSettings();
					this.display();
				}));
		
		for (const canvas of this.plugin.settings.canvasAdded) {
			new Setting(containerEl)
				.setClass("canvas-css-class-title")
				.addSearch(cb => {
					cb.setValue(canvas.canvasPath);
					cb.setPlaceholder("test");
					new CanvasClassSuggester(cb.inputEl, this.plugin, this.app, async (result: string) => {
						canvas.canvasPath = result;
						await this.plugin.saveSettings();
					});
				})
				.setClass("canvas-css-class-title")
				.addExtraButton(cb =>
					cb
						.setIcon("edit")
						.setTooltip(t("settings.edit.title") as string)
						.onClick(async () => {
							const originalList = JSON.parse(JSON.stringify(canvas.canvasClass)) as string[];
							new ListClasses(this.app, canvas, this.plugin, async (result: CanvasClass) => {
								canvas.canvasClass = result.canvasClass;
								await this.plugin.saveSettings();
								const removedClasses = originalList.filter((item) => !result.canvasClass.includes(item));
								const openedLeaves = this.plugin.getLeafByPath(canvas.canvasPath);
								reloadCanvas(canvas.canvasPath, canvas.appendMode, this.plugin.settings, openedLeaves);
								removeListFromDOM(removedClasses, this.plugin.settings.logLevel, openedLeaves, canvas.canvasPath);
							}).open();
						}))
				.addExtraButton(cb =>
					cb
						.setIcon("trash")
						.setTooltip(t("settings.remove.title") as string)
						.onClick(async () => {
							const indexValue = this.plugin.settings.canvasAdded.indexOf(canvas);
							this.plugin.settings.canvasAdded.splice(indexValue, 1);
							await this.plugin.saveSettings();
							this.display();
						}));		
		}
	}
}
