import { AbstractInputSuggest, App } from "obsidian";
import CanvasCSS from "plugin/main";

export class CanvasClassSuggester extends AbstractInputSuggest<string> {

	plugin: CanvasCSS;
	
	constructor(private inputEl: HTMLInputElement, plugin: CanvasCSS, app: App, private onSubmit: (value: string) => void) {
		super(app, inputEl);
		this.plugin = plugin;
	}
	
	renderSuggestion(value: string, el: HTMLElement): void {
		el.setText(value);
	}

	getSuggestions(query: string): string[] {
		const canvas = this.plugin.app.vault.getFiles().filter((file) => file.extension === "canvas").filter((file) => file.name.toLowerCase().contains(query.toLowerCase()) && !this.plugin.settings.canvasAdded.find((canvas) => canvas.canvasPath === file.path));
		return canvas.map((file) => file.path);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
		this.onSubmit(value);
		this.inputEl.value = value;
		this.inputEl.focus();
		this.inputEl.trigger("input");
		this.close();
	}

}
