/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
import './fb';
import window from 'window';
import $ from 'jquery';
import Application from './Application';

if (window.location.origin === process.env.APP_URL) require('./ga');

$(() => new Application($(window.document)));

