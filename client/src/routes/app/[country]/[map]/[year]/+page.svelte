<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ConfirmModal from '$lib/components/modals/common/ConfirmModal.svelte';
	import NavBar from '$lib/components/navbar/NavBar.svelte';
	import SideBar from '$lib/components/sidebar/SideBar.svelte';
	import CandidateBox from '$lib/components/candidatebox/CandidateBox.svelte';
	import type Candidate from '$lib/types/Candidate';
	import EditCandidateModal from '$lib/components/modals/editcandidatemodal/EditCandidateModal.svelte';
	import ChartBar from '$lib/components/chartbar/ChartBar.svelte';
	import panzoom, { type PanZoom } from 'panzoom';
	import { calculateLumaHEX } from '$lib/utils/luma';
	import EditStateModal from '$lib/components/modals/editstatemodal/EditStateModal.svelte';
	import type { Mode } from '$lib/types/Mode';
	import type State from '$lib/types/State';

	const imports = {
		usa: () => import('$lib/assets/usa.svg?raw'),
		nz: () => import('$lib/assets/nz.svg?raw')
	};

	let mode: Mode = 'fill';

	let currentMap = 'usa' as keyof typeof imports;
	let mapBind: HTMLDivElement;
	let panZoom: PanZoom;

	let selectedCandidateId = 0;

	let candidates: Candidate[] = [
		{ id: -1, name: 'Tossup', margins: [{ color: '#cccccc', count: 0 }] },
		{ id: 0, name: 'Joe Biden', margins: [{ color: '#0000ff', count: 0 }] },
		{ id: 1, name: 'Donald Trump', margins: [{ color: '#ff0000', count: 0 }] }
	];

	let sidebar = {
		open: true
	};

	let chartbar = {
		open: true,
		position: 'left' as 'left' | 'bottom'
	};

	let confirmModal = {
		open: false,
		title: '',
		message: '',
		onConfirm: () => {}
	};

	let editCandidateModal = {
		open: false,
		candidate: {} as Candidate,
		onConfirm: () => {}
	};

	let editStateModal = {
		open: false,
		state: {
			shortName: '',
			longName: '',
			value: 0
		},
		onConfirm: (values: { newValue: number }) => {}
	};

	function toggleMap() {
		currentMap = currentMap === 'usa' ? 'nz' : 'usa';
	}

	function setSelectedCandidate(candidate: Candidate) {
		selectedCandidateId = candidate.id;
	}

	function toggleSideBar() {
		sidebar = {
			open: !sidebar.open
		};
	}

	function toggleChartPosition() {
		chartbar = {
			open: chartbar.open,
			position: chartbar.position === 'left' ? 'bottom' : 'left'
		};
	}

	function openGoHomeModal() {
		confirmModal = {
			open: true,
			title: 'Return Home?',
			message: 'You will lose all your current progress.',
			onConfirm: () => {
				goto('/');
			}
		};
	}

	function openClearMapModal() {
		confirmModal = {
			open: true,
			title: 'Confirm Clear',
			message: 'You will lose all your current progress.',
			onConfirm: () => {
				closeConfirm();
			}
		};
	}

	function openMapSelectionModal() {
		confirmModal = {
			open: true,
			title: 'Confirm Maps',
			message: 'Are you sure you want to go to the maps page?',
			onConfirm: () => {
				closeConfirm();
			}
		};
	}

	function closeConfirm() {
		confirmModal = {
			...confirmModal,
			open: false
		};
	}

	function openEditCandidateModal(candidate: Candidate) {
		editCandidateModal = {
			open: true,
			candidate,
			onConfirm: () => {
				closeEditCandidateModal();
			}
		};
	}

	function closeEditCandidateModal() {
		editCandidateModal = {
			...editCandidateModal,
			open: false
		};
	}

	function openEditStateModal(state: State) {
		editStateModal = {
			open: true,
			state: state,
			onConfirm: (newValues) => {
				editRegion(state.shortName, newValues);
				closeEditStateModal();
			}
		};
	}

	function closeEditStateModal() {
		editStateModal = {
			...editStateModal,
			open: false
		};
	}

	function fillRegion(region: HTMLElement) {
		const newCandidates = candidates;
		const selectedCandidate = newCandidates.find((c) => c.id === selectedCandidateId);
		if (selectedCandidate === undefined) {
			return;
		}
		const currentCandidateID = region.getAttribute('candidate') || '-2';
		const currentCandidate = newCandidates.find((c) => c.id === parseInt(currentCandidateID));
		if (currentCandidate === undefined) {
			return;
		}

		const value = parseInt(region.getAttribute('value') || '0');
		currentCandidate.margins[0].count -= value;
		selectedCandidate.margins[0].count += value;
		candidates = newCandidates;

		const regionName = region.getAttribute('short-name');

		if (regionName) {
			const text = mapBind.querySelector(`.region-texts [for="${regionName}"]`)
			if (text) {
				const luma = calculateLumaHEX(selectedCandidate.margins[0].color);
				(text as HTMLElement).style.color = luma > 0.5 ? '#000000' : '#ffffff';
			}

			const button = mapBind.querySelector(`.region-buttons [for="${regionName}"]`);
			if (button) {
				(button as HTMLElement).style.fill = selectedCandidate.margins[0].color;
			}
		}

		region.style.fill = selectedCandidate.margins[0].color;
		region.setAttribute('candidate', selectedCandidate.id.toString());
	}

	function editRegion(shortName: string, newValues: { newValue: number }) {
		const path = mapBind?.querySelector(`[short-name="${shortName}"]`);
		if (path) {
			/* Update value */
			const currentValue = parseInt(path.getAttribute('value') || '0');
			path.setAttribute('value', newValues.newValue.toString());

			/* Update candidate margins */
			const newCandidates = candidates;
			const currentCandidateID = parseInt(path.getAttribute('candidate') || '-2', 10);
			const currentCandidate = newCandidates.find((c) => c.id === currentCandidateID);
			if (currentCandidate) {
				currentCandidate.margins[0].count -= currentValue;
				currentCandidate.margins[0].count += newValues.newValue;
				candidates = newCandidates;
			}

			/* Update text */
			const text = mapBind.querySelector(`.region-texts [for="${shortName}"] .bottom`);
			if (text) {
				text.innerHTML = newValues.newValue.toString();
			}
		}
	}

	$: {
		const regions = mapBind?.querySelector('.regions');
		regions?.childNodes.forEach((node) => {
			const domNode = node as HTMLElement;
			domNode.onclick = () => {
				if (mode === 'fill') {
					fillRegion(domNode);
				} else if (mode === 'edit') {
					const shortName = domNode.getAttribute('short-name');
					const longName = domNode.getAttribute('short-name');
					const value = domNode.getAttribute('value');
					openEditStateModal({
						shortName: shortName || '',
						longName: longName || '',
						value: value ? parseInt(value, 10) : 0
					});
				}
			};
		});

		const buttons = mapBind?.querySelector('.region-buttons');
		buttons?.childNodes.forEach((child) => {
			const buttonHTML = child as HTMLElement;
			buttonHTML.onclick = () => {
				if (mode === 'fill') {
					const forRegion = buttonHTML.getAttribute('for');
					const region = mapBind.querySelector('[short-name="' + forRegion + '"]');
						console.log('test');
					if (region) {
						fillRegion(region as HTMLElement);
					}
				}
			};
		});
	}

	function applyPanZoom(mapBind: HTMLDivElement) {
		const svg = mapBind?.querySelector('#testing-map') as HTMLElement;
		if (svg) {
			panZoom = panzoom(svg, {
				minZoom: 0.5,
				maxZoom: 2,
				smoothScroll: false,
				autocenter: true,
				zoomDoubleClickSpeed: 1
			});
		}
	}

	function initializeMap(mapBind: HTMLDivElement) {
		const candidatesCopy = candidates;
		const candidate = candidatesCopy.find((c) => c.id === -1);

		const texts = mapBind?.querySelector('.region-texts');
		const buttons = mapBind?.querySelector('.region-buttons');
		const regions = mapBind?.querySelector('.regions');
		buttons?.childNodes.forEach((child) => {
			const childHTML = child as HTMLElement;
			if (childHTML) {
				if (childHTML.style) {
					if (candidate) {
						childHTML.style.fill = candidate.margins[0].color;
						childHTML.setAttribute('stroke', 'black');
					}
				}
			}
		});
		regions?.childNodes.forEach((child) => {
			const childHTML = child as HTMLElement;
			if (childHTML.setAttribute) {
				childHTML.style.transition = 'all 0.15s linear';
				childHTML.setAttribute('stroke', 'black');
				childHTML.setAttribute('candidate', '-1');
				if (candidate) {
					// childHTML.setAttribute('fill', candidate.margins[0].color);
					childHTML.style.fill = candidate.margins[0].color;
					const value = parseInt(childHTML.getAttribute('value') || '0');
					candidate.margins[0].count += value;
				}

				if (texts) {
					(texts as HTMLElement).style.pointerEvents = 'none';
					const shortName = childHTML.getAttribute('short-name');
					const b = texts.querySelector(`[for="${shortName}"] .bottom`);
					if (b) {
						b.textContent = childHTML.getAttribute('value');
					}
				}
			}
		});
		candidates = candidatesCopy;
	}

	$: {
		applyPanZoom(mapBind);
		initializeMap(mapBind);
	}
