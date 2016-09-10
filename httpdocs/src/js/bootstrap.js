import window from 'window';
import $ from 'jQuery';
import Application from './Application';
import locale from './locale_ja';

$(() => new Application($(window.document)));

