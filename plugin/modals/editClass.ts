import {App, Modal, Setting} from "obsidian";
import {t} from "../i18n";
import {AppendBehavior} from "../interface";

const add = (t("addButton") as string);

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

export class EditBehavior extends Modal {
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
		contentEl.createEl("h1", {text: t("settings.appendBehavior.title") as string});
		
		const desc = document.createDocumentFragment();
		// create list of behaviors
		desc.createEl("p", {text: t("settings.appendBehavior.desc") as string});
		const list = desc.createEl("ul");
		for (const behavior in AppendBehavior) {
			const li = list.createEl("li");
			li.createEl("span", {text: AppendBehavior[behavior as keyof typeof AppendBehavior]});
			li.createEl("span", {text: " - "});
			li.createEl("span", {text: t(`settings.appendBehavior.${behavior}Desc`) as string});
		}
		
		new Setting(contentEl)
			.setName(t("settings.appendBehavior.title") as string)
			.setDesc(desc)
			.addDropdown(dropdown => dropdown
				.addOption(AppendBehavior.body, t("settings.appendBehavior.options.body") as string)
				.addOption(AppendBehavior.workspaceLeaf, t("settings.appendBehavior.options.workspaceLeaf") as string)
				.setValue(this.oldName)
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
