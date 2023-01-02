export interface CanvasCssSettings {
	canvasAdded: CanvasClass[];
	logLevel: string;
}

export const DEFAULT_SETTINGS: CanvasCssSettings = {
	canvasAdded: [],
	logLevel: "none"
};

export interface CanvasClass {
	canvasPath: string;
	canvasClass: string[];
}
