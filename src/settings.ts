import i18next from "i18next";
import {App, PluginSettingTab, Setting} from "obsidian";

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
		
		if (this.plugin.settings.canvasAdded.length=== 0) {
			const desc = document.createDocumentFragment();
			desc.createEl("p", {text: i18next.t("settings.noClassAdded") as string});
			desc.createEl("p", {text: i18next.t("settings.useCommandsInfo") as string});
			new Setting(containerEl)
				.setHeading()
				.setDesc(desc);
		}
		new Setting(containerEl)
			.setName(i18next.t("settings.console.title"))
			.setDesc(i18next.t("settings.console.desc"))
			.addDropdown((dropdown) => {
				dropdown
					.addOption("none", i18next.t("settings.console.options.none") )
					.addOption("error", i18next.t("settings.console.options.error") )
					.addOption("warn", i18next.t("settings.console.options.warn") )
					.addOption("log", i18next.t("settings.console.options.log") )
					.addOption("notice", i18next.t("settings.console.options.notice") )
					.setValue(this.plugin.settings.logLevel)
					.onChange(async (value) => {
						this.plugin.settings.logLevel = value;
						await this.plugin.saveSettings();
					});
			});
		

		new Setting(containerEl)
			.setName(i18next.t("settings.addButton.name"))
			.setHeading();
		
		new Setting(containerEl)
			.setDesc(i18next.t("settings.addButton.class"))
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.addButtonSetting)
					.onChange(async (value) => {
						this.plugin.settings.addButtonSetting = value;
						await this.plugin.saveSettings();
					});	
			});
		
		new Setting(containerEl)
			.setDesc(i18next.t("settings.addButton.quickSwitch"))
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.addButtonSwitchView)
					.onChange(async (value) => {
						this.plugin.settings.addButtonSwitchView = value;
						await this.plugin.saveSettings();
					});
			});
			
			
		
			

		new Setting(containerEl)
			.setName(i18next.t("settings.appendMode.default.title"))
			.setDesc(i18next.t("settings.appendMode.default.desc"))
			.addDropdown((dropdown) => {
				dropdown
					.addOption(AppendMode.workspaceLeaf, i18next.t("settings.appendMode.options.workspaceLeaf") )
					.addOption(AppendMode.body, i18next.t("settings.appendMode.options.body") )
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
				.setButtonText(i18next.t("settings.newCanvas.addNewCanvas") )
				.onClick(async () => {
					const newCanvas: CanvasClass = {
						canvasPath: "",
						canvasClass: [],
						appendMode: this.plugin.settings.defaultAppendMode
					};
					this.plugin.settings.canvasAdded.unshift(newCanvas);
					await this.plugin.saveSettings();
					this.display();
				}));
		
		for (const canvas of this.plugin.settings.canvasAdded) {
			new Setting(containerEl)
				.setClass("canvas-css-class-title")
				.addSearch(cb => {
					cb.setValue(canvas.canvasPath);
					cb.setPlaceholder(i18next.t("addFilePath.filePath"));
					new CanvasClassSuggester(cb.inputEl, this.plugin, this.app, async (result: string) => {
						canvas.canvasPath = result;
						await this.plugin.saveSettings();
					});
				})
				.setClass("canvas-css-class-title")
				.addExtraButton(cb =>
					cb
						.setIcon("edit")
						.setTooltip(i18next.t("settings.edit.title") )
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
						.setTooltip(i18next.t("settings.remove.title") )
						.onClick(async () => {
							const indexValue = this.plugin.settings.canvasAdded.indexOf(canvas);
							this.plugin.settings.canvasAdded.splice(indexValue, 1);
							await this.plugin.saveSettings();
							this.display();
						}));		
		}
	}
}
