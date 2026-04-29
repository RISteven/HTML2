document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const usuario = document.getElementById('usuario').value;
  const clave = document.getElementById('clave').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, clave })
  });

  const data = await res.json();
  if (data.success) {
    window.location.href = 'menu.html';
  } else {
    document.getElementById('mensaje').textContent = data.message;
  }
});
