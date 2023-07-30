let playername = '';

function onEnterPlayerName() {
  const input = document.getElementById('playernameinput');
  playername = input.value;
  const logindiv = document.getElementById('logindiv');
  if (playername != '') {
    logindiv.style.display = 'none';
    console.log(`you created a player with the name of: ${playername}`);
  }
}

function onEnterGameName() {}
