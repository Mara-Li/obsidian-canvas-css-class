import {ItemView, Notice, Plugin} from "obsidian";
import {DEFAULT_SETTINGS, CanvasCssSettings, AppendBehavior} from "./interface";
import {CanvasCssSettingsTabs} from "./settings";
import {AddCssClass} from "./modals/addClass";
import {RemoveCSSclass} from "./modals/removeClass";
import {t, translationLanguage} from "./i18n";
import {addToDOM, logging, reloadCanvas, removeFromDOM, whereToAppend} from "./utils";
import {EditBehavior} from "./modals/editClass";

export default class CanvasCSS extends Plugin {
	settings: CanvasCssSettings;
	

	
	/**
	 * Alias of the logging function
	 * @param message {string} the message to log
	 */
	logMessage(message: string): void {
		logging(message, this.settings.logLevel);
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
			id: "change-append-behavior",
			name: t("commands.changeAppendBehavior") as string,
			checkCallback: (checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
				//@ts-ignore
					const canvasPath = canvasView.file.path;
					const oldClasses = this.settings.canvasAdded.find((item) => item.canvasPath === canvasPath);
					if (oldClasses) {
						if (!checking) {
						//@ts-ignore
							new EditBehavior(this.app, oldClasses.appendBehavior, async (newAppendBehavior: string) => {
								oldClasses.appendBehavior = newAppendBehavior;
								await this.saveSettings();
								reloadCanvas(canvasPath, oldClasses.appendBehavior, this.settings);
							}).open();
						
						}	return true;
					} return false;
				} return false;
			}
		});
		
		this.registerEvent(this.app.workspace.on("file-open", (file) => {
			// @ts-ignore
			const dataType = document.querySelector(".workspace-leaf.mod-active > .workspace-leaf-content") ? document.querySelector(".workspace-leaf.mod-active > .workspace-leaf-content").attributes[1].value : "";
			if (file && file.extension === "canvas" && dataType === "canvas") {
				const canvasClassList = this.settings.canvasAdded.find((canvas) => canvas.canvasPath === file.path);
				const querySelector = whereToAppend(canvasClassList?.appendBehavior ? canvasClassList.appendBehavior : AppendBehavior.workspaceLeaf);
				document.querySelector(querySelector)?.setAttribute("data-canvas-path", file.path);
				document.querySelector(querySelector)?.classList.add("canvas-file");
				if (canvasClassList) {
					reloadCanvas(file.path, canvasClassList.appendBehavior, this.settings);
				} else {
					document.querySelector("body")?.removeAttribute("data-canvas-path");
					document.querySelector("body")?.classList.remove("canvas-file");
				}

				const canvasClassesNotFromThisFile = this.settings.canvasAdded.filter((item) => item.canvasPath !== file.path);
				for (const canvas of canvasClassesNotFromThisFile) {
					for (const cssClass of canvas.canvasClass) {
						removeFromDOM(cssClass, this.settings.logLevel);
					}
				}
			} else if (dataType !== "canvas") {
				document.querySelector("body")?.removeAttribute("data-canvas-path");
				document.querySelector("body")?.classList.remove("canvas-file");
				document.querySelector(".workspace-leaf.mod-active .view-content")?.removeAttribute("data-canvas-path");
				document.querySelector(".workspace-leaf.mod-active .view-content")?.classList.remove("canvas-file");
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



