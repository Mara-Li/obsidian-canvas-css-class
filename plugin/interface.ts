export interface CanvasCssSettings {
	canvasAdded: CanvasClass[];
	logLevel: string;
	defaultAppendMode: AppendMode;
	addButtonSetting: boolean;
	addButtonSwitchView: boolean;
}

export enum AppendMode {
	body = "body",
	workspaceLeaf = "workspace-leaf-content",
}


export const DEFAULT_SETTINGS: CanvasCssSettings = {
	canvasAdded: [],
	logLevel: "none",
	defaultAppendMode: AppendMode.workspaceLeaf,
	addButtonSetting: false,
	addButtonSwitchView: false,
};

export interface CanvasClass {
	canvasPath: string;
	canvasClass: string[];
	appendMode: string;
}
