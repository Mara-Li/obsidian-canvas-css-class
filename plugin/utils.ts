/**
	 * This function allow to choose the log level of the plugin and send the message to the console with the option chosen
	 * @param {string} message the message to send to the console
 * * @param {string} level the log level of the message
	 */
import {Notice} from "obsidian";
import {AppendBehavior, CanvasCssSettings} from "./interface";

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
 * Function to get the query selector of the canvas based on the behavior settings
 * @param appendBehavior {string} the behavior set for the canvas
 */
export function whereToAppend(appendBehavior: string): string {
	if (appendBehavior === AppendBehavior.body) {
		return "body";
	} else {
		return ".workspace-leaf.mod-active .view-content";
	}
}

/**
 * Function that reload the canvas to change the bahavior and add the class. Allow to quick change the behavior between the two. 
 * @param canvasPath {string} the path of the canvas
 * @param appendBehavior {string} the behavior set for the canvas
 * @param settings {CanvasCssSettings} the settings of the plugin
 */
export function reloadCanvas(canvasPath: string, appendBehavior: string, settings: CanvasCssSettings): void {
	const query = whereToAppend(appendBehavior);
	const selectedCanvas = document.querySelector(query)?.getAttribute("data-canvas-path");
	if (selectedCanvas === canvasPath) {
		const cssClass = settings.canvasAdded.find((canvas) => canvas.canvasPath === canvasPath)?.canvasClass;
		if (cssClass) {
			if (query === "body") {
				removeCanvasPathAndCanvasFile(AppendBehavior.workspaceLeaf);
				for (const canvas of cssClass) {
					removeFromViewContent(canvas, settings.logLevel);
					addToDOM(canvas, canvasPath, appendBehavior, settings.logLevel);
				}
			} else {
				removeCanvasPathAndCanvasFile("body");
				for (const canvas of cssClass) {
					removeFromBody(canvas, settings.logLevel);
					addToDOM(canvas, canvasPath, appendBehavior, settings.logLevel);
				}
			}
		}
	}
}

/**
	 * This function add to the dom (view-content) the css class ;
	 * @param {string} cssClass the css class to add
	 * @param {string} filePath the path of the canvas, to add the class to the right canvas
    * @param {string} appendBehavior the query selector to use to add the class
 * @param {string} logLevel the log level of the message
	 */
export function addToDOM(cssClass: string, filePath: string, appendBehavior: string, logLevel: string): void {
	const querySelector = whereToAppend(appendBehavior);
	if (document.querySelector(querySelector)?.getAttribute("data-canvas-path") === filePath) {
		logging(`Adding ${cssClass} to the dom`, logLevel);
		logging(`Class of ${document.querySelector(querySelector)?.getAttribute(querySelector)} : ${document.querySelector(querySelector)?.classList}`, logLevel);
		document.querySelector(querySelector)?.classList.add(cssClass);
	}
}


/**
 * Function to ADD the canvas path and canvas file from the body and the view-content
 * @param appendBehavior {string} the behavior set for the canvas
 * @param filePath {string} the path of the canvas
 */
export function addCanvasPathAndCanvasFile(appendBehavior: string, filePath: string): void {
	const querySelector = whereToAppend(appendBehavior);
	document.querySelector(querySelector)?.setAttribute("data-canvas-path", filePath);
	document.querySelector(querySelector)?.classList.add("canvas-file");
}

/**
 * Function to REMOVE the canvas path and canvas file from the body and the view-content
 * @param appendBehavior {string} the behavior set for the canvas
 */
export function removeCanvasPathAndCanvasFile(appendBehavior: string): void {
	const querySelector = whereToAppend(appendBehavior);
	document.querySelector(querySelector)?.removeAttribute("data-canvas-path");
	document.querySelector(querySelector)?.classList.remove("canvas-file");
}
