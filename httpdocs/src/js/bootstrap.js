import $ from "jquery";
import "./fb";
import Application from "./Application";

if (window.location.origin === process.env.APP_URL) require("./ga");

$(() => new Application($(window.document)));
