<script lang="ts">
  import userState from '../../state/user';

  const signIn = 'sign in';
  const signUp = 'sign up';
  $: signInUC = signIn.toUpperCase();
  $: signUpUC = signUp.toUpperCase();

  let login = true;

  const onAuthenticate = () => {
    $userState.authenticated = true;
  };
</script>

<div class="main">
  <h1>Welcome to Racoosh!</h1>

  <div class="logincard">
    <h3>Please {login ? signIn : signUp}.</h3>
    <h3>
      Want to <a
        href="#"
        class="atext"
        on:click={() => {
          login = !login;
        }}
      >
        {login ? signUp : signIn}</a
      > instead?
    </h3>
    <input class="input" type="text" placeholder="Username" />
    <input class="input" type="password" placeholder="Password" />
    {#if !login}
      <input class="input" type="password" placeholder="Repeat password" />
    {/if}
    <button class="login" on:click={onAuthenticate}
      >{login ? signInUC : signUpUC}</button
    >
  </div>
</div>

<style>
  .logincard {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: darkgrey;
    margin-top: 5em;
    padding: 2em;
    box-shadow:
      rgba(6, 24, 44, 0.4) 0px 0px 0px 2px,
      rgba(6, 24, 44, 0.65) 0px 4px 6px -1px,
      rgba(255, 255, 255, 0.08) 0px 1px 0px inset;

    /* place-items: center; */
  }

  .input {
    margin: 1em;
    height: 3em;
    width: 50%;
  }

  .atext {
    color: darkblue;
    text-decoration: underline;
  }
</style>
