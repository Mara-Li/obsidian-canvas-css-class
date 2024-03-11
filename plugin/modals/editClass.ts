import {App, Modal, Setting} from "obsidian";

import {t} from "../i18n";
import {AppendMode} from "../interface";

const add = (t("addButton") as string);


/**
 * Modal to rename a css class in the settings
 * @param app {App} the Obsidian app
 * @param oldName {string} the old class name
 * @param onSubmit {function} the callback function
 */
export class RenameCssClass extends Modal {
	result: string;
	oldName: string;
	onSubmit:(result: string)=>void;
	
	constructor(app: App, oldName:string, onSubmit: (result: string) => void) {
		super(app);
		this.oldName = oldName;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", {text: t("renameCssClass.title") as string});
		new Setting(contentEl)
			.setName(t("renameCssClass.title") as string)
			.setDesc(t("renameCssClass.desc") as string)
			.addText(text =>
				text
					.setPlaceholder(t("renameCssClass.placeholder") as string)
					.setValue(this.oldName)
					.onChange(async (value) => {
						this.result = value;
					}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText(add)
				.onClick( () => {
					this.onSubmit(this.result.replace(/\W+/g, "-").toLowerCase());
					this.close();
				}));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

/**
 * Modal to change the path of a canvas file
 * @param app {App} the Obsidian app
 * @param oldPath {string} the old path
 * @param onSubmit {function} the callback function
 */

export class RenameCanvasPath extends Modal {
	result: string;
	oldPath: string;
	onSubmit:(result: string)=>void;
	
	constructor(app: App, oldPath:string, onSubmit: (result: string) => void) {
		super(app);
		this.oldPath = oldPath;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", {text: (t("renameFilePath.title") as string)});
		new Setting(contentEl)
			.setName(t("renameFilePath.placeholder") as string)
			.setDesc(t("renameFilePath.desc") as string)
			.addText(text =>
				text
					.setPlaceholder(t("renameFilePath.placeholder") as string)
					.setValue(this.oldPath)
					.onChange(async (value) => {
						this.result = value;
					}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText(add)
				.onClick(async () => {
					this.onSubmit(this.result.replace(".canvas", "") + ".canvas");
					this.close();
				}));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

/**
 * Modal to change the mode for the adding of class in the canvas
 * @param app {App} the Obsidian app
 * @param oldMode {string} the old mode
 * @param onSubmit {function} the callback function
 */
export class EditMode extends Modal {
	result: string;
	oldMode: string;
	onSubmit:(result: string)=>void;
	
	constructor(app: App, oldMode:string, onSubmit: (result: string) => void) {
		super(app);
		this.oldMode = oldMode;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", {text: t("settings.appendMode.title") as string});
		
		const desc = document.createDocumentFragment();
		// create list of modes
		desc.createEl("p", {text: t("settings.appendMode.desc") as string});
		const list = desc.createEl("ul");
		for (const mode in AppendMode) {
			const li = list.createEl("li");
			li.createEl("span", {text: AppendMode[mode as keyof typeof AppendMode]});
			li.createEl("span", {text: " - "});
			li.createEl("span", {text: t(`settings.appendMode.${mode}Desc`) as string});
		}
		
		new Setting(contentEl)
			.setName(t("settings.appendMode.title") as string)
			.setDesc(desc)
			.addDropdown(dropdown => dropdown
				.addOption(AppendMode.body, t("settings.appendMode.options.body") as string)
				.addOption(AppendMode.workspaceLeaf, t("settings.appendMode.options.workspaceLeaf") as string)
				.setValue(this.oldMode)
				.onChange(async (value) => {
					this.result = value;
				}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText(add)
				.onClick(async () => {
					this.onSubmit(this.result);
					this.close();
				}));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
