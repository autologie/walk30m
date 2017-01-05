/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
import './fb';
import window from 'window';
import $ from 'jquery';
import Application from './Application';

if (process.env.NODE_ENV === 'production') require('./ga');

$(() => new Application($(window.document)));

