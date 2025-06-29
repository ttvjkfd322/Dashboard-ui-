const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const usernameSpan = document.getElementById('username');
const avatarImg = document.getElementById('avatar');
const userInfo = document.getElementById('user-info');
const statusText = document.getElementById('status-text');
const logsOutput = document.getElementById('logs-output');

loginBtn.onclick = () => {
  window.location.href = '/login';
};

logoutBtn.onclick = async () => {
  await fetch('/logout');
  window.location.reload();
};

document.getElementById('ping-btn').onclick = async () => {
  const res = await fetch('/api/ping');
  const data = await res.json();
  alert(`Bot replied: ${data.pong}`);
};

document.getElementById('say-btn').onclick = async () => {
  const msg = document.getElementById('say-input').value;
  await fetch('/api/say', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg })
  });
  alert('Sent!');
};

document.getElementById('save-settings').onclick = async () => {
  const prefix = document.getElementById('prefix-input').value;
  await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix })
  });
  alert('Settings saved!');
};

document.getElementById('restart-bot').onclick = async () => {
  await fetch('/api/restart');
  alert('Restart command sent.');
};

async function load() {
  const res = await fetch('/api/me');
  if (res.ok) {
    const user = await res.json();
    usernameSpan.textContent = user.username;
    avatarImg.src = user.avatar;
    userInfo.style.display = 'block';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  }

  const statusRes = await fetch('/api/status');
  const statusData = await statusRes.json();
  statusText.textContent = statusData.status;

  const logsRes = await fetch('/api/logs');
  const logsData = await logsRes.json();
  logsOutput.textContent = logsData.logs.join('\n');
}

load();