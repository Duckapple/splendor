export function moveTo(target: HTMLElement, transform: HTMLElement | Record<'x' | 'y', number>) {
	requestAnimationFrame(() => {
		const { left, top } = target.getBoundingClientRect();
		const { x, y } =
			transform instanceof HTMLElement ? transform.getBoundingClientRect() : transform;

		const scale = target.dataset.coinColor ? 1 : 2;
		const opacity = target.dataset.coinColor ? 0.5 : 1;
		const zIndex = target.dataset.coinColor ? '' : 'z-index: 30;';

		target.setAttribute(
			'style',
			`transform: rotate(0) translate(${x - left - target.clientWidth / 2}px, ${
				y - top - target.clientHeight / 2
			}px) scale(${scale}); ${zIndex} opacity: ${opacity}`
		);

		if (target.dataset.coinColor) {
			target.classList.add('z-30');
			setTimeout(() => {
				target.classList.remove('z-30');
			}, 200);
		}
	});
}
