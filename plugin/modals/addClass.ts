import {App, Modal, Setting} from "obsidian";
import {t} from "../i18n";

const add = (t('addButton') as string);
const className = (t('className') as string);


export class AddCssClass extends Modal {
	result: string;
	onSubmit:(result: string)=>void;
	
  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", {text:(t('addCssClass.title') as string)});
		new Setting(contentEl)
			.setName(className)
			.setDesc(t('addCssClass.desc') as string)
			.addText(text => text
				.setPlaceholder(className)
				.onChange(async (value) => {
					this.result = value;
				}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText(add)
				.onClick(async () => {
					this.onSubmit(this.result.replace(/\W+/g, '-').toLowerCase());
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
	onSubmit:(path: string, cssClass: string)=>void;
	
	constructor(app: App, onSubmit: (path: string, cssClass: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", {text: t('addCssClass.title') as string});
		new Setting(contentEl)
			.setName(t('addFilePath.filePath') as string)
			.setDesc(t('addFilePath.desc') as string)
			.addText(text => text
				.setPlaceholder(t('addFilePath.filePath') as string)
				.onChange(async (value) => {
					this.path = value.replace(".canvas", "") + ".canvas";
				}));
		new Setting(contentEl)
			.setName(className)
			.setDesc(t('addCssClass.desc') as string)
			.addText(text => text
				.setPlaceholder(className)
				.onChange(async (value) => {
					this.cssClass = value;
				}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText(add)
				.onClick(async () => {
					this.onSubmit(this.path.replace(".canvas", "") + ".canvas", this.cssClass.replace(/\W+/g, '-').toLowerCase());
					this.close();
				}));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

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
		contentEl.createEl("h1", {text: t('renameCssClass.title') as string});
		new Setting(contentEl)
			.setName(t('renameCssClass.title') as string)
			.setDesc(t('renameCssClass.desc') as string)
			.addText(text =>
				text
					.setPlaceholder(t('renameCssClass.placeholder') as string)
					.setValue(this.oldName)
					.onChange(async (value) => {
						this.result = value;
					}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText(add)
				.onClick(async () => {
					this.onSubmit(this.result.replace(/\W+/g, '-').toLowerCase());
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
		contentEl.createEl("h1", {text: (t('renameFilePath.title') as string)});
		new Setting(contentEl)
			.setName(t('renameFilePath.placeholder') as string)
			.setDesc(t('renameFilePath.desc') as string)
			.addText(text =>
				text
				.setPlaceholder(t('renameFilePath.placeholder') as string)
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

