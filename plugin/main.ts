import {FileView, ItemView, Notice, Plugin, Workspace, WorkspaceLeaf} from "obsidian";
import {DEFAULT_SETTINGS, CanvasCssSettings, AppendMode} from "./interface";
import {CanvasCssSettingsTabs} from "./settings";
import {AddCssClass} from "./modals/addClass";
import {RemoveCSSclass} from "./modals/removeClass";
import {StringFunction, t, translationLanguage} from "./i18n";
import {
	addToDOM, logging,
	reloadCanvas,
	removeCanvasPathAndCanvasFile, removeFromBody,
	removeFromViewContent,
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
			this.saveSettings().then();
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
				if (!canvas.appendMode) {
					canvas.appendMode = AppendMode.workspaceLeaf;
				}
			});
			this.saveSettings().then();
		}
	}
	
	/**
	 * Allow to get the canvas opened in the current view, to get a specific one
	 * @param workspace {Workspace} the Obsidian workspace
	 * @param filePath {string} the path of the canvas
	 * @return {WorkspaceLeaf[]} all leaf corresponding to the canvas file
	 */
	getSpecificLeaf(workspace: Workspace, filePath: string): WorkspaceLeaf[] {
		const allSpecificLeafs: WorkspaceLeaf[] = [];
		workspace.iterateAllLeaves((leaf) => {
			if (leaf.view instanceof FileView && leaf.view.file.path === filePath && !allSpecificLeafs.includes(leaf)) {
				allSpecificLeafs.push(leaf);
			}
		});
		logging(`Found ${allSpecificLeafs.length} leaves for ${filePath}`, this.settings.logLevel);
		return allSpecificLeafs;
	}
	
	async onload() {
		await this.loadSettings();
		console.log(`Loading ${this.manifest.name.replaceAll(" ", "")} v${this.manifest.version} (language: ${translationLanguage})`);
		
		this.convertOldSettings();
		
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
								this.settings.canvasAdded.push({canvasPath: canvasPath, canvasClass: [result], appendMode: AppendMode.workspaceLeaf});
							}
							this.saveSettings();
							const mode = this.settings.canvasAdded.find((item) => item.canvasPath === canvasPath)?.appendMode;
							const theOpenedLeaf = this.getSpecificLeaf(this.app.workspace, canvasPath);
							addToDOM(result, canvasPath, mode ? mode : AppendMode.workspaceLeaf, this.settings.logLevel, theOpenedLeaf);
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
			id: "switch-to-body-mode",
			name: t("commands.switchToBodyMode") as string,
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
							(t("message.switchedToBody") as string)
						);
						const leaves = this.getSpecificLeaf(this.app.workspace, canvasPath);
						reloadCanvas(canvasPath, oldClasses.appendMode, this.settings, leaves);
					}
					return true;
				}
				return false;
			}});
		
		this.addCommand({
			id: "switch-to-view-content-mode",
			name: t("commands.switchToViewContentMode") as string,
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
							(t("message.switchedToViewContent") as string)
						);
						const leaves = this.getSpecificLeaf(this.app.workspace, canvasPath);
						reloadCanvas(canvasPath, oldClasses.appendMode, this.settings, leaves);
					}
					return true;
				}
				return false;
			}});
		
		this.addCommand({
			id: "quick-switch-mode",
			name: t("commands.quickSwitch") as string,
			checkCallback:(checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					//@ts-ignore
					const canvasPath = canvasView.file.path;
					if (!checking) {
						const oldClasses = this.quickCreateSettings(canvasPath, AppendMode.workspaceLeaf);
						oldClasses.appendMode = oldClasses.appendMode === AppendMode.body ? AppendMode.workspaceLeaf : AppendMode.body;
						this.saveSettings();
						new Notice(
							(t("message.quickSwitch") as StringFunction)(oldClasses.appendMode)
						);
						const leaves = this.getSpecificLeaf(this.app.workspace, canvasPath);
						reloadCanvas(canvasPath, oldClasses.appendMode, this.settings, leaves);
					}
					return true;
				}
				return false;
			}});
		
		this.registerEvent(this.app.workspace.on("file-open", (file) => {
			// @ts-ignore
			const leavesTypes = this.app.workspace.getActiveViewOfType(ItemView)?.getViewType();
			if (file && file.extension === "canvas" && leavesTypes === "canvas") {
				logging(`OPENED FILE ${file.path} IS A CANVAS ; ADDING CLASS`, this.settings.logLevel);
				const canvasClassList = this.settings.canvasAdded.find((canvas) => canvas.canvasPath === file.path);
				const leaves = this.getSpecificLeaf(this.app.workspace, file.path);
				if (canvasClassList) {
					reloadCanvas(file.path, canvasClassList.appendMode, this.settings, leaves);
				}
				const canvasClassesNotFromThisFile = this.settings.canvasAdded.filter((item) => item.canvasPath !== file.path);
				
				for (const canvas of canvasClassesNotFromThisFile) {
					for (const cssClass of canvas.canvasClass) {
						const isIncluded = canvasClassList ? canvasClassList.canvasClass.includes(cssClass) : false;
						if (!isIncluded) {
							removeFromViewContent(cssClass, this.settings.logLevel, leaves);
							removeFromBody(cssClass, this.settings.logLevel);
						}
					}
				}
			} else if (leavesTypes !== "canvas") {
				logging(`OPENED FILE (${file?.path}) IS NOT A CANVAS, REMOVING ALL FROM THE BODY`, this.settings.logLevel);
				removeCanvasPathAndCanvasFile(AppendMode.body);
				for (const canvas of this.settings.canvasAdded) {
					for (const cssClass of canvas.canvasClass) {
						removeFromBody(cssClass, this.settings.logLevel);
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



