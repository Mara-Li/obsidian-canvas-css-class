export interface CanvasCssSettings {
	canvasAdded: CanvasClass[];
}

export const DEFAULT_SETTINGS: CanvasCssSettings = {
	canvasAdded: []
}

export interface CanvasClass {
	canvasPath: string;
	canvasClass: string[];
}
