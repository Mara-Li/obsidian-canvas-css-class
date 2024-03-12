import { App, Modal, Setting } from "obsidian";
import { t } from "plugin/i18n";
import CanvasCSS from "plugin/main";
import { reloadCanvas } from "plugin/utils";

import { AppendMode, CanvasClass } from "../interface";

export class ListClasses extends Modal {
	canvas: CanvasClass;
	onSubmit: (canvas: CanvasClass) => void;
	plugin: CanvasCSS;

	constructor(app: App, canvas: CanvasClass, plugin: CanvasCSS, onSubmit: (canvas: CanvasClass) => void) {
		super(app);
		this.canvas = canvas;
		this.onSubmit = onSubmit;
		this.plugin = plugin;
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		this.modalEl.addClass("canvas-css-modal");

		new Setting(contentEl)
			.setName(this.canvas.canvasPath.replace(".canvas", ""))
			.setHeading()
			.addButton(cb => cb
				.setCta()
				.setButtonText(t("addCssClass.title") as string)
				.setTooltip(t("settings.newClass.addingInfo") as string)
				.onClick(async () => {
					this.canvas.canvasClass.push("");
					this.onOpen();
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
			.addDropdown((dropdown) => {
				dropdown
					.addOption("body", t("settings.appendMode.options.body") as string)
					.addOption("workspace-leaf", t("settings.appendMode.options.workspaceLeaf") as string)
					.setValue(AppendMode.body)
					.onChange(async (value) => {
						this.canvas.appendMode = value as AppendMode;
						const openedLeaves = this.plugin.getLeafByPath(this.canvas.canvasPath);
						reloadCanvas(this.canvas.canvasPath, this.canvas.appendMode, this.plugin.settings, openedLeaves);
					});
			});

		for (const index in this.canvas.canvasClass) {
			new Setting(contentEl)
				.setClass("no-info")
				.addText(text => {
					text
						.setValue(this.canvas.canvasClass[index])
						.onChange(async (value) => {
							this.canvas.canvasClass[index] = value;
						});
					text.inputEl.setAttribute("value", index);
				})
				.addExtraButton(cb => cb
					.setIcon("trash")
					.setTooltip(t("settings.remove.title") as string)
					.onClick(async () => {
						const indexValue = this.canvas.canvasClass.indexOf(index);
						//remove from list
						this.canvas.canvasClass.splice(indexValue, 1);
						this.onOpen();
					}));

		}

		new Setting(contentEl)
			.setClass("no-info")
			.addButton(cb => cb
				.setButtonText(t("settings.save") as string)
				.setCta()
				.onClick(async () => {
					//verify empty values
					//remove all errors inputs and tooltips
					const inputsErrors = contentEl.querySelectorAll(".error");
					for (const error in inputsErrors) {
						if (inputsErrors[error] instanceof HTMLElement) {
							inputsErrors[error].classList.remove("error");
						}
					}
					const tooltips = contentEl.querySelectorAll(".tooltip");
					for (const tooltip in tooltips) {
						if (tooltips[tooltip] instanceof HTMLElement) {
							tooltips[tooltip].remove();
						}
					}
					const errors = this.canvas.canvasClass.filter((value) => value === "");
					const duplicate = this.canvas.canvasClass.filter((value, index) => this.canvas.canvasClass.indexOf(value) !== index);
					if (errors.length > 0 || duplicate.length > 0){
						for (const cssError of errors) {
							this.addToolTipError(cssError, "empty");
						}
						for (const cssError of duplicate) {
							this.addToolTipError(cssError, "duplicate");
						}
					}
					else {
						this.onSubmit(this.canvas);
						this.close();
					}	
				}))
			.addButton(cb => cb
				.setButtonText(t("settings.cancel") as string)
				.setWarning()
				.onClick(async () => {
					this.close();
				}));


	}

	addToolTipError(cssError: string, type: "duplicate" | "empty") {
		let msg = "";
		if (type === "duplicate")
			msg = t("error.alreadyApplied") as string;
		else if (type === "empty")
			msg = t("error.emptyValue") as string;
		const index = this.canvas.canvasClass.indexOf(cssError);
		const input = this.contentEl.querySelector(`input[value="${index}"]`);
		if (!input){
			return;
		}
		input.classList.add("error");
		const tooltip = input.parentElement?.createEl("div", {text: msg, cls: "tooltip"});
		if (!tooltip) {
			return;
		}
		const rec = input.getBoundingClientRect();
		tooltip.style.top = `${rec.top + rec.height + 5}px`;
		tooltip.style.left = `${rec.left + rec.width / 2}px`;
		tooltip.style.backgroundColor = "var(--text-error)";
	}

}