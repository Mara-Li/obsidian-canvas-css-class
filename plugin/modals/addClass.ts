import i18next from "i18next";
import { App, Modal, Setting } from "obsidian";

import { AppendMode } from "../interface";

const add = (i18next.t("addButton"));
const className = (i18next.t("className"));

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
		contentEl.createEl("h1", { text: (i18next.t("addCssClass.title")) });
		new Setting(contentEl)
			.setName(className)
			.setDesc(i18next.t("addCssClass.desc"))
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
		new Setting(contentEl)
			.setHeading()
			.setName(i18next.t("addCssClass.title"));
		new Setting(contentEl)
			.setName(i18next.t("addFilePath.filePath"))
			.setDesc(i18next.t("addFilePath.desc"))
			.addText(text => text
				.setPlaceholder(i18next.t("addFilePath.filePath"))
				.onChange(async (value) => {
					this.path = `${value.replace(".canvas", "")}.canvas`;
				}));
		new Setting(contentEl)
			.setName(className)
			.setDesc(i18next.t("addCssClass.desc"))
			.addText(text => text
				.setPlaceholder(className)
				.onChange(async (value) => {
					this.cssClass = value;
				}));

		const desc = document.createDocumentFragment();
		// create list of modes
		desc.createEl("p", { text: i18next.t("settings.appendMode.desc")});
		const list = desc.createEl("ul");
		for (const mode in AppendMode) {
			const li = list.createEl("li");
			li.createEl("span", { text: AppendMode[mode as keyof typeof AppendMode] });
			li.createEl("span", { text: " - " });
			const translated = mode === "body" ? i18next.t("settings.appendMode.bodyDesc") : i18next.t("settings.appendMode.workspaceLeafDesc");
			li.createEl("span", { text: translated});
		}

		new Setting(contentEl)
			.setName(i18next.t("settings.appendMode.title"))
			.setDesc(desc)
			.addDropdown(dropdown => dropdown
				.addOption("body", i18next.t("settings.appendMode.options.body"))
				.addOption("workspace-leaf", i18next.t("settings.appendMode.options.workspaceLeaf"))
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



