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
		{ id: -1, name: 'Tossup', margins: [{ color: '#cccccc', count: 0 }]},
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
			name: '',
			value: 0,
		},
		onConfirm: () => {}
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
			onConfirm: () => {
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

	function fillState(state: HTMLElement) {
		const newCandidates = candidates;
		const selectedCandidate = newCandidates.find(c => c.id === selectedCandidateId);
		if (selectedCandidate === undefined) {
			return;
		}
		const currentCandidateID = state.getAttribute('candidate') || '-2';
		const currentCandidate = newCandidates.find(c => c.id === parseInt(currentCandidateID));
		if (currentCandidate === undefined) {
			return;
		}

		const value = parseInt(state.getAttribute('value') || '0');
		currentCandidate.margins[0].count -= value;
		selectedCandidate.margins[0].count += value;
		candidates = newCandidates;

		const stateName = state.getAttribute('name');

		if (stateName) {
			const text = mapBind.querySelector('.' + stateName + '-text');
			if (text) {
				const luma = calculateLumaHEX(selectedCandidate.margins[0].color);
				(text as HTMLElement).style.color = luma > 0.5 ? '#000000' : '#ffffff';
			}
		}

		state.setAttribute('fill', selectedCandidate.margins[0].color);
		state.setAttribute('candidate', selectedCandidate.id.toString());
	}

	function editState(state: HTMLElement) {
		const name = state.getAttribute('name');
		const value = state.getAttribute('value');
		openEditStateModal({
			name: name || '',
			value: value ? parseInt(value) : 0,
		});
	}

	$: {
		const states = mapBind?.querySelector('.state');
		states?.childNodes.forEach((node) => {
			const domNode = node as HTMLElement;
			domNode.onclick = () => {
				if (mode === 'fill') {
					fillState(domNode);
				} else if (mode === 'edit') {
					editState(domNode);
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
				zoomDoubleClickSpeed: 1,
			});
		}
	}

	function initializeMap(mapBind: HTMLDivElement) {
		const states = mapBind?.querySelector('.state');
		const candidatesCopy = candidates;
		states?.childNodes.forEach((child) => {
			const childHTML = child as HTMLElement;
			if(childHTML.setAttribute) {
				childHTML.style.transition = 'all 0.15s linear';
				childHTML.setAttribute('fill', 'grey');
				childHTML.setAttribute('stroke', 'black');
				childHTML.setAttribute('candidate', '-1');
				const candidate = candidatesCopy.find((c) => c.id === -1);
				if (candidate) {
					childHTML.setAttribute('fill', candidate.margins[0].color);
					const value = parseInt(childHTML.getAttribute('value') || '0');
					candidate.margins[0].count += value;
				}
			}
		});
		candidates = candidatesCopy;
	}

	$: { applyPanZoom(mapBind); initializeMap(mapBind); }

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
		mode={mode}
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
