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
 * * This function remove the css class from the dom (view-content) ; the workspace-leaf must be active
 * * @param {string} cssClass the css class to remove
 * @param {string} logLevel the log level of the message
 */
export function removeFromDOM(cssClass: string, logLevel: string): void {
	removeFromBody(cssClass, logLevel);
	removeFromViewContent(cssClass, logLevel);
}

export function removeFromBody(cssClass: string, logLevel: string): void {
	// @ts-ignore
	logging(`Class of ${document.querySelector("body").getAttribute("data-canvas-path")} : ${document.querySelector("body").classList}`, logLevel);
	// @ts-ignore
	document.querySelector("body").classList.remove(cssClass);
	logging(`Removed ${cssClass} from the body`, logLevel);
}

export function removeFromViewContent(cssClass: string, logLevel: string): void {
	// @ts-ignore
	logging(`Class of ${document.querySelector(".workspace-leaf.mod-active .view-content").getAttribute("data-canvas-path")} : ${document.querySelector(".workspace-leaf.mod-active .view-content").classList}`, logLevel);
	// @ts-ignore
	document.querySelector(".workspace-leaf.mod-active .view-content").classList.remove(cssClass);
	logging(`Removed ${cssClass} from the view-content`, logLevel);
}

export function switchRemoveFromDOM(cssClass: string, logLevel: string, query: string): void {
	if (query === "body") {
		removeFromBody(cssClass, logLevel);
	} else {
		removeFromViewContent(cssClass, logLevel);
	}
}

export function whereToAppend(appendBehavior: string): string {
	if (appendBehavior === AppendBehavior.body) {
		return "body";
	} else {
		return ".workspace-leaf.mod-active .view-content";
	}
}

export function reloadCanvas(canvasPath: string, appendBehavior: string, settings: CanvasCssSettings): void {
	const query = whereToAppend(appendBehavior);
	const selectedCanvas = document.querySelector(query)?.getAttribute("data-canvas-path");
	if (selectedCanvas === canvasPath) {
		const cssClass = settings.canvasAdded.find((canvas) => canvas.canvasPath === canvasPath)?.canvasClass;
		if (cssClass) {
			if (query === "body") {
				document.querySelector(".workspace-leaf.mod-active .view-content")?.removeAttribute("data-canvas-path");
				document.querySelector(".workspace-leaf.mod-active .view-content")?.classList.remove("canvas-file");
				for (const canvas of cssClass) {
					removeFromViewContent(canvas, settings.logLevel);
					addToDOM(canvas, canvasPath, appendBehavior, settings.logLevel);
				}
			} else {
				document.querySelector("body")?.removeAttribute("data-canvas-path");
				document.querySelector("body")?.classList.remove("canvas-file");
				for (const canvas of cssClass) {
					removeFromViewContent(canvas, settings.logLevel);
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
