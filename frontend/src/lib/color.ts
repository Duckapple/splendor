import type { Color } from '../../../common/model';

export const bgColorOf = [
	'bg-gray-100 text-gray-700',
	'bg-blue-700 text-white',
	'bg-green-700 text-white',
	'bg-red-700 text-white',
	'bg-slate-900 text-white',
	'bg-yellow-500 text-white',
] satisfies Record<Color, string>;

export const textColorOf = [
	'text-slate-500',
	'text-sky-600',
	'text-green-600',
	'text-red-600',
	'text-black',
	'text-yellow-500',
] satisfies Record<Color, string>;

export const gradientOf = [
	'from-slate-100 to-slate-300',
	'from-sky-100 to-sky-300',
	'from-green-100 to-green-300',
	'from-red-100 to-red-300',
	'from-slate-600 to-slate-800 text-white',
	'',
] satisfies Record<Color, string>;
