const form = document.querySelector('#short-link-form');
const formInput = document.querySelector('#short-link');

form.addEventListener('submit', e => {
  e.preventDefault();

  const checkLink = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;
  const errorElement = document.querySelector('.error');
  const data = { link: formInput.value };

  if (!checkLink.test(formInput.value)) return (errorElement.innerText = 'Invalid link');

  errorElement.innerText = '';

  fetch('/short', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(({ short, source }) => {
      const list = document.querySelector('#list > .header');
      const listRow = document.createElement('div');
      const shortLinkCell = document.createElement('div');
      const sourceLinkCell = document.createElement('div');
      const shortLink = document.createElement('a');
      const sourceLink = document.createElement('a');

      listRow.classList.add('row');
      shortLinkCell.classList.add('cell');
      sourceLinkCell.classList.add('cell');
      shortLink.innerText = short;
      sourceLink.innerText = source;
      shortLink.setAttribute('href', short);
      sourceLink.setAttribute('href', source);
      shortLink.setAttribute('target', '_blank');
      sourceLink.setAttribute('target', '_blank');
      shortLink.setAttribute('rel', 'norefferer noopener');
      sourceLink.setAttribute('rel', 'norefferer noopener');
      shortLinkCell.setAttribute('data-title', 'Short link');
      sourceLinkCell.setAttribute('data-title', 'Source link');
      shortLinkCell.appendChild(shortLink);
      sourceLinkCell.appendChild(sourceLink);
      listRow.append(shortLinkCell, sourceLinkCell);
      list.after(listRow);
    })
    .catch(err => console.error(err));
});
