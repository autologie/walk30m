import $ from "jquery";
import "./fb";
import Application from "./Application";

let a = 3;

if (window.location.origin === process.env.APP_URL) require("./ga");

$(() => new Application($(window.document)));
