<script>
  export let showCreateGameModal;
  export let onCreateNewGame;

  let dialog;
  let gameName = '';

  $: if (dialog && showCreateGameModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={() => ((gameName = ''), (showCreateGameModal = false))}
  on:click|self={() => dialog.close()}
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div>
    <h2>Create Game</h2>
    <label id="gameNameLabel"
      >Game Name:
      <input type="text" bind:value={gameName} placeholder="Enter name" />
    </label>

    <div id="buttonDiv">
      <button
        on:click={() => {
          dialog.close();
          onCreateNewGame(gameName);
        }}
        disabled={gameName == ''}>Create Game</button
      >
      <button autofocus on:click={() => dialog.close()}>Cancel</button>
    </div>
  </div>
</dialog>

<style>
  #gameNameLabel {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    margin: 1.5em 0;
  }

  #buttonDiv {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  dialog {
    max-width: 32em;
    min-width: 25em;
    border-radius: 0.2em;
    border: none;
    padding: 0;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog > div {
    padding: 1em;
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  button {
    display: block;
  }
</style>
