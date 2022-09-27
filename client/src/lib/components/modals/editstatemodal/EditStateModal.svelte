<script lang="ts">
	import type State from "$lib/types/State";

  export let open: boolean;
  export let state: State;
  export let onConfirm: () => void;
  export let onClose: () => void;
</script>

<input type="checkbox" class="modal-toggle" checked={open} />
<label class="modal cursor-pointer" on:click={onClose}>
	<label class="modal-box relative">
		<h3 class="font-bold text-lg">Edit State {state.name} {state.value}</h3>
		<div class="modal-action">
			<label for="my-modal" class="btn" on:click={onClose}> Close </label>
			<label for="my-modal" class="btn" on:click={onConfirm}> Confirm </label>
		</div>
	</label>
</label>
