const schema = {
  TABLE_NAME: process && process.env && process.env["TABLE_NAME"],
  SEPARATOR: "#",
  // key attribute names
  PARTITION_KEY: "PK",
  SORT_KEY: "SK",
  // item types
  ROOM: "room",
  // properties
  JS_DATE: "timestamp",
  ROOM_NAME: "room_name",
  TASKMASTER_NAME: "taskmaster_name",
  GAME_LOCATION: "game_location",
  TIME_LIMIT: "time_limit"
};

module.exports = schema;
