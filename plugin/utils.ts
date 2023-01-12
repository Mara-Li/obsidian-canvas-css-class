/**
	 * This function allow to choose the log level of the plugin and send the message to the console with the option chosen
	 * @param {string} message the message to send to the console
 * * @param {string} level the log level of the message
	 */
import {FileView, Notice, WorkspaceLeaf} from "obsidian";
import {AppendMode, CanvasCssSettings} from "./interface";

export function logging(message: string, logLevel: string): void {
	switch (logLevel) {
	case "warn":
		console.warn(message);
		break;
	case "error":
		console.error(message);
		break;
	case "log":
		console.log(message);
		break;
	case "notice":
		new Notice(message);
		break;
	default:
		break;
	}
}

/**
 * The function to remove from Dom the class added. It removes from the body and the view-content
 * @param cssClass {string} the class to remove
 * @param logLevel {string} the log level of the plugin
 * @param leaves {WorkspaceLeaf[]} the leaves to remove the class from, if the method used is AppendMode.workspaceLeaf
 * @param filepath {string} the path of the file to remove the class from, if the method used is AppendMode.body (used only for the log)
 */
export function removeFromDOM(cssClass: string, logLevel: string, leaves: WorkspaceLeaf[], filepath: string | undefined): void {
	removeFromBody(cssClass, logLevel, filepath);
	removeFromViewContent(cssClass, logLevel, leaves, true);
}


/**
 * The function to remove from Dom the class added. It removes from the body.
 * @param cssClass {string} the class to remove
 * @param logLevel {string} the log level of the plugin
 * @param filepath
 */
export function removeFromBody(cssClass: string, logLevel: string, filepath: string | undefined): void {
	const classIsInBody = document.body.classList.contains(cssClass);
	if (classIsInBody) {
		logging(`Class of ${filepath} : ${document.querySelector("body")?.classList}`, logLevel);
		document.querySelector("body")?.classList.remove(cssClass);
		logging(`Removed ${cssClass} from the body`, logLevel);
	}
	const bodyContainsData = document.body.classList.contains("canvas-file") && document.body.getAttribute("data-canvas-path");
	if (bodyContainsData) {
		document.querySelector("body")?.removeAttribute("data-canvas-path");
		document.querySelector("body")?.classList.remove("canvas-file");
	}
}

/**
 * The function to remove from Dom the class added. It removes from the view-content.
 * @param cssClass {string} the class to remove
 * @param logLevel {string} the log level of the plugin
 * @param leaves {WorkspaceLeaf[]} the leaves of Obsidian
 * @param removeAll {boolean} if we need to remove the data-attributes too.
 */
export function removeFromViewContent(cssClass: string, logLevel: string, leaves: WorkspaceLeaf[], removeAll=false): void {
	leaves.forEach((leaf) => {
		if (leaf.view.containerEl.classList.contains(cssClass)) {
			leaf.view.containerEl.classList.remove(cssClass);
			logging(`Removed ${cssClass} from the view-content`, logLevel);
		}
		if (removeAll && leaf.view.containerEl.classList.contains("canvas-file") && leaf.view.containerEl.getAttribute("data-canvas-path")) {
			leaf.view.containerEl.classList.remove("canvas-file");
			leaf.view.containerEl.removeAttribute("data-canvas-path");
		}
	});
}


/**
 * Function to get the query selector of the canvas based on the mode settings
 * @param appendMode {string} the mode set for the canvas
 */
export function whereToAppend(appendMode: string): string {
	if (appendMode === AppendMode.body) {
		return "body";
	} else {
		return ".workspace-leaf.mod-active .view-content";
	}
}

/**
 * Function that reload the canvas to change the mode and add the class. Allow to quick change the mode between the two.
 * @param canvasPath {string} the path of the canvas
 * @param appendMode {string} the mode set for the canvas
 * @param settings {CanvasCssSettings} the settings of the plugin
 * @param leaves
 */
export function reloadCanvas(canvasPath: string, appendMode: string, settings: CanvasCssSettings, leaves: WorkspaceLeaf[]): void {
	const cssClass = settings.canvasAdded.find((canvas) => canvas.canvasPath === canvasPath)?.canvasClass;
	if (cssClass) {
		if (appendMode === AppendMode.body) {
			logging(`RELOADING CANVAS ${canvasPath} WITH CLASS ${cssClass} IN BODY`, settings.logLevel);
			const selectedCanvas = document.querySelector(`body:has(.canvas-file[data-canvas-path="${canvasPath}"])`);
			const getActiveLeaf = leaves.find((leaf) => leaf.view instanceof FileView && leaf.view.file.path === canvasPath);
			
			if (selectedCanvas || getActiveLeaf) {
				for (const css of cssClass) {
					addToDOM(css, canvasPath, appendMode, settings.logLevel, leaves);
					removeFromViewContent(css, settings.logLevel, leaves);
				}
			}
		} else {
			for (const css of cssClass) {
				logging(`RELOADING CANVAS ${canvasPath} WITH CLASS ${css} IN VIEW-CONTENT`, settings.logLevel);
				removeFromBody(css, settings.logLevel, canvasPath);
				addToDOM(css, canvasPath, appendMode, settings.logLevel, leaves);
			}
		}
	}
}

/**
 * This function add to the dom (view-content) the css class ;
 * @param {string} cssClass the css class to add
 * @param {string} filePath the path of the canvas, to add the class to the right canvas
 * @param {string} appendMode the query selector to use to add the class
 * @param {string} logLevel the log level of the message
 * @param leaves
 */
export function addToDOM(cssClass: string, filePath: string, appendMode: string, logLevel: string, leaves: WorkspaceLeaf[]): void {
	if (appendMode === AppendMode.body) {
		if (!document.body.classList.contains("canvas-file") && !document.body.getAttribute("data-canvas-path")) {
			document.body.classList.add("canvas-file");
			document.body.setAttribute("data-canvas-path", filePath);
		}
		if (!document.body.classList.contains(cssClass)) {
			document.body.classList.add(cssClass);
			logging(`Added ${cssClass} to the body`, logLevel);
		}
	} else {
		for (const leaf of leaves) {
			if (!leaf.view.containerEl.classList.contains("canvas-file") && !leaf.view.containerEl.getAttribute("data-canvas-path")) {
				leaf.view.containerEl.addClass("canvas-file");
				leaf.view.containerEl.setAttribute("data-canvas-path", filePath);
			}
			if (!leaf.view.containerEl.classList.contains(cssClass)) {
				leaf.view.containerEl.addClass(cssClass);
				logging(`Added ${cssClass} to the view-content`, logLevel);
			}
		}
	}
}

/**
 * Function to REMOVE the canvas path and canvas file from the body and the view-content
 * @param appendMode {string} the mode set for the canvas
 */
export function removeCanvasPathAndCanvasFile(appendMode: string): void {
	const querySelector = whereToAppend(appendMode);
	document.querySelector(querySelector)?.removeAttribute("data-canvas-path");
	document.querySelector(querySelector)?.classList.remove("canvas-file");
}
