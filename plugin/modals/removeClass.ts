import {App, FuzzySuggestModal, Notice} from "obsidian";
import {CanvasCssSettings} from "../interface";
import CanvasCSS from "../main";
import {t, StringFunction} from "../i18n";
import {removeFromDOM} from "../utils";


/**
 * Modal to remove a CSS class from a canvas
 * @param app {App} the Obsidian app
 * @param plugin {CanvasCSS} the plugin
 * @param settings {CanvasCssSettings} the plugin settings
 * @param filepath {string} the path of the canvas
 */
export class RemoveCSSclass extends FuzzySuggestModal<string> {
	app: App;
	plugin: CanvasCSS;
	settings: CanvasCssSettings;
	filepath: string;
	
	
	constructor(app: App, plugin: CanvasCSS, settings: CanvasCssSettings, filepath: string) {
		super(app);
		this.plugin = plugin;
		this.settings = settings;
		this.filepath = filepath;
	}
	
	getItems(): string[] {
		const findedCanvas = this.settings.canvasAdded.find((canvas) => canvas.canvasPath === this.filepath)?.canvasClass;
		if (findedCanvas) {
			return findedCanvas;
		} else {
			return [];
		}
	}
	
	getItemText(item: string): string {
		return item;
	}
	
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onChooseItem(item: { toString: () => string; }, evt: MouseEvent | KeyboardEvent): void {
		//remove item from the array
		const findedCanvas = this.settings.canvasAdded.find((canvas) => canvas.canvasPath === this.filepath);
		if (findedCanvas) {
			const index = findedCanvas.canvasClass.indexOf(item.toString());
			if (index > -1) {
				findedCanvas.canvasClass.splice(index, 1);
			}
			//remove canvas from the array if no classes are left
			if (findedCanvas.canvasClass.length === 0) {
				const index = this.settings.canvasAdded.indexOf(findedCanvas);
				if (index > -1) {
					this.settings.canvasAdded.splice(index, 1);
				}
			}
			this.plugin.saveSettings();
			new Notice((t("removeFromCanvas") as StringFunction)([item.toString(), this.filepath]));
			const openedLeaves = this.plugin.getSpecificLeaf(this.app.workspace, this.filepath);
			removeFromDOM(item.toString(), this.settings.logLevel, openedLeaves, this.filepath);
		}
	}
}
