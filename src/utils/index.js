const moment = require('moment-timezone');

const getName = user => user.first_name || user.last_name || user.username;

const filterTodayHourly = ({ data, timezone }) => {
  console.log(timezone);
  const allHours = data.filter(({ time }) => moment.unix(time).isBetween(moment(), moment().endOf('day')));
  const everyTwoHours = allHours.filter(({ time }) =>
    Number(moment.unix(time).tz(timezone).format('H')) % 2 ? false : true
  );

  return everyTwoHours;
};

const filterTomorrowHourly = ({ data, timezone }) => {
  const allHours = data.filter(({ time }) =>
    moment.unix(time).isBetween(moment().endOf('day'), moment().add(1, 'd').endOf('day'))
  );
  const everyTwoHours = allHours.filter(({ time }) =>
    Number(moment.unix(time).tz(timezone).format('H')) % 2 ? false : true
  );

  return everyTwoHours;
};

module.exports = {
  getName,
  filterTodayHourly,
  filterTomorrowHourly,
};
