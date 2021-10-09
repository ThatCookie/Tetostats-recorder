const { TetraChannel } = require("tetr.js");
const fs = require("fs");
const path = require("path");

const config = require("../config.json");

/**
 *
 * @param {object[]} data
 */
function format_data(data) {
  var newData = [];
  for (var i in data) {
    o = {};
    config.data.savedStats.forEach((stat) => {
      if (data[i].hasOwnProperty("league")) {
        if (data[i].league.hasOwnProperty(stat)) {
          o[stat] = data[i].league[stat];
        } else {
          if (data[i].hasOwnProperty(stat)) {
            o[stat] = data[i][stat];
          }
        }
      }
    });
    newData.push(o);
  }
  if (config.data.removeLocalDuplicates) {
    newData = newData.map(i => JSON.stringify(i))
    newData = [...new Set(newData)];
    newData = newData.map(i => JSON.parse(i))  
  }
  console.log(newData)
}

async function get_data(list, collected) {
  if (list.length == 0) {
    console.log(1);
    format_data(collected);
    return true; //TODO: does not return properly
  } else {
    let data;
    let options = list[0][2];
    Object.keys(options).forEach((i) => {
      if (options[i] == undefined) {
        delete options[i];
      }
    });
    if (list[0][0] == "tl") {
      data = await TetraChannel.leaderboards.tetra_league({
        country: list[0][1]?.toUpperCase() || "",
        ...options,
      });
    } else if (list[0][0] == "tlf") {
      data = await TetraChannel.leaderboards.tetra_league_full(
        list[0][1]?.toUpperCase() || ""
      );
    } else if (list[0][0] == "xp") {
      data = await TetraChannel.leaderboards.xp({
        country: list[0][1]?.toUpperCase() || "",
        ...options,
      });
    } else {
      data = await TetraChannel.misc.stream(list[0][0]);
    }
    setTimeout(
      () => get_data(list.slice(1), [...(collected || []), ...data]),
      1030
    );
  }
}

function format_config() {
  let request_list = [];
  config.data.leaderboards.forEach((id) => {
    let lb, country, limit, before, after;
    lb = id.split(/[#&]/gi)[0];
    if (id.indexOf("#") + 1) {
      country = id.split("#")[1].split(/[#&]/gi)[0];
    }
    if (id.indexOf("&l") + 1) {
      limit = parseInt(id.split("&l")[1].split(/[#&]/gi)[0]);
    }
    if (id.indexOf("&b") + 1) {
      before = parseInt(id.split("&b")[1].split(/[#&]/gi)[0]);
    }
    if (id.indexOf("&a") + 1) {
      after = parseInt(id.split("&a")[1].split(/[#&]/gi)[0]);
    }
    request_list.push([lb, country, { limit, before, after }]);
  });
  return request_list;
}

async function main() {
  get_data(format_config());
}
main();
