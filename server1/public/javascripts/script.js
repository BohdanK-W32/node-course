fetch('http://localhost:3031/cors')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
