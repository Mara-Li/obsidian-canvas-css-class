import {ItemView, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, CanvasCssSettings} from "./interface";
import {CanvasCssSettingsTabs} from "./settings";
import {AddCssClass} from "./modals/addClass";
import {RemoveCSSclass} from "./modals/removeClass";
import {t, translationLanguage} from "./i18n";
import {logging, removeFromDOM} from "./utils";

export default class CanvasCSS extends Plugin {
	settings: CanvasCssSettings;
	
	/**
	 * This function add to the dom (view-content) the css class ;
	 * @param {string} cssClass the css class to add
	 * @param {string} filePath the path of the canvas, to add the class to the right canvas
	 */
	addToDOM(cssClass: string, filePath: string) {
		if (!document) return;
		// @ts-ignore
		if (document.querySelector('.workspace-leaf.mod-active .view-content').getAttribute("data-canvas-path") === filePath) {
			this.logMessage(`Adding ${cssClass} to the dom`);
			// @ts-ignore
			this.logMessage(`Class of ${document.querySelector('.workspace-leaf.mod-active .view-content').getAttribute('data-canvas-path')} : ${document.querySelector('.workspace-leaf.mod-active .view-content').classList}`);
			// @ts-ignore
			document.querySelector('.workspace-leaf.mod-active .view-content').classList.add(cssClass);
		}
	}
	
	/**
	 * Alias of the logging function
	 * @param message {string} the message to log
	 */
	logMessage(message: string): void {
		logging(message, this.settings.logLevel);
	}
	

	
	async onload() {
		await this.loadSettings();
		console.log(`Loading ${this.manifest.name.replaceAll(' ', '')} v${this.manifest.version} (language: ${translationLanguage})`);
		
		this.addCommand({
			id: 'add-canvas-css-class',
			name: t('commands.addCanvas') as string,
			checkCallback: (checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					if (!checking) {
						//@ts-ignore
						const canvasPath = canvasView.file.path;
						new AddCssClass(this.app, (result) => {
							const oldClasses = this.settings.canvasAdded.find((item) => item.canvasPath === canvasPath)
							if (oldClasses) {
								if (oldClasses.canvasClass.includes(result)) {
									new Notice(t('settings.alreadyApplied') as string);
								} else {
									oldClasses.canvasClass.push(result);
									// replace the old canvas class with the new one
									this.settings.canvasAdded = this.settings.canvasAdded.map((item) => {
										if (item.canvasPath === canvasPath) {
											return oldClasses;
										} else {
											return item;
										}
									})
								}
							} else {
								this.settings.canvasAdded.push({canvasPath: canvasPath, canvasClass: [result]});
							}
							this.saveSettings();
							this.addToDOM(result, canvasPath);
						}).open();
					} return true;
				} return false;
			}
		});
		
		this.addCommand({
			id: 'remove-canvas-css-class',
			name: t('commands.removeCanvas') as string,
			checkCallback: (checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					//@ts-ignore
						const canvasPath = canvasView.file.path;
						const oldClasses = this.settings.canvasAdded.find((item) => item.canvasPath === canvasPath)
						if (oldClasses) {
						if (!checking) {
							//@ts-ignore
								new RemoveCSSclass(this.app, this, this.settings, canvasPath).open();
							}	return true;
					} return false;
				} return false;
			}
		})
		
		this.registerEvent(this.app.workspace.on("file-open", (file) => {
			// @ts-ignore
			const dataType = document.querySelector('.workspace-leaf.mod-active > .workspace-leaf-content') ? document.querySelector('.workspace-leaf.mod-active > .workspace-leaf-content').attributes[1].value : "";
			if (file && file.extension === "canvas" && dataType === "canvas") {
				// @ts-ignore
				document.querySelector('.workspace-leaf.mod-active .view-content').setAttribute("data-canvas-path", file.path);
				// @ts-ignore
				document.querySelector('.workspace-leaf.mod-active .view-content').classList.add("canvas-file");
				const canvasClassesNotFromThisFile = this.settings.canvasAdded.filter((item) => item.canvasPath !== file.path);
				for (const canvas of canvasClassesNotFromThisFile) {
					for (const cssClass of canvas.canvasClass) {
						removeFromDOM(cssClass, this.settings.logLevel);
					}
				}
				
				const canvasClassList = this.settings.canvasAdded.find((canvas) => canvas.canvasPath === file.path);
				if (canvasClassList) {
					for (const canvas of canvasClassList.canvasClass) {
							this.addToDOM(canvas, file.path);
						}
					}
				}
		}));

		this.addSettingTab(new CanvasCssSettingsTabs(this.app, this));
		
	}

	onunload() {
		console.log(`Unloading ${this.manifest.name.replaceAll(' ', '')} v${this.manifest.version} (language: ${translationLanguage})`);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



