import type { Color } from '../../../common/model';

export const colorOf = [
	'bg-gray-200',
	'bg-blue-600 text-white',
	'bg-green-600 text-white',
	'bg-red-600 text-white',
	'bg-slate-900 text-white',
	'bg-yellow-500 text-white',
] satisfies Record<Color, string>;
