import {App, Notice, PluginSettingTab, Setting} from "obsidian";
import CanvasCSS from "./main";
import {AddCssClass, AddNewClassWithFile} from "./modals/addClass";

export class CanvasCssSettingsTabs extends PluginSettingTab {
	plugin: CanvasCSS;

	constructor(app: App, plugin: CanvasCSS) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl("h1", {text: "Canvas CSS Class Settings"});
		
		if (this.plugin.settings.canvasAdded.length=== 0) {
			containerEl.createEl("p", {text: "No classes added yet."});
			containerEl.createEl("p", {text: "Use the command modal to add a class."});
		}
		
		new Setting(containerEl)
			.setName("Adding a new class")
			.setDesc("Use the command modal to add a class.")
			.addButton(cb => cb
				.setButtonText("Add a class")
				.onClick(async () => {
					new AddNewClassWithFile(this.app, async (path:string, cssClass: string) => {
						this.plugin.settings.canvasAdded.push({canvasPath: path, canvasClass: [cssClass]});
						await this.plugin.saveSettings();
						this.display();
						this.plugin.addToDOM(cssClass, path);
					}).open();
				}));
		
		for (const canvas of this.plugin.settings.canvasAdded) {
			new Setting(containerEl)
				.setName(canvas.canvasPath.replace(".canvas", ""))
				.setClass("canvas-css-class-title")
				.addExtraButton(cb =>
					cb
						.setIcon("plus")
						.setTooltip("Add a class to this canvas")
						.onClick(async () => {
							new AddCssClass(this.app, async (cssClass: string) =>
							{
								if (canvas.canvasClass.indexOf(cssClass) === -1) {
									canvas.canvasClass.push(cssClass);
									await this.plugin.saveSettings();
									this.display();
									this.plugin.addToDOM(cssClass, canvas.canvasPath);
								} else {
									new Notice("This class already exists for this canvas.");
								}
							}).open();
						}))
			.addExtraButton(cb =>
					cb
						.setIcon("trash")
						.setTooltip("Remove all classes from this canvas")
						.onClick(async () => {
							this.plugin.settings.canvasAdded = this.plugin.settings.canvasAdded.filter((item) => item.canvasPath !== canvas.canvasPath);
							await this.plugin.saveSettings();
							//remove all classes from body
							document.body.classList.remove(...canvas.canvasClass);
							this.display();
						}));
			for (const cssClass of canvas.canvasClass) {
				new Setting(containerEl)
					.setName(cssClass)
					.setClass("canvas-css-class-opt")
					.addButton(cb =>
						cb.setIcon("cross")
							.setTooltip("Remove")
							.onClick(async () => {
								//remove class from the array
								const index = canvas.canvasClass.indexOf(cssClass);
								if (index > -1) {
									canvas.canvasClass.splice(index, 1);
								}
								//remove canvas from the array if no classes are left
								if (canvas.canvasClass.length === 0) {
									const index = this.plugin.settings.canvasAdded.indexOf(canvas);
									if (index > -1) {
										this.plugin.settings.canvasAdded.splice(index, 1);
									}
								}
								await this.plugin.saveSettings();
								this.display();
								this.plugin.removeFromDOM(cssClass);
							})
					)
			}
		}
	}
}
