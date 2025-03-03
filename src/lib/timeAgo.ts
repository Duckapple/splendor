export function timeAgo(date: Date | string) {
	if (typeof date === 'string') date = new Date(date);
	let span = Date.now() - date.getTime();
	if ((span = Math.round(span / 1000)) < 60) return +span + ' second' + plural(span) + ' ago';
	if ((span = Math.round(span / 60)) < 60) return +span + ' minute' + plural(span) + ' ago';
	if ((span = Math.round(span / 60)) < 24) return +span + ' hour' + plural(span) + ' ago';
	if ((span = Math.round(span / 24)) < 7) return +span + ' day' + plural(span) + ' ago';
	if ((span = Math.round(span / 7)) > 0) return +span + ' week' + plural(span) + ' ago';
}

function plural(count: number) {
	if (count === 1) return '';
	return 's';
}
