<script lang="ts">
	import type Candidate from '$lib/types/Candidate';

	export let open = false;
	export let candidate: Candidate;
	export let onConfirm: (candidateId: number, colors: string[]) => void;
	export let onClose: () => void;

	let colors: string[];

	$: colors = candidate.margins.map((margin) => {
		return margin.color;
	});
</script>

<input type="checkbox" class="modal-toggle" checked={open} />
<div class="modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg">{candidate.name}</h3>
		<div class="flex gap-3">
			{#each colors as color, index}
				<input
					type="color"
					value={color}
					on:change={(newColor) => {
						colors[index] = newColor.target.value;
					}}
				/>
			{/each}
		</div>
		<div class="modal-action">
			<label for="my-modal" class="btn" on:click={onClose}> Close </label>
			<label for="my-modal" class="btn" on:click={() => onConfirm(candidate.id, colors)}>
				Confirm
			</label>
		</div>
	</div>
</div>
