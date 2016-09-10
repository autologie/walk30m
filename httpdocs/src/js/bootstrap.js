import window from 'window';
import $ from 'jQuery';
import { templateSettings } from 'lodash';
import Application from './Application';
import locale from './locale_ja';

templateSettings.interpolate = /\{\{(.+?)\}\}/g;

$(() => new Application($(window.document)));

