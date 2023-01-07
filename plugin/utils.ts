/**
	 * This function allow to choose the log level of the plugin and send the message to the console with the option chosen
	 * @param {string} message the message to send to the console
 * * @param {string} level the log level of the message
	 */
import {Notice} from "obsidian";
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
 */
export function removeFromDOM(cssClass: string, logLevel: string): void {
	removeFromBody(cssClass, logLevel);
	removeFromViewContent(cssClass, logLevel);
}


/**
 * The function to remove from Dom the class added. It removes from the body.
 * @param cssClass {string} the class to remove
 * @param logLevel {string} the log level of the plugin
 */
export function removeFromBody(cssClass: string, logLevel: string): void {
	// @ts-ignore
	logging(`Class of ${document.querySelector("body").getAttribute("data-canvas-path")} : ${document.querySelector("body").classList}`, logLevel);
	// @ts-ignore
	document.querySelector("body").classList.remove(cssClass);
	logging(`Removed ${cssClass} from the body`, logLevel);
}

/**
 * The function to remove from Dom the class added. It removes from the view-content.
 * @param cssClass {string} the class to remove
 * @param logLevel {string} the log level of the plugin
 */
export function removeFromViewContent(cssClass: string, logLevel: string): void {
	// @ts-ignore
	logging(`Class of ${document.querySelector(".workspace-leaf.mod-active .view-content").getAttribute("data-canvas-path")} : ${document.querySelector(".workspace-leaf.mod-active .view-content").classList}`, logLevel);
	// @ts-ignore
	document.querySelector(".workspace-leaf.mod-active .view-content").classList.remove(cssClass);
	logging(`Removed ${cssClass} from the view-content`, logLevel);
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
 */
export function reloadCanvas(canvasPath: string, appendMode: string, settings: CanvasCssSettings): void {
	const query = whereToAppend(appendMode);
	const selectedCanvas = document.querySelector(query)?.getAttribute("data-canvas-path");
	if (selectedCanvas === canvasPath) {
		const cssClass = settings.canvasAdded.find((canvas) => canvas.canvasPath === canvasPath)?.canvasClass;
		if (cssClass) {
			if (query === "body") {
				removeCanvasPathAndCanvasFile(AppendMode.workspaceLeaf);
				for (const canvas of cssClass) {
					removeFromViewContent(canvas, settings.logLevel);
					addToDOM(canvas, canvasPath, appendMode, settings.logLevel);
				}
			} else {
				removeCanvasPathAndCanvasFile("body");
				for (const canvas of cssClass) {
					removeFromBody(canvas, settings.logLevel);
					addToDOM(canvas, canvasPath, appendMode, settings.logLevel);
				}
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
	 */
export function addToDOM(cssClass: string, filePath: string, appendMode: string, logLevel: string): void {
	const querySelector = whereToAppend(appendMode);
	if (document.querySelector(querySelector)?.getAttribute("data-canvas-path") === filePath) {
		logging(`Adding ${cssClass} to the dom`, logLevel);
		logging(`Class of ${document.querySelector(querySelector)?.getAttribute(querySelector)} : ${document.querySelector(querySelector)?.classList}`, logLevel);
		document.querySelector(querySelector)?.classList.add(cssClass);
	}
}


/**
 * Function to ADD the canvas path and canvas file from the body and the view-content
 * @param appendMode {string} the mode set for the canvas
 * @param filePath {string} the path of the canvas
 */
export function addCanvasPathAndCanvasFile(appendMode: string, filePath: string): void {
	const querySelector = whereToAppend(appendMode);
	document.querySelector(querySelector)?.setAttribute("data-canvas-path", filePath);
	document.querySelector(querySelector)?.classList.add("canvas-file");
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
