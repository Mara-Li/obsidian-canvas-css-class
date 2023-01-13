/**
	 * This function allow to choose the log level of the plugin and send the message to the console with the option chosen
	 * @param {string} message the message to send to the console
 * * @param {string} level the log level of the message
	 */
import {FileView, Notice, WorkspaceLeaf} from "obsidian";
import {AppendMode, CanvasCssSettings} from "./interface";

/**
 * This function allow to choose the log level of the plugin and send the message to the console with the option chosen
 *
 * @param {string} message the message to send to the console
 * @param {string} logLevel the log level of the message, taken from settings
 */
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
 * The function to remove from Dom the class added. It removes from the body and the workspace-leaf-content
 * @param cssClass {string} the class to remove
 * @param logLevel {string} the log level of the plugin
 * @param leaves {WorkspaceLeaf[]} the leaves to remove the class from, if the method used is AppendMode.workspaceLeaf
 * @param filepath {string |undefined} the path of the file to remove the class from, if the method used is AppendMode.body (used only for the log)
 */
export function removeFromDOM(cssClass: string, logLevel: string, leaves: WorkspaceLeaf[], filepath: string | undefined): void {
	removeFromBody(cssClass, logLevel, filepath);
	removeFromViewContent(cssClass, logLevel, leaves, true);
}


/**
 * The function to remove from Dom the class added. It removes from the body.
 * @param cssClass {string|null} the class to remove, null if we need to only remove the .canvas-file and the canvas-path attribute
 * @param logLevel {string} the log level of the plugin
 * @param filepath {string} The filepath, used for logging
 * @param removeData {boolean} if true, remove the canvas-path attribute and the .canvas-file class
 */
export function removeFromBody(cssClass: string | null, logLevel: string, filepath: string | undefined, removeData= false): void {
	const classIsInBody = cssClass && document.body.classList.contains(cssClass);
	if (classIsInBody) {
		logging(`Class of "${filepath}" : ${document.body.classList}`, logLevel);
		activeDocument.body.classList.remove(cssClass);
		logging(`Removed ${cssClass} from the body`, logLevel);
	}
	const bodyContainsData = document.body.classList.contains("canvas-file") && document.body.getAttribute("data-canvas-path");
	if (bodyContainsData && removeData) {
		activeDocument.body.removeAttribute("data-canvas-path");
		activeDocument.body.classList.remove("canvas-file");
	}
}

/**
 * The function to remove from Dom the class added. It removes from the workspace-leaf-content.
 * @param cssClass {string} the class to remove
 * @param logLevel {string} the log level of the plugin
 * @param leaves {WorkspaceLeaf[]} the leaves of Obsidian
 * @param removeAll {boolean} if we need to remove the data-attributes too.
 */
export function removeFromViewContent(cssClass: string | null, logLevel: string, leaves: WorkspaceLeaf[], removeAll=false): void {
	leaves.forEach((leaf) => {
		if (cssClass && cssClass.length > 0 && leaf.view.containerEl.classList.contains(cssClass)) {
			leaf.view.containerEl.classList.remove(cssClass);
			logging(`Removed ${cssClass} from the workspace-leaf-content`, logLevel);
		}
		if (removeAll && leaf.view.containerEl.classList.contains("canvas-file") && leaf.view.containerEl.getAttribute("data-canvas-path")) {
			leaf.view.containerEl.classList.remove("canvas-file");
			leaf.view.containerEl.removeAttribute("data-canvas-path");
		}
	});
}

/**
 * Function that reload the canvas to change the mode and add the class. Allow to quick change the mode between the two.
 * @param canvasPath {string} the path of the canvas
 * @param appendMode {string} the mode set for the canvas
 * @param settings {CanvasCssSettings} the settings of the plugin
 * @param leaves {WorkspaceLeaf[]} the leaves of Obsidian where the canvas is
 */
export function reloadCanvas(canvasPath: string, appendMode: string, settings: CanvasCssSettings, leaves: WorkspaceLeaf[] | WorkspaceLeaf): void {
	const workspaceLeave = Array.isArray(leaves) ? leaves : [leaves];
	let cssClass = settings.canvasAdded.find((canvas) => canvas.canvasPath === canvasPath)?.canvasClass;
	if (appendMode === AppendMode.body) {
		logging(`RELOADING canvas "${canvasPath}" in BODY MODE`, settings.logLevel);
		const selectedCanvas = document.querySelector(`body:has(.canvas-file[data-canvas-path="${canvasPath}"])`);
		const getActiveLeaf = workspaceLeave.filter((leaf) => leaf.view instanceof FileView && leaf.view.file.path === canvasPath);
		if (selectedCanvas || getActiveLeaf) {
			if (!cssClass || cssClass.length === 0) {
				addToDOM(null, canvasPath, appendMode, settings.logLevel, workspaceLeave);
				removeFromViewContent(null, settings.logLevel, workspaceLeave, true);
				cssClass = [];
			}
			for (const css of cssClass) {
				addToDOM(css, canvasPath, appendMode, settings.logLevel, getActiveLeaf);
				removeFromViewContent(css, settings.logLevel, workspaceLeave, true);
			}
		}
	} else {
		logging(`RELOADING canvas "${canvasPath}" in VIEW-CONTENT MODE`, settings.logLevel);
		if (!cssClass || cssClass.length === 0) {
			removeFromBody(null, settings.logLevel, canvasPath, true);
			addToDOM(null, canvasPath, appendMode, settings.logLevel, workspaceLeave);
		} else {
			for (const css of cssClass) {
				removeFromBody(css, settings.logLevel, canvasPath, true);
				addToDOM(css, canvasPath, appendMode, settings.logLevel, workspaceLeave);
			}
		}
	}
	
}

/**
 * This function add to the dom (workspace-leaf-content) the css class ;
 * @param {string} cssClass the css class to add
 * @param {string} filePath the path of the canvas, to add the class to the right canvas
 * @param {string} appendMode the query selector to use to add the class
 * @param {string} logLevel the log level of the message
 * @param leaves {WorkspaceLeaf[]} the leaves where the file is opened
 */
export function addToDOM(cssClass: string | null, 
	filePath: string, 
	appendMode: string, 
	logLevel: string,
	leaves: WorkspaceLeaf[]): void {
	if (appendMode === AppendMode.body) {
		if (!document.body.classList.contains("canvas-file")) {
			activeDocument.body.addClass("canvas-file");
		} if (!document.body.getAttribute("data-canvas-path") || document.body.getAttribute("data-canvas-path") !== filePath) {
			activeDocument.body.setAttribute("data-canvas-path", filePath);
			activeDocument.body.setAttribute("data-canvas-path", filePath);
		}
		if (cssClass && cssClass.length > 0 && !document.body.classList.contains(cssClass)) {
			activeDocument.body.addClass(cssClass);
			logging(`Added ${cssClass} to the body`, logLevel);
		}
	} else {
		for (const leaf of leaves) {
			if (!leaf.view.containerEl.classList.contains("canvas-file")) {
				leaf.view.containerEl.addClass("canvas-file");
			}
			if (!leaf.view.containerEl.getAttribute("data-canvas-path")) {
				leaf.view.containerEl.setAttribute("data-canvas-path", filePath);
			}
			if (cssClass && !leaf.view.containerEl.classList.contains(cssClass)) {
				leaf.view.containerEl.addClass(cssClass);
				logging(`Added ${cssClass} to the workspace-leaf-content`, logLevel);
			}
		}
	}
}

