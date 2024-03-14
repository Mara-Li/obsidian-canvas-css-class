import i18next from "i18next";
import { FileView, ItemView, Notice, Plugin, TFile, WorkspaceLeaf} from "obsidian";

import { resources, translationLanguage } from "./i18n";
import {AppendMode,CanvasCssSettings, DEFAULT_SETTINGS} from "./interface";
import {AddCssClass} from "./modals/addClass";
import { ListClasses } from "./modals/display-list";
import {RemoveCSSclass} from "./modals/removeClass";
import {CanvasCssSettingsTabs} from "./settings";
import {
	addToDOM, logging,
	reloadCanvas,
	removeFromBody,
	removeFromViewContent,
	removeListFromDOM,
} from "./utils";

export default class CanvasCSS extends Plugin {
	settings: CanvasCssSettings;
	
	/**
	 * Quick add a canvas file to the settings, without adding any css class. Used when switching between the two mode.
	 * Useful if the CSS is for [data-canvas-path] or for .canvas-file
	 * @param canvasFilePath {string} the path of the canvas
	 * @param mode {string} the mode set for the canvas
	 */
	quickCreateSettings(canvasFilePath: string, mode: AppendMode) {
		let oldClasses = this.settings.canvasAdded.find((item) => item.canvasPath === canvasFilePath);
		if (!oldClasses) {
			// Add the canvas to the settings
			oldClasses = {canvasPath: canvasFilePath, canvasClass: [], appendMode: mode};
			this.settings.canvasAdded.push({
				canvasPath: canvasFilePath,
				canvasClass: [],
				appendMode: mode
			});
			this.saveSettings();
		}
		return oldClasses;
	}
	
	/** Function to add a new canvas in the settings if none exists ;
	 * If the canvas already exists, it will return the old settings
	 */
	convertOldSettings() {
		// Convert the old settings to the new ones
		if (this.settings.canvasAdded) {
			// Convert the old settings to the new ones
			this.settings.canvasAdded.forEach((canvas) => {
				if (!canvas.appendMode || canvas.appendMode.length === 0) {
					canvas.appendMode = this.settings.defaultAppendMode;
				} else if (canvas.appendMode === "view-content") {
					canvas.appendMode = AppendMode.workspaceLeaf;
				}
			});
			this.saveSettings();
		}
	}
	
	getLeafOfCanvasNotInSettings() {
		const allLeafs: WorkspaceLeaf[] = [];
		this.app.workspace.iterateAllLeaves((leaf) => {
			if (!(leaf.view instanceof FileView)) return allLeafs;
			else if (leaf.view.file?.extension === "canvas") {
				const view = leaf.view as FileView;
				const canvasClassList = this.settings.canvasAdded.find((canvas) => canvas.canvasPath === view.file?.path);
				if (!canvasClassList) {
					allLeafs.push(leaf);
				}
			}
		});
		logging(`Found ${allLeafs.length} canvas leaves without settings`, this.settings.logLevel);
		return allLeafs;
	}
	
	/**
	 * Allow to get the canvas opened in the current view, to get a specific one
	 * @param filePath {string} the path of the canvas
	 * @return {WorkspaceLeaf[]} all leaf corresponding to the canvas file
	 */
	getLeafByPath(filePath: string): WorkspaceLeaf[] {
		const allSpecificLeafs: WorkspaceLeaf[] = [];
		this.app.workspace.iterateAllLeaves((leaf) => {
			if (leaf.view instanceof FileView) {
				const view = leaf.view as FileView;
				if (view.file?.path === filePath) {
					allSpecificLeafs.push(leaf);
				}
			}
		});
		logging(`Found ${allSpecificLeafs.length} leaves for ${filePath}`, this.settings.logLevel);
		
		return allSpecificLeafs;
	}
	
	addingCanvasClassToLeaf(file: TFile|null) {
		const leafType = this.app.workspace.getActiveViewOfType(ItemView)?.getViewType();
		if (!file) {
			logging("OPENED FILE IS NOT A CANVAS", this.settings.logLevel);
			for (const canvas of this.settings.canvasAdded) {
				for (const cssClass of canvas.canvasClass) {
					removeFromBody(cssClass, this.settings.logLevel, undefined, true);
				}
			}
			return;
		}
		if (file && file.extension === "canvas" && leafType === "canvas") {
			logging(`OPENED FILE ${file.path} IS A CANVAS ; ADDING CLASS`, this.settings.logLevel);
			const canvasClassList = this.settings.canvasAdded.find((canvas) => canvas.canvasPath === file.path);
			
			const leaves = this.getLeafByPath(file.path);
			const appendMode = canvasClassList ? canvasClassList.appendMode : this.settings.defaultAppendMode;
			reloadCanvas(file.path, appendMode, this.settings, leaves);
				
			const canvasClassesNotFromThisFile = this.settings.canvasAdded.filter((item) => item.canvasPath !== file.path);
				
			for (const canvas of canvasClassesNotFromThisFile) {
				for (const cssClass of canvas.canvasClass) {
					const isIncluded = canvasClassList ? canvasClassList.canvasClass.includes(cssClass) : false;
					if (!isIncluded) {
						removeFromViewContent(cssClass, this.settings.logLevel, leaves);
						removeFromBody(cssClass, this.settings.logLevel, file.path);
					}
				}
			}
		} else if (leafType !== "canvas") {
			const isFile = file ? ` ("${file.path}") ` : " ";
			logging(`OPENED FILE${isFile}IS NOT A CANVAS`, this.settings.logLevel);
			for (const canvas of this.settings.canvasAdded) {
				for (const cssClass of canvas.canvasClass) {
					removeFromBody(cssClass, this.settings.logLevel, file?.path, true);
				}
			}
		}
	}
	
