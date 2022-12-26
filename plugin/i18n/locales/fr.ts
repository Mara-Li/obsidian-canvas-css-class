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
		title: 'Modifier le chemin du Canvas',
		placeholder: "Nouveau chemin",
		desc: "Le nouveau chemin du Canvas que vous souhaitez modifier",
	},
	className: "Nom de la classe",
	addButton: "Ajouter",
	removeFromCanvas:(key: string[]): string  => `Suppression de ${key[0]} dans ${key[1]}`,
	settings: {
		title: 'Paramètre de Canvas CSS Class',
		noClassAdded: 'Aucune classe ajoutée.',
		useCommandsInfo: "Utilisez la fenêtre de commande pour ajouter un Canvas et une classe.",
		alreadyApplied: "Cette classe est déjà appliquée à ce Canvas.",

		newCanvas: {
			addingInfo: "Utilisez la fenêtre de commande pour ajouter une classe à un nouveau fichier.",
			addNewCanvas: "Ajouter un nouveau Canvas",
		},
		newClass:{
			addingInfo: "Ajouter une classe à ce Canvas",
		},
		edit: {
			filepath: "Modifier le chemin",
			class: 'Renommer la classe',
		},
		remove: {
			desc: 'Supprimer toutes les classes de ce Canvas',
			title: 'Supprimer'
		}
	},
	commands: {
		addCanvas: 'Ajouter une classe CSS à ce Canvas',
		removeCanvas: 'Supprimer une classe CSS de ce Canvas',
	},
	
}
