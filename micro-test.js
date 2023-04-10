import buildMicro from "./libs/buildMicro.js";

const token = "";

console.time("perf");

const micro = await buildMicro("igUnameCtrl", token);

const res = await micro({
  username: "cr7",
});
console.log(res);

console.timeEnd("perf");
