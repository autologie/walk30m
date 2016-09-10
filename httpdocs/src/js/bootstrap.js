/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
import window from 'window';
import $ from 'jquery';
import Application from './Application';
import './locale_ja';

$(() => new Application($(window.document)));

