import type { Color } from '../../../common/model';
import type { iconSvgs } from './base/icons';

export const bgColorOf = [
	'bg-slate-100 text-slate-700',
	'bg-blue-700 text-white',
	'bg-green-700 text-white',
	'bg-rose-700 text-white',
	'bg-slate-900 text-white',
	'bg-yellow-500 text-white',
] satisfies Record<Color, string>;

export const fadeTextBgColorOf = [
	'bg-slate-100 text-slate-300',
	'bg-blue-700 text-blue-500',
	'bg-green-700 text-green-500',
	'bg-rose-700 text-rose-500',
	'bg-slate-900 text-slate-500',
	'bg-yellow-500 text-yellow-400',
] satisfies Record<Color, string>;

export const textColorOf = [
	'text-slate-500',
	'text-sky-600',
	'text-green-600',
	'text-rose-600',
	'text-black',
	'text-yellow-500',
] satisfies Record<Color, string>;

export const gradientOf = [
	'from-slate-200 to-slate-300',
	'from-sky-200 to-sky-300',
	'from-green-200 to-green-300',
	'from-rose-200 to-rose-300',
	'from-slate-700 to-slate-800 text-white',
	'',
] satisfies Record<Color, string>;

export const ringColorOf = [
	'ring-slate-300 outline-slate-300',
	'ring-blue-400 outline-blue-400',
	'ring-green-400 outline-green-400',
	'ring-rose-400 outline-rose-400',
	'ring-slate-600 outline-slate-600',
	'ring-yellow-200 outline-yellow-200',
] satisfies Record<Color, string>;

export const iconOf = [
	'gem-diamond',
	'gem-rhombus',
	'gem-hexagon',
	'gem-heart',
	'gem-triangle',
	'trophy',
] satisfies (keyof typeof iconSvgs)[];
