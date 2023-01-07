export default {
	addCssClass: {
		title: "Add CSS Class",
		desc: "The name of the class you want to add to the canvas",
	},
	addFilePath: {
		filePath: "Filepath",
		desc: "The filepath of the canvas you want to add a class to",
	},
	renameCssClass: {
		title: "Rename CSS Class",
		desc: "The name of the class you want to rename",
		placeholder: "New name",
	},
	renameFilePath: {
		title: "Edit canvas filepath",
		placeholder: "New Filepath",
		desc: "The new filepath of the canvas you want to rename",
	},
	className: "Class Name",
	addButton: "Add",
	removeFromCanvas:(key: string[]): string  => `Removed ${key[0]} from ${key[1]}`,
	settings: {
		title: "Canvas CSS Class Settings",
		noClassAdded: "No class added yet.",
		useCommandsInfo: "Use the commands modal to add a canvas and a class.",
		alreadyApplied: "This class is already applied to this canvas.",
		appendBehavior: {
			title: "Append Behavior",
			desc: "Where to append the class into the canvas.",
			bodyDesc: "Append the canvas to the body. Allow to export as an image with the canvas but can have some unexpected behavior, notably when multiple files are open.",
			workspaceLeafDesc: "Append the canvas to the view-content. Keep the class when focus change but can't be exported with the image.",
			options: {
				body: "body",
				workspaceLeaf: "view-content",
			},
			edit: "Edit the behavior for appending class to the canvas.",
		},
		console: {
			title: "Log Level",
			desc: "Allows to better follow the additions/removals made by the plugin. Notice will display an Obsidian notification.",
			options: {
				none: "None",
				error: "Error",
				log: "Log",
				warn: "Warn",
				notice: "Notice",
			},
		},
		newCanvas: {
			addingInfo: "Use the commands modal to add a class to a new file.",
			addNewCanvas: "Add new Canvas",
		},
		newClass:{
			addingInfo: "Add a class to this canvas",
		},
		edit: {
			filepath: "Edit filepath",
			class: "Rename class",
		},
		remove: {
			desc: "Remove all classes from this canvas",
			title: "Remove"
		}
	},
	commands: {
		addCanvas: "Add a CSS Class to the active canvas",
		removeCanvas: "Remove a CSS Class from the active canvas",
		changeAppendBehavior: "Change the append behavior between body & workspace",
	},
	
};
