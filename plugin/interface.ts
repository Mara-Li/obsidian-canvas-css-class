export interface CanvasCssSettings {
	canvasAdded: CanvasClass[];
	logLevel: string;
	defaultAppendMode: AppendMode;
}

export enum AppendMode {
	body = "body",
	workspaceLeaf = "workspace-leaf-content",
}


export const DEFAULT_SETTINGS: CanvasCssSettings = {
	canvasAdded: [],
	logLevel: "none",
	defaultAppendMode: AppendMode.workspaceLeaf,
};

export interface CanvasClass {
	canvasPath: string;
	canvasClass: string[];
	appendMode: string;
}
