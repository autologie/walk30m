/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
import './ga';
import './fb';
import window from 'window';
import $ from 'jQuery';
import Application from './Application';

$(() => new Application($(window.document)));

