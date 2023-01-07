import {App, Modal, Setting} from "obsidian";
import {t} from "../i18n";
import {AppendBehavior} from "../interface";

const add = (t("addButton") as string);
const className = (t("className") as string);


export class AddCssClass extends Modal {
	result: string;
	onSubmit:(result: string)=>void;
	
	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", {text:(t("addCssClass.title") as string)});
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
		const {contentEl} = this;
		contentEl.empty();
	}
}

export class AddNewClassWithFile extends Modal {
	path: string;
	cssClass: string;
	appendBehavior: string;
	onSubmit:(path: string, cssClass: string, appendBehavior: string)=>void;
	
	constructor(app: App, onSubmit: (path: string, cssClass: string, appendBehavior: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", {text: t("addCssClass.title") as string});
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
		new Setting(contentEl)
			.setName(t("settings.appendBehavior.title") as string)
			.setDesc(t("settings.appendBehavior.desc") as string)
			.addDropdown(dropdown => dropdown
				.addOption("body", t("settings.appendBehavior.options.body") as string)
				.addOption("workspace-leaf", t("settings.appendBehavior.options.workspaceLeaf") as string)
				.setValue(AppendBehavior.body)
				.onChange(async (value) => {
					this.appendBehavior = value;
					this.close();
				}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText(add)
				.onClick(async () => {
					this.onSubmit(this.path.replace(".canvas", "") + ".canvas", this.cssClass.replace(/\W+/g, "-").toLowerCase(), this.appendBehavior);
					this.close();
				}));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}