</script>

<div class="flex flex-col h-full">
	<NavBar
		onHome={openGoHomeModal}
		onClear={openClearMapModal}
		onMaps={openMapSelectionModal}
		onChartPosition={toggleChartPosition}
		onToggleSideBar={toggleSideBar}
		onSetMode={(newMode) => {
			mode = newMode;
		}}
		{mode}
	/>

	<div class="flex flex-row h-full">
		<div
			class="flex flex-grow basis-9/12"
			class:flex-row={chartbar.position === 'left'}
			class:flex-col-reverse={chartbar.position === 'bottom'}
		>
			<div
				class="flex basis-3/12 justify-center items-center"
				class:border-r-2={chartbar.position === 'left'}
				class:border-t-2={chartbar.position === 'bottom'}
			>
				<ChartBar {candidates} />
			</div>
			<div class="basis-9/12 overflow-hidden">
				<div class="flex flex-row flex-wrap justify-center relative pointer-events-none h-0 z-10">
					{#each candidates as candidate}
						<CandidateBox
							{candidate}
							onSelect={setSelectedCandidate}
							onEdit={openEditCandidateModal}
							selected={selectedCandidateId === candidate.id}
						/>
					{/each}
				</div>
				{#await imports[currentMap]() then module}
					<div bind:this={mapBind} class="overflow-hidden h-full">
						{@html module.default}
					</div>
				{/await}
			</div>
		</div>

		<SideBar open={sidebar.open} path={$page.url.pathname} />
	</div>
</div>

<ConfirmModal
	open={confirmModal.open}
	title={confirmModal.title}
	message={confirmModal.message}
	onConfirm={confirmModal.onConfirm}
	onClose={closeConfirm}
/>

<EditCandidateModal
	open={editCandidateModal.open}
	candidate={editCandidateModal.candidate}
	onConfirm={editCandidateModal.onConfirm}
	onClose={closeEditCandidateModal}
/>

<EditStateModal
	open={editStateModal.open}
	state={editStateModal.state}
	onConfirm={editStateModal.onConfirm}
	onClose={closeEditStateModal}
/>
