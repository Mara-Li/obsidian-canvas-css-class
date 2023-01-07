import {ItemView, Notice, Plugin} from "obsidian";
import {DEFAULT_SETTINGS, CanvasCssSettings, AppendBehavior} from "./interface";
import {CanvasCssSettingsTabs} from "./settings";
import {AddCssClass} from "./modals/addClass";
import {RemoveCSSclass} from "./modals/removeClass";
import {t, translationLanguage} from "./i18n";
import {
	addCanvasPathAndCanvasFile,
	addToDOM,
	reloadCanvas,
	removeCanvasPathAndCanvasFile,
	removeFromDOM,
	whereToAppend
} from "./utils";

export default class CanvasCSS extends Plugin {
	settings: CanvasCssSettings;
	
	/**
	 * Quick add a canvas file to the settings, without adding any css class. Used when switching between the two behavior.
	 * Useful if the CSS is for [data-canvas-path] or for .canvas-file
	 * @param canvasFilePath {string} the path of the canvas
	 * @param behavior {string} the behavior set for the canvas
	 */
	quickCreateSettings(canvasFilePath: string, behavior: AppendBehavior) {
		let oldClasses = this.settings.canvasAdded.find((item) => item.canvasPath === canvasFilePath);
		if (!oldClasses) {
			// Add the canvas to the settings
			oldClasses = {canvasPath: canvasFilePath, canvasClass: [], appendBehavior: behavior};
			this.settings.canvasAdded.push({
				canvasPath: canvasFilePath,
				canvasClass: [],
				appendBehavior: behavior
			});
			this.saveSettings().then();
		}
		return oldClasses;
	}

	
	async onload() {
		await this.loadSettings();
		console.log(`Loading ${this.manifest.name.replaceAll(" ", "")} v${this.manifest.version} (language: ${translationLanguage})`);
		
		this.addCommand({
			id: "add-canvas-css-class",
			name: t("commands.addCanvas") as string,
			checkCallback: (checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					if (!checking) {
						//@ts-ignore
						const canvasPath = canvasView.file.path;
						new AddCssClass(this.app, (result) => {
							const oldClasses = this.settings.canvasAdded.find((item) => item.canvasPath === canvasPath);
							if (oldClasses) {
								if (oldClasses.canvasClass.includes(result)) {
									new Notice(t("settings.alreadyApplied") as string);
								} else {
									oldClasses.canvasClass.push(result);
									// replace the old canvas class with the new one
									this.settings.canvasAdded = this.settings.canvasAdded.map((item) => {
										if (item.canvasPath === canvasPath) {
											return oldClasses;
										} else {
											return item;
										}
									});
								}
							} else {
								this.settings.canvasAdded.push({canvasPath: canvasPath, canvasClass: [result], appendBehavior: AppendBehavior.workspaceLeaf});
							}
							this.saveSettings();
							const behavior = this.settings.canvasAdded.find((item) => item.canvasPath === canvasPath)?.appendBehavior;
							addToDOM(result, canvasPath, behavior ? behavior : AppendBehavior.workspaceLeaf, this.settings.logLevel);
						}).open();
					} return true;
				} return false;
			}
		});
		