	async onload() {
		await this.loadSettings();
		await i18next.init({
			lng: translationLanguage,
			fallbackLng: "en",
			resources,
			returnNull: false,
			returnEmptyString: false,
		});
		console.log(`Loading ${this.manifest.name.replaceAll(" ", "")} v${this.manifest.version} (language: ${translationLanguage})`);
		
		this.convertOldSettings();
		
		

		this.addCommand({
			id: "add-canvas-css-class",
			name: i18next.t("commands.addCanvas") as string,
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
									new Notice(i18next.t("settings.alreadyApplied"));
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
								this.settings.canvasAdded.push({canvasPath: canvasPath, canvasClass: [result], appendMode: this.settings.defaultAppendMode});
							}
							this.saveSettings();
							const mode = this.settings.canvasAdded.find((item) => item.canvasPath === canvasPath)?.appendMode;
							const theOpenedLeaf = this.getLeafByPath(canvasPath);
							addToDOM(result, canvasPath, mode ? mode : this.settings.defaultAppendMode, this.settings.logLevel, theOpenedLeaf);
						}).open();
					} return true;
				} return false;
			}
		});
		
		this.addCommand({
			id: "remove-canvas-css-class",
			name: i18next.t("commands.removeCanvas"),
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
			id: "switch-to-body-mode",
			name: i18next.t("commands.switchToBodyMode"),
			checkCallback: (checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					//@ts-ignore
					const canvasPath = canvasView.file.path;
					if (!checking) {
						const oldClasses = this.quickCreateSettings(canvasPath, AppendMode.body);
						// @ts-ignore
						oldClasses.appendMode = AppendMode.body;
						this.saveSettings();
						new Notice(
							(i18next.t("message.switchedToBody"))
						);
						this.removeBodyButton();
						this.removeWorkspaceButton();
						this.addWorkspaceButton(canvasView, canvasPath);
						const leaves = this.getLeafByPath(canvasPath);
						reloadCanvas(canvasPath, oldClasses.appendMode, this.settings, leaves);
					}
					return true;
				}
				return false;
			}});
		
		this.addCommand({
			id: "switch-to-workspace-leaf-content-mode",
			name: i18next.t("commands.switchToViewContentMode"),
			checkCallback: (checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					//@ts-ignore
					const canvasPath = canvasView.file.path;
					if (!checking) {
						const oldClasses = this.quickCreateSettings(canvasPath, AppendMode.workspaceLeaf);
						oldClasses.appendMode = AppendMode.workspaceLeaf;
						this.saveSettings();
						new Notice(
							(i18next.t("message.switchedToViewContent"))
						);
						this.removeBodyButton();
						this.removeWorkspaceButton();
						this.addButtonBodyView(canvasView, canvasPath);
						const leaves = this.getLeafByPath(canvasPath);
						reloadCanvas(canvasPath, oldClasses.appendMode, this.settings, leaves);
					}
					return true;
				}
				return false;
			}});
		
		this.addCommand({
			id: "quick-switch-mode",
			name: i18next.t("commands.quickSwitch"),
			checkCallback:(checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					//@ts-ignore
					const canvasPath = canvasView.file.path;
					if (!checking) {
						const oldClasses = this.quickCreateSettings(canvasPath, this.settings.defaultAppendMode);
						oldClasses.appendMode = oldClasses.appendMode === AppendMode.body ? AppendMode.workspaceLeaf : AppendMode.body;
						this.saveSettings();
						new Notice(
							(i18next.t("message.quickSwitch", {mode: oldClasses.appendMode}))
						);
						//reload button 
						if (oldClasses.appendMode === AppendMode.body) {
							this.removeWorkspaceButton();
							this.addButtonBodyView(canvasView, canvasPath);
						} else {
							this.removeBodyButton();
							this.addWorkspaceButton(canvasView, canvasPath);
						}
						const leaves = this.getLeafByPath(canvasPath);
						reloadCanvas(canvasPath, oldClasses.appendMode, this.settings, leaves);
					}
					return true;
				}
				return false;
			}});
		
		this.addCommand({
			id: "edit-canvas",
			name: "Edit canvas",
			checkCallback: (checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					//@ts-ignore
					const path = canvasView.file.path;
					if (!checking) {
						let canvas = this.quickCreateSettings(path, this.settings.defaultAppendMode);
						const originalList = JSON.parse(JSON.stringify(canvas.canvasClass)) as string[];
						new ListClasses(this.app, canvas, this, (result) => {
							canvas = result;
							this.saveSettings();
							const leaves = this.getLeafByPath(path);
							const removedClasses = originalList.filter((item) => !result.canvasClass.includes(item));
							reloadCanvas(path, canvas.appendMode, this.settings, leaves);
							removeListFromDOM(removedClasses, this.settings.logLevel, leaves, path);
						}).open();
					}
					return true;
				}
				return false;
			}
		});	

		this.app.workspace.onLayoutReady(() => {
			this.addingCanvasClassToLeaf(this.app.workspace.getActiveFile());
		});
		
		this.registerEvent(this.app.workspace.on("active-leaf-change", (leaf) => {
			const view = leaf?.view instanceof FileView ? leaf.view : null;
			const file = view ? view.file : null;
			this.addingCanvasClassToLeaf(file);
			//prevent duplicate button when reopening the same file
			const allCssButton = document.querySelectorAll(".canvas-css-class-button");
			allCssButton.forEach((button) => {
				button.remove();
			});
			if (view?.getViewType() === "canvas" && file?.extension === "canvas") {
				if (this.settings.addButtonSetting) {
					const button = view.addAction("ratio",(i18next.t("commands.editCanvas", {name: file.basename})), async () => {
						const path = file.path;
						this.quickCreateSettings(path, this.settings.defaultAppendMode);
						let canvas = this.settings.canvasAdded.find((item) => item.canvasPath === path);
						if (!canvas) return;
						const originalList = JSON.parse(JSON.stringify(canvas.canvasClass)) as string[];
						new ListClasses(this.app, canvas, this, async (result) => {
							canvas = result;
							await this.saveSettings();
							const leaves = this.getLeafByPath(path);
							const removedClasses = originalList.filter((item) => !result.canvasClass.includes(item));
							reloadCanvas(path, canvas.appendMode, this.settings, leaves);
							removeListFromDOM(removedClasses, this.settings.logLevel, leaves, path);
							if (canvas.appendMode === AppendMode.body) {
								this.removeWorkspaceButton();
								this.addButtonBodyView(view, path);
							} else {
								this.removeBodyButton();
								this.addWorkspaceButton(view, path);
							}
						}).open();
					});
					button.addClass("canvas-css-class-button");
				}
				if (this.settings.addButtonSwitchView) {
					const path = file.path;
					let viewMode = this.settings.defaultAppendMode;
					const thisFile = this.settings.canvasAdded.find((item) => item.canvasPath === path);
					if (thisFile) viewMode = thisFile.appendMode as AppendMode;
					if (viewMode === AppendMode.body) {
						this.addButtonBodyView(view, path);
					} else {
						this.addWorkspaceButton(view, path);
					}
				}
			}
		}));
		
		this.addSettingTab(new CanvasCssSettingsTabs(this.app, this));
		
	}
	
	removeBodyButton() {
		if (!this.settings.addButtonSwitchView) return;
		const bodyButton = document.querySelector(".switch-body-button");
		if (bodyButton) bodyButton.remove();
	}

	removeWorkspaceButton() {
		if (!this.settings.addButtonSwitchView) return;
		const workspaceButton = document.querySelector(".switch-workspace-button");
		if (workspaceButton) workspaceButton.remove();
	}

	async addButtonBodyView(view: FileView | ItemView, path: string) {
		if (!this.settings.addButtonSwitchView) return;
		const button = view.addAction("layout-template", i18next.t("commands.switchToBodyMode"), async () => {
			const oldClasses = this.quickCreateSettings(path, AppendMode.body);
			oldClasses.appendMode = AppendMode.body;
			await this.saveSettings();
			const leaves = this.getLeafByPath(path);
			reloadCanvas(path, oldClasses.appendMode, this.settings, leaves);
			//switch to other button
			this.removeBodyButton();
			this.addWorkspaceButton(view, path);
		});
		button.addClass("canvas-css-class-button", "switch-body-button");
	}

	async addWorkspaceButton(view: FileView | ItemView, path: string) {
		if (!this.settings.addButtonSwitchView) return;
		const button = view.addAction("table", i18next.t("commands.switchToViewContentMode"), async () => {
			const oldClasses = this.quickCreateSettings(path, AppendMode.workspaceLeaf);
			oldClasses.appendMode = AppendMode.workspaceLeaf;
			await this.saveSettings();
			const leaves = this.getLeafByPath(path);
			reloadCanvas(path, oldClasses.appendMode, this.settings, leaves);
			//switch to other button 
			this.removeWorkspaceButton();
			this.addButtonBodyView(view, path);
		});
		button.addClass("canvas-css-class-button", "switch-workspace-button");
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



