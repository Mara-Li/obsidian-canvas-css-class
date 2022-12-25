import {App, Modal, Setting} from "obsidian";

export class AddCssClass extends Modal {
	result: string;
	onSubmit:(result: string)=>void;
	
  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", {text: "Add CSS Class"});
		new Setting(contentEl)
			.setName("Class Name")
			.setDesc("The name of the class you want to add to the canvas")
			.addText(text => text
				.setPlaceholder("Class Name")
				.onChange(async (value) => {
					this.result = value;
				}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText("Add")
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
		contentEl.createEl("h1", {text: "Add CSS Class"});
		new Setting(contentEl)
			.setName("Filepath")
			.setDesc("The filepath of the canvas you want to add a class to")
			.addText(text => text
				.setPlaceholder("Filepath")
				.onChange(async (value) => {
					this.path = value.replace(".canvas", "") + ".canvas";
				}));
		new Setting(contentEl)
			.setName("Class Name")
			.setDesc("The name of the class you want to add to the canvas")
			.addText(text => text
				.setPlaceholder("Class Name")
				.onChange(async (value) => {
					this.cssClass = value;
				}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText("Add")
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
	onSubmit:(result: string)=>void;
	
  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", {text: "Rename CSS Class"});
		new Setting(contentEl)
			.setName("New Class Name")
			.setDesc("The new name of the class you want to add to the canvas")
			.addText(text => text
				.setPlaceholder("New name")
				.onChange(async (value) => {
					this.result = value;
				}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText("Add")
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
	onSubmit:(result: string)=>void;
	
  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", {text: "Edit Canvas Path"});
		new Setting(contentEl)
			.setName("New Path")
			.setDesc("The new path of the canvas")
			.addText(text => text
				.setPlaceholder("New Path")
				.onChange(async (value) => {
					this.result = value;
				}));
		new Setting(contentEl)
			.addButton(cb => cb
				.setButtonText("Add")
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

