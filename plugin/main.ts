import {ItemView, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, CanvasCssSettings} from "./interface";
import {CanvasCssSettingsTabs} from "./settings";
import {AddCssClass} from "./modals/addClass";
import {RemoveCSSclass} from "./modals/removeClass";

export default class CanvasCSS extends Plugin {
	settings: CanvasCssSettings;
	
	addToDOM(cssClass: string, filePath: string) {
		if (!document) return;
		console.log(cssClass, filePath);
		// @ts-ignore
		if (document.querySelector('body').getAttribute("data-canvas-path") === filePath) {
			// @ts-ignore
			document.querySelector('body').classList.add(cssClass);
		} else {
			this.removeAllClasses();
		}
	}
	
	removeFromDOM(cssClass: string) {
		if (!document) return;
		// @ts-ignore
		document.querySelector('body').classList.remove(cssClass);
	}
	
	removeAllClasses() {
		for (const canvas of this.settings.canvasAdded) {
			for (const cssClass of canvas.canvasClass) {
				this.removeFromDOM(cssClass);
			}
		}
	}
	
	async onload() {
		await this.loadSettings();
		
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'add-canvas-css-class',
			name: 'Add a CSS Class to the Canvas',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					if (!checking) {
						//@ts-ignore
						const canvasPath = canvasView.file.path;

						new AddCssClass(this.app, (result) => {
							const oldClasses = this.settings.canvasAdded.find((item) => item.canvasPath === canvasPath)
							if (oldClasses) {
								if (oldClasses.canvasClass.includes(result)) {
									new Notice("Class already added.");
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
					}
					return true;
				}
			}
		});
		
		this.addCommand({
			id: 'remove-canvas-css-class',
			name: 'Remove a CSS Class from the Canvas',
			checkCallback: (checking: boolean) => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if ((canvasView?.getViewType() === "canvas")) {
					if (!checking) {
						//@ts-ignore
						const canvasPath = canvasView.file.path;
						const oldClasses = this.settings.canvasAdded.find((item) => item.canvasPath === canvasPath)
						if (oldClasses) {
							new RemoveCSSclass(this.app, this, this.settings, canvasPath).open();
						}
					}
					return true;
				}
			}
		})
		
		this.registerEvent(this.app.workspace.on("file-open", (file) => {
			if (file && file.extension === "canvas") {
				// @ts-ignore
				document.querySelector('body').setAttribute("data-canvas-path", file.path);
				
				const canvasClassesNotFromThisFile = this.settings.canvasAdded.filter((item) => item.canvasPath !== file.path);
				for (const canvas of canvasClassesNotFromThisFile) {
					for (const cssClass of canvas.canvasClass) {
						this.removeFromDOM(cssClass);
					}
				}
				
				const canvasClassList = this.settings.canvasAdded.find((canvas) => canvas.canvasPath === file.path);
				
				if (canvasClassList) {
					for (const canvas of canvasClassList.canvasClass) {
							this.addToDOM(canvas, file.path);
						}
					}
				
				} else {
				// @ts-ignore
				document.querySelector('body').removeAttribute("data-canvas-path");
				this.removeAllClasses();
			}
		}));

		this.addSettingTab(new CanvasCssSettingsTabs(this.app, this));
		
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	
	
	static removeFromDOM(cssClass: string) {
		// @ts-ignore
		document.querySelector('body').classList.remove(cssClass);
	}
}



