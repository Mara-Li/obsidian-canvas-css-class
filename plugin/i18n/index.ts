import { moment } from "obsidian";
import en from "./locales/en";
import fr from "./locales/fr";

const localeMap : {[key: string]: Partial<typeof en>}= {
	"en" : en,
	"fr" : fr,
};

const locale = localeMap[moment.locale()] || localeMap.en;
export const translationLanguage = locale ? moment.locale() : "en";

export interface StringFunction {
	(params: string|string[]): string;
}

function nestedProp(obj: object, path: string): unknown {
	return path.split(".").reduce((o, k) => o ? (o as never)[k] : undefined, obj);
}

export function t(multipleKey:string): string | StringFunction {
	// @ts-ignore
	return (locale && nestedProp(locale, multipleKey))|| nestedProp(en, multipleKey);
}

