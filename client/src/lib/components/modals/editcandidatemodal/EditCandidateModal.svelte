<script lang="ts">
	import type Candidate from '$lib/types/Candidate';

	export let open = false;
	export let candidate: Candidate;
	export let onConfirm: (candidateId: number, name: string, colors: string[]) => void;
	export let onClose: () => void;

	let name: string;
	let colors: string[];

	$: colors = candidate.margins.map((margin) => {
		return margin.color;
	});

	$: name = candidate.name;
</script>

<input type="checkbox" class="modal-toggle" checked={open} />
<div class="modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg">{candidate.name}</h3>
		<div class="flex gap-3">
			<div class="form-control w-full max-w-xs">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">
					<span class="label-text">New Name</span>
				</label>
				<input
					value={candidate.name}
					type="text"
					class="input input-bordered w-full max-w-xs"
					on:change={(newName) => {
						name = newName.target?.value;
					}}
				/>
			</div>
			<div class="form-control w-full max-w-xs">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">
					<span class="label-text">New Colors</span>
				</label>
			{#each colors as color, index}
				<input
					type="color"
					value={color}
					on:change={(newColor) => {
						colors[index] = newColor.target?.value;
					}}
				/>
			{/each}
			</div>
		</div>
		<div class="modal-action">
			<label for="my-modal" class="btn" on:click={onClose}> Close </label>
			<label for="my-modal" class="btn" on:click={() => {
				onConfirm(candidate.id, name, colors);
			}}>
				Confirm
			</label>
		</div>
	</div>
</div>
