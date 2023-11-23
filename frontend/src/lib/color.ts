import type { Color } from '../../../common/model';

export const colorOf = [
	'bg-gray-100 text-gray-700',
	'bg-blue-600 text-white',
	'bg-green-600 text-white',
	'bg-red-600 text-white',
	'bg-slate-900 text-white',
	'bg-yellow-500 text-white',
] satisfies Record<Color, string>;

export const gradientOf = [
	'from-slate-100 to-slate-300',
	'from-blue-100 to-blue-200',
	'from-green-100 to-green-200',
	'from-red-100 to-red-200',
	'from-slate-600 to-slate-700 text-white',
	'',
] satisfies Record<Color, string>;
