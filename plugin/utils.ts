/**
	 * This function allow to choose the log level of the plugin and send the message to the console with the option chosen
	 * @param {string} message the message to send to the console
 * * @param {string} level the log level of the message
	 */
import {Notice} from "obsidian";

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
	// @ts-ignore
	logging(`Class of ${document.querySelector(".workspace-leaf.mod-active .view-content").getAttribute("data-canvas-path")} : ${document.querySelector(".workspace-leaf.mod-active .view-content").classList}`, logLevel);
	// @ts-ignore
	document.querySelector(".workspace-leaf.mod-active .view-content").classList.remove(cssClass);
	logging(`Removed ${cssClass} from the dom`, logLevel);
	// @ts-ignore
}