		this.addCommand({
			id: "remove-canvas-css-class",
			name: t("commands.removeCanvas") as string,
			checkCallback: (checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					//@ts-ignore
					const canvasPath = canvasView.file.path;
					const oldClasses = this.settings.canvasAdded.find((item) => item.canvasPath === canvasPath);
					if (oldClasses) {
						if (!checking) {
							//@ts-ignore
							new RemoveCSSclass(this.app, this, this.settings, canvasPath).open();
						}	return true;
					} return false;
				} return false;
			}
		});
		
		this.addCommand({
			id: "switch-to-body-behavior",
			name: t("commands.switchToBodyBehavior") as string,
			checkCallback: (checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					//@ts-ignore
					const canvasPath = canvasView.file.path;
					if (!checking) {
						const oldClasses = this.quickCreateSettings(canvasPath, AppendBehavior.body);
						// @ts-ignore
						oldClasses.appendBehavior = AppendBehavior.body;
						this.saveSettings();
						addCanvasPathAndCanvasFile(AppendBehavior.body, canvasPath);
						reloadCanvas(canvasPath, oldClasses.appendBehavior, this.settings);
					}
					return true;
				}
				return false;
			}});
		
		this.addCommand({
			id: "switch-to-view-content-behavior",
			name: t("commands.switchToViewContentBehavior") as string,
			checkCallback: (checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					//@ts-ignore
					const canvasPath = canvasView.file.path;
					if (!checking) {
						const oldClasses = this.quickCreateSettings(canvasPath, AppendBehavior.workspaceLeaf);
						oldClasses.appendBehavior = AppendBehavior.workspaceLeaf;
						this.saveSettings();
						addCanvasPathAndCanvasFile(AppendBehavior.workspaceLeaf, canvasPath);
						reloadCanvas(canvasPath, oldClasses.appendBehavior, this.settings);
					}
					return true;
				}
				return false;
			}});
		
		this.addCommand({
			id: "quick-switch-behavior",
			name: t("commands.quickSwitch") as string,
			checkCallback:(checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					//@ts-ignore
					const canvasPath = canvasView.file.path;
					if (!checking) {
						const oldClasses = this.quickCreateSettings(canvasPath, AppendBehavior.workspaceLeaf);
						
						oldClasses.appendBehavior = oldClasses.appendBehavior === AppendBehavior.body ? AppendBehavior.workspaceLeaf : AppendBehavior.body;
						this.saveSettings();
						addCanvasPathAndCanvasFile(oldClasses.appendBehavior, canvasPath);
						reloadCanvas(canvasPath, oldClasses.appendBehavior, this.settings);
					}
					return true;
				}
				return false;
			}});
		
		this.registerEvent(this.app.workspace.on("file-open", (file) => {
			// @ts-ignore
			const dataType = document.querySelector(".workspace-leaf.mod-active > .workspace-leaf-content") ? document.querySelector(".workspace-leaf.mod-active > .workspace-leaf-content").attributes[1].value : "";
			if (file && file.extension === "canvas" && dataType === "canvas") {
				const canvasClassList = this.settings.canvasAdded.find((canvas) => canvas.canvasPath === file.path);
				addCanvasPathAndCanvasFile(canvasClassList?.appendBehavior ? canvasClassList.appendBehavior : AppendBehavior.workspaceLeaf, file.path);
				if (canvasClassList) {
					reloadCanvas(file.path, canvasClassList.appendBehavior, this.settings);
				}
				const canvasClassesNotFromThisFile = this.settings.canvasAdded.filter((item) => item.canvasPath !== file.path);
				
				for (const canvas of canvasClassesNotFromThisFile) {
					for (const cssClass of canvas.canvasClass) {
						const isIncluded = canvasClassList ? canvasClassList.canvasClass.includes(cssClass) : false;
						if (!isIncluded) {
							document.querySelector(whereToAppend(canvas.appendBehavior))?.classList.remove(cssClass);
						}
					}
				}
			} else if (dataType !== "canvas") {
				removeCanvasPathAndCanvasFile(AppendBehavior.body);
				removeCanvasPathAndCanvasFile(AppendBehavior.workspaceLeaf);
				for (const canvas of this.settings.canvasAdded) {
					for (const cssClass of canvas.canvasClass) {
						removeFromDOM(cssClass, this.settings.logLevel);
					}
				}
			}
		}));

		this.addSettingTab(new CanvasCssSettingsTabs(this.app, this));
		
	}

	onunload() {
		console.log(`Unloading ${this.manifest.name.replaceAll(" ", "")} v${this.manifest.version} (language: ${translationLanguage})`);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



