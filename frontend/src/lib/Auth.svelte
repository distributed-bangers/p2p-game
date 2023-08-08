<script lang="ts">
  import userState from '../../state/user';
  import { signUp, signIn } from '../services/userService';

  const signInText = 'sign in';
  const signUpText = 'sign up';
  $: signInUC = signInText.toUpperCase();
  $: signUpUC = signUpText.toUpperCase();

  let username = null;
  let password = null;
  let passwordRepeat = null;

  let login = true;

  const onSignUp = async () => {
    try {
      const response = await signUp({ username, password }, passwordRepeat);

      $userState.userid = response.userid;
      $userState.username = username;
      $userState.authenticated = true;
      $userState.jwt = response.token;

      return;
    } catch (error) {
      alert(error.message);
    }
  };
  const onSignIn = async () => {
    try {
      const response = await signIn({ username, password });
      console.log(response);
      $userState.userid = response.userid;
      $userState.username = username;
      $userState.authenticated = true;
      $userState.jwt = response.token;
    } catch (error) {
      alert(error.message);
    }
  };
</script>

<div id="rootDiv">
  <h1>Welcome to Racoosh!</h1>

  <div class="logincard">
    <h3>Please {login ? signInText : signUpText}.</h3>
    <h3>
      Want to <a
        href="#"
        class="atext"
        on:click={() => {
          login = !login;
        }}
      >
        {login ? signUpText : signInText}</a
      > instead?
    </h3>
    <input
      class="input"
      type="text"
      placeholder="Username"
      bind:value={username}
    />
    <input
      class="input"
      type="password"
      placeholder="Password"
      bind:value={password}
    />
    {#if !login}
      <input
        class="input"
        type="password"
        placeholder="Repeat password"
        bind:value={passwordRepeat}
      />
    {/if}
    <button class="login" on:click={login ? onSignIn : onSignUp}
      >{login ? signInUC : signUpUC}</button
    >
  </div>
</div>

<style>
  #rootDiv {
    width: 35em;
  }

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
    width: 70%;
  }

  .atext {
    color: darkblue;
    text-decoration: underline;
  }
</style>
