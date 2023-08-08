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


</script>
<div class="container" class:panelActive id="container">
  <div class="form-container sign-up-container">
    <form>
      <h1>Create Account</h1>
      <input type="text" placeholder="Username" bind:value={$signUpForm.username} on:change={signUpHandleChange}/>
      {#if $signUpErrors.username}
        <span class="error">{$signUpErrors.username}</span>
      {/if}
      <input type="password" placeholder="Password" bind:value={$signUpForm.password} on:change={signUpHandleChange}/>
      {#if $signUpErrors.password}
        <span class="error">{$signUpErrors.password}</span>
      {/if}
      <input type="password" placeholder="Repeat Password" bind:value={$signUpForm.passwordRepeat} on:change={signUpHandleChange}/>
      {#if $signUpErrors.passwordRepeat}
        <span class="error">{$signUpErrors.passwordRepeat}</span>
      {/if}
      <button on:click={signUpHandleSubmit}>Sign Up</button>
    </form>
  </div>
  <div class="form-container sign-in-container">
    <form>
      <h1>Sign in</h1>
      <input type="text" placeholder="Username" bind:value={$signInForm.username} on:change={signInHandleChange}/>
      {#if $signInErrors.username}
        <span class="error">{$signUpErrors.username}</span>
      {/if}
      <input type="password" placeholder="Password" bind:value={$signInForm.password} on:change={signInHandleChange}/>
      {#if $signInErrors.password}
        <span class="error">{$signUpErrors.password}</span>
      {/if}
      <i class='farEye' />
      <a href="/">Forgot your password?</a>
      <button on:click={signInHandleSubmit}>Sign In</button>
    </form>
  </div>
  <div class="overlay-container">
    <div class="overlay">
      <div class="overlay-panel overlay-left">
        <h1>Welcome Back!</h1>
        <p>Step Back Into Action And Resume Your Adventure</p>
        <button class="ghost"  id="signIn" on:click={togglePanelActive}>Sign In</button>
      </div>
      <div class="overlay-panel overlay-right">
        <h1>Let's Racoosh!</h1>
        <p>Forge Your Gamer Identity And Level Up With Us.</p>
        <button class="ghost" id="signUp" on:click={togglePanelActive}>Sign Up</button>
      </div>
    </div>
  </div>
</div>


<style>
  @import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');

  .container {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 14px 28px rgba(0,0,0,0.25),
    0 10px 10px rgba(0,0,0,0.22);
    position: relative;
    overflow: hidden;
    width: 768px;
    max-width: 100%;
    min-height: 480px;
  }

  .form-container {
    position: absolute;
    top: 0;
    height: 100%;
    transition: all 0.6s ease-in-out;
  }

  .sign-in-container {
    left: 0;
    width: 50%;
    z-index: 2;
  }

  .sign-up-container {
    left: 0;
    width: 50%;
    opacity: 0;
    z-index: 1;
  }


  @keyframes show {
    0%, 49.99% {
      opacity: 0;
      z-index: 1;
    }

    50%, 100% {
      opacity: 1;
      z-index: 5;
    }
  }

  .overlay-container {
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: transform 0.6s ease-in-out;
    z-index: 100;
  }


  .overlay {
    background: #211b36;
    background: -webkit-linear-gradient(to right, #313038, #211b36);
    background: linear-gradient(to right, #313038, #211b36);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 0 0;
    color: #FFFFFF;
    position: relative;
    left: -100%;
    height: 100%;
    width: 200%;
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
  }


  .overlay-panel {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 40px;
    text-align: center;
    top: 0;
    height: 100%;
    width: 50%;
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
  }

  .overlay-left {
    transform: translateX(-20%);
  }


  .overlay-right {
    right: 0;
    transform: translateX(0);
  }

  .container.panelActive .sign-in-container {
    transform: translateX(100%);
  }
  .container.panelActive .overlay-container{
    transform: translateX(-100%);
  }
  .container.panelActive .sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
    animation: show 0.6s;
  }

  .container.panelActive .overlay-right {
    transform: translateX(20%);
  }
  .container.panelActive .overlay {
    transform: translateX(50%);
  }
  .container.panelActive .overlay-left {
    transform: translateX(0);
  }

</style>
