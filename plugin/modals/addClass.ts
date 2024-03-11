import { App, Modal, Setting } from "obsidian";

import { t } from "../i18n";
import { AppendMode } from "../interface";

const add = (t("addButton") as string);
const className = (t("className") as string);

/**
 * Modal to add a CSS class to a canvas
 * @param app {App} the Obsidian app
 * @param onSubmit {function} the callback function
 */

export class AddCssClass extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: (t("addCssClass.title") as string) });
		new Setting(contentEl)
			.setName(className)
			.setDesc(t("addCssClass.desc") as string)
			.addText(text => text
				.setPlaceholder(className)
				.onChange(async (value) => {
					this.result = value;
				}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText(add)
				.onClick(async () => {
					this.onSubmit(this.result.replace(/\W+/g, "-").toLowerCase());
					this.close();
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}


/**
 * Modal to add a new css class to a new file
 * @param app {App} the Obsidian app
 * @param onSubmit {function} the callback function
 */
export class AddNewClassWithFile extends Modal {
	path: string;
	cssClass: string;
	appendMode: string;
	onSubmit: (path: string, cssClass: string, appendMode: string) => void;

	/**
	 * Constructor
	 * @param app: App
	 * @param onSubmit {function} the callback function
	 */
	constructor(app: App, onSubmit: (path: string, cssClass: string, appendMode: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: t("addCssClass.title") as string });
		new Setting(contentEl)
			.setName(t("addFilePath.filePath") as string)
			.setDesc(t("addFilePath.desc") as string)
			.addText(text => text
				.setPlaceholder(t("addFilePath.filePath") as string)
				.onChange(async (value) => {
					this.path = value.replace(".canvas", "") + ".canvas";
				}));
		new Setting(contentEl)
			.setName(className)
			.setDesc(t("addCssClass.desc") as string)
			.addText(text => text
				.setPlaceholder(className)
				.onChange(async (value) => {
					this.cssClass = value;
				}));

		const desc = document.createDocumentFragment();
		// create list of modes
		desc.createEl("p", { text: t("settings.appendMode.desc") as string });
		const list = desc.createEl("ul");
		for (const mode in AppendMode) {
			const li = list.createEl("li");
			li.createEl("span", { text: AppendMode[mode as keyof typeof AppendMode] });
			li.createEl("span", { text: " - " });
			li.createEl("span", { text: t(`settings.appendMode.${mode}Desc`) as string });
		}

		new Setting(contentEl)
			.setName(t("settings.appendMode.title") as string)
			.setDesc(desc)
			.addDropdown(dropdown => dropdown
				.addOption("body", t("settings.appendMode.options.body") as string)
				.addOption("workspace-leaf", t("settings.appendMode.options.workspaceLeaf") as string)
				.setValue(AppendMode.body)
				.onChange(async (value) => {
					this.appendMode = value;
					this.close();
				}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText(add)
				.onClick(async () => {
					this.onSubmit(this.path.replace(".canvas", "") + ".canvas", this.cssClass.replace(/\W+/g, "-").toLowerCase(), this.appendMode);
					this.close();
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}



