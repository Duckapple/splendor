export function moveTo(target: HTMLElement, transform: HTMLElement | Record<'x' | 'y', number>) {
	requestAnimationFrame(() => {
		const { left, top } = target.getBoundingClientRect();
		const { x, y } =
			transform instanceof HTMLElement ? transform.getBoundingClientRect() : transform;

		const scale = target.dataset.coinColor ? 1 : 2;

		target.setAttribute(
			'style',
			`transform: rotate(0) translate(${x - left - target.clientWidth / 2}px, ${
				y - top - target.clientHeight / 2
			}px) scale(${scale}); z-index: 30; opacity: 0%`
		);
	});
}
