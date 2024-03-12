export interface CanvasCssSettings {
	canvasAdded: CanvasClass[];
	logLevel: string;
	defaultAppendMode: AppendMode;
	addButton: boolean;
}

export enum AppendMode {
	body = "body",
	workspaceLeaf = "workspace-leaf-content",
}


export const DEFAULT_SETTINGS: CanvasCssSettings = {
	canvasAdded: [],
	logLevel: "none",
	defaultAppendMode: AppendMode.workspaceLeaf,
	addButton: false
};

export interface CanvasClass {
	canvasPath: string;
	canvasClass: string[];
	appendMode: string;
}
