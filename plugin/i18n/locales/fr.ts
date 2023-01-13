export default {
	addCssClass: {
		title: "Ajouter une classe CSS",
		desc: "Le nom de la classe que vous souhaitez ajouter au Canvas",
	},
	addFilePath: {
		filePath: "Chemin du fichier",
		desc: "Le chemin du fichier du Canva auquel vous souhaitez ajouter une classe",
	},
	renameCssClass: {
		title: "Renommer une classe CSS",
		desc: "Le nom de la classe que vous souhaitez renommer",
		placeholder: "Nouveau nom",
	},
	renameFilePath: {
		title: "Modifier le chemin du Canvas",
		placeholder: "Nouveau chemin",
		desc: "Le nouveau chemin du Canvas que vous souhaitez modifier",
	},
	className: "Nom de la classe",
	addButton: "Ajouter",
	removeFromCanvas:(key: string[]): string  => `Suppression de ${key[0]} dans ${key[1]}`,
	settings: {
		title: "Paramètre de Canvas CSS Class",
		noClassAdded: "Aucune classe ajoutée.",
		useCommandsInfo: "Utilisez la fenêtre de commande pour ajouter un Canvas et une classe.",
		alreadyApplied: "Cette classe est déjà appliquée à ce Canvas.",
		console: {
			title: "Niveau de log",
			desc: "Permet de mieux suivre les ajouts/suppressions effectués par le plugin. Notice affichera une notification Obsidian.",
			options: {
				none: "Aucun",
				error: "Erreur",
				log: "Log",
				warn: "Avertissement",
				notice: "Notice",
			},
		},
		appendMode: {
			default: {
				title: "Le mode d'ajout par défaut",
				desc: "Le mode d'ajout par défaut de la classe au Canvas, incluant canvas-file et l'attribut data-canvas-path, lors de l'ouverture ou de la création du Canvas.",
			},
			title: "Comportement d'ajout",
			desc: "Où ajouter la classe dans le Canvas.",
			bodyDesc: "Ajoute le Canvas au body. Permet d'exporter le Canvas en tant qu'image mais peut avoir un comportement inattendu, notamment avec plusieurs fichiers ouverts.",
			workspaceLeafDesc: "Ajoute le Canvas au workspace-leaf-content. Conserve la classe lorsque le focus change mais ne peut pas être exporté avec l'image.",
			options: {
				body: "body",
				workspaceLeaf: "workspace-leaf-content",
			},
			edit: "Modifier le comportement d'ajout de la classe au Canvas.",
		},
		newCanvas: {
			addingInfo: "Utilisez la fenêtre de commande pour ajouter une classe à un nouveau fichier.",
			addNewCanvas: "Ajouter un nouveau Canvas",
		},
		newClass:{
			addingInfo: "Ajouter une classe",
		},
		edit: {
			filepath: "Modifier le chemin",
			class: "Renommer la classe",
		},
		remove: {
			desc: "Supprimer toutes les classes",
			title: "Supprimer"
		}
	},
	commands: {
		addCanvas: "Ajouter une classe CSS au Canvas actif",
		removeCanvas: "Supprimer une classe CSS du Canvas actif",
		changeAppendMode: "Modifier le comportement d'ajout de la classe au Canvas",
		switchToViewContentMode: "Passer au mode workspace-leaf-content",
		switchToBodyMode: "Passer au mode body",
		quickSwitch: "Quick switch entre body & workspace-leaf-content",
	},
	message : {
		quickSwitch:(key: string): string => `Passage au mode : ${key}`,
		switchedToBody: "Passage au mode body",
		switchedToViewContent: "Passage au mode workspace-leaf-content",
	}
};
