$(document).ready(() => {
  const socket = io.connect();
  const loginForm = $('#signin-form');
  const nicknameInput = $('#nickname');
  const errorMessage = $('#error-message');
  const messageForm = $('#message-form');
  const messanger = $('#messanger');
  const messagesList = $('#messages-list');
  const messageText = $('#message-text');
  const usersList = $('.users-list');
  let localNickname = null;

  const newMessageWrapper = (user, message, time) =>
    `<a class="list-group-item list-group-item-action pt-2 pb-2">
      <div class="d-flex w-100 justify-content-between">
        <h6 class="mb-0">${user}</h6>
        <small class="text-muted">${time}</small>
      </div>
      <p class="mb-0">${message}</p>
    </a>`;

  const updateUsers = (arr, jQueryEl) => {
    let arrString = '';
    arr.map(
      user =>
        (arrString += `<li class="d-flex align-items-center list-group-item">
        <i class="material-icons">account_circle</i>
        <p style="margin: 0; padding: 4px 0 0 4px;">${user}</p>
      </li>`)
    );
    jQueryEl.html(arrString);
  };

  const loadMessages = (messagesArr, jQueryEl) => {
    let arrString = '';
    messagesArr.map(msg => (arrString += newMessageWrapper(msg.nickname, msg.message, msg.time)));
    jQueryEl.html(arrString);
  };

  loginForm.submit(e => {
    e.preventDefault();

    socket.emit('login', nicknameInput.val());
  });

  messageForm.submit(e => {
    e.preventDefault();

    if (messageText.val().length) {
      socket.emit('sendMessage', messageText.val());
      messageText.val('');
    }
  });

  socket.on('login', data => {
    if (data.status === 'OK') {
      localNickname = data.nickname;

      loadMessages(data.messages, messagesList);

      loginForm.remove();
      messanger.removeClass('d-none');
      messageText.focus();
    } else {
      nicknameInput.removeClass('mb-2');
      nicknameInput.addClass('mb-1');

      errorMessage.removeClass('d-none');
      errorMessage.addClass('d-block');
      errorMessage.text(data.status);
    }
  });

  socket.on('users', data => updateUsers(data, usersList));

  socket.on('newMessage', data => {
    messagesList.append(newMessageWrapper(data.nickname, data.message, data.time));
    const messagesWrp = messagesList[0];
    const scrollFromBottom = messagesWrp.scrollHeight - messagesWrp.scrollTop - messagesWrp.clientHeight;

    if (scrollFromBottom < 55 || data.nickname === localNickname) {
      messagesWrp.scrollTop = messagesWrp.scrollHeight;
    }
  });
});
