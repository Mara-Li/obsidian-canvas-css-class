export interface CanvasCssSettings {
	canvasAdded: CanvasClass[];
	logLevel: string;
}

export enum AppendMode {
	body = "body",
	workspaceLeaf = "view-content",
}


export const DEFAULT_SETTINGS: CanvasCssSettings = {
	canvasAdded: [],
	logLevel: "none",
};

export interface CanvasClass {
	canvasPath: string;
	canvasClass: string[];
	appendMode: string;
}
