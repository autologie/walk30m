import window from "window";
import $ from "jQuery";
import _ from "lodash";
import Application from "./Application";
import locale from "./locale_ja";

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

$(() => new Application($(window.document)));

